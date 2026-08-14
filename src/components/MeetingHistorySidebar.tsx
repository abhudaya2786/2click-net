import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  X, 
  Sparkles, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Users, 
  HelpCircle,
  Filter
} from 'lucide-react';
import { MeetingData } from '../types';

interface MeetingHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedMeetings: MeetingData[];
  currentMeetingId?: string;
  onSelectMeeting: (meeting: MeetingData) => void;
  onDeleteMeeting: (id: string) => void;
  onOpenSampleModal: () => void;
}

type SearchFilterScope = 'all' | 'transcript' | 'actions' | 'decisions';

interface MatchHighlight {
  type: 'title' | 'transcript' | 'action' | 'decision' | 'summary' | 'participant';
  snippet: string;
  speakerOrOwner?: string;
}

export const MeetingHistorySidebar: React.FC<MeetingHistorySidebarProps> = ({
  isOpen,
  onClose,
  savedMeetings,
  currentMeetingId,
  onSelectMeeting,
  onDeleteMeeting,
  onOpenSampleModal,
}) => {
  const [search, setSearch] = useState('');
  const [filterScope, setFilterScope] = useState<SearchFilterScope>('all');

  // Compute matched meetings and snippet previews
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return savedMeetings.map((m) => ({
        meeting: m,
        matches: [] as MatchHighlight[],
        matchCount: 0,
        hasTranscriptMatch: false,
        hasActionMatch: false,
        hasDecisionMatch: false,
      }));
    }

    return savedMeetings
      .map((m) => {
        const matches: MatchHighlight[] = [];
        let hasTranscriptMatch = false;
        let hasActionMatch = false;
        let hasDecisionMatch = false;

        // 1. Check Title
        if (m.title.toLowerCase().includes(query)) {
          matches.push({
            type: 'title',
            snippet: m.title,
          });
        }

        // 2. Check Executive Summary
        if (m.executiveSummary?.toLowerCase().includes(query)) {
          matches.push({
            type: 'summary',
            snippet: m.executiveSummary,
          });
        }

        // 3. Check Transcript lines
        if (m.transcript && Array.isArray(m.transcript)) {
          m.transcript.forEach((seg) => {
            if (
              seg.text.toLowerCase().includes(query) ||
              seg.speaker.toLowerCase().includes(query)
            ) {
              hasTranscriptMatch = true;
              if (matches.length < 5) {
                matches.push({
                  type: 'transcript',
                  snippet: seg.text,
                  speakerOrOwner: seg.speaker,
                });
              }
            }
          });
        }

        // 4. Check Action Items
        if (m.actionItems && Array.isArray(m.actionItems)) {
          m.actionItems.forEach((act) => {
            if (
              act.task.toLowerCase().includes(query) ||
              act.owner.toLowerCase().includes(query) ||
              act.deadline.toLowerCase().includes(query) ||
              act.priority.toLowerCase().includes(query)
            ) {
              hasActionMatch = true;
              if (matches.length < 5) {
                matches.push({
                  type: 'action',
                  snippet: act.task,
                  speakerOrOwner: act.owner,
                });
              }
            }
          });
        }

        // 5. Check Decisions
        if (m.decisions && Array.isArray(m.decisions)) {
          m.decisions.forEach((dec) => {
            if (dec.toLowerCase().includes(query)) {
              hasDecisionMatch = true;
              if (matches.length < 5) {
                matches.push({
                  type: 'decision',
                  snippet: dec,
                });
              }
            }
          });
        }

        // 6. Check Participants
        if (m.participants && Array.isArray(m.participants)) {
          m.participants.forEach((p) => {
            if (p.toLowerCase().includes(query)) {
              matches.push({
                type: 'participant',
                snippet: `Participant: ${p}`,
              });
            }
          });
        }

        // Apply Scope Filter
        let isIncluded = matches.length > 0;
        if (filterScope === 'transcript') {
          isIncluded = hasTranscriptMatch;
        } else if (filterScope === 'actions') {
          isIncluded = hasActionMatch;
        } else if (filterScope === 'decisions') {
          isIncluded = hasDecisionMatch;
        }

        return {
          meeting: m,
          matches,
          matchCount: matches.length,
          hasTranscriptMatch,
          hasActionMatch,
          hasDecisionMatch,
          isIncluded,
        };
      })
      .filter((item) => (query ? item.isIncluded : true));
  }, [savedMeetings, search, filterScope]);

  if (!isOpen) return null;

  // Highlight helper for snippet preview
  const renderHighlightedSnippet = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 font-bold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Saved Meeting Archive
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {savedMeetings.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Global search across dialogue transcripts & action items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transcript, action item, speaker, or keyword..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-slate-400 flex items-center gap-1 mr-1 font-semibold flex-shrink-0">
              <Filter className="w-3 h-3" />
              Scope:
            </span>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setFilterScope('transcript')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterScope === 'transcript'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Transcripts
            </button>
            <button
              onClick={() => setFilterScope('actions')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterScope === 'actions'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              Action Items
            </button>
            <button
              onClick={() => setFilterScope('decisions')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                filterScope === 'decisions'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              Decisions
            </button>
          </div>

          {/* Quick Presets / Pre-built CTA */}
          <button
            onClick={() => {
              onClose();
              onOpenSampleModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer active:scale-98 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Pre-built Multi-Speaker Sample Meetings</span>
          </button>
        </div>

        {/* Search Results Summary (when query present) */}
        {search.trim() && (
          <div className="px-4 py-2 bg-indigo-50/40 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-300">
            <span>
              Found <strong>{searchResults.length}</strong> meeting{searchResults.length === 1 ? '' : 's'} matching "{search}"
            </span>
            {searchResults.length > 0 && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any to load
              </span>
            )}
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {savedMeetings.length === 0
                  ? 'No saved meetings yet.'
                  : `No meetings found matching "${search}".`}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {savedMeetings.length === 0
                  ? 'Record voice audio, upload an MP3/WAV file, or load a sample meeting to get started.'
                  : 'Try searching for speaker names, tasks (e.g. "API", "Friday"), or topics.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            searchResults.map(({ meeting: m, matches, hasTranscriptMatch, hasActionMatch, hasDecisionMatch }) => {
              const isCurrent = m.id === currentMeetingId;
              const query = search.trim();

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMeeting(m);
                    onClose();
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2.5 relative shadow-2xs ${
                    isCurrent
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400/50'
                      : 'bg-white dark:bg-slate-850 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {m.meetingType || 'Meeting'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        {m.meetingDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMeeting(m.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition cursor-pointer"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meeting Title */}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {query ? renderHighlightedSnippet(m.title, query) : m.title}
                  </h4>

                  {/* Summary Preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
                    {query && !hasTranscriptMatch && !hasActionMatch
                      ? renderHighlightedSnippet(m.executiveSummary, query)
                      : m.executiveSummary}
                  </p>

                  {/* Keyword Match Context Snippet (When Searching) */}
                  {query && matches.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      {hasTranscriptMatch && (
                        <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold mr-1 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                              Matched in Transcript:
                            </span>
                            <p className="line-clamp-2 italic text-slate-700 dark:text-slate-300 mt-0.5">
                              {renderHighlightedSnippet(
                                matches.find((mt) => mt.type === 'transcript')?.snippet || '',
                                query
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {hasActionMatch && (
                        <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold mr-1 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              Matched in Action Items:
                            </span>
                            <p className="line-clamp-2 text-slate-700 dark:text-slate-300 mt-0.5">
                              {renderHighlightedSnippet(
                                matches.find((mt) => mt.type === 'action')?.snippet || '',
                                query
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {hasDecisionMatch && (
                        <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold mr-1 text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-400">
                              Matched in Decision:
                            </span>
                            <p className="line-clamp-2 text-slate-700 dark:text-slate-300 mt-0.5">
                              {renderHighlightedSnippet(
                                matches.find((mt) => mt.type === 'decision')?.snippet || '',
                                query
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata Footer stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckSquare className="w-3 h-3 text-emerald-500" />
                        {m.actionItems?.length || 0} Action Items
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="w-3 h-3 text-indigo-500" />
                        {m.transcript?.length || 0} Turns
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

