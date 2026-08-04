import React, { useState } from 'react';
import { 
  Eye, 
  Layers, 
  Sun, 
  Moon, 
  Maximize, 
  Info, 
  Compass, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SAMPLE_VR_SCENES } from '../data/initialData';
import { VRScene } from '../types';

export const VrWalkthroughViewer: React.FC = () => {
  const [scenes] = useState<VRScene[]>(SAMPLE_VR_SCENES);
  const [activeSceneId, setActiveSceneId] = useState<string>(SAMPLE_VR_SCENES[0].id);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <Eye className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">360° Interactive VR & BIM Spatial Walkthrough</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Experience photorealistic virtual reality models with BIM wireframe overlays & structural inspection points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
            <span>{isNightMode ? 'Day Mode' : 'Night Lighting'}</span>
          </button>
        </div>
      </div>

      {/* Scene Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => {
              setActiveSceneId(scene.id);
              setSelectedHotspot(null);
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSceneId === scene.id
                ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-violet-400'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase opacity-80">{scene.category}</div>
              <div className="text-xs font-bold mt-0.5">{scene.title}</div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main 360 VR Canvas Window */}
        <div className="lg:col-span-8">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 group min-h-[460px]">
            
            {/* Scene Image */}
            <img
              src={activeScene.panoramaUrl}
              alt={activeScene.title}
              referrerPolicy="no-referrer"
              className={`w-full h-[460px] object-cover transition-all duration-700 ${
                wireframeMode ? 'filter invert brightness-75 contrast-200 opacity-70' : ''
              } ${isNightMode ? 'brightness-50 contrast-125' : ''}`}
            />

            {/* Canvas Header Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                360° VR Scene: {activeScene.title}
              </span>

              {activeScene.wireframeModeAvailable && (
                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition backdrop-blur-md border ${
                    wireframeMode 
                      ? 'bg-violet-600 text-white border-violet-400' 
                      : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" />
                  {wireframeMode ? 'Disable Wireframe' : 'BIM Wireframe Overlay'}
                </button>
              )}
            </div>

            {/* Hotspots Pin Overlay */}
            {activeScene.hotspots.map((hs) => (
              <button
                key={hs.id}
                onClick={() => setSelectedHotspot(hs)}
                style={{ top: `${hs.y}%`, left: `${hs.x}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group/pin"
              >
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-violet-600 text-white items-center justify-center text-[10px] font-bold shadow-lg border-2 border-white">
                    i
                  </span>
                </span>
                <span className="absolute left-7 top-0 hidden group-hover/pin:block bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded whitespace-nowrap border border-slate-700 shadow-xl">
                  {hs.label}
                </span>
              </button>
            ))}

            {/* Bottom VR Nav Hint */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-white/80 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 z-20">
              <span>Click hotspots (i) to inspect structural & architectural details.</span>
              <span className="font-mono text-violet-300">VR Gyro Active</span>
            </div>

          </div>
        </div>

        {/* Right Inspection Details Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Info className="w-4 h-4 text-violet-600" />
              Structural / Architectural Inspector
            </h3>

            {selectedHotspot ? (
              <div className="space-y-3 fade-in">
                <div className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 text-[10px] font-bold inline-block">
                  Hotspot Inspection Point
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedHotspot.label}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedHotspot.details}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs">Click any hotspot icon (i) in the 360° VR view to inspect technical specifications.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">VR Walkthrough Features:</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> WebXR & Oculus Headset Compatible</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Real-time Structural BIM rebar overlay</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Sun position & shadow analysis</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
