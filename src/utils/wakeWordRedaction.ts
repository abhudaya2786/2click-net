import { normalizeVoiceText } from './wakeWordProvider';

/** Trigger phrases that must never appear in saved transcripts / MoM. */
export const COMMAND_TRIGGER_PHRASES: string[] = [
  // Start
  '2click start',
  '2 click start',
  'two click start',
  'meeting shuru karo',
  'meeting shuru karo',
  'meeting shuru',
  'start recording',
  'recording start',
  'record start',
  'meeting start',
  'start meeting',
  'मीटिंग शुरू करो',
  'मीटिंग शुरू',
  'रिकॉर्डिंग शुरू करो',
  'रिकॉर्डिंग शुरू',
  // Stop / save
  'meeting khatam',
  'meeting khatm',
  '2click stop',
  '2 click stop',
  'two click stop',
  'save note',
  'stop recording',
  'recording stop',
  'meeting stop',
  'stop meeting',
  'मीटिंग खत्म',
  'मीटिंग समाप्त',
  'सेव नोट',
  // Cancel
  'cancel recording',
  'recording cancel',
  'cancel note',
  'रिकॉर्डिंग रद्द',
  'कैंसल रिकॉर्डिंग',
];

/**
 * Remove wake/command trigger words from transcript or MoM text.
 * Keeps business content intact.
 */
export function redactCommandTriggers(text: string, extraPhrases: string[] = []): string {
  if (!text) return text;
  const phrases = [...COMMAND_TRIGGER_PHRASES, ...extraPhrases]
    .map((p) => p.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let out = text;
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(escaped, 'gi');
    out = out.replace(re, ' ');
  }

  // Also strip normalized latin variants from mixed text chunks
  const normalizedOut = normalizeVoiceText(out);
  for (const phrase of phrases) {
    const n = normalizeVoiceText(phrase);
    if (!n) continue;
    if (normalizedOut.includes(n)) {
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      out = out.replace(new RegExp(escaped, 'gi'), ' ');
    }
  }

  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
}

export function collectCommandAliasPhrases(
  commands: Array<{ phrase: string; aliases?: string[] }>,
): string[] {
  const all: string[] = [];
  for (const c of commands) {
    all.push(c.phrase);
    for (const a of c.aliases || []) all.push(a);
  }
  return all;
}
