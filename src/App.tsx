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
import { COMMAND_SESSION_NOTE_EVENT } from './utils/buildCommandSessionMeeting';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView, AccountView } from './components/auth/AuthView';
import { CompanySettingsView } from './components/company/CompanySettingsView';
import { FieldTalkView } from './components/company/FieldTalkView';
import { RealEstateSalesLanding } from './components/company/RealEstateSalesLanding';
import { OwnerInboxView } from './components/inbox/OwnerInboxView';
import {
  CreditCard,
  Compass,
  MapPin,
  Power,
  MoreHorizontal,
  Settings2,
  X,
  FileAudio,
  LogIn,
  User,
  Inbox,
  Building2,
} from 'lucide-react';
import { MobileInstallBanner } from './components/MobileInstallBanner';
import { RecordingsLibraryView } from './components/recordings/RecordingsLibraryView';
import { LandingPage } from './components/landing/LandingPage';
import { RecordingConsentBanner } from './components/recording/RecordingConsentBanner';
import { PhoneCallView } from './components/phone/PhoneCallView';

const LOCAL_STORAGE_KEY = 'voice_mom_saved_meetings_v1';
const SCHEDULED_EVENTS_KEY = 'voice_mom_scheduled_events_v1';
const PRIVACY_SETTINGS_KEY = 'voice_mom_privacy_settings_v1';
const THEME_KEY = 'voice_mom_theme';

function AppContent() {
  // Navigation / Routing State for /meetings, /meetings/new, /meetings/[id], /settings/voice
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const p = window.location.pathname;
    if (p === '/' || p === '') return '/';
    if (
      p.startsWith('/meetings') ||
      p.startsWith('/settings') ||
      p.startsWith('/recordings') ||
      p === '/mom' ||
      p === '/signin' ||
      p === '/signup' ||
      p === '/login' ||
      p === '/account' ||
      p === '/inbox' ||
      p === '/field-talk' ||
      p === '/for-real-estate' ||
      p === '/sales' ||
      p === '/company' ||
      p === '/files' ||
      p === '/phone' ||
      p === '/phone-call'
    ) {
      return p === '/login' ? '/signin' : p === '/sales' ? '/for-real-estate' : p === '/phone-call' ? '/phone' : p;
    }
    return '/';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { voiceCommandProvider } = useVoice();
  const { user, isAuthenticated, signout } = useAuth();

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
  const [isMoreOpen, setIsMoreOpen] = useState(false);

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

  // Voice command sessions write MoM notes into localStorage — keep App UI in sync
  useEffect(() => {
    const onNoteSaved = (ev: Event) => {
      const meeting = (ev as CustomEvent)?.detail?.meeting as MeetingData | undefined;
      if (!meeting?.id) return;
      setSavedMeetings((prev) => {
        const next = [meeting, ...prev.filter((m) => m.id !== meeting.id)];
        try {
          if (!privacySettings.ephemeralMode) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
          }
        } catch {
          /* ignore */
        }
        return next;
      });
      setCurrentMeeting(meeting);
      // Show the MoM document immediately after voice stop/save
      navigate('/mom');
    };
    window.addEventListener(COMMAND_SESSION_NOTE_EVENT, onNoteSaved as EventListener);
    return () => window.removeEventListener(COMMAND_SESSION_NOTE_EVENT, onNoteSaved as EventListener);
  }, [privacySettings.ephemeralMode]);

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
    setProcessingStatus('Saving voice file to your recordings library...');

    try {
      const base64Audio = await blobToBase64(audioBlob);
      const durationParts = durationFormatted.split(':').map((x) => Number(x) || 0);
      const durationSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts.length === 2
            ? durationParts[0] * 60 + durationParts[1]
            : durationParts[0] || 0;

      // Always persist a user-visible copy (Downloads / Documents/2ClickMoM/Recordings)
      const meetingIdForRec = currentMeeting?.id || `standalone-${Date.now()}`;
      try {
        const savedRec = await meetingDb.saveRecording(meetingIdForRec, {
          mimeType: audioBlob.type || 'audio/webm',
          durationSeconds,
          fileSizeBytes: audioBlob.size,
          audioData: base64Audio,
          blob: audioBlob,
          saveToDevice: true,
          status: 'Saved',
        });
        setProcessingStatus(
          savedRec.localPath
            ? `Saved: ${savedRec.localPath}`
            : 'Recording saved to library. Generating MoM...',
        );
      } catch (saveErr) {
        console.warn('Recording library save failed', saveErr);
      }

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
      // Jump to recordings library so user can see the file path
      navigate('/recordings');
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

  const primaryNav = [
    { path: '/meetings', match: (r: string) => r.startsWith('/meetings'), label: 'Meetings', icon: Layers },
    { path: '/mom', match: (r: string) => r === '/mom' || r === '/', label: 'MoM AI', icon: Sparkles },
    { path: '/inbox', match: (r: string) => r === '/inbox', label: 'Owner Inbox', icon: Inbox },
    { path: '/field-talk', match: (r: string) => r === '/field-talk', label: 'Field Talk', icon: Radio },
  ];

  const moreNav = [
    { path: '/for-real-estate', label: 'Sell to RE Marketing', icon: Building2, id: 're-sales-nav-btn' },
    { path: '/settings/company', label: 'Company & Report Routing', icon: Building2, id: 'company-settings-nav-btn' },
    { path: '/phone', label: 'Phone Call Module', icon: Radio, id: 'phone-call-nav-btn' },
    { path: '/account', label: 'Account', icon: User, id: 'account-nav-btn' },
    { path: '/recordings', label: 'Voice Files & Location', icon: FileAudio, id: 'recordings-library-nav-btn' },
    { path: '/settings/voice', label: 'Voice & Wake Words', icon: Mic, id: 'voice-settings-nav-btn' },
    { path: '/settings/schedule', label: 'Recording Schedule', icon: Calendar, id: 'schedule-settings-nav-btn' },
    { path: '/settings/privacy', label: 'Privacy & Security', icon: ShieldCheck, id: 'privacy-settings-nav-btn' },
    { path: '/settings/billing', label: 'Plans & Usage', icon: CreditCard, id: 'billing-settings-nav-btn' },
    { path: '/settings/location', label: 'Auto Mode & Geofence', icon: MapPin, id: 'location-settings-nav-btn' },
  ];

  const go = (path: string) => {
    setIsMoreOpen(false);
    navigate(path);
  };

  return (
    <div className="app-shell text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <MobileInstallBanner />
      <RecordingConsentBanner />
      {/* Compact top bar — fits one viewport row; hidden on mobile meetings home (page owns brand) */}
      {currentRoute !== '/' && (
      <header
        className={`app-header shrink-0 z-40 pt-safe ${
          currentRoute === '/meetings' ? 'hidden md:block' : ''
        }`}
      >        <div className="mx-auto max-w-6xl px-3 sm:px-4 h-[var(--app-header-h)] flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => go('/meetings')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-hs-500 to-hs-700 text-white flex items-center justify-center group-hover:brightness-110 transition">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[15px] font-extrabold tracking-tight text-slate-950 dark:text-white truncate">
                2Click<span className="hs-accent">MoM</span>
              </div>
              <div className="hidden sm:block text-[10px] font-semibold text-slate-500">
                Voice MoM · 2click.in
              </div>
            </div>
          </button>

          <nav className="hidden sm:flex items-center ml-2 bg-slate-100/80 dark:bg-slate-900/80 p-0.5 rounded-lg text-xs font-bold">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = item.match(currentRoute);
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-hs-700 dark:text-hs-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated && user ? (
              <button
                id="account-header-btn"
                onClick={() => go('/account')}
                className="btn-hs-secondary !px-2.5 max-w-[9rem]"
                title={`Signed in as @${user.userId}`}
              >
                <User className="w-3.5 h-3.5 text-hs-600" />
                <span className="hidden sm:inline truncate font-mono text-[11px]">
                  @{user.userId}
                </span>
              </button>
            ) : (
              <>
                <button
                  id="signin-header-btn"
                  onClick={() => go('/signin')}
                  className="btn-hs-secondary !px-2.5 hidden sm:inline-flex"
                  title="Sign In"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  id="signup-header-btn"
                  onClick={() => go('/signup')}
                  className="btn-hs !px-2.5"
                  title="Sign Up"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </>
            )}

            <button
              onClick={() => go('/meetings/new')}
              className="btn-hs hidden sm:inline-flex"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Try for free</span>
            </button>

            <button
              id="open-history-btn"
              onClick={() => setIsHistoryOpen(true)}
              className="btn-hs-secondary relative !px-2.5 hidden sm:inline-flex"
              title="History"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">History</span>
              {savedMeetings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-hs-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {savedMeetings.length}
                </span>
              )}
            </button>

            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="btn-hs-secondary !px-2"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <div className="relative">
              <button
                id="open-more-btn"
                onClick={() => setIsMoreOpen((v) => !v)}
                className={`btn-hs-secondary !px-2 ${
                  isMoreOpen || currentRoute.startsWith('/settings')
                    ? '!border-hs-300 !bg-hs-50 dark:!bg-hs-900/40 !text-hs-800 dark:!text-hs-300'
                    : ''
                }`}
                title="More settings"
              >
                {isMoreOpen ? <X className="w-3.5 h-3.5" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
              </button>

              {isMoreOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setIsMoreOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-1.5">
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Settings2 className="w-3 h-3" /> Settings
                    </div>
                    {moreNav.map((item) => {
                      const Icon = item.icon;
                      const active = currentRoute === item.path || currentRoute.startsWith(item.path);
                      return (
                        <button
                          key={item.path}
                          id={item.id}
                          onClick={() => go(item.path)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold transition cursor-pointer ${
                            active
                              ? 'bg-hs-50 dark:bg-hs-900/50 text-hs-800 dark:text-hs-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {item.label}
                        </button>
                      );
                    })}
                    {isAuthenticated ? (
                      <button
                        id="signout-menu-btn"
                        onClick={() => {
                          setIsMoreOpen(false);
                          void signout().then(() => navigate('/signin'));
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 shrink-0 rotate-180" />
                        Sign out
                      </button>
                    ) : (
                      <button
                        id="signin-menu-btn"
                        onClick={() => go('/signin')}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-hs-700 dark:text-hs-300 hover:bg-hs-50 dark:hover:bg-hs-950/40 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 shrink-0" />
                        Sign In / Sign Up
                      </button>
                    )}
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      id="open-scheduler-btn"
                      onClick={() => {
                        setIsMoreOpen(false);
                        setIsScheduleModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Follow-ups
                      {scheduledEvents.length > 0 && (
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {scheduledEvents.length}
                        </span>
                      )}
                    </button>
                    <button
                      id="open-privacy-btn"
                      onClick={() => go('/settings/privacy')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Privacy Shield
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      )}

      <div className={`app-main ${currentRoute === '/' ? '!pt-0' : ''}`}>
      {/* Scheduled READY State Banner */}
      {currentRoute !== '/' && <ScheduledReadyBanner onNavigate={navigate} />}

      {/* Geofence Location Auto-Mode Status HUD Banner */}
      {currentRoute !== '/' && (
        <GeofenceAutoModeBanner onNavigate={navigate} onOpenSettings={() => navigate('/settings/location')} />
      )}

      {/* Landing is full-bleed — skip padded shell */}
      {currentRoute === '/' ? (
        <LandingPage onNavigate={navigate} />
      ) : (
      <div className="app-main-inner">
      {/* Main Container Routed Views */}
      {currentRoute === '/signin' || currentRoute === '/login' ? (
        <main>
          <AuthView mode="signin" onNavigate={navigate} />
        </main>
      ) : currentRoute === '/signup' ? (
        <main>
          <AuthView mode="signup" onNavigate={navigate} />
        </main>
      ) : currentRoute === '/account' ? (
        <main>
          <AccountView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/phone' ? (
        <main>
          <PhoneCallView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/for-real-estate' || currentRoute === '/sales' ? (
        <main>
          <RealEstateSalesLanding onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/company' || currentRoute === '/company' ? (
        <main>
          <CompanySettingsView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/field-talk' ? (
        <main>
          <FieldTalkView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/inbox' ? (
        <main>
          <OwnerInboxView onNavigate={navigate} />
        </main>
      ) : currentRoute === '/settings/location' || currentRoute === '/settings/geofence' ? (
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
      ) : currentRoute === '/recordings' || currentRoute === '/files' ? (
        <main className="px-3 sm:px-4 py-4">
          <RecordingsLibraryView
            onOpenMeeting={(id) => navigate(`/meetings/${id}`)}
          />
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
      <main className="space-y-5">
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
          <div className="p-4 rounded-xl bg-hs-50/70 dark:bg-hs-900/40 border border-hs-200 dark:border-hs-800 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-lg bg-hs-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                Generating Minutes of Meeting
                <Sparkles className="w-3.5 h-3.5 text-hs-500 animate-pulse" />
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
                    ? 'bg-white dark:bg-slate-900 text-hs-600 dark:text-hs-400 shadow-2xs font-semibold'
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
                    ? 'bg-white dark:bg-slate-900 text-hs-600 dark:text-hs-400 shadow-2xs font-semibold'
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
                        ? 'bg-hs-600 text-white font-semibold shadow-2xs'
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
            <div className="w-12 h-12 rounded-xl bg-hs-50 dark:bg-hs-900 text-hs-600 dark:text-hs-400 flex items-center justify-center mx-auto mb-3">
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
              className="mt-3 px-3.5 py-1.5 bg-hs-600 text-white rounded-lg text-xs font-semibold hover:bg-hs-700 transition cursor-pointer"
            >
              Load Sample Meeting
            </button>
          </div>
        )}
      </main>
      )}
      </div>
      )}
      </div>

      {/* Mobile bottom nav — floating app tab bar */}
      {currentRoute !== '/' && (
      <nav id="mobile-bottom-nav" className="md:hidden no-print app-tabbar-wrap">
        <div className="app-tabbar grid grid-cols-4">
          {[
            { path: '/meetings', label: 'Meetings', icon: Layers, active: currentRoute.startsWith('/meetings') && currentRoute !== '/meetings/new' },
            { path: '/mom', label: 'MoM AI', icon: Sparkles, active: currentRoute === '/mom' },
            { path: '/field-talk', label: 'Talk', icon: Radio, active: currentRoute === '/field-talk' },
            { path: '/inbox', label: 'Inbox', icon: Inbox, active: currentRoute === '/inbox' || currentRoute.startsWith('/settings') || currentRoute === '/account' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                aria-label={item.label}
                aria-current={item.active ? 'page' : undefined}
                className={`app-tabbar-btn ${item.active ? 'is-active' : ''}`}
              >
                <span className="app-tab-icon">
                  <Icon className="w-5 h-5" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
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
    <AuthProvider>
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
    </AuthProvider>
  );
}
