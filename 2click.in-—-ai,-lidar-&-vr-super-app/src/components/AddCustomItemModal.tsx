import React, { useState, useRef } from 'react';
import { 
  Plus, 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Check, 
  IndianRupee, 
  Sparkles, 
  Package, 
  Layers,
  FolderOpen,
  Eye,
  Camera
} from 'lucide-react';

export interface CustomItemPayload {
  id: string;
  title: string;
  category: string;
  priceINR: number;
  unit: string;
  quantity: number;
  brandName: string;
  imageUrl: string;
}

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: CustomItemPayload) => void;
  defaultCategory?: string;
  presetCategories?: string[];
  moduleName?: string;
}

// Preset Library Images grouped by domain
const PRESET_ASSETS = [
  {
    name: 'SS-304 High-Pressure Pump',
    category: 'Water & ETP/STP',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'MBR Membrane Cassette',
    category: 'Water & ETP/STP',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'CPVC Booster Pump System',
    category: 'Water & ETP/STP',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Modular Acrylic Shutter',
    category: 'Interior Design',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Quartz Stone Countertop Slab',
    category: 'Interior Design',
    url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Hettich Soft-Close Drawer Unit',
    category: 'Interior Design',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'UltraTech OPC 53 Cement Bags',
    category: 'Civil BOQ',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Tata Tiscon Fe550D TMT Steel',
    category: 'Civil BOQ',
    url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: '6-inch AAC Masonry Blocks',
    category: 'Civil BOQ',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: '800x800mm Vitrified Tiles',
    category: 'Flooring',
    url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Distribution Transformer 250KVA',
    category: 'Electrical',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Solar Mono PERC PV Panels',
    category: 'Solar',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80'
  }
];

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  defaultCategory = 'Structure & RCC',
  presetCategories = [
    'Structure & RCC',
    'Interior & Kitchen',
    'Water & ETP/STP',
    'Electrical & MEP',
    'Flooring & Tiles',
    'Sanitary & Plumbing'
  ],
  moduleName = 'Custom BOQ'
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [priceINR, setPriceINR] = useState<number | ''>(5000);
  const [unit, setUnit] = useState('Nos / Units');
  const [quantity, setQuantity] = useState<number>(1);
  const [brandName, setBrandName] = useState('Custom Brand / Grade-A');

  // Image Selection Mode: 'upload' | 'url' | 'preset'
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'preset'>('preset');
  const [selectedImageUrl, setSelectedImageUrl] = useState(PRESET_ASSETS[0].url);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedBase64(reader.result);
          setSelectedImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getEffectiveImageUrl = (): string => {
    if (imageMode === 'upload' && uploadedBase64) {
      return uploadedBase64;
    }
    if (imageMode === 'url' && customUrlInput.trim()) {
      return customUrlInput.trim();
    }
    return selectedImageUrl || PRESET_ASSETS[0].url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalPrice = typeof priceINR === 'number' ? Math.max(priceINR, 0) : 0;
    const finalQty = Math.max(quantity, 1);
    const finalImage = getEffectiveImageUrl();

    onAddItem({
      id: `CUSTOM-${Date.now()}`,
      title: title.trim(),
      category,
      priceINR: finalPrice,
      unit,
      quantity: finalQty,
      brandName: brandName.trim() || 'Custom Equipment',
      imageUrl: finalImage
    });

    // Reset Form
    setTitle('');
    setPriceINR(5000);
    setQuantity(1);
    setUploadedBase64(null);
    setCustomUrlInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex justify-between items-center border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 border border-teal-400/30 rounded-2xl">
              <Plus className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                ➕ Add Custom Line Item
                <span className="px-2 py-0.5 bg-teal-500/30 text-teal-200 text-[10px] rounded-full font-bold uppercase">
                  {moduleName}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Attach custom equipment, fixtures or materials with visual preview photo &amp; custom pricing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item Title (सामग्री / उपकरण का नाम) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SS-304 High-Pressure Pump or Modular Acrylic Shutter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category (श्रेणी)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none"
              >
                {presetCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price, Unit & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Price (दर ₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 18500"
                  value={priceINR}
                  onChange={(e) => setPriceINR(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-teal-600 dark:text-teal-400 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit (इकाई)
              </label>
              <input
                type="text"
                placeholder="e.g. Nos, Sq.Ft, Set, Meter"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity (मात्रा)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Row 3: Brand Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Brand / Manufacturer (ब्रांड या निर्माता)
            </label>
            <input
              type="text"
              placeholder="e.g. Grundfos, Hettich, UltraTech, Custom Specified"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* SECTION: IMAGE ATTACHMENT SELECTOR (फोटो जोड़ने का विकल्प) */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Image Attachment Selector (फोटो जोड़ने का विकल्प)</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800">
                Visual Card &amp; 3D Fullscreen Ready
              </span>
            </div>

            {/* Option Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setImageMode('preset')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  imageMode === 'preset'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="truncate">🖼️ Preset Library</span>
              </button>

              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  imageMode === 'upload'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="truncate">📁 Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  imageMode === 'url'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="truncate">🔗 Image URL</span>
              </button>
            </div>

            {/* Tab 1: Preset Asset Library */}
            {imageMode === 'preset' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500">
                  Select a high-resolution material / equipment thumbnail from built-in library:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {PRESET_ASSETS.map((asset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageUrl(asset.url)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition group ${
                        selectedImageUrl === asset.url
                          ? 'border-teal-500 ring-2 ring-teal-500/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-16 object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-1 text-[9px] text-white font-medium truncate text-center">
                        {asset.name}
                      </div>
                      {selectedImageUrl === asset.url && (
                        <div className="absolute top-1 right-1 bg-teal-500 text-white rounded-full p-0.5 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Upload Photo */}
            {imageMode === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-500 rounded-2xl p-4 text-center cursor-pointer transition bg-white dark:bg-slate-900 space-y-2"
                >
                  <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto" />
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Click to select image file from computer or phone
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Supports JPG, PNG, WEBP files up to 10MB
                  </p>
                </div>

                {uploadedBase64 && (
                  <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <img
                      src={uploadedBase64}
                      alt="Uploaded preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-400"
                    />
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      <div className="font-bold">Photo Attached Successfully!</div>
                      <p className="text-[10px] text-slate-500">Base64 file converted and ready for visual card</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Image URL */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Paste direct image link (e.g. https://images.unsplash.com/...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] outline-none"
                />
                {customUrlInput.trim() && (
                  <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={customUrlInput.trim()}
                      alt="URL Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_ASSETS[0].url;
                      }}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                    />
                    <div className="text-[10px] text-slate-500">
                      Live URL image preview loaded.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active Selected Preview Badge */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold">Active Selected Photo Preview:</span>
              <div className="flex items-center gap-2">
                <img
                  src={getEffectiveImageUrl()}
                  alt="Active preview"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-cover rounded-md border border-teal-500 shadow-xs"
                />
                <span className="font-bold text-teal-600 dark:text-teal-400 text-[10px]">Ready</span>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Custom Line Item to BOQ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
