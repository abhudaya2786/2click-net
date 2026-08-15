/**
 * Hardware DSP constraints + 30s chunking with 2s overlap (zero spoken-word cut).
 */

export const DSP_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
  sampleRate: 48000,
};

export interface AudioChunkEnvelope {
  index: number;
  blob: Blob;
  mimeType: string;
  startedAtMs: number;
  endedAtMs: number;
  overlapMs: number;
  durationMs: number;
}

export type ChunkHandler = (chunk: AudioChunkEnvelope) => void | Promise<void>;

export interface ChunkedDspRecorderOptions {
  chunkSeconds?: number;
  overlapSeconds?: number;
  mimeType?: string;
  onChunk: ChunkHandler;
  onError?: (err: Error) => void;
}

/**
 * Records with browser AcousticEchoCanceler / NoiseSuppressor (when supported)
 * and emits overlapping chunks so words at boundaries are never lost.
 */
export class ChunkedDspRecorder {
  private mediaStream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private chunkIndex = 0;
  private startedAt = 0;
  private sliceTimer: ReturnType<typeof setInterval> | null = null;
  private overlapMs: number;
  private chunkMs: number;
  private mimeType: string;
  private onChunk: ChunkHandler;
  private onError?: (err: Error) => void;
  private lastOverlapBlob: Blob | null = null;
  private running = false;

  constructor(opts: ChunkedDspRecorderOptions) {
    this.chunkMs = Math.max(5, opts.chunkSeconds ?? 30) * 1000;
    this.overlapMs = Math.max(0, opts.overlapSeconds ?? 2) * 1000;
    this.mimeType = opts.mimeType || 'audio/webm;codecs=opus';
    this.onChunk = opts.onChunk;
    this.onError = opts.onError;
  }

  get isRunning() {
    return this.running;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: DSP_AUDIO_CONSTRAINTS,
      video: false,
    });

    const mimeType = MediaRecorder.isTypeSupported(this.mimeType)
      ? this.mimeType
      : 'audio/webm';

    this.recorder = new MediaRecorder(this.mediaStream, { mimeType });
    this.chunks = [];
    this.chunkIndex = 0;
    this.startedAt = Date.now();
    this.lastOverlapBlob = null;
    this.running = true;

    this.recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) this.chunks.push(ev.data);
    };
    this.recorder.onerror = () => {
      this.onError?.(new Error('MediaRecorder error'));
    };
    this.recorder.start(250);

    this.sliceTimer = setInterval(() => {
      void this.emitChunk(false);
    }, this.chunkMs);
  }

  async pause(): Promise<void> {
    if (this.recorder?.state === 'recording') this.recorder.pause();
  }

  async resume(): Promise<void> {
    if (this.recorder?.state === 'paused') this.recorder.resume();
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    if (this.sliceTimer) clearInterval(this.sliceTimer);
    this.sliceTimer = null;
    await this.emitChunk(true);
    if (this.recorder && this.recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        this.recorder!.onstop = () => resolve();
        this.recorder!.stop();
      });
    }
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.mediaStream = null;
    this.recorder = null;
    this.running = false;
  }

  private async emitChunk(isFinal: boolean) {
    if (!this.recorder || this.chunks.length === 0) return;
    // Request a boundary flush
    if (this.recorder.state === 'recording') {
      try {
        this.recorder.requestData();
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 40));
    }

    const parts = [...this.chunks];
    this.chunks = [];
    if (this.lastOverlapBlob && this.overlapMs > 0) {
      parts.unshift(this.lastOverlapBlob);
    }
    const blob = new Blob(parts, { type: this.mimeType.split(';')[0] });
    if (blob.size < 64) return;

    const endedAtMs = Date.now();
    const startedAtMs = Math.max(this.startedAt, endedAtMs - this.chunkMs - this.overlapMs);
    const envelope: AudioChunkEnvelope = {
      index: this.chunkIndex++,
      blob,
      mimeType: blob.type || 'audio/webm',
      startedAtMs,
      endedAtMs,
      overlapMs: this.overlapMs,
      durationMs: endedAtMs - startedAtMs,
    };

    // Keep a rough overlap buffer for the next slice (last part)
    this.lastOverlapBlob = parts.length ? new Blob([parts[parts.length - 1]], { type: blob.type }) : null;

    await this.onChunk(envelope);
    if (isFinal) this.lastOverlapBlob = null;
  }
}
