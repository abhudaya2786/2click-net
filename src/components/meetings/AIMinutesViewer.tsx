import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Languages,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  FullMeetingRecord,
  MeetingMinutesEntity,
  GenerateMinutesResponse,
} from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface AIMinutesViewerProps {
  meeting: FullMeetingRecord;
  onRefresh: () => void;
  onNavigateTab?: (tab: 'minutes' | 'decisions' | 'action_items' | 'transcript') => void;
}

export const AIMinutesViewer: React.FC<AIMinutesViewerProps> = ({
  meeting,
  onRefresh,
  onNavigateTab,
}) => {
  const latestMinutes: MeetingMinutesEntity | undefined = meeting.minutes?.[0];

  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [languageHint, setLanguageHint] = useState<string>('auto');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const transcriptCount = meeting.transcriptSegments?.length || 0;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);

      const transcriptText = meeting.transcriptSegments && meeting.transcriptSegments.length > 0
        ? meeting.transcriptSegments
            .map((s) => `[${s.start_time} - ${s.end_time}] ${s.speaker} (${s.language}): ${s.text}`)
            .join('\n')
        : `Meeting Title: ${meeting.title}\nAgenda: ${meeting.agenda || 'General discussion'}\nOrganizer: ${meeting.organizer}\nDate: ${meeting.date}`;

      const res: GenerateMinutesResponse = await meetingDb.generateMinutes({
        meetingId: meeting.id,
        transcript: transcriptText,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        participants: meeting.participants.map((p) => p.name),
        provider: selectedProvider,
        additionalContext: additionalContext.trim() || undefined,
        languageHint: languageHint !== 'auto' ? languageHint : undefined,
      });

      if (res.success) {
        await onRefresh();
      } else {
        setGenerationError('Failed to generate minutes. Please check transcript.');
      }
    } catch (err: any) {
      console.error('Error generating AI minutes:', err);
      setGenerationError(err.message || 'Error occurred while running AI Intelligence generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMinutes = () => {
    if (!latestMinutes) return;
    const formatted = `
# ${meeting.title} - AI Meeting Minutes
Date: ${meeting.date} | Organizer: ${meeting.organizer}

## Executive Summary
${latestMinutes.summary}

## Key Discussion Points
${latestMinutes.discussion_points.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}

## Pending Issues & Questions
${latestMinutes.pending_issues?.map((p) => `- ${p}`).join('\n') || 'None'}

## Next Meeting
${latestMinutes.next_meeting || 'Not specified'}

Generated with ${latestMinutes.provider?.toUpperCase()} (${latestMinutes.model_used || 'GPT-4o / Gemini'})
`.trim();

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-minutes-viewer" className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-blue-900/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                AI Meeting Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                Rule-Enforced AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero-hallucination minutes generation preserving authentic Hindi, English, and Hinglish dialogue.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Config</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>

          {latestMinutes && (
            <button
              onClick={handleCopyMinutes}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              title="Copy minutes to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Minutes</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Minutes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{latestMinutes ? 'Regenerate Minutes' : 'Generate AI Minutes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Config Dropdown / Card */}
      {showConfig && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="gemini">Google Gemini 2.5 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Language Context
              </label>
              <select
                value={languageHint}
                onChange={(e) => setLanguageHint(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="auto">Auto-Detect (Hindi / English / Hinglish)</option>
                <option value="hinglish">Hinglish (Hindi in Latin script)</option>
                <option value="hindi">Hindi (Devanagari)</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Transcript Source
              </label>
              <div className="text-xs py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
                <span>{transcriptCount} segments recorded</span>
                <span className="text-emerald-500 font-bold text-[10px]">Ready</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Additional Context / Specific Directives (Optional)
            </label>
            <input
              type="text"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Focus specifically on mobile sync latency and Friday deadlines"
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Generation Error Alert */}
      {generationError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div>
            <span className="font-bold">Generation Issue: </span>
            <span>{generationError}</span>
          </div>
        </div>
      )}

      {/* AI Strict Rules Banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict AI Grounding Standards:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="text-slate-600 dark:text-slate-300">✓ No Invented Data</span>
          <span>•</span>
          <span className="text-slate-600 dark:text-slate-300">✓ Preserves Real Names & Deadlines</span>
          <span>•</span>
          <span className="text-slate-600 dark:text-slate-300">✓ Multilingual Hinglish / Hindi</span>
          <span>•</span>
          <span className="text-slate-600 dark:text-slate-300">✓ "Not specified" for Missing Info</span>
        </div>
      </div>

      {/* Main Content View */}
      {latestMinutes ? (
        <div className="space-y-6">
          {/* 1. Summary Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Executive Summary
                </h3>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>Generated {new Date(latestMinutes.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              {latestMinutes.summary}
            </p>
          </div>

          {/* 2. Key Discussion Points */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Discussion Points ({latestMinutes.discussion_points?.length || 0})
              </h3>
            </div>

            <div className="space-y-2">
              {latestMinutes.discussion_points && latestMinutes.discussion_points.length > 0 ? (
                latestMinutes.discussion_points.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic p-3">No specific discussion points recorded.</div>
              )}
            </div>
          </div>

          {/* 3. Two Column Grid: Pending Issues & Next Meeting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Issues */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Pending Issues & Open Questions
                </h3>
              </div>

              <div className="space-y-2">
                {latestMinutes.pending_issues && latestMinutes.pending_issues.length > 0 ? (
                  latestMinutes.pending_issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
                    No unresolved pending issues flagged.
                  </div>
                )}
              </div>
            </div>

            {/* Next Meeting */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Next Meeting & Follow-up
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30 text-xs sm:text-sm text-purple-950 dark:text-purple-200 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{latestMinutes.next_meeting || 'Not specified'}</div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                    Marked for automatic sprint sync & calendar scheduling.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Buttons to Decisions & Action Items */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div className="text-slate-600 dark:text-slate-300 font-medium">
              View extracted relational tables:
            </div>
            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <>
                  <button
                    onClick={() => onNavigateTab('decisions')}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Decisions Table ({meeting.decisions?.length || 0})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateTab('action_items')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Action Items Table ({meeting.actionItems?.length || 0})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: No Minutes Generated Yet */
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No AI Minutes Generated Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run the AI Meeting Intelligence module on your meeting transcript to automatically extract executive summaries, discussion points, finalized decisions, and prioritized action items.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Analyzing & Generating...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Generate AI Minutes Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
