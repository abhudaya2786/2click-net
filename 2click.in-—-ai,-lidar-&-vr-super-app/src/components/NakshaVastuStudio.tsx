import React, { useState } from 'react';
import { useFullscreen } from '../context/FullscreenContext';
import Markdown from 'react-markdown';
import { 
  Compass, 
  CompassIcon,
  Home, 
  FileText, 
  Download, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Send, 
  Paperclip, 
  Star, 
  User as UserIcon, 
  Wrench, 
  Zap, 
  Droplets, 
  Building2, 
  Filter, 
  Plus, 
  ChevronRight,
  Layers,
  Calculator,
  Check,
  Share2,
  Tag,
  Globe,
  ExternalLink,
  Edit,
  Image as ImageIcon,
  ArrowLeft,
  Upload,
  X,
  Eye,
  Printer,
  Copy,
  RefreshCw,
  Info,
  Grid,
  ShoppingBag
} from 'lucide-react';
import { HouseNakshaPlan, VastuRoomRule, MaterialWithFittingItem, VendorConversation, DirectMessage, User } from '../types';
import { SAMPLE_NAKSHA_PLANS, SAMPLE_VASTU_RULES, SAMPLE_MATERIALS_WITH_FITTING, SAMPLE_CONVERSATIONS, INDIAN_CITIES } from '../data/initialData';

interface NakshaVastuStudioProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  selectedCity: string;
}

export const NakshaVastuStudio: React.FC<NakshaVastuStudioProps> = ({
  currentUser,
  onOpenAuth,
  selectedCity
}) => {
  const { openFullscreen } = useFullscreen();
  const [activeTab, setActiveTab] = useState<'naksha_plans' | 'vastu_analyzer' | 'material_fitting_catalog' | 'conversations'>('naksha_plans');

  // Naksha State
  const [nakshaList, setNakshaList] = useState<HouseNakshaPlan[]>(SAMPLE_NAKSHA_PLANS);
  const [facingFilter, setFacingFilter] = useState<string>('All');
  const [bhkFilter, setBhkFilter] = useState<string>('All');
  const [selectedPlanModal, setSelectedPlanModal] = useState<HouseNakshaPlan | null>(null);

  // Vastu Analyzer State
  const [vastuDirections, setVastuDirections] = useState<{ [key: string]: string }>({
    'Main Entrance': 'North-East',
    'Kitchen': 'South-East',
    'Master Bedroom': 'South-West',
    'Puja Room': 'North-East',
    'Toilet & Septic Tank': 'North-West',
    'Overhead Water Tank': 'South-West'
  });

  // AI Vastu Shastra Consultant State
  const [vastuSubTab, setVastuSubTab] = useState<'ai_consultant' | 'direction_matrix'>('ai_consultant');
  const [compassDegree, setCompassDegree] = useState<number>(45);
  const [selectedPadZone, setSelectedPadZone] = useState<string | null>('Ishan (North-East)');
  
  const [aiVastuForm, setAiVastuForm] = useState({
    propertyType: '3BHK Residential House',
    plotDimensions: '30ft x 50ft (1500 Sq.Ft)',
    mainEntranceDirection: 'North-East',
    staircaseDirection: 'South-West',
    waterTankPlacement: 'North-East underground sump, South-West overhead tank',
    layoutDescription: 'Main entrance in North-East (Ishan). Kitchen in South-East (Agneya) with cooking counter facing East. Master bedroom in South-West (Nairutya). Pooja room in North-East corner. Children bedroom in North-West. Toilet in North-West (Vayavya). Central Brahmasthan kept open and light.',
    attachedNakshaImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
  });

  const [isAnalyzingVastu, setIsAnalyzingVastu] = useState<boolean>(false);
  const [vastuReportOutput, setVastuReportOutput] = useState<{
    report: string;
    score: number;
    entranceStatus: string;
    propertyType: string;
    remedies?: { name: string; category: string; price: string }[];
  } | null>(null);
  const [copyReportSuccess, setCopyReportSuccess] = useState<boolean>(false);

  // Live Vastu Chatbot Assistant State
  const [vastuChatQuery, setVastuChatQuery] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [vastuChatHistory, setVastuChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Namaste! I am your AI Vastu Shastra Consultant for 2click.in. Ask me any follow-up question regarding room colors, mirror positions, desk alignments, or remedy installations.',
      time: 'Just now'
    }
  ]);

  // Marketplace Order Confirmation Modal State
  const [orderedRemedyModalItem, setOrderedRemedyModalItem] = useState<{ name: string; price: string } | null>(null);

  // Generate AI Vastu Shastra Report
  const handleGenerateAiVastuReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzingVastu(true);
    try {
      const response = await fetch('/api/ai/vastu-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiVastuForm, compassDegree })
      });
      const data = await response.json();
      if (data.report) {
        setVastuReportOutput({
          report: data.report,
          score: data.score || 8.8,
          entranceStatus: data.entranceStatus || 'Analyzed',
          propertyType: data.propertyType || aiVastuForm.propertyType,
          remedies: data.remedies || [
            { name: 'Brass Swastika & Trishul Door Emblem', category: 'Vastu Energy', price: '₹599' },
            { name: 'Pure Copper Vastu Energy Strip', category: 'Remedies', price: '₹899' },
            { name: 'Raw Himalayan Sea Salt Bowl', category: 'Crystals & Minerals', price: '₹299' },
            { name: 'Lead Pyramid & Crystal Energy Grid', category: 'Remedies', price: '₹1,299' },
            { name: 'Brass Camphor & Water Diffuser Urli', category: 'Pooja Essentials', price: '₹1,499' }
          ]
        });
      }
    } catch (err) {
      console.error("Vastu Report Generation Error:", err);
    } finally {
      setIsAnalyzingVastu(false);
    }
  };

  // Handle Send Chat Query
  const handleSendVastuChat = (queryText?: string) => {
    const textToSend = queryText || vastuChatQuery;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setVastuChatHistory(prev => [...prev, userMsg]);
    if (!queryText) setVastuChatQuery('');
    setIsSendingChat(true);

    setTimeout(() => {
      let botResponse = `According to Vedic architectural guidelines for ${aiVastuForm.propertyType}, `;
      const lower = textToSend.toLowerCase();

      if (lower.includes('color') || lower.includes('paint')) {
        botResponse += `for the ${aiVastuForm.mainEntranceDirection} entrance and North-East zone, use light sky blue, soft yellow, or pristine white. Avoid dark red or black wall paints in Ishan Kona.`;
      } else if (lower.includes('mirror') || lower.includes('glass')) {
        botResponse += `mirrors should ideally be placed on North or East walls so they reflect positive energy entering the house. Never place a mirror directly facing the main entrance or bed.`;
      } else if (lower.includes('study') || lower.includes('desk') || lower.includes('office')) {
        botResponse += `place the study or work desk in the North or East zone facing East or North while working. This enhances concentration and decision-making clarity.`;
      } else if (lower.includes('plant') || lower.includes('tree')) {
        botResponse += `keep Tulsi (Holy Basil) in the North-East zone and Money Plant in a green glass bottle in the North zone. Avoid thorny plants or Cactus indoors.`;
      } else {
        botResponse += `to maintain optimal energy balance, keep the Brahmasthan (center) clutter-free, ensure South-West is heaviest, and install a Brass Swastika or Copper Strip for zero-demolition remedy.`;
      }

      setVastuChatHistory(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsSendingChat(false);
    }, 800);
  };

  // Preset Layout Quick Loaders
  const loadVastuPreset = (presetKey: 'auspicious_3bhk' | 'east_2bhk' | 'southwest_dosha' | 'commercial_dukan') => {
    if (presetKey === 'auspicious_3bhk') {
      setAiVastuForm({
        propertyType: '3BHK Residential House',
        plotDimensions: '30ft x 50ft (1500 Sq.Ft)',
        mainEntranceDirection: 'North-East',
        staircaseDirection: 'South-West',
        waterTankPlacement: 'North-East underground sump, South-West overhead tank',
        layoutDescription: 'Main entrance in North-East (Ishan). Kitchen in South-East (Agneya) with cooking counter facing East. Master bedroom in South-West (Nairutya). Pooja room in North-East corner. Children bedroom in North-West. Toilet in North-West (Vayavya). Central Brahmasthan kept open and light.',
        attachedNakshaImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
      });
    } else if (presetKey === 'east_2bhk') {
      setAiVastuForm({
        propertyType: '2BHK Independent House',
        plotDimensions: '30ft x 40ft (1200 Sq.Ft)',
        mainEntranceDirection: 'East',
        staircaseDirection: 'South',
        waterTankPlacement: 'North-East underground water sump',
        layoutDescription: 'Main entrance in East direction. Kitchen in South-East (Agneya Kona). Living Room in North-East. Master Bedroom in South-West. Toilet in West zone. Staircase on South wall climbing clockwise.',
        attachedNakshaImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
      });
    } else if (presetKey === 'southwest_dosha') {
      setAiVastuForm({
        propertyType: '4BHK Villa / Plot',
        plotDimensions: '40ft x 60ft (2400 Sq.Ft)',
        mainEntranceDirection: 'South-West',
        staircaseDirection: 'North-East',
        waterTankPlacement: 'South-West underground (Flawed)',
        layoutDescription: 'Main entrance in South-West direction. Kitchen placed in North-East corner. Toilet placed next to main entrance in South-West. Underground water tank in South-West. Staircase constructed in North-East Ishan zone. Needs zero-demolition Vastu remedies for structural stability and health.',
        attachedNakshaImage: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80'
      });
    } else if (presetKey === 'commercial_dukan') {
      setAiVastuForm({
        propertyType: 'Commercial Shop & Showroom',
        plotDimensions: '20ft x 50ft (1000 Sq.Ft)',
        mainEntranceDirection: 'North',
        staircaseDirection: 'West',
        waterTankPlacement: 'North-East water dispenser',
        layoutDescription: 'Glass storefront entrance in North (Kuber Zone). Cash counter in North-East facing East/North. Owner seating in South-West facing North. Heavy inventory storage in West/South-West. Bright warm lighting at entrance.',
        attachedNakshaImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'
      });
    }
    setVastuReportOutput(null);
  };

  // Material & Fitting Catalog State
  const [materials, setMaterials] = useState<MaterialWithFittingItem[]>(SAMPLE_MATERIALS_WITH_FITTING);
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>('All');
  const [selectedItemsForEstimate, setSelectedItemsForEstimate] = useState<string[]>([]);

  // Material Modal (Add & Edit Material with Photo, Specs, Price, Website)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({
    itemTitle: '',
    brandName: '',
    modelNumber: '',
    category: 'Cement & AAC Blocks' as MaterialWithFittingItem['category'],
    unit: '50kg Bag',
    materialPriceINR: 400,
    fittingLaborChargeINR: 80,
    laborRateUnit: 'per unit fitting',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: '',
    warranty: '1 Year Manufacturer Warranty',
    empanelledSupplier: 'Empanelled Dukandar Mart',
    plumberOrElectricianRole: 'Mason' as MaterialWithFittingItem['plumberOrElectricianRole'],
    officialWebsiteUrl: 'https://www.ultratechcement.com'
  });

  // Website Landing Page Modal (Smooth Iframe / Preview with Back Button)
  const [activeLandingModal, setActiveLandingModal] = useState<{
    itemTitle: string;
    brandName: string;
    modelNumber: string;
    officialWebsiteUrl: string;
    imageUrl: string;
    specs: string;
    materialPriceINR: number;
    fittingLaborChargeINR: number;
  } | null>(null);

  // Preset Construction Material Photos for quick selection
  const MATERIAL_PHOTO_PRESETS = [
    { label: 'Cement & Concrete', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
    { label: 'Red Bricks & Clay', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    { label: 'TMT Steel Rebars', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
    { label: 'Paints & Sheen Buckets', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Boundary Wall & Fencing', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80' },
    { label: 'SS & Glass Railings', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Plumbing Pipes & Valves', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Electrical Wiring & Boards', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
    { label: 'Tiles & Marble Floor', url: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80' },
    { label: 'Modular Kitchen & Cabinets', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Interiors & Wood Panels', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Shop (Dukan) Glass Frontage', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80' },
    { label: 'Office Glass Partition Cabins', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' }
  ];

  // Conversations State
  const [conversations, setConversations] = useState<VendorConversation[]>(SAMPLE_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(SAMPLE_CONVERSATIONS[0].id);
  const [newMessageText, setNewMessageText] = useState<string>('');

  // Calculate Vastu Score
  const activeVastuRules: VastuRoomRule[] = SAMPLE_VASTU_RULES.map(rule => {
    const currentDir = vastuDirections[rule.roomName] || 'North-East';
    const isCompliant = rule.idealDirections.some(d => d.toLowerCase().includes(currentDir.toLowerCase()) || currentDir.toLowerCase().includes(d.toLowerCase()));
    return {
      ...rule,
      currentDirection: currentDir,
      isCompliant,
      score: isCompliant ? 100 : 40
    };
  });

  const totalVastuScore = Math.round(activeVastuRules.reduce((acc, r) => acc + r.score, 0) / activeVastuRules.length);

  // Toggle Material Selection
  const toggleSelectMaterial = (id: string) => {
    if (selectedItemsForEstimate.includes(id)) {
      setSelectedItemsForEstimate(selectedItemsForEstimate.filter(item => item !== id));
    } else {
      setSelectedItemsForEstimate([...selectedItemsForEstimate, id]);
    }
  };

  // Estimate total calculation
  const selectedMaterialsSummary = materials.filter(m => selectedItemsForEstimate.includes(m.id));
  const totalMaterialPrice = selectedMaterialsSummary.reduce((acc, m) => acc + m.materialPriceINR, 0);
  const totalLaborFittingPrice = selectedMaterialsSummary.reduce((acc, m) => acc + m.fittingLaborChargeINR, 0);

  // Open Modal for New Material
  const handleOpenAddMaterialModal = () => {
    setEditingMaterialId(null);
    setMaterialForm({
      itemTitle: '',
      brandName: '',
      modelNumber: '',
      category: 'Cement & AAC Blocks',
      unit: '50kg Bag',
      materialPriceINR: 420,
      fittingLaborChargeINR: 75,
      laborRateUnit: 'per unit fitting',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      specs: 'ISI certified material with high compressive strength & dampness resistance.',
      warranty: '10 Year Structural Warranty',
      empanelledSupplier: 'National Material Supplier Mart',
      plumberOrElectricianRole: 'Mason',
      officialWebsiteUrl: 'https://www.ultratechcement.com'
    });
    setIsMaterialModalOpen(true);
  };

  // Open Modal to Edit Existing Material
  const handleOpenEditMaterialModal = (item: MaterialWithFittingItem) => {
    setEditingMaterialId(item.id);
    setMaterialForm({
      itemTitle: item.itemTitle,
      brandName: item.brandName,
      modelNumber: item.modelNumber,
      category: item.category,
      unit: item.unit,
      materialPriceINR: item.materialPriceINR,
      fittingLaborChargeINR: item.fittingLaborChargeINR,
      laborRateUnit: item.laborRateUnit,
      imageUrl: item.imageUrl,
      specs: item.specs,
      warranty: item.warranty,
      empanelledSupplier: item.empanelledSupplier,
      plumberOrElectricianRole: item.plumberOrElectricianRole,
      officialWebsiteUrl: item.officialWebsiteUrl || 'https://www.ultratechcement.com'
    });
    setIsMaterialModalOpen(true);
  };

  // Save Material (New or Updated)
  const handleSaveMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.itemTitle || !materialForm.brandName) {
      alert('Please enter Item Title and Brand Name.');
      return;
    }

    if (editingMaterialId) {
      setMaterials(materials.map(m => m.id === editingMaterialId ? {
        ...m,
        ...materialForm
      } : m));
    } else {
      const newItem: MaterialWithFittingItem = {
        id: `MAT-CUSTOM-${Date.now()}`,
        ...materialForm
      };
      setMaterials([newItem, ...materials]);
    }

    setIsMaterialModalOpen(false);
  };

  // Photo File Upload Handler (DataURL conversion)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setMaterialForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Website Landing Page Overlay
  const handleOpenLandingModal = (item: MaterialWithFittingItem) => {
    setActiveLandingModal({
      itemTitle: item.itemTitle,
      brandName: item.brandName,
      modelNumber: item.modelNumber,
      officialWebsiteUrl: item.officialWebsiteUrl || `https://www.google.com/search?q=${encodeURIComponent(item.brandName + ' ' + item.itemTitle)}`,
      imageUrl: item.imageUrl,
      specs: item.specs,
      materialPriceINR: item.materialPriceINR,
      fittingLaborChargeINR: item.fittingLaborChargeINR
    });
  };

  // Send message in active conversation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const msg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (Client)`,
      senderRole: currentUser.role,
      text: newMessageText,
      timestamp: 'Just now'
    };

    setConversations(conversations.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          lastUpdated: 'Just now',
          messages: [...conv.messages, msg]
        };
      }
      return conv;
    }));

    setNewMessageText('');
  };

  // Start new conversation with an architect/plumber/electrician
  const handleStartConversationWithVendor = (vendorName: string, role: 'Architect' | 'Plumber' | 'Electrician' | 'Supplier' | 'Dukandar' | 'Civil Contractor' | 'Vendor', topic: string) => {
    const existing = conversations.find(c => c.vendorName === vendorName);
    if (existing) {
      setActiveConvId(existing.id);
      setActiveTab('conversations');
      return;
    }

    const newConv: VendorConversation = {
      id: `CONV-${Date.now()}`,
      vendorId: `VND-${Date.now()}`,
      vendorName,
      vendorRole: role,
      vendorPhone: '+91 98000 11223',
      projectTopic: topic,
      lastUpdated: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          senderId: currentUser ? currentUser.id : 'user',
          senderName: currentUser ? currentUser.name : 'Client (You)',
          senderRole: 'Client',
          text: `Namaste ${vendorName}, I am inquiring regarding ${topic} for my home construction/renovation project in ${selectedCity}.`,
          timestamp: 'Just now'
        }
      ]
    };

    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
    setActiveTab('conversations');
  };

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const filteredNakshas = nakshaList.filter(plan => {
    const matchesFacing = facingFilter === 'All' || plan.facingDirection === facingFilter;
    const matchesBhk = bhkFilter === 'All' || plan.bhkConfig === bhkFilter;
    return matchesFacing && matchesBhk;
  });

  const filteredMaterials = materials.filter(m => {
    return selectedMaterialCategory === 'All' || m.category === selectedMaterialCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold border border-teal-500/30 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Naksha &amp; Vastu Consultation Studio
            </span>
            <span className="text-xs text-slate-300">• {selectedCity} Region</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ghar Banawao &amp; Renovation Hub (Naksha, Vastu &amp; Material Fitting Rates)
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Choose 2D/3D Naksha Blueprints, check Vastu score, pick Plumber/Electrician fittings with brand model prices &amp; labor charges, and converse directly with Architects, Plumbers, Electricians, Dukandars &amp; Contractors!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('conversations')}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Direct Vendor Conversations</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('naksha_plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'naksha_plans'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>House Layout Naksha Gallery ({nakshaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vastu_analyzer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vastu_analyzer'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive Vastu Compliance Checker</span>
        </button>

        <button
          onClick={() => setActiveTab('material_fitting_catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'material_fitting_catalog'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Material Catalog &amp; Fitting Rates ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conversations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'conversations'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Architect, Plumber &amp; Dukandar Chat ({conversations.length})</span>
        </button>
      </div>

      {/* TAB 1: HOUSE LAYOUT NAKSHA GALLERY */}
      {activeTab === 'naksha_plans' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-teal-600" /> Plot Facing:
              </span>
              {(['All', 'North', 'East', 'South', 'West'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setFacingFilter(dir)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    facingFilter === dir 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {dir} Facing
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">BHK Configuration:</span>
              <select
                value={bhkFilter}
                onChange={(e) => setBhkFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="All">All Configurations</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK Villa">4BHK Villa</option>
                <option value="Duplex Plan">Duplex Plan</option>
              </select>
            </div>
          </div>

          {/* Naksha Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNakshas.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-900 group">
                    <img 
                      src={plan.imageUrl} 
                      alt={plan.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[11px] font-extrabold rounded-xl border border-amber-500/40 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" />
                        {plan.vastuScorePct}% Vastu Score
                      </span>
                      <span className="px-2.5 py-1 bg-teal-950/80 backdrop-blur-md text-teal-300 text-[11px] font-extrabold rounded-xl border border-teal-500/40">
                        {plan.facingDirection} Facing
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/85 text-white px-3 py-1 rounded-xl text-xs font-extrabold backdrop-blur-md">
                      {plan.plotDimensionsFt} ({plan.totalAreaSqft} Sq.Ft)
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{plan.title}</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">{plan.architectName} • Rating: ★ {plan.architectRating}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-lg shrink-0">
                        {plan.bhkConfig}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {plan.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Vastu &amp; Architectural Highlights:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Est. Construction Cost</span>
                    <span className="text-base font-extrabold text-teal-700 dark:text-teal-300">
                      ₹{(plan.estimatedConstructionCostINR / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Downloaded 2D CAD Blueprint & Vastu Certificate for ${plan.title}!`)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> 2D CAD PDF
                    </button>
                    <button
                      onClick={() => handleStartConversationWithVendor(plan.architectName, 'Architect', `Customization of ${plan.title}`)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat Architect
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE VASTU COMPLIANCE CHECKER & AI CONSULTANT */}
      {activeTab === 'vastu_analyzer' && (
        <div className="space-y-6">
          
          {/* Sub-Tab Navigation Header */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVastuSubTab('ai_consultant')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  vastuSubTab === 'ai_consultant'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>AI Vastu Shastra Consultant &amp; Architectural Report</span>
              </button>

              <button
                onClick={() => setVastuSubTab('direction_matrix')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  vastuSubTab === 'direction_matrix'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Interactive 8-Zone Directional Matrix</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium hidden md:block">
              2click.in — Naksha &amp; Vastu Studio Engine
            </div>
          </div>

          {/* SUB-TAB 1: AI VASTU SHASTRA CONSULTANT */}
          {vastuSubTab === 'ai_consultant' && (
            <div className="space-y-6">
              
              {/* Preset Loaders */}
              <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-2xl border border-amber-800/80 shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Vastu Shastra Consultant &amp; Architectural Analyst</span>
                    </div>
                    <h2 className="text-xl font-black text-white">
                      Naksha Vastu Analysis &amp; Non-Demolition Remedial Report Generator
                    </h2>
                    <p className="text-xs text-amber-100/90 mt-1 max-w-2xl">
                      Analyze layout descriptions, property dimensions, and floor plans across North-East (Ishan), South-East (Agneya), South-West (Nairutya), North-West (Vayavya), and Brahmasthan zones.
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerateAiVastuReport()}
                    disabled={isAnalyzingVastu}
                    className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl transition shrink-0 border border-amber-300 disabled:opacity-50"
                  >
                    {isAnalyzingVastu ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Analyzing Vastu Alignment...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>✨ Generate Vastu Report (Gemini AI)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Preset Buttons */}
                <div className="pt-3 border-t border-amber-800/60 space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    ⚡ Instant Preset Layout Loaders:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => loadVastuPreset('auspicious_3bhk')}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-200 rounded-xl border border-amber-500/30 font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🌟 30x50 North-East Entrance (Ideal 3BHK)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadVastuPreset('east_2bhk')}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-teal-200 rounded-xl border border-teal-500/30 font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🔥 30x40 East Facing 2BHK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadVastuPreset('southwest_dosha')}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-rose-200 rounded-xl border border-rose-500/30 font-semibold transition flex items-center gap-1.5"
                    >
                      <span>⚠️ 40x60 South-West Facing (Agni/Nairutya Dosha)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadVastuPreset('commercial_dukan')}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-indigo-200 rounded-xl border border-indigo-500/30 font-semibold transition flex items-center gap-1.5"
                    >
                      <span>🏬 Commercial Shop / Showroom Layout</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form & Input Details */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-500" />
                      Property Specifications &amp; Spatial Alignment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Input digital compass angle, 9x9 Pad Vinyas layout, and room arrangements for AI Vastu Analysis
                    </p>
                  </div>

                  {/* Digital Compass Degree Control */}
                  <div className="p-3 bg-slate-900 text-white rounded-2xl border border-amber-500/40 flex items-center gap-4 text-xs">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 text-amber-400 transition-transform duration-500" style={{ transform: `rotate(${compassDegree}deg)` }} />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-300 font-extrabold uppercase">Digital Compass Degree</div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{compassDegree}° Heading</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[10px] font-bold">
                          {compassDegree >= 22.5 && compassDegree < 67.5 ? 'North-East (Ishan)' :
                           compassDegree >= 67.5 && compassDegree < 112.5 ? 'East (Aditya)' :
                           compassDegree >= 112.5 && compassDegree < 157.5 ? 'South-East (Agneya)' :
                           compassDegree >= 157.5 && compassDegree < 202.5 ? 'South (Yama)' :
                           compassDegree >= 202.5 && compassDegree < 247.5 ? 'South-West (Nairutya)' :
                           compassDegree >= 247.5 && compassDegree < 292.5 ? 'West (Varun)' :
                           compassDegree >= 292.5 && compassDegree < 337.5 ? 'North-West (Vayavya)' : 'North (Kuber)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleGenerateAiVastuReport} className="space-y-6">
                  
                  {/* Digital Compass Angle Slider */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-amber-500" />
                        Set Main Entrance Compass Facing Orientation ({compassDegree}°):
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{compassDegree}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={compassDegree}
                      onChange={(e) => setCompassDegree(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                      <span>0° N</span>
                      <span>45° NE</span>
                      <span>90° E</span>
                      <span>135° SE</span>
                      <span>180° S</span>
                      <span>225° SW</span>
                      <span>270° W</span>
                      <span>315° NW</span>
                      <span>360° N</span>
                    </div>
                  </div>

                  {/* 9x9 Pad Vinyas Interactive Grid Visualizer */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-amber-500" />
                        Interactive 9x9 Pad Vinyas Grid &amp; Elemental Zone Selector:
                      </span>
                      {selectedPadZone && (
                        <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400">
                          Active Zone: {selectedPadZone}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      {/* Top Row: NW, N, NE */}
                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Vayavya (North-West - Air)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('North-West') ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-300' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">🌬️ Vayavya (NW)</span>
                        <span className="text-xs">Air / Guest / Toilets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Kuber (North - Wealth)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('North -') ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">💰 Kuber (North)</span>
                        <span className="text-xs">Cash Flow / Treasures</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Ishan (North-East - Water)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('North-East') ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-300 font-black' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">🕉️ Ishan (NE)</span>
                        <span className="text-xs">Divine / Water / Pooja</span>
                      </button>

                      {/* Middle Row: W, Center, E */}
                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Varun (West - Stability)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('West -') ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">🌊 Varun (West)</span>
                        <span className="text-xs">Dining / Overhead Tanks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Brahmasthan (Center - Space)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('Brahmasthan') ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-orange-600 shadow-md ring-2 ring-amber-300 font-black' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-90">🏛️ Brahmasthan</span>
                        <span className="text-xs font-black">Open Space / Courtyard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Aditya (East - Light)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('East -') ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-300' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">☀️ Aditya (East)</span>
                        <span className="text-xs">Main Gate / Living</span>
                      </button>

                      {/* Bottom Row: SW, S, SE */}
                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Nairutya (South-West - Earth)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('South-West') ? 'bg-stone-700 text-white border-stone-800 shadow-md ring-2 ring-stone-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">👑 Nairutya (SW)</span>
                        <span className="text-xs">Earth / Master Bed</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Yama (South - Health)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('South -') ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">🛡️ Yama (South)</span>
                        <span className="text-xs">Bedrooms / Heavy Wall</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPadZone('Agneya (South-East - Fire)')}
                        className={`p-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                          selectedPadZone?.includes('South-East') ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-300' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-black opacity-80">🔥 Agneya (SE)</span>
                        <span className="text-xs">Fire / Kitchen Corner</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
                      <select
                        value={aiVastuForm.propertyType}
                        onChange={(e) => setAiVastuForm({ ...aiVastuForm, propertyType: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="3BHK Residential House">3BHK Residential House</option>
                        <option value="2BHK Independent House">2BHK Independent House</option>
                        <option value="4BHK Duplex Villa">4BHK Duplex Villa</option>
                        <option value="Commercial Shop & Showroom">Commercial Shop &amp; Showroom</option>
                        <option value="Plot / Land Naksha">Plot / Land Naksha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Plot Dimensions</label>
                      <input
                        type="text"
                        value={aiVastuForm.plotDimensions}
                        onChange={(e) => setAiVastuForm({ ...aiVastuForm, plotDimensions: e.target.value })}
                        placeholder="e.g. 30ft x 50ft (1500 Sq.Ft)"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Main Entrance Direction</label>
                      <select
                        value={aiVastuForm.mainEntranceDirection}
                        onChange={(e) => setAiVastuForm({ ...aiVastuForm, mainEntranceDirection: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="North-East">North-East (Ishan - Highly Auspicious)</option>
                        <option value="East">East (Auspicious Surya Gate)</option>
                        <option value="North">North (Kuber Gate)</option>
                        <option value="South-East">South-East (Agneya)</option>
                        <option value="South-West">South-West (Nairutya)</option>
                        <option value="North-West">North-West (Vayavya)</option>
                        <option value="South">South (Yama Zone)</option>
                        <option value="West">West (Varun Zone)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staircase &amp; Water Tank</label>
                      <input
                        type="text"
                        value={aiVastuForm.staircaseDirection}
                        onChange={(e) => setAiVastuForm({ ...aiVastuForm, staircaseDirection: e.target.value })}
                        placeholder="e.g. South-West staircase, North-East water sump"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Room Placement Details &amp; Custom Layout Notes
                    </label>
                    <textarea
                      rows={3}
                      value={aiVastuForm.layoutDescription}
                      onChange={(e) => setAiVastuForm({ ...aiVastuForm, layoutDescription: e.target.value })}
                      placeholder="Describe room locations: kitchen direction, bedrooms, toilets, pooja room, doors, windows, septic tank..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Floor Plan Attachment Simulator */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={aiVastuForm.attachedNakshaImage}
                        alt="Naksha Preview"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Attached Floor Plan (Naksha Blueprint)</span>
                        <span className="text-[11px] text-slate-500">Auto-scanned image / CAD draft ready for AI directional overlay</span>
                      </div>
                    </div>

                    <label className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Naksha Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setAiVastuForm({ ...aiVastuForm, attachedNakshaImage: reader.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </form>
              </div>

              {/* Generated Report Card Output */}
              {vastuReportOutput && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-amber-400 dark:border-amber-600 shadow-xl overflow-hidden space-y-0">
                    
                    {/* Report Header Bar */}
                    <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 border-b border-amber-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                            Official Vastu Shastra Analysis Report
                          </span>
                          <span className="text-xs text-slate-300">• 2click.in Naksha &amp; Vastu Studio</span>
                        </div>
                        <h3 className="text-lg font-black text-white">
                          Vastu Audit Report for {vastuReportOutput.propertyType}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Score Badge */}
                        <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center">
                          <span className="text-[10px] text-amber-300 uppercase font-black block">Vastu Score</span>
                          <span className="text-xl font-black text-amber-400">{vastuReportOutput.score}/10</span>
                        </div>

                        {/* Print / PDF Button */}
                        <button
                          onClick={() => window.print()}
                          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 shadow-xs"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Print / Save PDF</span>
                        </button>

                        {/* Copy Report Button */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(vastuReportOutput.report);
                            setCopyReportSuccess(true);
                            setTimeout(() => setCopyReportSuccess(false), 3000);
                          }}
                          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 shadow-xs"
                        >
                          <Copy className="w-4 h-4 text-teal-400" />
                          <span>{copyReportSuccess ? 'Copied!' : 'Copy Text'}</span>
                        </button>

                        {/* Consult Vastu Architect Button */}
                        <button
                          onClick={() => handleStartConversationWithVendor(
                            'Ar. Rajesh Sharma (Senior Architect)', 
                            'Architect', 
                            `Review of AI Vastu Report for ${vastuReportOutput.propertyType}`
                          )}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Discuss with Architect</span>
                        </button>
                      </div>
                    </div>

                    {/* Markdown Report Body */}
                    <div className="p-6 sm:p-8 space-y-6 text-slate-800 dark:text-slate-200">
                      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                        <Markdown>{vastuReportOutput.report}</Markdown>
                      </div>

                      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>Verified Zero-Demolition Vastu Remedies based on Vedic Pancha Tattva Principles</span>
                        </div>
                        <button
                          onClick={() => handleStartConversationWithVendor(
                            'Ar. Rajesh Sharma (Senior Architect)', 
                            'Architect', 
                            `Implementation of Vastu Remedies for ${vastuReportOutput.propertyType}`
                          )}
                          className="px-4 py-2 bg-slate-900 text-amber-300 font-bold rounded-xl text-xs shadow-xs hover:bg-slate-800 transition shrink-0"
                        >
                          Request On-Site Vastu Visit →
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* E-Commerce Marketplace Non-Destructive Remedy Items Catalog */}
                  {vastuReportOutput.remedies && vastuReportOutput.remedies.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-500" />
                            Non-Destructive Vastu Remedies on 2click.in Marketplace
                          </h4>
                          <p className="text-xs text-slate-500">
                            Order verified energetic balancing items directly from multi-vendor stores
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          Free Express Shipping Across India
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        {vastuReportOutput.remedies.map((remedy, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 hover:border-amber-400 transition flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                                {remedy.category}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">{remedy.name}</h5>
                              <p className="text-[11px] text-slate-500">Zero-Demolition energetic balance for home &amp; office</p>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{remedy.price}</span>
                              <button
                                onClick={() => setOrderedRemedyModalItem(remedy)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-[11px] shadow-xs flex items-center gap-1 transition"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Order Item</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Vastu Chatbot Quick Assistant */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-amber-800/80 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-white">
                          Ask Vastu Shastra AI Assistant (Live Chat)
                        </h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        Online • 2click.in Consultant
                      </span>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 text-xs">
                      {vastuChatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-amber-500 text-slate-950 font-semibold'
                                : 'bg-slate-800 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                        </div>
                      ))}
                      {isSendingChat && (
                        <div className="flex items-center gap-2 text-amber-400 text-xs italic">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Vastu Consultant is typing...</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Suggested Queries */}
                    <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendVastuChat('What are the best wall colors for my kitchen and bedroom?')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                      >
                        🎨 Best Wall Colors?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendVastuChat('Where should I place mirror and dressing table?')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                      >
                        🪞 Mirror Rules?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendVastuChat('Where should study table and work desk face?')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                      >
                        🖥️ Work Desk Facing?
                      </button>
                    </div>

                    {/* Input bar */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={vastuChatQuery}
                        onChange={(e) => setVastuChatQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendVastuChat()}
                        placeholder="Ask follow-up question (e.g. mirror position, study table, plant placement...)"
                        className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendVastuChat()}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shrink-0"
                      >
                        Send
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Remedy Order Confirmation Modal */}
              {orderedRemedyModalItem && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-md w-full border border-amber-400 shadow-2xl space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">2click.in Marketplace Order</h4>
                      </div>
                      <button onClick={() => setOrderedRemedyModalItem(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                      <span className="text-[10px] uppercase font-black text-amber-600">Selected Remedy Item</span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{orderedRemedyModalItem.name}</div>
                      <div className="text-base font-black text-amber-600 dark:text-amber-400">{orderedRemedyModalItem.price}</div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">
                      This non-destructive Vastu remedy will be dispatched directly to your doorstep from verified 2click.in Vastu suppliers with installation instructions.
                    </p>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setOrderedRemedyModalItem(null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          alert(`Order placed successfully for ${orderedRemedyModalItem.name}! Supplier notification sent.`);
                          setOrderedRemedyModalItem(null);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                      >
                        Confirm Order ({orderedRemedyModalItem.price})
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SUB-TAB 2: INTERACTIVE 8-ZONE DIRECTIONAL MATRIX */}
          {vastuSubTab === 'direction_matrix' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    Ghar Vastu Directional Matrix &amp; Remedial Scorecard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select your home's room placements to instantly analyze overall Vastu alignment &amp; corrective remedies
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center gap-4 shadow-md border border-teal-800">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Calculated Vastu Score</div>
                    <div className="text-2xl font-black text-amber-400">{totalVastuScore}%</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <div className="text-xs font-bold text-teal-300">
                      {totalVastuScore >= 85 ? 'Highly Auspicious Vastu' : totalVastuScore >= 65 ? 'Moderate Vastu (Remedies Needed)' : 'Flawed Vastu Alignment'}
                    </div>
                    <div className="text-[10px] text-slate-300">Based on Vedic Architectural Manuals</div>
                  </div>
                </div>
              </div>

              {/* Vastu Orientations Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {activeVastuRules.map((rule) => (
                  <div key={rule.roomName} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{rule.roomName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        rule.isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rule.isCompliant ? '100% Compliant' : 'Remedy Required'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Current Selected Orientation:</label>
                      <select
                        value={vastuDirections[rule.roomName]}
                        onChange={(e) => setVastuDirections({ ...vastuDirections, [rule.roomName]: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="North-East">North-East (Ishan Kona)</option>
                        <option value="South-East">South-East (Agni Kona)</option>
                        <option value="South-West">South-West (Nairutya Kona)</option>
                        <option value="North-West">North-West (Vayu Kona)</option>
                        <option value="North">North Direction</option>
                        <option value="East">East Direction</option>
                        <option value="South">South Direction</option>
                        <option value="West">West Direction</option>
                      </select>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Ideal Directions:</span> {rule.idealDirections.join(', ')}
                    </p>

                    <p className="text-[11px] text-slate-500 italic">
                      "{rule.vastuNotes}"
                    </p>

                    {!rule.isCompliant && (
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Corrective Vastu Remedy:
                        </div>
                        <p>{rule.remedyIfFlawed}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 flex justify-between items-center text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Need official Vastu approval certificate for your bank loan or builder sanction?
                </span>
                <button
                  onClick={() => handleStartConversationWithVendor('Ar. Rajesh Sharma (Senior Architect)', 'Architect', 'Official Vastu Inspection Certificate')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition"
                >
                  Consult Vastu Architect →
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 3: MATERIAL CATALOG & PLUMBER/ELECTRICIAN FITTING RATES */}
      {activeTab === 'material_fitting_catalog' && (
        <div className="space-y-6">
          
          {/* Header Summary for Selected Materials */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-800/80 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-bold border border-teal-500/20 mb-2">
                <Tag className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Material &amp; Fitting Rates Catalog</span>
              </div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Construction &amp; Renovation Materials + Fitting Charges Catalog
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Add new materials with photos, specs &amp; official website links or edit existing material catalog entries.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAddMaterialModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>➕ Add New Material with Photo &amp; Specs</span>
              </button>

              {selectedItemsForEstimate.length > 0 && (
                <div className="bg-teal-900/80 p-3 rounded-xl border border-teal-700 text-xs flex items-center gap-4 shrink-0">
                  <div>
                    <span className="text-[10px] text-teal-300 font-bold block">{selectedItemsForEstimate.length} Items Selected</span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{(totalMaterialPrice + totalLaborFittingPrice).toLocaleString('en-IN')} Total
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 border-l border-teal-700 pl-3">
                    <div>Material: ₹{totalMaterialPrice.toLocaleString('en-IN')}</div>
                    <div>Fitting Labor: ₹{totalLaborFittingPrice.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
            {[
              'All',
              'Cement & AAC Blocks',
              'Bricks & Red Clay',
              'TMT Steel Rebars',
              'Paints & Wall Putty',
              'Boundary Wall & Fencing',
              'SS & Glass Railings',
              'Kitchen & Bath Upgrades',
              'Custom Interiors & Panels',
              'Shop (Dukan) Renovation',
              'Office Renovation',
              'Plumbing & Bath',
              'Electrical & Wiring',
              'Tiles & Marble'
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedMaterialCategory(cat)}
                className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap shrink-0 ${
                  selectedMaterialCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Material Cards Grid with Photo, Specs, Price, Edit & Website Landing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => {
              const isSelected = selectedItemsForEstimate.includes(item.id);

              return (
                <div 
                  key={item.id} 
                  className={`bg-white dark:bg-slate-800 rounded-2xl border transition overflow-hidden shadow-xs space-y-3 flex flex-col justify-between ${
                    isSelected ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Item Image with Brand Badge & Landing Trigger */}
                    <div className="relative h-52 bg-slate-900 overflow-hidden group cursor-pointer" onClick={() => handleOpenLandingModal(item)}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.itemTitle} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-teal-300 border border-teal-500/30">
                        {item.brandName}
                      </div>

                      <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        {item.plumberOrElectricianRole === 'Plumber' && <Droplets className="w-3 h-3 text-cyan-400" />}
                        {item.plumberOrElectricianRole === 'Electrician' && <Zap className="w-3 h-3 text-amber-400" />}
                        {item.plumberOrElectricianRole} Fit
                      </div>

                      {/* Smooth Landing Trigger Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4 text-center">
                        <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
                          <Globe className="w-4 h-4" /> Visit Official Web Landing Page →
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.modelNumber}</div>
                          <h3 
                            onClick={() => handleOpenLandingModal(item)}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-600 transition cursor-pointer"
                          >
                            {item.itemTitle}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleOpenEditMaterialModal(item)}
                          title="Edit Photo, Specs, Price or Link"
                          className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 rounded-lg transition shrink-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.specs}</p>

                      {/* Photo under Price & Model Card Breakdown */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="text-slate-500 font-semibold">Material Selling Price:</span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            ₹{item.materialPriceINR.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">/ {item.unit}</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-teal-700 dark:text-teal-300">
                          <span className="font-semibold flex items-center gap-1">
                            {item.plumberOrElectricianRole === 'Plumber' ? <Droplets className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                            {item.plumberOrElectricianRole} Labor Fitting Charge:
                          </span>
                          <span className="font-extrabold">
                            + ₹{item.fittingLaborChargeINR.toLocaleString('en-IN')} <span className="text-[10px] font-normal">({item.laborRateUnit})</span>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-black text-amber-600 dark:text-amber-400 text-sm">
                          <span>Total Combined Rate:</span>
                          <span>₹{(item.materialPriceINR + item.fittingLaborChargeINR).toLocaleString('en-IN')}</span>
                        </div>

                      </div>

                      {/* Official Website Button & Supplier Info */}
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <button
                          onClick={() => handleOpenLandingModal(item)}
                          className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-between transition border border-slate-200/80 dark:border-slate-700"
                        >
                          <span className="flex items-center gap-1.5 text-[10px] text-teal-600 dark:text-teal-400">
                            <Globe className="w-3.5 h-3.5" /> Official Brand Landing Page
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>

                        <div className="text-slate-500 space-y-0.5 text-[10px]">
                          <div><span className="font-semibold">Empanelled Supplier:</span> {item.empanelledSupplier}</div>
                          <div><span className="font-semibold">Warranty:</span> {item.warranty}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => toggleSelectMaterial(item.id)}
                      className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                        isSelected 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isSelected ? 'Selected in Renovation' : 'Add to Fitting Rate List'}</span>
                    </button>

                    <button
                      onClick={() => handleStartConversationWithVendor(
                        item.empanelledSupplier, 
                        item.plumberOrElectricianRole === 'Plumber' ? 'Plumber' : 'Electrician', 
                        `Quote for ${item.itemTitle}`
                      )}
                      title="Chat with installer/dukandar"
                      className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 4: DIRECT IN-WEBSITE CONVERSATIONS (CHAT STUDIO) */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden min-h-[600px]">
          
          {/* Left Conversations Sidebar */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Active Direct Discussions
              </h3>
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 text-[10px] font-bold rounded-full">
                {conversations.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl transition border space-y-1 ${
                      isActive 
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30' 
                        : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                        {conv.vendorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{conv.lastUpdated}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-extrabold rounded-md">
                        {conv.vendorRole}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate flex-1">{conv.projectTopic}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Active Conversation Chat Window */}
          <div className="lg:col-span-8 flex flex-col justify-between p-6 bg-white dark:bg-slate-800 space-y-4">
            
            {/* Chat Thread Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {activeConv.vendorName}
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg">
                    {activeConv.vendorRole}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Topic: {activeConv.projectTopic}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Calling ${activeConv.vendorName} at ${activeConv.vendorPhone}...`)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Vendor
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] p-2 pr-4">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === (currentUser ? currentUser.id : 'user');
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                    <div className="text-[10px] text-slate-400 px-1 font-semibold">
                      {msg.senderName} • {msg.timestamp}
                    </div>

                    <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-600'
                    }`}>
                      <p>{msg.text}</p>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-slate-600 space-y-1">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-black/20 text-[11px] font-bold flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 truncate">
                                <FileText className="w-3.5 h-3.5 text-amber-300 shrink-0" /> {att.title}
                              </span>
                              <button 
                                onClick={() => alert(`Opening attachment ${att.title}...`)}
                                className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded text-[9px] font-extrabold shrink-0"
                              >
                                View PDF
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={`Ask ${activeConv.vendorName} about rates, Naksha modification, or delivery timing...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>

          </div>

        </div>
      )}

      {/* MODAL 1: ADD / EDIT MATERIAL ITEM MODAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  {editingMaterialId ? 'Edit Material Details & Photo' : 'Add New Material with Photo & Specs'}
                </div>
                <h2 className="text-xl font-black">
                  {editingMaterialId ? 'Update Material Catalog Item' : 'New Construction Material Entry'}
                </h2>
                <p className="text-xs text-slate-500">
                  Provide photo, specs, selling price, fitting labor charges and official website landing page URL.
                </p>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterialSubmit} className="space-y-5 text-xs">
              
              {/* Row 1: Item Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Material Item Title *
                  </label>
                  <input
                    type="text"
                    value={materialForm.itemTitle}
                    onChange={(e) => setMaterialForm({ ...materialForm, itemTitle: e.target.value })}
                    placeholder="e.g. UltraTech Super OPC 53 Cement Bag"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manufacturer / Brand Name *
                  </label>
                  <input
                    type="text"
                    value={materialForm.brandName}
                    onChange={(e) => setMaterialForm({ ...materialForm, brandName: e.target.value })}
                    placeholder="e.g. UltraTech Cement / Tata Tiscon / Asian Paints"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Category & Model Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Material Category *
                  </label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value as any })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Cement & AAC Blocks">Cement &amp; AAC Blocks</option>
                    <option value="Bricks & Red Clay">Bricks &amp; Red Clay</option>
                    <option value="TMT Steel Rebars">TMT Steel Rebars</option>
                    <option value="Paints & Wall Putty">Paints &amp; Wall Putty</option>
                    <option value="Boundary Wall & Fencing">Boundary Wall &amp; Fencing</option>
                    <option value="SS & Glass Railings">SS &amp; Glass Railings</option>
                    <option value="Kitchen & Bath Upgrades">Kitchen &amp; Bath Upgrades</option>
                    <option value="Custom Interiors & Panels">Custom Interiors &amp; Panels</option>
                    <option value="Shop (Dukan) Renovation">Shop (Dukan) Renovation</option>
                    <option value="Office Renovation">Office Renovation</option>
                    <option value="Plumbing & Bath">Plumbing &amp; Bath</option>
                    <option value="Electrical & Wiring">Electrical &amp; Wiring</option>
                    <option value="Civil & Cement">Civil &amp; Cement</option>
                    <option value="Tiles & Marble">Tiles &amp; Marble</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Model / Grade / Batch Code
                  </label>
                  <input
                    type="text"
                    value={materialForm.modelNumber}
                    onChange={(e) => setMaterialForm({ ...materialForm, modelNumber: e.target.value })}
                    placeholder="e.g. UT-OPC53-50KG"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Prices & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Material Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={materialForm.materialPriceINR}
                    onChange={(e) => setMaterialForm({ ...materialForm, materialPriceINR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fitting Labor Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={materialForm.fittingLaborChargeINR}
                    onChange={(e) => setMaterialForm({ ...materialForm, fittingLaborChargeINR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    placeholder="e.g. 50kg Bag / Sqft / MT"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Photo Selection / File Upload / URL Input */}
              <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    Material Photo &amp; Image Upload *
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400">Select file or click preset photo</span>
                </div>

                {/* Photo Preview & Custom URL */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-24 rounded-xl bg-slate-900 overflow-hidden border-2 border-amber-500/50 shrink-0 relative">
                    <img src={materialForm.imageUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-bold py-0.5">Preview</span>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2 items-center">
                      <label className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={materialForm.imageUrl}
                        onChange={(e) => setMaterialForm({ ...materialForm, imageUrl: e.target.value })}
                        placeholder="Or paste image HTTP URL..."
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold">Presets:</span>
                      {MATERIAL_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMaterialForm({ ...materialForm, imageUrl: preset.url })}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-200 dark:hover:bg-amber-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold shrink-0 transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Specifications & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Specifications (Specs)
                  </label>
                  <textarea
                    value={materialForm.specs}
                    onChange={(e) => setMaterialForm({ ...materialForm, specs: e.target.value })}
                    rows={3}
                    placeholder="Compressive strength, thickness, fire rating, waterproof properties..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Manufacturer Landing Web URL *
                  </label>
                  <input
                    type="url"
                    value={materialForm.officialWebsiteUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, officialWebsiteUrl: e.target.value })}
                    placeholder="https://www.ultratechcement.com/products/ultratech-super"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-teal-600 dark:text-teal-400"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Clicking material card or brand web page will land directly on this official website page smoothly!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Empanelled Supplier / Dukandar Name
                  </label>
                  <input
                    type="text"
                    value={materialForm.empanelledSupplier}
                    onChange={(e) => setMaterialForm({ ...materialForm, empanelledSupplier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Installer / Trade Specialist Role
                  </label>
                  <select
                    value={materialForm.plumberOrElectricianRole}
                    onChange={(e) => setMaterialForm({ ...materialForm, plumberOrElectricianRole: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Mason">Mason (Cement / Bricks / Tiles)</option>
                    <option value="Plumber">Plumber (Pipes &amp; Bathroom Fittings)</option>
                    <option value="Electrician">Electrician (Wires &amp; Switches)</option>
                    <option value="Painter">Painter (Paints &amp; Putty)</option>
                    <option value="Carpenter">Carpenter (Cabinets &amp; Doors)</option>
                    <option value="Sub-Contractor">Sub-Contractor (Railings &amp; Glass)</option>
                    <option value="General Vendor">General Vendor / Dukandar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMaterialId ? 'Save Updated Material' : 'Add Material to Catalog'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SMOOTH OFFICIAL BRAND WEBSITE LANDING MODAL WITH "← BACK TO APP" */}
      {activeLandingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-2 sm:p-6 fade-in">
          
          {/* Top Header Bar for Landing Preview */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xl shrink-0">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveLandingModal(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition transform active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Build Platform</span>
              </button>

              <div className="h-8 w-px bg-slate-700 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-extrabold border border-teal-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-teal-400" /> Official Manufacturer Landing Page
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{activeLandingModal.modelNumber}</span>
                </div>
                <h2 className="text-sm font-black text-white">{activeLandingModal.itemTitle} ({activeLandingModal.brandName})</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activeLandingModal.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-600"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Open in New Browser Tab</span>
              </a>

              <button
                onClick={() => setActiveLandingModal(null)}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Browser Address Bar Simulation & Main Content Area */}
          <div className="flex-1 my-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Address Bar */}
            <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>

              <div className="flex-1 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span className="truncate">{activeLandingModal.officialWebsiteUrl}</span>
              </div>
            </div>

            {/* Content Container (Iframe + Real-time Material Spec Drawer) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Iframe Website Viewer */}
              <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-950 h-full relative">
                <iframe
                  src={activeLandingModal.officialWebsiteUrl}
                  title={activeLandingModal.itemTitle}
                  className="w-full h-full border-0"
                />
              </div>

              {/* Material Spec Drawer Alongside */}
              <div className="lg:col-span-4 bg-slate-900 text-white p-6 border-l border-slate-800 overflow-y-auto space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
                    <img src={activeLandingModal.imageUrl} alt={activeLandingModal.itemTitle} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2.5 py-1 rounded-lg font-bold text-xs text-teal-300">
                      {activeLandingModal.brandName}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">{activeLandingModal.itemTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{activeLandingModal.specs}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Material Selling Rate:</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">₹{activeLandingModal.materialPriceINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Fitting Labor Charge:</span>
                      <span className="font-extrabold text-amber-400 font-mono">+ ₹{activeLandingModal.fittingLaborChargeINR.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700 flex justify-between items-center font-black text-teal-300 text-sm">
                      <span>Combined Package:</span>
                      <span>₹{(activeLandingModal.materialPriceINR + activeLandingModal.fittingLaborChargeINR).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-950/60 border border-teal-800 rounded-xl text-[11px] text-teal-200 space-y-1">
                    <p className="font-bold">✓ Smooth Returning Navigation Active:</p>
                    <p>You can browse the manufacturer page or click "← Back to Build Platform" above to return without losing any data!</p>
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => setActiveLandingModal(null)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" /> ← Return Back to Main App
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
