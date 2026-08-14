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
import {
  commandSessionController,
  CommandSessionSnapshot,
} from '../utils/commandSessionController';
import { playCommandFeedback } from '../utils/voiceFeedback';

const WAKE_WORDS_KEY = 'voice_mom_wake_words_v3';
const VOICE_COMMANDS_KEY = 'voice_mom_voice_commands_v3';
const VOICE_CONFIG_KEY = 'voice_mom_voice_config_v3';

const SESSION_ACTIONS: VoiceCommandAction[] = [
  'START_RECORDING',
  'STOP_RECORDING',
  'SAVE_NOTE',
  'CANCEL_RECORDING',
];

interface VoiceContextValue {
  config: VoiceSystemConfig;
  status: VoiceListeningStatus;
  isListening: boolean;
  isSupported: boolean;
  statusError?: string;
  interimTranscript: string;

  activeWakeWordAlert: WakeWordDetectionEvent | null;
  activeCommandAlert: VoiceCommandExecutionEvent | null;
  pendingActionConfirmation: {
    action: VoiceCommandAction;
    sourceEvent: WakeWordDetectionEvent | VoiceCommandExecutionEvent;
    title: string;
    description: string;
  } | null;

  /** Command-based record/transcribe/save session */
  commandSession: CommandSessionSnapshot;

  wakeWordProvider: WakeWordProvider;
  voiceCommandProvider: VoiceCommandProvider;

  startListening: () => Promise<boolean>;
  stopListening: () => void;
  toggleListening: () => void;
  dismissWakeWordAlert: () => void;
  confirmPendingAction: () => void;
  cancelPendingAction: () => void;

  addWakeWord: (item: Omit<WakeWordItem, 'id' | 'detectedCount'>) => void;
  updateWakeWord: (id: string, updates: Partial<WakeWordItem>) => void;
  deleteWakeWord: (id: string) => void;
  toggleWakeWord: (id: string, enabled?: boolean) => void;
  resetWakeWordsToDefault: () => void;

  addVoiceCommand: (item: Omit<VoiceCommandItem, 'id' | 'executionCount'>) => void;
  updateVoiceCommand: (id: string, updates: Partial<VoiceCommandItem>) => void;
  deleteVoiceCommand: (id: string) => void;
  toggleVoiceCommand: (id: string, enabled?: boolean) => void;
  resetVoiceCommandsToDefault: () => void;

  updateConfig: (updates: Partial<VoiceSystemConfig>) => void;
  setLanguageMode: (mode: VoiceLanguageMode) => void;

  simulateSpokenPhrase: (phrase: string) => {
    wakeWordDetected: WakeWordDetectionEvent | null;
    commandExecuted: VoiceCommandExecutionEvent | null;
  };
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

function feedbackForAction(action: VoiceCommandAction): 'start' | 'stop' | 'cancel' | 'command' {
  if (action === 'START_RECORDING') return 'start';
  if (action === 'CANCEL_RECORDING') return 'cancel';
  if (action === 'STOP_RECORDING' || action === 'SAVE_NOTE') return 'stop';
  return 'command';
}

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasCancel = parsed.some((c: VoiceCommandItem) => c.action === 'CANCEL_RECORDING');
          const hasSaveNote = parsed.some((c: VoiceCommandItem) => c.action === 'SAVE_NOTE');
          const has2Click = parsed.some(
            (c: VoiceCommandItem) =>
              /2\s*click\s*start/i.test(c.phrase) ||
              (c.aliases || []).some((a) => /2\s*click\s*start/i.test(a)),
          );
          if (hasCancel && hasSaveNote && has2Click) return parsed;
          // Merge missing command-session defaults
          const byId = new Map(parsed.map((c: VoiceCommandItem) => [c.id, c]));
          for (const d of DEFAULT_VOICE_COMMANDS) {
            if (!byId.has(d.id)) byId.set(d.id, d);
          }
          return Array.from(byId.values());
        }
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
  const [commandSession, setCommandSession] = useState<CommandSessionSnapshot>(() =>
    commandSessionController.snapshot(),
  );

  const wakeWordProviderRef = useRef<WakeWordProvider>(
    new WakeWordProvider(wakeWords, config.isWakeWordEnabled),
  );
  const voiceCommandProviderRef = useRef<VoiceCommandProvider>(
    new VoiceCommandProvider(commands, config.isVoiceCommandEnabled),
  );
  const configRef = useRef(config);
  configRef.current = config;

  const isSupported = wakeWordProviderRef.current.isSupported();

  const emitFeedback = useCallback((kind: 'start' | 'stop' | 'cancel' | 'wake' | 'command' | 'confirm') => {
    const cfg = configRef.current;
    playCommandFeedback(kind, {
      audio: cfg.audioFeedback !== false,
      haptic: cfg.hapticFeedback !== false,
    });
  }, []);

  // Sync wake words
  useEffect(() => {
    wakeWordProviderRef.current.setWakeWords(wakeWords);
    try {
      localStorage.setItem(WAKE_WORDS_KEY, JSON.stringify(wakeWords));
    } catch (e) {}
  }, [wakeWords]);

  // Sync commands
  useEffect(() => {
    voiceCommandProviderRef.current.setCommands(commands);
    commandSessionController.setCommandPhrases(commands);
    try {
      localStorage.setItem(VOICE_COMMANDS_KEY, JSON.stringify(commands));
    } catch (e) {}
  }, [commands]);

  // Sync config
  useEffect(() => {
    wakeWordProviderRef.current.setEnabled(config.isWakeWordEnabled);
    wakeWordProviderRef.current.setLanguageMode(config.languageMode);
    voiceCommandProviderRef.current.setEnabled(config.isVoiceCommandEnabled);
    commandSessionController.setSaveUrl(config.commandSessionSaveUrl || '');
    try {
      localStorage.setItem(VOICE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  // Command session snapshot subscription
  useEffect(() => {
    return commandSessionController.onChange(setCommandSession);
  }, []);

  // Register global command-session action handlers
  useEffect(() => {
    const provider = voiceCommandProviderRef.current;

    const unsubStart = provider.registerActionHandler('START_RECORDING', () => {
      if (commandSessionController.isRecording()) return;
      emitFeedback('start');
      void commandSessionController.start();
    });
    const unsubStop = provider.registerActionHandler('STOP_RECORDING', () => {
      if (!commandSessionController.isRecording()) return;
      emitFeedback('stop');
      void commandSessionController.stopAndSave();
    });
    const unsubSave = provider.registerActionHandler('SAVE_NOTE', () => {
      if (!commandSessionController.isRecording()) return;
      emitFeedback('stop');
      void commandSessionController.stopAndSave();
    });
    const unsubCancel = provider.registerActionHandler('CANCEL_RECORDING', () => {
      if (!commandSessionController.isRecording()) return;
      emitFeedback('cancel');
      void commandSessionController.cancel();
    });

    return () => {
      unsubStart();
      unsubStop();
      unsubSave();
      unsubCancel();
    };
  }, [emitFeedback]);

  // Bind Provider Event Listeners
  useEffect(() => {
    const wwProvider = wakeWordProviderRef.current;
    const cmdProvider = voiceCommandProviderRef.current;

    const unsubStatus = wwProvider.onStatusChange((newStatus, err) => {
      setStatus(newStatus);
      setStatusError(err);
    });

    const unsubSpeech = wwProvider.onInterimSpeech((text, isFinal) => {
      setInterimTranscript(text);

      // Accumulate speech only after start-command session is active
      if (commandSessionController.isRecording()) {
        commandSessionController.appendSpeech(text, isFinal);
      }

      if (!configRef.current.isVoiceCommandEnabled) return;

      const tentative = cmdProvider.findMatchingCommand(text);
      if (!tentative) return;

      const needsConfirm =
        configRef.current.requireExplicitConfirmationForRecording &&
        (tentative.action === 'START_RECORDING' ||
          tentative.action === 'STOP_RECORDING' ||
          tentative.action === 'SAVE_NOTE' ||
          tentative.action === 'CANCEL_RECORDING');

      const executed = cmdProvider.processTranscript(text, {
        executeHandlers: !needsConfirm,
      });
      if (!executed) return;

      if (needsConfirm) {
        setActiveCommandAlert(executed);
        setPendingActionConfirmation({
          action: executed.action,
          sourceEvent: executed,
          title:
            executed.action === 'START_RECORDING'
              ? 'Confirm Recording Activation'
              : executed.action === 'CANCEL_RECORDING'
                ? 'Confirm Cancel Recording'
                : 'Confirm Stop & Save',
          description: `Voice Command "${executed.command.phrase}" received. Tap confirm to proceed.`,
        });
        emitFeedback('command');
        setCommands(cmdProvider.getCommands());
        setTimeout(() => setActiveCommandAlert(null), 3500);
        return;
      }

      if (!SESSION_ACTIONS.includes(executed.action)) {
        emitFeedback('command');
      }
      setActiveCommandAlert(executed);
      setCommands(cmdProvider.getCommands());
      setTimeout(() => setActiveCommandAlert(null), 3500);
    });

    const unsubDetection = wwProvider.onDetection((event) => {
      emitFeedback('wake');
      setActiveWakeWordAlert(event);
      setWakeWords(wwProvider.getWakeWords());

      // Direct start wake phrases can arm recording when confirmation is on
      const word = event.wakeWord.word.toLowerCase();
      if (
        configRef.current.requireExplicitConfirmationForRecording &&
        (word.includes('start') || event.rawTranscript.toLowerCase().includes('start'))
      ) {
        setPendingActionConfirmation({
          action: 'START_RECORDING',
          sourceEvent: event,
          title: 'Activate Meeting Recording?',
          description: `Wake word "${event.wakeWord.word}" detected. Tap to confirm and initiate visible recording session.`,
        });
      }

      setTimeout(() => {
        setActiveWakeWordAlert((curr) => (curr?.timestamp === event.timestamp ? null : curr));
      }, 4500);
    });

    return () => {
      unsubStatus();
      unsubSpeech();
      unsubDetection();
    };
  }, [emitFeedback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wakeWordProviderRef.current.stopListening();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeWordProviderRef.current.destroy();
      voiceCommandProviderRef.current.destroy();
      commandSessionController.destroy();
    };
  }, []);

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
    emitFeedback(feedbackForAction(action));
    voiceCommandProviderRef.current.manuallyTriggerAction(action, 'User confirmed voice action');
    setPendingActionConfirmation(null);
  }, [pendingActionConfirmation, emitFeedback]);

  const cancelPendingAction = useCallback(() => {
    setPendingActionConfirmation(null);
  }, []);

  const addWakeWord = useCallback((item: Omit<WakeWordItem, 'id' | 'detectedCount'>) => {
    wakeWordProviderRef.current.addWakeWord(item);
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

  const updateConfig = useCallback((updates: Partial<VoiceSystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const setLanguageMode = useCallback((mode: VoiceLanguageMode) => {
    setConfig((prev) => ({ ...prev, languageMode: mode }));
  }, []);

  const simulateSpokenPhrase = useCallback(
    (phrase: string) => {
      const wake = wakeWordProviderRef.current.checkTextForWakeWord(phrase);
      if (wake) {
        emitFeedback('wake');
        setActiveWakeWordAlert(wake);
        setWakeWords(wakeWordProviderRef.current.getWakeWords());
      }

      const cmd = voiceCommandProviderRef.current.processTranscript(phrase);
      if (cmd) {
        if (!SESSION_ACTIONS.includes(cmd.action)) {
          emitFeedback('command');
        }
        setActiveCommandAlert(cmd);
        setCommands(voiceCommandProviderRef.current.getCommands());
      }

      return {
        wakeWordDetected: wake,
        commandExecuted: cmd,
      };
    },
    [emitFeedback],
  );

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
        commandSession,
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
