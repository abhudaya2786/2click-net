import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Layers,
  Radio,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { FullMeetingRecord } from '../../types';
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

  const recordingCount = meetings.filter((m) => m.status === 'RECORDING').length;

  return (
    <div className="w-full">
      {/* App home — brand first, readable on phone */}
      <section
        className="mb-5 relative overflow-hidden rounded-2xl px-5 py-6 sm:px-6 sm:py-7 text-white"
        style={{
          background: 'linear-gradient(145deg, #0b4bd5 0%, #0a3aa8 55%, #0d2c6b 100%)',
        }}
      >
        <div className="ai-orb w-40 h-40 bg-sky-300/25 -top-8 -right-6" aria-hidden />
        <div className="relative z-10">
          <h1 className="app-readable-title text-white">2Click</h1>
          <p className="mt-2 app-readable-sub text-white">
            Aapka AI meeting studio
          </p>
          <p className="mt-2 app-readable-body text-sky-50/95 max-w-md">
            Record karein → transcript mile → Minutes of Meeting ban jaaye.
            Hindi, English, Hinglish.
          </p>
          <div className="mt-5 flex flex-col xs:flex-row sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('/meetings/new')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-hs-800 font-bold text-base px-5 py-3.5 min-h-12 active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Nayi meeting
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/mom')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 text-white font-bold text-base px-5 py-3.5 min-h-12 active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              MoM AI kholo
            </button>
          </div>
          {recordingCount > 0 && (
            <p className="mt-4 text-sm font-bold text-rose-100 flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" />
              {recordingCount} live recording chal rahi hai
            </p>
          )}
        </div>
      </section>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Meeting dhundo…"
            aria-label="Search meetings"
            className="w-full pl-11 pr-4 py-3.5 bg-white/95 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hs-500/40"
          />
        </div>
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-hs-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-hs-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-base font-semibold">Meetings load ho rahi hain…</p>
        </div>
      ) : meetings.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {meetings.map((m) => (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (onSelectMeeting) onSelectMeeting(m.id);
                onNavigate(`/meetings/${m.id}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(`/meetings/${m.id}`);
                }
              }}
              className="app-list-row"
            >
              <div className="w-12 h-12 rounded-2xl bg-hs-50 dark:bg-hs-900/40 text-hs-700 dark:text-hs-300 flex items-center justify-center shrink-0">
                {m.status === 'RECORDING' ? (
                  <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
                ) : (
                  <Layers className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <MeetingStateBadge status={m.status} size="md" />
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
                    {m.department}
                  </span>
                </div>
                <h3 className="app-list-row-title truncate">{m.title}</h3>
                <p className="app-list-row-meta truncate">
                  {m.date} · {m.startTime} · {m.participants.length} log
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-hs-50 dark:bg-hs-900 text-hs-600 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
            Abhi koi meeting nahi
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
            Nayi meeting banao — record, transcript, aur Minutes of Meeting ek jagah.
          </p>
          <button type="button" onClick={() => onNavigate('/meetings/new')} className="btn-hs text-base">
            <Plus className="w-5 h-5" />
            Meeting banao
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Create new meeting"
        onClick={() => onNavigate('/meetings/new')}
        className="md:hidden fixed z-30 right-4 bottom-[calc(var(--app-bottom-h)+0.85rem)] w-14 h-14 rounded-2xl bg-hs-600 text-white flex items-center justify-center shadow-lg shadow-hs-600/30 active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
