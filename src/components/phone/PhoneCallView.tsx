import React from 'react';
import { Phone, ShieldAlert, Info } from 'lucide-react';

/**
 * Phone Call module — honestly documents platform limits.
 * Does NOT claim universal call recording or bypass OS restrictions.
 */
export const PhoneCallView: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const isNative =
    typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-hs-700">
          <Phone className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Phone Call module</h1>
          <p className="text-sm text-slate-500">Consent-first · OS-dependent</p>
        </div>
      </div>

      <div
        role="status"
        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex gap-3"
      >
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <div className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
          <strong>Phone call recording is not supported on this device/platform</strong> for arbitrary
          cellular or VoIP calls. Browser and standard Android apps cannot bypass OS call-audio
          restrictions. We will never implement covert call capture.
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p className="flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-hs-600" aria-hidden />
          Environment detected: {isNative ? 'Capacitor native shell' : 'Web browser'}
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>In-app microphone meetings remain available with consent.</li>
          <li>Field talk and MoM recording use the device mic while the app is open.</li>
          <li>Future native wake-word / call support requires OS APIs and explicit user permission.</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="btn-hs" onClick={() => onNavigate('/mom')}>
          Open Voice MoM
        </button>
        <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/meetings/new')}>
          New meeting
        </button>
        <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/settings/privacy')}>
          Privacy settings
        </button>
      </div>
    </div>
  );
};
