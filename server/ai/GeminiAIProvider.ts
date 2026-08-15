import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, GenerateMinutesOptions, MinutesOutput, ActionItemData } from './AIProvider';

export class GeminiAIProvider implements AIProvider {
  public name = 'gemini' as const;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public async generateMinutes(options: GenerateMinutesOptions): Promise<MinutesOutput> {
    const ai = this.getClient();
    const {
      transcript,
      meetingTitle = 'General Meeting',
      meetingDate = 'Not specified',
      participants = [],
      additionalContext = '',
      languageHint = 'auto',
    } = options;

    const systemPrompt = `You are an elite Enterprise AI Meeting Intelligence Engine.
Extract factual, accurate, and structured Minutes of Meeting (MoM) strictly from the spoken transcript.

CRITICAL AI RULES:
1. NEVER INVENT INFORMATION: Base all summaries, points, decisions, and action items strictly on the provided transcript.
2. NEVER INVENT PARTICIPANTS: Only include participants who spoke or were explicitly named in the meeting.
3. NEVER INVENT DEADLINES: Only record a deadline if an explicit date/time or timeframe was spoken. Otherwise, use "Not specified".
4. PRESERVE NAMES: Accurately keep exact participant and organization names without modification.
5. PRESERVE DATES: Keep all mentioned dates and timestamps intact.
6. UNDERSTAND HINDI: Seamlessly understand spoken Hindi in Devanagari script and Romanized transliteration.
7. UNDERSTAND ENGLISH: Accurately extract all professional, engineering, and corporate English dialogue.
8. UNDERSTAND HINGLISH: Understand mixed Hindi + English code-switching conversation.
9. MARK UNCERTAIN INFORMATION: If a statement is ambiguous or attribution is unclear, mark it as "[Uncertain: ...]".
10. USE "Not specified" when information (such as responsible person, deadline, or next meeting) is missing.`;

    const userPrompt = `Meeting Title: ${meetingTitle}
Meeting Date: ${meetingDate}
Participants: ${participants.length > 0 ? participants.join(', ') : 'Not specified'}
Language Hint: ${languageHint}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

TRANSCRIPT:
"""
${transcript}
"""`;

    const modelName = process.env.GEMINI_MODEL || process.env.GEMINI_FIELD_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            discussion_points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            decisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            action_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  responsible_person: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low', 'Critical'] },
                  status: { type: Type.STRING, enum: ['Pending', 'In Progress', 'Completed'] },
                },
                required: ['task', 'responsible_person', 'deadline', 'priority', 'status'],
              },
            },
            pending_issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            next_meeting: { type: Type.STRING },
          },
          required: ['summary', 'discussion_points', 'decisions', 'action_items', 'pending_issues', 'next_meeting'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const summary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
      ? parsed.summary.trim()
      : 'Summary not available.';

    const discussion_points = Array.isArray(parsed.discussion_points)
      ? parsed.discussion_points
      : [];

    const decisions = Array.isArray(parsed.decisions)
      ? parsed.decisions
      : [];

    const action_items: ActionItemData[] = Array.isArray(parsed.action_items)
      ? parsed.action_items.map((item: any) => ({
          task: String(item.task || 'Unspecified task').trim(),
          responsible_person: String(item.responsible_person || 'Not specified').trim() || 'Not specified',
          deadline: String(item.deadline || 'Not specified').trim() || 'Not specified',
          priority: ['High', 'Medium', 'Low', 'Critical'].includes(item.priority) ? item.priority : 'Medium',
          status: ['Pending', 'In Progress', 'Completed'].includes(item.status) ? item.status : 'Pending',
        }))
      : [];

    const pending_issues = Array.isArray(parsed.pending_issues)
      ? parsed.pending_issues
      : [];

    const next_meeting = typeof parsed.next_meeting === 'string' && parsed.next_meeting.trim().length > 0
      ? parsed.next_meeting.trim()
      : 'Not specified';

    return {
      success: true,
      provider: 'gemini',
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
