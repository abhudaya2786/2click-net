import OpenAI from 'openai';
import { AIProvider, GenerateMinutesOptions, MinutesOutput, ActionItemData } from './AIProvider';

export class OpenAIProvider implements AIProvider {
  public name = 'openai' as const;

  private getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }
    return new OpenAI({ apiKey });
  }

  public async generateMinutes(options: GenerateMinutesOptions): Promise<MinutesOutput> {
    const client = this.getClient();
    const {
      transcript,
      meetingTitle = 'General Meeting',
      meetingDate = 'Not specified',
      participants = [],
      additionalContext = '',
      languageHint = 'auto',
    } = options;

    const systemPrompt = `You are an elite Enterprise AI Meeting Intelligence Engine.
You extract factual, accurate, and structured Minutes of Meeting (MoM) from spoken transcripts.

CRITICAL AI RULES - STRICT ENFORCEMENT:
1. NEVER INVENT INFORMATION: Base all summaries, points, decisions, and action items strictly on the provided transcript. Do NOT hallucinate.
2. NEVER INVENT PARTICIPANTS: Only include participants who spoke or were explicitly named in the meeting. Do not add fictitious people.
3. NEVER INVENT DEADLINES: Only record a deadline if an explicit date/time or relative timeline (e.g. "by Friday", "next sprint", "end of month") was spoken. Otherwise, set deadline to "Not specified".
4. PRESERVE NAMES: Accurately keep exact participant and company/product names without alteration.
5. PRESERVE DATES: Keep all mentioned dates and timestamps intact.
6. UNDERSTAND HINDI: Seamlessly understand spoken Hindi in Devanagari script (e.g. "काम पूरा करना है") and Romanized Hindi (e.g. "yeh task kal tak complete hona chahiye").
7. UNDERSTAND ENGLISH: Accurately extract all professional, engineering, and corporate English dialogue.
8. UNDERSTAND HINGLISH: Understand mixed Hindi + English code-switching conversation common in modern tech meetings.
9. MARK UNCERTAIN INFORMATION: If a statement is ambiguous, audio is mumbled, or attribution is unclear, mark it clearly as "[Uncertain: ...]".
10. MISSING DATA FALLBACK: Use "Not specified" when information (such as responsible person, deadline, or next meeting) is missing or unstated.

OUTPUT JSON FORMAT REQUIREMENTS:
You MUST respond with a valid JSON object matching this schema:
{
  "summary": "Concise executive overview of the meeting and main purpose.",
  "discussion_points": [
    "Key topic 1 discussed with essential context.",
    "Key topic 2 discussed with essential context."
  ],
  "decisions": [
    "Explicit decision or agreement 1 reached during the meeting.",
    "Explicit decision or agreement 2 reached during the meeting."
  ],
  "action_items": [
    {
      "task": "Specific actionable task description.",
      "responsible_person": "Exact name of assigned person, or 'Not specified' if unassigned.",
      "deadline": "Spoken deadline/timeframe, or 'Not specified'.",
      "priority": "High" | "Medium" | "Low" | "Critical",
      "status": "Pending" | "In Progress" | "Completed"
    }
  ],
  "pending_issues": [
    "Unresolved question, open blocker, or topic tabled for future review."
  ],
  "next_meeting": "Details of the next scheduled meeting (date/time/agenda) or 'Not specified'."
}`;

    const userPrompt = `Meeting Title: ${meetingTitle}
Meeting Date: ${meetingDate}
Known Participants / Attendees: ${participants.length > 0 ? participants.join(', ') : 'Not specified'}
Language Hint: ${languageHint}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

TRANSCRIPT CONTENT:
"""
${transcript}
"""

Extract structured minutes conforming strictly to all AI rules. Return ONLY valid JSON.`;

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // High fidelity & low hallucination
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error('Failed to parse AI response into structured JSON format.');
    }

    // Sanitize & enforce fallbacks
    const summary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
      ? parsed.summary.trim()
      : 'Summary not available.';

    const discussion_points = Array.isArray(parsed.discussion_points)
      ? parsed.discussion_points.filter((p: any) => typeof p === 'string' && p.trim().length > 0)
      : [];

    const decisions = Array.isArray(parsed.decisions)
      ? parsed.decisions.map((d: any) => (typeof d === 'string' ? d : d?.decision_text || JSON.stringify(d)))
      : [];

    const action_items: ActionItemData[] = Array.isArray(parsed.action_items)
      ? parsed.action_items.map((item: any) => {
          let priority: ActionItemData['priority'] = 'Medium';
          const pStr = String(item.priority || '').toLowerCase();
          if (pStr.includes('crit')) priority = 'Critical';
          else if (pStr.includes('high')) priority = 'High';
          else if (pStr.includes('low')) priority = 'Low';

          let status: ActionItemData['status'] = 'Pending';
          const sStr = String(item.status || '').toLowerCase();
          if (sStr.includes('comp') || sStr.includes('done')) status = 'Completed';
          else if (sStr.includes('prog') || sStr.includes('wip')) status = 'In Progress';

          return {
            task: String(item.task || 'Unspecified task').trim(),
            responsible_person: String(item.responsible_person || 'Not specified').trim() || 'Not specified',
            deadline: String(item.deadline || 'Not specified').trim() || 'Not specified',
            priority,
            status,
          };
        })
      : [];

    const pending_issues = Array.isArray(parsed.pending_issues)
      ? parsed.pending_issues.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
      : [];

    const next_meeting = typeof parsed.next_meeting === 'string' && parsed.next_meeting.trim().length > 0
      ? parsed.next_meeting.trim()
      : 'Not specified';

    return {
      success: true,
      provider: 'openai',
      model_used: modelName,
      summary,
      discussion_points,
      decisions,
      action_items,
      pending_issues,
      next_meeting,
    };
  }
}
