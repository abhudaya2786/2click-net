import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  FolderKanban, 
  Play, 
  Trash2, 
  ChevronRight, 
  Filter, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  Layers,
  FileAudio
} from 'lucide-react';
import { FullMeetingRecord, MeetingState } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';
import { MeetingStateBadge } from './MeetingStateBadge';

interface MeetingListViewProps {
  onNavigate: (route: string) => void;
  onSelectMeeting?: (meetingId: string) => void;
}

const DEPARTMENTS = ['All', 'Engineering', 'Product', 'Design', 'Leadership', 'Marketing', 'Sales', 'Operations'];
const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Ready', value: 'READY' },
  { label: 'Recording', value: 'RECORDING' },
  { label: 'Idle', value: 'IDLE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Paused', value: 'PAUSED' },
];

export const MeetingListView: React.FC<MeetingListViewProps> = ({ onNavigate, onSelectMeeting }) => {
  const [meetings, setMeetings] = useState<FullMeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingDb.getMeetings({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined,
      });
      setMeetings(data);
    } catch (e) {
      console.error('Failed to load meetings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [selectedDept, selectedStatus, searchQuery]);

  const handleDelete = async (e: React.MouseEvent, meetingId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this meeting?')) {
      await meetingDb.deleteMeeting(meetingId);
      fetchMeetings();
    }
  };

  // Stats calculation
  const totalMeetings = meetings.length;
  const readyCount = meetings.filter((m) => m.status === 'READY').length;
  const recordingCount = meetings.filter((m) => m.status === 'RECORDING').length;
  const completedCount = meetings.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* HappyScribe-like hero strip */}
      <section className="mb-6 rounded-2xl border border-[#e8ecf1] dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-hs-100/70 dark:bg-hs-900/30 blur-2xl pointer-events-none" />
        <div className="absolute right-16 bottom-0 w-40 h-40 rounded-[2rem] rotate-12 bg-hs-50 dark:bg-hs-900/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-hs-600 mb-2">AI transcription &amp; meeting notes</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1]">
              The AI notetaker for{' '}
              <span className="hs-accent">conversational intelligence</span>
            </h1>
            <p className="mt-3 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Record or upload meetings. Get accurate transcripts, decisions, and action items — in Hindi, English, and Hinglish.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button onClick={() => onNavigate('/meetings/new')} className="btn-hs">
                <Plus className="w-4 h-4" />
                Try for free
              </button>
              <button onClick={() => onNavigate('/mom')} className="btn-hs-secondary">
                <Sparkles className="w-4 h-4 text-hs-600" />
                Open MoM AI
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 min-w-[240px]">
            <div className="hs-card p-3 text-center">
              <div className="text-lg font-black text-slate-950 dark:text-white">{totalMeetings}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Meetings</div>
            </div>
            <div className="hs-card p-3 text-center">
              <div className="text-lg font-black text-hs-600">{readyCount}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Ready</div>
            </div>
            <div className="hs-card p-3 text-center">
              <div className="text-lg font-black text-emerald-600">{completedCount}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Done</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Meetings</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{totalMeetings}</div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-hs-50/80 dark:bg-hs-900/40 border border-hs-200/70 dark:border-hs-800/70 shadow-sm">
          <div className="text-[11px] font-bold text-hs-700 dark:text-hs-300 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3 h-3" />
            Armed & Ready
          </div>
          <div className="text-xl sm:text-2xl font-black text-hs-900 dark:text-hs-200 mt-1">{readyCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/70 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
            Live In Progress
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1">{recordingCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings by title, organizer, project..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hs-500 transition"
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Department:
          </span>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? 'bg-hs-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings List / Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-hs-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading meetings database...</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                if (onSelectMeeting) onSelectMeeting(m.id);
                onNavigate(`/meetings/${m.id}`);
              }}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 hover:border-hs-400 dark:hover:border-hs-600 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left meta & title */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <MeetingStateBadge status={m.status} size="sm" />
                    <span className="px-2.5 py-0.5 rounded-md bg-hs-50 dark:bg-hs-900 text-hs-700 dark:text-hs-300 text-[11px] font-bold">
                      {m.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                      {m.project}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-hs-600 dark:group-hover:text-hs-400 transition">
                    {m.title}
                  </h3>

                  {/* Organizer, Schedule, Duration */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-hs-600 text-white flex items-center justify-center text-[9px]">
                        {m.organizer.slice(0, 2).toUpperCase()}
                      </div>
                      {m.organizer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {m.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {m.startTime} - {m.endTime} ({m.duration})
                    </span>
                  </div>
                </div>

                {/* Right Action & Participants Roster */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Participant stack */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {m.participants.slice(0, 4).map((p, idx) => (
                        <div
                          key={idx}
                          title={p.name}
                          className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 text-slate-700 dark:text-slate-300 text-[9px] font-bold flex items-center justify-center"
                        >
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {m.participants.length} attendee{m.participants.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Recordings badge if any */}
                  {m.recordings && m.recordings.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <FileAudio className="w-3 h-3 text-hs-500" />
                      {m.recordings.length}
                    </span>
                  )}

                  {/* Open Studio / Start Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`/meetings/${m.id}`);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
                      m.status === 'RECORDING'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-hs-600 hover:bg-hs-700 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{m.status === 'RECORDING' ? 'Active Studio' : 'Open Studio'}</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, m.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-xl bg-hs-50 dark:bg-hs-900 text-hs-600 dark:text-hs-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Meetings Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Create your first meeting to configure participants, schedule duration, and launch the recording studio.
          </p>
          <button
            onClick={() => onNavigate('/meetings/new')}
            className="px-5 py-2.5 bg-hs-600 hover:bg-hs-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Meeting</span>
          </button>
        </div>
      )}
    </div>
  );
};
