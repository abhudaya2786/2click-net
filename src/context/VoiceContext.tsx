import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  WakeWordItem,
  VoiceCommandItem,
  VoiceSystemConfig,
  VoiceListeningStatus,
  WakeWordDetectionEvent,
  VoiceCommandExecutionEvent,
  VoiceCommandAction,
  VoiceLanguageMode,
} from '../types';
import {
  DEFAULT_VOICE_CONFIG,
  DEFAULT_WAKE_WORDS,
  DEFAULT_VOICE_COMMANDS,
} from '../utils/voiceDefaults';
import { WakeWordProvider } from '../utils/wakeWordProvider';
import { VoiceCommandProvider } from '../utils/voiceCommandProvider';

const WAKE_WORDS_KEY = 'voice_mom_wake_words_v2';
const VOICE_COMMANDS_KEY = 'voice_mom_voice_commands_v2';
const VOICE_CONFIG_KEY = 'voice_mom_voice_config_v2';

interface VoiceContextValue {
  // Config & State
  config: VoiceSystemConfig;
  status: VoiceListeningStatus;
  isListening: boolean;
  isSupported: boolean;
  statusError?: string;
  interimTranscript: string;
  
  // Detection Alerts & Safety
  activeWakeWordAlert: WakeWordDetectionEvent | null;
  activeCommandAlert: VoiceCommandExecutionEvent | null;
  pendingActionConfirmation: {
    action: VoiceCommandAction;
    sourceEvent: WakeWordDetectionEvent | VoiceCommandExecutionEvent;
    title: string;
    description: string;
  } | null;

  // Providers
  wakeWordProvider: WakeWordProvider;
  voiceCommandProvider: VoiceCommandProvider;

  // Actions
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  toggleListening: () => void;
  dismissWakeWordAlert: () => void;
  confirmPendingAction: () => void;
  cancelPendingAction: () => void;

  // Wake Words CRUD
  addWakeWord: (item: Omit<WakeWordItem, 'id' | 'detectedCount'>) => void;
  updateWakeWord: (id: string, updates: Partial<WakeWordItem>) => void;
  deleteWakeWord: (id: string) => void;
  toggleWakeWord: (id: string, enabled?: boolean) => void;
  resetWakeWordsToDefault: () => void;

  // Voice Commands CRUD
  addVoiceCommand: (item: Omit<VoiceCommandItem, 'id' | 'executionCount'>) => void;
  updateVoiceCommand: (id: string, updates: Partial<VoiceCommandItem>) => void;
  deleteVoiceCommand: (id: string) => void;
  toggleVoiceCommand: (id: string, enabled?: boolean) => void;
  resetVoiceCommandsToDefault: () => void;

  // Config Update
  updateConfig: (updates: Partial<VoiceSystemConfig>) => void;
  setLanguageMode: (mode: VoiceLanguageMode) => void;

  // Simulator / Test Tool
  simulateSpokenPhrase: (phrase: string) => {
    wakeWordDetected: WakeWordDetectionEvent | null;
    commandExecuted: VoiceCommandExecutionEvent | null;
  };
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial configs from LocalStorage
  const [config, setConfig] = useState<VoiceSystemConfig>(() => {
    try {
      const saved = localStorage.getItem(VOICE_CONFIG_KEY);
      if (saved) return { ...DEFAULT_VOICE_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not parse voice config, using defaults');
    }
    return DEFAULT_VOICE_CONFIG;
  });

  const [wakeWords, setWakeWords] = useState<WakeWordItem[]>(() => {
    try {
      const saved = localStorage.getItem(WAKE_WORDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_WAKE_WORDS;
  });

  const [commands, setCommands] = useState<VoiceCommandItem[]>(() => {
    try {
      const saved = localStorage.getItem(VOICE_COMMANDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_VOICE_COMMANDS;
  });

  const [status, setStatus] = useState<VoiceListeningStatus>('idle');
  const [statusError, setStatusError] = useState<string | undefined>(undefined);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [activeWakeWordAlert, setActiveWakeWordAlert] = useState<WakeWordDetectionEvent | null>(null);
  const [activeCommandAlert, setActiveCommandAlert] = useState<VoiceCommandExecutionEvent | null>(null);
  const [pendingActionConfirmation, setPendingActionConfirmation] = useState<{
    action: VoiceCommandAction;
    sourceEvent: WakeWordDetectionEvent | VoiceCommandExecutionEvent;
    title: string;
    description: string;
  } | null>(null);

  // Provider Refs (Stable Singletons)
  const wakeWordProviderRef = useRef<WakeWordProvider>(
    new WakeWordProvider(wakeWords, config.isWakeWordEnabled)
  );
  const voiceCommandProviderRef = useRef<VoiceCommandProvider>(
    new VoiceCommandProvider(commands, config.isVoiceCommandEnabled)
  );

  const isSupported = wakeWordProviderRef.current.isSupported();

  // Play subtle feedback chime
  const playFeedbackChime = (type: 'wake' | 'command' | 'confirm') => {
    if (!config.audioFeedback || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'wake') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'command') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioCtx policy safe fallback
    }
  };

  // Sync wake words to provider & localStorage
  useEffect(() => {
    wakeWordProviderRef.current.setWakeWords(wakeWords);
    try {
      localStorage.setItem(WAKE_WORDS_KEY, JSON.stringify(wakeWords));
    } catch (e) {}
  }, [wakeWords]);

  // Sync commands to provider & localStorage
  useEffect(() => {
    voiceCommandProviderRef.current.setCommands(commands);
    try {
      localStorage.setItem(VOICE_COMMANDS_KEY, JSON.stringify(commands));
    } catch (e) {}
  }, [commands]);

  // Sync config
  useEffect(() => {
    wakeWordProviderRef.current.setEnabled(config.isWakeWordEnabled);
    wakeWordProviderRef.current.setLanguageMode(config.languageMode);
    voiceCommandProviderRef.current.setEnabled(config.isVoiceCommandEnabled);
    try {
      localStorage.setItem(VOICE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  // Bind Provider Event Listeners
  useEffect(() => {
    const wwProvider = wakeWordProviderRef.current;
    const cmdProvider = voiceCommandProviderRef.current;

    // Status Listener
    const unsubStatus = wwProvider.onStatusChange((newStatus, err) => {
      setStatus(newStatus);
      setStatusError(err);
    });

    // Interim speech transcript & command extraction listener
    const unsubSpeech = wwProvider.onInterimSpeech((text, isFinal) => {
      setInterimTranscript(text);

      // Check if text triggers a voice command
      if (config.isVoiceCommandEnabled) {
        const executed = cmdProvider.processTranscript(text);
        if (executed) {
          playFeedbackChime('command');
          setActiveCommandAlert(executed);

          // Update execution count in state
          setCommands(cmdProvider.getCommands());

          // Check if explicit consent is required before performing sensitive actions (e.g. recording start)
          if (
            config.requireExplicitConfirmationForRecording &&
            (executed.action === 'START_RECORDING' || executed.action === 'STOP_RECORDING')
          ) {
            setPendingActionConfirmation({
              action: executed.action,
              sourceEvent: executed,
              title: executed.action === 'START_RECORDING' ? 'Confirm Recording Activation' : 'Confirm Stop Recording',
              description: `Voice Command "${executed.command.phrase}" received. Tap confirm or grant prompt to proceed.`,
            });
          }

          // Auto-hide alert after 3.5 seconds
          setTimeout(() => {
            setActiveCommandAlert(null);
          }, 3500);
        }
      }
    });

    // Wake Word Detection Listener
    const unsubDetection = wwProvider.onDetection((event) => {
      playFeedbackChime('wake');
      setActiveWakeWordAlert(event);
      setWakeWords(wwProvider.getWakeWords());

      // If wake word is "Meeting Start", prepare recording activation
      if (
        event.wakeWord.word.toLowerCase().includes('start') ||
        event.rawTranscript.toLowerCase().includes('start')
      ) {
        setPendingActionConfirmation({
          action: 'START_RECORDING',
          sourceEvent: event,
          title: 'Activate Meeting Recording?',
          description: `Wake word "${event.wakeWord.word}" detected. Tap to confirm and initiate visible recording session.`,
        });
      }

      // Auto dismiss wake alert badge after 4.5 seconds if not interactive
      setTimeout(() => {
        setActiveWakeWordAlert((curr) => (curr?.timestamp === event.timestamp ? null : curr));
      }, 4500);
    });

    return () => {
      unsubStatus();
      unsubSpeech();
      unsubDetection();
    };
  }, [config.isVoiceCommandEnabled, config.requireExplicitConfirmationForRecording]);

  // Clean-up on page unload / component unmount to prevent covert background listening
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop listening when tab is inactive/hidden for privacy
        wakeWordProviderRef.current.stopListening();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeWordProviderRef.current.destroy();
      voiceCommandProviderRef.current.destroy();
    };
  }, []);

  // -------------------------------------------------------------
  // Actions API
  // -------------------------------------------------------------

  const startListening = useCallback(async () => {
    return await wakeWordProviderRef.current.startListening();
  }, []);

  const stopListening = useCallback(() => {
    wakeWordProviderRef.current.stopListening();
  }, []);

  const toggleListening = useCallback(() => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  const dismissWakeWordAlert = useCallback(() => {
    setActiveWakeWordAlert(null);
  }, []);

  const confirmPendingAction = useCallback(() => {
    if (!pendingActionConfirmation) return;
    const { action } = pendingActionConfirmation;
    playFeedbackChime('confirm');
    
    // Execute action directly on the command provider
    voiceCommandProviderRef.current.manuallyTriggerAction(action, 'User confirmed voice action');
    setPendingActionConfirmation(null);
  }, [pendingActionConfirmation]);

  const cancelPendingAction = useCallback(() => {
    setPendingActionConfirmation(null);
  }, []);

  // -------------------------------------------------------------
  // Wake Words CRUD
  // -------------------------------------------------------------

  const addWakeWord = useCallback((item: Omit<WakeWordItem, 'id' | 'detectedCount'>) => {
    const created = wakeWordProviderRef.current.addWakeWord(item);
    setWakeWords(wakeWordProviderRef.current.getWakeWords());
  }, []);

  const updateWakeWord = useCallback((id: string, updates: Partial<WakeWordItem>) => {
    wakeWordProviderRef.current.updateWakeWord(id, updates);
    setWakeWords(wakeWordProviderRef.current.getWakeWords());
  }, []);

  const deleteWakeWord = useCallback((id: string) => {
    wakeWordProviderRef.current.deleteWakeWord(id);
    setWakeWords(wakeWordProviderRef.current.getWakeWords());
  }, []);

  const toggleWakeWord = useCallback((id: string, enabled?: boolean) => {
    wakeWordProviderRef.current.toggleWakeWord(id, enabled);
    setWakeWords(wakeWordProviderRef.current.getWakeWords());
  }, []);

  const resetWakeWordsToDefault = useCallback(() => {
    setWakeWords(DEFAULT_WAKE_WORDS);
  }, []);

  // -------------------------------------------------------------
  // Voice Commands CRUD
  // -------------------------------------------------------------

  const addVoiceCommand = useCallback((item: Omit<VoiceCommandItem, 'id' | 'executionCount'>) => {
    voiceCommandProviderRef.current.addCommand(item);
    setCommands(voiceCommandProviderRef.current.getCommands());
  }, []);

  const updateVoiceCommand = useCallback((id: string, updates: Partial<VoiceCommandItem>) => {
    voiceCommandProviderRef.current.updateCommand(id, updates);
    setCommands(voiceCommandProviderRef.current.getCommands());
  }, []);

  const deleteVoiceCommand = useCallback((id: string) => {
    voiceCommandProviderRef.current.deleteCommand(id);
    setCommands(voiceCommandProviderRef.current.getCommands());
  }, []);

  const toggleVoiceCommand = useCallback((id: string, enabled?: boolean) => {
    voiceCommandProviderRef.current.toggleCommand(id, enabled);
    setCommands(voiceCommandProviderRef.current.getCommands());
  }, []);

  const resetVoiceCommandsToDefault = useCallback(() => {
    setCommands(DEFAULT_VOICE_COMMANDS);
  }, []);

  // -------------------------------------------------------------
  // Config Updates
  // -------------------------------------------------------------

  const updateConfig = useCallback((updates: Partial<VoiceSystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const setLanguageMode = useCallback((mode: VoiceLanguageMode) => {
    setConfig((prev) => ({ ...prev, languageMode: mode }));
  }, []);

  // -------------------------------------------------------------
  // Simulator for Manual Phrase Testing without mic
  // -------------------------------------------------------------

  const simulateSpokenPhrase = useCallback((phrase: string) => {
    const wake = wakeWordProviderRef.current.checkTextForWakeWord(phrase);
    if (wake) {
      playFeedbackChime('wake');
      setActiveWakeWordAlert(wake);
      setWakeWords(wakeWordProviderRef.current.getWakeWords());
    }

    const cmd = voiceCommandProviderRef.current.processTranscript(phrase);
    if (cmd) {
      playFeedbackChime('command');
      setActiveCommandAlert(cmd);
      setCommands(voiceCommandProviderRef.current.getCommands());
    }

    return {
      wakeWordDetected: wake,
      commandExecuted: cmd,
    };
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        config,
        status,
        isListening: status === 'listening',
        isSupported,
        statusError,
        interimTranscript,
        activeWakeWordAlert,
        activeCommandAlert,
        pendingActionConfirmation,
        wakeWordProvider: wakeWordProviderRef.current,
        voiceCommandProvider: voiceCommandProviderRef.current,
        startListening,
        stopListening,
        toggleListening,
        dismissWakeWordAlert,
        confirmPendingAction,
        cancelPendingAction,
        addWakeWord,
        updateWakeWord,
        deleteWakeWord,
        toggleWakeWord,
        resetWakeWordsToDefault,
        addVoiceCommand,
        updateVoiceCommand,
        deleteVoiceCommand,
        toggleVoiceCommand,
        resetVoiceCommandsToDefault,
        updateConfig,
        setLanguageMode,
        simulateSpokenPhrase,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
