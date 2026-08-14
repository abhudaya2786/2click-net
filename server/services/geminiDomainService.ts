/**
 * Domain-aware Gemini MoM engine for field workforce visits.
 * Complements existing server/ai/GeminiAIProvider — does not replace it.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { enterpriseConfig, type BusinessDomain } from '../config/env.ts';
import { getAIProvider } from '../ai/index.ts';
import type { MinutesOutput } from '../ai/AIProvider.ts';

export interface DomainMomResult extends MinutesOutput {
  domain: BusinessDomain;
  domainConfidence: number;
  executiveSummaryLines: string[];
  resolvedDeadlines: Array<{ task: string; original: string; resolvedIso: string | null }>;
}

function resolveRelativeHindiTime(text: string, now = new Date()): string | null {
  const lower = text.toLowerCase();
  // kal subah 11 baje / aaj shaam 5 / etc.
  const m = lower.match(/\b(kal|aaj|parso)\b.*?\b(\d{1,2})(?::(\d{2}))?\s*(baje|am|pm)?/i);
  if (!m) return null;
  const dayWord = m[1].toLowerCase();
  let hour = Number(m[2]);
  const minute = m[3] ? Number(m[3]) : 0;
  const d = new Date(now);
  if (dayWord === 'kal') d.setDate(d.getDate() + 1);
  if (dayWord === 'parso') d.setDate(d.getDate() + 2);
  if (/subah|morning/i.test(lower) && hour <= 12) {
    /* keep AM */
  } else if (/shaam|evening|raat/i.test(lower) && hour < 12) {
    hour += 12;
  }
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export async function classifyDomain(transcript: string): Promise<{ domain: BusinessDomain; confidence: number }> {
  const soft = transcript.toLowerCase();
  const scores: Record<BusinessDomain, number> = {
    Software: 0,
    Construction: 0,
    Marketing: 0,
    Sales: 0,
    General: 0.1,
  };
  const bags: Record<Exclude<BusinessDomain, 'General'>, string[]> = {
    Software: ['api', 'deploy', 'sprint', 'bug', 'repo', 'release', 'backend', 'frontend', 'devops', 'jira'],
    Construction: ['site', 'cement', 'slab', 'contractor', 'drawing', 'rcc', 'labour', 'material', 'boq', 'foundation'],
    Marketing: ['campaign', 'brand', 'seo', 'lead gen', 'creative', 'funnel', 'ads', 'content', 'social'],
    Sales: ['quota', 'pipeline', 'deal', 'proposal', 'pricing', 'client visit', 'closure', 'crm', 'invoice'],
  };
  (Object.keys(bags) as Array<Exclude<BusinessDomain, 'General'>>).forEach((d) => {
    bags[d].forEach((w) => {
      if (soft.includes(w)) scores[d] += 1;
    });
  });
  const ranked = (Object.entries(scores) as Array<[BusinessDomain, number]>).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const total = ranked.reduce((s, [, v]) => s + v, 0) || 1;
  return { domain: top[0], confidence: Math.min(0.95, top[1] / total) };
}

export async function generateDomainAwareMom(opts: {
  transcript: string;
  meetingTitle?: string;
  meetingDate?: string;
  participants?: string[];
  languageHint?: string;
  geo?: { lat?: number; lng?: number; siteName?: string };
}): Promise<DomainMomResult> {
  const domainInfo = await classifyDomain(opts.transcript);
  const geoNote = opts.geo?.siteName
    ? `Field site: ${opts.geo.siteName} (${opts.geo.lat ?? '?'}, ${opts.geo.lng ?? '?'})`
    : '';

  // Prefer live Gemini structured path when key present; else fall back to existing provider/demo.
  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': '2click-field-workforce' } },
    });

    const systemPrompt = `You are a domain-aware enterprise field MoM engine for ${domainInfo.domain} operations in India.
Return JSON only. Rules:
- Discard personal chatter; keep business facts only.
- Resolve relative Hindi/Hinglish times like "kal subah 11 baje" into ISO-8601 when possible (assume Asia/Kolkata).
- Never invent deadlines or assignees.
- Domain context: ${domainInfo.domain}. ${geoNote}`;

    const response = await ai.models.generateContent({
      model: enterpriseConfig.geminiModel,
      contents: `Title: ${opts.meetingTitle || 'Field Visit'}
Date: ${opts.meetingDate || new Date().toISOString().slice(0, 10)}
Participants: ${(opts.participants || []).join(', ') || 'Not specified'}
Language: ${opts.languageHint || 'auto'}

TRANSCRIPT:
"""
${opts.transcript}
"""`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            executive_summary_lines: { type: Type.ARRAY, items: { type: Type.STRING } },
            discussion_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            action_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  responsible_person: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  deadline_iso: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['task', 'responsible_person', 'deadline', 'priority', 'status'],
              },
            },
            pending_issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            next_meeting: { type: Type.STRING },
            domain: { type: Type.STRING },
          },
          required: ['summary', 'discussion_points', 'decisions', 'action_items', 'pending_issues', 'next_meeting'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const action_items = (parsed.action_items || []).map((a: any) => ({
      task: String(a.task || 'Unspecified task'),
      responsible_person: String(a.responsible_person || 'Not specified'),
      deadline: String(a.deadline || 'Not specified'),
      priority: (['High', 'Medium', 'Low', 'Critical'].includes(a.priority) ? a.priority : 'Medium') as
        | 'High'
        | 'Medium'
        | 'Low'
        | 'Critical',
      status: (['Pending', 'In Progress', 'Completed'].includes(a.status) ? a.status : 'Pending') as
        | 'Pending'
        | 'In Progress'
        | 'Completed',
    }));

    const resolvedDeadlines = action_items.map((a: any, i: number) => {
      const original = parsed.action_items?.[i]?.deadline || a.deadline;
      const fromModel = parsed.action_items?.[i]?.deadline_iso || null;
      const heuristic = resolveRelativeHindiTime(`${a.task} ${original}`);
      return {
        task: a.task,
        original: String(original),
        resolvedIso: fromModel || heuristic,
      };
    });

    const lines: string[] = Array.isArray(parsed.executive_summary_lines)
      ? parsed.executive_summary_lines.map(String).slice(0, 5)
      : String(parsed.summary || '')
          .split(/[.!?]\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 5);

    return {
      success: true,
      provider: 'gemini',
      model_used: enterpriseConfig.geminiModel,
      summary: String(parsed.summary || ''),
      discussion_points: parsed.discussion_points || [],
      decisions: parsed.decisions || [],
      action_items,
      pending_issues: parsed.pending_issues || [],
      next_meeting: parsed.next_meeting || 'Not specified',
      domain: (parsed.domain as BusinessDomain) || domainInfo.domain,
      domainConfidence: domainInfo.confidence,
      executiveSummaryLines: lines,
      resolvedDeadlines,
    };
  }

  // Fallback: existing AI provider (OpenAI / Gemini)
  const provider = getAIProvider(process.env.AI_PROVIDER);
  const minutes = await provider.generateMinutes({
    transcript: opts.transcript,
    meetingTitle: opts.meetingTitle,
    meetingDate: opts.meetingDate,
    participants: opts.participants,
    additionalContext: `Domain hint: ${domainInfo.domain}. ${geoNote}`,
    languageHint: opts.languageHint,
  });

  return {
    ...minutes,
    domain: domainInfo.domain,
    domainConfidence: domainInfo.confidence,
    executiveSummaryLines: String(minutes.summary || '')
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5),
    resolvedDeadlines: (minutes.action_items || []).map((a) => ({
      task: a.task,
      original: a.deadline,
      resolvedIso: resolveRelativeHindiTime(`${a.task} ${a.deadline}`),
    })),
  };
}
