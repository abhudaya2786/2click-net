import React, { useState, useRef } from 'react';
import { Upload, FileAudio, FileText, CheckCircle2, AlertCircle, Sparkles, X, ChevronDown, ChevronUp, Music, ArrowRight } from 'lucide-react';
import { MeetingContextOptions } from '../types';

interface AudioUploaderProps {
  onAudioFileSelected: (file: File, context: MeetingContextOptions) => void;
  onTextSubmitted: (text: string, context: MeetingContextOptions) => void;
  isProcessing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onAudioFileSelected,
  onTextSubmitted,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Context metadata
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Sprint Planning');
  const [participantsHint, setParticipantsHint] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFileAudioUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|webm|ogg|aac|flac)$/i)) {
        handleFileChange(file);
      }
    }
  };

  const handleRemoveFile = () => {
    if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    setSelectedFile(null);
    setFileAudioUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    const context: MeetingContextOptions = {
      title: meetingTitle.trim() || undefined,
      meetingType: meetingType || undefined,
      participants: participantsHint.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    };

    if (activeTab === 'upload' && selectedFile) {
      onAudioFileSelected(selectedFile, context);
    } else if (activeTab === 'text' && rawText.trim()) {
      onTextSubmitted(rawText.trim(), context);
    }
  };

  return (
    <div id="audio-uploader-card" className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs backdrop-blur-xs">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 max-w-sm mx-auto">
        <button
          id="tab-audio-file"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition min-h-[38px] touch-manipulation cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileAudio className="w-4 h-4" />
          <span>Upload Audio</span>
        </button>
        <button
          id="tab-text-notes"
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition min-h-[38px] touch-manipulation cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Notes</span>
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div>
          {!selectedFile ? (
            <div
              id="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center active:scale-[0.99] touch-manipulation min-h-[170px] ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 bg-slate-50/30 dark:bg-slate-950/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac,.flac"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Choose Audio File or Drop Here
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                Supports MP3, WAV, M4A, WEBM, OGG, AAC (Google Meet, Zoom, Teams, WhatsApp recordings)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Gemini Diarization
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {fileAudioUrl && (
                <audio controls src={fileAudioUrl} className="w-full h-10 mt-1 rounded-lg" />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Paste Meeting Transcript, Rough Notes, or Audio Dictation
          </label>
          <textarea
            id="transcript-raw-input"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your meeting notes, raw transcription, or audio transcript here (e.g. Rahul: We should launch v1 by Friday... Priya: I agree, payment gateway is ready...)"
            className="w-full h-36 p-3.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 resize-y"
          />
          <p className="text-xs text-slate-400">
            Supports Hindi, Hinglish, English, or mixed language notes.
          </p>
        </div>
      )}

      {/* Advanced Context Hints (Collapsible) */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer min-h-[36px]"
        >
          <span>Optional Context & Meeting Hints (Enhances Accuracy)</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Q3 Architecture Review"
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Meeting Category
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="Sprint Planning">Sprint Planning</option>
                <option value="Client Sync">Client Sync</option>
                <option value="Product Strategy">Product Strategy</option>
                <option value="Daily Standup">Daily Standup</option>
                <option value="Budget & Financials">Budget & Financials</option>
                <option value="Architecture & Tech">Architecture & Tech</option>
                <option value="General Discussion">General Discussion</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Expected Participants (Optional)
              </label>
              <input
                type="text"
                value={participantsHint}
                onChange={(e) => setParticipantsHint(e.target.value)}
                placeholder="e.g. Rahul, Priya, Vikram, David"
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Custom Focus / Instructions
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Focus on pricing and action items"
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="mt-5 flex justify-end">
        <button
          id="generate-mom-submit-btn"
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            (activeTab === 'upload' && !selectedFile) ||
            (activeTab === 'text' && !rawText.trim())
          }
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px] touch-manipulation active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isProcessing ? 'Analyzing with Gemini...' : 'Generate Minutes of Meeting'}</span>
        </button>
      </div>
    </div>
  );
};

