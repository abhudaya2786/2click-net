import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  FolderKanban, 
  User, 
  MapPin, 
  FileText, 
  Plus, 
  X, 
  Play, 
  Save, 
  Sparkles,
  ArrowLeft,
  Check
} from 'lucide-react';
import { MeetingState } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface NewMeetingProps {
  onNavigate: (route: string) => void;
  onMeetingCreated?: (meetingId: string) => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Leadership',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'Human Resources',
  'Legal & Compliance',
];

const SUGGESTED_PROJECTS = [
  'Mobile App v2 & AI Suite',
  'Payment Infrastructure',
  'Q3 Company OKRs',
  'Cloud Migration & Security',
  'Customer Dashboard Redesign',
  'Design System & UI Library',
  'Data Pipeline & Analytics',
];

export const NewMeetingView: React.FC<NewMeetingProps> = ({ onNavigate, onMeetingCreated }) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [project, setProject] = useState('Mobile App v2 & AI Suite');
  const [customProject, setCustomProject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [duration, setDuration] = useState('45 mins');
  const [status, setStatus] = useState<MeetingState>('READY');
  const [location, setLocation] = useState('Google Meet / Room 4B');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');

  // Participant management
  const [participantInput, setParticipantInput] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantRole, setParticipantRole] = useState<'Presenter' | 'Attendee' | 'Note Taker'>('Attendee');
  const [participants, setParticipants] = useState<Array<{ name: string; email?: string; role: string }>>([
    { name: 'Rahul Sharma', email: 'rahul.s@acme.corp', role: 'Presenter' },
    { name: 'Elena Rostova', email: 'elena.r@acme.corp', role: 'Attendee' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto calculate duration when start or end time changes
  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    try {
      const [sh, sm] = newStart.split(':').map(Number);
      const [eh, em] = newEnd.split(':').map(Number);
      const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
      if (diffMinutes > 0) {
        if (diffMinutes >= 60) {
          const hrs = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          setDuration(mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`);
        } else {
          setDuration(`${diffMinutes} mins`);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleAddParticipant = () => {
    if (!participantInput.trim()) return;
    setParticipants([
      ...participants,
      {
        name: participantInput.trim(),
        email: participantEmail.trim() || undefined,
        role: participantRole,
      },
    ]);
    setParticipantInput('');
    setParticipantEmail('');
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, startImmediately: boolean = false) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }
    if (!organizer.trim()) {
      setError('Organizer name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const effectiveProject = customProject.trim() || project;
      const initialStatus: MeetingState = startImmediately ? 'READY' : status;

      const created = await meetingDb.createMeeting({
        title,
        organizer,
        organizerEmail,
        department,
        project: effectiveProject,
        date,
        startTime,
        endTime,
        duration,
        status: initialStatus,
        location,
        agenda,
        notes,
        participants,
      });

      if (onMeetingCreated) {
        onMeetingCreated(created.id);
      }

      // Navigate to the created meeting studio
      onNavigate(`/meetings/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/meetings')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            title="Back to meetings list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-0.5">
              <span className="cursor-pointer hover:underline" onClick={() => onNavigate('/meetings')}>
                Meetings
              </span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">New Meeting</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create New Meeting
            </h1>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Ready for Live Studio
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-8 space-y-6">
          {/* Section 1: Meeting Essentials */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              General Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Meeting Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Product Roadmap & Sprint Architecture Review"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 transition"
                />
              </div>

              {/* Organizer & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Organizer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Organizer Email
                  </label>
                  <input
                    type="email"
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="sarah.j@acme.corp"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Department & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                    Project <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <select
                      value={project}
                      onChange={(e) => {
                        setProject(e.target.value);
                        if (e.target.value !== 'Other') setCustomProject('');
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    >
                      {SUGGESTED_PROJECTS.map((proj) => (
                        <option key={proj} value={proj}>
                          {proj}
                        </option>
                      ))}
                      <option value="Other">Custom Project...</option>
                    </select>

                    {project === 'Other' && (
                      <input
                        type="text"
                        value={customProject}
                        onChange={(e) => setCustomProject(e.target.value)}
                        placeholder="Enter project name..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 2: Date, Time, Duration & Status */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule & Lifecycle State
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, endTime)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => handleTimeChange(startTime, e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Calculated Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30 mins"
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MeetingState)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="READY">READY (Armed for recording)</option>
                  <option value="IDLE">IDLE (Scheduled for later)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Location / Video Link
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Google Meet, Zoom Room #891, or Boardroom 4B"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 3: Participants */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({participants.length + (organizer ? 1 : 0)})
              </span>
            </h2>

            {/* Organizer Badge */}
            {organizer && (
              <div className="mb-3 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {organizer.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{organizer}</span>
                    {organizerEmail && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                        ({organizerEmail})
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
                  Organizer
                </span>
              </div>
            )}

            {/* Participant List */}
            <div className="space-y-2 mb-3">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                      {p.email && (
                        <span className="text-[11px] text-slate-500 ml-1.5">({p.email})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {p.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Participant Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  placeholder="Participant name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="Email (optional)..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={participantRole}
                  onChange={(e) => setParticipantRole(e.target.value as any)}
                  className="w-full px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Presenter">Presenter</option>
                  <option value="Attendee">Attendee</option>
                  <option value="Note Taker">Note Taker</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  disabled={!participantInput.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section 4: Agenda & Notes */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Agenda & Objectives
            </h2>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="1. Review quarterly OKRs&#10;2. Architecture latency breakdown&#10;3. Assign ownership..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/meetings')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save as Scheduled</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Create & Start Meeting</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
