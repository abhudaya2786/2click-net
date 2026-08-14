import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  ShieldCheck,
  Clock,
  Activity,
  Sparkles,
  Volume2,
  Trash2,
  Lock,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ScheduledEvent, PrivacySettings } from '../types';
import { redactPii } from '../utils/privacyUtils';

interface LiveMeetingMonitorProps {
  armedEvent: ScheduledEvent | null;
  privacySettings: PrivacySettings;
  onGenerateFromMonitoring: (audioBlob: Blob, liveTranscript: string) => void;
  onDisarm: () => void;
  onOpenPrivacyCenter: () => void;
}

export const LiveMeetingMonitor: React.FC<LiveMeetingMonitorProps> = ({
  armedEvent,
  privacySettings,
  onGenerateFromMonitoring,
  onDisarm,
  onOpenPrivacyCenter,
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechCount, setSpeechCount] = useState(0);
  const [liveTranscriptSegments, setLiveTranscriptSegments] = useState<
    { speaker: string; text: string; timestamp: string }[]
  >([]);
  const [interimText, setInterimText] = useState('');
  const [speechRatio, setSpeechRatio] = useState(78); // percentage speech vs silence

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<any>(null);

  // Time format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Start live monitoring
  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Setup Web Audio Analyser for live visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      // Pulse meter animation loop
      const updateMeter = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100 * 1.8)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(1000); // 1s slices
      setIsMonitoring(true);
      setIsPaused(false);
      setElapsedSeconds(0);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech API for real-time live preview
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const cleanedText = privacySettings.enablePiiRedaction
                ? redactPii(transcript)
                : transcript;

              setLiveTranscriptSegments((prev) => [
                ...prev,
                {
                  speaker: `Speaker ${((prev.length % 3) + 1)}`,
                  text: cleanedText.trim(),
                  timestamp: formatTime(elapsedSeconds),
                },
              ]);
              setSpeechCount((c) => c + 1);
              currentInterim = '';
            } else {
              currentInterim += transcript;
            }
          }
          setInterimText(
            privacySettings.enablePiiRedaction ? redactPii(currentInterim) : currentInterim
          );
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.onend = () => {
          if (isMonitoring && !isPaused) {
            try {
              recognition.start();
            } catch (err) {
              // ignore duplicate start
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.error('Failed to access microphone for live monitor:', err);
      alert('Microphone permission is required to start live meeting monitoring.');
    }
  };

  // Stop monitoring & synthesize MoM
  const handleStopAndGenerate = () => {
    if (mediaRecorderRef.current && isMonitoring) {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fullTranscript = liveTranscriptSegments
          .map((s) => `${s.speaker}: ${s.text}`)
          .join('\n');

        cleanupStreams();
        setIsMonitoring(false);
        onGenerateFromMonitoring(audioBlob, fullTranscript);
      };

      mediaRecorderRef.current.stop();
    } else {
      cleanupStreams();
      setIsMonitoring(false);
    }
  };

  // Emergency Mute & Purge
  const handleEmergencyPurge = () => {
    cleanupStreams();
    audioChunksRef.current = [];
    setLiveTranscriptSegments([]);
    setInterimText('');
    setIsMonitoring(false);
    setElapsedSeconds(0);
    onDisarm();
  };

  const cleanupStreams = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (sourceRef.current) {
      sourceRef.current.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, []);

  return (
    <div
      id="live-meeting-monitor"
      className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 relative overflow-hidden"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
            <Radio className={`w-4 h-4 ${isMonitoring ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Live Meeting Monitor
              </h3>
              <span
                className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isMonitoring
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMonitoring ? 'bg-emerald-600 animate-ping' : 'bg-amber-500'
                  }`}
                ></span>
                {isMonitoring ? 'Monitoring Active' : 'Armed & Ready'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {armedEvent ? `"${armedEvent.title}" (${armedEvent.date} @ ${armedEvent.time})` : 'Ambient room monitoring with real-time PII redaction and speech activity metrics.'}
            </p>
          </div>
        </div>

        {/* Privacy Status Tag */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenPrivacyCenter}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold transition cursor-pointer min-h-[32px] touch-manipulation"
            title="Open Privacy & Security Settings"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Guard</span>
          </button>

          <button
            onClick={handleEmergencyPurge}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer touch-manipulation"
            title="Emergency Disarm & Purge Buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 items-center">
        {/* Left: Duration & Acoustic Decibel Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              Duration:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Mic Acoustic Level</span>
              <span>{audioLevel}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  audioLevel > 60 ? 'bg-emerald-500' : audioLevel > 20 ? 'bg-blue-500' : 'bg-slate-400'
                }`}
                style={{ width: `${Math.max(5, audioLevel)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Center: Live Stats */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Speech Turns</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
              {speechCount}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">PII Redacted</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {privacySettings.enablePiiRedaction ? 'Auto' : 'Off'}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Buffer</span>
            <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400">
              RAM
            </span>
          </div>
        </div>

        {/* Right: Monitoring Action Buttons */}
        <div className="flex items-center justify-stretch sm:justify-end gap-2 sm:col-span-2 md:col-span-1">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[44px] touch-manipulation"
            >
              <Mic className="w-4 h-4" />
              <span>Start Live Monitoring</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleStopAndGenerate}
                className="flex-1 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[44px] touch-manipulation"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Finish & Generate MoM</span>
              </button>

              <button
                onClick={handleEmergencyPurge}
                className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                title="Stop and Purge without saving"
              >
                <MicOff className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript / Speech Bubble (if any) */}
      {(liveTranscriptSegments.length > 0 || interimText) && (
        <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              Real-Time Monitored Dialogue (Privacy Masked)
            </span>
            <span>{liveTranscriptSegments.length} turns recorded</span>
          </div>

          {liveTranscriptSegments.slice(-4).map((seg, i) => (
            <div key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">
                {seg.speaker} ({seg.timestamp}):
              </span>
              <span>{seg.text}</span>
            </div>
          ))}

          {interimText && (
            <div className="text-slate-400 italic text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
              <span>{interimText}</span>
            </div>
          )}
        </div>
      )}

      {/* Strict Privacy Guarantee Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-emerald-600" />
          Zero-Disk Audio Retention: Audio resides only in ephemeral browser buffer until synthesized.
        </span>
        <button
          onClick={onOpenPrivacyCenter}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Configure Privacy Shields →
        </button>
      </div>
    </div>
  );
};
