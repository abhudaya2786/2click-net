import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  User,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  FileCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DecisionEntity, FullMeetingRecord } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface DecisionsListProps {
  meeting: FullMeetingRecord;
  onRefresh: () => void;
}

export const DecisionsList: React.FC<DecisionsListProps> = ({ meeting, onRefresh }) => {
  const decisions: DecisionEntity[] = meeting.decisions || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newDecidedBy, setNewDecidedBy] = useState(meeting.organizer || 'Team');
  const [newContext, setNewContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredDecisions = decisions.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.decision_text.toLowerCase().includes(q) ||
      (d.decided_by && d.decided_by.toLowerCase().includes(q)) ||
      (d.context && d.context.toLowerCase().includes(q))
    );
  });

  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    try {
      setIsSubmitting(true);
      await meetingDb.createDecision(
        meeting.id,
        newDecisionText.trim(),
        newContext.trim() || meeting.title,
        newDecidedBy.trim() || 'Team'
      );
      setNewDecisionText('');
      setNewContext('');
      setShowAddForm(false);
      await onRefresh();
    } catch (err) {
      console.error('Failed to create decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    try {
      setDeletingId(id);
      await meetingDb.deleteDecision(id);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete decision:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyDecisions = () => {
    if (decisions.length === 0) return;
    const text = decisions
      .map(
        (d, idx) =>
          `${idx + 1}. ${d.decision_text}\n   Decided by: ${d.decided_by || 'Team'} | Context: ${d.context || 'General'}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(
      `# Finalized Decisions - ${meeting.title}\nDate: ${meeting.date}\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="decisions-module" className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Meeting Decisions
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {decisions.length} recorded
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authoritative agreements, architectural choices, and policies finalized in this session.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {decisions.length > 0 && (
            <button
              onClick={handleCopyDecisions}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Decision</span>
          </button>
        </div>
      </div>

      {/* Add New Decision Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddDecision}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300/60 dark:border-emerald-800/60 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Record New Decision
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Decision Statement <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={newDecisionText}
              onChange={(e) => setNewDecisionText(e.target.value)}
              placeholder="e.g. Approved OpenAI Whisper speech-to-text integration for multi-language transcription."
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Decided By / Decision Owner
              </label>
              <input
                type="text"
                value={newDecidedBy}
                onChange={(e) => setNewDecidedBy(e.target.value)}
                placeholder="e.g. Sarah Jenkins or Entire Leadership"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Context / Topic Ref
              </label>
              <input
                type="text"
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                placeholder="e.g. Q3 Roadmap Review"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !newDecisionText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Decision to Table'}
            </button>
          </div>
        </form>
      )}

      {/* Search Input if decisions exist */}
      {decisions.length > 2 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recorded decisions by keyword, owner, or context..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      )}

      {/* Decisions List View */}
      {filteredDecisions.length > 0 ? (
        <div className="space-y-3">
          {filteredDecisions.map((dec, idx) => (
            <div
              key={dec.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-colors shadow-xs group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {dec.decision_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {dec.decided_by && (
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{dec.decided_by}</span>
                        </span>
                      )}
                      {dec.context && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                          {dec.context}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(dec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDecision(dec.id)}
                  disabled={deletingId === dec.id}
                  className="p-1.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete decision"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          <FileCheck className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            {searchQuery ? 'No decisions matching your search filter' : 'No decisions recorded in database'}
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Decisions are extracted automatically when AI Minutes are generated, or you can record them manually above.
          </p>
        </div>
      )}
    </div>
  );
};
