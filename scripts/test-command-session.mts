/**
 * Smoke tests: wake-word redaction + voice command matching for command sessions
 * + MoM note document persistence after stop/save.
 */
import { redactCommandTriggers } from '../src/utils/wakeWordRedaction.ts';
import { VoiceCommandProvider } from '../src/utils/voiceCommandProvider.ts';
import { DEFAULT_VOICE_COMMANDS } from '../src/utils/voiceDefaults.ts';
import {
  buildMeetingNoteFromSession,
  normalizeMeetingData,
  persistMeetingNote,
  COMMAND_SESSION_NOTE_EVENT,
  SAVED_MEETINGS_KEY,
} from '../src/utils/buildCommandSessionMeeting.ts';
import { CommandSessionController } from '../src/utils/commandSessionController.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function testRedaction() {
  const raw =
    '2Click Start cement delivery kal subah 10 baje Meeting khatam Save note please';
  const out = redactCommandTriggers(raw);
  assert(!/2click start/i.test(out), 'start phrase should be redacted');
  assert(!/meeting khatam/i.test(out), 'stop phrase should be redacted');
  assert(!/save note/i.test(out), 'save note should be redacted');
  assert(/cement delivery/i.test(out), 'business content must remain');
  console.log('redaction OK:', out);

  const cancel = redactCommandTriggers('Cancel recording discard this');
  assert(!/cancel recording/i.test(cancel), 'cancel phrase redacted');
  console.log('cancel redaction OK:', cancel);
}

function testCommandMatching() {
  const provider = new VoiceCommandProvider(DEFAULT_VOICE_COMMANDS, true);

  const start = provider.findMatchingCommand('please 2Click Start now');
  assert(!!start && start.action === 'START_RECORDING', '2Click Start → START_RECORDING');

  const start2 = provider.findMatchingCommand('Meeting shuru karo');
  assert(!!start2 && start2.action === 'START_RECORDING', 'Meeting shuru karo → START');

  const start3 = provider.findMatchingCommand('Start recording');
  assert(!!start3 && start3.action === 'START_RECORDING', 'Start recording → START');

  const stop = provider.findMatchingCommand('Meeting khatam');
  assert(!!stop && stop.action === 'STOP_RECORDING', 'Meeting khatam → STOP');

  const stop2 = provider.findMatchingCommand('2Click Stop');
  assert(!!stop2 && stop2.action === 'STOP_RECORDING', '2Click Stop → STOP');

  const save = provider.findMatchingCommand('Save note');
  assert(!!save && save.action === 'SAVE_NOTE', 'Save note → SAVE_NOTE');

  const cancel = provider.findMatchingCommand('Cancel recording');
  assert(!!cancel && cancel.action === 'CANCEL_RECORDING', 'Cancel recording → CANCEL');

  console.log('command matching OK');
}

function testProcessExecutesHandlers() {
  const provider = new VoiceCommandProvider(DEFAULT_VOICE_COMMANDS, true);
  let hit = '';
  provider.registerActionHandler('START_RECORDING', () => {
    hit = 'start';
  });
  const ev = provider.processTranscript('2Click Start');
  assert(ev?.action === 'START_RECORDING', 'process returns start');
  assert(hit === 'start', 'handler fired');

  const p2 = new VoiceCommandProvider(DEFAULT_VOICE_COMMANDS, true);
  let saveHit = false;
  p2.registerActionHandler('SAVE_NOTE', () => {
    saveHit = true;
  });
  const dry2 = p2.processTranscript('Save note', { executeHandlers: false });
  assert(dry2?.action === 'SAVE_NOTE', 'dry process matches save');
  assert(!saveHit, 'dry process must not fire handlers');
  console.log('handler gating OK');
}

function testBuildMeetingNote() {
  const meeting = buildMeetingNoteFromSession({
    transcript: 'Cement delivery tomorrow 10am. Site engineer will confirm.',
    summary: '',
    durationSeconds: 42,
  });
  assert(meeting.id.startsWith('mtg-cmd-'), 'id prefix');
  assert(meeting.meetingType === 'Voice Command', 'meeting type');
  assert(Array.isArray(meeting.actionItems), 'actionItems array');
  assert(Array.isArray(meeting.keyTopics) && meeting.keyTopics.length > 0, 'keyTopics');
  assert(meeting.transcript.length >= 1, 'transcript segments');
  assert(/cement delivery/i.test(meeting.executiveSummary), 'summary from transcript');
  assert(meeting.duration === '0:42', 'duration formatting');
  console.log('buildMeetingNote OK:', meeting.title);
}

function testNormalizePartialGemini() {
  const normalized = normalizeMeetingData({
    title: 'Partial Gemini MoM',
    summary: 'Discussed inventory shortage',
  } as any);
  assert(normalized.id.length > 0, 'normalized id');
  assert(normalized.executiveSummary.includes('inventory'), 'summary mapped');
  assert(Array.isArray(normalized.actionItems), 'safe actionItems');
  assert(Array.isArray(normalized.transcript), 'safe transcript');
  assert(Array.isArray(normalized.keyTopics), 'safe keyTopics');
  console.log('normalizeMeetingData OK');
}

function testPersistDispatchesEvent() {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  const listeners: Array<(ev: any) => void> = [];
  (globalThis as any).window = {
    dispatchEvent: (ev: any) => {
      listeners.forEach((fn) => fn(ev));
      return true;
    },
    addEventListener: (_: string, fn: any) => listeners.push(fn),
  };

  let received: any = null;
  window.addEventListener(COMMAND_SESSION_NOTE_EVENT, ((ev: CustomEvent) => {
    received = ev.detail?.meeting;
  }) as any);

  const meeting = buildMeetingNoteFromSession({
    transcript: 'Warehouse gate open at 9',
    durationSeconds: 12,
  });
  persistMeetingNote(meeting);

  assert(!!received && received.id === meeting.id, 'event carries meeting');
  const saved = JSON.parse(localStorage.getItem(SAVED_MEETINGS_KEY) || '[]');
  assert(Array.isArray(saved) && saved[0]?.id === meeting.id, 'written to MoM localStorage key');
  console.log('persistMeetingNote OK');
}

async function testStopAndSaveCreatesDocumentNote() {
  const ctrl = new CommandSessionController();
  const ok = await ctrl.start();
  assert(ok, 'start returns true');
  assert(ctrl.isRecording(), 'is recording');

  ctrl.appendSpeech('Delivery truck late by 30 minutes', false);
  ctrl.appendSpeech('Delivery truck late by 30 minutes', true);
  ctrl.appendSpeech('Meeting khatam', false);

  const originalFetch = (globalThis as any).fetch;
  (globalThis as any).fetch = async () => ({
    ok: false,
    status: 503,
    json: async () => ({ error: 'unavailable' }),
  });

  try {
    const result = await ctrl.stopAndSave({ processMom: true, instantSave: true });
    assert(!!result, 'stopAndSave returns result');
    assert(!!result?.meetingId, 'meetingId present');
    assert(result!.meetingId!.startsWith('mtg-cmd-'), 'local meeting id');
    assert(/delivery truck/i.test(result!.redactedTranscript), 'transcript kept');
    assert(!/meeting khatam/i.test(result!.redactedTranscript), 'stop phrase redacted');

    const saved = JSON.parse(localStorage.getItem(SAVED_MEETINGS_KEY) || '[]');
    assert(saved[0]?.id === result!.meetingId, 'MoM document list updated');
    assert(!!saved[0]?.executiveSummary, 'document has summary');
    console.log('stopAndSave → MoM document OK:', saved[0].title);
  } finally {
    (globalThis as any).fetch = originalFetch;
    ctrl.destroy();
  }
}

async function main() {
  testRedaction();
  testCommandMatching();
  testProcessExecutesHandlers();
  testBuildMeetingNote();
  testNormalizePartialGemini();
  testPersistDispatchesEvent();
  await testStopAndSaveCreatesDocumentNote();
  console.log('ALL command-session smoke tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
