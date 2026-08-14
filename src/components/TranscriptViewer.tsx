import React, { useState } from 'react';
import { Search, Copy, Check, MessageSquare, Mic, User } from 'lucide-react';
import { TranscriptSegment } from '../types';
import { copyToClipboard } from '../utils/exportUtils';

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcript }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Extract unique speakers
  const speakers = Array.from(new Set(transcript.map((t) => t.speaker))).filter(Boolean);

  const getSpeakerColor = (speakerName: string) => {
    const colors = [
      'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
      'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200/70 dark:border-cyan-800/60',
      'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
      'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
      'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
    ];
    let hash = 0;
    for (let i = 0; i < speakerName.length; i++) {
      hash = speakerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const filteredTranscript = transcript.filter((item) => {
    const matchesSpeaker = selectedSpeaker === 'All' || item.speaker === selectedSpeaker;
    const matchesSearch =
      !searchQuery.trim() ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  const handleCopyTranscript = async () => {
    const text = transcript
      .map((t) => `${t.speaker} ${t.timestamp ? `(${t.timestamp})` : ''}: ${t.text}`)
      .join('\n\n');
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="transcript-viewer-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs">
      {/* Header, Real-time status & Copy */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Speaker Diarized Transcript ({transcript.length} turns)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">High-fidelity turn-by-turn capture</p>
          </div>
        </div>

        <button
          onClick={handleCopyTranscript}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy All'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dialogue text or speaker names..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 min-h-[40px]"
          />
        </div>

        {/* Speaker Pills Filter */}
        {speakers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedSpeaker('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[34px] touch-manipulation ${
                selectedSpeaker === 'All'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({transcript.length})
            </button>
            {speakers.map((spk) => (
              <button
                key={spk}
                onClick={() => setSelectedSpeaker(spk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer min-h-[34px] touch-manipulation ${
                  selectedSpeaker === spk
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {spk}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Turns - High Density Studio Layout */}
      <div className="space-y-3 max-h-[420px] sm:max-h-[520px] overflow-y-auto pr-1">
        {filteredTranscript.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No dialogue matches found for "{searchQuery}".
          </div>
        ) : (
          filteredTranscript.map((segment, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition border border-slate-200/60 dark:border-slate-850 shadow-2xs"
            >
              <div className="flex items-center gap-2 sm:w-44 flex-shrink-0">
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-200/70 dark:border-indigo-900/60">
                  {segment.timestamp || `00:${(idx * 15).toString().padStart(2, '0')}`}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border truncate ${getSpeakerColor(segment.speaker)}`}>
                  {segment.speaker}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex-1 leading-relaxed pl-1 sm:pl-0 font-normal">
                {segment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


