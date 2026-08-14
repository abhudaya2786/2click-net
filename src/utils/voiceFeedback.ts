/**
 * Subtle audio beep + vibration feedback for command triggers.
 */

export type FeedbackKind = 'start' | 'stop' | 'cancel' | 'wake' | 'command' | 'confirm';

export function playCommandFeedback(
  kind: FeedbackKind,
  opts: { audio?: boolean; haptic?: boolean } = { audio: true, haptic: true },
) {
  if (opts.haptic !== false) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const pattern =
          kind === 'start'
            ? [30, 40, 30]
            : kind === 'stop'
              ? [50]
              : kind === 'cancel'
                ? [20, 30, 20, 30, 20]
                : [25];
        navigator.vibrate(pattern);
      }
    } catch {
      /* ignore */
    }
  }

  if (opts.audio === false || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t0 = ctx.currentTime;
    if (kind === 'start') {
      osc.frequency.setValueAtTime(660, t0);
      osc.frequency.exponentialRampToValueAtTime(990, t0 + 0.12);
      gain.gain.setValueAtTime(0.09, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);
      osc.start(t0);
      osc.stop(t0 + 0.28);
    } else if (kind === 'stop') {
      osc.frequency.setValueAtTime(880, t0);
      osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.18);
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    } else if (kind === 'cancel') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t0);
      gain.gain.setValueAtTime(0.07, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      osc.start(t0);
      osc.stop(t0 + 0.22);
    } else if (kind === 'wake') {
      osc.frequency.setValueAtTime(587.33, t0);
      osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.15);
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    } else {
      osc.frequency.setValueAtTime(523.25, t0);
      osc.frequency.exponentialRampToValueAtTime(659.25, t0 + 0.1);
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    }

    // Close quietly later
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        /* ignore */
      }
    }, 600);
  } catch {
    /* autoplay / policy */
  }
}
