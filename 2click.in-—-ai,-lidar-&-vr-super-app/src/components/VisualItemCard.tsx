import React from 'react';
import { Trash2, CheckCircle2, IndianRupee, Maximize2, Sparkles, Tag, ShieldCheck, QrCode } from 'lucide-react';
import { useFullscreen } from '../context/FullscreenContext';

export interface VisualItemCardProps {
  id: string;
  title: string;
  category?: string;
  priceINR: number;
  unit?: string;
  quantity?: number;
  brandName?: string;
  imageUrl?: string;
  isActive?: boolean;
  isCustomItem?: boolean;
  onToggleActive?: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onOpenQrTag?: (id: string) => void;
}

export const VisualItemCard: React.FC<VisualItemCardProps> = ({
  id,
  title,
  category,
  priceINR,
  unit = 'Nos',
  quantity = 1,
  brandName,
  imageUrl,
  isActive = true,
  isCustomItem = true,
  onToggleActive,
  onRemoveItem,
  onOpenQrTag
}) => {
  const { openFullscreen } = useFullscreen();

  const fallbackImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';
  const displayImage = imageUrl || fallbackImage;

  const totalItemCost = priceINR * quantity;

  const handleImageDblClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFullscreen({
      title: title,
      subtitle: `${category ? category + ' • ' : ''}3D/HD Visual Preview • Price: ₹${totalItemCost.toLocaleString('en-IN')}`,
      badge: '3D/HD Fullscreen',
      content: (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative group max-w-4xl max-h-[70vh] rounded-3xl overflow-hidden border-2 border-teal-500/50 shadow-2xl bg-slate-900">
            <img
              src={displayImage}
              alt={title}
              className="w-full h-full object-contain max-h-[65vh] transition duration-300"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-teal-500 text-slate-950 font-black text-xs rounded-full">
                  {brandName || 'Custom Line Item'}
                </span>
                <span className="text-xl font-mono font-black text-teal-400">
                  ₹{totalItemCost.toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="text-xs text-slate-300">
                Double-clicked 3D High-Resolution inspection mode. Scroll or use controls to zoom into details.
              </p>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div
      data-fullscreen-title={title}
      data-fullscreen-subtitle={`Custom Line Item • ₹${totalItemCost.toLocaleString('en-IN')}`}
      className={`group relative bg-white dark:bg-slate-800/90 rounded-2xl border transition duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col sm:flex-row ${
        isActive
          ? 'border-slate-200 dark:border-slate-700 hover:border-teal-500/50'
          : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900'
      }`}
    >
      {/* Item Image Thumbnail Section */}
      <div
        onDoubleClick={handleImageDblClick}
        title="Double-click to expand photo in 3D/HD Fullscreen View"
        className="relative sm:w-36 h-36 sm:h-auto bg-slate-900 overflow-hidden shrink-0 cursor-pointer group/img"
      >
        <img
          src={displayImage}
          alt={title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
        />
        
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition flex flex-col items-center justify-center text-white p-2 text-center">
          <Maximize2 className="w-5 h-5 text-teal-300 mb-1" />
          <span className="text-[10px] font-bold leading-tight">
            Double-Click for 3D/HD View
          </span>
        </div>

        {/* Badge */}
        {isCustomItem && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-extrabold text-[9px] rounded-full shadow-md">
            CUSTOM
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-md">
                  {category}
                </span>
              )}
              {brandName && (
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                  {brandName}
                </span>
              )}
            </div>
            
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              {title}
            </h4>
          </div>

          {/* Active Checkbox or Toggle */}
          {onToggleActive && (
            <button
              type="button"
              onClick={() => onToggleActive(id)}
              className={`p-1.5 rounded-lg border transition ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400'
              }`}
              title={isActive ? 'Deactivate item' : 'Activate item'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pricing Specs & Remove Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
          
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xs text-slate-400 font-sans">Total:</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{totalItemCost.toLocaleString('en-IN')}
            </span>
            {quantity > 1 && (
              <span className="text-[10px] text-slate-400 font-sans">
                ({quantity} × ₹{priceINR.toLocaleString('en-IN')}/{unit})
              </span>
            )}
          </div>

          {/* Actions: QR Tag & Delete */}
          <div className="flex items-center gap-1.5">
            {onOpenQrTag && (
              <button
                type="button"
                onClick={() => onOpenQrTag(id)}
                className="p-2 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800/60 rounded-xl transition flex items-center gap-1 text-xs font-bold active:scale-95 cursor-pointer"
                title="Generate physical QR batch tag for site inventory tracking"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Tag</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemoveItem(id)}
              className="p-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-800/60 rounded-xl transition flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer"
              title="Remove item & auto-recalculate total"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
