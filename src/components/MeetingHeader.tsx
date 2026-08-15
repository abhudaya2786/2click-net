import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  Globe, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Mail, 
  Printer, 
  Edit3, 
  MessageSquare,
  Plus,
  Radio,
  FileText,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { MeetingData } from '../types';
import { copyToClipboard, generateMarkdownMoM, downloadAsTxt, downloadTranscriptTxt, downloadAsDocx } from '../utils/exportUtils';

interface MeetingHeaderProps {
  meeting: MeetingData;
  onUpdateTitle: (newTitle: string) => void;
  onOpenEmailModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenPrivacyModal: () => void;
  onToggleChat: () => void;
  onStartNewMeeting: () => void;
  isChatOpen: boolean;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meeting,
  onUpdateTitle,
  onOpenEmailModal,
  onOpenScheduleModal,
  onOpenPrivacyModal,
  onToggleChat,
  onStartNewMeeting,
  isChatOpen,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(meeting.title);
  const [copied, setCopied] = useState(false);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCopyMoM = async () => {
    const md = generateMarkdownMoM(meeting);
    await copyToClipboard(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const completedActions = meeting.actionItems.filter(i => i.status === 'Completed').length;

  return (
    <div id="meeting-header-section" className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xs backdrop-blur-xs transition-all relative overflow-hidden">
      {/* Background ambient gradient accent */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-indigo-500/5 dark:from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Bar: Category Badges & Quick Action Dock */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs">
            <Tag className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            {meeting.meetingType || 'General Meeting'}
          </span>

          {meeting.sentiment && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {meeting.sentiment}
            </span>
          )}

          {meeting.languageDetected && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-750">
              <Globe className="w-3 h-3 text-slate-400" />
              {meeting.languageDetected}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {completedActions}/{meeting.actionItems.length} Tasks Done
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            id="open-schedule-btn"
            onClick={onOpenScheduleModal}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-2xs min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95"
            title="Auto-detect & schedule follow-up or calendar sync"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Calendar</span>
          </button>

          <button
            id="copy-mom-btn"
            onClick={handleCopyMoM}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Copy formatted Markdown MoM to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy MoM'}</span>
          </button>

          <button
            id="email-draft-btn"
            onClick={onOpenEmailModal}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Draft email summary for attendees"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span>Email</span>
          </button>

          <button
            id="print-btn"
            onClick={handlePrint}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Export / Print PDF"
            aria-label="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF</span>
          </button>

          <button
            id="txt-export-btn"
            onClick={() => downloadAsTxt(meeting)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Download Minutes as TXT"
            aria-label="Download minutes as text file"
          >
            <span>TXT</span>
          </button>

          <button
            id="transcript-txt-btn"
            onClick={() => downloadTranscriptTxt(meeting)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Download full transcript TXT"
            aria-label="Download transcript as text file"
          >
            <span>Transcript</span>
          </button>

          <button
            id="docx-export-btn"
            onClick={() => downloadAsDocx(meeting)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-2xs"
            title="Download Word-compatible XML"
            aria-label="Download minutes as Word XML"
          >
            <span>DOCX</span>
          </button>

          <button
            id="toggle-chat-btn"
            onClick={onToggleChat}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95 shadow-xs ${
              isChatOpen
                ? 'bg-indigo-600 text-white shadow-indigo-500/25'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Copilot</span>
          </button>

          <button
            id="new-meeting-btn"
            onClick={onStartNewMeeting}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition shadow-xs min-h-[38px] sm:min-h-[34px] cursor-pointer touch-manipulation active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Main Title & Metadata Row */}
      <div className="mt-4 relative z-10">
        {isEditingTitle ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border-2 border-indigo-500 w-full focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTitle}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer flex-shrink-0 min-h-[40px] active:scale-95 transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0 min-h-[40px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3 group">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {meeting.title}
            </h1>
            <button
              onClick={() => {
                setTitleInput(meeting.title);
                setIsEditingTitle(true);
              }}
              className="opacity-80 sm:opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              title="Edit Meeting Title"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Key Info Pill Ribbon */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 mt-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{meeting.meetingDate}</span>
          </div>

          {meeting.duration && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{meeting.duration}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{meeting.participants.length} Attendees</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>•</span>
            <span>{meeting.decisions.length} Decisions Logged</span>
            <span>•</span>
            <span>{meeting.keyTopics.length} Key Topics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

