import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, RotateCcw, Sparkles, Volume2, AlertCircle, Radio, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, durationFormatted: string) => void;
  isProcessing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#4f46e5');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#06b6d4');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 3, Math.max(4, barHeight), 4);
          ctx.fill();

          x += barWidth + 2;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error('Audio visualizer error:', err);
    }
  };

  const cleanupAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleStartRecording = async () => {
    setAudioError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const durationStr = formatTime(recordingTime);
          onAudioRecorded(finalBlob, durationStr);
        }
        cleanupAudio();
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      startVisualizer(stream);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setAudioError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : err.message || 'Could not access microphone.'
      );
      cleanupAudio();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    cleanupAudio();
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioLevel(0);
  };

  return (
    <div id="audio-recorder-card" className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xs backdrop-blur-xs transition-all relative overflow-hidden">
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Microphone Notice</p>
              <p className="mt-0.5">{audioError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRecording ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 py-2">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <button
              id="start-recording-btn"
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all flex-shrink-0 cursor-pointer disabled:opacity-50 touch-manipulation min-w-[56px] min-h-[56px]"
              title="Click to start live recording"
            >
              <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Voice Capture Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/60 dark:border-indigo-800/60">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Record discussions with real-time multi-speaker diarization, action item extraction, and key decision mapping.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Speaker Diarization
                </span>
                <span>•</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Auto PII Redaction</span>
                <span>•</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">All Languages</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartRecording}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px] touch-manipulation active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Start Live Session</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-2">
          {/* Active Recording Indicator & High Precision Timer */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                {!isPaused && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                    isPaused ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isPaused ? 'Session Paused' : 'Live Audio Recording...'}
              </span>
            </div>

            <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
              {formatTime(recordingTime)}
            </div>
          </div>

          {/* High Res Audio Visualizer Studio Deck */}
          <div className="w-full bg-slate-900 rounded-2xl p-3 border border-slate-800 mb-4 flex flex-col items-center justify-center h-24 sm:h-28 relative overflow-hidden shadow-inner">
            <canvas ref={canvasRef} width={520} height={80} className="w-full h-full" />
            <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-xs font-mono text-indigo-300 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Mic Gain: {audioLevel}%</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
            <button
              id="pause-resume-btn"
              onClick={handlePauseResume}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition min-h-[44px] touch-manipulation cursor-pointer active:scale-95 shadow-2xs"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-amber-500" />}
              <span>{isPaused ? 'Resume Recording' : 'Pause'}</span>
            </button>

            <button
              id="cancel-recording-btn"
              onClick={handleCancelRecording}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/60 dark:hover:bg-rose-900/50 transition min-h-[44px] touch-manipulation cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              id="finish-generate-btn"
              onClick={handleStopRecording}
              disabled={recordingTime < 1}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer min-h-[44px] touch-manipulation active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Finish & Generate MoM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

