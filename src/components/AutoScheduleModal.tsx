import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Check,
  Radio,
  X,
  Loader2,
  CalendarCheck,
  BellRing
} from 'lucide-react';
import { ScheduledEvent, MeetingData } from '../types';
import { downloadIcsInvite, getGoogleCalendarUrl, getOutlookCalendarUrl } from '../utils/calendarUtils';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingData | null;
  scheduledEvents: ScheduledEvent[];
  onAddEvent: (event: ScheduledEvent) => void;
  onDeleteEvent: (id: string) => void;
  onArmMonitoring: (event: ScheduledEvent) => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  meeting,
  scheduledEvents,
  onAddEvent,
  onDeleteEvent,
  onArmMonitoring,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState(30);
  const [formAttendees, setFormAttendees] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
    if (!meeting) return;
    setIsDetecting(true);
    try {
      const res = await fetch('/api/detect-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingData: meeting }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        data.events.forEach((evt: ScheduledEvent) => {
          onAddEvent(evt);
        });
        setSuccessFeedback(`Auto-detected ${data.events.length} upcoming scheduled sessions!`);
        setTimeout(() => setSuccessFeedback(null), 4000);
      }
    } catch (err) {
      console.error('Failed to auto detect schedule:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newEvent: ScheduledEvent = {
      id: `sched-${Date.now()}`,
      title: formTitle.trim(),
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration) || 30,
      description: formDescription.trim(),
      attendees: formAttendees
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      meetingType: 'Scheduled Meeting',
      isAutoDetected: false,
      status: 'Scheduled',
    };

    onAddEvent(newEvent);
    setFormTitle('');
    setFormDescription('');
    setShowAddForm(false);
    setSuccessFeedback('New meeting scheduled successfully!');
    setTimeout(() => setSuccessFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Auto-Scheduler & Calendar Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                Auto-detect deadlines & meetings from transcripts and sync calendar invites.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Quick Actions Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  AI Auto-Schedule Extractor
                </span>
                <p className="text-xs text-slate-500">
                  Scan decisions & transcripts for proposed dates and deadlines.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {meeting && (
                <button
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50 min-h-[38px] touch-manipulation cursor-pointer active:scale-95"
                >
                  {isDetecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isDetecting ? 'Scanning...' : 'Auto-Detect'}</span>
                </button>
              )}

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1 min-h-[38px] touch-manipulation cursor-pointer active:scale-95 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {successFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-bold text-xs">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successFeedback}</span>
            </div>
          )}

          {/* Manual Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleManualAdd}
              className="p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3 shadow-xs"
            >
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Schedule New Meeting or Follow-up Session
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Sprint Planning & Action Items Review"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Start Time & Duration *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs"
                    />
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                      <option value={90}>90 mins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Attendees (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="e.g. Rahul, Sarah, Team Lead"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Agenda / Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Agenda items and discussion points..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 text-xs resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          )}

          {/* Scheduled Events List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Upcoming Scheduled Meetings ({scheduledEvents.length})</span>
            </h4>

            {scheduledEvents.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No upcoming meetings scheduled yet.</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click "Auto-Detect" to extract schedules from your meeting MoM, or add manually.
                </p>
              </div>
            ) : (
              scheduledEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col gap-2.5 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-900">
                        {evt.meetingType || 'Sync'}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {evt.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Arm Monitoring Button */}
                      <button
                        onClick={() => {
                          onArmMonitoring(evt);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                        title="Arm live meeting monitor for this session"
                      >
                        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                        <span>Arm Monitor</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {evt.time} ({evt.durationMinutes} min)
                    </span>
                    {evt.attendees && evt.attendees.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        {evt.attendees.join(', ')}
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {evt.description}
                    </p>
                  )}

                  {/* 1-Click Calendar Export Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">
                      Add to:
                    </span>
                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Calendar
                    </a>
                    <a
                      href={getOutlookCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Outlook Web
                    </a>
                    <button
                      onClick={() => downloadIcsInvite(evt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Download .ICS Invite
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Exported calendar files follow standard RFC 5545 specifications.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

