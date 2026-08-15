/**
 * Offline unit checks for voice phrase normalization + command matching.
 * Run: node scripts/test-voice-match.mjs
 */
import assert from 'node:assert/strict';

function normalizeVoiceText(text) {
  if (!text) return '';
  let out = text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'।]/g, '')
    .replace(/\s+/g, ' ');
  out = out
    .replace(/\b(to|too|two|tu|doo|do)\s*click\b/g, '2click')
    .replace(/\btoclick\b/g, '2click')
    .replace(/\b2\s*click\b/g, '2click');
  return out;
}

function findMatchingCommand(rawTranscript, commands) {
  const normalized = normalizeVoiceText(rawTranscript);
  if (!normalized) return null;
  for (const cmd of commands) {
    if (!cmd.enabled) continue;
    const candidatePhrases = [
      normalizeVoiceText(cmd.phrase),
      ...(cmd.aliases || []).map(normalizeVoiceText),
    ].filter(Boolean);
    for (const phrase of candidatePhrases) {
      if (!phrase) continue;
      const isExactOrContains =
        normalized === phrase ||
        normalized.startsWith(`${phrase} `) ||
        normalized.endsWith(` ${phrase}`) ||
        normalized.includes(` ${phrase} `) ||
        (phrase.length >= 5 && normalized.includes(phrase));
      if (isExactOrContains) return cmd;
    }
  }
  return null;
}

const startCmd = {
  phrase: '2Click Start',
  aliases: [
    '2click start',
    '2 click start',
    'two click start',
    'to click start',
    'too click start',
    'toclick start',
    'meeting shuru karo',
    'start recording',
    'meeting start',
    'start meeting',
    'शुरू करो',
    'मीटिंग शुरू करो',
  ],
  enabled: true,
  action: 'START_RECORDING',
};

const stopCmd = {
  phrase: '2Click Stop',
  aliases: [
    '2click stop',
    'to click stop',
    'too click stop',
    'meeting khatam',
    'stop recording',
    'save note',
  ],
  enabled: true,
  action: 'STOP_RECORDING',
};

const commands = [startCmd, stopCmd];

const cases = [
  ['2Click Start', 'START_RECORDING'],
  ['to click start', 'START_RECORDING'],
  ['too click start please', 'START_RECORDING'],
  ['two click start', 'START_RECORDING'],
  ['toclick start', 'START_RECORDING'],
  ['meeting shuru karo', 'START_RECORDING'],
  ['मीटिंग शुरू करो', 'START_RECORDING'],
  ['start recording', 'START_RECORDING'],
  ['2 click stop', 'STOP_RECORDING'],
  ['to click stop', 'STOP_RECORDING'],
  ['meeting khatam', 'STOP_RECORDING'],
];

let failed = 0;
for (const [utterance, action] of cases) {
  const hit = findMatchingCommand(utterance, commands);
  try {
    assert.ok(hit, `no match for "${utterance}"`);
    assert.equal(hit.action, action, `"${utterance}" → ${hit.action}`);
    console.log(`  ✓ "${utterance}" → ${action}`);
  } catch (e) {
    failed += 1;
    console.error(`  ✗ ${e.message}`);
  }
}

assert.equal(normalizeVoiceText('To Click Start!'), '2click start');
console.log(`\nResults: ${cases.length - failed} passed, ${failed} failed`);
if (failed) process.exit(1);
