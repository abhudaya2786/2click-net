import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Layers,
  Radio,
  Sparkles,
  ChevronRight,
  Inbox,
  Mic,
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
  const readyCount = meetings.filter((m) => m.status === 'READY').length;

  return (
    <div className="w-full pb-4">
      {/* Paytm-style navy/cyan hero */}
      <section className="paytm-hero">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-xl font-extrabold tracking-tight truncate">2Click</div>
              <div className="text-sm text-sky-100/90 font-medium">Namaste · Voice MoM</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/account')}
            className="shrink-0 rounded-full bg-white/15 border border-white/25 text-white text-sm font-bold px-3.5 py-2"
          >
            Account
          </button>
        </div>

        <div className="relative z-10 mt-5 rounded-2xl bg-white/12 border border-white/20 px-4 py-3.5 backdrop-blur-sm">
          <p className="text-sky-100 text-sm font-medium">Aaj ki activity</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-3xl font-extrabold tracking-tight">
                {meetings.length}
                <span className="text-lg font-bold text-sky-100 ml-1.5">meetings</span>
              </div>
              <p className="mt-1 text-sm text-sky-100/90">
                {readyCount} ready
                {recordingCount > 0 ? ` · ${recordingCount} live` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/meetings/new')}
              className="rounded-full bg-[#00baf2] text-white font-bold text-sm px-4 py-2.5 shadow-lg shadow-cyan-500/30 active:scale-[0.98]"
            >
              + Nayi
            </button>
          </div>
        </div>
      </section>

      {/* Overlapping white sheet with quick actions */}
      <div className="paytm-sheet">
        <p className="paytm-section-title mb-3">Quick actions</p>
        <div className="paytm-action-grid">
          <button type="button" className="paytm-action" onClick={() => onNavigate('/meetings/new')}>
            <span className="paytm-action-icon">
              <Plus className="w-6 h-6" />
            </span>
            <span className="paytm-action-label">New</span>
          </button>
          <button type="button" className="paytm-action" onClick={() => onNavigate('/mom')}>
            <span className="paytm-action-icon">
              <Sparkles className="w-6 h-6" />
            </span>
            <span className="paytm-action-label">MoM AI</span>
          </button>
          <button type="button" className="paytm-action" onClick={() => onNavigate('/field-talk')}>
            <span className="paytm-action-icon">
              <Radio className="w-6 h-6" />
            </span>
            <span className="paytm-action-label">Talk</span>
          </button>
          <button type="button" className="paytm-action" onClick={() => onNavigate('/inbox')}>
            <span className="paytm-action-icon">
              <Inbox className="w-6 h-6" />
            </span>
            <span className="paytm-action-label">Inbox</span>
          </button>
        </div>
      </div>

      <div className="px-3.5 mt-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Meeting dhundo…"
            aria-label="Search meetings"
            className="w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-base text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00baf2]/40"
          />
        </div>

        <div className="hidden sm:flex flex-wrap items-center gap-2 px-0.5">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
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
                className={`px-3.5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-[#00baf2] text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5 pt-1">
          <h2 className="paytm-section-title">Aapki meetings</h2>
          <span className="text-sm font-semibold text-slate-500">{meetings.length}</span>
        </div>

        {loading ? (
          <div className="py-14 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-[#00baf2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-base font-semibold">Meetings load ho rahi hain…</p>
          </div>
        ) : meetings.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
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
                <div className="w-12 h-12 rounded-2xl bg-[#e8f9fe] text-[#002e6e] flex items-center justify-center shrink-0">
                  {m.status === 'RECORDING' ? (
                    <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
                  ) : (
                    <Layers className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <MeetingStateBadge status={m.status} size="md" />
                    <span className="text-sm font-bold text-slate-500 truncate">{m.department}</span>
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
          <div className="py-12 text-center px-4 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f9fe] text-[#002e6e] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Abhi koi meeting nahi</h3>
            <p className="text-base text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
              Nayi meeting banao — record, transcript, aur Minutes of Meeting.
            </p>
            <button type="button" onClick={() => onNavigate('/meetings/new')} className="btn-hs">
              <Plus className="w-5 h-5" />
              Meeting banao
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Create new meeting"
        onClick={() => onNavigate('/meetings/new')}
        className="md:hidden fixed z-30 right-4 bottom-[calc(var(--app-bottom-h)+0.85rem)] w-14 h-14 rounded-full bg-[#00baf2] text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
