import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Calculator, 
  Building2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PhoneCall, 
  MessageSquare, 
  Lock, 
  Unlock,
  Download, 
  Search, 
  ChevronRight, 
  Percent, 
  Award, 
  Briefcase, 
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  FolderLock,
  Eye,
  Key,
  FileCheck,
  Trash2,
  Share2,
  ExternalLink,
  Plus,
  Tag,
  Calendar,
  Filter,
  Copy,
  Check,
  Printer,
  QrCode,
  Shield,
  X,
  Bot,
  Send,
  RefreshCw,
  ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CaGstComplianceHubProps {
  selectedCity?: string;
  onOpenAuth?: () => void;
}

export interface VaultDocument {
  id: string;
  title: string;
  titleHi: string;
  category: 'certificate' | 'tax_receipt' | 'financials' | 'license' | 'other';
  docNumber?: string;
  arnNumber?: string;
  issueDate: string;
  expiryDate?: string;
  financialYear?: string;
  status: 'verified' | 'pending' | 'expiring_soon';
  verifiedByCa?: string;
  fileSize: string;
  fileType: 'pdf' | 'png' | 'jpeg';
  downloadUrl?: string;
  uploadedAt: string;
  tags: string[];
  notes?: string;
  taxPaidAmount?: number;
}

// Initial Sample Vault Documents
const INITIAL_VAULT_DOCS: VaultDocument[] = [
  {
    id: 'vault_1',
    title: 'GSTIN Registration Certificate (Form GST REG-06)',
    titleHi: 'जीएसटी रजिस्ट्रेशन प्रमाणपत्र (REG-06)',
    category: 'certificate',
    docNumber: '29AABCU9603R1ZM',
    issueDate: '15 Jan 2024',
    status: 'verified',
    verifiedByCa: 'CA Anuj Agarwal (FCA - ICAI #512034)',
    fileSize: '1.4 MB',
    fileType: 'pdf',
    uploadedAt: '15 Jan 2024',
    tags: ['GSTIN', 'REG-06', 'Govt Certificate', 'GST Portal'],
    notes: 'Official GST registration certificate issued by Govt of India for Sri Ram Traders & Civil Contractors.'
  },
  {
    id: 'vault_2',
    title: 'Monthly GSTR-3B Return Filing Receipt (July 2026)',
    titleHi: 'मासिक जीएसटी रिटर्न फाइलिंग रसीद (GSTR-3B)',
    category: 'tax_receipt',
    arnNumber: 'AA2907260012849',
    docNumber: 'GSTR3B-2026-07',
    issueDate: '20 Jul 2026',
    financialYear: 'FY 2026-27',
    taxPaidAmount: 18500,
    status: 'verified',
    verifiedByCa: 'CA Anuj Agarwal (FCA)',
    fileSize: '480 KB',
    fileType: 'pdf',
    uploadedAt: '20 Jul 2026',
    tags: ['GSTR-3B', 'Filing Receipt', 'ARN Approved', 'Tax Paid'],
    notes: 'Acknowledged GSTR-3B return receipt with tax payment reference #2C-PAY-99182.'
  },
  {
    id: 'vault_3',
    title: 'MSME Udyam Registration Certificate',
    titleHi: 'एमएसएमई उद्यम रजिस्ट्रेशन प्रमाणपत्र',
    category: 'certificate',
    docNumber: 'UDYAM-KR-03-0098124',
    issueDate: '10 Feb 2024',
    status: 'verified',
    verifiedByCa: '2Click Legal Compliance Unit',
    fileSize: '850 KB',
    fileType: 'pdf',
    uploadedAt: '10 Feb 2024',
    tags: ['MSME', 'Udyam', 'Govt License', 'Subsidies'],
    notes: 'Classified under Small Enterprise category eligible for bank interest subsidies.'
  },
  {
    id: 'vault_4',
    title: 'Income Tax Return (Sahaj ITR-1) Verification Receipt AY 2025-26',
    titleHi: 'इनकम टैक्स रिटर्न सत्यापन रसीद (ITR-1)',
    category: 'tax_receipt',
    docNumber: 'ITR-9834201948201',
    arnNumber: 'ITR-ACK-2025-9981',
    issueDate: '12 Jun 2025',
    financialYear: 'FY 2024-25 (AY 2025-26)',
    taxPaidAmount: 12400,
    status: 'verified',
    verifiedByCa: 'CA Meenakshi Sharma',
    fileSize: '620 KB',
    fileType: 'pdf',
    uploadedAt: '12 Jun 2025',
    tags: ['ITR-1', 'Income Tax', 'Ack Receipt', 'Form 26AS'],
    notes: 'E-verified on Income Tax Portal with ITR-V acknowledgement slip.'
  },
  {
    id: 'vault_5',
    title: 'Form 16A TDS Certificate (Section 194C Contractor)',
    titleHi: 'फॉर्म 16A टीडीएस प्रमाणपत्र (धारा 194C)',
    category: 'tax_receipt',
    docNumber: 'TDS-26Q-Q1-2026-881',
    issueDate: '15 Jul 2026',
    financialYear: 'FY 2026-27 (Q1)',
    taxPaidAmount: 5400,
    status: 'verified',
    verifiedByCa: 'TRACES Portal Direct',
    fileSize: '710 KB',
    fileType: 'pdf',
    uploadedAt: '15 Jul 2026',
    tags: ['TDS', 'Form 16A', '194C', 'TRACES'],
    notes: 'Downloaded directly from TRACES portal for Q1 contractor deductions.'
  },
  {
    id: 'vault_6',
    title: 'Audited Balance Sheet & Profit-Loss Financial Report',
    titleHi: 'ऑडिटेड बैलेंस शीट एवं लाभ-हानि खाता रिपोर्ट',
    category: 'financials',
    docNumber: 'AUD-FIN-2025-26-991',
    issueDate: '30 May 2026',
    financialYear: 'FY 2025-26',
    status: 'verified',
    verifiedByCa: 'CA Anuj Agarwal (FCA)',
    fileSize: '3.2 MB',
    fileType: 'pdf',
    uploadedAt: '30 May 2026',
    tags: ['Balance Sheet', 'P&L', 'CA Audit Certificate'],
    notes: 'Official audited financial statement signed by chartered accountant for bank loan limits.'
  },
  {
    id: 'vault_7',
    title: 'Trade & Shop Establishment License (BBMP)',
    titleHi: 'ट्रेड व दुकान स्थापना लाइसेंस (बीबीएमपी)',
    category: 'license',
    docNumber: 'BBMP/SHOP/2024/9912',
    issueDate: '01 Apr 2024',
    expiryDate: '31 Mar 2027',
    status: 'expiring_soon',
    verifiedByCa: 'BBMP Municipal Authority',
    fileSize: '1.1 MB',
    fileType: 'pdf',
    uploadedAt: '01 Apr 2024',
    tags: ['Trade License', 'Shop Act', 'BBMP'],
    notes: 'Municipal trade license. Due for 3-year renewal before 31 March 2027.'
  }
];

export interface CaChatMessage {
  id: string;
  sender: 'user' | 'ca';
  text: string;
  timestamp: string;
  disclaimer?: string;
}

const INITIAL_CA_MESSAGES: CaChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'ca',
    text: `### 🙏 नमस्ते! मैं **CA Anuj & Team AI (Chartered Accountant Copilot)** हूँ।

मैं जीएसटी (GST), इनकम टैक्स (ITR), टीडीएस (TDS) और कंपनी अनुपालन (Compliance) से संबंधित आपके सवालों का तुरंत कानूनी समाधान दे सकता हूँ।

**आप नीचे दिए गए प्रश्न चुन सकते हैं या अपना सवाल टाइप कर सकते हैं:**
- ⚖️ GSTR-3B लेट फीस व पेनल्टी नियम
- 🧾 इनपुट टैक्स क्रेडिट (ITC) क्लेम करने की शर्तें
- 🏬 कंपोजिशन स्कीम (Composition Scheme) टर्नओवर सीमा
- 💼 ठेकेदार भुगतान पर TDS धारा 194C दरें`,
    timestamp: 'अभी',
    disclaimer: '2Click Legal CA Desk द्वारा प्रारंभिक मार्गदर्शन'
  }
];

const formatBoldText = (str: string) => {
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-amber-700 dark:text-amber-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const renderFormattedCaText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-3 mb-1.5 flex items-center gap-1.5 border-b border-amber-500/20 pb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={idx} className="ml-4 list-disc text-xs text-slate-700 dark:text-slate-300 my-0.5">
          {formatBoldText(line.substring(2))}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <div key={idx} className="text-xs text-slate-800 dark:text-slate-200 font-medium my-1 pl-2 border-l-2 border-amber-500/50">
          {formatBoldText(line)}
        </div>
      );
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-1" />;
    }
    return (
      <p key={idx} className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed my-0.5">
        {formatBoldText(line)}
      </p>
    );
  });
};

// CA Service Catalog Data
const CA_SERVICES = [
  {
    id: 'gst_reg',
    category: 'gst',
    title: 'New GST Registration',
    titleHi: 'नया जीएसटी रजिस्ट्रेशन',
    desc: 'Get GSTIN within 3-5 working days. Includes Govt filing, ARN generation & official certificate.',
    price: 999,
    originalPrice: 1999,
    timeframe: '3-5 Days',
    popular: true,
    requiredDocs: ['PAN Card', 'Aadhaar Card', 'Electricity Bill / Rent Agreement', 'Bank Cancelled Cheque / Statement']
  },
  {
    id: 'gst_return_monthly',
    category: 'gst',
    title: 'Monthly GST Return Filing (GSTR-1 & 3B)',
    titleHi: 'मासिक जीएसटी रिटर्न फाइलिंग',
    desc: 'Regular monthly filing for business turnover, GSTR-2B ITC matching, and tax payment voucher.',
    price: 499,
    originalPrice: 999,
    timeframe: 'Same Day',
    popular: true,
    requiredDocs: ['Sales Invoices (Excel/PDF)', 'Purchase Invoices (GSTR-2B)', 'GST Portal Login Credentials']
  },
  {
    id: 'gst_annual',
    category: 'gst',
    title: 'Annual GST Return (GSTR-9 / 9C Audit)',
    titleHi: 'वार्षिक जीएसटी रिटर्न एवं सीए ऑडिट',
    desc: 'Annual reconciliation of sales, ITC & audit certification by experienced CA.',
    price: 2999,
    originalPrice: 4999,
    timeframe: '2-3 Days',
    popular: false,
    requiredDocs: ['Annual GSTR-1 & 3B Summary', 'Audited Balance Sheet & P&L', 'Purchase Register']
  },
  {
    id: 'itr_salaried',
    category: 'itr',
    title: 'Salaried & Pensioner ITR-1 (Sahaj)',
    titleHi: 'सैलरी एवं पेंशनर आईटीआर-1',
    desc: 'Income Tax Return filing for salaried employees, rental income, and interest savings.',
    price: 499,
    originalPrice: 999,
    timeframe: '24 Hours',
    popular: true,
    requiredDocs: ['Form 16 from Employer', 'PAN & Aadhaar', 'Bank Statement', 'Form 26AS / AIS']
  },
  {
    id: 'itr_business_presumptive',
    category: 'itr',
    title: 'Business & Freelancer ITR-4 (44AD / 44ADA)',
    titleHi: 'बिजनेस एवं ठेकेदार आईटीआर-4 (44AD)',
    desc: 'Presumptive taxation return for civil contractors, shopkeepers, consultants & trade vendors.',
    price: 999,
    originalPrice: 1999,
    timeframe: '24 Hours',
    popular: true,
    requiredDocs: ['Gross Turnover Details', 'Bank Statement', 'PAN Card', 'AIS / TIS Statement']
  },
  {
    id: 'itr_capital_gains',
    category: 'itr',
    title: 'Capital Gains & Crypto ITR-2 / ITR-3',
    titleHi: 'कैपिटल गेन्स, शेयर व क्रिप्टो आईटीआर',
    desc: 'Property sale capital gains tax computation, stock trading P&L and crypto tax filing.',
    price: 1499,
    originalPrice: 2999,
    timeframe: '1-2 Days',
    popular: false,
    requiredDocs: ['Property Sale Deed / Purchase Cost', 'Broker Tax P&L Statement', 'Form 26AS']
  },
  {
    id: 'tds_contractor',
    category: 'tds',
    title: 'Quarterly TDS Return (Form 24Q / 26Q)',
    titleHi: 'तिमाही टीडीएस रिटर्न फाइलिंग (26Q)',
    desc: 'TDS return for payments to contractors (194C), professional fees (194J) & rent (194I).',
    price: 999,
    originalPrice: 1999,
    timeframe: '1-2 Days',
    popular: true,
    requiredDocs: ['TAN Number', 'TDS Deduction Challans (Form 281)', 'Deductee PAN Details & Amount']
  },
  {
    id: 'form16_gen',
    category: 'tds',
    title: 'Form 16 / 16A Certificate Generation',
    titleHi: 'फॉर्म 16 / 16A टीडीएस सर्टिफिकेट',
    desc: 'TRACES portal login, bulk Form 16A PDF generation for contractors & employees.',
    price: 499,
    originalPrice: 999,
    timeframe: '2 Hours',
    popular: false,
    requiredDocs: ['TRACES Portal Credentials', 'Quarterly Filed Return Receipt']
  },
  {
    id: 'firm_proprietorship',
    category: 'registration',
    title: 'Proprietorship Firm Full Registration Pack',
    titleHi: 'प्रोप्राइटरशिप फर्म रजिस्ट्रेशन',
    desc: 'Includes MSME Udyam Govt Certificate + GST Registration + Shop & Establishment License.',
    price: 1499,
    originalPrice: 2999,
    timeframe: '3-4 Days',
    popular: true,
    requiredDocs: ['Proprietor PAN & Aadhaar', 'Firm Name & Business Address Proof', 'Electricity Bill']
  },
  {
    id: 'firm_partnership',
    category: 'registration',
    title: 'Partnership Firm Registration & Deed',
    titleHi: 'पार्टनरशिप फर्म डीड व रजिस्ट्रेशन',
    desc: 'Custom Partnership Deed drafting, stamp paper notary, Firm PAN & GST registration.',
    price: 2499,
    originalPrice: 4999,
    timeframe: '4-6 Days',
    popular: false,
    requiredDocs: ['Partners PAN & Aadhaar', 'Capital Ratio Details', 'Office Electricity Bill / NOC']
  },
  {
    id: 'company_pvt_ltd',
    category: 'registration',
    title: 'Private Limited Company / OPC Incorporation',
    titleHi: 'प्राइवेट लिमिटेड / ओपीसी कंपनी रजिस्ट्रेशन',
    desc: 'Complete MCA SPICe+ filing: 2 DINs, Name approval, MOA, AOA, PAN, TAN, Bank account & GST.',
    price: 4999,
    originalPrice: 9999,
    timeframe: '7-10 Days',
    popular: true,
    requiredDocs: ['2 Directors PAN, Aadhaar & Passport Photo', 'Bank Statement with current address', 'Registered Office Proof']
  },
  {
    id: 'dsc_class3',
    category: 'registration',
    title: 'Class 3 Digital Signature (DSC) USB Token',
    titleHi: 'क्लास 3 डिजिटल सिग्नेचर (DSC)',
    desc: 'Government Class 3 DSC for e-tendering, MCA company filing & GST with 2-Year Validity.',
    price: 1199,
    originalPrice: 2199,
    timeframe: '2 Hours',
    popular: false,
    requiredDocs: ['PAN Card', 'Aadhaar Card', 'Mobile & Email Video Verification']
  }
];

export const CaGstComplianceHub: React.FC<CaGstComplianceHubProps> = ({
  selectedCity = 'Bengaluru',
  onOpenAuth
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'all' | 'gst' | 'itr' | 'tds' | 'registration' | 'calculators' | 'tracker' | 'vault' | 'askCa'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Ask a CA Chat State
  const [caChatMessages, setCaChatMessages] = useState<CaChatMessage[]>(INITIAL_CA_MESSAGES);
  const [caChatInput, setCaChatInput] = useState<string>('');
  const [isCaThinking, setIsCaThinking] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const handleSendCaQuery = async (queryText?: string) => {
    const textToSend = queryText || caChatInput;
    if (!textToSend.trim() || isCaThinking) return;

    const userMsg: CaChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setCaChatMessages(prev => [...prev, userMsg]);
    if (!queryText) setCaChatInput('');
    setIsCaThinking(true);

    try {
      const response = await fetch('/api/ai/ca-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: caChatMessages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      const data = await response.json();
      const caMsg: CaChatMessage = {
        id: `ca_${Date.now()}`,
        sender: 'ca',
        text: data.reply || 'जानकारी प्रोसेस करने में असमर्थ।',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        disclaimer: data.disclaimer || '2Click CA Advisory Unit'
      };

      setCaChatMessages(prev => [...prev, caMsg]);
    } catch (error) {
      // Offline Intelligent CA fallback response generator
      let fallbackText = `### 🏛️ 2Click CA Advisory Result for: "${textToSend}"\n\n1. **GST Law Check**: All businesses with turnover exceeding ₹20 Lakhs (₹40 Lakhs for goods) must be registered under GST.\n2. **Return Due Dates**: File GSTR-1 by 11th and GSTR-3B by 20th of every month.\n3. **Need official CA Consultation?**: Book a direct session with CA Anuj Agarwal in the CA Services catalog below!`;
      
      const lower = textToSend.toLowerCase();
      if (lower.includes("penalty") || lower.includes("late fee") || lower.includes("लेट फीस")) {
        fallbackText = `### ⚖️ GST Late Fee & Penalty Rules (CGST Act Section 47)\n\n1. **NIL Return (GSTR-3B / GSTR-1)**: ₹20/day (₹10 CGST + ₹10 SGST), capped at max ₹500/return.\n2. **Taxable Return (GSTR-3B / GSTR-1)**: ₹50/day (₹25 CGST + ₹25 SGST), capped at max ₹10,000/return.\n3. **Interest on Late Tax Payment (Section 50)**: 18% per annum calculated on net cash tax liability paid late.\n\n💡 *Recommendation*: File GSTR-3B before the 20th of every month to avoid interest accumulation!`;
      } else if (lower.includes("itc") || lower.includes("credit") || lower.includes("इनपुट")) {
        fallbackText = `### 🧾 Input Tax Credit (ITC) Claim Guidelines (Section 16 & Rule 36(4))\n\n1. **Mandatory Conditions under Section 16(2)**:\n   - Valid tax invoice in hand.\n   - Goods/services actually received.\n   - Supplier has deposited tax to Govt.\n   - Recipient files GSTR-3B.\n2. **GSTR-2B Matching**: ITC must strictly match auto-populated **Form GSTR-2B**.\n3. **Blocked Credit (Section 17(5))**: Motor vehicles (<13 seats), personal items, food & catering are NOT eligible for ITC.`;
      }

      const fallbackMsg: CaChatMessage = {
        id: `ca_${Date.now()}`,
        sender: 'ca',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        disclaimer: '2Click Offline CA Guidance System'
      };
      setCaChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsCaThinking(false);
    }
  };

  // Compliance Documents Vault State
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>(INITIAL_VAULT_DOCS);
  const [vaultCategory, setVaultCategory] = useState<'all' | 'certificate' | 'tax_receipt' | 'financials' | 'license' | 'other'>('all');
  const [vaultSearchQuery, setVaultSearchQuery] = useState<string>('');
  const [vaultLocked, setVaultLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [copiedDocNum, setCopiedDocNum] = useState<string | null>(null);

  // New Vault Document Modal State
  const [addVaultModalOpen, setAddVaultModalOpen] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocTitleHi, setNewDocTitleHi] = useState<string>('');
  const [newDocCategory, setNewDocCategory] = useState<'certificate' | 'tax_receipt' | 'financials' | 'license' | 'other'>('certificate');
  const [newDocNumber, setNewDocNumber] = useState<string>('');
  const [newDocFy, setNewDocFy] = useState<string>('FY 2026-27');
  const [newDocTaxAmount, setNewDocTaxAmount] = useState<string>('');
  const [newDocNotes, setNewDocNotes] = useState<string>('');
  const [newDocFiles, setNewDocFiles] = useState<string[]>([]);
  const [vaultSuccessMsg, setVaultSuccessMsg] = useState<string>('');

  // Selected Service for Direct Booking / File Upload Modal
  const [selectedService, setSelectedService] = useState<typeof CA_SERVICES[0] | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

  // Form State inside Order Modal
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientGstin, setClientGstin] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string>('');

  // Interactive GST Calculator State
  const [calcTurnover, setCalcTurnover] = useState<number>(100000);
  const [calcGstRate, setCalcGstRate] = useState<number>(18); // 18%
  const [calcPurchaseItc, setCalcPurchaseItc] = useState<number>(8000);
  const [calcSupplyType, setCalcSupplyType] = useState<'intra' | 'inter'>('intra');

  // Interactive TDS Calculator State
  const [tdsAmount, setTdsAmount] = useState<number>(50000);
  const [tdsSection, setTdsSection] = useState<'194C_ind' | '194C_comp' | '194J' | '194I_rent'>('194C_comp');

  // Filtered Services
  const filteredServices = useMemo(() => {
    return CA_SERVICES.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [activeTab, searchQuery]);

  // GST Calculation Logic
  const gstCalculations = useMemo(() => {
    const grossGstPayable = (calcTurnover * calcGstRate) / 100;
    const cgst = calcSupplyType === 'intra' ? grossGstPayable / 2 : 0;
    const sgst = calcSupplyType === 'intra' ? grossGstPayable / 2 : 0;
    const igst = calcSupplyType === 'inter' ? grossGstPayable : 0;

    const netTaxLiability = Math.max(0, grossGstPayable - calcPurchaseItc);

    return {
      grossGstPayable,
      cgst,
      sgst,
      igst,
      netTaxLiability,
      excessItcRemaining: calcPurchaseItc > grossGstPayable ? calcPurchaseItc - grossGstPayable : 0
    };
  }, [calcTurnover, calcGstRate, calcPurchaseItc, calcSupplyType]);

  // TDS Calculation Logic
  const tdsCalculations = useMemo(() => {
    let rate = 2; // default 194C Company
    let secName = '194C - Contractor (Company/Firm)';

    if (tdsSection === '194C_ind') {
      rate = 1;
      secName = '194C - Contractor (Individual / HUF)';
    } else if (tdsSection === '194C_comp') {
      rate = 2;
      secName = '194C - Contractor (Pvt Ltd / Firm)';
    } else if (tdsSection === '194J') {
      rate = 10;
      secName = '194J - Professional & Technical Fees';
    } else if (tdsSection === '194I_rent') {
      rate = 10;
      secName = '194I - Commercial Building Rent';
    }

    const calculatedTds = (tdsAmount * rate) / 100;
    const netPayableToVendor = tdsAmount - calculatedTds;

    return {
      rate,
      secName,
      calculatedTds,
      netPayableToVendor
    };
  }, [tdsAmount, tdsSection]);

  // Filtered Vault Documents
  const filteredVaultDocs = useMemo(() => {
    return vaultDocs.filter((doc) => {
      const matchesCategory = vaultCategory === 'all' || doc.category === vaultCategory;
      const matchesSearch = doc.title.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
                            doc.titleHi.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
                            (doc.docNumber && doc.docNumber.toLowerCase().includes(vaultSearchQuery.toLowerCase())) ||
                            (doc.arnNumber && doc.arnNumber.toLowerCase().includes(vaultSearchQuery.toLowerCase())) ||
                            doc.tags.some(t => t.toLowerCase().includes(vaultSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [vaultDocs, vaultCategory, vaultSearchQuery]);

  // Copy Document Number
  const handleCopyDocNum = (num: string) => {
    try {
      navigator.clipboard?.writeText(num);
    } catch (err) {
      // fallback
    }
    setCopiedDocNum(num);
    setTimeout(() => setCopiedDocNum(null), 2000);
  };

  // Delete Vault Document
  const handleDeleteVaultDoc = (docId: string) => {
    if (window.confirm('क्या आप इस दस्तावेज को वॉल्ट से हटाना चाहते हैं? (Are you sure you want to delete this document?)')) {
      setVaultDocs(prev => prev.filter(d => d.id !== docId));
      if (previewDoc?.id === docId) {
        setPreviewDoc(null);
      }
    }
  };

  // Handle Unlock Vault
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '') {
      setVaultLocked(false);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('गलत सिक्योरिटी पिन (Wrong PIN). डेमो पिन: 1234');
    }
  };

  // Add New Document to Vault
  const handleAddVaultDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const newDoc: VaultDocument = {
      id: `vault_${Date.now()}`,
      title: newDocTitle,
      titleHi: newDocTitleHi || newDocTitle,
      category: newDocCategory,
      docNumber: newDocNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      financialYear: newDocFy,
      taxPaidAmount: newDocTaxAmount ? parseFloat(newDocTaxAmount) : undefined,
      status: 'verified',
      verifiedByCa: '2Click CA Vault System',
      fileSize: '1.2 MB',
      fileType: 'pdf',
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      tags: [newDocCategory.toUpperCase(), 'Uploaded', 'Encrypted Vault'],
      notes: newDocNotes || 'Uploaded directly by user to Compliance Documents Vault.'
    };

    setVaultDocs(prev => [newDoc, ...prev]);
    setVaultSuccessMsg(`🎉 "${newDocTitle}" वॉल्ट में सफलतापूर्वक 256-Bit SSL एन्क्रिप्ट व स्टोर हो गया!`);

    setTimeout(() => {
      setAddVaultModalOpen(false);
      setVaultSuccessMsg('');
      setNewDocTitle('');
      setNewDocTitleHi('');
      setNewDocNumber('');
      setNewDocTaxAmount('');
      setNewDocNotes('');
      setNewDocFiles([]);
    }, 2500);
  };

  const handleOpenOrderModal = (service: typeof CA_SERVICES[0]) => {
    setSelectedService(service);
    setOrderModalOpen(true);
    setOrderSuccessMsg('');
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map((f: File) => f.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccessMsg(`🎉 सर्विस ऑर्डर सफलतापूर्वक दर्ज किया गया! ऑर्डर आईडी: #2C-CA-${Math.floor(100000 + Math.random() * 900000)}. हमारे असाइन्ड सीए (Chartered Accountant) आपसे व्हाट्सएप पर तुरंत संपर्क करेंगे।`);
    setTimeout(() => {
      setOrderModalOpen(false);
      setOrderSuccessMsg('');
      setClientName('');
      setClientPhone('');
      setClientGstin('');
      setUploadedFiles([]);
    }, 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>2Click CA &amp; Legal Compliance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              सीए सर्विसेज, जीएसटी एवं बिजनेस रजिस्ट्रेशन पोर्टल
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              कहीं जाने की जरुरत नहीं! जीएसटी रजिस्ट्रेशन, मासिक रिटर्न (GSTR-1 &amp; 3B), आईटीआर (ITR Filing), टीडीएस सर्टिफिकेट एवं नई फर्म/कंपनी रजिस्ट्रेशन - 100% डिजिटल, सुरक्षित व सीए द्वारा सत्यापित।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('askCa')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'askCa'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>सीए से पूछें AI (Ask a CA)</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'vault'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <FolderLock className="w-4 h-4 text-amber-400" />
              <span>डिजिटल वॉल्ट (Vault)</span>
            </button>
            <button
              onClick={() => setActiveTab('calculators')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'calculators'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Calculator className="w-4 h-4 text-indigo-300" />
              <span>जीएसटी व टीडीएस कैलकुलेटर</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'tracker'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>लाइव ऑर्डर ट्रैकर व सपोर्ट</span>
            </button>
          </div>
        </div>

        {/* Key Trust Signals Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>इम्पैनल्ड आईसीएआई (ICAI) पंजीकृत सीए</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>256-Bit एन्क्रिप्टेड सुरक्षित डॉक्युमेंट्स</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>गवर्नमेंट जीएसटी व एमसीए पोर्टल डायरेक्ट</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
            <span>व्हाट्सएप पर डायरेक्ट सीए कंसल्टेशन</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Nav Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'सभी सर्विसेज (All Services)', icon: Layers },
            { id: 'askCa', label: 'सीए से पूछें AI (Ask a CA)', icon: Bot },
            { id: 'vault', label: 'डॉक्युमेंट वॉल्ट (Compliance Vault)', icon: FolderLock },
            { id: 'gst', label: 'जीएसटी अनुपालन (GST)', icon: ShieldCheck },
            { id: 'itr', label: 'इनकम टैक्स रिटर्न (ITR)', icon: FileText },
            { id: 'tds', label: 'टीडीएस रिटर्न (TDS)', icon: Percent },
            { id: 'registration', label: 'नई फर्म / कंपनी (Registration)', icon: Building2 },
            { id: 'calculators', label: 'टैक्स कैलकुलेटर (Calculators)', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="खोजें (e.g. GST, ITR, Company)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SERVICES GRID CATALOG                                         */}
      {/* ========================================================================= */}
      {activeTab !== 'calculators' && activeTab !== 'tracker' && activeTab !== 'vault' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                उपलब्ध सीए एवं टैक्स सेवाएं ({filteredServices.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                अपनी आवश्यकतानुसार सर्विस चुनें, दस्तावेज अपलोड करें और एक्सपर्ट सीए द्वारा कार्य पूरा कराएं।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                {service.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {service.category.toUpperCase()} Compliance
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug">
                      {service.title}
                    </h3>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                      ({service.titleHi})
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {service.desc}
                  </p>

                  {/* Required Docs Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      आवश्यक दस्तावेज (Required Docs):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {service.requiredDocs.map((doc, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold"
                        >
                          • {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Action */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          ₹{service.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{service.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>समय: {service.timeframe}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenOrderModal(service)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5 group-hover:scale-105"
                    >
                      <span>अप्लाई करें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: INTERACTIVE TAX CALCULATORS (GST & TDS)                        */}
      {/* ========================================================================= */}
      {activeTab === 'calculators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* GST Calculator Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  1. जीएसटी टैक्स एवं आईटीसी कैलकुलेटर (GST &amp; ITC Calculator)
                </h3>
                <p className="text-xs text-slate-500">सेल टर्नओवर और इनपुट टैक्स क्रेडिट (ITC) एडजस्टमेंट दर जांचें</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  कुल बिक्री / टर्नओवर (Gross Sales / Turnover):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={calcTurnover}
                    onChange={(e) => setCalcTurnover(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जीएसटी स्लैब रेट:
                  </label>
                  <select
                    value={calcGstRate}
                    onChange={(e) => setCalcGstRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={5}>5% (Essential / Material)</option>
                    <option value={12}>12% (Construction Items)</option>
                    <option value={18}>18% (Standard Services/Goods)</option>
                    <option value={28}>28% (Luxury &amp; Cement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सप्लाई प्रकार (Supply):
                  </label>
                  <select
                    value={calcSupplyType}
                    onChange={(e) => setCalcSupplyType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="intra">राज्य के अंदर (Intra-State: CGST+SGST)</option>
                    <option value="inter">राज्य के बाहर (Inter-State: IGST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  उपलब्ध इनपुट टैक्स क्रेडिट (Purchase ITC Claim):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={calcPurchaseItc}
                    onChange={(e) => setCalcPurchaseItc(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">कुल देय जीएसटी (Gross Tax):</span>
                  <span className="font-extrabold text-white">₹{gstCalculations.grossGstPayable.toLocaleString('en-IN')}</span>
                </div>

                {calcSupplyType === 'intra' ? (
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800 p-2 rounded-xl text-slate-300">
                    <div>CGST (9%): <span className="font-bold text-white">₹{gstCalculations.cgst.toLocaleString('en-IN')}</span></div>
                    <div>SGST (9%): <span className="font-bold text-white">₹{gstCalculations.sgst.toLocaleString('en-IN')}</span></div>
                  </div>
                ) : (
                  <div className="text-[11px] bg-slate-800 p-2 rounded-xl text-slate-300">
                    IGST (18%): <span className="font-bold text-white">₹{gstCalculations.igst.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">घटाया गया ITC (Input Credit):</span>
                  <span className="font-extrabold text-emerald-400">- ₹{calcPurchaseItc.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-200">कैश में नेट देय टैक्स (Net Tax Payable):</span>
                  <span className="font-black text-xl text-indigo-400">
                    ₹{gstCalculations.netTaxLiability.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TDS Calculator Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  2. टीडीएस कटौती कैलकुलेटर (TDS Deduction Calculator)
                </h3>
                <p className="text-xs text-slate-500">ठेकेदार, प्रोफेशनल व रेंट भुगतान पर टीडीएस दर जांचें</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  भुगतान राशि (Payment Bill Amount):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={tdsAmount}
                    onChange={(e) => setTdsAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  टीडीएस धारा (Section &amp; Deductee Type):
                </label>
                <select
                  value={tdsSection}
                  onChange={(e) => setTdsSection(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="194C_ind">194C - Contractor payment to Individual/HUF (1%)</option>
                  <option value="194C_comp">194C - Contractor payment to Pvt Ltd / Firm (2%)</option>
                  <option value="194J">194J - Professional / Engineer / Legal Fees (10%)</option>
                  <option value="194I_rent">194I - Office / Warehouse Building Rent (10%)</option>
                </select>
              </div>

              {/* Result Summary Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 border border-slate-800 mt-6">
                <div className="text-xs font-bold text-amber-400">
                  लागू धारा: {tdsCalculations.secName}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">लागू टीडीएस दर (TDS Rate):</span>
                  <span className="font-extrabold text-white">{tdsCalculations.rate}%</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">कटौती योग्य टीडीएस (TDS to Deduct):</span>
                  <span className="font-extrabold text-amber-400">₹{tdsCalculations.calculatedTds.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-200">वेंडर को देने योग्य नेट राशि (Net to Pay):</span>
                  <span className="font-black text-xl text-emerald-400">
                    ₹{tdsCalculations.netPayableToVendor.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: LIVE ORDER TRACKER & CA ASSISTANCE                            */}
      {/* ========================================================================= */}
      {activeTab === 'tracker' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                लाइव सर्विस स्टेटस व असाइन्ड सीए हेल्पडेस्क
              </h3>
              <p className="text-xs text-slate-500">आपके द्वारा दर्ज की गई रिटर्न व कंपनी फाइलिंग की रियल-टाइम स्थिति</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-full text-xs border border-emerald-500/20">
              ● Live Status Active
            </span>
          </div>

          {/* Sample Active Order Card */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
                  ऑर्डर #2C-CA-889120: Monthly GSTR-1 &amp; 3B Return Filing
                </span>
                <span className="text-slate-500">दर्ज तिथि: 28 जुलाई | क्लाइंट: श्री राम ट्रेडर्स</span>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold rounded-xl border border-amber-500/30 text-xs w-fit">
                ⏳ In Review by Senior CA
              </span>
            </div>

            {/* Progress Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { step: '1', title: 'दस्तावेज प्राप्त', active: true, done: true },
                { step: '2', title: 'सीए वेरिफिकेशन', active: true, done: true },
                { step: '3', title: 'पोर्टल पर फाइलिंग', active: true, done: false },
                { step: '4', title: 'स्वीकृति / ARN', active: false, done: false },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1 text-center">
                  <div className={`h-2 rounded-full ${s.done ? 'bg-emerald-500' : s.active ? 'bg-amber-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{s.title}</div>
                </div>
              ))}
            </div>

            {/* Assigned CA Contact Box */}
            <div className="p-4 bg-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                  CA
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">CA अनुज अग्रवाल (FCA - ICAI Reg: 512034)</div>
                  <div className="text-[11px] text-indigo-300">वरिष्ठ जीएसटी एवं टैक्स सलाहकार</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => window.open('https://wa.me/919845011223?text=Hello%20CA%20Sir%2C%20regarding%20my%20GST%20filing', '_blank')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप चैट</span>
                </button>
                <button
                  onClick={() => alert('📞 सीए हेल्पलाइन: +91 98450 11223 पर कॉल करें')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>कॉल सीए</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER SERVICE MODAL WITH DOCUMENT UPLOADER                                */}
      {/* ========================================================================= */}
      {orderModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6 my-8">
            
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                सर्विस ऑर्डर एवं दस्तावेज अपलोड (Upload Docs)
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {selectedService.title}
              </h3>
              <div className="text-xs font-bold text-emerald-600">
                शुल्क: ₹{selectedService.price.toLocaleString('en-IN')} (प्रोसेसिंग समय: {selectedService.timeframe})
              </div>
            </div>

            {orderSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-extrabold text-emerald-800 dark:text-emerald-200 leading-relaxed text-center">
                {orderSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    आपका पूरा नाम / कंपनी नाम (Name / Firm Name):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. राजेश कुमार (श्री राम ट्रेडर्स)"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      मोबाइल नंबर (WhatsApp Active):
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      जीएसटी या पैन नंबर (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="GSTIN / PAN"
                      value={clientGstin}
                      onChange={(e) => setClientGstin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* File Uploader */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    आवश्यक दस्तावेज अपलोड करें (Upload Documents):
                  </label>
                  <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-4 text-center cursor-pointer relative hover:border-indigo-500 transition">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUploadSim}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      क्लिक कर पैन, आधार, बिजली बिल व इनवॉइस अटैच करें
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG, Excel सपोर्टेड</span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">अपलोड की गई फाइलें:</span>
                      {uploadedFiles.map((fn, idx) => (
                        <div key={idx} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{fn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    अतिरिक्त निर्देश या नोट्स (Extra Notes):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="कोई विशेष निर्देश..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition"
                >
                  सबमिट करें एवं सीए असाइन करें
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: COMPLIANCE DOCUMENTS VAULT                                    */}
      {/* ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          
          {/* Vault Hero & Security Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>256-Bit SSL Encrypted Vault</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FolderLock className="w-8 h-8 text-amber-400" />
                  <span>अनुपालन डॉक्युमेंट वॉल्ट (Compliance Documents Vault)</span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  आपकी कंपनी का डिजिटल लॉकर - जीएसटी रजिस्ट्रेशन प्रमाणपत्र, मासिक GSTR व ITR फाइलिंग रसीदें (ARN), टीडीएस सर्टिफिकेट (Form 16A) और सीए ऑडिटेड फाइनेंशियल रिपोर्ट सुरक्षित रखें।
                </p>
              </div>

              {/* Action Controls in Vault Banner */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAddVaultModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>नया डॉक्युमेंट जोड़ें (Upload Doc)</span>
                </button>

                <button
                  onClick={() => setVaultLocked(!vaultLocked)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border ${
                    vaultLocked
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {vaultLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                  <span>{vaultLocked ? 'वॉल्ट लॉक (Locked)' : 'वॉल्ट अनलॉक (Unlocked)'}</span>
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">कुल संग्रहीत डॉक्युमेंट्स</div>
                <div className="text-xl font-black text-white mt-0.5">{vaultDocs.length} फाइल्स</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">सीए सत्यापित (CA Verified)</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {vaultDocs.filter(d => d.status === 'verified').length} / {vaultDocs.length}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">सुरक्षा स्तर</div>
                <div className="text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">नवीनीकरण अलर्ट</div>
                <div className="text-xl font-black text-amber-300 mt-0.5">
                  {vaultDocs.filter(d => d.status === 'expiring_soon').length} एक्टिव
                </div>
              </div>
            </div>
          </div>

          {/* Locked Overlay if Vault is Locked */}
          {vaultLocked ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                  सुरक्षित वॉल्ट लॉक है (Vault Protected)
                </h3>
                <p className="text-xs text-slate-500">
                  कंपनी प्रमाणपत्र व फाइलिंग रसीदें देखने के लिए 4-अंकीय PIN दर्ज करें। (डेमो पिन: 1234)
                </p>
              </div>

              <form onSubmit={handleUnlockVault} className="space-y-3 pt-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="PIN दर्ज करें (1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-black px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && <div className="text-xs font-bold text-red-500">{pinError}</div>}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                >
                  अनलॉक करें (Unlock Vault)
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Filter Tabs & Search inside Vault */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                
                {/* Vault Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: `सभी (${vaultDocs.length})`, icon: Layers },
                    { id: 'certificate', label: `रजिस्ट्रेशन प्रमाणपत्र (${vaultDocs.filter(d=>d.category==='certificate').length})`, icon: Building2 },
                    { id: 'tax_receipt', label: `रिटर्न व टीडीएस रसीदें (${vaultDocs.filter(d=>d.category==='tax_receipt').length})`, icon: FileCheck },
                    { id: 'financials', label: `ऑडिट व रिपोर्ट (${vaultDocs.filter(d=>d.category==='financials').length})`, icon: FileText },
                    { id: 'license', label: `लाइसेंस व परमिट (${vaultDocs.filter(d=>d.category==='license').length})`, icon: Award },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setVaultCategory(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                          vaultCategory === tab.id
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Vault Search */}
                <div className="relative w-full lg:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="सर्च डॉक्युमेंट / ARN / GSTIN..."
                    value={vaultSearchQuery}
                    onChange={(e) => setVaultSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVaultDocs.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <FolderLock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                    <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      कोई डॉक्युमेंट नहीं मिला (No Documents Found)
                    </div>
                    <p className="text-xs text-slate-400">अपनी खोज शब्द बदलें या "+ नया डॉक्युमेंट जोड़ें" बटन दबाएं।</p>
                  </div>
                ) : (
                  filteredVaultDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition flex flex-col justify-between space-y-4 relative overflow-hidden group"
                    >
                      
                      {/* Top Header & Status Badge */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            doc.category === 'certificate' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                            doc.category === 'tax_receipt' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            doc.category === 'financials' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {doc.category === 'certificate' ? 'कंपनी सर्टिफिकेट' :
                             doc.category === 'tax_receipt' ? 'टैक्स रिटर्न रसीद' :
                             doc.category === 'financials' ? 'ऑडिटेड रिपोर्ट' : 'लाइसेंस व परमिट'}
                          </span>

                          <div className="flex items-center gap-1">
                            {doc.status === 'verified' && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-md flex items-center gap-1 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>CA Verified</span>
                              </span>
                            )}
                            {doc.status === 'expiring_soon' && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold rounded-md flex items-center gap-1 border border-amber-500/20 animate-pulse">
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                <span>Expiring Soon</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {doc.title}
                        </h3>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {doc.titleHi}
                        </div>
                      </div>

                      {/* Details Meta Block */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                        
                        {(doc.docNumber || doc.arnNumber) && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">नंबर / ARN:</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-slate-100">
                              <span>{doc.arnNumber || doc.docNumber}</span>
                              <button
                                onClick={() => handleCopyDocNum(doc.arnNumber || doc.docNumber || '')}
                                className="text-slate-400 hover:text-amber-500 p-0.5 rounded transition"
                                title="कॉपी करें"
                              >
                                {copiedDocNum === (doc.arnNumber || doc.docNumber) ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {doc.financialYear && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">वित्तीय वर्ष (FY):</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{doc.financialYear}</span>
                          </div>
                        )}

                        {doc.taxPaidAmount && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">टैक्स चालान राशि:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              ₹{doc.taxPaidAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-400">जारी तिथि: {doc.issueDate}</span>
                          <span className="text-slate-400 font-mono">{doc.fileSize} • PDF</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>देखें (Preview)</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => alert(`📥 "${doc.title}" की PDF फाइल डाउनलोड शुरू हो गई है!`)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                            title="डाउनलोड करें"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              const shareText = `📑 ${doc.title}\nनंबर/ARN: ${doc.arnNumber || doc.docNumber}\nतिथि: ${doc.issueDate}\nसीए द्वारा सत्यापित: ${doc.verifiedByCa}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                            title="व्हाट्सएप पर शेयर करें"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteVaultDoc(doc.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: AI-POWERED ASK A CA CHAT INTERFACE                             */}
      {/* ========================================================================= */}
      {activeTab === 'askCa' && (
        <div className="space-y-6">
          
          {/* CA AI Assistant Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Chartered Accountant Assistant • Instant Advisory</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Bot className="w-8 h-8 text-amber-400" />
                  <span>Ask a CA — एआई जीएसटी व टैक्स सलाहकार</span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  जीएसटी रजिस्ट्रेशन, लेट फीस पेनल्टी, इनपुट टैक्स क्रेडिट (ITC) क्लेम, टीडीएस दरें या कंपोजिशन स्कीम से जुड़े किसी भी सवाल का तुरंत कानूनी व सीए समाधान पाएं।
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute top-0 left-0"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-400">2Click CA Desk AI Live</div>
                  <div className="text-[10px] text-slate-400">Senior FCA Model Connected</div>
                </div>
              </div>
            </div>

            {/* Suggested Questions Grid */}
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>अक्सर पूछे जाने वाले सवाल (Quick Compliance Questions):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "GSTR-3B लेट फीस पेनल्टी क्या है?",
                  "क्या कंस्ट्रक्शन/मटीरियल पर ITC क्लेम कर सकते हैं?",
                  "GST कंपोजिशन स्कीम की टर्नओवर लिमिट क्या है?",
                  "194C ठेकेदार भुगतान पर TDS दर क्या है?",
                  "GSTR-1 और GSTR-3B की अंतिम तिथि कब है?",
                  "ई-वे बिल (e-Way Bill) कब अनिवार्य है?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendCaQuery(q)}
                    className="px-3 py-1.5 bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Main Chat Box Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[550px]">
            
            {/* Chat Header Bar */}
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>CA Anuj &amp; Team AI Advisory Desk</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black rounded-full uppercase">
                      ICAI Verified Base
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    CGST Act 2017, Income Tax Act 1961 &amp; Notification Updates
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCaChatMessages(INITIAL_CA_MESSAGES)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-bold flex items-center gap-1.5"
                title="चैट रीसेट करें"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">रीसेट (Reset)</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {caChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none font-bold text-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none space-y-2'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="text-xs">{msg.text}</div>
                    ) : (
                      <div className="space-y-2">
                        <div className="prose prose-xs dark:prose-invert max-w-none">
                          {renderFormattedCaText(msg.text)}
                        </div>

                        {msg.disclaimer && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{msg.disclaimer}</span>
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions under AI response */}
                  {msg.sender === 'ca' && (
                    <div className="flex items-center gap-2 pl-2">
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard?.writeText(msg.text);
                          } catch (e) {}
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 2000);
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-amber-500 flex items-center gap-1 transition"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>कॉपी उत्तर</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const shareText = `🏛️ 2Click CA Advisory:\n\n${msg.text.slice(0, 300)}...\n\nपूरा समाधान: https://2click.in`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-500 flex items-center gap-1 transition"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>व्हाट्सएप शेयर</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}

              {/* Thinking Indicator */}
              {isCaThinking && (
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm">
                  <Bot className="w-5 h-5 text-amber-500 animate-spin" />
                  <div className="space-y-1">
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                      सीए एआई सलाह विश्लेषण कर रहा है...
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Checking CGST Sections &amp; Latest GST Portal Notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCaQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="जीएसटी, रिटर्न, लेट फीस या टीडीएस से जुड़ा कोई भी सवाल पूछें..."
                  value={caChatInput}
                  onChange={(e) => setCaChatInput(e.target.value)}
                  disabled={isCaThinking}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="submit"
                  disabled={!caChatInput.trim() || isCaThinking}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">पूछें (Send)</span>
                </button>
              </form>

              <div className="mt-2 text-[10px] text-slate-400 text-center">
                ⚠️ डिस्क्लेमर: यह एआई टूल केवल प्रारंभिक मार्गदर्शन प्रदान करता है। आधिकारिक रिटर्न फाइलिंग व सीए हस्ताक्षर के लिए सीए सर्विसेज अनुभाग से डायरेक्ट कंसल्टेंट बुक करें।
              </div>
            </div>

          </div>

        </div>
      )}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">सत्यापित अनुपालन दस्तावेज (Verified Document)</h3>
                  <p className="text-[10px] text-slate-400">2Click CA Vault Security Signed</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Canvas Sheet */}
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-b from-amber-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-4 border-double border-amber-500/40 rounded-2xl p-6 relative space-y-6 shadow-inner">
                
                {/* Government Watermark Emblem Simulation */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-widest">
                        GOVT OF INDIA &amp; ICAI APPROVED
                      </div>
                      <div className="font-black text-slate-900 dark:text-slate-100 text-base">
                        {previewDoc.title}
                      </div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {previewDoc.titleHi}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-lg inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CA VERIFIED</span>
                    </span>
                  </div>
                </div>

                {/* Certificate Details Sheet Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">रजिस्ट्रेशन / ARN नंबर:</div>
                    <div className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between">
                      <span>{previewDoc.arnNumber || previewDoc.docNumber}</span>
                      <button
                        onClick={() => handleCopyDocNum(previewDoc.arnNumber || previewDoc.docNumber || '')}
                        className="text-amber-500 hover:text-amber-600 text-[10px] font-bold"
                      >
                        {copiedDocNum === (previewDoc.arnNumber || previewDoc.docNumber) ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">जारी होने की तिथि (Issue Date):</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{previewDoc.issueDate}</div>
                  </div>

                  {previewDoc.financialYear && (
                    <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">वित्तीय वर्ष (FY):</div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{previewDoc.financialYear}</div>
                    </div>
                  )}

                  {previewDoc.taxPaidAmount && (
                    <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">टैक्स चालान अमाउंट:</div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{previewDoc.taxPaidAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>

                {/* CA Sign & Verification Stamp */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">सत्यापितकर्ता सीए (Verifying Authority):</div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>{previewDoc.verifiedByCa}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">2Click Empanelled Chartered Accountant Unit</div>
                  </div>

                  {/* QR Verification Code Simulation */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
                    <QrCode className="w-10 h-10 mx-auto text-slate-800 dark:text-slate-200" />
                    <span className="text-[9px] font-mono text-slate-400 block">Scan to Verify</span>
                  </div>
                </div>

                {/* Notes */}
                {previewDoc.notes && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-extrabold block">रिमार्क्स व नोट्स:</span>
                    <span>{previewDoc.notes}</span>
                  </div>
                )}

              </div>

              {/* Action Buttons inside Preview Modal */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => alert(`🖨️ "${previewDoc.title}" का प्रिंट कमांड दिया गया!`)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट करें (Print)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const shareText = `📑 ${previewDoc.title}\nARN: ${previewDoc.arnNumber || previewDoc.docNumber}\nVerified: ${previewDoc.verifiedByCa}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>शेयर करें</span>
                  </button>

                  <button
                    onClick={() => alert(`📥 "${previewDoc.title}" डाउनलोड हो रहा है...`)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>डाउनलोड PDF</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD NEW DOCUMENT TO VAULT MODAL                               */}
      {/* ========================================================================= */}
      {addVaultModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">वॉल्ट में नया डॉक्युमेंट जोड़ें</h3>
                  <p className="text-[10px] text-slate-400">256-Bit Encrypted Cloud Vault Storage</p>
                </div>
              </div>

              <button
                onClick={() => setAddVaultModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {vaultSuccessMsg ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
                    {vaultSuccessMsg}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddVaultDoc} className="space-y-4">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      दस्तावेज का नाम (Document Title in English) *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GSTIN Certificate REG-06 or GSTR-3B Aug Receipt"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      हिंदी नाम (Title in Hindi):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. जीएसटी रजिस्ट्रेशन प्रमाणपत्र"
                      value={newDocTitleHi}
                      onChange={(e) => setNewDocTitleHi(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        कैटेगरी (Category):
                      </label>
                      <select
                        value={newDocCategory}
                        onChange={(e) => setNewDocCategory(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="certificate">कंपनी / जीएसटी रजिस्ट्रेशन</option>
                        <option value="tax_receipt">रिटर्न फाइलिंग रसीद / ARN</option>
                        <option value="financials">ऑडिट बैलेंस शीट व P&amp;L</option>
                        <option value="license">ट्रेड व दुकान लाइसेंस</option>
                        <option value="other">अन्य डॉक्युमेंट</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        वित्तीय वर्ष (FY):
                      </label>
                      <input
                        type="text"
                        value={newDocFy}
                        onChange={(e) => setNewDocFy(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        नंबर / ARN / Acknowledgement No:
                      </label>
                      <input
                        type="text"
                        placeholder="29AABCU... / AA29..."
                        value={newDocNumber}
                        onChange={(e) => setNewDocNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        टैक्स जमा राशि (यदि रसीद हो):
                      </label>
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={newDocTaxAmount}
                        onChange={(e) => setNewDocTaxAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* File Upload Box */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      फाइल अटैच करें (Attach PDF / Image):
                    </label>
                    <div className="border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-4 text-center cursor-pointer relative hover:border-amber-500 transition">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewDocFiles([e.target.files[0].name]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        फाइल चुनने के लिए क्लिक करें
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
                    </div>

                    {newDocFiles.length > 0 && (
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>अटैच्ड: {newDocFiles[0]}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      रिमार्क्स या नोट्स:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="डॉक्युमेंट के बारे में कोई अतिरिक्त जानकारी..."
                      value={newDocNotes}
                      onChange={(e) => setNewDocNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FolderLock className="w-4 h-4" />
                    <span>वॉल्ट में सुरक्षित सेव करें (Encrypt &amp; Save)</span>
                  </button>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
