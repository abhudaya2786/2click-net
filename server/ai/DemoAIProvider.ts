import {
  AIProvider,
  ActionItemData,
  GenerateMinutesOptions,
  MinutesOutput,
} from './AIProvider';

/**
 * Offline / no-key Minutes generator for local demos and automated smoke tests.
 * Extracts structure from the transcript with lightweight heuristics — not a live model.
 */
export class DemoAIProvider implements AIProvider {
  public name = 'demo' as const;

  public async generateMinutes(options: GenerateMinutesOptions): Promise<MinutesOutput> {
    const transcript = (options.transcript || '').trim();
    const lines = transcript
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const discussion_points = lines.slice(0, 8).map((line) => {
      const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
      return m ? `${m[1].trim()}: ${m[2].trim()}` : line;
    });

    const decisions = lines
      .filter((l) => /\b(decid(ed|e)|agreed|will ship|approved|go with|finaliz)/i.test(l))
      .map((l) => l.replace(/^[^:]+:\s*/, '').trim())
      .slice(0, 6);

    const action_items: ActionItemData[] = lines
      .filter((l) => /\b(will|i'll|i will|to-do|todo|action|prepare|send|follow.?up|by\s+\w+day)\b/i.test(l))
      .slice(0, 6)
      .map((line) => {
        const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
        const speaker = m?.[1]?.trim() || options.participants?.[0] || 'Not specified';
        const task = (m?.[2] || line).trim();
        const deadlineMatch = task.match(/\bby\s+([A-Za-z]+day|\d{1,2}\s+\w+|\d{4}-\d{2}-\d{2})\b/i);
        return {
          task,
          responsible_person: speaker,
          deadline: deadlineMatch?.[1] || 'Not specified',
          priority: /\b(urgent|asap|critical|high)\b/i.test(task) ? 'High' : 'Medium',
          status: 'Pending' as const,
        };
      });

    const pending_issues = lines
      .filter((l) => /\b(block|risk|issue|concern|pending|open question)\b/i.test(l))
      .map((l) => l.replace(/^[^:]+:\s*/, '').trim())
      .slice(0, 4);

    const nextHit = lines.find((l) => /\bnext\s+(meeting|sync|call|week)\b/i.test(l));
    const title = options.meetingTitle || 'Voice Meeting';
    const summary =
      discussion_points.length > 0
        ? `Demo MoM for “${title}”: ${discussion_points
            .slice(0, 2)
            .map((p) => p.replace(/^[^:]+:\s*/, ''))
            .join(' ')}`
        : `Demo MoM for “${title}” generated without a live AI key.`;

    return {
      success: true,
      provider: 'demo',
      model_used: 'demo-heuristics-v1',
      summary,
      discussion_points:
        discussion_points.length > 0
          ? discussion_points
          : ['No discussion points could be extracted from the transcript.'],
      decisions:
        decisions.length > 0 ? decisions : ['No explicit decisions detected in the transcript.'],
      action_items:
        action_items.length > 0
          ? action_items
          : [
              {
                task: 'Review this demo MoM and set GEMINI_API_KEY for live AI generation',
                responsible_person: options.participants?.[0] || 'Not specified',
                deadline: 'Not specified',
                priority: 'Low',
                status: 'Pending',
              },
            ],
      pending_issues:
        pending_issues.length > 0 ? pending_issues : [],
      next_meeting: nextHit
        ? nextHit.replace(/^[^:]+:\s*/, '').trim()
        : 'Not specified',
    };
  }
}
