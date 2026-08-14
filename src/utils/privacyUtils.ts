import { MeetingData, PrivacySettings, TranscriptSegment } from '../types';

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  enablePiiRedaction: true,
  autoPurgeAudioBuffer: true,
  localOnlyStorage: true,
  anonymizeSpeakers: false,
  ephemeralMode: false,
};

// Common regex patterns for PII Redaction (India + general)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4,6}/g;
const CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
const AADHAAR_REGEX = /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
const BANK_IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
const BANK_ACCOUNT_REGEX = /\b(?:a\/?c|account|acct)[\s.:#-]*\d{9,18}\b/gi;
const SECRET_TOKEN_REGEX = /(?:api[_-]?key|secret|password|bearer|auth[_-]?token|token)[:=\s]+["']?([a-zA-Z0-9_\-]{8,})["']?/gi;

/**
 * Mask PII from arbitrary text string
 */
export function redactPii(text: string): string {
  if (!text) return text;
  let clean = text;

  // Mask Secrets & Tokens
  clean = clean.replace(SECRET_TOKEN_REGEX, (match, p1) => {
    return match.replace(p1, '[REDACTED]');
  });

  clean = clean.replace(AADHAAR_REGEX, '[REDACTED]');
  clean = clean.replace(PAN_REGEX, '[REDACTED]');
  clean = clean.replace(BANK_IFSC_REGEX, '[REDACTED]');
  clean = clean.replace(BANK_ACCOUNT_REGEX, '[REDACTED]');

  // Mask Credit Cards / Account numbers
  clean = clean.replace(CARD_REGEX, '[REDACTED]');

  // Mask Emails
  clean = clean.replace(EMAIL_REGEX, '[REDACTED]');

  // Mask Phone Numbers (ensure we don't accidentally mask short timestamps like 10:30)
  clean = clean.replace(PHONE_REGEX, (match) => {
    if (match.includes(':') && match.length <= 5) return match; // skip timestamps
    if (match.trim().length >= 7) return '[REDACTED]';
    return match;
  });

  return clean;
}

/**
 * Redact sensitive info across an entire MeetingData object
 */
export function applyPrivacyToMeeting(meeting: MeetingData, settings: PrivacySettings): MeetingData {
  if (!settings.enablePiiRedaction && !settings.anonymizeSpeakers) {
    return meeting;
  }

  const speakerMap = new Map<string, string>();
  let speakerCounter = 1;

  const getSpeakerLabel = (original: string) => {
    if (!settings.anonymizeSpeakers) return original;
    if (!speakerMap.has(original)) {
      speakerMap.set(original, `Speaker ${speakerCounter++}`);
    }
    return speakerMap.get(original)!;
  };

  const redact = (str: string) => (settings.enablePiiRedaction ? redactPii(str) : str);

  return {
    ...meeting,
    title: redact(meeting.title),
    executiveSummary: redact(meeting.executiveSummary),
    participants: meeting.participants.map(p => getSpeakerLabel(redact(p))),
    decisions: meeting.decisions.map(d => redact(d)),
    actionItems: meeting.actionItems.map(item => ({
      ...item,
      task: redact(item.task),
      owner: getSpeakerLabel(redact(item.owner)),
      deadline: redact(item.deadline),
    })),
    keyTopics: meeting.keyTopics.map(topic => ({
      ...topic,
      topic: redact(topic.topic),
      summary: redact(topic.summary),
      keyPoints: topic.keyPoints.map(kp => redact(kp)),
      speakersInvolved: topic.speakersInvolved?.map(s => getSpeakerLabel(redact(s))),
    })),
    risksAndBlockers: meeting.risksAndBlockers.map(r => redact(r)),
    openQuestions: meeting.openQuestions.map(q => redact(q)),
    transcript: meeting.transcript.map((seg: TranscriptSegment) => ({
      ...seg,
      speaker: getSpeakerLabel(seg.speaker),
      text: redact(seg.text),
    })),
  };
}
