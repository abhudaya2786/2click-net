/**
 * Build a MoM MeetingData note from a command session when Gemini is unavailable,
 * and persist it into the same localStorage key the MoM document UI reads.
 */
import type { MeetingData, TopicDiscussion, TranscriptSegment, ActionItem } from '../types';
import { redactCommandTriggers } from './wakeWordRedaction';

export const COMMAND_SESSION_NOTE_EVENT = 'voice-mom-command-note-saved';
export const SAVED_MEETINGS_KEY = 'voice_mom_saved_meetings_v1';

function newMeetingId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `mtg-cmd-${crypto.randomUUID()}`
    : `mtg-cmd-${Date.now()}`;
}

export function buildMeetingNoteFromSession(input: {
  transcript: string;
  summary?: string;
  durationSeconds?: number;
  audioDataUrl?: string;
}): MeetingData {
  const redacted = redactCommandTriggers(input.transcript || '').trim();
  const summary =
    redactCommandTriggers(input.summary || '').trim() ||
    redacted.slice(0, 280) ||
    'Voice command session note (transcript pending — speak during recording or add GEMINI_API_KEY for auto MoM).';

  const durationSeconds = Math.max(0, input.durationSeconds || 0);
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const duration =
    durationSeconds > 0
      ? `${mins}:${String(secs).padStart(2, '0')}`
      : undefined;

  const lines = redacted
    ? redacted.split(/(?<=[.?!।])\s+/).map((t) => t.trim()).filter(Boolean)
    : [summary];

  const transcript: TranscriptSegment[] = lines.map((text, i) => ({
    speaker: `Speaker ${(i % 2) + 1}`,
    text,
  }));

  const now = new Date();
  return {
    id: newMeetingId(),
    title: `Voice Note · ${now.toLocaleString()}`,
    createdAt: now.toISOString(),
    meetingDate: now.toISOString().slice(0, 10),
    duration,
    meetingType: 'Voice Command',
    languageDetected: 'auto',
    participants: ['Command Session'],
    executiveSummary: summary,
    sentiment: 'Neutral',
    keyTopics: [
      {
        topic: 'Session notes',
        summary,
        keyPoints: lines.slice(0, 5),
        speakersInvolved: ['Command Session'],
      },
    ],
    decisions: redacted
      ? [`Captured voice note (${lines.length} segment${lines.length === 1 ? '' : 's'}).`]
      : [],
    actionItems: [],
    risksAndBlockers: [],
    openQuestions: redacted
      ? []
      : [
          'Add GEMINI_API_KEY for full AI MoM, or speak clearly while recording so transcript is captured.',
        ],
    transcript,
    audioUrl: input.audioDataUrl,
  };
}

/** Ensure Gemini (or partial) payloads are safe for the MoM document UI. */
export function normalizeMeetingData(
  raw: Partial<MeetingData> & Record<string, unknown>,
  fallback?: Partial<MeetingData>,
): MeetingData {
  const transcriptText = Array.isArray(raw.transcript)
    ? raw.transcript
        .map((t: any) => (typeof t?.text === 'string' ? t.text : ''))
        .filter(Boolean)
        .join(' ')
    : '';
  const summaryText =
    (typeof raw.executiveSummary === 'string' && raw.executiveSummary.trim()) ||
    (typeof raw.summary === 'string' && raw.summary.trim()) ||
    (typeof fallback?.executiveSummary === 'string' && fallback.executiveSummary) ||
    transcriptText.slice(0, 280) ||
    '';

  const base = buildMeetingNoteFromSession({
    transcript: transcriptText,
    summary: summaryText,
    durationSeconds: 0,
    audioDataUrl:
      (typeof raw.audioUrl === 'string' && raw.audioUrl) ||
      (typeof fallback?.audioUrl === 'string' ? fallback.audioUrl : undefined),
  });

  const keyTopics: TopicDiscussion[] = Array.isArray(raw.keyTopics) && raw.keyTopics.length
    ? (raw.keyTopics as TopicDiscussion[])
    : base.keyTopics;
  const transcript: TranscriptSegment[] =
    Array.isArray(raw.transcript) && raw.transcript.length
      ? (raw.transcript as TranscriptSegment[])
      : base.transcript;
  const actionItems: ActionItem[] = Array.isArray(raw.actionItems)
    ? (raw.actionItems as ActionItem[])
    : [];

  return {
    ...base,
    id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
    title: typeof raw.title === 'string' && raw.title ? raw.title : base.title,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : base.createdAt,
    meetingDate: typeof raw.meetingDate === 'string' ? raw.meetingDate : base.meetingDate,
    duration: typeof raw.duration === 'string' ? raw.duration : base.duration,
    meetingType:
      typeof raw.meetingType === 'string' && raw.meetingType ? raw.meetingType : 'Voice Command',
    languageDetected:
      typeof raw.languageDetected === 'string' ? raw.languageDetected : base.languageDetected,
    participants: Array.isArray(raw.participants)
      ? (raw.participants as string[])
      : base.participants,
    executiveSummary: summaryText || base.executiveSummary,
    sentiment: typeof raw.sentiment === 'string' ? raw.sentiment : base.sentiment,
    keyTopics,
    decisions: Array.isArray(raw.decisions) ? (raw.decisions as string[]) : base.decisions,
    actionItems,
    risksAndBlockers: Array.isArray(raw.risksAndBlockers)
      ? (raw.risksAndBlockers as string[])
      : base.risksAndBlockers,
    openQuestions: Array.isArray(raw.openQuestions)
      ? (raw.openQuestions as string[])
      : base.openQuestions,
    transcript,
    audioUrl: typeof raw.audioUrl === 'string' ? raw.audioUrl : base.audioUrl,
  };
}

export function persistMeetingNote(meeting: MeetingData): void {
  const safe = normalizeMeetingData(meeting as MeetingData & Record<string, unknown>);
  try {
    const prev = JSON.parse(localStorage.getItem(SAVED_MEETINGS_KEY) || '[]');
    const list = Array.isArray(prev) ? prev : [];
    localStorage.setItem(
      SAVED_MEETINGS_KEY,
      JSON.stringify([safe, ...list.filter((m: MeetingData) => m.id !== safe.id)].slice(0, 100)),
    );
  } catch {
    /* ignore quota */
  }

  try {
    window.dispatchEvent(
      new CustomEvent(COMMAND_SESSION_NOTE_EVENT, {
        detail: { meeting: safe },
      }),
    );
  } catch {
    /* ignore */
  }
}
