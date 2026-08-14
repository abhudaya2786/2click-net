import React from 'react';
import { Sparkles, Calendar, Clock, Tag, ArrowRight, X, Users, CheckCircle2 } from 'lucide-react';
import { SAMPLE_MEETINGS } from '../data/sampleMeetings';
import { MeetingData } from '../types';

interface SampleMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (meeting: MeetingData) => void;
}

export const SampleMeetingsModal: React.FC<SampleMeetingsModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Try Sample Minutes of Meeting
              </h3>
              <p className="text-[11px] text-slate-500">
                Load ready-made comprehensive MoMs with action items, decisions, and speaker transcripts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sample Cards List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {SAMPLE_MEETINGS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-850 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition cursor-pointer group flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sample.meetingType}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sample.duration}
                  </span>
                  {sample.languageDetected && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                      {sample.languageDetected}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition">
                  <span>Load MoM</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {sample.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {sample.executiveSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 text-slate-400" />
                  {sample.participants.length} Attendees
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {sample.actionItems.length} Action Items
                </span>
                <span>•</span>
                <span>{sample.decisions.length} Decisions Finalized</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
