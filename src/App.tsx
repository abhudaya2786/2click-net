import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Upload, 
  History, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Moon, 
  Sun, 
  Layers, 
  HelpCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ListTodo,
  CheckSquare,
  FileSpreadsheet,
  Zap,
  Calendar,
  ShieldCheck,
  Radio,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MeetingData, ActionItem, MeetingContextOptions, ScheduledEvent, PrivacySettings } from './types';
import { SAMPLE_MEETINGS } from './data/sampleMeetings';
import { AudioRecorder } from './components/AudioRecorder';
import { AudioUploader } from './components/AudioUploader';
import { MeetingHeader } from './components/MeetingHeader';
import { ActionItemsList } from './components/ActionItemsList';
import { DiscussionsAndDecisions } from './components/DiscussionsAndDecisions';
import { TranscriptViewer } from './components/TranscriptViewer';
import { MeetingChatCopilot } from './components/MeetingChatCopilot';
import { EmailDraftModal } from './components/EmailDraftModal';
import { MeetingHistorySidebar } from './components/MeetingHistorySidebar';
import { SampleMeetingsModal } from './components/SampleMeetingsModal';
import { ParticipantsListCard } from './components/ParticipantsListCard';
import { PrivacyShieldModal } from './components/PrivacyShieldModal';
import { AutoScheduleModal } from './components/AutoScheduleModal';
import { LiveMeetingMonitor } from './components/LiveMeetingMonitor';
import { DEFAULT_PRIVACY_SETTINGS, applyPrivacyToMeeting } from './utils/privacyUtils';
import { MeetingListView } from './components/meetings/MeetingListView';
import { NewMeetingView } from './components/meetings/NewMeetingModalOrView';
import { MeetingDetailStudio } from './components/meetings/MeetingDetailStudio';
import { meetingDb } from './utils/meetingDatabase';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { VoiceWakeWordBanner } from './components/voice/VoiceWakeWordBanner';
import { VoiceSettingsView } from './components/settings/VoiceSettingsView';
import { ScheduleProvider } from './context/ScheduleContext';
import { ScheduleSettingsView } from './components/settings/ScheduleSettingsView';
import { ScheduledReadyBanner } from './components/schedule/ScheduledReadyBanner';
import { PrivacyProvider } from './context/PrivacyContext';
import { PrivacySettingsView } from './components/settings/PrivacySettingsView';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { BillingSubscriptionView } from './components/settings/BillingSubscriptionView';
import { GeofenceProvider } from './context/GeofenceContext';
import { GeofenceAutoModeBanner } from './components/geofence/GeofenceAutoModeBanner';
import { LocationGeofenceSettingsView } from './components/settings/LocationGeofenceSettingsView';
import { CreditCard, Compass, MapPin, Power } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'voice_mom_saved_meetings_v1';
const SCHEDULED_EVENTS_KEY = 'voice_mom_scheduled_events_v1';
const PRIVACY_SETTINGS_KEY = 'voice_mom_privacy_settings_v1';
const THEME_KEY = 'voice_mom_theme';

function AppContent() {
  // Navigation / Routing State for /meetings, /meetings/new, /meetings/[id], /settings/voice
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const p = window.location.pathname;
    if (p.startsWith('/meetings') || p.startsWith('/settings') || p === '/mom') return p;
    return '/meetings';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { voiceCommandProvider } = useVoice();

  // Bind Global Voice Actions
  useEffect(() => {
    const unsubSettings = voiceCommandProvider.registerActionHandler('OPEN_SETTINGS', () => {
      navigate('/settings/voice');
    });
    const unsubMeetings = voiceCommandProvider.registerActionHandler('OPEN_MEETINGS', () => {
      navigate('/meetings');
    });
    const unsubNew = voiceCommandProvider.registerActionHandler('NEW_MEETING', () => {
      navigate('/meetings/new');
    });

    return () => {
      unsubSettings();
      unsubMeetings();
      unsubNew();
    };
  }, [voiceCommandProvider]);

  useEffect(() => {
    meetingDb.init();
    const handlePop = () => {
      setCurrentRoute(window.location.pathname || '/meetings');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const [currentMeeting, setCurrentMeeting] = useState<MeetingData | null>(null);
  const [savedMeetings, setSavedMeetings] = useState<MeetingData[]>([]);
  const [activeInputTab, setActiveInputTab] = useState<'record' | 'upload' | 'monitor'>('record');
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'summary' | 'actions' | 'topics' | 'transcript'>('all');
  
  // Privacy & Scheduling States
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [armedEvent, setArmedEvent] = useState<ScheduledEvent | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('Processing audio with Gemini AI...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Modals & Panels
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved meetings, schedules, privacy settings and theme on initial load
  useEffect(() => {
    try {
      // Privacy Settings
      const storedPrivacy = localStorage.getItem(PRIVACY_SETTINGS_KEY);
      if (storedPrivacy) {
        setPrivacySettings({ ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(storedPrivacy) });
      }

      // Scheduled Events
      const storedSchedules = localStorage.getItem(SCHEDULED_EVENTS_KEY);
      if (storedSchedules) {
        const parsed = JSON.parse(storedSchedules);
        if (Array.isArray(parsed)) {
          setScheduledEvents(parsed);
        }
      } else {
        // Initial sample schedule
        const initialDate = new Date();
        initialDate.setDate(initialDate.getDate() + 3);
        const sampleEvent: ScheduledEvent = {
          id: 'sched-sample-1',
          title: 'Sprint Planning & Action Review',
          date: initialDate.toISOString().split('T')[0],
          time: '14:30',
          durationMinutes: 45,
          description: 'Follow-up on sprint commitments and blockers.',
          attendees: ['Rahul S.', 'Sarah M.', 'Vikram P.'],
          meetingType: 'Sprint Planning',
          isAutoDetected: true,
          status: 'Scheduled',
        };
        setScheduledEvents([sampleEvent]);
      }

      // Saved Meetings
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedMeetings(parsed);
          setCurrentMeeting(parsed[0]);
        } else {
          setSavedMeetings(SAMPLE_MEETINGS);
          setCurrentMeeting(SAMPLE_MEETINGS[0]);
        }
      } else {
        setSavedMeetings(SAMPLE_MEETINGS);
        setCurrentMeeting(SAMPLE_MEETINGS[0]);
      }

      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (err) {
      console.error('Failed to load local storage data:', err);
    }
  }, []);

  // Save meetings to local storage whenever they change (respecting Ephemeral mode)
  const persistMeetings = (meetings: MeetingData[]) => {
    setSavedMeetings(meetings);
    if (privacySettings.ephemeralMode) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meetings));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  };

  // Persist scheduled events
  const persistScheduledEvents = (events: ScheduledEvent[]) => {
    setScheduledEvents(events);
    try {
      localStorage.setItem(SCHEDULED_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error writing schedules to localStorage:', e);
    }
  };

  // Update Privacy Settings
  const handleUpdatePrivacySettings = (newSettings: PrivacySettings) => {
    setPrivacySettings(newSettings);
    try {
      localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Error writing privacy settings:', e);
    }
  };

  // Clear all local data (Privacy Purge)
  const handleClearAllLocalData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SCHEDULED_EVENTS_KEY);
      setSavedMeetings([]);
      setScheduledEvents([]);
      setCurrentMeeting(null);
      setArmedEvent(null);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return next;
    });
  };

  // Helper to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handler for recorded voice audio
  const handleAudioRecorded = async (audioBlob: Blob, durationFormatted: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Uploading & analyzing voice recording with Gemini 3.7 Flash...');

    try {
      const base64Audio = await blobToBase64(audioBlob);

      setProcessingStatus('Transcribing speech, identifying speakers, and structuring decisions...');

      const response = await fetch('/api/generate-mom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: audioBlob.type || 'audio/webm',
          context: {
            duration: durationFormatted,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Minutes of Meeting');
      }

      let generatedMeeting: MeetingData = {
        ...data.meeting,
        duration: durationFormatted || data.meeting.duration,
      };

      // Apply Privacy & PII Redaction settings
      generatedMeeting = applyPrivacyToMeeting(generatedMeeting, privacySettings);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update state & persistence
      setCurrentMeeting(generatedMeeting);
      const updatedList = [generatedMeeting, ...savedMeetings.filter((m) => m.id !== generatedMeeting.id)];
      persistMeetings(updatedList);
    } catch (err: any) {
      console.error('Error generating MoM from audio:', err);
      setErrorMessage(err.message || 'An error occurred during audio processing. Please verify microphone audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for generated meeting directly from Live Monitor
  const handleGenerateFromMonitoring = async (audioBlob: Blob, liveTranscriptText: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Synthesizing Monitored Session with Gemini 3.7...');

    try {
      let base64Audio = '';
      if (audioBlob && audioBlob.size > 0) {
        base64Audio = await blobToBase64(audioBlob);
      }

      const response = await fetch('/api/generate-mom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio || undefined,
          transcriptText: liveTranscriptText || undefined,
          context: {
            title: armedEvent ? armedEvent.title : 'Live Monitored Session',
            meetingType: armedEvent?.meetingType || 'Live Monitoring',
            participants: armedEvent?.attendees?.join(', ') || undefined,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize monitored meeting');
      }

      let generatedMeeting: MeetingData = data.meeting;
      generatedMeeting = applyPrivacyToMeeting(generatedMeeting, privacySettings);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });

      setCurrentMeeting(generatedMeeting);
      const updatedList = [generatedMeeting, ...savedMeetings.filter((m) => m.id !== generatedMeeting.id)];
      persistMeetings(updatedList);
      setArmedEvent(null);
      setActiveInputTab('record');
    } catch (err: any) {
      console.error('Error synthesizing monitored meeting:', err);
      setErrorMessage(err.message || 'Failed to process monitored session.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for uploaded audio file
  const handleAudioFileSelected = async (file: File, context: MeetingContextOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus(`Uploading ${file.name} to Gemini AI...`);

    try {
      const base64Audio = await blobToBase64(file);
      setProcessingStatus('Extracting speakers, topics, decisions, and action items...');

      const response = await fetch('/api/generate-mom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: file.type || 'audio/mp3',
          context,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio file');
      }

      let generatedMeeting: MeetingData = data.meeting;
      generatedMeeting = applyPrivacyToMeeting(generatedMeeting, privacySettings);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCurrentMeeting(generatedMeeting);
      const updatedList = [generatedMeeting, ...savedMeetings.filter((m) => m.id !== generatedMeeting.id)];
      persistMeetings(updatedList);
    } catch (err: any) {
      console.error('Error processing audio file:', err);
      setErrorMessage(err.message || 'Failed to process audio file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for text / notes submitted
  const handleTextSubmitted = async (text: string, context: MeetingContextOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Synthesizing structured Minutes of Meeting from transcript notes...');

    try {
      const response = await fetch('/api/generate-mom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: text,
          context,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse text into MoM');
      }

      let generatedMeeting: MeetingData = data.meeting;
      generatedMeeting = applyPrivacyToMeeting(generatedMeeting, privacySettings);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCurrentMeeting(generatedMeeting);
      const updatedList = [generatedMeeting, ...savedMeetings.filter((m) => m.id !== generatedMeeting.id)];
      persistMeetings(updatedList);
    } catch (err: any) {
      console.error('Error processing text transcript:', err);
      setErrorMessage(err.message || 'Failed to process text into MoM.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Updates for active meeting fields
  const handleUpdateTitle = (newTitle: string) => {
    if (!currentMeeting) return;
    const updated = { ...currentMeeting, title: newTitle };
    setCurrentMeeting(updated);
    const updatedList = savedMeetings.map((m) => (m.id === updated.id ? updated : m));
    persistMeetings(updatedList);
  };

  const handleUpdateActionItems = (newItems: ActionItem[]) => {
    if (!currentMeeting) return;
    const updated = { ...currentMeeting, actionItems: newItems };
    setCurrentMeeting(updated);
    const updatedList = savedMeetings.map((m) => (m.id === updated.id ? updated : m));
    persistMeetings(updatedList);
  };

  const handleDeleteMeeting = (id: string) => {
    const updated = savedMeetings.filter((m) => m.id !== id);
    persistMeetings(updated);
    if (currentMeeting?.id === id) {
      setCurrentMeeting(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSelectSample = (sample: MeetingData) => {
    const sanitized = applyPrivacyToMeeting(sample, privacySettings);
    setCurrentMeeting(sanitized);
    if (!savedMeetings.some((m) => m.id === sanitized.id)) {
      persistMeetings([sanitized, ...savedMeetings]);
    }
  };

  // Scheduling Event Handlers
  const handleAddScheduledEvent = (event: ScheduledEvent) => {
    const nextList = [event, ...scheduledEvents.filter((e) => e.id !== event.id)];
    persistScheduledEvents(nextList);
  };

  const handleDeleteScheduledEvent = (id: string) => {
    const nextList = scheduledEvents.filter((e) => e.id !== id);
    persistScheduledEvents(nextList);
    if (armedEvent?.id === id) {
      setArmedEvent(null);
    }
  };

  const handleArmMonitoring = (event: ScheduledEvent) => {
    setArmedEvent(event);
    setActiveInputTab('monitor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo and Brand & Primary Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center gap-2.5 cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    VoiceMoM
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                    Studio
                  </span>
                </div>
              </div>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => navigate('/meetings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute.startsWith('/meetings')
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Meetings Hub</span>
              </button>

              <button
                onClick={() => navigate('/mom')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/mom' || currentRoute === '/'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Minutes of Meeting AI</span>
                <span className="sm:hidden">MoM AI</span>
              </button>

              <button
                id="voice-settings-nav-btn"
                onClick={() => navigate('/settings/voice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/settings/voice'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Voice & Wake Words</span>
                <span className="md:hidden">Voice</span>
              </button>

              <button
                id="schedule-settings-nav-btn"
                onClick={() => navigate('/settings/schedule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/settings/schedule'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Recording Schedule</span>
                <span className="md:hidden">Schedule</span>
              </button>

              <button
                id="privacy-settings-nav-btn"
                onClick={() => navigate('/settings/privacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/settings/privacy'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">Privacy & Security</span>
                <span className="md:hidden">Privacy</span>
              </button>

              <button
                id="billing-settings-nav-btn"
                onClick={() => navigate('/settings/billing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/settings/billing' || currentRoute === '/billing'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">Subscriptions & Usage</span>
                <span className="md:hidden">Plans</span>
              </button>

              <button
                id="location-settings-nav-btn"
                onClick={() => navigate('/settings/location')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentRoute === '/settings/location' || currentRoute === '/settings/geofence'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">Auto Mode & Geofences</span>
                <span className="md:hidden">Auto Mode</span>
              </button>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick New Meeting Button */}
            <button
              onClick={() => navigate('/meetings/new')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Meeting</span>
            </button>

            {/* Privacy Shield Direct Link Button */}
            <button
              id="open-privacy-btn"
              onClick={() => navigate('/settings/privacy')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
              title="Open Privacy, Security & Data Governance"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">Privacy Shield</span>
            </button>

            {/* Auto Schedule Hub Button */}
            <button
              id="open-scheduler-btn"
              onClick={() => setIsScheduleModalOpen(true)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
              title="View Auto-Scheduled meetings & Calendar Sync"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Follow-ups</span>
              {scheduledEvents.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                  {scheduledEvents.length}
                </span>
              )}
            </button>

            {/* History */}
            <button
              id="open-history-btn"
              onClick={() => setIsHistoryOpen(true)}
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition"
              title="View saved meetings"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">History</span>
              {savedMeetings.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                  {savedMeetings.length}
                </span>
              )}
            </button>

            {/* Theme */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Dark / Light mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Scheduled READY State Banner (Displays "Meeting recording is ready." when inside scheduled window) */}
      <ScheduledReadyBanner onNavigate={navigate} />

      {/* Geofence Location Auto-Mode Status HUD Banner */}
      <GeofenceAutoModeBanner onNavigate={navigate} onOpenSettings={() => navigate('/settings/location')} />

      {/* Main Container Routed Views */}
      {currentRoute === '/settings/location' || currentRoute === '/settings/geofence' ? (
        <main>
          <LocationGeofenceSettingsView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/billing' || currentRoute === '/billing' || currentRoute === '/settings/subscriptions' ? (
        <main>
          <BillingSubscriptionView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/privacy' ? (
        <main>
          <PrivacySettingsView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/schedule' ? (
        <main>
          <ScheduleSettingsView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/voice' ? (
        <main>
          <VoiceSettingsView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/meetings' ? (
        <main>
          <MeetingListView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/meetings/new' ? (
        <main>
          <NewMeetingView onNavigate={navigate} />
        </main>
      ) : currentRoute.startsWith('/meetings/') ? (
        <main>
          <MeetingDetailStudio
            meetingId={currentRoute.replace('/meetings/', '')}
            onNavigate={navigate}
            onGenerateMoM={(transcript) => {
              navigate('/');
              handleTextSubmitted(transcript, {
                title: 'Meeting Transcript MoM',
                meetingType: 'General Meeting',
              });
            }}
          />
        </main>
      ) : (
      /* Fallback to MoM Generator View */
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Error Processing Request</h4>
                <p className="mt-0.5 text-xs">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Processing Indicator Banner */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                Generating Minutes of Meeting
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {processingStatus}
              </p>
            </div>
          </div>
        )}

        {/* Top Input Area: Voice Record / Audio Upload / Live Ambient Monitor */}
        <section id="input-section" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Voice Meeting & Monitoring Engine</span>
                {privacySettings.enablePiiRedaction && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded">
                    PII Masking Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live mic capture, file upload, or continuous ambient meeting monitoring with strict privacy guarantees.
              </p>
            </div>

            {/* Input Method Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                id="mode-record-btn"
                onClick={() => setActiveInputTab('record')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                  activeInputTab === 'record'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3 h-3" />
                Live Mic
              </button>

              <button
                id="mode-upload-btn"
                onClick={() => setActiveInputTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                  activeInputTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" />
                Upload Audio
              </button>

              <button
                id="mode-monitor-btn"
                onClick={() => setActiveInputTab('monitor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                  activeInputTab === 'monitor'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Radio className={`w-3 h-3 ${armedEvent ? 'text-amber-300 animate-pulse' : ''}`} />
                <span>Live Monitor</span>
                {armedEvent && (
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                )}
              </button>
            </div>
          </div>

          {activeInputTab === 'record' && (
            <AudioRecorder onAudioRecorded={handleAudioRecorded} isProcessing={isProcessing} />
          )}

          {activeInputTab === 'upload' && (
            <AudioUploader
              onAudioFileSelected={handleAudioFileSelected}
              onTextSubmitted={handleTextSubmitted}
              isProcessing={isProcessing}
            />
          )}

          {activeInputTab === 'monitor' && (
            <LiveMeetingMonitor
              armedEvent={armedEvent}
              privacySettings={privacySettings}
              onGenerateFromMonitoring={handleGenerateFromMonitoring}
              onDisarm={() => setArmedEvent(null)}
              onOpenPrivacyCenter={() => setIsPrivacyModalOpen(true)}
            />
          )}
        </section>

        {/* Meeting Output Dashboard */}
        {currentMeeting ? (
          <section id="mom-dashboard" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Header with Title & Metadata & Quick Actions */}
            <MeetingHeader
              meeting={currentMeeting}
              onUpdateTitle={handleUpdateTitle}
              onOpenEmailModal={() => setIsEmailModalOpen(true)}
              onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
              onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onStartNewMeeting={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveInputTab('record');
              }}
              isChatOpen={isChatOpen}
            />

            {/* Section Tab Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
              {[
                { id: 'all', label: 'Complete MoM View', icon: Layers },
                { id: 'summary', label: 'Summary & Decisions', icon: CheckSquare },
                { id: 'actions', label: `Action Items (${currentMeeting.actionItems.length})`, icon: ListTodo },
                { id: 'topics', label: `Discussions (${currentMeeting.keyTopics.length})`, icon: FileText },
                { id: 'transcript', label: `Transcript (${currentMeeting.transcript.length})`, icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSectionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSectionTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* High Density Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Complete View (2 Columns) */}
              {activeSectionTab === 'all' ? (
                <>
                  {/* Left Column (Summary, Discussions, Transcript) */}
                  <div className={`${isChatOpen ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-8'} space-y-5`}>
                    <DiscussionsAndDecisions
                      executiveSummary={currentMeeting.executiveSummary}
                      decisions={currentMeeting.decisions}
                      keyTopics={currentMeeting.keyTopics}
                      risksAndBlockers={currentMeeting.risksAndBlockers}
                      openQuestions={currentMeeting.openQuestions}
                    />

                    <TranscriptViewer transcript={currentMeeting.transcript} />
                  </div>

                  {/* Right Column (Action Items, Participants, Side Chat) */}
                  <div className={`${isChatOpen ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-4'} space-y-5`}>
                    {isChatOpen ? (
                      <div className="sticky top-16">
                        <MeetingChatCopilot
                          meeting={currentMeeting}
                          onClose={() => setIsChatOpen(false)}
                        />
                      </div>
                    ) : (
                      <>
                        <ActionItemsList
                          actionItems={currentMeeting.actionItems}
                          onUpdateActionItems={handleUpdateActionItems}
                        />

                        <ParticipantsListCard participants={currentMeeting.participants} />
                      </>
                    )}
                  </div>
                </>
              ) : (
                /* Focused Single/Specific Tab View */
                <div className={`${isChatOpen ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} space-y-5`}>
                  {activeSectionTab === 'summary' && (
                    <DiscussionsAndDecisions
                      executiveSummary={currentMeeting.executiveSummary}
                      decisions={currentMeeting.decisions}
                      keyTopics={[]}
                      risksAndBlockers={currentMeeting.risksAndBlockers}
                      openQuestions={currentMeeting.openQuestions}
                    />
                  )}

                  {activeSectionTab === 'topics' && (
                    <DiscussionsAndDecisions
                      executiveSummary=""
                      decisions={[]}
                      keyTopics={currentMeeting.keyTopics}
                      risksAndBlockers={currentMeeting.risksAndBlockers}
                      openQuestions={currentMeeting.openQuestions}
                    />
                  )}

                  {activeSectionTab === 'actions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8">
                        <ActionItemsList
                          actionItems={currentMeeting.actionItems}
                          onUpdateActionItems={handleUpdateActionItems}
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <ParticipantsListCard participants={currentMeeting.participants} />
                      </div>
                    </div>
                  )}

                  {activeSectionTab === 'transcript' && (
                    <TranscriptViewer transcript={currentMeeting.transcript} />
                  )}
                </div>
              )}

              {/* Side AI Copilot Chat Drawer if opened in specific tab view */}
              {isChatOpen && activeSectionTab !== 'all' && (
                <div className="lg:col-span-5 xl:col-span-4 sticky top-16">
                  <MeetingChatCopilot
                    meeting={currentMeeting}
                    onClose={() => setIsChatOpen(false)}
                  />
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Meeting Minutes Loaded
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Start recording a voice session above, upload an audio file, or test with a sample meeting.
            </p>
            <button
              onClick={() => setIsSampleModalOpen(true)}
              className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              Load Sample Meeting
            </button>
          </div>
        )}
      </main>
      )}

      {/* Auto-Scheduler & Calendar Modal */}
      <AutoScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        meeting={currentMeeting}
        scheduledEvents={scheduledEvents}
        onAddEvent={handleAddScheduledEvent}
        onDeleteEvent={handleDeleteScheduledEvent}
        onArmMonitoring={handleArmMonitoring}
      />

      {/* Privacy Shield & Security Center Modal */}
      <PrivacyShieldModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={privacySettings}
        onUpdateSettings={handleUpdatePrivacySettings}
        onClearAllLocalData={handleClearAllLocalData}
      />

      {/* Email Draft Modal */}
      {currentMeeting && (
        <EmailDraftModal
          meeting={currentMeeting}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {/* History Sidebar */}
      <MeetingHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedMeetings={savedMeetings}
        currentMeetingId={currentMeeting?.id}
        onSelectMeeting={(m) => setCurrentMeeting(m)}
        onDeleteMeeting={handleDeleteMeeting}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
      />

      {/* Sample Meetings Selection Modal */}
      <SampleMeetingsModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Voice Assistant & Wake Word Detection Overlay */}
      <VoiceWakeWordBanner
        onNavigateToSettings={() => navigate('/settings/voice')}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <VoiceProvider>
      <ScheduleProvider>
        <GeofenceProvider>
          <PrivacyProvider>
            <SubscriptionProvider>
              <AppContent />
            </SubscriptionProvider>
          </PrivacyProvider>
        </GeofenceProvider>
      </ScheduleProvider>
    </VoiceProvider>
  );
}
