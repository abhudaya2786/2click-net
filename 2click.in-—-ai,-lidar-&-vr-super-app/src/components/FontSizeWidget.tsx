import React from 'react';
import { useFontSize } from '../context/FontSizeContext';
import { ZoomIn, ZoomOut, Type, RotateCcw } from 'lucide-react';

interface FontSizeWidgetProps {
  className?: string;
  showLabel?: boolean;
}

export const FontSizeWidget: React.FC<FontSizeWidgetProps> = ({
  className = '',
  showLabel = true
}) => {
  const { fontSizePercent, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  return (
    <div className={`flex items-center gap-1 bg-slate-900/90 dark:bg-slate-900 border border-slate-700/80 p-1 rounded-xl text-slate-300 text-xs shadow-xs ${className}`}>
      {showLabel && (
        <div className="hidden xl:flex items-center gap-1 px-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <Type size={12} className="text-orange-400 shrink-0" />
          <span>फ़ॉन्ट:</span>
        </div>
      )}

      {/* 1. Decrease Font Size (A-) */}
      <button
        type="button"
        onClick={decreaseFontSize}
        disabled={fontSizePercent <= 85}
        className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 disabled:opacity-30 transition font-black flex items-center gap-0.5 cursor-pointer hover:text-white"
        title="फ़ॉन्ट छोटा करें (A-) / Decrease Font Size"
      >
        <ZoomOut size={13} />
        <span className="font-mono text-xs">A-</span>
      </button>

      {/* 2. Reset / Percent Indicator (A 100%) */}
      <button
        type="button"
        onClick={resetFontSize}
        className={`px-2 py-1 rounded-lg font-black transition text-[11px] cursor-pointer flex items-center gap-1 ${
          fontSizePercent === 100 
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono' 
            : 'bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-mono'
        }`}
        title="सामान्य फ़ॉन्ट आकार 100% पर लाएं / Reset Font Size"
      >
        <span>A</span>
        <span className="text-[10px]">({fontSizePercent}%)</span>
        {fontSizePercent !== 100 && <RotateCcw size={10} className="text-slate-400" />}
      </button>

      {/* 3. Increase Font Size (A+) */}
      <button
        type="button"
        onClick={increaseFontSize}
        disabled={fontSizePercent >= 125}
        className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 disabled:opacity-30 transition font-black flex items-center gap-0.5 cursor-pointer hover:text-white"
        title="फ़ॉन्ट बड़ा करें (A+) / Increase Font Size"
      >
        <span className="font-mono text-xs">A+</span>
        <ZoomIn size={13} />
      </button>
    </div>
  );
};

