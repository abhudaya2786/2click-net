import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';
import { getAIProvider, hasAiApiKey } from './server/ai/index.ts';
import { getSpeechProvider } from './server/speech/index.ts';
import { billingManager, SAAS_PLANS } from './server/billing/index.ts';
import { registerEnterpriseRoutes } from './server/routes/enterpriseRoutes.ts';
import { preprocessTranscriptForEnterprise } from './server/services/piiFilterService.ts';
import { stripAudioPayload } from './server/services/audioRetentionService.ts';
import { enterpriseConfig } from './server/config/env.ts';
import { registerAuthRoutes } from './server/auth/index.ts';
import { registerGeoRoutes } from './server/geo/index.ts';
import { registerCompanyOrgRoutes } from './server/org/index.ts';
import { redactCommandTriggers } from './src/utils/wakeWordRedaction.ts';
import {
  createRateLimiter,
  requireAuthWhenLiveAi,
  sanitizePublicError,
} from './server/security/middleware.ts';

const rootDir = process.cwd();
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

/** In-memory Instant Save store for command sessions (user-scoped). */
const instantConversations: any[] = [];

const aiRateLimit = createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: 'ai' });
const generalRateLimit = createRateLimiter({ windowMs: 60_000, max: 120, keyPrefix: 'api' });
const requireLiveAiAuth = requireAuthWhenLiveAi();

function requireLiveAi() {
  if (!hasAiApiKey()) {
    const err = new Error('Set GEMINI_API_KEY or OPENAI_API_KEY in .env / .env.local');
    (err as any).status = 503;
    throw err;
  }
}

function geminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: { headers: { 'User-Agent': '2click-voice-mom' } },
  });
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function minutesToMeeting(minutes: any, opts: {
  transcriptText?: string;
  segments?: any[];
  context?: any;
  audioUrl?: string;
  languageDetected?: string;
}) {
  const ctx = opts.context || {};
  const participants =
    typeof ctx.participants === 'string'
      ? ctx.participants.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(ctx.participants)
        ? ctx.participants
        : [];

  const actionItems = (minutes.action_items || []).map((a: any, i: number) => ({
    id: uid(`act-${i}`),
    task: a.task,
    owner: a.responsible_person || 'Not specified',
    deadline: a.deadline || 'Not specified',
    priority: ['High', 'Medium', 'Low'].includes(a.priority) ? a.priority : 'Medium',
    status: ['Pending', 'In Progress', 'Completed'].includes(a.status) ? a.status : 'Pending',
  }));

  const discussion = minutes.discussion_points || [];
  const keyTopics = discussion.map((point: string) => ({
    topic: point.slice(0, 80) || 'Discussion',
    summary: point,
    keyPoints: [point],
    speakersInvolved: participants.slice(0, 2),
  }));

  const transcriptSegments =
    opts.segments?.map((s: any) => ({
      speaker: s.speaker || 'Speaker',
      text: s.text || '',
      timestamp: s.start_time || s.start || undefined,
    })) ||
    (opts.transcriptText
      ? opts.transcriptText
          .split(/\n+/)
          .filter(Boolean)
          .map((line, i) => {
            const m = line.match(/^([^:]+):\s*(.*)$/);
            return {
              speaker: m?.[1]?.trim() || `Speaker ${(i % 2) + 1}`,
              text: m?.[2]?.trim() || line,
            };
          })
      : []);

  return {
    id: uid('mtg'),
    title: ctx.title || 'Voice Meeting MoM',
    createdAt: new Date().toISOString(),
    meetingDate: ctx.meetingDate || new Date().toISOString().slice(0, 10),
    duration: ctx.duration || undefined,
    meetingType: ctx.meetingType || 'General',
    languageDetected: opts.languageDetected || 'auto',
    participants: participants.length ? participants : ['Not specified'],
    executiveSummary: minutes.summary || '',
    sentiment: 'Neutral',
    keyTopics,
    decisions: minutes.decisions || [],
    actionItems,
    risksAndBlockers: minutes.pending_issues || [],
    openQuestions: [],
    transcript: transcriptSegments,
    audioUrl: opts.audioUrl,
    nextMeeting: minutes.next_meeting || 'Not specified',
    provider: minutes.provider,
    model_used: minutes.model_used,
  };
}

function createApp() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // CORS — needed when Hostinger/APK UI calls a different API origin (Vercel).
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
      );
    }
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use('/api', generalRateLimit);

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      app: '2click-voice-mom',
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      demoMode: !hasAiApiKey(),
      auth: true,
      /** File auth on Vercel uses /tmp (not multi-instance durable). */
      authDurable: !process.env.VERCEL,
      enterprise: true,
      rateLimit: true,
      vercel: Boolean(process.env.VERCEL),
    });
  });

  // Auth: User ID + password signup / signin
  registerAuthRoutes(app);

  // Reverse geocode (OpenStreetMap Nominatim proxy)
  registerGeoRoutes(app);

  // Enterprise field-workforce modules (additive — does not replace MoM routes)
  registerEnterpriseRoutes(app);

  // Real-estate marketing: work-talk → owner / report desk
  registerCompanyOrgRoutes(app);

  // Core: generate MoM from audio and/or transcript text
  app.post('/api/generate-mom', aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { audioBase64, mimeType, transcriptText, context } = req.body || {};
      let transcript = typeof transcriptText === 'string' ? transcriptText.trim() : '';
      let segments: any[] = [];
      let languageDetected = context?.language || 'auto';

      if (!transcript && audioBase64) {
        if (!hasAiApiKey()) {
          return res.status(503).json({
            error:
              'Audio transcription requires GEMINI_API_KEY or OPENAI_API_KEY. Paste a transcript text, or set a key in .env.local.',
            demoMode: true,
          });
        }
        const speech = getSpeechProvider(process.env.AI_PROVIDER);
        const speechResult = await speech.transcribe({
          audioBase64,
          mimeType: mimeType || 'audio/webm',
          language: languageDetected,
          meetingId: uid('speech'),
          speakerHint: typeof context?.participants === 'string'
            ? context.participants.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
        });
        transcript = speechResult.fullTranscript || '';
        segments = speechResult.segments || [];
        languageDetected = speechResult.detectedLanguage || languageDetected;
      }

      // Strip voice command triggers from transcript before MoM generation
      transcript = redactCommandTriggers(transcript);

      if (!transcript || transcript.length < 10) {
        return res.status(400).json({ error: 'Provide audioBase64 or transcriptText with enough content.' });
      }

      // Privacy layer (non-destructive add): redact PII + discard small-talk before MoM
      const privacy = preprocessTranscriptForEnterprise(transcript, {
        redactPii: enterpriseConfig.piiRedactionEnabled,
        discardChatter: enterpriseConfig.discardSmallTalk,
      });
      if (privacy.cleanedText.length >= 8) {
        transcript = privacy.cleanedText;
      }

      const ai = getAIProvider(process.env.AI_PROVIDER);
      const participants =
        typeof context?.participants === 'string'
          ? context.participants.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

      const minutes = await ai.generateMinutes({
        transcript,
        meetingTitle: context?.title || 'Voice Meeting',
        meetingDate: context?.meetingDate || new Date().toISOString().slice(0, 10),
        participants,
        additionalContext: context?.additionalNotes || context?.meetingType || '',
        languageHint: languageDetected,
      });

      // Redact any residual trigger words from model output
      if (minutes.summary) minutes.summary = redactCommandTriggers(minutes.summary);
      if (Array.isArray(minutes.discussion_points)) {
        minutes.discussion_points = minutes.discussion_points.map((p: string) =>
          redactCommandTriggers(String(p)),
        );
      }
      if (Array.isArray(minutes.decisions)) {
        minutes.decisions = minutes.decisions.map((d: string) => redactCommandTriggers(String(d)));
      }

      const meeting = minutesToMeeting(minutes, {
        transcriptText: transcript,
        segments,
        context,
        audioUrl: enterpriseConfig.zeroAudioRetention ? undefined : audioBase64 || undefined,
        languageDetected,
      });

      res.json(
        stripAudioPayload({
          success: true,
          meeting,
          minutes,
          privacy: {
            redactions: privacy.redactions,
            discardedLines: privacy.discardedLines,
            retainedLines: privacy.retainedLines,
          },
        }),
      );
    } catch (e: any) {
      console.error('[generate-mom]', e);
      res.status(e.status || 500).json({ error: e.message || 'Failed to generate MoM' });
    }
  });

  /** Instant Save for command-based voice sessions (user database). */
  app.post('/api/v1/conversations', (req, res) => {
    try {
      const body = req.body || {};
      const userId = body.user_id || body.userId;
      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }
      let rawText = typeof body.raw_text === 'string' ? body.raw_text : '';
      rawText = redactCommandTriggers(rawText);
      if (!rawText && !body.audio_base64) {
        return res.status(400).json({ error: 'raw_text or audio_base64 required' });
      }
      const summary = redactCommandTriggers(
        body.summary || rawText.slice(0, 240) || 'Voice command session note',
      );
      const row = {
        id: uid('conv'),
        conversation_id: undefined as string | undefined,
        user_id: String(userId),
        type: body.type || 'voice_note',
        contact_name: body.contact_name || 'Command Session',
        raw_transcript: rawText,
        summary,
        detected_dialect: body.detected_dialect || 'auto',
        detected_intent: redactCommandTriggers(body.detected_intent || summary),
        pure_hindi: redactCommandTriggers(body.pure_hindi || rawText),
        pure_english: redactCommandTriggers(body.pure_english || rawText),
        duration_seconds: body.duration_seconds || 0,
        source: body.source || 'command_session',
        created_at: new Date().toISOString(),
        persistence: 'memory',
      };
      row.conversation_id = row.id;
      instantConversations.unshift(row);
      if (instantConversations.length > 500) instantConversations.length = 500;
      res.status(201).json({
        success: true,
        conversation_id: row.id,
        user_id: row.user_id,
        type: row.type,
        raw_transcript: row.raw_transcript,
        summary: row.summary,
        detected_dialect: row.detected_dialect,
        detected_intent: row.detected_intent,
        pure_hindi: row.pure_hindi,
        pure_english: row.pure_english,
        persistence: 'memory',
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Instant Save failed' });
    }
  });

  app.get('/api/v1/conversations', (req, res) => {
    const userId = String(req.query.user_id || '');
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    const q = String(req.query.q || '').toLowerCase();
    let rows = instantConversations.filter((c) => c.user_id === userId);
    if (q) {
      rows = rows.filter(
        (c) =>
          String(c.raw_transcript || '').toLowerCase().includes(q) ||
          String(c.summary || '').toLowerCase().includes(q),
      );
    }
    res.json({
      success: true,
      user_id: userId,
      count: rows.length,
      persistence: 'memory',
      conversations: rows,
    });
  });

  app.post('/api/transcribe', aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      requireLiveAi();
      const speech = getSpeechProvider(req.body?.provider || process.env.AI_PROVIDER);
      const result = await speech.transcribe({
        audioBase64: req.body.audioBase64,
        mimeType: req.body.mimeType || 'audio/webm',
        language: req.body.language || 'auto',
        meetingId: req.body.meetingId || uid('mtg'),
        speakerHint: req.body.speakerHint || [],
      });
      const segments = (result.segments || []).map((s: any, i: number) => ({
        id: `seg-${req.body.meetingId || 'x'}-${i}`,
        meeting_id: req.body.meetingId || 'unknown',
        start_time: s.start_time,
        end_time: s.end_time,
        speaker: s.speaker,
        text: s.text,
        language: s.language,
        created_at: new Date().toISOString(),
      }));
      res.json({
        success: true,
        provider: result.provider || speech.name,
        detectedLanguage: result.detectedLanguage,
        fullTranscript: result.fullTranscript,
        segments,
        modelUsed: result.modelUsed,
      });
    } catch (e: any) {
      console.error('[transcribe]', e);
      res.status(e.status || 500).json({ error: e.message || 'Transcription failed' });
    }
  });

  app.post('/api/minutes/generate', aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const rawTranscript =
        req.body?.transcript ?? req.body?.transcriptText ?? req.body?.text ?? '';
      if (!rawTranscript || String(rawTranscript).trim().length < 10) {
        return res.status(400).json({
          error: 'transcript is required (min 10 characters).',
        });
      }
      let transcript = String(rawTranscript);
      transcript = redactCommandTriggers(transcript);
      const privacy = preprocessTranscriptForEnterprise(transcript, {
        redactPii: enterpriseConfig.piiRedactionEnabled,
        discardChatter: enterpriseConfig.discardSmallTalk,
      });
      if (privacy.cleanedText.length >= 8) transcript = privacy.cleanedText;

      const ai = getAIProvider(req.body?.provider || process.env.AI_PROVIDER);
      const minutes = await ai.generateMinutes({
        transcript,
        meetingId: req.body.meetingId,
        meetingTitle: req.body.meetingTitle,
        meetingDate: req.body.meetingDate,
        participants: req.body.participants || [],
        additionalContext: req.body.additionalContext,
        languageHint: req.body.languageHint,
      });

      const minute_id = uid('min');
      const meeting_id = req.body.meetingId || uid('mtg');
      const raw_decisions = (minutes.decisions || []).map((d: string) => ({
        id: uid('dec'),
        meeting_id,
        minute_id,
        decision_text: d,
        created_at: new Date().toISOString(),
      }));
      const action_items = (minutes.action_items || []).map((a: any) => ({
        id: uid('act'),
        meeting_id,
        minute_id,
        ...a,
        created_at: new Date().toISOString(),
      }));

      res.json({
        success: true,
        minute_id,
        ...minutes,
        raw_decisions,
        action_items,
        privacy: {
          redactions: privacy.redactions,
          discardedLines: privacy.discardedLines,
        },
      });
    } catch (e: any) {
      console.error('[minutes/generate]', e);
      res.status(e.status || 500).json({ error: sanitizePublicError(e, 'Minutes generation failed') });
    }
  });

  app.post('/api/chat-meeting', aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { meetingData, currentPrompt } = req.body || {};
      if (!hasAiApiKey()) {
        const title = meetingData?.title || 'the meeting';
        const summary = meetingData?.executiveSummary || meetingData?.summary || '';
        return res.json({
          success: true,
          reply: `Demo reply (no AI key): Regarding “${title}” — ${
            summary
              ? summary.slice(0, 280)
              : 'set GEMINI_API_KEY for live answers grounded in the full MoM.'
          }${currentPrompt ? ` (Q: ${String(currentPrompt).slice(0, 120)})` : ''}`,
          demoMode: true,
        });
      }
      requireLiveAi();
      const ai = geminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a meeting Q&A copilot. Answer briefly using only the meeting data.

MEETING JSON:
${JSON.stringify(meetingData || {}, null, 2)}

QUESTION: ${currentPrompt}`,
      });
      res.json({ success: true, reply: response.text || 'No answer generated.' });
    } catch (e: any) {
      console.error('[chat-meeting]', e);
      res.status(e.status || 500).json({ error: e.message || 'Chat failed' });
    }
  });

  app.post('/api/generate-email', aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { meetingData, emailStyle, recipient } = req.body || {};
      if (!hasAiApiKey()) {
        const who = recipient || 'team';
        const title = meetingData?.title || 'our meeting';
        const actions = Array.isArray(meetingData?.actionItems)
          ? meetingData.actionItems
              .slice(0, 3)
              .map((a: any) => `- ${a.task || a} (${a.owner || a.responsible_person || 'TBD'})`)
              .join('\n')
          : '- (none listed)';
        return res.json({
          success: true,
          demoMode: true,
          emailText: `Hi ${who},\n\nFollowing up on ${title} (${emailStyle || 'professional'} demo draft).\n\nKey actions:\n${actions}\n\nBest regards`,
        });
      }
      requireLiveAi();
      const ai = geminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a ${emailStyle || 'professional'} follow-up email${recipient ? ` to ${recipient}` : ''} from this meeting MoM. Return only the email body text.

${JSON.stringify(meetingData || {}, null, 2)}`,
      });
      res.json({ success: true, emailText: response.text || '' });
    } catch (e: any) {
      console.error('[generate-email]', e);
      res.status(e.status || 500).json({ error: e.message || 'Email draft failed' });
    }
  });

  app.post('/api/detect-schedule', async (req, res) => {
    try {
      const meeting = req.body?.meetingData;
      const events = [];
      if (meeting?.nextMeeting && meeting.nextMeeting !== 'Not specified') {
        events.push({
          id: uid('evt'),
          title: `Follow-up: ${meeting.title || 'Meeting'}`,
          date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          time: '10:00',
          durationMinutes: 30,
          description: meeting.nextMeeting,
          attendees: meeting.participants || [],
          meetingType: meeting.meetingType || 'Follow-up',
          isAutoDetected: true,
          status: 'Scheduled',
        });
      }
      res.json({ success: true, events });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Schedule detect failed' });
    }
  });

  // Lightweight persistence stubs (client also uses localStorage)
  const memory = {
    meetings: [] as any[],
    schedules: [] as any[],
    consents: [] as any[],
    audit: [] as any[],
    privacy: {} as Record<string, any>,
  };

  app.get('/api/meetings', (req, res) => {
    let list = [...memory.meetings];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      list = list.filter((m) => JSON.stringify(m).toLowerCase().includes(q));
    }
    res.json({ success: true, meetings: list });
  });
  app.get('/api/meetings/:id', (req, res) => {
    const m = memory.meetings.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, meeting: m });
  });
  app.post('/api/meetings', (req, res) => {
    const meeting = { id: uid('mtg'), ...req.body, createdAt: new Date().toISOString() };
    memory.meetings.unshift(meeting);
    res.json({ success: true, meeting });
  });
  app.patch('/api/meetings/:id', (req, res) => {
    const i = memory.meetings.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Not found' });
    memory.meetings[i] = { ...memory.meetings[i], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, meeting: memory.meetings[i] });
  });
  app.put('/api/meetings/:id/state', (req, res) => {
    const i = memory.meetings.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Not found' });
    memory.meetings[i] = { ...memory.meetings[i], status: req.body?.status, updatedAt: new Date().toISOString() };
    res.json({ success: true, meeting: memory.meetings[i] });
  });
  app.delete('/api/meetings/:id', (req, res) => {
    memory.meetings = memory.meetings.filter((x) => x.id !== req.params.id);
    res.json({ success: true });
  });

  app.all('/api/meetings/:id/transcript', (req, res) => {
    if (req.method === 'GET') return res.json({ success: true, segments: [] });
    if (req.method === 'POST') return res.json({ success: true });
    if (req.method === 'DELETE') return res.json({ success: true });
    res.status(405).end();
  });
  app.post('/api/meetings/:id/recordings', (_req, res) => res.json({ success: true }));
  app.get('/api/meetings/:id/minutes', (_req, res) => res.json({ success: true, minutes: [] }));
  app.post('/api/meetings/:id/decisions', (req, res) => res.json({ success: true, decision: { id: uid('dec'), ...req.body } }));
  app.delete('/api/decisions/:id', (_req, res) => res.json({ success: true }));
  app.post('/api/meetings/:id/action-items', (req, res) => res.json({ success: true, actionItem: { id: uid('act'), ...req.body } }));
  app.patch('/api/action-items/:id', (req, res) => res.json({ success: true, actionItem: { id: req.params.id, ...req.body } }));
  app.delete('/api/action-items/:id', (_req, res) => res.json({ success: true }));
  app.delete('/api/meetings/:id/recording', (_req, res) => res.json({ success: true }));

  app.get('/api/schedules', (_req, res) => res.json({ success: true, schedules: memory.schedules }));
  app.post('/api/schedules', (req, res) => {
    const item = { id: uid('sch'), ...req.body };
    memory.schedules.push(item);
    res.json({ success: true, schedule: item });
  });
  app.patch('/api/schedules/:id', (req, res) => {
    const i = memory.schedules.findIndex((x) => x.id === req.params.id);
    if (i >= 0) memory.schedules[i] = { ...memory.schedules[i], ...req.body };
    res.json({ success: true, schedule: memory.schedules[i] });
  });
  app.delete('/api/schedules/:id', (req, res) => {
    memory.schedules = memory.schedules.filter((x) => x.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/privacy/policy', (req, res) => {
    const orgId = String(req.query.orgId || 'default');
    res.json({ success: true, policy: memory.privacy[orgId] || { orgId, retentionDays: 90 } });
  });
  app.post('/api/privacy/policy', (req, res) => {
    const orgId = req.body?.orgId || 'default';
    memory.privacy[orgId] = req.body;
    res.json({ success: true, policy: req.body });
  });
  app.get('/api/consents', (_req, res) => res.json({ success: true, consents: memory.consents }));
  app.post('/api/consents', (req, res) => {
    const c = { id: uid('cns'), ...req.body };
    memory.consents.push(c);
    res.json({ success: true, consent: c });
  });
  app.patch('/api/consents/:id', (req, res) => res.json({ success: true, consent: { id: req.params.id, ...req.body } }));
  app.delete('/api/consents/:id', (req, res) => {
    memory.consents = memory.consents.filter((c) => c.id !== req.params.id);
    res.json({ success: true });
  });
  app.get('/api/audit-logs', (_req, res) => res.json({ success: true, logs: memory.audit }));
  app.post('/api/audit-logs', (req, res) => {
    const log = { id: uid('aud'), ...req.body, at: new Date().toISOString() };
    memory.audit.push(log);
    res.json({ success: true, log });
  });
  app.post('/api/privacy/auto-purge', (_req, res) => res.json({ success: true }));
  app.post('/api/privacy/signed-url', (_req, res) => res.json({ success: true, url: '' }));
  app.post('/api/privacy/export-data', (_req, res) => res.json({ success: true, data: {} }));

  // Billing stubs
  app.get('/api/billing/plans', (_req, res) => res.json({ success: true, plans: SAAS_PLANS }));
  app.get('/api/billing/config', (_req, res) =>
    res.json({
      success: true,
      provider: process.env.BILLING_PROVIDER || 'mock',
      liveCharges: false,
      note: 'Checkout is simulated until Stripe/Razorpay secrets are configured and adapters call live SDKs.',
    }),
  );
  app.get('/api/billing/subscription', (_req, res) => res.json({ success: true, subscription: { tier: 'FREE', status: 'active' } }));
  app.get('/api/billing/usage', (_req, res) => res.json({ success: true, usage: { meetings: 0, minutes: 0 } }));
  app.get('/api/billing/invoices', (_req, res) => res.json({ success: true, invoices: [] }));
  app.post('/api/billing/checkout', async (req, res) => {
    try {
      const result = await billingManager.initiateCheckout(req.body as any);
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post('/api/billing/confirm-checkout', (_req, res) => res.json({ success: true }));
  app.post('/api/billing/cancel', (_req, res) => res.json({ success: true }));
  app.post('/api/billing/usage/simulate', (_req, res) => res.json({ success: true }));
  app.post('/api/billing/webhook/stripe', (_req, res) =>
    res.status(501).json({
      received: false,
      error: 'Stripe webhook verification not configured. Set STRIPE_WEBHOOK_SECRET and implement signature check before enabling.',
    }),
  );
  app.post('/api/billing/webhook/razorpay', (_req, res) =>
    res.status(501).json({
      received: false,
      error: 'Razorpay webhook verification not configured.',
    }),
  );

  return app;
}

async function attachFrontend(app: express.Express) {
  // On Vercel, static files come from /public via CDN (express.static is ignored).
  if (process.env.VERCEL) return;

  if (!isProd) {
    const viteMod = await import('vite');
    const vite = await viteMod.createServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(
          url,
          await fs.readFile(path.join(rootDir, 'index.html'), 'utf-8'),
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    return;
  }

  const clientDir = path.join(rootDir, 'dist', 'client');
  app.use(express.static(clientDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

const app = createApp();

// Vercel Express runtime detects this default export (do not listen on Vercel).
export default app;
export { app, attachFrontend, createApp };

if (!process.env.VERCEL) {
  attachFrontend(app)
    .then(() => {
      app.listen(PORT, HOST, () => {
        console.log(`2Click Voice MoM listening on http://${HOST}:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server', err);
      process.exit(1);
    });
}
