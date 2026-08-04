import React, { useState, useEffect } from 'react';
import { getSafeLocalStorage, setSafeLocalStorage } from '../lib/storage';
import { 
  BookOpen, 
  Users, 
  Receipt, 
  MapPin, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Crosshair, 
  Navigation, 
  Share2, 
  Filter, 
  Building2, 
  Store, 
  FileText, 
  Send, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Copy,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { User, KhataAccount, KhataTransaction, CrmLead, ErpInvoice, ErpInvoiceItem } from '../types';

interface CrmErpKhatabookHubProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  selectedCity?: string;
}

// Initial Sample Data for KhataBook Ledger
const INITIAL_KHATA_ACCOUNTS: KhataAccount[] = [
  {
    id: 'KHA-101',
    name: 'Ramesh Cement & Hardware',
    phone: '+91 70072 54932',
    accountType: 'Dukandar',
    district: 'Lucknow',
    address: 'Shop 14, Main Wholesale Market, Sector 62, Noida',
    gpsLat: 28.6139,
    gpsLng: 77.2090,
    netBalanceINR: 45000, // Positive = You will receive ₹45,000
    lastTransactionDate: '2026-07-28',
    transactions: [
      {
        id: 'TXN-1',
        accountId: 'KHA-101',
        type: 'Gave',
        amount: 65000,
        date: '2026-07-20',
        billNumber: 'INV-2026-881',
        paymentMode: 'Bank Transfer',
        itemCategory: 'Ultratech Cement (100 Bags)',
        notes: 'Delivered to Site #4 Noida Expressway'
      },
      {
        id: 'TXN-2',
        accountId: 'KHA-101',
        type: 'Got',
        amount: 20000,
        date: '2026-07-25',
        billNumber: 'RCV-9012',
        paymentMode: 'UPI',
        itemCategory: 'Advance Payment',
        notes: 'Received via PhonePe'
      }
    ]
  },
  {
    id: 'KHA-102',
    name: 'Anoop Singh (Client - Solar Rooftop)',
    phone: '+91 94150 99887',
    accountType: 'Customer',
    district: 'Lucknow',
    address: 'Plot 42, Gomti Nagar Extension, Lucknow',
    gpsLat: 26.8467,
    gpsLng: 80.9462,
    netBalanceINR: 120000, // Positive = Client owes ₹1,20,000 for 5kW Solar Installation
    lastTransactionDate: '2026-07-27',
    transactions: [
      {
        id: 'TXN-3',
        accountId: 'KHA-102',
        type: 'Gave',
        amount: 250000,
        date: '2026-07-15',
        billNumber: 'INV-SOLAR-04',
        paymentMode: 'Bank Transfer',
        itemCategory: '5kW On-Grid Bifacial Solar Installation',
        notes: 'Structure erection completed'
      },
      {
        id: 'TXN-4',
        accountId: 'KHA-102',
        type: 'Got',
        amount: 130000,
        date: '2026-07-27',
        billNumber: 'RCV-9045',
        paymentMode: 'UPI',
        itemCategory: 'Stage 2 Payment',
        notes: 'Net Metering inspection complete'
      }
    ]
  },
  {
    id: 'KHA-103',
    name: 'Gupta Steel & TMT Rod Supplier',
    phone: '+91 98390 44556',
    accountType: 'Supplier',
    district: 'Varanasi',
    address: 'GT Road Steel Mandi, Ramnagar, Varanasi',
    gpsLat: 25.3176,
    gpsLng: 82.9739,
    netBalanceINR: -35000, // Negative = You owe supplier ₹35,000
    lastTransactionDate: '2026-07-26',
    transactions: [
      {
        id: 'TXN-5',
        accountId: 'KHA-103',
        type: 'Got',
        amount: 85000,
        date: '2026-07-10',
        billNumber: 'SUP-4410',
        paymentMode: 'Cheque',
        itemCategory: 'Tata Tiscon Fe550D TMT Steel (1.5 Ton)',
        notes: '30 Days Credit terms'
      },
      {
        id: 'TXN-6',
        accountId: 'KHA-103',
        type: 'Gave',
        amount: 50000,
        date: '2026-07-26',
        billNumber: 'PAY-1102',
        paymentMode: 'Bank Transfer',
        itemCategory: 'Part Payment Clear',
        notes: 'Paid via HDFC NEFT'
      }
    ]
  }
];

// Initial Sample CRM Leads
const INITIAL_CRM_LEADS: CrmLead[] = [
  {
    id: 'LEAD-501',
    customerName: 'Vikram Malhotra',
    companyName: 'Malhotra Cold Storage Ltd',
    phone: '+91 98200 88776',
    email: 'vikram@malhotra.com',
    district: 'Mumbai',
    address: 'Plot B-12, MIDC Industrial Area, Andheri East, Mumbai',
    gpsLat: 19.0760,
    gpsLng: 72.8777,
    serviceInterest: '50kW Industrial Solar Rooftop',
    estimatedValueINR: 2200000,
    stage: 'Quotation Sent',
    assignedEmployeeName: 'Shrinet Field Admin',
    nextFollowUpDate: '2026-07-30',
    notes: 'Requires PM Surya Ghar / Subsidy tax benefit advice.',
    siteCheckInHistory: [
      {
        date: '2026-07-24 11:30 AM',
        inspectorName: 'Shrinet Field Admin',
        lat: 19.0760,
        lng: 72.8777,
        remarks: 'Shadow analysis done. Roof area 4,500 sqft available.'
      }
    ]
  },
  {
    id: 'LEAD-502',
    customerName: 'Shalini Sharma',
    companyName: 'Studio Interiors',
    phone: '+91 98450 77889',
    email: 'shalini@studio.in',
    district: 'Bengaluru',
    address: '12th Main Road, Indiranagar, Bengaluru',
    gpsLat: 12.9716,
    gpsLng: 77.5946,
    serviceInterest: '3BHK Interior & VR Walkthrough BOQ',
    estimatedValueINR: 850000,
    stage: 'Site Visit Scheduled',
    assignedEmployeeName: 'District Architect Partner',
    nextFollowUpDate: '2026-07-29',
    notes: 'Client wants modular kitchen with Akrilik finish.'
  }
];

// Initial GST Invoices
const INITIAL_INVOICES: ErpInvoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'INV-2026-001',
    customerName: 'Anoop Singh',
    customerPhone: '+91 94150 99887',
    customerGstin: '09AAACG1234F1Z1',
    district: 'Lucknow',
    date: '2026-07-15',
    dueDate: '2026-08-15',
    items: [
      {
        id: 'ITM-1',
        itemName: '5kW Solar Hybrid Panel Tier-1 Mono PERC',
        hsnCode: '85414011',
        quantity: 1,
        unit: 'Set',
        unitRateINR: 200000,
        gstPercent: 12,
        totalAmountINR: 224000
      }
    ],
    subtotalINR: 200000,
    gstAmountINR: 24000,
    grandTotalINR: 224000,
    status: 'Partially Paid'
  }
];

export const CrmErpKhatabookHub: React.FC<CrmErpKhatabookHubProps> = ({
  currentUser,
  onOpenAuth,
  selectedCity = 'Delhi NCR'
}) => {
  const [activeSubModule, setActiveSubModule] = useState<'khatabook' | 'crm' | 'billing' | 'attendance'>('khatabook');

  // KhataBook State
  const [khataAccounts, setKhataAccounts] = useState<KhataAccount[]>(() => {
    return getSafeLocalStorage<KhataAccount[]>('2click_khata_accounts', INITIAL_KHATA_ACCOUNTS);
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_KHATA_ACCOUNTS[0].id);
  const [khataSearchQuery, setKhataSearchQuery] = useState('');
  const [khataFilterType, setKhataFilterType] = useState<string>('All');

  // New Transaction Modal State
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnType, setTxnType] = useState<'Gave' | 'Got'>('Gave');
  const [txnAmount, setTxnAmount] = useState<string>('');
  const [txnCategory, setTxnCategory] = useState<string>('');
  const [txnPaymentMode, setTxnPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [txnNotes, setTxnNotes] = useState<string>('');
  const [txnBillNo, setTxnBillNo] = useState<string>('');

  // Add Account Modal State
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccPhone, setNewAccPhone] = useState('');
  const [newAccType, setNewAccType] = useState<'Customer' | 'Dukandar' | 'Supplier' | 'Contractor'>('Customer');
  const [newAccDistrict, setNewAccDistrict] = useState(selectedCity);
  const [newAccAddress, setNewAccAddress] = useState('');

  // CRM State
  const [leadsList, setLeadsList] = useState<CrmLead[]>(() => {
    return getSafeLocalStorage<CrmLead[]>('2click_crm_leads', INITIAL_CRM_LEADS);
  });
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmStageFilter, setCrmStageFilter] = useState('All');
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadService, setNewLeadService] = useState('Solar Rooftop');
  const [newLeadValue, setNewLeadValue] = useState('500000');
  const [newLeadAddress, setNewLeadAddress] = useState('');

  // Invoices State
  const [invoicesList, setInvoicesList] = useState<ErpInvoice[]>(INITIAL_INVOICES);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);

  // GPS Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{
    id: string;
    userName: string;
    userRole: string;
    timestamp: string;
    lat: number;
    lng: number;
    locationName: string;
    status: 'Verified GPS Check-In';
  }>>([
    {
      id: 'ATT-1',
      userName: currentUser?.name || 'Field Inspector #102',
      userRole: currentUser?.role || 'District Employee',
      timestamp: '2026-07-28 09:15 AM',
      lat: 28.6139,
      lng: 77.2090,
      locationName: 'Delhi NCR Hub - Sector 62 Site',
      status: 'Verified GPS Check-In'
    }
  ]);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist Khata Accounts & Leads to localStorage
  useEffect(() => {
    localStorage.setItem('2click_khata_accounts', JSON.stringify(khataAccounts));
  }, [khataAccounts]);

  useEffect(() => {
    localStorage.setItem('2click_crm_leads', JSON.stringify(leadsList));
  }, [leadsList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected Active Khata Account
  const activeKhataAccount = khataAccounts.find(a => a.id === selectedAccountId) || khataAccounts[0];

  // Calculate Khata totals
  const totalYouWillGet = khataAccounts
    .filter(a => a.netBalanceINR > 0)
    .reduce((acc, curr) => acc + curr.netBalanceINR, 0);

  const totalYouWillPay = khataAccounts
    .filter(a => a.netBalanceINR < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.netBalanceINR), 0);

  // Handle Adding New Khata Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txnAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newTxn: KhataTransaction = {
      id: `TXN-${Date.now()}`,
      accountId: selectedAccountId,
      type: txnType,
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      billNumber: txnBillNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMode: txnPaymentMode,
      itemCategory: txnCategory || 'General Supply / Udhaar',
      notes: txnNotes
    };

    const updatedAccounts = khataAccounts.map(acc => {
      if (acc.id === selectedAccountId) {
        // If Gave (Udhaar), netBalance increases (+). If Got (Jama), netBalance decreases (-)
        const delta = txnType === 'Gave' ? amountNum : -amountNum;
        const newBalance = acc.netBalanceINR + delta;
        return {
          ...acc,
          netBalanceINR: newBalance,
          lastTransactionDate: newTxn.date,
          transactions: [newTxn, ...acc.transactions]
        };
      }
      return acc;
    });

    setKhataAccounts(updatedAccounts);
    setTxnModalOpen(false);
    setTxnAmount('');
    setTxnNotes('');
    setTxnCategory('');
    showToast(`₹${amountNum.toLocaleString('en-IN')} ${txnType === 'Gave' ? 'Udhaar Added' : 'Jama Payment Received'} successfully!`);
  };

  // Handle Creating New Khata Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccPhone) {
      alert('Please enter account name and mobile number.');
      return;
    }

    const newAcc: KhataAccount = {
      id: `KHA-${Date.now().toString().slice(-4)}`,
      name: newAccName,
      phone: newAccPhone,
      accountType: newAccType,
      district: newAccDistrict,
      address: newAccAddress || `${newAccDistrict} Main Market`,
      netBalanceINR: 0,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      transactions: []
    };

    setKhataAccounts([newAcc, ...khataAccounts]);
    setSelectedAccountId(newAcc.id);
    setAddAccountModalOpen(false);
    setNewAccName('');
    setNewAccPhone('');
    setNewAccAddress('');
    showToast(`New Khata Account for "${newAccName}" created!`);
  };

  // Handle WhatsApp Reminder Copy / Direct Open
  const handleSendWhatsAppReminder = (acc: KhataAccount) => {
    const isReceivable = acc.netBalanceINR > 0;
    const amountStr = Math.abs(acc.netBalanceINR).toLocaleString('en-IN');
    
    let msg = `नमस्ते ${acc.name} जी,\n\n2Click Digital Khata Ledger reminder:\n`;
    if (isReceivable) {
      msg += `आपका कुल बकाया राशि ₹${amountStr} लंबित है।\nकृपया नीचे दिए गए UPI / QR कोड के माध्यम से भुगतान करें।\n\nUPI Payment Link: upi://pay?pa=2click.business@okaxis&pn=2ClickKhata&am=${Math.abs(acc.netBalanceINR)}&cu=INR\n\nधन्यवाद! - 2Click Engineering Hub`;
    } else {
      msg += `आपके खाते में हमारा कुल देना राशि ₹${amountStr} दर्ज है। जल्द ही भुगतान किया जाएगा।\n\n2Click Engineering Hub`;
    }

    const cleanPhone = acc.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showToast(`Opening WhatsApp with payment reminder for ${acc.name}...`);
  };

  // Handle Live GPS Check-in for Attendance & Field Inspection
  const handleGpsCheckIn = () => {
    setIsCapturingGps(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsCapturingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newRecord = {
          id: `ATT-${Date.now()}`,
          userName: currentUser?.name || 'Field Inspector / Dukandar',
          userRole: currentUser?.role || 'District Employee',
          timestamp: new Date().toLocaleString(),
          lat: latitude,
          lng: longitude,
          locationName: `${selectedCity} Live Location (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`,
          status: 'Verified GPS Check-In' as const
        };

        setAttendanceRecords([newRecord, ...attendanceRecords]);
        setIsCapturingGps(false);
        showToast(`📍 Live GPS Attendance Tagged successfully at Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      },
      (err) => {
        setIsCapturingGps(false);
        alert('Could not fetch GPS coordinates. Please grant location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Creating New CRM Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) {
      alert('Please fill customer name and phone.');
      return;
    }

    const lead: CrmLead = {
      id: `LEAD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newLeadName,
      companyName: newLeadCompany || 'Private Site Client',
      phone: newLeadPhone,
      district: selectedCity,
      address: newLeadAddress || `${selectedCity} Central Site`,
      serviceInterest: newLeadService,
      estimatedValueINR: parseFloat(newLeadValue) || 100000,
      stage: 'New Lead',
      assignedEmployeeName: currentUser?.name || 'District Admin',
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: 'Lead acquired via 2Click Engineering Portal'
    };

    setLeadsList([lead, ...leadsList]);
    setAddLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadCompany('');
    showToast(`New CRM Lead "${newLeadName}" added to Sales Pipeline!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/50 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Smart KhataBook, CRM &amp; Field ERP Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>📖 KhataBook &amp; CRM ERP Hub</span>
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-xl">
                उधार - जमा खाता
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
              डिजिटल खाता बुक (उधार/जमा लेजर), ऑटोमैटिक व्हाट्सएप रिमाइंडर, GPS लोकेशन आधारित CRM लीड पाइपलाइन, GST इनवॉइस एवं फील्ड स्टाफ अटेंडेंस ट्रैकिंग का सम्पूर्ण समाधान।
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setAddAccountModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>नया खाता जोड़ें (Add Account)</span>
            </button>

            <button
              onClick={handleGpsCheckIn}
              disabled={isCapturingGps}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Crosshair className={`w-4 h-4 ${isCapturingGps ? 'animate-spin' : ''}`} />
              <span>{isCapturingGps ? 'GPS tagging...' : '📍 GPS Attendance / Location Tag'}</span>
            </button>
          </div>
        </div>

        {/* Global Summary Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-300 font-bold block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> आपको लेने हैं (Receivable)
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              ₹{totalYouWillGet.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-rose-300 font-bold block flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> आपको देने हैं (Payable)
            </span>
            <span className="text-xl font-black text-rose-400 mt-1 block">
              ₹{totalYouWillPay.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-amber-300 font-bold block flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Active Customers
            </span>
            <span className="text-xl font-black text-amber-300 mt-1 block">
              {khataAccounts.length} Ledgers
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-300 font-bold block flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> CRM Active Leads
            </span>
            <span className="text-xl font-black text-indigo-300 mt-1 block">
              {leadsList.length} Opportunities
            </span>
          </div>
        </div>
      </div>

      {/* MODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveSubModule('khatabook')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubModule === 'khatabook'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Khatabook Ledger (खाता बुक)</span>
          </button>

          <button
            onClick={() => setActiveSubModule('crm')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubModule === 'crm'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>🎯 CRM &amp; GPS Leads (लीड प्रबंधन)</span>
          </button>

          <button
            onClick={() => setActiveSubModule('billing')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubModule === 'billing'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>📄 GST Invoicing (बिलिंग)</span>
          </button>

          <button
            onClick={() => setActiveSubModule('attendance')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubModule === 'attendance'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>📍 GPS Field Attendance</span>
          </button>

        </div>

        <span className="text-xs font-bold text-slate-500">
          City Context: <strong className="text-teal-600">{selectedCity}</strong>
        </span>
      </div>

      {/* SUB-MODULE 1: KHATABOOK LEDGER VIEW */}
      {activeSubModule === 'khatabook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDEBAR: CUSTOMER / VENDOR LIST (1 COL) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                Ledger Accounts ({khataAccounts.length})
              </h3>
              <button
                onClick={() => setAddAccountModalOpen(true)}
                className="p-1.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl hover:bg-teal-200 transition"
                title="Add New Account"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Name or Mobile..."
                  value={khataSearchQuery}
                  onChange={(e) => setKhataSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Customer', 'Dukandar', 'Supplier', 'Contractor'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setKhataFilterType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition ${
                      khataFilterType === type
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Account List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {khataAccounts
                .filter(acc => {
                  const matchSearch = acc.name.toLowerCase().includes(khataSearchQuery.toLowerCase()) ||
                    acc.phone.includes(khataSearchQuery);
                  const matchFilter = khataFilterType === 'All' || acc.accountType === khataFilterType;
                  return matchSearch && matchFilter;
                })
                .map((acc) => {
                  const isSelected = acc.id === selectedAccountId;
                  const isReceivable = acc.netBalanceINR > 0;
                  const isPayable = acc.netBalanceINR < 0;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {acc.accountType} • {acc.district}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          isReceivable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isPayable
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isReceivable ? 'लेने हैं' : isPayable ? 'देने हैं' : 'Settled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {acc.phone}
                        </span>
                        <span className={`font-black ${
                          isReceivable ? 'text-emerald-600 dark:text-emerald-400' : isPayable ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                        }`}>
                          ₹{Math.abs(acc.netBalanceINR).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>

          {/* RIGHT DETAILED LEDGER TRANSACTIONS PANEL (2 COLS) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            {/* Account Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-[10px]">
                    {activeKhataAccount.accountType}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{activeKhataAccount.district}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {activeKhataAccount.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-teal-600" /> {activeKhataAccount.phone}
                  {activeKhataAccount.address && <span>• {activeKhataAccount.address}</span>}
                </p>
              </div>

              {/* Net Balance Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
                  Net Account Balance
                </span>
                <span className={`text-2xl font-black ${
                  activeKhataAccount.netBalanceINR > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : activeKhataAccount.netBalanceINR < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600'
                }`}>
                  ₹{Math.abs(activeKhataAccount.netBalanceINR).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 block">
                  {activeKhataAccount.netBalanceINR > 0 ? '(You will receive)' : activeKhataAccount.netBalanceINR < 0 ? '(You have to pay)' : 'Account Settled'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                onClick={() => {
                  setTxnType('Gave');
                  setTxnModalOpen(true);
                }}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>आपने दिए (You Gave ₹)</span>
              </button>

              <button
                onClick={() => {
                  setTxnType('Got');
                  setTxnModalOpen(true);
                }}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>आपको मिले (You Got ₹)</span>
              </button>

              <button
                onClick={() => handleSendWhatsAppReminder(activeKhataAccount)}
                className="py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>व्हाट्सएप रिमाइंडर (WhatsApp)</span>
              </button>

            </div>

            {/* Transactions History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Transaction History ({activeKhataAccount.transactions.length})
                </h4>
                <button
                  onClick={() => window.print()}
                  className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Statement
                </button>
              </div>

              {activeKhataAccount.transactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No transactions logged yet for this account.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "You Gave ₹" or "You Got ₹" to log first transaction.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {activeKhataAccount.transactions.map((txn) => (
                    <div key={txn.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                            txn.type === 'Gave' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {txn.type === 'Gave' ? '🔴 Udhaar Given' : '🟢 Payment Received'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{txn.date}</span>
                          <span className="text-[10px] text-slate-400">• Mode: {txn.paymentMode}</span>
                        </div>
                        <p className="font-extrabold text-slate-900 dark:text-white mt-1">
                          {txn.itemCategory}
                        </p>
                        {txn.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{txn.notes}</p>}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-base font-black ${
                          txn.type === 'Gave' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {txn.type === 'Gave' ? '-' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                        </span>
                        {txn.billNumber && (
                          <span className="text-[10px] text-slate-400 block">Bill #{txn.billNumber}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUB-MODULE 2: CRM & LEADS PIPELINE VIEW */}
      {activeSubModule === 'crm' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                CRM Customer Leads &amp; Site GPS Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                सोलर, सिविल बीओक्यू एवं आर्किटेक्चरल इंक्वायरी का स्टेज-वाइज लीड प्रबंधन एवं साइट जीपीएस इंस्पेक्शन रिकॉर्ड।
              </p>
            </div>

            <button
              onClick={() => setAddLeadModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>नई लीड जोड़ें (Add Lead)</span>
            </button>
          </div>

          {/* CRM Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['New Lead', 'Site Visit Scheduled', 'Quotation Sent', 'Closed Won'].map((stageName) => {
              const stageLeads = leadsList.filter(l => l.stage === stageName);

              return (
                <div key={stageName} className="bg-slate-100 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                      {stageName}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-[10px]">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {stageLeads.map((lead) => (
                      <div key={lead.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                              {lead.customerName}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {lead.companyName}
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-emerald-600">
                            ₹{(lead.estimatedValueINR / 1000).toFixed(0)}k
                          </span>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="font-bold block text-indigo-600 dark:text-indigo-400">
                            ⚡ {lead.serviceInterest}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" /> {lead.address}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <a href={`tel:${lead.phone}`} className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" /> Call
                          </a>

                          {lead.gpsLat && lead.gpsLng && (
                            <a
                              href={`https://www.google.com/maps?q=${lead.gpsLat},${lead.gpsLng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] rounded-lg flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" /> Map
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUB-MODULE 3: GST INVOICING ENGINE */}
      {activeSubModule === 'billing' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                GST Invoice Generator &amp; Billing Ledger
              </h3>
              <p className="text-xs text-slate-500">
                सिविल वर्क्स, सोलर किट एवं इलेक्ट्रिकल सप्लाई के लिए अधिकृत जीएसटी टैक्स इनवॉइस बनाएं।
              </p>
            </div>

            <button
              onClick={() => showToast('Invoicing system loaded in draft mode.')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>नया GST इनवॉइस बनाएं</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {invoicesList.map((inv) => (
              <div key={inv.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-purple-600 dark:text-purple-400">{inv.invoiceNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold">
                      {inv.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white mt-1">
                    Customer: {inv.customerName} ({inv.customerPhone})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    GSTIN: {inv.customerGstin} • District: {inv.district}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                    ₹{inv.grandTotalINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Subtotal: ₹{inv.subtotalINR.toLocaleString('en-IN')} + GST: ₹{inv.gstAmountINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-MODULE 4: GPS FIELD ATTENDANCE & CHECK-IN */}
      {activeSubModule === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Live GPS Field Attendance &amp; Site Inspector Check-In
              </h3>
              <p className="text-xs text-slate-500">
                फील्ड कर्मचारियों एवं ठेकेदारों की ऑन-साइट लाइव जीपीएस अटेंडेंस तथा विजिट रिकॉर्ड।
              </p>
            </div>

            <button
              onClick={handleGpsCheckIn}
              disabled={isCapturingGps}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Crosshair className={`w-4 h-4 ${isCapturingGps ? 'animate-spin' : ''}`} />
              <span>{isCapturingGps ? 'Capturing GPS...' : '📍 Mark My Live GPS Attendance'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">
              Today's GPS Check-In Logs ({attendanceRecords.length})
            </h4>

            <div className="space-y-2">
              {attendanceRecords.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">{rec.userName} ({rec.userRole})</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-teal-600" /> {rec.timestamp} • {rec.locationName}
                    </span>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] rounded-xl flex items-center gap-1 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD TRANSACTION (GAVE UDHAAR / GOT JAMA) */}
      {txnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                {txnType === 'Gave' ? '🔴 You Gave Udhaar (उधार दिया)' : '🟢 You Got Payment (जमा लिया)'}
              </h3>
              <button onClick={() => setTxnModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Name:
                </label>
                <input
                  type="text"
                  disabled
                  value={activeKhataAccount.name}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl font-bold text-slate-600"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount in ₹ (राशि):
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-base text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Mode:
                  </label>
                  <select
                    value={txnPaymentMode}
                    onChange={(e) => setTxnPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Bill / Invoice # (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="INV-102"
                    value={txnBillNo}
                    onChange={(e) => setTxnBillNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Item Category / Purpose:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cement 50 Bags, Solar Cable, Advance"
                  value={txnCategory}
                  onChange={(e) => setTxnCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={txnNotes}
                  onChange={(e) => setTxnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-2xl font-black text-xs text-white shadow-lg transition ${
                  txnType === 'Gave' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Save Transaction (खाते में दर्ज करें)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD KHATA ACCOUNT */}
      {addAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                नया खाता बनाएं (Create New Khata Ledger)
              </h3>
              <button onClick={() => setAddAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer / Business Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newAccPhone}
                  onChange={(e) => setNewAccPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Account Category:
                  </label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Customer">Customer (ग्राहक)</option>
                    <option value="Dukandar">Dukandar (दुकानदार)</option>
                    <option value="Supplier">Supplier (सप्लायर)</option>
                    <option value="Contractor">Contractor (ठेकेदार)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    District:
                  </label>
                  <input
                    type="text"
                    value={newAccDistrict}
                    onChange={(e) => setNewAccDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Address / Location Tag:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop 12, Main Market"
                  value={newAccAddress}
                  onChange={(e) => setNewAccAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-lg transition"
              >
                Create Khata Account (खाता दर्ज करें)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CRM LEAD */}
      {addLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                नई लीड जोड़ें (Add New CRM Lead)
              </h3>
              <button onClick={() => setAddLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajiv Verma"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98110 00000"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Est. Value ₹:
                  </label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Service Requirement:
                </label>
                <select
                  value={newLeadService}
                  onChange={(e) => setNewLeadService(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Solar Rooftop">Solar Rooftop Installation</option>
                  <option value="Civil BOQ & Construction">Civil BOQ &amp; Construction</option>
                  <option value="Interior Modular & VR">Interior Modular &amp; VR</option>
                  <option value="Water ETP/STP Plant">Water ETP/STP Plant</option>
                  <option value="Electrical & MEP">Electrical &amp; MEP</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Site Address / GPS Tag:
                </label>
                <input
                  type="text"
                  placeholder="Plot 88, Sector 12"
                  value={newLeadAddress}
                  onChange={(e) => setNewLeadAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition"
              >
                Add Lead to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
