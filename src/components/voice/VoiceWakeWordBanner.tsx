import React from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Radio,
  CheckCircle2,
  ChevronRight,
  Sliders,
  X,
  Play,
  Square,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';

interface VoiceWakeWordBannerProps {
  onNavigateToSettings?: () => void;
  onNavigate?: (path: string) => void;
}

function formatSessionTimer(totalSecs: number) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const VoiceWakeWordBanner: React.FC<VoiceWakeWordBannerProps> = ({
  onNavigateToSettings,
  onNavigate,
}) => {
  const {
    status,
    isListening,
    isSupported,
    statusError,
    activeWakeWordAlert,
    activeCommandAlert,
    pendingActionConfirmation,
    interimTranscript,
    commandSession,
    toggleListening,
    startCommandSessionManual,
    stopCommandSessionManual,
    cancelCommandSessionManual,
    dismissWakeWordAlert,
    confirmPendingAction,
    cancelPendingAction,
  } = useVoice();

  const sessionActive =
    commandSession.status === 'recording' ||
    commandSession.status === 'processing' ||
    commandSession.status === 'saved' ||
    commandSession.status === 'cancelled' ||
    commandSession.status === 'error';

  return (
    <div id="voice-assistant-overlay" className="relative z-40">
      <div className="fixed bottom-[calc(var(--app-bottom-h)+0.75rem)] md:bottom-4 right-4 z-40 flex flex-col items-end gap-2 max-w-sm w-full pointer-events-none">
        {sessionActive && (
          <div
            className={`pointer-events-auto max-w-xs w-full px-3.5 py-2.5 rounded-2xl text-white text-xs backdrop-blur-md border shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
              commandSession.status === 'recording'
                ? 'bg-rose-950/95 border-rose-500/40'
                : commandSession.status === 'processing'
                  ? 'bg-amber-950/95 border-amber-500/40'
                  : commandSession.status === 'saved'
                    ? 'bg-emerald-950/95 border-emerald-500/40'
                    : commandSession.status === 'cancelled'
                      ? 'bg-slate-900/95 border-slate-500/40'
                      : 'bg-rose-950/95 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-[10px]">
                {commandSession.status === 'recording' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>Recording</span>
                  </>
                )}
                {commandSession.status === 'processing' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Gemini + Instant Save</span>
                  </>
                )}
                {commandSession.status === 'saved' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved</span>
                  </>
                )}
                {commandSession.status === 'cancelled' && (
                  <>
                    <X className="w-3.5 h-3.5 text-slate-300" />
                    <span>Cancelled — not saved</span>
                  </>
                )}
                {commandSession.status === 'error' && (
                  <>
                    <X className="w-3.5 h-3.5 text-rose-300" />
                    <span>Save error</span>
                  </>
                )}
              </div>
              {commandSession.status === 'recording' && (
                <span className="font-mono text-[11px] text-rose-200">
                  {formatSessionTimer(commandSession.durationSeconds)}
                </span>
              )}
            </div>
            {commandSession.status === 'recording' && (
              <p className="mt-1 text-[11px] text-rose-100/90 leading-snug">
                Say <span className="font-semibold">“Meeting khatam”</span>,{' '}
                <span className="font-semibold">“2Click Stop”</span>, or{' '}
                <span className="font-semibold">“Save note”</span> to process &amp; save. “Cancel
                recording” discards.
              </p>
            )}
            {commandSession.status === 'saved' && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-emerald-100/90 truncate min-w-0">
                  {commandSession.lastMomSummary
                    ? commandSession.lastMomSummary
                    : commandSession.lastSavedId
                      ? `Saved · ${commandSession.lastSavedId}`
                      : 'Note saved to MoM document'}
                </p>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/mom')}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100 cursor-pointer"
                  >
                    Open note
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            {commandSession.status === 'error' && commandSession.lastError && (
              <p className="mt-1 text-[11px] text-rose-100/90 line-clamp-2">{commandSession.lastError}</p>
            )}
            {commandSession.redactedTranscript && commandSession.status === 'recording' && (
              <p className="mt-1.5 line-clamp-2 text-[11px] text-white/70 italic font-mono">
                “{commandSession.redactedTranscript}”
              </p>
            )}
          </div>
        )}

        {isListening && interimTranscript && !sessionActive && (
          <div className="pointer-events-auto max-w-xs px-3.5 py-2 rounded-2xl bg-slate-900/90 text-white text-xs backdrop-blur-md border border-slate-700/60 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Listening for commands</span>
            </div>
            <p className="line-clamp-2 text-slate-200 italic font-mono text-[11px]">
              "{interimTranscript}"
            </p>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              {commandSession.status === 'recording' ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
                </>
              ) : isListening ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                </>
              ) : status === 'permission_needed' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {commandSession.status === 'recording'
                    ? 'Command Session Live'
                    : isListening
                      ? 'Voice Assistant Active'
                      : 'Voice Assistant Idle'}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {commandSession.status === 'recording'
                  ? 'Recording until stop/save/cancel'
                  : isListening
                    ? 'Bolo “2Click Start” ya “Meeting shuru karo”'
                    : status === 'permission_needed'
                      ? 'Mic allow karo, phir dubara tap'
                      : status === 'error'
                        ? 'Speech error — neeche Start button use karo'
                        : 'Mic tap karo — ya Start button dabao'}
              </span>
            </div>
          </div>

          {commandSession.status === 'recording' ? (
            <button
              type="button"
              onClick={stopCommandSessionManual}
              className="px-3 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
              title="Stop & save session"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={startCommandSessionManual}
              className="px-3 py-2 rounded-full bg-[#00BAF2] hover:bg-[#0099cc] text-white text-xs font-extrabold shadow-sm cursor-pointer"
              title="Start command session without voice"
            >
              Start
            </button>
          )}

          <button
            onClick={() => {
              void toggleListening();
            }}
            className={`p-2.5 rounded-full font-bold text-sm transition cursor-pointer ${
              isListening
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-hs-600 hover:text-white'
            }`}
            title={isListening ? 'Stop Voice Listening' : 'Start Voice Listening'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Open Voice & Wake Word Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {activeWakeWordAlert && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-2 border-indigo-400/50 shadow-indigo-500/20 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md flex-shrink-0 animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                      Wake Word Detected
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      "{activeWakeWordAlert.wakeWord.word}"
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {/start|shuru|शुरू/i.test(activeWakeWordAlert.wakeWord.word)
                      ? 'Session start ho raha hai…'
                      : 'Ready for your voice command'}
                  </h3>
                  <p className="text-[11px] text-indigo-200 mt-0.5">
                    Say "2Click Start", "Meeting shuru karo", or "Start recording" — ya Start button.
                  </p>
                </div>
              </div>

              <button
                onClick={dismissWakeWordAlert}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/15">
              <button
                onClick={() => {
                  dismissWakeWordAlert();
                  if (onNavigate) onNavigate('/meetings/new');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-300" />
                <span>New Meeting</span>
              </button>

              <button
                onClick={() => {
                  dismissWakeWordAlert();
                  if (onNavigateToSettings) onNavigateToSettings();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Sliders className="w-3 h-3" />
                <span>Voice Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingActionConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  pendingActionConfirmation.action === 'START_RECORDING'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : pendingActionConfirmation.action === 'CANCEL_RECORDING'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {pendingActionConfirmation.action === 'START_RECORDING' ? (
                  <Radio className="w-6 h-6 animate-pulse" />
                ) : pendingActionConfirmation.action === 'CANCEL_RECORDING' ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Square className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {pendingActionConfirmation.title}
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Voice Command Triggered
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pendingActionConfirmation.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                Visible consent check: Session will display active recording badge and audio level
                visualizer.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={cancelPendingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmPendingAction}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm & Execute</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCommandAlert && !pendingActionConfirmation && (
        <div className="fixed top-20 right-5 z-50 max-w-xs animate-in fade-in slide-in-from-top-3">
          <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-extrabold text-emerald-200">
                Command Executed
              </div>
              <div className="text-xs font-bold">
                "{activeCommandAlert.command.phrase}" → {activeCommandAlert.action}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isSupported && (
        <div className="fixed bottom-20 left-4 right-4 z-40 pointer-events-none">
          <div className="mx-auto max-w-md pointer-events-auto px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
            Voice speech API is browser me nahi hai (Chrome/Edge better). Neeche{' '}
            <strong>Start</strong> button se session shuru karo.
            {statusError ? ` ${statusError}` : ''}
          </div>
        </div>
      )}

      {isSupported && (status === 'permission_needed' || status === 'error') && statusError && (
        <div className="fixed bottom-20 left-4 right-4 z-40 pointer-events-none">
          <div className="mx-auto max-w-md pointer-events-auto px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            {statusError}{' '}
            <button
              type="button"
              className="underline font-bold pointer-events-auto"
              onClick={startCommandSessionManual}
            >
              Start without voice
            </button>
            {commandSession.status === 'recording' && (
              <>
                {' · '}
                <button
                  type="button"
                  className="underline font-bold pointer-events-auto"
                  onClick={stopCommandSessionManual}
                >
                  Stop & save
                </button>
                {' · '}
                <button
                  type="button"
                  className="underline font-bold pointer-events-auto"
                  onClick={cancelCommandSessionManual}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
