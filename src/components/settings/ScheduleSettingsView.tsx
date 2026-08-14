import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Edit3,
  Power,
  RotateCcw,
  Sparkles,
  Info,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  Save,
  X,
  Volume2,
  Mic,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { DayOfWeek, MeetingScheduleEntity } from '../../types';
import {
  ALL_DAYS_OF_WEEK,
  COMMON_TIMEZONES,
  WORKING_DAYS_PRESETS,
  format12To24Hour,
  format24To12Hour,
  formatWorkingDaysSummary,
  getDetectedTimezone,
  getTimeDetailsInTimezone,
  evaluateSchedule,
} from '../../utils/timezoneHelper';

interface ScheduleSettingsViewProps {
  onNavigate?: (path: string) => void;
}

export const ScheduleSettingsView: React.FC<ScheduleSettingsViewProps> = ({ onNavigate }) => {
  const {
    schedules,
    loading,
    activeSchedule,
    scheduleStatus,
    isReadyStateActive,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
  } = useSchedule();

  // Form State for Active / Selected Schedule Editing
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [name, setName] = useState<string>('Standard Working Hours');
  const [workingDays, setWorkingDays] = useState<DayOfWeek[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('18:30');
  const [timezone, setTimezone] = useState<string>(getDetectedTimezone());
  const [enabled, setEnabled] = useState<boolean>(true);
  const [autoReadyState, setAutoReadyState] = useState<boolean>(true);
  const [notifyOnReady, setNotifyOnReady] = useState<boolean>(true);

  const [tzSearchQuery, setTzSearchQuery] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Simulation Sandbox State
  const [simDate, setSimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [simTime, setSimTime] = useState<string>('10:00');
  const [simDay, setSimDay] = useState<DayOfWeek>('Monday');
  const [simResult, setSimResult] = useState<any>(null);

  // Populate form when activeSchedule changes
  useEffect(() => {
    if (activeSchedule && !editingScheduleId && !isCreatingNew) {
      setName(activeSchedule.name);
      setWorkingDays(activeSchedule.workingDays);
      setStartTime(activeSchedule.startTime);
      setEndTime(activeSchedule.endTime);
      setTimezone(activeSchedule.timezone);
      setEnabled(activeSchedule.enabled);
      setAutoReadyState(activeSchedule.autoReadyState ?? true);
      setNotifyOnReady(activeSchedule.notifyOnReady ?? true);
    }
  }, [activeSchedule, editingScheduleId, isCreatingNew]);

  // Handle Day Toggle
  const toggleDay = (day: DayOfWeek) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) return; // Keep at least one day
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Apply Day Preset
  const applyPreset = (presetDays: DayOfWeek[]) => {
    setWorkingDays(presetDays);
  };

  // Save Schedule Form
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workingDays.length === 0) {
      alert('Please select at least one working day.');
      return;
    }

    try {
      if (isCreatingNew) {
        await createSchedule({
          name: name.trim() || 'Custom Schedule',
          workingDays,
          startTime,
          endTime,
          timezone,
          enabled,
          autoReadyState,
          notifyOnReady,
        });
        setIsCreatingNew(false);
        setEditingScheduleId(null);
        setSaveSuccessMsg('New recording schedule successfully created and saved to database!');
      } else if (editingScheduleId) {
        await updateSchedule(editingScheduleId, {
          name: name.trim() || 'Recording Schedule',
          workingDays,
          startTime,
          endTime,
          timezone,
          enabled,
          autoReadyState,
          notifyOnReady,
        });
        setEditingScheduleId(null);
        setSaveSuccessMsg('Schedule updated successfully in database!');
      } else if (activeSchedule) {
        await updateSchedule(activeSchedule.id, {
          name: name.trim() || 'Recording Schedule',
          workingDays,
          startTime,
          endTime,
          timezone,
          enabled,
          autoReadyState,
          notifyOnReady,
        });
        setSaveSuccessMsg('Schedule settings updated successfully!');
      }
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Failed to save schedule: ' + err.message);
    }
  };

  // Reset to Example Default (Monday-Saturday, 09:30 AM - 06:30 PM)
  const handleResetToExampleDefault = () => {
    setName('General Business Recording Schedule');
    setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setStartTime('09:30');
    setEndTime('18:30');
    setTimezone('Asia/Kolkata');
    setEnabled(true);
    setAutoReadyState(true);
    setNotifyOnReady(true);
  };

  // Filtered Timezones
  const filteredTimezones = COMMON_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(tzSearchQuery.toLowerCase()) ||
      tz.value.toLowerCase().includes(tzSearchQuery.toLowerCase()) ||
      tz.region.toLowerCase().includes(tzSearchQuery.toLowerCase())
  );

  // Live Time details for currently selected timezone in form
  const selectedTzDetails = getTimeDetailsInTimezone(timezone);

  // Run Test Simulation
  const handleRunSimulation = () => {
    const tempSched: MeetingScheduleEntity = {
      id: 'sim',
      name,
      workingDays,
      startTime,
      endTime,
      timezone,
      enabled,
      autoReadyState,
      notifyOnReady,
      createdAt: '',
      updatedAt: '',
    };

    // Construct mock simulation date
    const [h, m] = simTime.split(':').map((x) => parseInt(x, 10) || 0);
    const mockDate = new Date(`${simDate}T12:00:00Z`);
    // Evaluate with simulated time
    const isDayMatch = workingDays.includes(simDay);
    const startMins = parseInt(startTime.split(':')[0], 10) * 60 + parseInt(startTime.split(':')[1] || '0', 10);
    const endMins = parseInt(endTime.split(':')[0], 10) * 60 + parseInt(endTime.split(':')[1] || '0', 10);
    const curMins = h * 60 + m;
    const isTimeMatch = curMins >= startMins && curMins <= endMins;
    const isWithin = enabled && isDayMatch && isTimeMatch;

    setSimResult({
      isWithin,
      simDay,
      simTime12: format24To12Hour(simTime),
      isDayMatch,
      isTimeMatch,
      willEnterReadyState: isWithin && autoReadyState,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sub-Header Navigation & Settings Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Meeting Recording Schedule
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure working days, time windows, and automatic READY state transitions
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher between Schedule and Voice Settings */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl text-xs font-medium">
          <button
            id="tab-schedule-active"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Recording Schedule</span>
          </button>
          <button
            id="tab-voice-nav-btn"
            onClick={() => onNavigate?.('/settings/voice')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice & Wake Words</span>
          </button>
        </div>
      </div>

      {/* Top Banner Alert when in READY state */}
      {isReadyStateActive && (
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/90 dark:from-indigo-950/60 dark:via-slate-900/60 dark:to-indigo-950/60 flex items-start justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                  READY
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Meeting recording is ready.
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                The application is currently inside the scheduled working window ({scheduleStatus.currentTimeInTz} in {scheduleStatus.timezone}).
                Microphone capture is <strong>inactive</strong> and strictly requires explicit user confirmation before recording starts.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('/meetings/new')}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shrink-0 transition"
          >
            Start Meeting
          </button>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Real-Time Status & Schedules Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schedule Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Schedule Configuration</span>
                  {enabled ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                      Disabled
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Specify working days, business hours, and timezone
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToExampleDefault}
                  title="Reset to example preset (Mon-Sat, 09:30 AM - 06:30 PM)"
                  className="px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Preset Default</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-5">
              {/* Schedule Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Business Hours"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                />
              </div>

              {/* Working Days Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Working Days
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => applyPreset(WORKING_DAYS_PRESETS.MON_SAT.days)}
                      className="px-2 py-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition"
                    >
                      Mon-Sat
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => applyPreset(WORKING_DAYS_PRESETS.MON_FRI.days)}
                      className="px-2 py-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition"
                    >
                      Mon-Fri
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => applyPreset(WORKING_DAYS_PRESETS.ALL_DAYS.days)}
                      className="px-2 py-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition"
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Day Buttons */}
                <div className="grid grid-cols-7 gap-1.5">
                  {ALL_DAYS_OF_WEEK.map((day) => {
                    const isSelected = workingDays.includes(day);
                    const shortName = day.slice(0, 3);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium transition flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{shortName}</span>
                        {isSelected && <Check className="w-3 h-3 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Selected: <span className="font-medium text-slate-700 dark:text-slate-300">{formatWorkingDaysSummary(workingDays)}</span> ({workingDays.length} days/week)
                </p>
              </div>

              {/* Time Window: Start Time & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Start Time</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {format24To12Hour(startTime)}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>End Time</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {format24To12Hour(endTime)}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Timezone</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTimezone(getDetectedTimezone())}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Auto-detect ({getDetectedTimezone()})
                  </button>
                </div>

                <div className="space-y-2">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                    {!COMMON_TIMEZONES.some((t) => t.value === timezone) && (
                      <option value={timezone}>{timezone} (Custom)</option>
                    )}
                  </select>

                  {/* Live Clock for Selected Timezone */}
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Current Time in {timezone}:</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedTzDetails.formattedFull}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Schedule Enabled
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Enable automated tracking for this schedule window
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Auto READY State Transition Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block flex items-center gap-1.5">
                      <span>Automatic READY State</span>
                      <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] rounded font-bold">
                        READY
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      At scheduled time, switch status to READY and display "Meeting recording is ready."
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoReadyState}
                      onChange={(e) => setAutoReadyState(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingScheduleId(null);
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  id="save-schedule-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreatingNew ? 'Create Schedule' : 'Save Schedule Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Privacy & Zero-Secret-Mic Guarantee Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                  Privacy & Audio Security Architecture
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Strict explicit consent guarantees
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>Scheduled time must NOT secretly activate microphone recording.</strong> When the clock enters the scheduled working window, the application prepares the session in the <strong>READY</strong> state and displays:
              </p>
              <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                "Meeting recording is ready."
              </div>
              <p>
                Actual audio stream capture strictly requires <strong>explicit user activation</strong> and notice/consent. Microphones are never automatically accessed in the background without direct affirmative user action.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Status, Schedule Table, Simulation Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Schedule Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Live Schedule Status</span>
              </h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  scheduleStatus.isWithinSchedule
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {scheduleStatus.isWithinSchedule ? 'READY' : 'INACTIVE'}
              </span>
            </div>

            {/* Display message */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Current Day & Time:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {scheduleStatus.currentDayInTz}, {scheduleStatus.currentTimeInTz}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Timezone:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {scheduleStatus.timezone}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Window Status:</span>
                <span
                  className={`font-semibold ${
                    scheduleStatus.isWithinSchedule
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {scheduleStatus.timeRemainingText || 'Outside Window'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {scheduleStatus.statusMessage}
            </p>
          </div>

          {/* Schedule Database Table & Saved Entries */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Saved Schedules (Database)
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Table: <code className="text-indigo-600 dark:text-indigo-400 font-mono">meeting_schedules</code>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setEditingScheduleId(null);
                  setName('New Department Schedule');
                  setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                  setStartTime('10:00');
                  setEndTime('17:00');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Schedule</span>
              </button>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading schedule records...
              </div>
            ) : schedules.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No schedules configured in database.
              </div>
            ) : (
              <div className="space-y-2.5">
                {schedules.map((sched) => {
                  const isSelected = activeSchedule?.id === sched.id;
                  return (
                    <div
                      key={sched.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {sched.name}
                          </span>
                          {sched.enabled ? (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                              On
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                              Off
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                          {formatWorkingDaysSummary(sched.workingDays)} • {format24To12Hour(sched.startTime)} - {format24To12Hour(sched.endTime)}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500">
                          {sched.timezone}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSchedule(sched.id)}
                          title={sched.enabled ? 'Disable Schedule' : 'Enable Schedule'}
                          className={`p-1.5 rounded-lg transition ${
                            sched.enabled
                              ? 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                              : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingScheduleId(sched.id);
                            setIsCreatingNew(false);
                            setName(sched.name);
                            setWorkingDays(sched.workingDays);
                            setStartTime(sched.startTime);
                            setEndTime(sched.endTime);
                            setTimezone(sched.timezone);
                            setEnabled(sched.enabled);
                            setAutoReadyState(sched.autoReadyState ?? true);
                            setNotifyOnReady(sched.notifyOnReady ?? true);
                          }}
                          title="Edit Schedule"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {schedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete schedule "${sched.name}"?`)) {
                                deleteSchedule(sched.id);
                              }
                            }}
                            title="Delete Schedule"
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timezone Simulation Tester Sandbox */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Schedule & Timezone Tester</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate different dates and hours to test READY state transitions
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Simulated Day
                  </label>
                  <select
                    value={simDay}
                    onChange={(e) => setSimDay(e.target.value as DayOfWeek)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {ALL_DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Simulated Time
                  </label>
                  <input
                    type="time"
                    value={simTime}
                    onChange={(e) => setSimTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg text-xs transition cursor-pointer"
              >
                Run Timezone Evaluation Test
              </button>

              {simResult && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    simResult.isWithin
                      ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Simulated Status:</span>
                    <span className="uppercase px-2 py-0.5 rounded text-[10px] bg-indigo-600 text-white">
                      {simResult.isWithin ? 'READY State Triggered' : 'Outside Window'}
                    </span>
                  </div>
                  <p className="text-[11px]">
                    Day Match: {simResult.isDayMatch ? '✅ Yes' : '❌ No'} | Time Match: {simResult.isTimeMatch ? '✅ Yes' : '❌ No'}
                  </p>
                  {simResult.willEnterReadyState && (
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      Display output: <em>"Meeting recording is ready."</em> (Microphone remains quiescent until affirmative user consent).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
