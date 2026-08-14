import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, CornerDownLeft, Loader2, Copy, Check } from 'lucide-react';
import { MeetingData, ChatMessage } from '../types';
import { copyToClipboard } from '../utils/exportUtils';

interface MeetingChatCopilotProps {
  meeting: MeetingData;
  onClose: () => void;
}

export const MeetingChatCopilot: React.FC<MeetingChatCopilotProps> = ({ meeting, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Meeting Copilot. I have full context of **"${meeting.title}"**. Ask me anything about discussions, decisions, who is responsible for what, or ask me to draft a custom message!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const prompt = (promptToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingData: meeting,
          messages: [...messages, userMessage],
          currentPrompt: prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const botMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'I analyzed the meeting for your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Could not communicate with the AI assistant. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'What was decided about the project deadline?',
    'List all action items assigned with owners',
    'Summarize this entire meeting in Hindi',
    'Draft a Slack update for the engineering team',
  ];

  return (
    <div id="meeting-copilot-card" className="flex flex-col h-[480px] sm:h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-xl shadow-lg sm:shadow-xs overflow-hidden">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold">AI Meeting Copilot</h4>
            <p className="text-[10px] text-blue-100 opacity-90 truncate max-w-[200px] sm:max-w-xs">
              Grounded on "{meeting.title}"
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 relative group ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-xs">
                {msg.content}
              </div>

              <div
                className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                  msg.role === 'user'
                    ? 'border-blue-500/50 text-blue-200'
                    : 'border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="opacity-90 sm:opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-blue-600 flex items-center gap-1 p-0.5 cursor-pointer"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 w-fit shadow-2xs">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>AI Copilot is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 bg-slate-100/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-2.5 py-1.5 sm:py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap transition cursor-pointer flex-shrink-0 touch-manipulation min-h-[30px]"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask anything about this meeting..."
          className="flex-1 px-3.5 py-2 text-base sm:text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-200 min-h-[40px]"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 touch-manipulation"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
