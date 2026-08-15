import React, { useEffect, useState } from 'react';
import { Mic, ShieldAlert, X } from 'lucide-react';
import { recordingService, type RecordingSnapshot } from '../../utils/recordingService';

/**
 * Transparent recording consent + live recording indicator.
 * Never starts the mic — only records user acknowledgement.
 */
export const RecordingConsentBanner: React.FC<{
  onConsentGranted?: () => void;
}> = ({ onConsentGranted }) => {
  const [snap, setSnap] = useState<RecordingSnapshot>(() => recordingService.snapshot());

  useEffect(() => recordingService.subscribe(setSnap), []);

  const showConsent = snap.state === 'CONSENT_REQUIRED' || (!snap.consentGrantedAt && snap.state === 'READY');
  const showLive = snap.state === 'RECORDING' || snap.state === 'PAUSED';

  if (!showConsent && !showLive) return null;

  if (showLive) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-[calc(var(--app-header-h)+0.5rem)] left-1/2 -translate-x-1/2 z-[60] px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        {snap.state === 'PAUSED' ? 'RECORDING PAUSED' : 'RECORDING ACTIVE'}
        <span className="font-mono opacity-90">
          {formatMs(snap.durationMs)}
        </span>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recording-consent-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-950/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="recording-consent-title" className="text-base font-extrabold text-slate-900 dark:text-white">
              Recording notice
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This meeting will be recorded and transcribed by AI. Participants should be informed.
              Audio stays on this device unless you choose to upload for transcription.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss recording notice"
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => recordingService.reset()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="btn-hs flex-1"
            onClick={() => {
              recordingService.grantConsent();
              onConsentGranted?.();
            }}
          >
            <Mic className="w-4 h-4" aria-hidden />
            Continue
          </button>
          <button
            type="button"
            className="btn-hs-secondary flex-1"
            onClick={() => recordingService.reset()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
