import React from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2, Check, X, HardDrive, RefreshCw } from 'lucide-react';
import { PrivacySettings } from '../types';

interface PrivacyShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrivacySettings;
  onUpdateSettings: (newSettings: PrivacySettings) => void;
  onClearAllLocalData: () => void;
}

export const PrivacyShieldModal: React.FC<PrivacyShieldModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllLocalData,
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof PrivacySettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Privacy & Data Security
                <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Protected
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Zero-retention audio buffer, PII masking, and local browser isolation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Controls */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
          {/* Privacy Level Status Card */}
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Strict Confidentiality Guarantee
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Your audio streams and meeting transcripts are processed statelessly in-memory via Google Gemini 3.7. No audio files are permanently archived on external servers, and all your saved meeting minutes stay directly within your local browser.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Privacy Controls
            </h4>

            {/* PII Redaction */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
              <div className="pr-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Auto PII & Secret Redaction
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically masks emails, phone numbers, and keys with tags like <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">[REDACTED_EMAIL]</code>.
                </p>
              </div>
              <button
                onClick={() => handleToggle('enablePiiRedaction')}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer flex-shrink-0 touch-manipulation ${
                  settings.enablePiiRedaction ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-xs"></span>
              </button>
            </div>

            {/* Audio Buffer Purge */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
              <div className="pr-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Immediate Audio Buffer Purge
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Disposes of raw voice recordings in browser RAM immediately after the Minutes of Meeting are synthesized.
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoPurgeAudioBuffer')}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer flex-shrink-0 touch-manipulation ${
                  settings.autoPurgeAudioBuffer ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-xs"></span>
              </button>
            </div>

            {/* Anonymize Speakers */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
              <div className="pr-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Speaker Name Anonymizer
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Replaces participant names in transcripts and action items with generic identifiers ("Speaker 1", "Speaker 2").
                </p>
              </div>
              <button
                onClick={() => handleToggle('anonymizeSpeakers')}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer flex-shrink-0 touch-manipulation ${
                  settings.anonymizeSpeakers ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-xs"></span>
              </button>
            </div>

            {/* Ephemeral Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
              <div className="pr-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Incognito Ephemeral Mode
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Prevents newly generated meetings from being saved in browser storage. Once closed or refreshed, data is wiped.
                </p>
              </div>
              <button
                onClick={() => handleToggle('ephemeralMode')}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer flex-shrink-0 touch-manipulation ${
                  settings.ephemeralMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow-xs"></span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Wipe all local history */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-rose-800 dark:text-rose-300">
                Purge All Local Meeting History
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Irreversibly delete all saved minutes, action items, and cache from this browser.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all saved meeting minutes and history from this device?')) {
                  onClearAllLocalData();
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition cursor-pointer flex-shrink-0 min-h-[38px] touch-manipulation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition cursor-pointer min-h-[40px] touch-manipulation"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
