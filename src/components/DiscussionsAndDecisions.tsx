import React, { useState } from 'react';
import { 
  CheckSquare, 
  MessageSquareQuote, 
  AlertOctagon, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { TopicDiscussion } from '../types';
import { copyToClipboard } from '../utils/exportUtils';

interface DiscussionsAndDecisionsProps {
  executiveSummary: string;
  decisions: string[];
  keyTopics: TopicDiscussion[];
  risksAndBlockers: string[];
  openQuestions: string[];
}

export const DiscussionsAndDecisions: React.FC<DiscussionsAndDecisionsProps> = ({
  executiveSummary,
  decisions,
  keyTopics,
  risksAndBlockers,
  openQuestions,
}) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [copiedSummary, setCopiedSummary] = useState(false);

  const toggleTopic = (index: number) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopySummary = async () => {
    await copyToClipboard(executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* AI Executive Summary Card */}
      {executiveSummary && (
        <div id="executive-summary-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Executive Synthesis
              </h2>
            </div>
            
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
              title="Copy Executive Summary"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm font-normal">
              {executiveSummary}
            </p>
          </div>
        </div>
      )}

      {/* Key Decisions Grid */}
      {decisions && decisions.length > 0 && (
        <div id="key-decisions-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Decisions Finalized ({decisions.length})
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-200/70 dark:border-emerald-900/60">
              Consensus Reached
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {decisions.map((decision, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800 transition flex items-start gap-3 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {decision}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Discussion Topics */}
      {keyTopics && keyTopics.length > 0 && (
        <div id="key-topics-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Topic Deep-Dives ({keyTopics.length})
              </h2>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Agenda & Outcomes
            </span>
          </div>

          <div className="space-y-3">
            {keyTopics.map((item, idx) => {
              const isExpanded = !!expandedTopics[idx];
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => toggleTopic(idx)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-850 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition text-left cursor-pointer min-h-[50px] touch-manipulation"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.speakersInvolved && item.speakersInvolved.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.speakersInvolved.length} speakers</span>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {item.summary}
                      </p>

                      {item.keyPoints && item.keyPoints.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Key Arguments & Takeaways:
                          </h5>
                          <ul className="space-y-2">
                            {item.keyPoints.map((point, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-xs sm:text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-850"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                <span className="leading-snug">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.speakersInvolved && item.speakersInvolved.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contributors:</span>
                          {item.speakersInvolved.map((speaker, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                            >
                              {speaker}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Risks & Open Questions Side-by-Side Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Risks & Blockers */}
        <div id="risks-blockers-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Risks & Blockers
              </h2>
            </div>
            <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-rose-200/70 dark:border-rose-900/60">
              Attention
            </span>
          </div>

          {risksAndBlockers && risksAndBlockers.length > 0 ? (
            <ul className="space-y-2.5">
              {risksAndBlockers.map((risk, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed font-medium">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">No critical blockers flagged in this session.</p>
          )}
        </div>

        {/* Open Questions */}
        <div id="open-questions-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Open Questions
              </h2>
            </div>
            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200/70 dark:border-amber-900/60">
              Pending
            </span>
          </div>

          {openQuestions && openQuestions.length > 0 ? (
            <ul className="space-y-2.5">
              {openQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed font-medium">{q}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">All discussed topics had clear resolutions.</p>
          )}
        </div>
      </div>
    </div>
  );
};


