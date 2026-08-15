import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  ShieldCheck,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
  Zap,
  Calendar,
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import {
  WakeWordItem,
  VoiceCommandItem,
  VoiceCommandAction,
  VoiceLanguageMode,
} from '../../types';

interface VoiceSettingsViewProps {
  onNavigate?: (path: string) => void;
}

const AVAILABLE_ACTIONS: { action: VoiceCommandAction; label: string; description: string }[] = [
  {
    action: 'START_RECORDING',
    label: 'Start Recording (START_RECORDING)',
    description: 'Starts command session record/transcribe (2Click Start / Meeting shuru karo).',
  },
  {
    action: 'STOP_RECORDING',
    label: 'Stop Recording (STOP_RECORDING)',
    description: 'Stops session, runs Gemini MoM, Instant Saves to user DB.',
  },
  {
    action: 'SAVE_NOTE',
    label: 'Save Note (SAVE_NOTE)',
    description: 'Same as stop: process with Gemini and Instant Save.',
  },
  {
    action: 'CANCEL_RECORDING',
    label: 'Cancel Recording (CANCEL_RECORDING)',
    description: 'Clears the session buffer without saving to the database.',
  },
  {
    action: 'GENERATE_MINUTES',
    label: 'Generate Minutes (GENERATE_MINUTES)',
    description: 'Runs AI synthesis on the transcript to extract summary, decisions, and tasks.',
  },
  {
    action: 'PAUSE_RECORDING',
    label: 'Pause Recording (PAUSE_RECORDING)',
    description: 'Temporarily halts audio capture without ending the session.',
  },
  {
    action: 'RESUME_RECORDING',
    label: 'Resume Recording (RESUME_RECORDING)',
    description: 'Resumes microphone capture for an existing session.',
  },
  {
    action: 'NEW_MEETING',
    label: 'New Meeting (NEW_MEETING)',
    description: 'Opens new meeting creation modal/view.',
  },
  {
    action: 'OPEN_MEETINGS',
    label: 'Open Meetings Hub (OPEN_MEETINGS)',
    description: 'Navigates to the central meetings list dashboard.',
  },
  {
    action: 'OPEN_SETTINGS',
    label: 'Open Settings (OPEN_SETTINGS)',
    description: 'Navigates to voice and system configuration.',
  },
  {
    action: 'ADD_DECISION',
    label: 'Add Decision (ADD_DECISION)',
    description: 'Prompts to record a quick agreed decision in the current session.',
  },
  {
    action: 'ADD_ACTION_ITEM',
    label: 'Add Action Item (ADD_ACTION_ITEM)',
    description: 'Prompts to register an action deliverable.',
  },
  {
    action: 'TOGGLE_MUTE',
    label: 'Toggle Mute (TOGGLE_MUTE)',
    description: 'Mutes or unmutes the active microphone channel.',
  },
];

export const VoiceSettingsView: React.FC<VoiceSettingsViewProps> = ({ onNavigate }) => {
  const {
    config,
    status,
    isListening,
    isSupported,
    statusError,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    wakeWordProvider,
    voiceCommandProvider,
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
  } = useVoice();

  const wakeWords = wakeWordProvider.getWakeWords();
  const commands = voiceCommandProvider.getCommands();

  const [activeTab, setActiveTab] = useState<
    'wake_words' | 'commands' | 'sandbox' | 'privacy' | 'general'
  >('general');

  // Wake Word Form State
  const [showAddWakeWord, setShowAddWakeWord] = useState(false);
  const [editingWakeWordId, setEditingWakeWordId] = useState<string | null>(null);
  const [wwWord, setWwWord] = useState('');
  const [wwAliases, setWwAliases] = useState('');
  const [wwLanguage, setWwLanguage] = useState<'hindi' | 'english' | 'hinglish' | 'multilingual'>('multilingual');
  const [wwSensitivity, setWwSensitivity] = useState<number>(0.85);

  // Command Form State
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [cmdPhrase, setCmdPhrase] = useState('');
  const [cmdAliases, setCmdAliases] = useState('');
  const [cmdAction, setCmdAction] = useState<VoiceCommandAction>('START_RECORDING');
  const [cmdLanguage, setCmdLanguage] = useState<'hindi' | 'english' | 'hinglish' | 'multilingual'>('multilingual');
  const [cmdDescription, setCmdDescription] = useState('');

  // Sandbox Simulator State
  const [simText, setSimText] = useState('Namaskar');
  const [simResult, setSimResult] = useState<any | null>(null);

  // -------------------------------------------------------------
  // Wake Word Handlers
  // -------------------------------------------------------------
  const handleSaveWakeWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wwWord.trim()) return;

    const aliasesArray = wwAliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (editingWakeWordId) {
      updateWakeWord(editingWakeWordId, {
        word: wwWord.trim(),
        aliases: aliasesArray,
        language: wwLanguage,
        sensitivity: wwSensitivity,
      });
      setEditingWakeWordId(null);
    } else {
      addWakeWord({
        word: wwWord.trim(),
        aliases: aliasesArray,
        language: wwLanguage,
        sensitivity: wwSensitivity,
        enabled: true,
      });
    }

    setWwWord('');
    setWwAliases('');
    setShowAddWakeWord(false);
  };

  const handleEditWakeWord = (item: WakeWordItem) => {
    setEditingWakeWordId(item.id);
    setWwWord(item.word);
    setWwAliases(item.aliases.join(', '));
    setWwLanguage(item.language);
    setWwSensitivity(item.sensitivity || 0.85);
    setShowAddWakeWord(true);
  };

  // -------------------------------------------------------------
  // Command Handlers
  // -------------------------------------------------------------
  const handleSaveCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdPhrase.trim()) return;

    const aliasesArray = cmdAliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (editingCommandId) {
      updateVoiceCommand(editingCommandId, {
        phrase: cmdPhrase.trim(),
        aliases: aliasesArray,
        action: cmdAction,
        language: cmdLanguage,
        description: cmdDescription.trim() || undefined,
      });
      setEditingCommandId(null);
    } else {
      addVoiceCommand({
        phrase: cmdPhrase.trim(),
        aliases: aliasesArray,
        action: cmdAction,
        language: cmdLanguage,
        description: cmdDescription.trim() || undefined,
        enabled: true,
      });
    }

    setCmdPhrase('');
    setCmdAliases('');
    setCmdDescription('');
    setShowAddCommand(false);
  };

  const handleEditCommand = (cmd: VoiceCommandItem) => {
    setEditingCommandId(cmd.id);
    setCmdPhrase(cmd.phrase);
    setCmdAliases(cmd.aliases.join(', '));
    setCmdAction(cmd.action);
    setCmdLanguage(cmd.language);
    setCmdDescription(cmd.description || '');
    setShowAddCommand(true);
  };

  const handleRunSimulation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simText.trim()) return;
    const res = simulateSpokenPhrase(simText.trim());
    setSimResult(res);
  };

  return (
    <div id="voice-settings-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Voice Commands & Wake Words
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Multilingual
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure hands-free wake phrases and voice command execution supporting Hindi, English, and Hinglish.
            </p>
          </div>
        </div>

        {/* Global Mic Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleListening}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2 transition cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isListening ? (
              <>
                <Radio className="w-4 h-4" />
                <span>Assistant Listening (Active)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Listening</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab('wake_words')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'wake_words'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Wake Words ({wakeWords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'commands'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Voice Commands ({commands.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Test & Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Foreground Model</span>
        </button>

        <button
          onClick={() => onNavigate?.('/settings/schedule')}
          className="ml-auto px-3.5 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800/60 shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Recording Schedule (/settings/schedule)</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB: GENERAL — Auto start + language */}
      {/* ========================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f9fe] text-[#002e6e] dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listening controls</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto start aur language — Voice Assistant Idle problem ke liye yahan se on karo.
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Auto start listening
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  App khulte hi mic sunna shuru — bina Idle pill pe tap kiye. Phone pe mic permission allow
                  karna zaroori hai.
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Auto start listening"
                checked={Boolean(config.autoStartListening)}
                onChange={(e) => {
                  updateConfig({ autoStartListening: e.target.checked });
                  if (e.target.checked) void startListening();
                  else stopListening();
                }}
                className="mt-1 w-5 h-5 accent-[#00baf2] rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Wake word detection
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Namaskar / Hello / 2Click Start jaise wake phrases.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.isWakeWordEnabled !== false}
                onChange={(e) => updateConfig({ isWakeWordEnabled: e.target.checked })}
                className="mt-1 w-5 h-5 accent-[#00baf2] rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Voice commands
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Start / Stop / Save note phrases execute honge.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.isVoiceCommandEnabled !== false}
                onChange={(e) => updateConfig({ isVoiceCommandEnabled: e.target.checked })}
                className="mt-1 w-5 h-5 accent-[#00baf2] rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#00baf2]" />
                Speech language
              </div>
              <select
                value={config.languageMode}
                onChange={(e) => setLanguageMode(e.target.value as VoiceLanguageMode)}
                className="w-full sm:max-w-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <option value="auto">Auto (Hinglish)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="en-IN">English India (en-IN)</option>
                <option value="en-US">English US (en-US)</option>
              </select>
            </div>

            {!isSupported && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                Is browser me Web Speech API nahi hai. Chrome/Edge use karo, ya Voice Assistant pe{' '}
                <strong>Start</strong> button se session chalao.
                {statusError ? ` ${statusError}` : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: WAKE WORDS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'wake_words' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Wake Words
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spoken phrases that awaken the voice assistant and display "Wake word detected".
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetWakeWordsToDefault}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                title="Restore default wake words"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => {
                  setEditingWakeWordId(null);
                  setWwWord('');
                  setWwAliases('');
                  setShowAddWakeWord(!showAddWakeWord);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wake Word</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Wake Word Form */}
          {showAddWakeWord && (
            <form
              onSubmit={handleSaveWakeWord}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {editingWakeWordId ? 'Edit Wake Word' : 'Create New Wake Word'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddWakeWord(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Primary Wake Phrase <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wwWord}
                    onChange={(e) => setWwWord(e.target.value)}
                    placeholder="e.g. Namaskar, Hello Assistant, Hey Meeting"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Language Type
                  </label>
                  <select
                    value={wwLanguage}
                    onChange={(e) => setWwLanguage(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="multilingual">Multilingual (Hindi, English, Hinglish)</option>
                    <option value="hindi">Hindi (Devanagari)</option>
                    <option value="hinglish">Hinglish (Hindi in Latin script)</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Phonetic Aliases / Variations (Comma separated)
                </label>
                <input
                  type="text"
                  value={wwAliases}
                  onChange={(e) => setWwAliases(e.target.value)}
                  placeholder="e.g. namaste, namaskar, namastey, नमस्कार, नमस्ते"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Add common accents, transliterations, and phonetic variants to ensure accurate matching.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!wwWord.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {editingWakeWordId ? 'Save Changes' : 'Add Wake Word'}
                </button>
              </div>
            </form>
          )}

          {/* Wake Words List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {wakeWords.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                        item.enabled
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          "{item.word}"
                        </h3>
                        {item.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Default
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      )}

                      {/* Aliases Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {item.aliases.map((al, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                          >
                            {al}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-2">
                        Detected: <span className="font-bold text-slate-600 dark:text-slate-300">{item.detectedCount || 0} times</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleWakeWord(item.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        item.enabled
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => handleEditWakeWord(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit wake word"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!item.isDefault && (
                      <button
                        onClick={() => deleteWakeWord(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete wake word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: VOICE COMMANDS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'commands' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Voice Commands Registry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Action triggers mapped to meeting operations like "Meeting Start", "Meeting Stop", and "Generate Minutes".
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetVoiceCommandsToDefault}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => {
                  setEditingCommandId(null);
                  setCmdPhrase('');
                  setCmdAliases('');
                  setCmdDescription('');
                  setShowAddCommand(!showAddCommand);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Command</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Command Form */}
          {showAddCommand && (
            <form
              onSubmit={handleSaveCommand}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {editingCommandId ? 'Edit Custom Voice Command' : 'Create Custom Voice Command'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCommand(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Command Trigger Phrase <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cmdPhrase}
                    onChange={(e) => setCmdPhrase(e.target.value)}
                    placeholder="e.g. Meeting Start or Faisla Note Karo"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Action Target <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cmdAction}
                    onChange={(e) => setCmdAction(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {AVAILABLE_ACTIONS.map((act) => (
                      <option key={act.action} value={act.action}>
                        {act.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Multilingual Trigger Aliases (Comma separated)
                </label>
                <input
                  type="text"
                  value={cmdAliases}
                  onChange={(e) => setCmdAliases(e.target.value)}
                  placeholder="e.g. meeting shuru karo, start recording, shuru kijiye, मीटिंग शुरू करो"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={cmdDescription}
                  onChange={(e) => setCmdDescription(e.target.value)}
                  placeholder="e.g. Starts the meeting audio recording stream"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!cmdPhrase.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {editingCommandId ? 'Save Command' : 'Register Command'}
                </button>
              </div>
            </form>
          )}

          {/* Commands List */}
          <div className="space-y-3">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className={`p-4 rounded-2xl border transition-all ${
                  cmd.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          "{cmd.phrase}"
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                          → {cmd.action}
                        </span>
                      </div>

                      {cmd.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {cmd.description}
                        </p>
                      )}

                      {/* Aliases */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {cmd.aliases.map((al, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                          >
                            {al}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => toggleVoiceCommand(cmd.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        cmd.enabled
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {cmd.enabled ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => handleEditCommand(cmd)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit command"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!cmd.isDefault && (
                      <button
                        onClick={() => deleteVoiceCommand(cmd.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete custom command"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LIVE TEST & SANDBOX SIMULATOR */}
      {/* ========================================================= */}
      {activeTab === 'sandbox' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Voice Command Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test wake words and voice command intent recognition by speaking into your microphone or typing phrase variants below.
              </p>
            </div>

            {/* Live Audio Speech Monitor */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isListening ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Microphone Recognition: {isListening ? 'Listening' : 'Idle'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {interimTranscript ? `Heard: "${interimTranscript}"` : 'Speak into your mic to test wake word matching'}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleListening}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer self-start sm:self-auto"
              >
                {isListening ? 'Pause Mic' : 'Start Mic Test'}
              </button>
            </div>


            {!isListening && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium">
                Mic band hai — pehle <span className="font-extrabold">Start Listening</span> / <span className="font-extrabold">Start Mic Test</span> dabao, phir bolo: “2Click Start”, “Meeting khatam”, “Save note”, ya “Cancel recording”.
                {!isSupported && ' Is browser me Web Speech API support nahi (Chrome/Edge use karo).'}
                {statusError ? ` (${statusError})` : ''}
              </div>
            )}

            {/* Text Simulator Form */}
            <form onSubmit={handleRunSimulation} className="space-y-3">
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Simulate Spoken Input (Hindi / English / Hinglish)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Type e.g. '2Click Start', 'Meeting khatam', 'Save note', 'Cancel recording'"
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Simulate
                </button>
              </div>
            </form>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Quick Tests:</span>
              {['2Click Start', 'Meeting shuru karo', 'Start recording', 'Cement delivery kal subah 10 baje', 'Meeting khatam', '2Click Stop', 'Save note', 'Cancel recording', 'मीटिंग शुरू करो'].map((txt) => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => {
                    setSimText(txt);
                    const res = simulateSpokenPhrase(txt);
                    setSimResult(res);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-[11px] transition cursor-pointer font-medium"
                >
                  "{txt}"
                </button>
              ))}
            </div>

            {/* Simulator Output Box */}
            {simResult && (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
                <div className="text-[10px] uppercase text-indigo-400 font-bold">
                  Simulation Parser Output:
                </div>
                <div className="space-y-1 text-slate-300">
                  <div>
                    <span className="text-amber-400 font-bold">Wake Word Spotting: </span>
                    {simResult.wakeWordDetected ? (
                      <span className="text-emerald-400 font-bold">
                        MATCHED → "{simResult.wakeWordDetected.wakeWord.word}" (Confidence: {simResult.wakeWordDetected.confidence * 100}%)
                      </span>
                    ) : (
                      <span className="text-slate-500">None detected</span>
                    )}
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold">Command Intent: </span>
                    {simResult.commandExecuted ? (
                      <span className="text-emerald-400 font-bold">
                        MATCHED → Action: [{simResult.commandExecuted.action}] via "{simResult.commandExecuted.command.phrase}"
                      </span>
                    ) : (
                      <span className="text-slate-500">No command matched</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PRIVACY & FOREGROUND MODEL */}
      {/* ========================================================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Strict Foreground Privacy Guarantees
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How Voice Commands and Wake Words operate safely in your browser.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No Covert Background Listening</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Speech recognition automatically detaches and suspends whenever you switch tabs or minimize the browser window.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Visible Consent State</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  When "Namaskar" is detected, a prominent "Wake word detected" banner is shown before initiating recording or state actions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Local Keyword Spotting</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Wake word matching is processed locally on the client without sending persistent stream feeds to third-party endpoints.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Explicit Recording Indicator</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Active audio recordings always render live pulsing state badges and visualizers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Beep + Vibration Feedback on Command Triggers
                </div>
                <div className="text-[11px] text-slate-400">
                  Subtle audio chime and haptic vibration when start / stop / cancel commands fire.
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.audioFeedback !== false && config.hapticFeedback !== false}
                onChange={(e) =>
                  updateConfig({ audioFeedback: e.target.checked, hapticFeedback: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Toggle Confirmation Checkbox */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Require Confirmation Modal Before Starting/Stopping Recordings
                </div>
                <div className="text-[11px] text-slate-400">
                  Ensures an explicit prompt appears on voice commands before media hardware changes state.
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.requireExplicitConfirmationForRecording}
                onChange={(e) => updateConfig({ requireExplicitConfirmationForRecording: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
