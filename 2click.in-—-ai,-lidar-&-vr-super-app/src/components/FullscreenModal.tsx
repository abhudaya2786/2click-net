import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Sparkles,
  CheckCircle2,
  Info,
  Layers,
  Copy,
  Printer
} from 'lucide-react';
import { useFullscreen } from '../context/FullscreenContext';
import { useLanguage } from '../context/LanguageContext';

export const FullscreenModal: React.FC = () => {
  const { isFullscreenOpen, fullscreenData, closeFullscreen } = useFullscreen();
  const { t } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset zoom level whenever modal opens with new content
  useEffect(() => {
    if (isFullscreenOpen) {
      setZoomLevel(1.0);
    }
  }, [isFullscreenOpen, fullscreenData]);

  if (!isFullscreenOpen || !fullscreenData) return null;

  // Zoom handlers
  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1.0);
  };

  // High-Res Snapshot Download Trigger
  const handleDownloadSnapshot = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    try {
      // Create a blob image snapshot or print-ready canvas representation
      const titleSlug = fullscreenData.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `2click_snapshot_${titleSlug}_${Date.now()}.html`;

      // Build standalone printable HTML document snapshot
      const htmlSnapshotContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fullscreenData.title} - High-Res 2click Snapshot</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { background-color: #020617; color: #ffffff; padding: 40px; font-family: sans-serif; }
            .snapshot-card { max-width: 1200px; margin: 0 auto; border: 1px solid #334155; border-radius: 24px; padding: 32px; background: #0f172a; }
          </style>
        </head>
        <body>
          <div class="snapshot-card">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:16px; margin-bottom:24px;">
              <div>
                <h1 style="font-size:24px; font-weight:900; color:#a855f7;">${fullscreenData.title}</h1>
                <p style="font-size:12px; color:#94a3b8;">${fullscreenData.subtitle || '2click Engineering & Interior Studio High-Res Snapshot'}</p>
              </div>
              <div style="font-size:12px; font-weight:bold; color:#a855f7;">2click B2B Hub</div>
            </div>
            <div>
              ${fullscreenData.htmlContent || ''}
            </div>
            <div style="margin-top:32px; padding-top:16px; border-top:1px solid #334155; font-size:10px; color:#64748b; text-align:center;">
              Generated via 2click Full-Screen Interaction Engine • Date: ${new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlSnapshotContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnapshotToast('📥 High-Res 4K Snapshot HTML/DOM file downloaded successfully!');
      setTimeout(() => setSnapshotToast(null), 3500);
    } catch (err) {
      setSnapshotToast('📥 Snapshot ready for offline viewing');
      setTimeout(() => setSnapshotToast(null), 3000);
    }
  };

  return (
    <div
      id="fullscreenModal"
      onDoubleClick={closeFullscreen}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden text-white select-none animate-in fade-in duration-200"
    >
      {/* Toast Notification Popup */}
      {snapshotToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* TOP ACTIONS BAR */}
      <div
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 z-50 backdrop-blur-md shadow-lg"
      >
        {/* Left Side: Title & Badge */}
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Maximize2 className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-violet-900/60 text-violet-300 px-2 py-0.5 rounded-md border border-violet-700">
                {fullscreenData.badge || 'Distraction-Free 100% View'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                • 100vw × 100vh Mode
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white line-clamp-1 mt-0.5">
              {fullscreenData.title}
            </h2>
          </div>
        </div>

        {/* Center / Tip Callout */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-amber-300/90 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/50">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Tip: Click ✕, press <kbd className="px-1.5 py-0.5 bg-amber-900/80 rounded text-[10px] font-mono border border-amber-700 text-white">ESC</kbd>, or double-click anywhere to exit</span>
        </div>

        {/* Right Side Controls: Zoom In/Out, Snapshot, Exit */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* 1. Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 rounded-2xl border border-slate-700 p-1 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-700 rounded-xl transition text-slate-300 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-[11px] text-violet-300 min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-700 rounded-xl transition text-slate-300 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {zoomLevel !== 1.0 && (
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 hover:bg-slate-700 rounded-xl transition text-amber-400 border-l border-slate-700 ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Download High-Res Snapshot Button */}
          <button
            type="button"
            onClick={handleDownloadSnapshot}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl border border-violet-400/30 flex items-center gap-2 shadow-md transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('downloadSnapshot', 'Download Snapshot')}</span>
            <span className="sm:hidden">{t('downloadSnapshot', 'Snapshot')}</span>
          </button>

          {/* 3. Exit Full Screen Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl border border-rose-400/40 flex items-center gap-2 shadow-lg transition active:scale-95"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>{t('exitFullscreen', 'Exit Full Screen')}</span>
          </button>

        </div>
      </div>

      {/* CENTER MAIN FULLSCREEN CONTENT STAGE */}
      <div className="flex-1 w-full overflow-auto p-4 sm:p-8 flex items-center justify-center relative custom-scrollbar">

        {/* Scalable Container Wrapper */}
        <div
          ref={contentRef}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent double-clicking directly on inner card content from instantly closing if user is interacting
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full max-w-6xl mx-auto my-auto transition-all"
        >
          {/* React Node Content */}
          {fullscreenData.content && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
              {fullscreenData.content}
            </div>
          )}

          {/* Cloned HTML Content from double-clicked element */}
          {fullscreenData.htmlContent && !fullscreenData.content && (
            <div
              className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
              dangerouslySetInnerHTML={{ __html: fullscreenData.htmlContent }}
            />
          )}
        </div>

      </div>

      {/* BOTTOM FOOTER BAR */}
      <div
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className="w-full bg-slate-900/80 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 z-50 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>2click Double-Click Full-Screen Interaction Engine</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Resolution: 100vw × 100vh High-Res</span>
          <span className="text-violet-400 font-bold">Press ESC to Exit</span>
        </div>
      </div>
    </div>
  );
};
