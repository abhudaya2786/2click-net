import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  Filter,
  User,
  Clock,
  Radio,
  FileText,
  Trash2,
  Plus,
  Play,
  Languages,
} from 'lucide-react';
import { FullMeetingRecord, RecordingEntity, SupportedSpeechLanguage, TranscriptSegmentEntity } from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface TranscriptViewerProps {
  meeting: FullMeetingRecord;
  segments: TranscriptSegmentEntity[];
  recordings: RecordingEntity[];
  onRefresh: () => void;
  onGenerateMoMFromTranscript?: (transcriptText: string) => void;
  onPlayAtTime?: (seconds: number) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  meeting,
  segments,
  recordings,
  onRefresh,
  onGenerateMoMFromTranscript,
  onPlayAtTime,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('All');
  
  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeLang, setTranscribeLang] = useState<SupportedSpeechLanguage>('auto');
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>(
    recordings[0]?.id || ''
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Manual segment addition modal/form toggle
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState(meeting.organizer || 'Speaker');
  const [newText, setNewText] = useState('');
  const [newStartTime, setNewStartTime] = useState('00:00');
  const [newEndTime, setNewEndTime] = useState('00:15');
  const [newLanguage, setNewLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');

  // Speakers list for filter
  const speakers = useMemo(() => {
    const set = new Set<string>();
    segments.forEach((s) => {
      if (s.speaker) set.add(s.speaker);
    });
    meeting.participants.forEach((p) => set.add(p.name));
    return Array.from(set);
  }, [segments, meeting.participants]);

  // Language count calculation
  const counts = useMemo(() => {
    let en = 0, hi = 0, hinglish = 0;
    segments.forEach((s) => {
      const l = s.language?.toLowerCase() || '';
      if (l.includes('hin') && !l.includes('hing')) hi++;
      else if (l.includes('hing')) hinglish++;
      else en++;
    });
    return { all: segments.length, en, hi, hinglish };
  }, [segments]);

  // Filtered segments
  const filteredSegments = useMemo(() => {
    return segments.filter((seg) => {
      const matchesSearch =
        !searchQuery ||
        seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seg.speaker.toLowerCase().includes(searchQuery.toLowerCase());

      const langLower = seg.language?.toLowerCase() || '';
      let matchesLang = true;
      if (selectedLanguage === 'English') matchesLang = langLower.includes('eng') || (!langLower.includes('hin') && !langLower.includes('hing'));
      else if (selectedLanguage === 'Hindi') matchesLang = langLower.includes('hin') && !langLower.includes('hing');
      else if (selectedLanguage === 'Hinglish') matchesLang = langLower.includes('hing');

      const matchesSpeaker = selectedSpeaker === 'All' || seg.speaker === selectedSpeaker;

      return matchesSearch && matchesLang && matchesSpeaker;
    });
  }, [segments, searchQuery, selectedLanguage, selectedSpeaker]);

  // Convert time string "MM:SS" to seconds
  const parseTimeToSeconds = (t: string): number => {
    const parts = t.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  // Trigger Provider-based Transcription
  const handleTranscribe = async () => {
    setErrorMsg(null);
    setSuccessNotice(null);

    const targetRec = recordings.find((r) => r.id === selectedRecordingId) || recordings[0];
    if (!targetRec || !targetRec.audioData) {
      setErrorMsg('No audio recording found for this meeting. Please record audio in the Meeting Studio first.');
      return;
    }

    setIsTranscribing(true);

    try {
      const participantNames = meeting.participants.map((p) => p.name);
      if (meeting.organizer && !participantNames.includes(meeting.organizer)) {
        participantNames.push(meeting.organizer);
      }

      const result = await meetingDb.transcribeAudio({
        meetingId: meeting.id,
        audioBase64: targetRec.audioData,
        mimeType: targetRec.mimeType || 'audio/webm',
        language: transcribeLang,
        userEmail: meeting.organizerEmail || 'shrinet.info@gmail.com',
        speakerHint: participantNames,
        contextPrompt: meeting.agenda || meeting.title,
      });

      if (result.success) {
        setSuccessNotice(
          `Transcribed ${result.segments.length} segments successfully using ${
            result.provider === 'openai' ? 'OpenAI Speech-to-Text' : 'Gemini STT'
          } (${result.detectedLanguage || transcribeLang}).`
        );
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to transcribe audio.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transcription request failed. Please check network/API credentials.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Copy Single Segment
  const handleCopySegment = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy Full Transcript
  const handleCopyFull = () => {
    const fullText = segments
      .map((s) => `[${s.start_time} - ${s.end_time}] ${s.speaker} (${s.language}): ${s.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  // Download Transcript as TXT
  const handleDownloadTxt = () => {
    const fullText = `MEETING TRANSCRIPT\nTitle: ${meeting.title}\nDate: ${meeting.date}\nOrganizer: ${meeting.organizer}\n\n` +
      segments
        .map((s) => `[${s.start_time} - ${s.end_time}] ${s.speaker} [${s.language}]:\n${s.text}`)
        .join('\n\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${meeting.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Transcript as JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(
      {
        meetingId: meeting.id,
        title: meeting.title,
        date: meeting.date,
        totalSegments: segments.length,
        transcript_segments: segments,
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-segments-${meeting.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add manual segment
  const handleAddManualSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newSeg: TranscriptSegmentEntity = {
      id: `seg-${meeting.id}-${Date.now()}`,
      meeting_id: meeting.id,
      start_time: newStartTime,
      end_time: newEndTime,
      speaker: newSpeaker.trim(),
      text: newText.trim(),
      language: newLanguage,
      created_at: new Date().toISOString(),
    };

    const updated = [...segments, newSeg].sort((a, b) => a.start_time.localeCompare(b.start_time));
    await meetingDb.saveTranscriptSegments(meeting.id, updated, true);
    setIsAddingSegment(false);
    setNewText('');
    onRefresh();
  };

  // Clear all transcript segments
  const handleClearTranscript = async () => {
    if (window.confirm('Are you sure you want to clear all transcript segments for this meeting?')) {
      await meetingDb.deleteTranscript(meeting.id);
      onRefresh();
    }
  };

  // Speaker Avatar Color Helper
  const getSpeakerColorClass = (speaker: string) => {
    const p = meeting.participants.find((part) => part.name.toLowerCase() === speaker.toLowerCase());
    const color = p?.avatarColor || 'indigo';
    switch (color) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  // Language Chip Badge Helper
  const renderLanguageBadge = (lang: string) => {
    const l = lang?.toLowerCase() || '';
    if (l.includes('hin') && !l.includes('hing')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span>🇮🇳</span> Hindi
        </span>
      );
    }
    if (l.includes('hing')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <span>⚡</span> Hinglish
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span>🇬🇧</span> English
      </span>
    );
  };

  return (
    <div className="space-y-6" id="transcript-viewer-root">
      {/* 1. TOP SPEECH-TO-TEXT CONTROL PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4" id="stt-control-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Radio className="w-5 h-5 animate-pulse text-indigo-600" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Provider-Based Speech-to-Text
                </h3>
                <p className="text-xs text-slate-500">
                  OpenAI Speech-to-Text (Whisper) with Hindi, English & Hinglish Code-Switching
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Recording Picker (if multiple) */}
            {recordings.length > 1 && (
              <select
                value={selectedRecordingId}
                onChange={(e) => setSelectedRecordingId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {recordings.map((r, idx) => (
                  <option key={r.id} value={r.id}>
                    Recording #{idx + 1} ({Math.round(r.durationSeconds)}s)
                  </option>
                ))}
              </select>
            )}

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Languages className="w-4 h-4 text-slate-500" />
              <select
                value={transcribeLang}
                onChange={(e) => setTranscribeLang(e.target.value as SupportedSpeechLanguage)}
                className="text-xs bg-transparent text-slate-800 font-medium focus:outline-none"
              >
                <option value="auto">Auto-Detect Language</option>
                <option value="en">English (🇬🇧)</option>
                <option value="hi">Hindi - हिन्दी (🇮🇳)</option>
                <option value="hinglish">Hinglish - Code-Switch (⚡)</option>
              </select>
            </div>

            {/* Transcribe Trigger Button */}
            <button
              id="btn-trigger-stt-transcribe"
              onClick={handleTranscribe}
              disabled={isTranscribing || recordings.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              {isTranscribing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transcribing Audio...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Transcribe Audio</span>
                </>
              )}
            </button>

            {/* Add Segment manually button */}
            <button
              onClick={() => setIsAddingSegment(!isAddingSegment)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Segment</span>
            </button>
          </div>
        </div>

        {/* Notices & Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}
        {successNotice && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
            <span>{successNotice}</span>
            <button onClick={() => setSuccessNotice(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Manual Segment Form Collapse */}
        {isAddingSegment && (
          <form
            onSubmit={handleAddManualSegment}
            className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
          >
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Add Timestamped Transcript Segment</span>
              <button
                type="button"
                onClick={() => setIsAddingSegment(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Speaker</label>
                <input
                  type="text"
                  value={newSpeaker}
                  onChange={(e) => setNewSpeaker(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                  placeholder="Speaker Name"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Start Time</label>
                <input
                  type="text"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                  placeholder="00:00"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">End Time</label>
                <input
                  type="text"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                  placeholder="00:15"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Language</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Hinglish">Hinglish (Mix)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Dialogue Text</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Enter spoken segment text..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800"
              >
                Save Segment to Table
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript text or speaker..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLanguage('All')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedLanguage === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setSelectedLanguage('English')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedLanguage === 'English'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🇬🇧</span> English ({counts.en})
          </button>
          <button
            onClick={() => setSelectedLanguage('Hindi')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedLanguage === 'Hindi'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🇮🇳</span> Hindi ({counts.hi})
          </button>
          <button
            onClick={() => setSelectedLanguage('Hinglish')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              selectedLanguage === 'Hinglish'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>⚡</span> Hinglish ({counts.hinglish})
          </button>
        </div>

        {/* Speaker Filter Dropdown */}
        {speakers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Speakers</option>
              {speakers.map((spk) => (
                <option key={spk} value={spk}>
                  {spk}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. TRANSCRIPT SEGMENTS LIST */}
      <div className="space-y-3" id="transcript-segments-container">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">No Transcript Segments Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {segments.length === 0
                ? 'Click "Transcribe Audio" above to run OpenAI Speech-to-Text on the recorded audio, or add segments manually.'
                : 'No segments match your current search and language filters.'}
            </p>
            {segments.length === 0 && recordings.length > 0 && (
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transcribe Recorded Audio Now</span>
              </button>
            )}
          </div>
        ) : (
          filteredSegments.map((seg, idx) => (
            <div
              key={seg.id || idx}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all group"
            >
              {/* Segment Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {/* Speaker Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getSpeakerColorClass(
                      seg.speaker
                    )}`}
                  >
                    <User className="w-3 h-3" />
                    {seg.speaker}
                  </span>

                  {/* Timestamp with clickable play sync */}
                  <button
                    onClick={() => onPlayAtTime && onPlayAtTime(parseTimeToSeconds(seg.start_time))}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    title="Click to jump audio to this timestamp"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {seg.start_time} - {seg.end_time}
                    </span>
                    <Play className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                  </button>

                  {/* Language Badge */}
                  {renderLanguageBadge(seg.language)}
                </div>

                {/* Single Segment Copy Action */}
                <button
                  onClick={() => handleCopySegment(seg.text, idx)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
                  title="Copy segment text"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Segment Text */}
              <p className="text-sm text-slate-800 leading-relaxed pl-1 font-normal select-text">
                {seg.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 4. BOTTOM ACTION & EXPORT BAR */}
      {segments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredSegments.length}</strong> of{' '}
            <strong className="text-slate-800">{segments.length}</strong> segments in{' '}
            <code className="text-indigo-600 font-mono text-[11px]">transcript_segments</code> table.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Generate MoM directly from Transcript */}
            {onGenerateMoMFromTranscript && (
              <button
                onClick={() => {
                  const full = segments.map((s) => `${s.speaker}: ${s.text}`).join('\n');
                  onGenerateMoMFromTranscript(full);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Generate MoM from Transcript</span>
              </button>
            )}

            {/* Copy Full */}
            <button
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              {allCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{allCopied ? 'Copied Full!' : 'Copy Full'}</span>
            </button>

            {/* Download TXT */}
            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {/* Clear Transcript */}
            <button
              onClick={handleClearTranscript}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Clear transcript"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
