import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Pause, 
  Play, 
  Square, 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  FolderKanban, 
  MapPin, 
  ArrowLeft, 
  Radio, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Download, 
  Sparkles, 
  FileAudio,
  Layers,
  ChevronRight,
  MoreVertical,
  Check,
  RotateCcw,
  FileText,
  Sliders,
  Zap,
  Activity,
  Shield,
  Wand2,
} from 'lucide-react';
import { FullMeetingRecord, MeetingParticipantEntity, MeetingState, RecordingEntity } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';
import { useVoice } from '../../context/VoiceContext';
import { commandSessionController } from '../../utils/commandSessionController';
import { useGeofence } from '../../context/GeofenceContext';
import { MeetingStateBadge } from './MeetingStateBadge';
import { TranscriptViewer } from './TranscriptViewer';
import { AIMinutesViewer } from './AIMinutesViewer';
import { DecisionsList } from './DecisionsList';
import { ActionItemsStudio } from './ActionItemsStudio';
import { ListTodo, CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import { 
  StudioAudioRecorder, 
  AudioStatsTelemetry, 
  AudioFormatType,
  SampleRateOption,
  ChannelModeOption,
  BitDepthOption,
  encodeWav,
  encodeFlac,
  normalizeFloat32Chunks,
  boostWhisperInFloat32,
  isolateTargetSpeakerFFT,
} from '../../utils/audioFloat32';

interface MeetingDetailStudioProps {
  meetingId: string;
  onNavigate: (route: string) => void;
  onGenerateMoM?: (transcript: string) => void;
}

export const MeetingDetailStudio: React.FC<MeetingDetailStudioProps> = ({ meetingId, onNavigate, onGenerateMoM }) => {
  const [meeting, setMeeting] = useState<FullMeetingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Recording Format & Quality Configuration State
  const [meetingState, setMeetingState] = useState<MeetingState>('READY');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Format options: wav, flac, webm
  const [audioFormat, setAudioFormat] = useState<'wav' | 'flac' | 'webm'>('wav');
  // Sample rate options: 16000, 44100, 48000 Hz
  const [sampleRate, setSampleRate] = useState<SampleRateOption>(48000);
  // Channel options: 1 (Mono) or 2 (Stereo)
  const [channels, setChannels] = useState<ChannelModeOption>(2);
  // Bit depth options: 16-bit or 32-bit float
  const [bitDepth, setBitDepth] = useState<BitDepthOption>(32);

  const [audioStats, setAudioStats] = useState<AudioStatsTelemetry | null>(null);
  const [normalizationMsg, setNormalizationMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'minutes' | 'decisions' | 'action_items' | 'transcript' | 'studio' | 'participants' | 'recordings'>('minutes');

  // Geofence Location Auto Mode Context
  const { 
    config: geofenceConfig, 
    evaluation: geofenceEval, 
    isAutoModeEnabled, 
    activeAutoRecordingMeetingId
  } = useGeofence();

  // MediaRecorder & Studio Audio refs
  const studioRecorderRef = useRef<StudioAudioRecorder | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load meeting data
  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const data = await meetingDb.getMeetingById(meetingId);
      if (!data) {
        setError('Meeting not found.');
      } else {
        setMeeting(data);
        setMeetingState(data.status || 'READY');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    return () => {
      stopAudioStreams();
    };
  }, [meetingId]);

  // Auto-Start recording if triggered via Geofence Location Auto Mode
  useEffect(() => {
    if (activeAutoRecordingMeetingId === meetingId && meetingState === 'READY' && !loading && meeting) {
      handleStartRecording();
    }
  }, [activeAutoRecordingMeetingId, meetingId, meetingState, loading, meeting]);

  // Audio visualizer loop
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('AudioContext not supported or permission denied', e);
    }
  };

  const stopAudioStreams = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (studioRecorderRef.current) {
      studioRecorderRef.current.stop().catch(() => {});
      studioRecorderRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
  };

  // Timer Management
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const toggleMute = () => {
    if (audioStreamRef.current) {
      const newMuteState = !isMuted;
      audioStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
      setIsMuted(newMuteState);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  // 1. START RECORDING (WAV, FLAC, WebM with configurable Sample Rate, Channels, and Bit Depth)
  const handleStartRecording = async () => {
    try {
      setError(null);
      setNormalizationMsg(null);
      audioChunksRef.current = [];

      if (audioFormat === 'webm') {
        // Standard WebM Fallback
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: channels,
            sampleRate: sampleRate,
          },
        });
        audioStreamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(1000);
        startAudioVisualizer(stream);
      } else {
        // High-Precision Studio Engine (WAV PCM 16-bit / 32-bit Float, or Lossless FLAC)
        const formatKey = audioFormat === 'flac' ? 'flac' : bitDepth === 32 ? 'wav_float32' : 'wav_pcm16';
        const recorder = new StudioAudioRecorder({
          sampleRate,
          channels,
          bitDepth,
          format: formatKey,
        });
        studioRecorderRef.current = recorder;

        const stream = await recorder.start((stats) => {
          setAudioStats(stats);
          // Convert RMS dBFS (-60 to 0) to 0-100% scale for wave visualizer
          const levelNorm = Math.min(100, Math.max(8, Math.round(((stats.rmsDbfs + 60) / 60) * 100)));
          setAudioLevel(levelNorm);
        });

        audioStreamRef.current = stream;
      }

      startTimer();
      setMeetingState('RECORDING');
      await meetingDb.updateMeetingState(meetingId, 'RECORDING');

      // Format description string for audit
      const fmtDesc = audioFormat === 'flac'
        ? `FLAC Lossless (${sampleRate / 1000} kHz, ${channels === 2 ? 'Stereo' : 'Mono'}, 16-Bit)`
        : audioFormat === 'wav'
        ? `WAV PCM (${sampleRate / 1000} kHz, ${channels === 2 ? 'Stereo' : 'Mono'}, ${bitDepth}-Bit ${bitDepth === 32 ? 'Float' : 'Linear'})`
        : `WebM Opus (${sampleRate / 1000} kHz, ${channels === 2 ? 'Stereo' : 'Mono'})`;

      // Log RECORDING_STARTED Audit Event
      meetingDb.logAuditEvent({
        event_type: 'RECORDING_STARTED',
        target_type: 'meeting',
        target_id: meetingId,
        target_title: meeting?.title || 'Meeting Session',
        details: {
          meetingState: 'RECORDING',
          format: fmtDesc,
          sampleRate,
          channels: channels === 2 ? 'Stereo (2-Ch)' : 'Mono (1-Ch)',
          bitDepth: `${bitDepth}-bit`,
          dynamicRange: bitDepth === 32 ? '1528 dB' : '96 dB',
          organizer: meeting?.organizer,
          organizerEmail: meeting?.organizerEmail,
        },
      }).catch(() => {});
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMeetingState('ERROR');
      setError('Microphone permission was denied or audio device is unavailable.');
    }
  };

  // 2. PAUSE RECORDING
  const handlePauseRecording = () => {
    if (audioFormat !== 'webm' && studioRecorderRef.current) {
      studioRecorderRef.current.pause();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    pauseTimer();
    setMeetingState('PAUSED');
    meetingDb.updateMeetingState(meetingId, 'PAUSED');
  };

  // 3. RESUME RECORDING
  const handleResumeRecording = () => {
    if (audioFormat !== 'webm' && studioRecorderRef.current) {
      studioRecorderRef.current.resume();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    startTimer();
    setMeetingState('RECORDING');
    meetingDb.updateMeetingState(meetingId, 'RECORDING');
  };

  // 4. STOP RECORDING & SAVE SESSION
  const handleStopRecording = async () => {
    setMeetingState('PROCESSING');
    pauseTimer();

    try {
      if (audioFormat !== 'webm' && studioRecorderRef.current) {
        // Stop and encode WAV or FLAC
        const audioResult = await studioRecorderRef.current.stop();
        studioRecorderRef.current = null;

        // Convert audio blob to Base64 data URL for offline database storage
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioResult.blob);
        });

        const safeTitle = meeting?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Meeting';
        const ext = audioFormat === 'flac' ? 'flac' : 'wav';
        const chLabel = channels === 2 ? 'Stereo' : 'Mono';
        const srLabel = `${sampleRate / 1000}kHz`;
        const bdLabel = bitDepth === 32 ? 'Float32' : 'PCM16';
        const fileName = `Session-${ext.toUpperCase()}-${srLabel}-${chLabel}-${bdLabel}-${safeTitle}-${new Date().toISOString().slice(0, 10)}.${ext}`;

        await meetingDb.saveRecording(meetingId, {
          fileName,
          mimeType: audioResult.mimeType,
          durationSeconds: elapsedSeconds || Math.round(audioResult.durationSeconds),
          fileSizeBytes: audioResult.sizeBytes,
          audioData: base64Data,
          status: 'Ready',
        });

        setMeetingState('COMPLETED');
        stopAudioStreams();
        await fetchMeeting();
        triggerAutoMoMIfNeeded();
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            
            // Save recording record to database
            await meetingDb.saveRecording(meetingId, {
              fileName: `Session-WebM-${meeting?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Meeting'}-${new Date().toISOString().slice(0, 10)}.webm`,
              mimeType: 'audio/webm',
              durationSeconds: elapsedSeconds,
              fileSizeBytes: audioBlob.size,
              audioData: base64Data,
              status: 'Ready',
            });

            setMeetingState('COMPLETED');
            stopAudioStreams();
            await fetchMeeting();
            triggerAutoMoMIfNeeded();
          };

          reader.readAsDataURL(audioBlob);
        };

        mediaRecorderRef.current.stop();
      } else {
        setMeetingState('COMPLETED');
        stopAudioStreams();
        await fetchMeeting();
        triggerAutoMoMIfNeeded();
      }
    } catch (saveErr: any) {
      console.error('Failed to finalize audio recording:', saveErr);
      setError('Failed to finalize audio recording: ' + (saveErr.message || 'Unknown error'));
      setMeetingState('COMPLETED');
      stopAudioStreams();
      fetchMeeting();
    }
  };

  const triggerAutoMoMIfNeeded = async () => {
    if (geofenceConfig?.autoTriggerMoM) {
      try {
        setNormalizationMsg('Location Auto-Mode: Automatically generating Minutes of Meeting (MoM)...');
        const transcriptText = meeting?.transcriptSegments && meeting.transcriptSegments.length > 0
          ? meeting.transcriptSegments.map((s) => `[${s.start_time} - ${s.end_time}] ${s.speaker}: ${s.text}`).join('\n')
          : `Meeting Title: ${meeting?.title || 'Session'}\nAgenda: ${meeting?.agenda || 'Location Geofence automated voice recording session'}\nOrganizer: ${meeting?.organizer || 'User'}\nLocation: ${meeting?.location || 'Office'}`;

        await meetingDb.generateMinutes({
          meetingId,
          transcript: transcriptText,
          meetingTitle: meeting?.title || 'Meeting Session',
          meetingDate: meeting?.date || new Date().toISOString().split('T')[0],
          participants: meeting?.participants.map((p) => p.name) || ['Meeting Host'],
          provider: 'openai',
        });
        setActiveTab('minutes');
        setNormalizationMsg('Minutes of Meeting (MoM) generated automatically via Location Auto-Mode!');
        await fetchMeeting();
        setTimeout(() => setNormalizationMsg(null), 6000);
      } catch (err: any) {
        console.error('Error in auto MoM generation:', err);
      }
    }
  };

  // Helper to normalize an existing recording (WAV / FLAC)
  const handleNormalizeRecording = async (rec: RecordingEntity) => {
    if (!rec.audioData) return;
    try {
      setNormalizationMsg('Applying Non-Destructive Gain Normalization (-1.0 dBFS Peak)...');
      
      const response = await fetch(rec.audioData);
      const arrayBuffer = await response.arrayBuffer();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const channelCount = decodedBuffer.numberOfChannels >= 2 ? 2 : 1;
      const leftChannel = decodedBuffer.getChannelData(0);
      const rightChannel = channelCount === 2 ? decodedBuffer.getChannelData(1) : undefined;
      
      const { normalizedChunks: normLeft, gainAppliedDb } = normalizeFloat32Chunks([leftChannel], -1.0);
      let normRight: Float32Array[] | undefined;
      if (rightChannel) {
        const { normalizedChunks } = normalizeFloat32Chunks([rightChannel], -1.0);
        normRight = normalizedChunks;
      }
      
      const wavMaster = encodeWav(
        { left: normLeft, right: normRight },
        decodedBuffer.sampleRate as SampleRateOption,
        channelCount as ChannelModeOption,
        32
      );
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Norm = reader.result as string;
        await meetingDb.saveRecording(meetingId, {
          fileName: `Normalized-Master-${rec.fileName.replace(/\.[^/.]+$/, '')}.wav`,
          mimeType: 'audio/wav',
          durationSeconds: rec.durationSeconds,
          fileSizeBytes: wavMaster.sizeBytes,
          audioData: base64Norm,
          status: 'Ready',
        });
        setNormalizationMsg(`Gain Leveling Applied (${gainAppliedDb > 0 ? '+' : ''}${gainAppliedDb} dB). Normalized Master saved!`);
        fetchMeeting();
        audioCtx.close().catch(() => {});
        setTimeout(() => setNormalizationMsg(null), 5000);
      };
      reader.readAsDataURL(wavMaster.blob);
    } catch (e: any) {
      console.error('Failed to normalize audio:', e);
      setNormalizationMsg('Normalization error: ' + (e.message || 'Unsupported format'));
      setTimeout(() => setNormalizationMsg(null), 5000);
    }
  };

  // Helper to boost whisper speech in a recording
  const handleWhisperBoost = async (rec: RecordingEntity) => {
    if (!rec.audioData) return;
    try {
      setNormalizationMsg('Applying +6 dB Dynamic Whisper Boost...');
      const response = await fetch(rec.audioData);
      const arrayBuffer = await response.arrayBuffer();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const channelCount = decodedBuffer.numberOfChannels >= 2 ? 2 : 1;
      const leftChannel = decodedBuffer.getChannelData(0);
      const rightChannel = channelCount === 2 ? decodedBuffer.getChannelData(1) : undefined;
      
      const boostedLeft = boostWhisperInFloat32([leftChannel], 2.0); // +6 dB
      const boostedRight = rightChannel ? boostWhisperInFloat32([rightChannel], 2.0) : undefined;
      
      const wavMaster = encodeWav(
        { left: boostedLeft, right: boostedRight },
        decodedBuffer.sampleRate as SampleRateOption,
        channelCount as ChannelModeOption,
        32
      );
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Boost = reader.result as string;
        await meetingDb.saveRecording(meetingId, {
          fileName: `WhisperBoost-${rec.fileName.replace(/\.[^/.]+$/, '')}.wav`,
          mimeType: 'audio/wav',
          durationSeconds: rec.durationSeconds,
          fileSizeBytes: wavMaster.sizeBytes,
          audioData: base64Boost,
          status: 'Ready',
        });
        setNormalizationMsg('Whisper Boost (+6 dB) generated with zero digital distortion.');
        fetchMeeting();
        audioCtx.close().catch(() => {});
        setTimeout(() => setNormalizationMsg(null), 5000);
      };
      reader.readAsDataURL(wavMaster.blob);
    } catch (e: any) {
      console.error('Failed to boost whisper audio:', e);
      setNormalizationMsg('Boost error: ' + (e.message || 'Unsupported format'));
      setTimeout(() => setNormalizationMsg(null), 5000);
    }
  };

  // Helper to isolate human speech frequencies (85 Hz - 3000 Hz) using Fast Fourier Transform (FFT) and Spectral Gating
  const handleIsolateTargetSpeaker = async (rec: RecordingEntity) => {
    if (!rec.audioData) return;
    try {
      setNormalizationMsg('Extracting target speaker: Applying FFT & Spectral Gating (85 Hz - 3000 Hz)...');
      const response = await fetch(rec.audioData);
      const arrayBuffer = await response.arrayBuffer();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const channelCount = decodedBuffer.numberOfChannels >= 2 ? 2 : 1;
      const leftChannel = decodedBuffer.getChannelData(0);
      const rightChannel = channelCount === 2 ? decodedBuffer.getChannelData(1) : undefined;
      
      // Perform FFT bandpass spectral isolation (Voice range: 85 Hz to 3000 Hz)
      const isolatedLeft = isolateTargetSpeakerFFT([leftChannel], decodedBuffer.sampleRate, 85.0, 3000.0);
      const isolatedRight = rightChannel 
        ? isolateTargetSpeakerFFT([rightChannel], decodedBuffer.sampleRate, 85.0, 3000.0) 
        : undefined;
      
      const wavMaster = encodeWav(
        { 
          left: isolatedLeft.filteredChunks, 
          right: isolatedRight ? isolatedRight.filteredChunks : undefined 
        },
        decodedBuffer.sampleRate as SampleRateOption,
        channelCount as ChannelModeOption,
        32
      );
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Clean = reader.result as string;
        await meetingDb.saveRecording(meetingId, {
          fileName: `CleanVoice-FFT-${rec.fileName.replace(/\.[^/.]+$/, '')}.wav`,
          mimeType: 'audio/wav',
          durationSeconds: rec.durationSeconds,
          fileSizeBytes: wavMaster.sizeBytes,
          audioData: base64Clean,
          status: 'Ready',
        });
        setNormalizationMsg('Target Speaker Isolated! Sub-85Hz rumble and high-frequency noise removed via FFT spectral gating.');
        fetchMeeting();
        audioCtx.close().catch(() => {});
        setTimeout(() => setNormalizationMsg(null), 5000);
      };
      reader.readAsDataURL(wavMaster.blob);
    } catch (e: any) {
      console.error('Failed to isolate target voice:', e);
      setNormalizationMsg('Voice Isolation error: ' + (e.message || 'Unsupported format'));
      setTimeout(() => setNormalizationMsg(null), 5000);
    }
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Voice Command Handlers Integration
  const { voiceCommandProvider } = useVoice();
  useEffect(() => {
    const unsubStart = voiceCommandProvider.registerActionHandler('START_RECORDING', () => {
      // Hands-free CommandSession owns mic buffer; avoid duplicate MediaRecorder
      if (commandSessionController.isRecording()) return;
      if (meetingState === 'READY' || meetingState === 'IDLE') {
        handleStartRecording();
      }
    });

    const unsubStop = voiceCommandProvider.registerActionHandler('STOP_RECORDING', () => {
      if (commandSessionController.isRecording() || commandSessionController.getStatus() === 'processing') {
        return;
      }
      if (meetingState === 'RECORDING' || meetingState === 'PAUSED') {
        handleStopRecording();
      }
    });

    const unsubPause = voiceCommandProvider.registerActionHandler('PAUSE_RECORDING', () => {
      if (meetingState === 'RECORDING') {
        handlePauseRecording();
      }
    });

    const unsubResume = voiceCommandProvider.registerActionHandler('RESUME_RECORDING', () => {
      if (meetingState === 'PAUSED') {
        handleResumeRecording();
      }
    });

    const unsubMute = voiceCommandProvider.registerActionHandler('TOGGLE_MUTE', () => {
      toggleMute();
    });

    const unsubMinutes = voiceCommandProvider.registerActionHandler('GENERATE_MINUTES', () => {
      setActiveTab('minutes');
    });

    return () => {
      unsubStart();
      unsubStop();
      unsubPause();
      unsubResume();
      unsubMute();
      unsubMinutes();
    };
  }, [meetingState, isMuted, meetingId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-bold text-sm">Loading Meeting Studio...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Unable to Load Meeting
        </h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'Meeting not found'}</p>
        <button
          onClick={() => onNavigate('/meetings')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
        >
          Return to Meetings List
        </button>
      </div>
    );
  }

  const isRecordingOrPaused = meetingState === 'RECORDING' || meetingState === 'PAUSED';

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-in fade-in duration-200">
      {/* Top Bar / Navigation */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/meetings')}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            title="Back to all meetings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-0.5">
              <span className="cursor-pointer hover:underline" onClick={() => onNavigate('/meetings')}>
                Meetings
              </span>
              <span>/</span>
              <span className="font-mono text-slate-400">{meeting.id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 tracking-tight">
              {meeting.title}
            </h1>
          </div>
        </div>

        {/* Meeting State Pill */}
        <div className="flex items-center gap-2">
          <MeetingStateBadge status={meetingState} size="md" />
        </div>
      </div>

      {/* Hero Meta Card (Mobile-First) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800">
              {meeting.department}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/80 dark:border-purple-800">
              {meeting.project}
            </span>
            {meeting.location && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {meeting.location}
              </span>
            )}
            {isAutoModeEnabled && geofenceEval.isInsideAnyGeofence && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Auto Mode Active ({geofenceEval.matchedLocation?.name})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {meeting.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {meeting.startTime} - {meeting.endTime} ({meeting.duration})
            </span>
          </div>
        </div>

        {/* Organizer & Participant Avatars */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {meeting.organizer.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {meeting.organizer}
              </span>
              <span className="text-[11px] text-slate-500">Meeting Organizer</span>
            </div>
          </div>

          {/* Participant avatars stack */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Roster ({meeting.participants.length}):
            </span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {meeting.participants.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  title={`${p.name} (${p.role})`}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shadow-2xs"
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {meeting.participants.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                  +{meeting.participants.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport (Mobile First & Tablet/Desktop) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-6 border border-slate-800">
        {/* Background glow mesh */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* State 1: RECORDING or PAUSED (Active Studio) */}
        {isRecordingOrPaused ? (
          <div className="flex flex-col items-center justify-center text-center space-y-5 py-4">
            {/* RED RECORDING INDICATOR + FORMAT BADGES */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-600/60 shadow-lg shadow-rose-950/50">
                <span className="relative flex h-3 w-3">
                  {meetingState === 'RECORDING' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90" />
                  )}
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className="text-xs font-black tracking-widest text-rose-300 uppercase">
                  {meetingState === 'RECORDING' ? 'LIVE AUDIO RECORDING' : 'RECORDING PAUSED'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-bold shadow-xs">
                <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>
                  {audioFormat.toUpperCase()} • {sampleRate / 1000} kHz • {channels === 2 ? 'Stereo (2-Ch)' : 'Mono (1-Ch)'} • {audioFormat === 'wav' ? `${bitDepth}-Bit ${bitDepth === 32 ? 'Float' : 'PCM'}` : audioFormat === 'flac' ? '16-Bit FLAC' : 'Opus'}
                </span>
              </div>
            </div>

            {/* LARGE LIVE TIMER */}
            <div className="space-y-1">
              <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white drop-shadow-md">
                {formatTimer(elapsedSeconds)}
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                <span>Session Time Elapsed</span>
                <span>•</span>
                <span className="text-indigo-400 font-bold">
                  {bitDepth === 32 && audioFormat === 'wav' ? '1528 dB Float Headroom (No Clipping)' : 'Lossless PCM Studio Capture'}
                </span>
              </p>
            </div>

            {/* Stereo / Mono Dynamic Headroom Monitor HUD */}
            {audioStats && (
              <div className="w-full max-w-md p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-left shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    <span>{channels === 2 ? 'Dual-Channel Stereo Meter' : 'Mono Channel Meter'}</span>
                  </span>
                  <span className="text-slate-300 font-bold">
                    L: {audioStats.peakDbfsLeft} dBFS {channels === 2 && `| R: ${audioStats.peakDbfsRight} dBFS`}
                  </span>
                </div>

                {/* Left Channel Meter Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{channels === 2 ? 'Left Channel (L)' : 'Input Signal'}</span>
                    <span>{audioStats.peakDbfsLeft} dBFS</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 flex items-center">
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(4, ((audioStats.peakDbfsLeft + 60) / 66) * 100))}%`,
                      }}
                      className={`h-full rounded-full transition-all duration-75 ${
                        audioStats.peakDbfsLeft > 0
                          ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-indigo-400 shadow-xs shadow-indigo-500'
                          : audioStats.peakDbfsLeft > -6
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Right Channel Meter Bar (if Stereo) */}
                {channels === 2 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Right Channel (R)</span>
                      <span>{audioStats.peakDbfsRight} dBFS</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 flex items-center">
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(4, ((audioStats.peakDbfsRight + 60) / 66) * 100))}%`,
                        }}
                        className={`h-full rounded-full transition-all duration-75 ${
                          audioStats.peakDbfsRight > 0
                            ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-indigo-400 shadow-xs shadow-indigo-500'
                            : audioStats.peakDbfsRight > -6
                            ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                  <span>-60 dB (Floor)</span>
                  <span>-24 dB (Whisper)</span>
                  <span>-6 dB (Speech)</span>
                  <span className="text-indigo-400 font-bold">{bitDepth === 32 ? '+6 dB (Float)' : '0 dB (Peak)'}</span>
                </div>

                {audioStats.hasOverdrive ? (
                  <div className="text-[11px] text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-sans font-medium">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>32-Bit Float Headroom Active: Signal exceeded 0 dBFS with 0% clipping!</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Acoustic dynamic range preserved @ {sampleRate / 1000} kHz {channels === 2 ? 'Stereo' : 'Mono'}.</span>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1 h-12 w-full max-w-sm px-4">
              {Array.from({ length: 24 }).map((_, i) => {
                const heightPercent =
                  meetingState === 'RECORDING'
                    ? Math.max(15, Math.min(100, (audioLevel * ((i % 5) + 1)) / 3 + 10))
                    : 10;
                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      meetingState === 'RECORDING'
                        ? 'bg-gradient-to-t from-rose-500 via-indigo-400 to-indigo-300'
                        : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Active Recording Controls (Pause / Resume / Stop) */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full max-w-md">
              {meetingState === 'RECORDING' ? (
                <button
                  onClick={handlePauseRecording}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handleResumeRecording}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={handleStopRecording}
                className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition active:scale-95 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop & Save</span>
              </button>
            </div>
          </div>
        ) : meetingState === 'COMPLETED' ? (
          /* State 2: COMPLETED */
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Meeting Session Finished
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Recording audio has been securely captured in the database ({meeting.recordings?.length || 1} session{meeting.recordings?.length === 1 ? '' : 's'}).
              </p>
            </div>

            {normalizationMsg && (
              <div className="px-4 py-2 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700 text-xs font-semibold animate-in fade-in">
                {normalizationMsg}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setElapsedSeconds(0);
                  handleStartRecording();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record New Segment</span>
              </button>

              <button
                onClick={() => setActiveTab('minutes')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract AI Minutes</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 3: IDLE or READY - Studio Parameters Configuration & Large Start Button */
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Lossless Studio Audio Engine Armed</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Ready to record {meeting.title}?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose format, sample rate, channels, and bit depth before launching capture.
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Presets:
              </span>
              <button
                onClick={() => {
                  setAudioFormat('wav');
                  setSampleRate(16000);
                  setChannels(1);
                  setBitDepth(16);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  audioFormat === 'wav' && sampleRate === 16000 && channels === 1 && bitDepth === 16
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Whisper (16 kHz Mono 16-Bit)</span>
              </button>

              <button
                onClick={() => {
                  setAudioFormat('flac');
                  setSampleRate(44100);
                  setChannels(2);
                  setBitDepth(16);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  audioFormat === 'flac' && sampleRate === 44100 && channels === 2
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>CD Lossless (FLAC 44.1 kHz Stereo)</span>
              </button>

              <button
                onClick={() => {
                  setAudioFormat('wav');
                  setSampleRate(48000);
                  setChannels(2);
                  setBitDepth(32);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  audioFormat === 'wav' && sampleRate === 48000 && channels === 2 && bitDepth === 32
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Studio Master (WAV 48 kHz Stereo 32-Bit Float)</span>
              </button>
            </div>

            {/* Granular Audio Studio Parameter Controls */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* 1. Format */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Format</span>
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setAudioFormat('wav')}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      audioFormat === 'wav'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>WAV (PCM)</span>
                    {audioFormat === 'wav' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setAudioFormat('flac')}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      audioFormat === 'flac'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>FLAC (Lossless)</span>
                    {audioFormat === 'flac' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setAudioFormat('webm')}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      audioFormat === 'webm'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>WebM Opus</span>
                    {audioFormat === 'webm' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Sample Rate */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sample Rate</span>
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSampleRate(16000)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      sampleRate === 16000
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>16 kHz (16000 Hz)</span>
                    {sampleRate === 16000 && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setSampleRate(44100)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      sampleRate === 44100
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>44.1 kHz (CD Audio)</span>
                    {sampleRate === 44100 && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setSampleRate(48000)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      sampleRate === 48000
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>48 kHz (Broadcast)</span>
                    {sampleRate === 48000 && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 3. Channel Mode (Stereo vs Mono) */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Channels</span>
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setChannels(2)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      channels === 2
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>Stereo (2 Channels)</span>
                    {channels === 2 && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setChannels(1)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      channels === 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>Mono (1 Channel)</span>
                    {channels === 1 && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 4. Bit Depth (16-bit vs 32-bit Float) */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bit Depth</span>
                </label>
                <div className="space-y-1.5">
                  <button
                    disabled={audioFormat === 'webm' || audioFormat === 'flac'}
                    onClick={() => setBitDepth(32)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      bitDepth === 32 && audioFormat === 'wav'
                        ? 'bg-indigo-600 text-white'
                        : audioFormat !== 'wav'
                        ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>32-Bit Float (No-Clip)</span>
                    {bitDepth === 32 && audioFormat === 'wav' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    disabled={audioFormat === 'webm'}
                    onClick={() => setBitDepth(16)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      (bitDepth === 16 || audioFormat === 'flac') && audioFormat !== 'webm'
                        ? 'bg-indigo-600 text-white'
                        : audioFormat === 'webm'
                        ? 'bg-slate-950/40 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>16-Bit Integer (PCM)</span>
                    {bitDepth === 16 && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* LARGE MICROPHONE BUTTON: START MEETING */}
            <button
              onClick={handleStartRecording}
              className="group relative flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {/* Outer pulsing wave rings */}
              <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-25 group-hover:animate-ping" />
              <div className="absolute -inset-2 rounded-full border-2 border-indigo-400/40 opacity-75" />

              <Mic className="w-12 h-12 sm:w-14 sm:h-14 mb-2 drop-shadow group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-white">
                START MEETING
              </span>
            </button>

            <div className="flex items-center gap-3 sm:gap-6 text-xs text-slate-400 font-medium flex-wrap justify-center">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                {audioFormat.toUpperCase()} ({sampleRate / 1000} kHz)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                {channels === 2 ? 'Stereo (2 Channels)' : 'Mono (1 Channel)'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                {audioFormat === 'wav' ? `${bitDepth}-Bit ${bitDepth === 32 ? 'Float' : 'Linear PCM'}` : audioFormat === 'flac' ? '16-Bit Lossless FLAC' : 'Opus Compressed'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs / Sub-Sections for Transcript, Roster, Agenda, and Saved Recordings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('minutes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'minutes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'minutes' ? 'text-amber-300' : 'text-indigo-500'}`} />
            <span>AI Minutes</span>
            {meeting.minutes && meeting.minutes.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'minutes' ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'}`}>
                Ready
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'decisions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Decisions ({meeting.decisions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('action_items')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'action_items'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
            <span>Action Items ({meeting.actionItems?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transcript'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transcript ({meeting.transcriptSegments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Agenda
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'participants'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Participants ({meeting.participants?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('recordings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recordings'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            Recordings ({meeting.recordings?.length || 0})
          </button>
        </div>

        {/* Tab -1: AI Meeting Minutes */}
        {activeTab === 'minutes' && (
          <AIMinutesViewer
            meeting={meeting}
            onRefresh={fetchMeeting}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab -2: Decisions */}
        {activeTab === 'decisions' && (
          <DecisionsList
            meeting={meeting}
            onRefresh={fetchMeeting}
          />
        )}

        {/* Tab -3: Action Items */}
        {activeTab === 'action_items' && (
          <ActionItemsStudio
            meeting={meeting}
            onRefresh={fetchMeeting}
          />
        )}

        {/* Tab 0: Live Transcript & Segments Viewer */}
        {activeTab === 'transcript' && (
          <TranscriptViewer
            meeting={meeting}
            segments={meeting.transcriptSegments || []}
            recordings={meeting.recordings || []}
            onRefresh={fetchMeeting}
            onGenerateMoMFromTranscript={onGenerateMoM}
          />
        )}

        {/* Tab 1: Agenda */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Meeting Objectives & Agenda
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {meeting.agenda || 'No formal agenda items specified for this meeting.'}
              </div>
            </div>

            {meeting.notes && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Pre-Meeting Notes
                </h3>
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
                  {meeting.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Participants Roster */}
        {activeTab === 'participants' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Attendees & Roles
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {meeting.participants.filter((p) => p.attended).length} of {meeting.participants.length} present
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meeting.participants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      {p.email && (
                        <div className="text-[11px] text-slate-500">{p.email}</div>
                      )}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Audio Recordings in Database */}
        {activeTab === 'recordings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recorded Sessions ({meeting.recordings?.length || 0})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  WAV (16/32-Bit Float PCM), Lossless FLAC, and WebM sessions stored in local database.
                </p>
              </div>

              {normalizationMsg && (
                <div className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold">
                  {normalizationMsg}
                </div>
              )}
            </div>

            {meeting.recordings && meeting.recordings.length > 0 ? (
              meeting.recordings.map((rec) => {
                const isWav = rec.mimeType === 'audio/wav' || rec.fileName.endsWith('.wav');
                const isFlac = rec.mimeType === 'audio/flac' || rec.fileName.endsWith('.flac');
                const isFloat32 = isWav && (rec.fileName.includes('Float') || rec.fileName.includes('32Bit'));
                const isCleanVoiceFFT = rec.fileName.includes('CleanVoice-FFT') || rec.fileName.includes('CleanVoice');
                const isStereo = rec.fileName.includes('Stereo') || rec.fileName.includes('2Ch');
                const is16k = rec.fileName.includes('16kHz') || rec.fileName.includes('16k');
                const is44k = rec.fileName.includes('44.1kHz') || rec.fileName.includes('44k');
                const is48k = rec.fileName.includes('48kHz') || rec.fileName.includes('48k');

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isCleanVoiceFFT
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isFloat32 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : isFlac
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isWav
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {isCleanVoiceFFT ? <Sparkles className="w-5 h-5 text-amber-300" /> : <FileAudio className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {rec.fileName}
                          </span>
                          {isCleanVoiceFFT && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              FFT ISOLATED (85-3000 Hz)
                            </span>
                          )}
                          {isFloat32 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              32-BIT FLOAT WAV
                            </span>
                          ) : isFlac ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              LOSSLESS FLAC
                            </span>
                          ) : isWav ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              16-BIT PCM WAV
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              WEBM OPUS
                            </span>
                          )}

                          {isStereo && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              STEREO
                            </span>
                          )}
                          {is16k && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              16 kHz
                            </span>
                          )}
                          {is44k && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              44.1 kHz
                            </span>
                          )}
                          {is48k && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              48 kHz
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                          <span>Duration: {formatTimer(rec.durationSeconds)}</span>
                          <span>•</span>
                          <span>Size: {Math.round(rec.fileSizeBytes / 1024)} KB</span>
                          <span>•</span>
                          <span>Captured: {new Date(rec.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {rec.audioData && (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <audio controls src={rec.audioData} className="h-9 max-w-[200px]" />
                        
                        {/* Auto-Gain Normalization */}
                        <button
                          onClick={() => handleNormalizeRecording(rec)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Non-destructively normalize peak to -1.0 dBFS"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="hidden sm:inline">Normalize</span>
                        </button>

                        {/* Whisper Speech Booster */}
                        <button
                          onClick={() => handleWhisperBoost(rec)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Boost soft speakers and whispers by +6 dB"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden sm:inline">Whisper Boost</span>
                        </button>

                        {/* Target Speaker / Human Voice FFT Spectral Isolator (85-3000 Hz) */}
                        <button
                          onClick={() => handleIsolateTargetSpeaker(rec)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Extract target human speaker via FFT & Spectral Gating (85 Hz - 3000 Hz)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="hidden sm:inline">Isolate Voice (FFT)</span>
                        </button>

                        <a
                          href={rec.audioData}
                          download={rec.fileName}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                          title="Download audio master file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                <FileAudio className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  No recording captures in database yet.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap "START MEETING" above to begin high-fidelity lossless audio capture.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
