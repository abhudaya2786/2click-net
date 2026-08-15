import {
  WakeWordItem,
  WakeWordDetectionEvent,
  VoiceListeningStatus,
  VoiceLanguageMode,
} from '../types';

export type WakeWordListener = (event: WakeWordDetectionEvent) => void;
export type StatusChangeListener = (status: VoiceListeningStatus, error?: string) => void;
export type SpeechInterimListener = (
  transcript: string,
  isFinal: boolean,
  alternatives?: string[],
) => void;

/**
 * Text normalizer for multi-lingual Hindi, Hinglish, and English voice matching.
 * Also canonicalizes common Chrome STT mishears of the "2Click" brand.
 */
export function normalizeVoiceText(text: string): string {
  if (!text) return '';
  let out = text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, '') // remove punctuation including Devanagari danda
    .replace(/\s+/g, ' ');

  // "to/too/two/tu click" and "toclick" → "2click" so brand commands match reliably
  out = out
    .replace(/\b(to|too|two|tu|doo|do)\s*click\b/g, '2click')
    .replace(/\btoclick\b/g, '2click')
    .replace(/\b2\s*click\b/g, '2click');

  return out;
}

export class WakeWordProvider {
  private wakeWords: WakeWordItem[] = [];
  private isEnabled: boolean = true;
  private languageMode: VoiceLanguageMode = 'auto';
  private status: VoiceListeningStatus = 'idle';
  private recognition: any | null = null;
  private isListening: boolean = false;
  private shouldRestart: boolean = false;
  private lastTriggerTime: number = 0;
  private triggerCooldownMs: number = 2000; // 2 seconds between triggers

  private detectionListeners: Set<WakeWordListener> = new Set();
  private statusListeners: Set<StatusChangeListener> = new Set();
  private interimListeners: Set<SpeechInterimListener> = new Set();

  constructor(initialWakeWords: WakeWordItem[] = [], enabled: boolean = true) {
    this.wakeWords = [...initialWakeWords];
    this.isEnabled = enabled;
  }

  // -------------------------------------------------------------
  // Config & State Management
  // -------------------------------------------------------------

  public setWakeWords(words: WakeWordItem[]) {
    this.wakeWords = [...words];
  }

  public getWakeWords(): WakeWordItem[] {
    return [...this.wakeWords];
  }

  public addWakeWord(word: Omit<WakeWordItem, 'id' | 'detectedCount'>): WakeWordItem {
    const newItem: WakeWordItem = {
      id: `ww-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      detectedCount: 0,
      ...word,
    };
    this.wakeWords.push(newItem);
    return newItem;
  }

  public updateWakeWord(id: string, updates: Partial<WakeWordItem>): boolean {
    const index = this.wakeWords.findIndex((w) => w.id === id);
    if (index === -1) return false;
    this.wakeWords[index] = { ...this.wakeWords[index], ...updates };
    return true;
  }

  public deleteWakeWord(id: string): boolean {
    const initialLen = this.wakeWords.length;
    this.wakeWords = this.wakeWords.filter((w) => w.id !== id);
    return this.wakeWords.length < initialLen;
  }

  public toggleWakeWord(id: string, enabled?: boolean): boolean {
    const item = this.wakeWords.find((w) => w.id === id);
    if (!item) return false;
    item.enabled = enabled !== undefined ? enabled : !item.enabled;
    return true;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.isListening) {
      this.stopListening();
    }
  }

  public getStatus(): VoiceListeningStatus {
    return this.status;
  }

  public setLanguageMode(mode: VoiceLanguageMode) {
    this.languageMode = mode;
    if (this.isListening) {
      // restart with new language
      this.restart();
    }
  }

  // -------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------

  public onDetection(listener: WakeWordListener): () => void {
    this.detectionListeners.add(listener);
    return () => this.detectionListeners.delete(listener);
  }

  public onStatusChange(listener: StatusChangeListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public onInterimSpeech(listener: SpeechInterimListener): () => void {
    this.interimListeners.add(listener);
    return () => this.interimListeners.delete(listener);
  }

  private updateStatus(newStatus: VoiceListeningStatus, error?: string) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus, error));
  }

  // -------------------------------------------------------------
  // Detection Engine
  // -------------------------------------------------------------

  public checkTextForWakeWord(rawText: string): WakeWordDetectionEvent | null {
    if (!this.isEnabled) return null;
    const normalized = normalizeVoiceText(rawText);
    if (!normalized) return null;

    const now = Date.now();
    if (now - this.lastTriggerTime < this.triggerCooldownMs) {
      return null;
    }

    for (const item of this.wakeWords) {
      if (!item.enabled) continue;

      const candidates = [
        normalizeVoiceText(item.word),
        ...(item.aliases || []).map(normalizeVoiceText),
      ].filter(Boolean);

      for (const candidate of candidates) {
        if (!candidate) continue;

        // Match checks:
        // 1. Exact match
        // 2. Starts with / Ends with
        // 3. Substring word boundary
        const isMatch =
          normalized === candidate ||
          normalized.startsWith(`${candidate} `) ||
          normalized.endsWith(` ${candidate}`) ||
          normalized.includes(` ${candidate} `) ||
          // For single-word Hindi greetings like 'namaskar'
          (candidate.length >= 4 && normalized.includes(candidate));

        if (isMatch) {
          this.lastTriggerTime = now;
          item.detectedCount = (item.detectedCount || 0) + 1;
          item.lastDetectedAt = new Date().toISOString();

          const event: WakeWordDetectionEvent = {
            wakeWord: item,
            rawTranscript: rawText,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
          };

          return event;
        }
      }
    }

    return null;
  }

  // -------------------------------------------------------------
  // Speech Recognition Lifecycle (Safe Browser Foreground Only)
  // -------------------------------------------------------------

  public isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public async startListening(opts?: { skipMicPrime?: boolean }): Promise<boolean> {
    if (!this.isSupported()) {
      this.updateStatus('unsupported', 'Web Speech API is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      // Prime mic permission first — improves Chrome/Android SpeechRecognition reliability.
      // Skip when a MediaRecorder session already owns the mic.
      if (
        !opts?.skipMicPrime &&
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices?.getUserMedia
      ) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
        } catch (permErr: any) {
          this.updateStatus(
            'permission_needed',
            permErr?.name === 'NotAllowedError'
              ? 'Microphone permission denied — Settings → allow mic, then tap again.'
              : permErr?.message || 'Microphone permission required for voice commands.',
          );
          return false;
        }
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();

      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;

      // Select locale based on language mode
      if (this.languageMode === 'hi-IN') {
        rec.lang = 'hi-IN';
      } else if (this.languageMode === 'en-IN') {
        rec.lang = 'en-IN';
      } else if (this.languageMode === 'en-US') {
        rec.lang = 'en-US';
      } else {
        // Auto / Hinglish: en-IN or hi-IN provides great dual-script capture
        rec.lang = navigator.language.includes('hi') ? 'hi-IN' : 'en-IN';
      }

      rec.onstart = () => {
        this.isListening = true;
        this.shouldRestart = true;
        this.updateStatus('listening');
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        const alternativeTexts: string[] = [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          // Prefer primary transcript for display, but keep alternatives for matching
          const primary = String(res[0]?.transcript || '');
          if (res.isFinal) {
            finalTranscript += primary + ' ';
          } else {
            interimTranscript += primary + ' ';
          }
          const altCount = typeof res.length === 'number' ? res.length : 1;
          for (let a = 0; a < altCount; a++) {
            const t = String(res[a]?.transcript || '').trim();
            if (t) alternativeTexts.push(t);
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          const uniqueAlts = Array.from(
            new Set(alternativeTexts.map((t) => t.trim()).filter(Boolean)),
          );
          this.interimListeners.forEach((fn) =>
            fn(combined, Boolean(finalTranscript), uniqueAlts),
          );

          // Check wake word spotting against primary + STT alternatives
          const textsToCheck = [combined, ...uniqueAlts];
          let detected: WakeWordDetectionEvent | null = null;
          for (const t of textsToCheck) {
            detected = this.checkTextForWakeWord(t);
            if (detected) break;
          }
          if (detected) {
            this.updateStatus('detected');
            this.detectionListeners.forEach((fn) => fn(detected!));
            
            // Brief visual state before returning to listening
            setTimeout(() => {
              if (this.isListening) {
                this.updateStatus('listening');
              }
            }, 1800);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.warn('WakeWord speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.shouldRestart = false;
          this.isListening = false;
          this.updateStatus('permission_needed', 'Microphone / speech permission was denied.');
        } else if (event.error === 'no-speech') {
          // Normal timeout when no speech is detected - continue running if desired
        } else if (event.error === 'network') {
          this.updateStatus(
            'error',
            'Speech network error — Chrome speech service unreachable. Use Start/Stop buttons or try again on Wi‑Fi.',
          );
        } else if (event.error !== 'aborted') {
          this.updateStatus('error', `Speech error: ${event.error}`);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        // Automatic safe restart if enabled and in active window session
        if (this.shouldRestart && this.isEnabled && typeof document !== 'undefined' && !document.hidden) {
          try {
            rec.start();
          } catch (e) {
            // Safe fallback
            setTimeout(() => {
              if (this.shouldRestart && this.isEnabled) {
                try {
                  rec.start();
                } catch {}
              }
            }, 500);
          }
        } else {
          this.updateStatus('idle');
        }
      };

      this.recognition = rec;
      rec.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start wake word listener:', err);
      this.updateStatus('error', err.message || 'Microphone start failure');
      return false;
    }
  }

  public stopListening() {
    this.shouldRestart = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
    this.updateStatus('idle');
  }

  public restart() {
    this.stopListening();
    setTimeout(() => {
      if (this.isEnabled) {
        this.startListening();
      }
    }, 250);
  }

  public destroy() {
    this.stopListening();
    this.detectionListeners.clear();
    this.statusListeners.clear();
    this.interimListeners.clear();
  }
}
