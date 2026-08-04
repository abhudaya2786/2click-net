import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  X, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Tag, 
  PackageCheck, 
  Building2, 
  MapPin, 
  ScanLine, 
  Share2, 
  Copy, 
  Check, 
  Search,
  SlidersHorizontal,
  Box,
  Truck,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { CustomCostItem } from '../types';

export interface MaterialBatchTag {
  id: string;
  boqItemId: string;
  materialTitle: string;
  category: string;
  brandName: string;
  batchLotNumber: string;
  quantity: number;
  unit: string;
  unitRateINR: number;
  totalBatchValueINR: number;
  supplierName: string;
  receivedDate: string;
  storageLocationZone: string;
  qualityStatus: 'Passed & Approved' | 'Pending Testing' | 'Quarantine / Rejected' | 'Issued to Site Floor';
  poInvoiceRef: string;
  supervisorName: string;
  qrPayloadJson: string;
  createdAt: string;
}

interface MaterialBatchQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  boqItems: CustomCostItem[];
  selectedItemForTag?: CustomCostItem | null;
  projectName?: string;
  selectedCity?: string;
}

export const MaterialBatchQrModal: React.FC<MaterialBatchQrModalProps> = ({
  isOpen,
  onClose,
  boqItems,
  selectedItemForTag,
  projectName = 'Civil Site Construction Project',
  selectedCity = 'New Delhi'
}) => {
  // Initial preselected item or first available item
  const [selectedBoqItemId, setSelectedBoqItemId] = useState<string>(
    selectedItemForTag?.id || (boqItems.length > 0 ? boqItems[0].id : '')
  );

  // Form states for creating a new batch tag
  const [batchLotNumber, setBatchLotNumber] = useState<string>(`LOT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [batchQty, setBatchQty] = useState<number>(100);
  const [supplierName, setSupplierName] = useState<string>('UltraTech & Tata Wholesale Depot');
  const [storageLocationZone, setStorageLocationZone] = useState<string>('Site A - Main Materials Shed #2');
  const [qualityStatus, setQualityStatus] = useState<'Passed & Approved' | 'Pending Testing' | 'Quarantine / Rejected' | 'Issued to Site Floor'>('Passed & Approved');
  const [poInvoiceRef, setPoInvoiceRef] = useState<string>(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [supervisorName, setSupervisorName] = useState<string>('Eng. Rajesh Sharma (Site Incharge)');
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // QR rendering & preview states
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'generate' | 'registry' | 'scanner'>('generate');

  // Scanner Simulator states
  const [scanInputText, setScanInputText] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<MaterialBatchTag | null>(null);
  const [scannerError, setScannerError] = useState<string>('');

  // Local state for all batch tags created in session
  const [batchTags, setBatchTags] = useState<MaterialBatchTag[]>(() => {
    // Generate initial sample batch tags for initial BOQ items
    return boqItems.slice(0, 3).map((item, idx) => {
      const lotNo = `LOT-2026-AUG-${idx + 101}`;
      const qty = Math.round(item.quantity * 0.4);
      const payloadObj = {
        app: '2Click.in BOQ Batch Tag',
        tagId: `TAG-${idx + 1}`,
        boqItemId: item.id,
        item: item.title,
        brand: item.brandName,
        lot: lotNo,
        qty: `${qty} ${item.unit}`,
        rate: `₹${item.unitRateINR}/${item.unit}`,
        total: `₹${(qty * item.unitRateINR).toLocaleString('en-IN')}`,
        supplier: 'UltraTech Wholesale Depot',
        bin: 'Zone A - Cement Shed',
        status: 'Passed & Approved',
        verifyUrl: `https://2click.in/verify/batch/${lotNo}`
      };

      return {
        id: `TAG-${idx + 1}`,
        boqItemId: item.id,
        materialTitle: item.title,
        category: item.category,
        brandName: item.brandName,
        batchLotNumber: lotNo,
        quantity: qty,
        unit: item.unit,
        unitRateINR: item.unitRateINR,
        totalBatchValueINR: qty * item.unitRateINR,
        supplierName: 'UltraTech Wholesale Depot',
        receivedDate: '2026-08-01',
        storageLocationZone: 'Zone A - Cement Shed',
        qualityStatus: 'Passed & Approved',
        poInvoiceRef: `PO-2026-${100 + idx}`,
        supervisorName: 'Eng. Rajesh Sharma',
        qrPayloadJson: JSON.stringify(payloadObj, null, 2),
        createdAt: new Date().toISOString()
      };
    });
  });

  // Active selected item object
  const currentBoqItem = useMemo(() => {
    return boqItems.find(i => i.id === selectedBoqItemId) || boqItems[0];
  }, [boqItems, selectedBoqItemId]);

  // Update form default quantity when selected item changes
  useEffect(() => {
    if (currentBoqItem) {
      setBatchQty(Math.round(currentBoqItem.quantity * 0.5) || 10);
      setSupplierName(currentBoqItem.brandName ? `${currentBoqItem.brandName} Empanelled Dealer` : 'Local Hardware Depot');
    }
  }, [selectedBoqItemId, currentBoqItem]);

  // Construct current payload object
  const currentPayloadObj = useMemo(() => {
    if (!currentBoqItem) return {};
    return {
      app: '2Click.in Onsite Material Verification',
      tagId: `TAG-${batchLotNumber}`,
      boqItemId: currentBoqItem.id,
      item: currentBoqItem.title,
      category: currentBoqItem.category,
      brand: currentBoqItem.brandName,
      batchLot: batchLotNumber,
      quantity: `${batchQty} ${currentBoqItem.unit}`,
      unitRate: `₹${currentBoqItem.unitRateINR}`,
      batchTotalINR: batchQty * currentBoqItem.unitRateINR,
      supplier: supplierName,
      storageBin: storageLocationZone,
      inspectionStatus: qualityStatus,
      invoiceRef: poInvoiceRef,
      receivedDate,
      supervisor: supervisorName,
      verifyUrl: `https://2click.in/verify/batch/${batchLotNumber}`
    };
  }, [currentBoqItem, batchLotNumber, batchQty, supplierName, storageLocationZone, qualityStatus, poInvoiceRef, receivedDate, supervisorName]);

  const payloadString = JSON.stringify(currentPayloadObj);

  // Generate QR image whenever current payload changes
  useEffect(() => {
    if (!payloadString) return;
    QRCode.toDataURL(payloadString, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code', err));
  }, [payloadString]);

  if (!isOpen) return null;

  // Handle Save Batch Tag to Log
  const handleCreateBatchTag = () => {
    if (!currentBoqItem) return;

    const newTag: MaterialBatchTag = {
      id: `TAG-${Date.now().toString().slice(-6)}`,
      boqItemId: currentBoqItem.id,
      materialTitle: currentBoqItem.title,
      category: currentBoqItem.category,
      brandName: currentBoqItem.brandName,
      batchLotNumber,
      quantity: batchQty,
      unit: currentBoqItem.unit,
      unitRateINR: currentBoqItem.unitRateINR,
      totalBatchValueINR: batchQty * currentBoqItem.unitRateINR,
      supplierName,
      receivedDate,
      storageLocationZone,
      qualityStatus,
      poInvoiceRef,
      supervisorName,
      qrPayloadJson: payloadString,
      createdAt: new Date().toISOString()
    };

    setBatchTags(prev => [newTag, ...prev]);
    alert(`Batch QR Tag #${batchLotNumber} successfully created and added to inventory tracking log!`);
    
    // Regenerate new Lot number for next tag
    setBatchLotNumber(`LOT-${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveSubTab('registry');
  };

  // Download QR Code image
  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_TAG_${batchLotNumber}_${currentBoqItem?.title || 'Material'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Payload JSON
  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayloadObj, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Print Tag Label Sheet
  const handlePrintTagLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Material Batch Tag - ${batchLotNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; background: #f8fafc; }
            .label-card {
              width: 380px;
              border: 3px solid #1e293b;
              border-radius: 16px;
              padding: 16px;
              background: #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              margin: 0 auto;
            }
            .header { border-bottom: 2px border #000; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-space-between; align-items: center; }
            .title { font-size: 16px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
            .sub { font-size: 10px; color: #64748b; }
            .qr-container { text-align: center; margin: 12px 0; }
            .qr-container img { width: 180px; height: 180px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px; }
            .details { font-size: 11px; color: #334155; line-height: 1.5; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 4px 0; }
            .badge { display: inline-block; padding: 2px 8px; background: #22c55e; color: #fff; font-weight: bold; border-radius: 4px; font-size: 10px; }
            @media print {
              body { background: none; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <div>
                <div class="title">2CLICK.IN ONSITE MATERIAL BATCH TAG</div>
                <div class="sub">Civil BOQ Inventory Tracking • ${selectedCity}</div>
              </div>
            </div>
            <div class="qr-container">
              <img src="${qrDataUrl}" alt="QR Tag" />
              <div style="font-family: monospace; font-weight: bold; margin-top: 4px; font-size: 12px;">
                BATCH #${batchLotNumber}
              </div>
            </div>
            <div class="details">
              <div class="row"><strong>Material:</strong> <span>${currentBoqItem?.title}</span></div>
              <div class="row"><strong>Brand & Grade:</strong> <span>${currentBoqItem?.brandName}</span></div>
              <div class="row"><strong>Batch Quantity:</strong> <span>${batchQty} ${currentBoqItem?.unit}</span></div>
              <div class="row"><strong>Supplier:</strong> <span>${supplierName}</span></div>
              <div class="row"><strong>Storage Location:</strong> <span>${storageLocationZone}</span></div>
              <div class="row"><strong>Quality Status:</strong> <span class="badge">${qualityStatus}</span></div>
              <div class="row"><strong>Received Date:</strong> <span>${receivedDate}</span></div>
              <div class="row"><strong>Invoice / PO Ref:</strong> <span>${poInvoiceRef}</span></div>
            </div>
          </div>
          <br/>
          <div style="text-align:center;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer;">
              Print Sticker Label Now
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Simulate scanning QR Code
  const handleTestScan = () => {
    setScannerError('');
    try {
      const textToParse = scanInputText || payloadString;
      const parsed = JSON.parse(textToParse);
      
      const matchedTag: MaterialBatchTag = {
        id: parsed.tagId || 'TAG-SCANNED',
        boqItemId: parsed.boqItemId || 'UNKNOWN',
        materialTitle: parsed.item || 'Scanned Material',
        category: parsed.category || 'General',
        brandName: parsed.brand || 'Verified Brand',
        batchLotNumber: parsed.batchLot || parsed.lot || 'LOT-SCANNED',
        quantity: parseInt(parsed.quantity) || 100,
        unit: parsed.quantity?.split(' ')[1] || 'Units',
        unitRateINR: parseInt(parsed.unitRate?.replace('₹','')) || 0,
        totalBatchValueINR: parsed.batchTotalINR || 0,
        supplierName: parsed.supplier || 'Vendor Sourced',
        receivedDate: parsed.receivedDate || new Date().toISOString().split('T')[0],
        storageLocationZone: parsed.storageBin || parsed.bin || 'Onsite Storage',
        qualityStatus: parsed.inspectionStatus || parsed.status || 'Passed & Approved',
        poInvoiceRef: parsed.invoiceRef || 'INV-VERIFIED',
        supervisorName: parsed.supervisor || 'Site Inspector',
        qrPayloadJson: JSON.stringify(parsed, null, 2),
        createdAt: new Date().toISOString()
      };

      setScannedResult(matchedTag);
    } catch (e) {
      setScannerError('Invalid QR Code Payload or Unrecognized Data format. Please copy a valid BOQ QR JSON string.');
      setScannedResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30 uppercase">
                  ONSITE INVENTORY LABELS
                </span>
                <span className="text-xs text-slate-400">• Physical Batch QR Tag Generator</span>
              </div>
              <h2 className="text-lg font-black text-white">
                BOQ Material Physical QR Tag &amp; Batch Tracker
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUB TABS NAVIGATION */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('generate')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'generate'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>1. Generate &amp; Print QR Tag</span>
            </button>

            <button
              onClick={() => setActiveSubTab('registry')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'registry'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>2. Batch Inventory Log ({batchTags.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('scanner')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>3. Scan &amp; Verify QR Tag</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>Project: <strong>{projectName}</strong></span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: GENERATE & PRINT BATCH TAG */}
          {activeSubTab === 'generate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT: FORM INPUTS */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Select Material &amp; Configure Batch Label
                </h3>

                {/* SELECT BOQ ITEM */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Target BOQ Item:
                  </label>
                  <select
                    value={selectedBoqItemId}
                    onChange={(e) => setSelectedBoqItemId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {boqItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.brandName}) — Est. Qty: {item.quantity} {item.unit} @ ₹{item.unitRateINR}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* BATCH LOT NUMBER */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Batch / Lot #
                    </label>
                    <input
                      type="text"
                      value={batchLotNumber}
                      onChange={(e) => setBatchLotNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                      placeholder="e.g. LOT-2026-AUG-88"
                    />
                  </div>

                  {/* BATCH QUANTITY */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Received Batch Qty ({currentBoqItem?.unit})
                    </label>
                    <input
                      type="number"
                      value={batchQty}
                      onChange={(e) => setBatchQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* SUPPLIER NAME */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Supplier / Dealer Name
                    </label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* STORAGE LOCATION BIN */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Onsite Storage Location / Bin
                    </label>
                    <input
                      type="text"
                      value={storageLocationZone}
                      onChange={(e) => setStorageLocationZone(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                      placeholder="e.g. Site Shed #3, Rack B"
                    />
                  </div>

                  {/* QUALITY INSPECTION STATUS */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Inspection Status
                    </label>
                    <select
                      value={qualityStatus}
                      onChange={(e: any) => setQualityStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Passed & Approved">🟢 Passed &amp; Approved</option>
                      <option value="Pending Testing">🟡 Pending Lab Testing</option>
                      <option value="Quarantine / Rejected">🔴 Quarantine / Rejected</option>
                      <option value="Issued to Site Floor">🔵 Issued to Site Floor</option>
                    </select>
                  </div>

                  {/* INVOICE / PO REFERENCE */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Invoice / PO Reference
                    </label>
                    <input
                      type="text"
                      value={poInvoiceRef}
                      onChange={(e) => setPoInvoiceRef(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleCreateBatchTag}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Batch Tag to Inventory Log</span>
                  </button>
                </div>

              </div>

              {/* RIGHT: DYNAMIC STICKER LABEL PREVIEW */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-600 shadow-2xl relative space-y-4">
                  
                  {/* LABEL BRANDING HEADER */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-3">
                    <div>
                      <div className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase font-mono">
                        2CLICK.IN BOQ MATERIAL BATCH TAG
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Verified Onsite Inventory Label
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white font-extrabold text-[10px] rounded uppercase font-mono">
                      {qualityStatus.split(' ')[0]}
                    </span>
                  </div>

                  {/* QR CODE DISPLAY */}
                  <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    {qrDataUrl ? (
                      <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                        <img src={qrDataUrl} alt="Material QR Tag" className="w-44 h-44 object-contain" />
                      </div>
                    ) : (
                      <div className="w-44 h-44 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                        Generating QR Code...
                      </div>
                    )}
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-widest">
                      BATCH #{batchLotNumber}
                    </div>
                  </div>

                  {/* MATERIAL & BATCH SPECIFICATIONS */}
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Material:</span>
                      <strong className="text-slate-900 dark:text-white">{currentBoqItem?.title}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Brand &amp; Grade:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{currentBoqItem?.brandName}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Batch Quantity:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{batchQty} {currentBoqItem?.unit}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Batch Value:</span>
                      <strong className="font-mono text-emerald-600">₹{(batchQty * (currentBoqItem?.unitRateINR || 0)).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Storage Bin:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{storageLocationZone}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Supplier:</span>
                      <span className="text-slate-800 dark:text-slate-200">{supplierName}</span>
                    </div>
                  </div>

                  {/* PRINT / DOWNLOAD ACTION BUTTONS */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={handlePrintTagLabel}
                      className="px-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Label Sticker</span>
                    </button>

                    <button
                      onClick={handleDownloadQrImage}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR PNG</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyPayload}
                    className="w-full py-1.5 text-[11px] font-mono text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied QR Payload!' : 'Copy Raw QR Code Payload JSON'}</span>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BATCH INVENTORY LOG TABLE */}
          {activeSubTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    Onsite Tagged Batch Inventory Log ({batchTags.length} Batches)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track physically tagged batch lots against master BOQ estimated quantities
                  </p>
                </div>

                <button
                  onClick={() => setActiveSubTab('generate')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Batch Tag</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3">Batch / Lot #</th>
                        <th className="p-3">BOQ Material &amp; Brand</th>
                        <th className="p-3 font-mono">Tagged Quantity</th>
                        <th className="p-3 font-mono">Batch Cost (₹)</th>
                        <th className="p-3">Storage Bin Location</th>
                        <th className="p-3">Inspection Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {batchTags.map((tag) => (
                        <tr key={tag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {tag.batchLotNumber}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{tag.materialTitle}</div>
                            <div className="text-[10px] text-slate-500">{tag.brandName} • {tag.supplierName}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {tag.quantity} {tag.unit}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            ₹{tag.totalBatchValueINR.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            {tag.storageLocationZone}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              {tag.qualityStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center space-x-2">
                            <button
                              onClick={() => {
                                setBatchLotNumber(tag.batchLotNumber);
                                setBatchQty(tag.quantity);
                                setSupplierName(tag.supplierName);
                                setStorageLocationZone(tag.storageLocationZone);
                                setQualityStatus(tag.qualityStatus);
                                setSelectedBoqItemId(tag.boqItemId);
                                setActiveSubTab('generate');
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold"
                            >
                              View / Reprint
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCANNER & VERIFICATION SIMULATOR */}
          {activeSubTab === 'scanner' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <ScanLine className="w-5 h-5 text-indigo-600" />
                  Onsite QR Code Verification Scanner Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Paste raw QR payload or test scan generated batch codes to verify authenticity and specs on mobile or floor tablet
                </p>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                <label className="text-xs font-bold text-slate-300 block">
                  Simulate Camera QR Reader Input (Paste Payload or Lot JSON):
                </label>
                <textarea
                  rows={4}
                  value={scanInputText}
                  onChange={(e) => setScanInputText(e.target.value)}
                  placeholder="Paste QR Code JSON string here or click Test Current Generated Batch..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestScan}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Decode &amp; Verify QR Tag</span>
                  </button>

                  <button
                    onClick={() => {
                      setScanInputText(payloadString);
                      handleTestScan();
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Load Active Form Payload
                  </button>
                </div>
              </div>

              {/* SCANNER RESULTS */}
              {scannedResult && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>AUTHENTIC 2CLICK.IN VERIFIED BATCH TAG</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 font-sans">
                    <div><span className="text-slate-500">Lot Number:</span> <strong className="font-mono text-slate-900 dark:text-white block">{scannedResult.batchLotNumber}</strong></div>
                    <div><span className="text-slate-500">Material Name:</span> <strong className="text-slate-900 dark:text-white block">{scannedResult.materialTitle}</strong></div>
                    <div><span className="text-slate-500">Brand:</span> <strong className="text-indigo-600 block">{scannedResult.brandName}</strong></div>
                    <div><span className="text-slate-500">Batch Qty:</span> <strong className="font-mono text-slate-900 dark:text-white block">{scannedResult.quantity} {scannedResult.unit}</strong></div>
                    <div><span className="text-slate-500">Supplier:</span> <strong className="text-slate-800 dark:text-slate-200 block">{scannedResult.supplierName}</strong></div>
                    <div><span className="text-slate-500">Storage Zone:</span> <strong className="text-slate-800 dark:text-slate-200 block">{scannedResult.storageLocationZone}</strong></div>
                    <div><span className="text-slate-500">Inspection:</span> <strong className="text-emerald-600 block">{scannedResult.qualityStatus}</strong></div>
                    <div><span className="text-slate-500">Invoice Ref:</span> <strong className="font-mono text-slate-800 dark:text-slate-200 block">{scannedResult.poInvoiceRef}</strong></div>
                  </div>
                </div>
              )}

              {scannerError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{scannerError}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-indigo-500" />
            <span>Printed tags can be attached to cement pallets, steel bundles, or tile crates for physical tracking.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
