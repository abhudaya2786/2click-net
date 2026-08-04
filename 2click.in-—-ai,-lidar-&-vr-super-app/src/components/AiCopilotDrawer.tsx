import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, RefreshCw, Mic, MicOff, MapPin, Image as ImageIcon, Check, SlidersHorizontal } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  activeTab?: string;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ isOpen, onClose, selectedCity, activeTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Namaste! I am 2click Copilot — your AI Assistant for Indian Construction (IS 456 / CPWD DSR), Solar Rooftops (PM Surya Ghar), Vastu Shastra, and Interior Architecture. How can I assist with your project in ${selectedCity} today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['IS 456:2000', 'CPWD DSR 2023', 'MNRE Solar Guidelines']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [useMapsGrounding, setUseMapsGrounding] = useState(true);
  
  // Image Generation Options
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt: string; ratio: string; size: string }>>([]);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic quick action suggestions based on activeTab
  const getSuggestionsForActiveTab = (tab?: string) => {
    const t = (tab || '').toLowerCase();

    if (t.includes('ca') || t.includes('khatabook') || t.includes('tax') || t.includes('gst') || t.includes('crm')) {
      return {
        contextLabel: 'CA & Tax Hub',
        prompts: [
          '⚖️ Check GST Rates for Construction Materials (Cement 28%, Steel 18%)',
          '🧾 Calculate Section 194C TDS Deduction for Sub-Contractor Invoices',
          '📊 Generate E-Way Bill Limit & Input Tax Credit (ITC) Rules',
          '📜 What are late filing penalties for GSTR-3B & GSTR-1?'
        ]
      };
    }

    if (t.includes('solar')) {
      return {
        contextLabel: 'Solar Rooftop',
        prompts: [
          '☀️ Calculate PM Surya Ghar Rooftop Solar Subsidy for 3kW System',
          '🔋 Compare 3kW vs 5kW On-Grid Solar Plant Cost in ' + selectedCity,
          '⚡ How much can I save on monthly electricity bills with Solar?',
          '📜 List MNRE Approved Net-Metering Vendors near me'
        ]
      };
    }

    if (t.includes('paint') || t.includes('interior')) {
      return {
        contextLabel: 'Paints & Interiors',
        prompts: [
          '🎨 Compare Asian Paints Royale vs Berger Silk Luxury Emulsions',
          '🖌️ How many liters of wall putty and paint needed for 1500 sqft?',
          '🖼️ Generate 3D Modern Living Room Interior Render with False Ceiling',
          '🪵 What is the current rate of Teak Wood & PVC Wall Panels?'
        ]
      };
    }

    if (t.includes('tile') || t.includes('marble')) {
      return {
        contextLabel: 'Tiles & Marble',
        prompts: [
          '🔲 Calculate Kajaria 2x2 Double Charge Tiles Box requirement for 1000 sqft',
          '🪨 Compare Italian Marble vs Rajasthan Granites price per sqft',
          '📐 How much tile adhesive & epoxy grout is needed for bathroom?',
          '🛠️ What are local tile fitting labor rates per sqft in ' + selectedCity
        ]
      };
    }

    if (t.includes('bank') || t.includes('loan') || t.includes('finance')) {
      return {
        contextLabel: 'Bank & Home Loans',
        prompts: [
          '🏦 Calculate monthly Home Loan EMI for ₹30 Lakhs at 8.5% interest',
          '📄 List required documents for PMAY subsidy & Home Construction Loan',
          '🏗️ What is Commercial Heavy Machinery Equipment Finance process?',
          '🔍 How to check CIBIL score requirements for contractor overdraft?'
        ]
      };
    }

    if (t.includes('naksha') || t.includes('vastu') || t.includes('blueprint')) {
      return {
        contextLabel: 'Naksha & Vastu',
        prompts: [
          '🧭 Check Vastu Shastra rules for Kitchen & Master Bedroom placement',
          '📜 What is Municipal Corporation Blueprint Map Approval checklist?',
          '🏡 Generate 30x50 ft East-Facing 3BHK Duplex Floorplan layout',
          '📐 What are CPWD setback & FAR regulations for residential plots?'
        ]
      };
    }

    if (t.includes('directory') || t.includes('logistics') || t.includes('dukandar') || t.includes('vendor')) {
      return {
        contextLabel: 'Suppliers & Directory',
        prompts: [
          '📍 Find verified Tata Tiscon Steel & UltraTech Cement dealers near ' + selectedCity,
          '🚚 What are Tata Ace & 10-Ton Truck transportation charges per km?',
          '📞 Find licensed Electrical & Plumbing Contractors in ' + selectedCity,
          '🛞 What are JCB & Crane hourly hiring rates in market?'
        ]
      };
    }

    if (t.includes('lidar') || t.includes('vr') || t.includes('survey')) {
      return {
        contextLabel: 'LiDAR & 3D Survey',
        prompts: [
          '📐 How to convert LiDAR Point Cloud scan into 3D CAD Drawing?',
          '🥽 What VR Headsets support 360 Walkthrough for clients?',
          '🏗️ Calculate Site Leveling & Excavation volume from 3D Mesh'
        ]
      };
    }

    // Default Construction Hub
    return {
      contextLabel: 'Construction & Materials',
      prompts: [
        '📐 Calculate BoQ & Material Quantity for 1200 sqft RCC Slab (IS 456)',
        '🧱 Compare Tata Tiscon 550SD vs JSW Neosteel TMT Bar Live Rates',
        '🎨 Generate 3D Front Elevation render for 30x50 ft Modern House',
        '☀️ Calculate PM Surya Ghar Solar Subsidy for 3kW rooftop plant',
        '⚖️ Check GST Rates & TDS Rules for Construction Contractors'
      ]
    };
  };

  const { contextLabel, prompts: quickPrompts } = getSuggestionsForActiveTab(activeTab);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, generatedImages, isOpen]);

  if (!isOpen) return null;

  // Microphone audio recording & transcription handler
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setLoading(true);
          try {
            const res = await fetch('/api/ai/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' })
            });
            const data = await res.json();
            if (data.transcription) {
              setInput(data.transcription);
            }
          } catch (err) {
            console.error('Audio transcription error:', err);
          } finally {
            setLoading(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission or recording error:', err);
      alert('Could not access microphone. Please check browser permissions.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleGenerateImage = async (promptQuery: string) => {
    if (!promptQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptQuery,
          aspectRatio,
          imageSize
        })
      });
      const data = await res.json();

      if (data.imageUrl) {
        setGeneratedImages(prev => [
          { url: data.imageUrl, prompt: promptQuery, ratio: data.aspectRatio || aspectRatio, size: data.imageSize || imageSize },
          ...prev
        ]);
        
        const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: `✨ Generated high-quality 3D render (${imageSize}, ${aspectRatio}): "${promptQuery}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (mode === 'image') {
      setInput('');
      await handleGenerateImage(query);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      let endpoint = '/api/ai/chat';
      let payload: any = {
        message: query,
        context: { city: selectedCity },
        history: messages.map(m => ({ role: m.sender, text: m.text }))
      };

      if (useMapsGrounding && (query.toLowerCase().includes('supplier') || query.toLowerCase().includes('vendor') || query.toLowerCase().includes('store') || query.toLowerCase().includes('near me') || query.toLowerCase().includes('price') || query.toLowerCase().includes('location'))) {
        endpoint = '/api/ai/maps-search';
        payload = { query, city: selectedCity };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'Apologies, I encountered an error processing your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.groundingChunks ? data.groundingChunks.map((c: any) => c.web?.title || 'Google Maps Grounding') : ['IS 456 Code', 'CPWD DSR']
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Copilot error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between fade-in">
      
      {/* Drawer Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
            <Bot className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm leading-tight">2click AI Intelligence Studio</h3>
              <span className="text-[9px] bg-white/20 border border-white/30 px-1.5 py-0.5 rounded font-mono font-bold text-white/90">
                Gemini 3.6
              </span>
            </div>
            <p className="text-[10px] text-violet-200 font-medium">Maps Grounding · Voice Transcription · 3D Renders</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-white cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode('chat')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'chat' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
          <button
            onClick={() => setMode('image')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'image' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            3D Render Generator
          </button>
        </div>

        <button
          onClick={() => setUseMapsGrounding(!useMapsGrounding)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition ${
            useMapsGrounding ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-500 border-slate-300'
          }`}
          title="Toggle Google Maps & Web Grounding"
        >
          <MapPin className="w-3 h-3" />
          Maps Grounding {useMapsGrounding ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Image Mode Options Controls */}
      {mode === 'image' && (
        <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-200 dark:border-violet-800/50 space-y-2 text-xs">
          <div className="flex items-center justify-between text-violet-900 dark:text-violet-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Render Settings
            </span>
            <span className="text-[10px] bg-violet-200 dark:bg-violet-800 px-1.5 py-0.5 rounded font-mono">
              gemini-3.1-flash-image
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Story / Mobile)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="3:4">3:4 (Portrait)</option>
                <option value="21:9">21:9 (Cinematic Ultra-Wide)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">Resolution Size</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
              >
                <option value="1K">1K (Standard HD)</option>
                <option value="2K">2K (High Resolution)</option>
                <option value="4K">4K (Ultra HD Studio)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Messages / Gallery List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mode === 'image' && generatedImages.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated 3D Visuals</h4>
            <div className="grid grid-cols-1 gap-3">
              {generatedImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 space-y-2">
                  <img src={img.url} alt={img.prompt} className="w-full rounded-lg object-cover max-h-60" />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                    <span className="line-clamp-1 italic">"{img.prompt}"</span>
                    <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded font-mono">
                      {img.size} • {img.ratio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/60 flex flex-wrap gap-1 text-[9px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Sources:</span>
                  {m.sources.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>{mode === 'image' ? `Generating ${imageSize} 3D Render (${aspectRatio})...` : 'Consulting Gemini AI & Local Grounding...'}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Chips (Dynamically adapt to activeTab) */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          <span>Quick Actions</span>
          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-mono text-[9px]">
            Context: {contextLabel}
          </span>
        </div>
        <div className="flex gap-1.5 whitespace-nowrap overflow-x-auto pb-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(qp)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0 shadow-2xs hover:border-teal-500/50"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box with Microphone Voice Transcription */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={isRecording ? stopAudioRecording : startAudioRecording}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-bounce'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title={isRecording ? 'Stop Recording Voice' : 'Record Audio with Microphone'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'image' ? "Describe 3D elevation or interior render..." : "Ask AI Copilot or speak into mic..."}
            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

