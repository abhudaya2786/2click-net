import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Building2, 
  FileText, 
  Sparkles, 
  Calculator, 
  CheckCircle, 
  RefreshCw, 
  Printer, 
  Share2,
  PackageCheck,
  Bot,
  Plus,
  Trash2,
  ShieldCheck,
  PieChart,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  Check,
  Camera,
  FileDown,
  Download,
  Activity,
  Scissors,
  Scale,
  QrCode,
  Calendar
} from 'lucide-react';
import { QualityGrade, BOQResult, CustomCostItem } from '../types';
import { INDIAN_CITIES, SAMPLE_EMPANELLED_BRANDS } from '../data/initialData';
import { ConstructionProgressPhotos } from './ConstructionProgressPhotos';
import { AddCustomItemModal, CustomItemPayload } from './AddCustomItemModal';
import { VisualItemCard } from './VisualItemCard';
import { QuickUnitConverterModal } from './QuickUnitConverterModal';
import { MaterialPriceTrendsD3Chart } from './MaterialPriceTrendsD3Chart';
import { MaterialBudgetPieChart } from './MaterialBudgetPieChart';
import { AiWasteCalculatorModal } from './AiWasteCalculatorModal';
import { GoogleAiFlowGraphicsBanner } from './GoogleAiFlowGraphicsBanner';
import { SupplierSplitView } from './SupplierSplitView';
import { MaterialBatchQrModal } from './MaterialBatchQrModal';
import { ProjectGanttTimelineView } from './ProjectGanttTimelineView';

interface AiBoqCalculatorProps {
  selectedCity: string;
}

export const AiBoqCalculator: React.FC<AiBoqCalculatorProps> = ({ selectedCity }) => {
  const [projectType, setProjectType] = useState<string>('Residential Villa');
  const [builtupAreaSqft, setBuiltupAreaSqft] = useState<number>(1800);
  const [floors, setFloors] = useState<number>(2);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Premium');
  const [city, setCity] = useState<string>(selectedCity);
  const [customReqs, setCustomReqs] = useState<string>('Standard RCC frame, Fe550D TMT steel, 6-inch AAC blocks, Asian Paints Royale emulsion');
  const [wastageMarginPct, setWastageMarginPct] = useState<number>(5);

  const [activeTab, setActiveTab] = useState<'overview' | 'rate_editor' | 'client_breakup' | 'brands' | 'photos' | 'trends' | 'split_compare' | 'gantt_timeline'>('rate_editor');

  // Selected Brands for each construction vertical
  const [selectedBrands, setSelectedBrands] = useState<{ [key: string]: string }>({
    'Structure & RCC': 'UltraTech Cement & Tata Tiscon',
    'Electrical & Wiring': 'Polycab India Ltd.',
    'Plumbing & Water': 'Astral Pipes',
    'Flooring & Tiles': 'Kajaria Ceramics',
    'Paints & Finishes': 'Asian Paints',
    'Solar & Power': 'Waaree Energies'
  });

  // Project-Wise Material Presets Catalog
  const PROJECT_PRESETS: { [key: string]: { label: string; icon: string; items: CustomCostItem[] } } = {
    'Residential Villa': {
      label: '🏡 मकान / कोठी (Residential House)',
      icon: '🏡',
      items: [
        { id: 'RES-1', title: 'OPC / PPC 53 Grade Cement Bags', category: 'Structure & RCC', brandName: 'UltraTech Cement', unit: 'Bags (50kg)', unitRateINR: 380, quantity: 750, totalCostINR: 285000 },
        { id: 'RES-2', title: 'Fe 550D High Ductile TMT Steel Rebars', category: 'Structure & RCC', brandName: 'Tata Tiscon', unit: 'Metric Tonne (MT)', unitRateINR: 68000, quantity: 6.5, totalCostINR: 442000 },
        { id: 'RES-3', title: 'Red Bricks / 6-inch AAC Blocks', category: 'Masonry & AAC', brandName: 'Standard Certified', unit: 'Pieces', unitRateINR: 65, quantity: 4500, totalCostINR: 292500 },
        { id: 'RES-4', title: 'Asian Paints Royale & Putty Finish', category: 'Paints & Finishes', brandName: 'Asian Paints', unit: 'Sq.Ft Surface', unitRateINR: 42, quantity: 5000, totalCostINR: 210000 },
        { id: 'RES-5', title: 'Kajaria 2x2 Double Charge Vitrified Tiles', category: 'Flooring & Tiles', brandName: 'Kajaria Ceramics', unit: 'Sq.Ft', unitRateINR: 110, quantity: 1800, totalCostINR: 198000 },
        { id: 'RES-6', title: 'Havells FRLS Wires & Modular Switches', category: 'Electrical & Wiring', brandName: 'Havells India', unit: 'Sq.Ft Builtup', unitRateINR: 135, quantity: 1800, totalCostINR: 243000 },
        { id: 'RES-7', title: 'Astral CPVC Pipes & Jaquar Fixtures', category: 'Plumbing & Water', brandName: 'Astral & Jaquar', unit: 'Bath Set Units', unitRateINR: 38000, quantity: 4, totalCostINR: 152000 },
        { id: 'RES-8', title: 'Civil Mason & Contractor Labor Charge', category: 'Labor & Supervision', brandName: 'Local Verified Contractor', unit: 'Sq.Ft Builtup', unitRateINR: 310, quantity: 1800, totalCostINR: 558000 }
      ]
    },
    'Commercial Shop': {
      label: '🏪 दुकान व शोरूम (Commercial Shop & Office)',
      icon: '🏪',
      items: [
        { id: 'COM-1', title: 'Commercial Grade RCC Structure & Slab Cement', category: 'Structure & RCC', brandName: 'Ambuja / UltraTech', unit: 'Bags (50kg)', unitRateINR: 385, quantity: 500, totalCostINR: 192500 },
        { id: 'COM-2', title: 'Heavy Duty Structural Steel & TMT Bars', category: 'Structure & RCC', brandName: 'JSW Neosteel', unit: 'Metric Tonne (MT)', unitRateINR: 67000, quantity: 4.5, totalCostINR: 301500 },
        { id: 'COM-3', title: 'Toughened Glass Front Facade & Aluminium Frame', category: 'Doors & Windows', brandName: 'Saint-Gobain Glass', unit: 'Sq.Ft', unitRateINR: 450, quantity: 400, totalCostINR: 180000 },
        { id: 'COM-4', title: 'Motorized Rolling Shutter & Security Lock', category: 'Doors & Windows', brandName: 'Tata Steel Shutter', unit: 'Units', unitRateINR: 35000, quantity: 2, totalCostINR: 70000 },
        { id: 'COM-5', title: 'Heavy Commercial Vitrified Tiles (High Traffic)', category: 'Flooring & Tiles', brandName: 'Somany / Nitco', unit: 'Sq.Ft', unitRateINR: 125, quantity: 1200, totalCostINR: 150000 },
        { id: 'COM-6', title: 'Commercial 3-Phase Electric Wiring & LED Panel Lights', category: 'Electrical & Wiring', brandName: 'Schneider / Polycab', unit: 'Points', unitRateINR: 180, quantity: 1200, totalCostINR: 216000 },
        { id: 'COM-7', title: 'Commercial Interior Paint & False Ceiling', category: 'Paints & Finishes', brandName: 'Berger / Gyproc', unit: 'Sq.Ft', unitRateINR: 65, quantity: 2400, totalCostINR: 156000 }
      ]
    },
    'Paints & Renovation': {
      label: '🎨 पेंटिंग व पुट्टी वर्क (Paint & Wall Renovation)',
      icon: '🎨',
      items: [
        { id: 'PNT-1', title: 'Asian Paints Royale Luxury Emulsion (Interior)', category: 'Paints & Finishes', brandName: 'Asian Paints', unit: 'Liters', unitRateINR: 520, quantity: 60, totalCostINR: 31200 },
        { id: 'PNT-2', title: 'Apex Weatherproof Exterior Emulsion', category: 'Paints & Finishes', brandName: 'Asian Paints', unit: 'Liters', unitRateINR: 380, quantity: 40, totalCostINR: 15200 },
        { id: 'PNT-3', title: 'Birla White WallCare Waterproof Putty', category: 'Paints & Finishes', brandName: 'Birla White', unit: 'Bags (40kg)', unitRateINR: 880, quantity: 15, totalCostINR: 13200 },
        { id: 'PNT-4', title: 'Asian Paints SmartCare Damp Block Waterproofing', category: 'Paints & Finishes', brandName: 'Asian Paints', unit: 'Liters', unitRateINR: 450, quantity: 20, totalCostINR: 9000 },
        { id: 'PNT-5', title: 'Painter & Painter Helper Skilled Labor Charge', category: 'Labor & Supervision', brandName: 'Dukandar Verified Painter', unit: 'Sq.Ft', unitRateINR: 16, quantity: 3500, totalCostINR: 56000 }
      ]
    },
    'Tiles & Marble': {
      label: '🔲 टाइल्स व इटैलियन मार्बल (Tiles & Flooring)',
      icon: '🔲',
      items: [
        { id: 'TIL-1', title: 'Kajaria 800x800mm Double Charge Vitrified Tiles', category: 'Flooring & Tiles', brandName: 'Kajaria Ceramics', unit: 'Boxes (4 Tiles/Box)', unitRateINR: 850, quantity: 120, totalCostINR: 102000 },
        { id: 'TIL-2', title: 'Italian Marble / Premium Rajasthan Granite Slabs', category: 'Flooring & Tiles', brandName: 'Kishangarh Premium', unit: 'Sq.Ft', unitRateINR: 220, quantity: 400, totalCostINR: 88000 },
        { id: 'TIL-3', title: 'Roff T02 Waterproof Tile Adhesive Bags', category: 'Flooring & Tiles', brandName: 'Pidilite Roff', unit: 'Bags (20kg)', unitRateINR: 420, quantity: 35, totalCostINR: 14700 },
        { id: 'TIL-4', title: 'Epoxy Tile Joint Grout & Spacer Fittings', category: 'Flooring & Tiles', brandName: 'Laticrete', unit: 'Kits', unitRateINR: 650, quantity: 12, totalCostINR: 7800 },
        { id: 'TIL-5', title: 'Skilled Tile Fitting & Marble Polishing Labor', category: 'Labor & Supervision', brandName: 'Verified Masons', unit: 'Sq.Ft', unitRateINR: 35, quantity: 1500, totalCostINR: 52500 }
      ]
    },
    'Rooftop Solar': {
      label: '☀️ सोलर पावर प्लांट (Solar Rooftop System)',
      icon: '☀️',
      items: [
        { id: 'SOL-1', title: 'Waaree / Tata Power Mono PERC Solar Panels (540W)', category: 'Solar & Power', brandName: 'Waaree Energies', unit: 'Panels (6x540W)', unitRateINR: 14500, quantity: 6, totalCostINR: 87000 },
        { id: 'SOL-2', title: '3kW On-Grid Solar Hybrid Inverter with WiFi Dongle', category: 'Solar & Power', brandName: 'Havells / Growatt', unit: 'Units', unitRateINR: 38000, quantity: 1, totalCostINR: 38000 },
        { id: 'SOL-3', title: 'Hot Dip Galvanized High Wind Mounting Structure', category: 'Solar & Power', brandName: 'Standard GI', unit: 'Set', unitRateINR: 16000, quantity: 1, totalCostINR: 16000 },
        { id: 'SOL-4', title: '4 Sq.mm Solar DC Cable, AC Distribution Box & Lightning Arrester', category: 'Solar & Power', brandName: 'Polycab', unit: 'Lump sum Kit', unitRateINR: 18500, quantity: 1, totalCostINR: 18500 },
        { id: 'SOL-5', title: 'Net-Metering Govt Approval & Installation Supervision', category: 'Labor & Supervision', brandName: 'State Discom Vendor', unit: 'Process Fee', unitRateINR: 12000, quantity: 1, totalCostINR: 12000 }
      ]
    }
  };

  // Default Custom Material & Service Usage Rates state
  const [customItems, setCustomItems] = useState<CustomCostItem[]>(PROJECT_PRESETS['Residential Villa'].items);

  const handleSelectPreset = (key: string) => {
    setProjectType(key);
    if (PROJECT_PRESETS[key]) {
      setCustomItems(PROJECT_PRESETS[key].items);
    }
  };

  // Modal state for Enhanced Custom Item Creation with photo upload
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState<boolean>(false);
  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');

  const handleModalAddItem = (payload: CustomItemPayload) => {
    const newItem: CustomCostItem = {
      id: payload.id,
      title: payload.title,
      category: payload.category,
      brandName: payload.brandName || 'Custom Specified',
      unit: payload.unit,
      unitRateINR: payload.priceINR,
      quantity: payload.quantity,
      totalCostINR: payload.priceINR * payload.quantity,
      isCustomItem: true,
      imageUrl: payload.imageUrl,
      isActive: true
    };

    setCustomItems((prev) => [newItem, ...prev]);
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Dynamically calculate total budget based on custom usage rates and wastage margin
  const rawTotalINR = useMemo(() => {
    return customItems.reduce((acc, item) => acc + (item.unitRateINR * item.quantity), 0);
  }, [customItems]);

  const calculatedTotalINR = useMemo(() => {
    return Math.round(rawTotalINR * (1 + (wastageMarginPct || 0) / 100));
  }, [rawTotalINR, wastageMarginPct]);

  const calculatedRatePerSqft = useMemo(() => {
    if (!builtupAreaSqft || builtupAreaSqft <= 0) return 0;
    return Math.round(calculatedTotalINR / builtupAreaSqft);
  }, [calculatedTotalINR, builtupAreaSqft]);

  const wastageAmountINR = useMemo(() => {
    return Math.round(rawTotalINR * ((wastageMarginPct || 0) / 100));
  }, [rawTotalINR, wastageMarginPct]);

  const contractorProfitINR = useMemo(() => {
    return Math.round(calculatedTotalINR * 0.10);
  }, [calculatedTotalINR]);

  const gstAmountINR = useMemo(() => {
    return Math.round(calculatedTotalINR * 0.18);
  }, [calculatedTotalINR]);

  // Group expenditure by category for client breakup
  const categoryBreakdown = useMemo(() => {
    const groups: { [key: string]: number } = {};
    customItems.forEach(item => {
      const cat = item.category;
      const amt = item.unitRateINR * item.quantity;
      groups[cat] = (groups[cat] || 0) + amt;
    });

    return Object.keys(groups).map(cat => {
      const amt = groups[cat];
      const pct = calculatedTotalINR > 0 ? Math.round((amt / calculatedTotalINR) * 100) : 0;
      return {
        category: cat,
        amount: amt,
        percentage: pct,
        itemsCount: customItems.filter(i => i.category === cat).length
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [customItems, calculatedTotalINR]);



  // Update item rate or quantity inline
  const handleUpdateItemRateOrQty = (id: string, field: 'unitRateINR' | 'quantity', value: number) => {
    setCustomItems(customItems.map(item => {
      if (item.id === id) {
        const updatedRate = field === 'unitRateINR' ? value : item.unitRateINR;
        const updatedQty = field === 'quantity' ? value : item.quantity;
        return {
          ...item,
          [field]: value,
          totalCostINR: updatedRate * updatedQty
        };
      }
      return item;
    }));
  };

  // Remove an item
  const handleRemoveItem = (id: string) => {
    setCustomItems(customItems.filter(i => i.id !== id));
  };

  // Run AI Re-estimate
  const generateBOQ = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType,
          builtupAreaSqft,
          floors,
          locationCity: city,
          qualityGrade,
          customRequirements: customReqs + (aiPrompt ? ` | Instruction: ${aiPrompt}` : '')
        })
      });
      const data = await res.json();
      if (data.boq) {
        alert('AI updated civil matrix parameters!');
      }
    } catch (err) {
      console.error('Failed to generate BOQ:', err);
    } finally {
      setLoading(false);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState<CustomCostItem | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('2CLICK.IN | OFFICIAL AI BOQ & MATERIAL QUOTATION', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('Smart Civil Material Cost Estimator & Empanelled Brand Price Matrix', 14, 18);

      const docId = `BOQ-2C-${Math.floor(100000 + Math.random() * 900000)}`;
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 184, 166); // teal-400
      doc.text(`Doc Ref: ${docId}`, pageWidth - 14, 12, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`Date: ${dateStr}`, pageWidth - 14, 18, { align: 'right' });

      // Accent Strip
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 28, pageWidth, 2, 'F');

      let currentY = 36;

      // Project Parameters Card
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, pageWidth - 28, 28, 3, 3, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Project Type: ${projectType}`, 18, currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Built-up Area: ${builtupAreaSqft} Sq.Ft (${floors} Floors)  |  Grade: ${qualityGrade}`, 18, currentY + 13);
      doc.text(`Site Location: ${city}  |  Site Wastage Allowance: +${wastageMarginPct}%`, 18, currentY + 19);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text(`Rs. ${(calculatedTotalINR / 100000).toFixed(2)} Lakhs`, pageWidth - 18, currentY + 8, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total: Rs. ${calculatedTotalINR.toLocaleString('en-IN')}`, pageWidth - 18, currentY + 14, { align: 'right' });
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(`Rate: Rs. ${calculatedRatePerSqft} / Sq.Ft`, pageWidth - 18, currentY + 20, { align: 'right' });

      currentY += 34;

      // Section 1: Category Wise Cost Allocation Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Category-Wise Expenditure Allocation', 14, currentY);
      currentY += 4;

      const categoryRows = categoryBreakdown.map((cat, idx) => [
        (idx + 1).toString(),
        cat.category,
        `${cat.itemsCount} material items`,
        `${cat.percentage}%`,
        `Rs. ${cat.amount.toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Material & Service Vertical', 'Item Count', '% Budget Share', 'Total Category Cost (INR)']],
        body: categoryRows,
        foot: [['', 'TOTAL RAW MATERIALS ALLOCATION', `${customItems.length} items`, '100%', `Rs. ${rawTotalINR.toLocaleString('en-IN')}`]],
        theme: 'grid',
        headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 9;

      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Section 2: Detailed Itemized BOQ Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Detailed Itemized Bill of Quantities (BOQ) & Material Rates', 14, currentY);
      currentY += 4;

      const itemRows = customItems.map((item, idx) => [
        (idx + 1).toString(),
        item.title,
        item.category,
        item.brandName || 'Standard Certified',
        `${item.quantity} ${item.unit}`,
        `Rs. ${item.unitRateINR.toLocaleString('en-IN')}`,
        `Rs. ${item.totalCostINR.toLocaleString('en-IN')}`
      ]);

      const wastageAmount = Math.round(rawTotalINR * (wastageMarginPct / 100));

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Material Description', 'Category', 'Brand / Spec', 'Qty & Unit', 'Unit Rate', 'Total Cost']],
        body: itemRows,
        foot: [
          ['', 'RAW MATERIAL SUBTOTAL', '', '', '', '', `Rs. ${rawTotalINR.toLocaleString('en-IN')}`],
          ['', `SITE WASTAGE & CONTINGENCY (+${wastageMarginPct}%)`, '', '', '', '', `Rs. ${wastageAmount.toLocaleString('en-IN')}`],
          ['', 'GRAND TOTAL ESTIMATED BUDGET', '', '', '', '', `Rs. ${calculatedTotalINR.toLocaleString('en-IN')}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 52 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 20, halign: 'right' },
          6: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 9;

      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Section 3: Client Milestone Payment Schedule
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Construction Milestone Disbursement Schedule', 14, currentY);
      currentY += 4;

      const scheduleRows = [
        ['Stage 1 (15%)', 'Foundation & Sub-Structure Work', 'Excavation, footing concrete & plinth beam', `Rs. ${Math.round(calculatedTotalINR * 0.15).toLocaleString('en-IN')}`],
        ['Stage 2 (30%)', 'RCC Super-Structure Slabs', 'Columns, beams & floor slab casting', `Rs. ${Math.round(calculatedTotalINR * 0.30).toLocaleString('en-IN')}`],
        ['Stage 3 (20%)', 'Masonry & Plaster Work', 'AAC block walls & internal/external plaster', `Rs. ${Math.round(calculatedTotalINR * 0.20).toLocaleString('en-IN')}`],
        ['Stage 4 (20%)', 'Electrical, Plumbing & Flooring', 'Wiring, piping, tile laying & door frames', `Rs. ${Math.round(calculatedTotalINR * 0.20).toLocaleString('en-IN')}`],
        ['Stage 5 (15%)', 'Finishing & Handover', 'Painting, fixtures, solar & final site cleanup', `Rs. ${Math.round(calculatedTotalINR * 0.15).toLocaleString('en-IN')}`]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Milestone Stage', 'Construction Scope', 'Work Included', 'Target Disbursement']],
        body: scheduleRows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 50, fontStyle: 'bold' },
          2: { cellWidth: 65 },
          3: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = 20;
      }

      // Section 4: Empanelled Brands Specified
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('4. Empanelled Material Brands Specified:', 14, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      const brandEntries = Object.entries(selectedBrands);
      brandEntries.forEach(([vertical, brandName]) => {
        if (currentY > pageHeight - 35) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(`• ${vertical}: ${brandName}`, 18, currentY);
        currentY += 4;
      });

      currentY += 6;

      if (currentY > pageHeight - 35) {
        doc.addPage();
        currentY = 20;
      }

      // Terms Divider & Signatures
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Disclaimer: This BOQ document is auto-generated using 2Click.in real-time regional civil market matrices.', 14, currentY);
      doc.text('Material rates are subject to local market fluctuations. Site validation recommended before final procurement.', 14, currentY + 3.5);

      currentY += 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('_________________________________', 14, currentY);
      doc.text('Authorized Estimator (2Click.in)', 14, currentY + 4.5);

      doc.text('_________________________________', pageWidth - 14, currentY, { align: 'right' });
      doc.text('Client Approval & Acceptance', pageWidth - 14, currentY + 4.5, { align: 'right' });

      // Page Footers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages}  |  2click.in AI Material Calculator Quotation`, pageWidth / 2, pageHeight - 7, { align: 'center' });
      }

      doc.save(`BOQ_Quotation_${projectType.replace(/[^a-zA-Z0-9]/g, '_')}_${builtupAreaSqft}sqft.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF BOQ document:', err);
      alert('Error generating PDF document. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    const summaryText = `*2click.in AI Project Material Quotation*\n` +
      `*Project:* ${projectType} (${builtupAreaSqft} Sq.Ft - ${city})\n` +
      `*Total Estimate:* ₹${(calculatedTotalINR / 100000).toFixed(2)} Lakhs (₹${calculatedTotalINR.toLocaleString('en-IN')})\n` +
      `*Effective Rate:* ₹${calculatedRatePerSqft}/sq.ft (+${wastageMarginPct}% wastage included)\n\n` +
      `*Key Material Items:* \n` +
      customItems.slice(0, 5).map(i => `• ${i.title}: ${i.quantity} ${i.unit} @ ₹${i.unitRateINR} = ₹${i.totalCostINR.toLocaleString('en-IN')}`).join('\n') +
      `\n\nGenerated via 2click.in AI Material Calculator.`;

    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Construction Calculator &amp; Client Breakup Studio</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Customizable material usage rates, empanelled brand pricing, and item-wise cost breakup for clients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConverterOpen(true)}
            className="px-3 py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>📐 Unit Converter (इकाई)</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExportingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Export BOQ PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> WhatsApp Quote
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Construction Cost Summary Header */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-teal-800/60 pb-4 md:pb-0 md:pr-6 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                {qualityGrade} Grade
              </span>
              <span className="text-xs text-slate-300">• {builtupAreaSqft} Sq.Ft Built-up ({city})</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {projectType} Construction Budget
            </h2>
            <p className="text-xs text-teal-200">
              Live calculated using {customItems.length} customized material &amp; labor rate items.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Project Cost</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">
              ₹{(calculatedTotalINR / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[11px] text-slate-300">₹{calculatedTotalINR.toLocaleString('en-IN')} Total</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Effective Construction Rate</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              ₹{calculatedRatePerSqft} <span className="text-xs text-slate-300 font-normal">/ sq.ft</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Empanelled Brand Rates Applied
            </span>
          </div>

        </div>
      </div>

      {/* Google Stitch AI & Google Flow Architectural Pipeline Graphic Banner */}
      <GoogleAiFlowGraphicsBanner />

      {/* Navigation Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('rate_editor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rate_editor'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Usage Rate &amp; Material Customizer ({customItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('client_breakup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'client_breakup'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Client Complete Cost Breakup</span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'brands'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Empanelled Brands &amp; Discounts</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Project Parameters &amp; Raw Material Requirements</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'trends'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-teal-400" />
          <span>📈 6-Mo Price Trends (D3 Chart)</span>
        </button>

        <button
          onClick={() => setActiveTab('split_compare')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'split_compare'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
          }`}
        >
          <Scale className="w-4 h-4 text-indigo-500" />
          <span>⚖️ Split-View Supplier Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'photos'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>📸 Site Progress Photos &amp; Geotagging</span>
        </button>
      </div>

      {/* TAB 1: USAGE RATE & MATERIAL CUSTOMIZER */}
      {activeTab === 'rate_editor' && (
        <div className="space-y-6">

          {/* Project-Wise Preset Selector Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Project-Wise AI Material Presets (प्रोजेक्ट-अनुसार मटेरियल कैलकुलेटर):
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Site Wastage Margin:</span>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {[0, 3, 5, 10].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWastageMarginPct(w)}
                      className={`px-2 py-0.5 rounded-md font-bold transition text-[10px] ${
                        wastageMarginPct === w
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      +{w}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {Object.keys(PROJECT_PRESETS).map((presetKey) => {
                const preset = PROJECT_PRESETS[presetKey];
                const isSelected = projectType === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(presetKey)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs ring-2 ring-teal-500/30'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-base mb-1">
                      <span>{preset.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight block">
                      {presetKey}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      {preset.items.length} Customizable Items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced "➕ Add Custom Item" Action Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-6 rounded-3xl border border-teal-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30">
                  Dynamic Visual BOQ Engine
                </span>
                <span className="text-xs text-slate-300">• Double-click item photos for 3D/HD Fullscreen</span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Custom Construction &amp; Material Line Items
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Add custom equipment, specialized finishes, or subcontractor quotes with image attachment (Photo upload, URL, or Preset library) and auto-recalculate project budget.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Quick Budget Pie Chart Jump Button */}
              <button
                type="button"
                onClick={() => setActiveTab('client_breakup')}
                className="px-3.5 py-2.5 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/50 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <PieChart className="w-4 h-4 text-teal-400" />
                <span>📊 Budget Pie Chart</span>
              </button>

              {/* Quick D3 Price Trends Jump Button */}
              <button
                type="button"
                onClick={() => setActiveTab('trends')}
                className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Activity className="w-4 h-4 text-teal-400" />
                <span>📈 6-Mo D3 Trends</span>
              </button>

              {/* AI Waste Calculator Trigger Button */}
              <button
                type="button"
                onClick={() => setIsWasteModalOpen(true)}
                className="px-3.5 py-2.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/50 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>✂️ AI Waste Calc</span>
              </button>

              {/* Material QR Batch Tag Generator Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedItemForQr(null);
                  setIsQrModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/50 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>🏷️ QR Batch Tags</span>
              </button>

              {/* Gantt Timeline & Order Tracker Jump Button */}
              <button
                type="button"
                onClick={() => setActiveTab('gantt_timeline')}
                className="px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>📅 Gantt Timeline</span>
              </button>

              {/* View Format Switch */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewFormat('cards')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    viewFormat === 'cards' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🖼️ Visual Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat('table')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    viewFormat === 'table' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📊 Compact Table
                </button>
              </div>

              {/* Add Custom Item Modal Trigger Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>➕ Add Custom Item (फोटो जोड़ें)</span>
              </button>
            </div>
          </div>

          {/* Visual Cards View Mode */}
          {viewFormat === 'cards' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Displaying {customItems.length} Visual Material Cards:</span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                  💡 Double-click any photo thumbnail to inspect in 3D/HD Fullscreen mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {customItems.map((item) => (
                  <VisualItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    category={item.category}
                    priceINR={item.unitRateINR}
                    unit={item.unit}
                    quantity={item.quantity}
                    brandName={item.brandName}
                    imageUrl={item.imageUrl}
                    isActive={item.isActive !== false}
                    isCustomItem={item.isCustomItem}
                    onRemoveItem={handleRemoveItem}
                    onOpenQrTag={() => {
                      setSelectedItemForQr(item);
                      setIsQrModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Table View Mode */
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    Itemized Material &amp; Labor Rate Table
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Edit Unit Rates or Quantities directly below to dynamically adjust construction price
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-full border border-amber-500/30">
                  Live Calculator Sync
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Material / Service Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Brand / Make</th>
                      <th className="p-3">Unit Rate (₹)</th>
                      <th className="p-3">Quantity &amp; Unit</th>
                      <th className="p-3">Total Cost (INR)</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {customItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.isCustomItem && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-teal-600 dark:text-teal-400">
                            {item.brandName}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              value={item.unitRateINR}
                              onChange={(e) => handleUpdateItemRateOrQty(item.id, 'unitRateINR', Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemRateOrQty(item.id, 'quantity', Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <span className="text-[11px] text-slate-500">{item.unit}</span>
                          </div>
                        </td>

                        <td className="p-3 font-extrabold text-teal-700 dark:text-teal-300 text-sm">
                          ₹{item.totalCostINR.toLocaleString('en-IN')}
                        </td>

                        <td className="p-3 text-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedItemForQr(item);
                              setIsQrModalOpen(true);
                            }}
                            title="Generate QR Batch Tag for this material"
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove item"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CLIENT COMPLETE COST BREAKUP */}
      {activeTab === 'client_breakup' && (
        <div className="space-y-6">
          
          {/* Interactive D3/SVG Material Budget Pie Chart Card */}
          <MaterialBudgetPieChart
            categoryBreakdown={categoryBreakdown}
            customItems={customItems}
            totalBudgetINR={calculatedTotalINR}
            rawTotalINR={rawTotalINR}
            wastageAmountINR={wastageAmountINR}
            contractorProfitINR={contractorProfitINR}
            gstAmountINR={gstAmountINR}
            wastageMarginPct={wastageMarginPct}
          />
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-teal-600" />
                  Client Expenditure Category-wise Breakup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full transparent breakdown of total ₹{calculatedTotalINR.toLocaleString('en-IN')} project allocation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>Export PDF Document</span>
                </button>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800">
                  100% Itemized Transparency
                </span>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{cat.category}</span>
                      <span className="text-[10px] text-slate-500">{cat.itemsCount} material &amp; labor items</span>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-xs rounded-lg">
                      {cat.percentage}%
                    </span>
                  </div>

                  <div className="text-lg font-extrabold text-teal-700 dark:text-teal-300">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full" 
                      style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Stage / Milestone Payment Schedule for Client */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Client Milestone Payment &amp; Expenditure Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stage-wise disbursement breakdown as construction progresses on site
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Stage 1 (15%)</div>
                <div className="font-bold text-slate-900 dark:text-white">Foundation &amp; Sub-structure</div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{Math.round(calculatedTotalINR * 0.15).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500">Excavation, footing concrete &amp; plinth beam</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Stage 2 (30%)</div>
                <div className="font-bold text-slate-900 dark:text-white">RCC Super-Structure Slabs</div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{Math.round(calculatedTotalINR * 0.30).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500">Columns, beams &amp; floor slab casting</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Stage 3 (20%)</div>
                <div className="font-bold text-slate-900 dark:text-white">Masonry &amp; Plaster Work</div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{Math.round(calculatedTotalINR * 0.20).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500">AAC block walls &amp; internal/external plaster</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Stage 4 (20%)</div>
                <div className="font-bold text-slate-900 dark:text-white">Electrical, Plumbing &amp; Flooring</div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{Math.round(calculatedTotalINR * 0.20).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500">Wiring, piping, tile laying &amp; door frames</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Stage 5 (15%)</div>
                <div className="font-bold text-slate-900 dark:text-white">Painting, Solar &amp; Handover</div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹{Math.round(calculatedTotalINR * 0.15).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-500">Painting, solar setup, cleaning &amp; key handover</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EMPANELLED BRANDS & DISCOUNTS */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Empannelled Construction Brands &amp; Dukandar Trade Discounts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecting brands sets preferred specifications in civil calculator estimates
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800">
                10 Tier-1 Brands Empanelled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {SAMPLE_EMPANELLED_BRANDS.map((brand) => (
                <div key={brand.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {brand.brandName}
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                      </span>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block">{brand.category}</span>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-md">
                      {brand.defaultDiscountPct}% OFF MRP
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">Standards:</span> {brand.approvedStandards}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">Warranty Policy:</span> {brand.warrantyPolicy}</div>
                    <div><span className="font-semibold text-slate-700 dark:text-slate-300">HQ:</span> {brand.headquarters}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">{brand.itemCount} Listed Items</span>
                    <button
                      onClick={() => alert(`Brand ${brand.brandName} set as preferred brand for calculator!`)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition"
                    >
                      Use Brand Rates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: OVERVIEW & RAW MATERIAL SNAPSHOT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Calculator className="w-4 h-4 text-teal-600" />
              Project Parameters
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Category
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Residential Villa">Residential Independent Villa</option>
                <option value="Apartment Building">Multi-story Apartment Block</option>
                <option value="Commercial Office">Commercial / Retail Space</option>
                <option value="Industrial Shed">Industrial Warehouse / Factory Shed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Built-up Area (Sq.Ft)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsConverterOpen(true)}
                    className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    📐 Convert (m²/Gaj)
                  </button>
                </div>
                <input
                  type="number"
                  value={builtupAreaSqft}
                  onChange={(e) => setBuiltupAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Floors Count
                </label>
                <select
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value={1}>Ground Only (G)</option>
                  <option value={2}>G + 1 Floor</option>
                  <option value={3}>G + 2 Floors</option>
                  <option value={4}>G + 3 Floors</option>
                  <option value={5}>G + 4 Floors</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location City Benchmark
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              >
                {INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quality Specification Grade
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                {(['Standard', 'Premium', 'Luxury'] as QualityGrade[]).map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQualityGrade(q)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      qualityGrade === q 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Structural Notes
              </label>
              <textarea
                rows={3}
                value={customReqs}
                onChange={(e) => setCustomReqs(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={generateBOQ}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Civil AI Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recalculate AI Matrix</span>
                </>
              )}
            </button>
          </div>

          {/* Right Material Quantity Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-slate-700 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-teal-400" />
                Estimated Key Raw Material Quantity Requirements ({builtupAreaSqft} Sq.Ft)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">{Math.round(builtupAreaSqft * 0.42)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Cement Bags (50kg)</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">{(builtupAreaSqft * 0.0038).toFixed(2)} MT</div>
                  <div className="text-[10px] text-slate-400 font-medium">TMT Steel Fe550D</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">{Math.round(builtupAreaSqft * 18)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Bricks / AAC Blocks</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">{Math.round(builtupAreaSqft * 1.2)} CFT</div>
                  <div className="text-[10px] text-slate-400 font-medium">M-Sand / Plaster Sand</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">{Math.round(builtupAreaSqft * 1.1)} CFT</div>
                  <div className="text-[10px] text-slate-400 font-medium">20mm Coarse Aggregate</div>
                </div>
              </div>
            </div>

            {/* AI Prompt Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-teal-600" />
                Ask AI to Refine or Optimize this BOQ:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Reduce cost by switching to AAC blocks or optimizing steel grade..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={generateBOQ}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <span>Apply AI Fix</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: MATERIAL PRICE TRENDS (D3 CHART) */}
      {activeTab === 'trends' && (
        <MaterialPriceTrendsD3Chart
          selectedCity={city}
          onCityChange={(newCity) => setCity(newCity)}
        />
      )}

      {/* TAB 6: SITE PROGRESS PHOTOS & GEOTAGGING */}
      {activeTab === 'photos' && (
        <ConstructionProgressPhotos
          selectedCity={city}
          defaultProjectName={`${projectType} - ${city}`}
          projectDimensions={{
            builtupAreaSqft: builtupAreaSqft,
            lengthFt: Math.round(Math.sqrt(builtupAreaSqft) * 1.25 * 10) / 10,
            widthFt: Math.round(Math.sqrt(builtupAreaSqft) / 1.25 * 10) / 10,
            heightFt: 10.5
          }}
        />
      )}

      {/* TAB 7: SPLIT-VIEW SUPPLIER COMPARISON */}
      {activeTab === 'split_compare' && (
        <SupplierSplitView
          customItems={customItems}
          builtupAreaSqft={builtupAreaSqft}
          selectedCity={city}
          projectType={projectType}
          onApplyRatesToBoq={(updatedItems) => {
            setCustomItems(updatedItems);
          }}
        />
      )}

      {/* TAB 8: GANTT TIMELINE & BOQ ORDER TRACKER */}
      {activeTab === 'gantt_timeline' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-5 rounded-3xl border border-teal-500/30 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div>
              <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider">
                BOQ Material Linked Schedule
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Project Gantt Timeline &amp; Material Order Tracker
              </h2>
              <p className="text-xs text-slate-300">
                Tracking {customItems.length} active material items &amp; site milestones for {projectType} ({city}).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('rate_editor')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            >
              ← Return to BOQ Table
            </button>
          </div>

          <ProjectGanttTimelineView selectedCity={city} boqItems={customItems} />
        </div>
      )}

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleModalAddItem}
        moduleName="Civil BOQ & Materials"
      />

      {/* Quick Unit Converter Modal */}
      <QuickUnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        currentBuiltupSqft={builtupAreaSqft}
        onApplyAreaToProject={(newAreaSqft) => setBuiltupAreaSqft(newAreaSqft)}
      />

      {/* AI Off-cut Waste Calculator Modal */}
      <AiWasteCalculatorModal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        onApplyToBoq={(optimizedQty, wastagePct) => {
          setWastageMarginPct(wastagePct);
        }}
      />

      {/* Onsite Material Batch QR Tag Generator Modal */}
      <MaterialBatchQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        boqItems={customItems}
        selectedItemForTag={selectedItemForQr}
        projectName={`${projectType} - ${city}`}
        selectedCity={city}
      />

    </div>
  );
};
