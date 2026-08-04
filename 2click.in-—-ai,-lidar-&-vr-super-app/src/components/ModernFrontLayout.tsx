import React, { useState } from 'react';
import {
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Sun,
  Building2,
  CheckCircle2,
  Compass,
  Calculator,
  ShieldCheck,
  Zap,
  Truck,
  Camera,
  Activity,
  Box,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface ModernFrontLayoutProps {
  onExploreClick: () => void;
}

export const ModernFrontLayout: React.FC<ModernFrontLayoutProps> = ({ onExploreClick }) => {
  // Lumio Quick Calculator State
  const [plotAreaSqft, setPlotAreaSqft] = useState<number>(1200);
  const [selectedQuality, setSelectedQuality] = useState<'budget' | 'standard' | 'premium'>('standard');

  // Calculate instant estimated cost based on Lumio Stitch Engine rates
  const rates = { budget: 1550, standard: 1950, premium: 2600 };
  const estimatedCostLakhs = ((plotAreaSqft * rates[selectedQuality]) / 100000).toFixed(2);
  const steelTons = ((plotAreaSqft * 3.8) / 1000).toFixed(1);
  const cementBags = Math.round(plotAreaSqft * 0.42);

  // Lumio Connected Stitch Nodes Preview Selection
  const [activeNode, setActiveNode] = useState<string>('boq');

  return (
    <div className="min-h-screen google-stitch-bg text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Lumio Glowing Top Border Line */}
      <div className="w-full google-stitch-flow-line" />

      {/* Lumio Ambient Radial Light Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/25 via-purple-600/20 to-emerald-500/20 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-cyan-500/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Lumio Hero Container */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10 space-y-14">
        
        {/* Lumio Header Badge & Title */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs font-black shadow-2xl backdrop-blur-md">
            {/* Google Stitch Quad Color Nodes */}
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-ping"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span>
            </div>
            <span className="tracking-wide">LUMIO OS • 2CLICK CONNECTED AI ECOSYSTEM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Lumio AI Landing Page <br />
            <span className="lumio-gradient-text drop-shadow-lg">
              Powered by 2Click AI Canvas
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            2Click AI संचालित ल्यूमियो प्लेटफॉर्म — निर्माण लागत अनुमान, 3D वास्तु नक्शा, सोलर पैनल सब्सिडी एवं बीटूबी टेंडर इकोसिस्टम।
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="lumio-glow-button px-8 py-4 text-base flex items-center gap-3 cursor-pointer shadow-2xl"
            >
              <span>ल्यूमियो सुपर ऐप खोलें (Open Lumio Super App)</span>
              <ArrowRight size={20} />
            </button>

            <a
              href="#lumio-quick-calculator"
              className="google-flow-btn-secondary flex items-center gap-2 cursor-pointer"
            >
              <Calculator size={18} className="text-blue-400" />
              <span>त्वरित मटीरियल कैलकुलेटर (Instant Estimate)</span>
            </a>
          </div>
        </div>

        {/* LUMIO GOOGLE STITCH CONNECTED WORKFLOW PIPELINE INTERACTIVE CANVAS */}
        <div className="lumio-glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/20 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></span>
                <h2 className="text-xl font-black text-white">2Click Connected Workflow Nodes</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Select any connected node below to explore its live AI functionality</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 font-mono text-xs font-bold self-start md:self-auto">
              Lumio Pipeline: 7 Active AI Nodes
            </span>
          </div>

          {/* Connected Nodes Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'boq', label: 'AI BOQ Engine', icon: '🏗️', nodeColor: '#4285F4' },
              { id: 'solar', label: 'Solar Rooftop', icon: '☀️', nodeColor: '#FBBC05' },
              { id: 'naksha', label: '3D Vastu Naksha', icon: '🏛️', nodeColor: '#EA4335' },
              { id: 'lidar', label: 'LiDAR Survey', icon: '👓', nodeColor: '#34A853' },
              { id: 'tenders', label: 'Escrow Tenders', icon: '⚖️', nodeColor: '#A855F7' },
              { id: 'mart', label: '2Click Mart', icon: '🛒', nodeColor: '#06B6D4' }
            ].map((node) => {
              const isSelected = activeNode === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer text-left space-y-1 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-2 border-blue-400 shadow-xl shadow-blue-500/20 scale-[1.03]'
                      : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{node.icon}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-md"
                      style={{ backgroundColor: node.nodeColor }}
                    />
                  </div>
                  <div className="text-xs font-extrabold text-white truncate">{node.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Stitch Node Active</div>
                </button>
              );
            })}
          </div>

          {/* Active Node Detail Card */}
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Google Stitch Live Data Stream • Node ID: {activeNode.toUpperCase()}
              </span>
              <h3 className="text-lg font-black text-white">
                {activeNode === 'boq' && 'Lumio AI Construction BOQ & Material Estimator'}
                {activeNode === 'solar' && 'PM Surya Ghar Solar Subsidy & Grid Calculator'}
                {activeNode === 'naksha' && '3D CAD Architectural Naksha & Vastu Layouts'}
                {activeNode === 'lidar' && 'LiDAR Land Terrain & AR Measurement Camera'}
                {activeNode === 'tenders' && 'Legal Escrow B2B Contractor Tenders'}
                {activeNode === 'mart' && '2Click Hardware Mart & Fleet Logistics'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeNode === 'boq' && 'कंक्रीट, स्टील, ईंट, सीमेंट, टाइल्स व पेंट का सटीक मात्रा व सरकारी रेट ब्रेकडाउन तुरंत निकालें।'}
                {activeNode === 'solar' && 'सोलर पैनल किलोवाट क्षमता, पीएम सूर्य घर 78,000 रुपये सब्सिडी एवं मासिक बिजली बिल बचत का लाइव हिसाब।'}
                {activeNode === 'naksha' && '2D एवं 3D वास्तु सम्मत नक्शे, प्लॉट दिशा दिशा-निर्देश व इंटीरियर एस्टीमेट।'}
                {activeNode === 'lidar' && 'मोबाइल कैमरा द्वारा जियोटैग्ड कमरे की चौड़ाई, बीम स्पैन एवं 3D टरैन मैपिंग।'}
                {activeNode === 'tenders' && 'सत्यापित ठेकेदारों व वेंडर्स के बीच 2Click सुरक्षित एस्क्रो फंड नीलामी।'}
                {activeNode === 'mart' && 'टाटा टिसकॉन स्टील, अल्ट्राटेक सीमेंट, एसीसी एवं लॉजिस्टिक्स गाड़ियों की लाइव बुकिंग।'}
              </p>
            </div>

            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>यह टूल चलाएं (Launch Tool)</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* LUMIO INSTANT ESTIMATOR SANDBOX */}
        <div id="lumio-quick-calculator" className="lumio-glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-400">
                <Calculator size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Lumio Instant Plot Estimate Sandbox</h2>
                <p className="text-xs text-slate-400">Type your builtup area to see instant Google Stitch estimate calculation</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">
              CPWD DSR 2026 Rate Cards
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input Controls (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <label>Total Builtup Area (Sq.Ft)</label>
                  <span className="text-blue-400 font-mono text-sm font-black">{plotAreaSqft} sq.ft</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="10000"
                  step="50"
                  value={plotAreaSqft}
                  onChange={e => setPlotAreaSqft(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Construction Grade / Material Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'budget', label: 'Budget (₹1,550/sqft)' },
                    { id: 'standard', label: 'Standard (₹1,950/sqft)' },
                    { id: 'premium', label: 'Premium (₹2,600/sqft)' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuality(q.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selectedQuality === q.id
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Output Summary Cards (6 Cols) */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-blue-500/30 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Cost</span>
                <div className="text-xl font-black text-blue-400 font-mono">₹{estimatedCostLakhs} L</div>
                <span className="text-[9px] text-slate-500">Incl. Civil &amp; Finish</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">TMT Rebar Steel</span>
                <div className="text-xl font-black text-purple-400 font-mono">{steelTons} Tons</div>
                <span className="text-[9px] text-slate-500">Tata / JSW Fe550D</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Cement Required</span>
                <div className="text-xl font-black text-emerald-400 font-mono">{cementBags} Bags</div>
                <span className="text-[9px] text-slate-500">PPC 53 Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* LUMIO FEATURE GRID POWERED BY GOOGLE STITCH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="lumio-glass-card p-6 rounded-3xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-lg">
              <Cpu size={24} />
            </div>
            <h3 className="font-black text-base text-white flex items-center justify-between">
              <span>Lumio BOQ Engine v4.0</span>
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full font-mono">STITCH AI</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Stitch संचालित एल्गोरिदम से सिविल, प्लंबिंग, टाइल्स, पेंट, सोलर और इलेक्ट्रिकल का सटीक रेट एनालिसिस निकालें।
            </p>
          </div>

          <div className="lumio-glass-card p-6 rounded-3xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-lg">
              <Layers size={24} />
            </div>
            <h3 className="font-black text-base text-white flex items-center justify-between">
              <span>Google Flow Directory</span>
              <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded-full font-mono">FLOW LIVE</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              जिला व ब्लॉक स्तर पर सत्यापित ठेकेदार, हार्डवेयर दुकानें, राजमिस्त्री एवं लॉजिस्टिक्स पिकअप वाहन खोजें।
            </p>
          </div>

          <div className="lumio-glass-card p-6 rounded-3xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-black text-base text-white flex items-center justify-between">
              <span>Lumio Escrow &amp; Audit</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">ENCRYPTED</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              सुपर एडमिन, फील्ड इंजीनियर एवं वेंडर्स के बीच एस्क्रो फंड सुरक्षा एवं लीगल डिजिटल अनुबंध प्रणाली।
            </p>
          </div>
        </div>

      </main>

      {/* Lumio Footer */}
      <footer className="py-6 border-t border-blue-500/20 text-center text-xs text-slate-400 font-medium google-stitch-bg relative z-10">
        © 2026 Lumio OS • Powered by Google Stitch AI Canvas &amp; Google Flow Workflow Engine.
      </footer>

    </div>
  );
};


