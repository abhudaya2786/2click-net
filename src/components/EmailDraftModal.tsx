import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, Send, Sparkles, X, RefreshCw, Loader2 } from 'lucide-react';
import { MeetingData } from '../types';
import { copyToClipboard } from '../utils/exportUtils';

interface EmailDraftModalProps {
  meeting: MeetingData;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ meeting, isOpen, onClose }) => {
  const [emailText, setEmailText] = useState('');
  const [emailStyle, setEmailStyle] = useState('Formal Executive');
  const [recipient, setRecipient] = useState('All Meeting Participants');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmail = async (style: string, recip: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingData: meeting,
          emailStyle: style,
          recipient: recip,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setEmailText(data.emailText || '');
    } catch (err: any) {
      console.error('Email gen error:', err);
      // Fallback local template
      const fallback = `Subject: Minutes of Meeting: ${meeting.title} - ${meeting.meetingDate}

Dear Team,

Please find the summary and agreed action items from our meeting on ${meeting.meetingDate}.

Executive Summary:
${meeting.executiveSummary}

Key Decisions:
${meeting.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Action Items:
${meeting.actionItems.map((a) => `- ${a.task} (Owner: ${a.owner} | Due: ${a.deadline})`).join('\n')}

Please review and reach out if you have any questions.

Best regards,
Meeting Facilitator`;
      setEmailText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateEmail(emailStyle, recipient);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await copyToClipboard(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(`Minutes of Meeting: ${meeting.title} (${meeting.meetingDate})`);
    const body = encodeURIComponent(emailText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Draft Follow-up Email
              </h3>
              <p className="text-[11px] text-slate-500">
                Ready to send summary for stakeholders and attendees
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

        {/* Options Toolbar */}
        <div className="p-3 bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Tone & Style</label>
            <select
              value={emailStyle}
              onChange={(e) => {
                setEmailStyle(e.target.value);
                generateEmail(e.target.value, recipient);
              }}
              className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="Formal Executive">Formal Executive (Crisp & Concise)</option>
              <option value="Agile Team Sync">Agile Team (Action-Oriented & Direct)</option>
              <option value="Client Update">Client Update (Polished & Professional)</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Recipients</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onBlur={() => generateEmail(emailStyle, recipient)}
              className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="e.g. All Attendees / Leadership"
            />
          </div>
        </div>

        {/* Email Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Formatting email with Gemini AI...</span>
            </div>
          ) : (
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              className="w-full h-80 p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-200 resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => generateEmail(emailStyle, recipient)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Email'}
            </button>

            <button
              onClick={handleOpenMailto}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Open in Mail App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
