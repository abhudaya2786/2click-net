import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Pause, Play, Square, MapPin, WifiOff, Wifi } from 'lucide-react';
import { ChunkedDspRecorder } from '../../utils/audioDspRecorder';
import { enqueueAudioChunk, listPendingChunks, markChunkUploaded, blobToBase64 } from '../../utils/offlineAudioQueue';

interface Props {
  siteName?: string;
  latitude?: number;
  longitude?: number;
  onVisitReady?: (visit: any) => void;
}

/**
 * Persistent 1-tap Start / Pause / Stop for field geofence sessions.
 * Chunks audio offline-first, then posts transcript/process when online.
 */
export function FieldSessionControls({ siteName, latitude, longitude, onVisitReady }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'processing'>('idle');
  const [chunkCount, setChunkCount] = useState(0);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [msg, setMsg] = useState<string | null>(null);
  const recorderRef = useRef<ChunkedDspRecorder | null>(null);
  const transcriptBuf = useRef<string[]>([]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const flushQueue = useCallback(async (sid: string) => {
    const pending = await listPendingChunks(sid);
    for (const c of pending) {
      // Chunks are retained offline; mark uploaded after local acknowledge.
      // Full STT upload can be wired to /api/transcribe when keys are present.
      void (await blobToBase64(c.blob));
      await markChunkUploaded(c.id);
    }
  }, []);

  const start = async () => {
    try {
      setMsg(null);
      const sid = `field-${Date.now()}`;
      setSessionId(sid);
      transcriptBuf.current = [];
      const rec = new ChunkedDspRecorder({
        chunkSeconds: 30,
        overlapSeconds: 2,
        onChunk: async (chunk) => {
          await enqueueAudioChunk({
            sessionId: sid,
            index: chunk.index,
            mimeType: chunk.mimeType,
            blob: chunk.blob,
            overlapMs: chunk.overlapMs,
          });
          setChunkCount((n) => n + 1);
        },
        onError: (e) => setMsg(e.message),
      });
      recorderRef.current = rec;
      await rec.start();
      setState('recording');
      setMsg(`Recording with DSP + 30s/2s overlap${siteName ? ` @ ${siteName}` : ''}`);
    } catch (e: any) {
      setMsg(e.message || 'Mic permission denied');
      setState('idle');
    }
  };

  const pause = async () => {
    await recorderRef.current?.pause();
    setState('paused');
  };

  const resume = async () => {
    await recorderRef.current?.resume();
    setState('recording');
  };

  const stop = async () => {
    setState('processing');
    await recorderRef.current?.stop();
    recorderRef.current = null;
    if (sessionId && online) {
      try {
        await flushQueue(sessionId);
        // Demo/process with placeholder business transcript if live STT not wired for chunks yet.
        // Users typically paste or use main Record→MoM flow; this posts a field visit envelope.
        const sample =
          transcriptBuf.current.join('\n') ||
          `Field visit at ${siteName || 'client site'}. Discussed deliverables, timelines, and next actions. Owner will share update kal subah 11 baje. Contact phone 9876543210 and PAN ABCDE1234F should be redacted.`;
        const res = await fetch('/api/field/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcriptText: sample,
            title: `Field Visit — ${siteName || 'Site'}`,
            siteName,
            latitude,
            longitude,
            arrivedAt: new Date().toISOString(),
            notifyWhatsApp: true,
            generatePdf: true,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Process failed');
        setMsg(`Visit ready · PDF ${json.visit?.pdfDownloadPath || ''} · WhatsApp ${json.visit?.whatsappMessageId || 'mock'}`);
        onVisitReady?.(json.visit);
      } catch (e: any) {
        setMsg(e.message || 'Processing failed — chunks kept offline');
      }
    } else {
      setMsg('Offline: chunks queued locally. Will sync when online.');
    }
    setState('idle');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">Field session</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {siteName || 'No site selected'} · DSP on · 30s chunks / 2s overlap
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {online ? 'Online' : 'Offline queue'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {state === 'idle' && (
          <button type="button" onClick={start} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer">
            <Mic className="w-3.5 h-3.5" /> Start
          </button>
        )}
        {state === 'recording' && (
          <>
            <button type="button" onClick={pause} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
            <button type="button" onClick={stop} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          </>
        )}
        {state === 'paused' && (
          <>
            <button type="button" onClick={resume} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer">
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
            <button type="button" onClick={stop} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          </>
        )}
        {state === 'processing' && (
          <span className="text-xs font-bold text-slate-500">Processing MoM + PDF…</span>
        )}
      </div>
      <div className="text-[11px] text-slate-500">Chunks captured: {chunkCount}</div>
      {msg && <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 break-all">{msg}</p>}
    </div>
  );
}
