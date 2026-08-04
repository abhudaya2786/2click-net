import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  Sun, 
  Hammer, 
  Landmark, 
  ShieldCheck, 
  Sliders, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Palette, 
  Phone, 
  Mail, 
  Sparkles, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Layers, 
  Settings, 
  Cpu, 
  Download, 
  Users, 
  MessageSquare, 
  Check, 
  Share2, 
  ShieldAlert, 
  Zap, 
  Box, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { CategoryWhiteLabelConfig, WhiteLabelFunctionLimits, SystemSettings } from '../types';
import { VendorShareLinkCard } from './VendorShareLinkCard';

interface WhiteLabelAndLimitsControlProps {
  systemSettings?: SystemSettings;
  whiteLabels: CategoryWhiteLabelConfig[];
  onSaveWhiteLabels: (updatedWhiteLabels: CategoryWhiteLabelConfig[]) => void;
  onSelectActiveGlobalWhiteLabel?: (id: string | null) => void;
  activeGlobalWhiteLabelId?: string | null;
}

const CATEGORY_OPTIONS = [
  { key: 'solar', label: 'सोलर व रिन्यूएबल (Solar Rooftop)', icon: Sun, defaultTheme: 'emerald' },
  { key: 'construction', label: 'सिविल व मकान निर्माण (Civil BOQ)', icon: Hammer, defaultTheme: 'indigo' },
  { key: 'tiles_hardware', label: 'टाइल्स, मार्बल व हार्डवेयर (Tiles & Hardware)', icon: Store, defaultTheme: 'amber' },
  { key: 'bank_loans', label: 'बैंक लोन व क्रेडिट हब (Bank Loans)', icon: Landmark, defaultTheme: 'cyan' },
  { key: 'dukandar_market', label: 'दुकानदार B2B मार्केटप्लेस (Dukandar)', icon: Building2, defaultTheme: 'rose' },
  { key: 'electrical_elv', label: 'इलेक्ट्रिकल व MEP स्टूडियो (Electrical)', icon: Zap, defaultTheme: 'indigo' },
  { key: 'water_etp_stp', label: 'वॉटर व ETP/STP प्लांट (Water ETP)', icon: Box, defaultTheme: 'emerald' },
  { key: 'global_partner', label: 'ऑल-इन-वन ग्लोबल फ्रेंचाइजी (Global Partner)', icon: Globe, defaultTheme: 'slate' },
];

export const WhiteLabelAndLimitsControl: React.FC<WhiteLabelAndLimitsControlProps> = ({
  systemSettings,
  whiteLabels,
  onSaveWhiteLabels,
  onSelectActiveGlobalWhiteLabel,
  activeGlobalWhiteLabelId
}) => {
  const [configs, setConfigs] = useState<CategoryWhiteLabelConfig[]>(whiteLabels);
  const [selectedConfigId, setSelectedConfigId] = useState<string>(whiteLabels[0]?.id || '');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [previewModalConfig, setPreviewModalConfig] = useState<CategoryWhiteLabelConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Editing/Creating Category White Label
  const [editingConfig, setEditingConfig] = useState<Partial<CategoryWhiteLabelConfig>>({});

  const activeConfig = configs.find(c => c.id === selectedConfigId) || configs[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleActive = (id: string) => {
    const updated = configs.map(c => {
      if (c.id === id) {
        return { ...c, isWhiteLabelActive: !c.isWhiteLabelActive, lastUpdatedDate: new Date().toISOString().split('T')[0] };
      }
      return c;
    });
    setConfigs(updated);
    onSaveWhiteLabels(updated);
    showToast('व्हाइट लेबल स्थिति अपडेट कर दी गई है!');
  };

  const handleOpenEditModal = (configToEdit?: CategoryWhiteLabelConfig) => {
    if (configToEdit) {
      setEditingConfig(JSON.parse(JSON.stringify(configToEdit)));
    } else {
      // Create New
      const newId = `WL-CAT-${Date.now().toString().slice(-4)}`;
      const defaultCat = CATEGORY_OPTIONS[0];
      setEditingConfig({
        id: newId,
        categoryKey: defaultCat.key,
        categoryDisplayName: defaultCat.label,
        partnerBrandName: 'New Partner Franchise Brand',
        partnerLogoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=200&q=80',
        customDomainOrSlug: `franchise-${Date.now().toString().slice(-4)}`,
        primaryColorTheme: 'emerald',
        supportPhoneWhatsapp: '+91 98765 43210',
        supportEmail: 'partner@domain.com',
        customHeaderTitle: 'ऑथोराइज्ड पार्टनर डिजिटल पोर्टल',
        customBannerTagline: 'Verified Building Materials & Services Network',
        copyrightFooterText: '© 2026 Partner Enterprise. Powered by InfraTech WhiteLabel System.',
        isWhiteLabelActive: true,
        functionLimits: {
          allowAiGenerations: true,
          allowDirectPdfExport: true,
          allowPriceEditing: true,
          allowVendorBidding: true,
          allowBankLoanApply: true,
          allowDirectWhatsappLeads: true,
          allowCustomProductListing: true,
          allow3dLidarVrTour: true,
          allowExportExcelCsv: true,
          maxAiPromptsPerDay: 50,
          maxPdfDownloadsPerMonth: 100,
          maxProductListingsLimit: 200,
          maxDailyLeadsQuota: 50,
          maxVendorBidsQuota: 25,
          maxTeamUsersCount: 10
        }
      });
    }
    setIsEditingModalOpen(true);
  };

  const handleSaveModalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig.partnerBrandName || !editingConfig.categoryKey) {
      alert('कृपया पार्टनर ब्रांड नाम और कैटेगरी का चयन करें!');
      return;
    }

    const updatedConfigObj = {
      ...editingConfig,
      lastUpdatedDate: new Date().toISOString().split('T')[0]
    } as CategoryWhiteLabelConfig;

    let updatedList: CategoryWhiteLabelConfig[];
    const exists = configs.some(c => c.id === updatedConfigObj.id);

    if (exists) {
      updatedList = configs.map(c => c.id === updatedConfigObj.id ? updatedConfigObj : c);
    } else {
      updatedList = [...configs, updatedConfigObj];
    }

    setConfigs(updatedList);
    onSaveWhiteLabels(updatedList);
    setSelectedConfigId(updatedConfigObj.id);
    setIsEditingModalOpen(false);
    showToast(`व्हाइट लेबल ${updatedConfigObj.partnerBrandName} सफलतापूर्वक सहेज लिया गया!`);
  };

  const handleDeleteConfig = (id: string, name: string) => {
    if (configs.length <= 1) {
      alert('कम से कम एक व्हाइट लेबल कॉन्फ़िगरेशन मौजूद होना अनिवार्य है!');
      return;
    }
    if (window.confirm(`क्या आप वाकई "${name}" व्हाइट लेबल को हटाना चाहते हैं?`)) {
      const updated = configs.filter(c => c.id !== id);
      setConfigs(updated);
      onSaveWhiteLabels(updated);
      setSelectedConfigId(updated[0]?.id || '');
      showToast('व्हाइट लेबल हटा दिया गया है!');
    }
  };

  const handleLimitChange = (key: keyof WhiteLabelFunctionLimits, value: any) => {
    if (!activeConfig) return;
    const updatedLimits = { ...activeConfig.functionLimits, [key]: value };
    const updatedConfig = { ...activeConfig, functionLimits: updatedLimits, lastUpdatedDate: new Date().toISOString().split('T')[0] };
    const updatedList = configs.map(c => c.id === activeConfig.id ? updatedConfig : c);
    setConfigs(updatedList);
    onSaveWhiteLabels(updatedList);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Heading */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Super Admin Governance • WhiteLabel & Function Limits Engine</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>कैटेगरी अनुसार व्हाइट-लेबल व फंक्शन लिमिट कंट्रोल</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">Active Engine</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            प्रत्येक सामग्री/सर्विस कैटेगरी (सोलर, सिविल BOQ, टाइल्स व हार्डवेयर, बैंक लोन) हेतु कस्टमाइज़्ड व्हाइट-लेबल ब्रांडिंग, लोगो, कस्टम स्लग तथा सुपर एडमिन द्वारा फंक्शनल सीमाओं (AI Limit, PDF Limit, Rate Limits) का पूर्ण प्रबंधन।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenEditModal()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नया कैटेगरी व्हाइट लेबल जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Category White Label Selector Horizontal Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>कॉन्फ़िगर किए गए कैटेगरी व्हाइट-लेबल (Select White-Label Config):</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">कुल {configs.length} सक्रिय/अक्रिय कॉन्फ़िगरेशन</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {configs.map((c) => {
            const catOpt = CATEGORY_OPTIONS.find(o => o.key === c.categoryKey);
            const IconComp = catOpt?.icon || Globe;
            const isSelected = c.id === selectedConfigId;
            const isGlobalActive = activeGlobalWhiteLabelId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedConfigId(c.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 shadow-md scale-[1.01]' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {/* Active Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                    c.isWhiteLabelActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}>
                    {c.isWhiteLabelActive ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                    <span>{c.isWhiteLabelActive ? 'सक्रिय (Active)' : 'अक्रिय (Inactive)'}</span>
                  </span>

                  {isGlobalActive && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black border border-purple-300 dark:border-purple-800">
                      ★ Global Primary
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={c.partnerLogoUrl}
                    alt={c.partnerBrandName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{c.partnerBrandName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{c.categoryDisplayName}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] truncate">{c.customDomainOrSlug}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewModalConfig(c); }}
                      title="Preview White Label"
                      className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(c); }}
                      title="Edit Branding"
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Config Detailed Dashboard */}
      {activeConfig && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* Header Action Bar for Selected Item */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={activeConfig.partnerLogoUrl}
                alt={activeConfig.partnerBrandName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30 p-0.5 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeConfig.partnerBrandName}</h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                    ID: {activeConfig.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Category: <strong>{activeConfig.categoryDisplayName}</strong> • Domain/Slug: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{activeConfig.customDomainOrSlug}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleToggleActive(activeConfig.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeConfig.isWhiteLabelActive
                    ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 hover:bg-rose-100'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {activeConfig.isWhiteLabelActive ? <XCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <span>{activeConfig.isWhiteLabelActive ? 'व्हाइट लेबल बंद करें (Disable)' : 'व्हाइट लेबल चालू करें (Enable)'}</span>
              </button>

              <button
                onClick={() => setPreviewModalConfig(activeConfig)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>लाइव प्रीव्यू देखें (Live Preview)</span>
              </button>

              <button
                onClick={() => handleOpenEditModal(activeConfig)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>ब्रांड कस्टमाइज़ करें</span>
              </button>

              {onSelectActiveGlobalWhiteLabel && (
                <button
                  onClick={() => {
                    const newGlobalId = activeGlobalWhiteLabelId === activeConfig.id ? null : activeConfig.id;
                    onSelectActiveGlobalWhiteLabel(newGlobalId);
                    showToast(newGlobalId ? `ग्लोबल व्हाइट लेबल "${activeConfig.partnerBrandName}" सेट किया गया` : 'ग्लोबल व्हाइट लेबल रीसेट किया गया');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeGlobalWhiteLabelId === activeConfig.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{activeGlobalWhiteLabelId === activeConfig.id ? '★ Primary Global Active' : 'Set as Global App WhiteLabel'}</span>
                </button>
              )}

              <button
                onClick={() => handleDeleteConfig(activeConfig.id, activeConfig.partnerBrandName)}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                title="Delete White Label"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 1: Branding Summary & Theme Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Theme & Color Profile</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${
                  activeConfig.primaryColorTheme === 'emerald' ? 'bg-emerald-500' :
                  activeConfig.primaryColorTheme === 'indigo' ? 'bg-indigo-500' :
                  activeConfig.primaryColorTheme === 'amber' ? 'bg-amber-500' :
                  activeConfig.primaryColorTheme === 'rose' ? 'bg-rose-500' :
                  activeConfig.primaryColorTheme === 'cyan' ? 'bg-cyan-500' : 'bg-slate-500'
                }`}></span>
                <span>{activeConfig.primaryColorTheme} Theme Accent</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeConfig.customHeaderTitle || 'Custom Header Title Not Set'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Support Contact & Helpdesk</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                <span>WhatsApp: {activeConfig.supportPhoneWhatsapp}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Email: {activeConfig.supportEmail || 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Custom Domain / Franchise URL</span>
              </div>
              <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-2">
                <span>{activeConfig.customDomainOrSlug}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {activeConfig.customBannerTagline}
              </p>
            </div>
          </div>

          {/* Vendor Shareable Link Card */}
          <div className="pt-2">
            <VendorShareLinkCard
              vendor={{
                id: activeConfig.id,
                businessName: activeConfig.partnerBrandName,
                whiteLabelSettings: {
                  brandTitle: activeConfig.partnerBrandName,
                  logoUrl: activeConfig.partnerLogoUrl,
                  supportPhone: activeConfig.supportPhoneWhatsapp
                }
              }}
            />
          </div>

          {/* Section 2: SUPER ADMIN FUNCTION LIMITATIONS & FEATURE TOGGLES */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>फंक्शन सीमाओं का प्रबंधन (Super Admin Function Limitations Matrix)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  इस व्हाइट लेबल पार्टनर के उपयोगकर्ताओं के लिए कार्यात्मक नियंत्रण एवं दैनिक/मासिक उपयोग सीमाएं (Quotas) यहाँ से निर्धारित करें:
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin Restricted Control</span>
              </span>
            </div>

            {/* Feature Access Toggles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Toggle 1: AI Generations */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowAiGenerations
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI Naksha & BOQ Copilot</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">AI नक़्शा जनरेटर व ऑटो BOQ</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowAiGenerations}
                  onChange={(e) => handleLimitChange('allowAiGenerations', e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 2: Direct PDF Export */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowDirectPdfExport
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>PDF रिपोर्ट डाउनलोड (PDF Download)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">एस्टीमेट व इनवॉइस PDF सेव</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowDirectPdfExport}
                  onChange={(e) => handleLimitChange('allowDirectPdfExport', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 3: Price Editing */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowPriceEditing
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <span>कस्टम रेट बदलाव (Rate Customization)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">सामग्री दरें बदलने की अनुमति</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowPriceEditing}
                  onChange={(e) => handleLimitChange('allowPriceEditing', e.target.checked)}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 4: Vendor Bidding */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowVendorBidding
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>टेंडर व वेंडर बिडिंग (Vendor Bidding)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">निविदाओं में भाग लेने की सुविधा</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowVendorBidding}
                  onChange={(e) => handleLimitChange('allowVendorBidding', e.target.checked)}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 5: Bank Loan Apply */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowBankLoanApply
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-cyan-600" />
                    <span>बैंक लोन आवेदन (Bank Loans Hub)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">ऋण स्वीकृति आवेदन सुविधा</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowBankLoanApply}
                  onChange={(e) => handleLimitChange('allowBankLoanApply', e.target.checked)}
                  className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 6: Direct WhatsApp Leads */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowDirectWhatsappLeads
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>डायल / व्हाट्सएप लीड रूटिंग</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">ग्राहक की व्हाट्सएप लीड डायरेक्ट</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowDirectWhatsappLeads}
                  onChange={(e) => handleLimitChange('allowDirectWhatsappLeads', e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 7: Custom Product Listing */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowCustomProductListing
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-orange-600" />
                    <span>कस्टम सामान लिस्टिंग (Add Product)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">दुकानदार का नया सामान जोड़ना</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowCustomProductListing}
                  onChange={(e) => handleLimitChange('allowCustomProductListing', e.target.checked)}
                  className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 8: 3D LiDAR & VR Tour */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allow3dLidarVrTour
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-blue-600" />
                    <span>3D LiDAR व VR वर्चुअल टूर</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">एडवांस्ड 3D सर्वे व वर्चुअल वॉकथ्रू</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allow3dLidarVrTour}
                  onChange={(e) => handleLimitChange('allow3dLidarVrTour', e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Toggle 9: Excel/CSV Export */}
              <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                activeConfig.functionLimits.allowExportExcelCsv
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Excel / CSV डाटा एक्सपोर्ट</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">खाताबही व इन्वेंट्री डाटा डाउनलोड</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeConfig.functionLimits.allowExportExcelCsv}
                  onChange={(e) => handleLimitChange('allowExportExcelCsv', e.target.checked)}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Quantitative Caps & Numerical Quotas */}
            <div className="mt-6 space-y-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>न्यूमेरिकल उपयोग कोटा व लिमिट (Quantitative Limits & Quotas):</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {/* Cap 1: AI Prompts */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Daily AI Prompts Limit (प्रतिदिन AI उपयोग):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={activeConfig.functionLimits.maxAiPromptsPerDay}
                    onChange={(e) => handleLimitChange('maxAiPromptsPerDay', parseInt(e.target.value) || 10)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Cap 2: PDF Downloads */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly PDF Exports Cap (मासिक PDF डाउनलोड):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={activeConfig.functionLimits.maxPdfDownloadsPerMonth}
                    onChange={(e) => handleLimitChange('maxPdfDownloadsPerMonth', parseInt(e.target.value) || 10)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Cap 3: Product Listings */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Shop Product Listings (उत्पाद लिस्टिंग सीमा):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={activeConfig.functionLimits.maxProductListingsLimit}
                    onChange={(e) => handleLimitChange('maxProductListingsLimit', parseInt(e.target.value) || 50)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Cap 4: Daily Leads */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Daily Leads Quota (प्रतिदिन लीड्स सीमा):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={activeConfig.functionLimits.maxDailyLeadsQuota}
                    onChange={(e) => handleLimitChange('maxDailyLeadsQuota', parseInt(e.target.value) || 10)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Cap 5: Vendor Bids */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Vendor Bids Quota (निविदा बिड्स सीमा):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={activeConfig.functionLimits.maxVendorBidsQuota}
                    onChange={(e) => handleLimitChange('maxVendorBidsQuota', parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Cap 6: Team Users */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Team Users Limit (टीम सदस्य सीमा):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={activeConfig.functionLimits.maxTeamUsersCount}
                    onChange={(e) => handleLimitChange('maxTeamUsersCount', parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WHITE LABEL MODAL */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingConfig.id ? 'कैटेगरी व्हाइट लेबल संपादित करें' : 'नया कैटेगरी व्हाइट लेबल बनाएं'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="space-y-4">
              {/* Category Key & Partner Brand Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सामग्री/सर्विस कैटेगरी (Select Category) *
                  </label>
                  <select
                    value={editingConfig.categoryKey || ''}
                    onChange={(e) => {
                      const selected = CATEGORY_OPTIONS.find(o => o.key === e.target.value);
                      setEditingConfig(prev => ({
                        ...prev,
                        categoryKey: e.target.value,
                        categoryDisplayName: selected?.label || e.target.value,
                        primaryColorTheme: (selected?.defaultTheme as any) || 'emerald'
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    व्हाइट-लेबल पार्टनर नाम (Partner Brand Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SuryaShakti Solar Partner Mart"
                    value={editingConfig.partnerBrandName || ''}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, partnerBrandName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Logo URL & Subdomain Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ब्रांड लोगो इमेज URL (Logo URL) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={editingConfig.partnerLogoUrl || ''}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, partnerLogoUrl: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    कस्टम स्लग / डोमेन (Domain/Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="solar.suryashakti-mart.in"
                    value={editingConfig.customDomainOrSlug || ''}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, customDomainOrSlug: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Theme & Support Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्राइमरी थीम कलर (Theme Color)
                  </label>
                  <select
                    value={editingConfig.primaryColorTheme || 'emerald'}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, primaryColorTheme: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="emerald">Emerald Green (पर्यावरण / सोलर)</option>
                    <option value="indigo">Indigo Blue (सिविल / इंजीनियरिंग)</option>
                    <option value="amber">Amber Gold (टाइल्स / निर्माण)</option>
                    <option value="rose">Rose Red (मार्केटप्लेस / रिटेल)</option>
                    <option value="cyan">Cyan Teal (बैंक लोन / फाइनेंस)</option>
                    <option value="slate">Slate Dark (ग्लोबल / कॉर्पोरेट)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    व्हाट्सएप / कॉल हेल्पलाइन नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={editingConfig.supportPhoneWhatsapp || ''}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, supportPhoneWhatsapp: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सपोर्ट ईमेल (Support Email)
                  </label>
                  <input
                    type="email"
                    placeholder="support@partnerbrand.com"
                    value={editingConfig.supportEmail || ''}
                    onChange={(e) => setEditingConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Titles & Taglines */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कस्टम पोर्टल शीर्षक (Custom Header Title)
                </label>
                <input
                  type="text"
                  placeholder="e.g. सूर्यशक्ति ऑथोराइज्ड सोलर डिस्ट्रीब्यूशन पोर्टल"
                  value={editingConfig.customHeaderTitle || ''}
                  onChange={(e) => setEditingConfig(prev => ({ ...prev, customHeaderTitle: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कस्टम बैनर टैगलाइन (Custom Banner Tagline)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subsidized PM Surya Ghar Solar Equipment Supply Depot"
                  value={editingConfig.customBannerTagline || ''}
                  onChange={(e) => setEditingConfig(prev => ({ ...prev, customBannerTagline: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg hover:from-indigo-700 hover:to-purple-700"
                >
                  व्हाइट लेबल सहेजें (Save WhiteLabel)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewModalConfig && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 max-w-3xl w-full shadow-2xl overflow-hidden my-8 space-y-0">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h4 className="font-extrabold text-sm text-white">
                  व्हाइट लेबल लाइव इंटरफेस पूर्वावलोकन (Preview Mode)
                </h4>
              </div>
              <button
                onClick={() => setPreviewModalConfig(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Simulated Branded Header Bar */}
            <div className={`p-4 ${
              previewModalConfig.primaryColorTheme === 'emerald' ? 'bg-emerald-950 border-emerald-800' :
              previewModalConfig.primaryColorTheme === 'indigo' ? 'bg-indigo-950 border-indigo-800' :
              previewModalConfig.primaryColorTheme === 'amber' ? 'bg-amber-950 border-amber-800' :
              previewModalConfig.primaryColorTheme === 'rose' ? 'bg-rose-950 border-rose-800' :
              previewModalConfig.primaryColorTheme === 'cyan' ? 'bg-cyan-950 border-cyan-800' : 'bg-slate-900 border-slate-800'
            } border-b flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <img
                  src={previewModalConfig.partnerLogoUrl}
                  alt="Partner Logo"
                  className="w-10 h-10 rounded-xl object-cover border border-white/20"
                />
                <div>
                  <h3 className="font-extrabold text-base text-white">{previewModalConfig.partnerBrandName}</h3>
                  <div className="text-[11px] text-white/80 font-mono">{previewModalConfig.customHeaderTitle || previewModalConfig.categoryDisplayName}</div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{previewModalConfig.supportPhoneWhatsapp}</span>
                </div>
                <div className="text-[10px] text-white/60 font-mono">{previewModalConfig.customDomainOrSlug}</div>
              </div>
            </div>

            {/* Simulated Hero Banner */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  Category: {previewModalConfig.categoryDisplayName}
                </div>
                <h2 className="text-xl font-black text-white">{previewModalConfig.customBannerTagline || 'Welcome to WhiteLabel Partner Network'}</h2>
                <p className="text-xs text-slate-300">
                  Authorized digital supply portal powered with real-time BOQ rates, verified suppliers & direct logistics.
                </p>
              </div>

              {/* Simulated Functional Buttons with Super Admin Limits */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  सुपर एडमिन द्वारा स्वीकृत / प्रतिबंधित फंक्शन स्थिति (Active Function Status):
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowAiGenerations ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowAiGenerations ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>AI Copilot: {previewModalConfig.functionLimits.allowAiGenerations ? `Max ${previewModalConfig.functionLimits.maxAiPromptsPerDay}/Day` : 'Disabled'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowDirectPdfExport ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowDirectPdfExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>PDF Export: {previewModalConfig.functionLimits.allowDirectPdfExport ? `Max ${previewModalConfig.functionLimits.maxPdfDownloadsPerMonth}/Mo` : 'Disabled'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowVendorBidding ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowVendorBidding ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>Bidding Tenders: {previewModalConfig.functionLimits.allowVendorBidding ? `Cap ${previewModalConfig.functionLimits.maxVendorBidsQuota}` : 'Disabled'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowBankLoanApply ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowBankLoanApply ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>Bank Loans Apply</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowDirectWhatsappLeads ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowDirectWhatsappLeads ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>WhatsApp Lead Routing</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    previewModalConfig.functionLimits.allowCustomProductListing ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-400 opacity-60'
                  }`}>
                    {previewModalConfig.functionLimits.allowCustomProductListing ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                    <span>Product Listing Limit: {previewModalConfig.functionLimits.maxProductListingsLimit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{previewModalConfig.copyrightFooterText || '© 2026 WhiteLabel Partner'}</span>
              <button
                onClick={() => setPreviewModalConfig(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
              >
                पूर्वावलोकन बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
