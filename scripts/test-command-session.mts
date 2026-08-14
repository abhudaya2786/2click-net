/**
 * Smoke tests: wake-word redaction + voice command matching for command sessions.
 */
import { redactCommandTriggers } from '../src/utils/wakeWordRedaction.ts';
import { VoiceCommandProvider } from '../src/utils/voiceCommandProvider.ts';
import { DEFAULT_VOICE_COMMANDS } from '../src/utils/voiceDefaults.ts';

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

  const dry = provider.processTranscript('Save note', { executeHandlers: false });
  // cooldown may block — wait by manually resetting via second provider
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

testRedaction();
testCommandMatching();
testProcessExecutesHandlers();
console.log('ALL command-session smoke tests passed');
