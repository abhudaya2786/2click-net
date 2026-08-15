/**
 * Privacy & PII redaction + small-talk discard (Zero-Liability layer).
 * Used by server pipelines before MoM / PDF / WhatsApp dispatch.
 */

export interface PiiFilterResult {
  cleanedText: string;
  redactions: Array<{ type: string; count: number }>;
  discardedLines: number;
  retainedLines: number;
}

const AADHAAR_REGEX = /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4,6}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const BANK_IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
const BANK_ACCOUNT_REGEX = /\b(?:a\/?c|account|acct)[\s.:#-]*\d{9,18}\b/gi;
const CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
const UPI_REGEX = /\b[\w.\-]{2,}@[a-z]{2,}\b/gi;
const SECRET_REGEX =
  /(?:api[_-]?key|secret|password|bearer|auth[_-]?token|otp|pin)[:=\s]+["']?([a-zA-Z0-9_\-]{4,})["']?/gi;

/** Heuristic small-talk / personal chatter lines to discard before enterprise MoM. */
const SMALL_TALK_PATTERNS: RegExp[] = [
  /\b(how are you|how's it going|good morning|good evening|namaste|kaise ho|kya haal)\b/i,
  /\b(family|wife|husband|kids|bacche|shaadi|birthday party)\b/i,
  /\b(cricket|ipl|movie|netflix|weekend plans|lunch menu)\b/i,
  /\b(weather|traffic was|did you watch|funny joke)\b/i,
  /^(ok|okay|hmm+|haan|yes|no|theek hai|achha)\.?$/i,
];

function bump(map: Map<string, number>, type: string, n = 1) {
  map.set(type, (map.get(type) || 0) + n);
}

export function redactPiiServer(text: string): { text: string; counts: Map<string, number> } {
  const counts = new Map<string, number>();
  if (!text) return { text: text || '', counts };

  let clean = text;

  clean = clean.replace(SECRET_REGEX, (m, p1) => {
    bump(counts, 'secret');
    return m.replace(p1, '[REDACTED]');
  });
  clean = clean.replace(AADHAAR_REGEX, () => {
    bump(counts, 'aadhaar');
    return '[REDACTED]';
  });
  clean = clean.replace(PAN_REGEX, () => {
    bump(counts, 'pan');
    return '[REDACTED]';
  });
  clean = clean.replace(BANK_IFSC_REGEX, () => {
    bump(counts, 'ifsc');
    return '[REDACTED]';
  });
  clean = clean.replace(BANK_ACCOUNT_REGEX, () => {
    bump(counts, 'bank_account');
    return '[REDACTED]';
  });
  clean = clean.replace(CARD_REGEX, (m) => {
    if (m.replace(/\D/g, '').length < 13) return m;
    bump(counts, 'card');
    return '[REDACTED]';
  });
  clean = clean.replace(UPI_REGEX, (m) => {
    if (m.includes('@gmail') || m.includes('@yahoo')) return m; // leave emails to email regex
    bump(counts, 'upi');
    return '[REDACTED]';
  });
  clean = clean.replace(EMAIL_REGEX, () => {
    bump(counts, 'email');
    return '[REDACTED]';
  });
  clean = clean.replace(PHONE_REGEX, (m) => {
    if (m.includes(':') && m.length <= 5) return m;
    if (m.replace(/\D/g, '').length < 7) return m;
    bump(counts, 'phone');
    return '[REDACTED]';
  });

  return { text: clean, counts };
}

export function discardSmallTalk(text: string): { text: string; discarded: number; retained: number } {
  const lines = text.split(/\n+/);
  const kept: string[] = [];
  let discarded = 0;
  for (const line of lines) {
    const body = line.replace(/^[^:]+:\s*/, '').trim();
    if (!body) continue;
    if (SMALL_TALK_PATTERNS.some((re) => re.test(body))) {
      discarded += 1;
      continue;
    }
    kept.push(line.trim());
  }
  return { text: kept.join('\n'), discarded, retained: kept.length };
}

export function preprocessTranscriptForEnterprise(
  raw: string,
  opts: { redactPii?: boolean; discardChatter?: boolean } = {},
): PiiFilterResult {
  const redactPii = opts.redactPii !== false;
  const discardChatter = opts.discardChatter !== false;

  let working = raw || '';
  let discardedLines = 0;
  let retainedLines = working.split(/\n+/).filter(Boolean).length;

  if (discardChatter) {
    const d = discardSmallTalk(working);
    working = d.text;
    discardedLines = d.discarded;
    retainedLines = d.retained;
  }

  const counts = new Map<string, number>();
  if (redactPii) {
    const r = redactPiiServer(working);
    working = r.text;
    r.counts.forEach((v, k) => bump(counts, k, v));
  }

  return {
    cleanedText: working.trim(),
    redactions: [...counts.entries()].map(([type, count]) => ({ type, count })),
    discardedLines,
    retainedLines,
  };
}
