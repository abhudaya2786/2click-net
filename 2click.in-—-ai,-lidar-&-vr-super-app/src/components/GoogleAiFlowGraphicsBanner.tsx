import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Bot, 
  Layers, 
  Workflow, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Boxes, 
  Code2, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

export const GoogleAiFlowGraphicsBanner: React.FC = () => {
  const [activeNode, setActiveNode] = useState<number>(1);

  const FLOW_NODES = [
    {
      id: 1,
      step: '01',
      title: 'Multimodal Drawing & Spec Ingestion',
      badge: '2Click AI Vision',
      desc: 'Ingests architectural CAD drawings, structural PDFs, and site progress photos via Google Gemini 3.6 Flash multimodal vision pipeline.',
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/50',
      icon: '📐'
    },
    {
      id: 2,
      step: '02',
      title: 'Real-time IS-Code Engine',
      badge: 'IS Code Compliance',
      desc: 'Cross-checks structural specifications with IS 456 (Concrete) and IS 1786 (Fe550D TMT Rebar) safety thresholds.',
      color: 'from-teal-500 to-emerald-600',
      borderColor: 'border-teal-500/50',
      icon: '⚡'
    },
    {
      id: 3,
      step: '03',
      title: 'D3 Market Price Sync & Off-Cut Bin-Packing',
      badge: 'Stock Optimization',
      desc: 'Calculates live 6-month regional wholesale price fluctuations and computes optimal commercial stock cutting layout to eliminate wastage.',
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500/50',
      icon: '📊'
    },
    {
      id: 4,
      step: '04',
      title: 'Automated Contractor BOQ Export',
      badge: 'Instant PDF / WhatsApp Quote',
      desc: 'Generates client-ready itemized bills of quantities with GST breakdown, contractor supervision margin, and site progress photo geotagging.',
      color: 'from-purple-500 to-indigo-600',
      borderColor: 'border-purple-500/50',
      icon: '📄'
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Background Animated Gradient Mesh Overlay */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner Branding Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 font-black text-[11px] border border-teal-500/40 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Powered by 2Click AI Civil Engine
            </span>
            <span className="text-xs font-mono text-slate-400">Gemini 3.6 Flash Vision Pipeline</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-teal-400" />
            Next-Gen AI Architectural Material Flow
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Interactive visual workflow illustrating how 2Click AI vision engine orchestrates end-to-end civil estimation, D3 market price tracking, and off-cut waste reduction.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">AI Flow Model Status</span>
            <span className="text-xs font-extrabold text-white flex items-center gap-1">
              Active Gemini 3.6 Flash Stream
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Flow Nodes Visual Diagram */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FLOW_NODES.map((node) => {
          const isSelected = activeNode === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group ${
                isSelected
                  ? `bg-slate-900/90 ${node.borderColor} ring-2 ring-teal-500/40 shadow-xl scale-[1.02]`
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Connecting Wireline indicator */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-slate-800 text-teal-400 border border-slate-700`}>
                  STEP {node.step}
                </span>
                <span className="text-2xl">{node.icon}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 inline-block">
                  {node.badge}
                </span>
                <h4 className="text-sm font-black text-white group-hover:text-teal-300 transition">
                  {node.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {node.desc}
                </p>
              </div>

              {/* Bottom Glowing Bar */}
              <div className={`w-full h-1 rounded-full bg-gradient-to-r ${node.color} opacity-80 group-hover:opacity-100 transition`}></div>
            </div>
          );
        })}
      </div>

      {/* Active Node Detail Card */}
      <div className="relative z-10 p-4 bg-slate-900/90 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-teal-400 font-extrabold block uppercase tracking-wide">
              Selected Flow Node: Step {FLOW_NODES[activeNode - 1].step}
            </span>
            <span className="text-sm font-extrabold text-white">
              {FLOW_NODES[activeNode - 1].title}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verified IS 456 &amp; IS 1786 Architectural Accuracy</span>
        </div>
      </div>

    </div>
  );
};
