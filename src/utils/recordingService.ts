/**
 * Canonical recording state machine facade.
 * Wraps MediaRecorder ownership so MoM / studio / field / command paths
 * can share IDLE→RECORDING→PROCESSING semantics without hidden capture.
 */
export type RecordingState =
  | 'IDLE'
  | 'READY'
  | 'CONSENT_REQUIRED'
  | 'RECORDING'
  | 'PAUSED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'ERROR';

export type RecordingOwner = 'none' | 'mom' | 'studio' | 'field' | 'command' | 'phone';

type Listener = (snapshot: RecordingSnapshot) => void;

export interface RecordingSnapshot {
  state: RecordingState;
  owner: RecordingOwner;
  startedAt: number | null;
  durationMs: number;
  error: string | null;
  consentGrantedAt: string | null;
}

const CONSENT_KEY = 'voice_mom_recording_consent_v1';

class RecordingServiceImpl {
  private state: RecordingState = 'IDLE';
  private owner: RecordingOwner = 'none';
  private startedAt: number | null = null;
  private pausedAccumMs = 0;
  private pauseStartedAt: number | null = null;
  private error: string | null = null;
  private consentGrantedAt: string | null = null;
  private listeners = new Set<Listener>();
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.consentGrantedAt = parsed?.at || null;
      }
    } catch {
      /* ignore */
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => this.listeners.delete(fn);
  }

  snapshot(): RecordingSnapshot {
    return {
      state: this.state,
      owner: this.owner,
      startedAt: this.startedAt,
      durationMs: this.elapsedMs(),
      error: this.error,
      consentGrantedAt: this.consentGrantedAt,
    };
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  private elapsedMs() {
    if (!this.startedAt) return this.pausedAccumMs;
    if (this.state === 'PAUSED' && this.pauseStartedAt) {
      return this.pausedAccumMs + (this.pauseStartedAt - this.startedAt);
    }
    if (this.state === 'RECORDING' || this.state === 'PROCESSING') {
      return this.pausedAccumMs + (Date.now() - this.startedAt);
    }
    return this.pausedAccumMs;
  }

  hasConsent(): boolean {
    return Boolean(this.consentGrantedAt);
  }

  grantConsent() {
    this.consentGrantedAt = new Date().toISOString();
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ at: this.consentGrantedAt }));
    } catch {
      /* ignore */
    }
    if (this.state === 'CONSENT_REQUIRED') {
      this.state = 'READY';
    }
    this.emit();
  }

  revokeConsent() {
    this.consentGrantedAt = null;
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  /** Request start — returns whether mic may open now. Never auto-opens mic. */
  requestStart(owner: RecordingOwner): { ok: boolean; reason?: string } {
    if (this.owner !== 'none' && this.owner !== owner && this.state === 'RECORDING') {
      return { ok: false, reason: `Microphone already in use by ${this.owner}` };
    }
    if (!this.hasConsent()) {
      this.state = 'CONSENT_REQUIRED';
      this.owner = owner;
      this.emit();
      return { ok: false, reason: 'CONSENT_REQUIRED' };
    }
    return { ok: true };
  }

  markReady(owner: RecordingOwner = 'none') {
    if (this.state === 'RECORDING' || this.state === 'PAUSED') return;
    this.state = this.hasConsent() ? 'READY' : 'CONSENT_REQUIRED';
    this.owner = owner;
    this.error = null;
    this.emit();
  }

  begin(owner: RecordingOwner) {
    const gate = this.requestStart(owner);
    if (!gate.ok) {
      throw new Error(gate.reason || 'Cannot start recording');
    }
    this.owner = owner;
    this.state = 'RECORDING';
    this.startedAt = Date.now();
    this.pausedAccumMs = 0;
    this.pauseStartedAt = null;
    this.error = null;
    this.startTick();
    this.emit();
  }

  pause() {
    if (this.state !== 'RECORDING') return;
    this.state = 'PAUSED';
    this.pauseStartedAt = Date.now();
    this.emit();
  }

  resume() {
    if (this.state !== 'PAUSED' || !this.pauseStartedAt || !this.startedAt) return;
    this.pausedAccumMs += this.pauseStartedAt - this.startedAt;
    this.startedAt = Date.now();
    this.pauseStartedAt = null;
    this.state = 'RECORDING';
    this.emit();
  }

  markProcessing() {
    this.state = 'PROCESSING';
    this.stopTick();
    this.emit();
  }

  complete() {
    this.state = 'COMPLETED';
    this.stopTick();
    this.emit();
    // Return to idle after brief completed signal
    setTimeout(() => {
      if (this.state === 'COMPLETED') this.reset();
    }, 800);
  }

  fail(message: string) {
    this.state = 'ERROR';
    this.error = message;
    this.stopTick();
    this.emit();
  }

  reset() {
    this.state = 'IDLE';
    this.owner = 'none';
    this.startedAt = null;
    this.pausedAccumMs = 0;
    this.pauseStartedAt = null;
    this.error = null;
    this.stopTick();
    this.emit();
  }

  isBusy(): boolean {
    return this.state === 'RECORDING' || this.state === 'PAUSED' || this.state === 'PROCESSING';
  }

  private startTick() {
    this.stopTick();
    this.tickTimer = setInterval(() => this.emit(), 500);
  }

  private stopTick() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }
}

export const recordingService = new RecordingServiceImpl();
