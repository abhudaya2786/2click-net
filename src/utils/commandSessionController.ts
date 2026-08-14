/**
 * Command-based record / transcribe / Instant Save session.
 * Starts only on voice triggers; stop → Gemini + DB save; cancel → discard.
 */

import { redactCommandTriggers, collectCommandAliasPhrases } from './wakeWordRedaction';

export type CommandSessionStatus =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'saved'
  | 'cancelled'
  | 'error';

export interface CommandSessionSnapshot {
  status: CommandSessionStatus;
  startedAt: string | null;
  durationSeconds: number;
  rawTranscript: string;
  redactedTranscript: string;
  lastError?: string;
  lastSavedId?: string;
  lastMomSummary?: string;
}

export interface CommandSessionSaveResult {
  conversationId?: string;
  meetingId?: string;
  redactedTranscript: string;
  momSummary?: string;
  persistence?: string;
}

type StatusListener = (snap: CommandSessionSnapshot) => void;

const DEMO_USER_KEY = 'voice_mom_command_session_user_id';

function ensureDemoUserId(): string {
  try {
    let id = localStorage.getItem(DEMO_USER_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(DEMO_USER_KEY, id);
    }
    return id;
  } catch {
    return '00000000-0000-4000-8000-000000000001';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = String(reader.result || '');
      const comma = res.indexOf(',');
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export class CommandSessionController {
  private status: CommandSessionStatus = 'idle';
  private startedAtMs: number | null = null;
  private transcriptParts: string[] = [];
  private chunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private mimeType = 'audio/webm';
  private lastError?: string;
  private lastSavedId?: string;
  private lastMomSummary?: string;
  private listeners = new Set<StatusListener>();
  private extraPhrases: string[] = [];
  private saveUrl = '';
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  private durationSeconds = 0;

  public onChange(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  public snapshot(): CommandSessionSnapshot {
    const raw = this.transcriptParts.join(' ').trim();
    return {
      status: this.status,
      startedAt: this.startedAtMs ? new Date(this.startedAtMs).toISOString() : null,
      durationSeconds: this.durationSeconds,
      rawTranscript: raw,
      redactedTranscript: redactCommandTriggers(raw, this.extraPhrases),
      lastError: this.lastError,
      lastSavedId: this.lastSavedId,
      lastMomSummary: this.lastMomSummary,
    };
  }

  public getStatus(): CommandSessionStatus {
    return this.status;
  }

  public isRecording(): boolean {
    return this.status === 'recording';
  }

  public setCommandPhrases(commands: Array<{ phrase: string; aliases?: string[] }>) {
    this.extraPhrases = collectCommandAliasPhrases(commands);
  }

  public setSaveUrl(url: string) {
    this.saveUrl = (url || '').trim();
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  private setStatus(next: CommandSessionStatus) {
    this.status = next;
    this.emit();
  }

  /** Append spoken text while session is active (triggers are redacted later). */
  public appendSpeech(text: string, isFinal: boolean) {
    if (this.status !== 'recording' || !text?.trim()) return;
    if (!isFinal) {
      this.emit();
      return;
    }
    const cleaned = text.trim();
    if (!cleaned) return;
    const last = this.transcriptParts[this.transcriptParts.length - 1];
    if (last && last === cleaned) return;
    this.transcriptParts.push(cleaned);
    this.emit();
  }

  public async start(): Promise<boolean> {
    if (this.status === 'recording' || this.status === 'processing') {
      return false;
    }
    // Lock immediately so sibling handlers (e.g. Meeting Studio) skip duplicate mic capture
    this.status = 'recording';
    this.emit();

    this.lastError = undefined;
    this.lastSavedId = undefined;
    this.lastMomSummary = undefined;
    this.transcriptParts = [];
    this.chunks = [];
    this.durationSeconds = 0;
    this.startedAtMs = Date.now();

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
        this.mimeType =
          preferred.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ||
          'audio/webm';
        this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: this.mimeType });
        this.mediaRecorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) this.chunks.push(ev.data);
        };
        this.mediaRecorder.start(1000);
      }
    } catch (e: any) {
      // Still allow transcript-only session via Web Speech interim stream
      this.lastError = e?.message || 'Microphone unavailable — transcript-only session';
    }

    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = setInterval(() => {
      if (this.startedAtMs) {
        this.durationSeconds = Math.floor((Date.now() - this.startedAtMs) / 1000);
        this.emit();
      }
    }, 1000);

    this.emit();
    return true;
  }

  public async cancel(): Promise<void> {
    await this.teardownRecorder();
    this.chunks = [];
    this.transcriptParts = [];
    this.startedAtMs = null;
    this.durationSeconds = 0;
    this.lastError = undefined;
    this.setStatus('cancelled');
    // Return to idle shortly so UI can flash "cancelled"
    setTimeout(() => {
      if (this.status === 'cancelled') this.setStatus('idle');
    }, 1800);
  }

  public async stopAndSave(opts?: {
    processMom?: boolean;
    instantSave?: boolean;
  }): Promise<CommandSessionSaveResult | null> {
    if (this.status !== 'recording') {
      return null;
    }

    const processMom = opts?.processMom !== false;
    const instantSave = opts?.instantSave !== false;

    this.setStatus('processing');
    await this.teardownRecorder();

    const raw = this.transcriptParts.join(' ').trim();
    const redacted = redactCommandTriggers(raw, this.extraPhrases);
    let audioBase64 = '';
    let audioBlob: Blob | null = null;
    if (this.chunks.length > 0) {
      audioBlob = new Blob(this.chunks, { type: this.mimeType });
      try {
        audioBase64 = await blobToBase64(audioBlob);
      } catch {
        /* ignore */
      }
    }

    try {
      let momSummary = '';
      let meetingId: string | undefined;

      if (processMom && (redacted || audioBase64)) {
        // Gemini MoM is optional — Instant Save still runs if generate-mom is unavailable (503)
        try {
          const momRes = await fetch('/api/generate-mom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: audioBase64 || undefined,
              mimeType: this.mimeType,
              transcriptText: redacted || undefined,
              context: {
                title: 'Command Session Note',
                meetingType: 'Voice Command',
                duration: `${Math.floor(this.durationSeconds / 60)}:${String(this.durationSeconds % 60).padStart(2, '0')}`,
              },
            }),
          });
          const momData = await momRes.json().catch(() => ({}));
          if (momRes.ok && momData?.meeting) {
            const meeting = momData.meeting;
            // Redact triggers from generated MoM fields
            if (typeof meeting.summary === 'string') {
              meeting.summary = redactCommandTriggers(meeting.summary, this.extraPhrases);
            }
            if (typeof meeting.transcript === 'string') {
              meeting.transcript = redactCommandTriggers(meeting.transcript, this.extraPhrases);
            }
            if (Array.isArray(meeting.discussions)) {
              meeting.discussions = meeting.discussions.map((d: string) =>
                redactCommandTriggers(String(d), this.extraPhrases),
              );
            }
            momSummary = meeting.summary || '';
            meetingId = meeting.id;
            try {
              const key = 'voice_mom_saved_meetings_v1';
              const prev = JSON.parse(localStorage.getItem(key) || '[]');
              const list = Array.isArray(prev) ? prev : [];
              localStorage.setItem(key, JSON.stringify([meeting, ...list.filter((m: any) => m.id !== meeting.id)]));
            } catch {
              /* ignore */
            }
          } else if (!redacted && !audioBase64) {
            throw new Error(momData?.error || 'Empty session — nothing to save');
          }
        } catch (momErr: any) {
          // No API key / network — fall through to Instant Save with transcript only
          if (!redacted && !audioBase64) {
            throw momErr;
          }
          momSummary = redacted.slice(0, 240);
        }
      }

      let conversationId: string | undefined;
      let persistence: string | undefined;

      if (instantSave && (redacted || audioBase64)) {
        const userId = ensureDemoUserId();
        const endpoint = this.saveUrl || '/api/v1/conversations';
        // Prefer hinglish Instant Save when URL configured; also try relative proxy
        try {
          const saveRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              raw_text: redacted || undefined,
              audio_base64: !redacted && audioBase64 ? audioBase64 : undefined,
              mime_type: this.mimeType,
              type: 'voice_note',
              source: 'command_session',
              duration_seconds: this.durationSeconds,
              contact_name: 'Command Session',
            }),
          });
          if (saveRes.ok) {
            const saved = await saveRes.json();
            conversationId = saved.conversation_id || saved.id;
            persistence = saved.persistence;
            if (saved.summary) {
              momSummary = redactCommandTriggers(String(saved.summary), this.extraPhrases);
            }
          } else {
            // Fallback: local Instant Save mirror
            conversationId = await this.localInstantSave(userId, redacted, momSummary);
            persistence = 'localStorage';
          }
        } catch {
          conversationId = await this.localInstantSave(userId, redacted, momSummary);
          persistence = 'localStorage';
        }
      }

      this.lastSavedId = conversationId || meetingId;
      this.lastMomSummary = momSummary;
      this.chunks = [];
      this.transcriptParts = [];
      this.startedAtMs = null;
      this.setStatus('saved');
      setTimeout(() => {
        if (this.status === 'saved') this.setStatus('idle');
      }, 2200);

      return {
        conversationId,
        meetingId,
        redactedTranscript: redacted,
        momSummary,
        persistence,
      };
    } catch (e: any) {
      this.lastError = e?.message || 'Save failed';
      this.setStatus('error');
      setTimeout(() => {
        if (this.status === 'error') this.setStatus('idle');
      }, 3000);
      return null;
    }
  }

  private async localInstantSave(userId: string, transcript: string, summary: string): Promise<string> {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `conv-${Date.now()}`;
    const row = {
      id,
      user_id: userId,
      type: 'voice_note',
      raw_transcript: transcript,
      summary: summary || transcript.slice(0, 200),
      created_at: new Date().toISOString(),
      source: 'command_session',
    };
    try {
      const key = 'voice_mom_instant_saves_v1';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      const list = Array.isArray(prev) ? prev : [];
      localStorage.setItem(key, JSON.stringify([row, ...list].slice(0, 200)));
    } catch {
      /* ignore */
    }
    return id;
  }

  private async teardownRecorder(): Promise<void> {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
    const recorder = this.mediaRecorder;
    this.mediaRecorder = null;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        try {
          recorder.stop();
        } catch {
          resolve();
        }
        setTimeout(resolve, 800);
      });
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
  }

  public destroy() {
    void this.teardownRecorder();
    this.listeners.clear();
    this.chunks = [];
    this.transcriptParts = [];
    this.status = 'idle';
  }
}

export const commandSessionController = new CommandSessionController();
