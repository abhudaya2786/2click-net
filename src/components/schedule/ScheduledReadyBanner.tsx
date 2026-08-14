import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mic,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Settings,
  AlertTriangle,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { format24To12Hour, formatWorkingDaysSummary } from '../../utils/timezoneHelper';

interface ScheduledReadyBannerProps {
  onNavigate?: (path: string) => void;
}

export const ScheduledReadyBanner: React.FC<ScheduledReadyBannerProps> = ({ onNavigate }) => {
  const {
    isReadyStateActive,
    activeSchedule,
    scheduleStatus,
    isReadyBannerDismissed,
    dismissReadyBanner,
  } = useSchedule();

  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  if (!isReadyStateActive || isReadyBannerDismissed || !activeSchedule) {
    return null;
  }

  const daysSummary = formatWorkingDaysSummary(activeSchedule.workingDays);
  const timeSummary = `${format24To12Hour(activeSchedule.startTime)} - ${format24To12Hour(activeSchedule.endTime)}`;

  const handleStartRecordingConsent = () => {
    setShowConsentModal(true);
  };

  const handleConfirmStart = () => {
    setShowConsentModal(false);
    // Navigate to new meeting or existing ready meeting
    if (onNavigate) {
      onNavigate('/meetings/new');
    }
  };

  return (
    <>
      {/* Floating Ready Notification Bar */}
      <aside
        aria-label="Meeting recording readiness notification"
        className="relative border-b border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50/80 dark:from-indigo-950/70 dark:via-slate-900/80 dark:to-indigo-950/70 px-4 py-3 text-slate-800 dark:text-slate-200 shadow-sm transition-all duration-300 z-30"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left: State Badge & Message */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow-2xs shrink-0 tracking-wide uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-200" />
              READY
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Meeting recording is ready.
                </span>
                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium hidden sm:inline-flex items-center gap-1 bg-indigo-100/70 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3" />
                  {daysSummary} ({timeSummary})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                Current Time: <span className="font-medium text-slate-700 dark:text-slate-300">{scheduleStatus.currentTimeInTz}</span> ({scheduleStatus.timezone}) • {scheduleStatus.timeRemainingText}
              </p>
            </div>
          </div>

          {/* Right: Actions & Privacy Pill */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mic Inactive (Consent Required)</span>
            </div>

            <button
              id="scheduled-start-recording-btn"
              onClick={handleStartRecordingConsent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Recording</span>
            </button>

            <button
              id="scheduled-settings-btn"
              onClick={() => onNavigate?.('/settings/schedule')}
              title="Schedule Settings"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-indigo-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              id="scheduled-dismiss-btn"
              onClick={dismissReadyBanner}
              title="Dismiss for now"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-indigo-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Explicit Consent Dialog Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Explicit Recording Notice & Consent
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schedule Triggered • READY State
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block text-sm">
                    Meeting recording is ready.
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                    Your scheduled window ({daysSummary}, {timeSummary}) is active. In accordance with privacy safeguards, the microphone was NOT automatically turned on.
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Before activating the microphone:
                </p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    Ensure all participants in the meeting room or call are aware that audio transcription for Minutes of Meeting is commencing.
                  </li>
                  <li>
                    Audio will only be captured once you click <strong>"Confirm & Start Recording"</strong>.
                  </li>
                  <li>
                    You can pause, mute, or end the session at any time with voice commands or manual controls.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs transition"
              >
                <Mic className="w-4 h-4" />
                <span>Confirm & Start Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
