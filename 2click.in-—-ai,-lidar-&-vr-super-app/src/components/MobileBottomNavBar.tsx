import React, { useState } from 'react';
import { 
  Home, 
  Hammer, 
  Compass, 
  Bot, 
  Smartphone, 
  Store,
  Grid
} from 'lucide-react';
import { MobileApkInstallModal } from './MobileApkInstallModal';

interface MobileBottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleCopilot: () => void;
}

export const MobileBottomNavBar: React.FC<MobileBottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  onToggleCopilot
}) => {
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-1.5 px-3 shadow-2xl flex items-center justify-around text-white">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
            activeTab === 'home'
              ? 'text-teal-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">होम (Home)</span>
        </button>

        {/* Tab 2: Dukandar Market */}
        <button
          onClick={() => setActiveTab('dukandar_market')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
            activeTab === 'dukandar_market'
              ? 'text-teal-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">2click Mart 🛒</span>
        </button>

        {/* Tab 3: Civil BOQ */}
        <button
          onClick={() => setActiveTab('construction')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
            activeTab === 'construction'
              ? 'text-teal-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hammer className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">BOQ रेट</span>
        </button>

        {/* Tab 4: Naksha */}
        <button
          onClick={() => setActiveTab('naksha_vastu')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
            activeTab === 'naksha_vastu'
              ? 'text-teal-400 font-extrabold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">नक्शा</span>
        </button>

        {/* Tab 5: Mobile App / APK install */}
        <button
          onClick={() => setIsApkModalOpen(true)}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-emerald-400 font-black animate-pulse"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">App / APK</span>
        </button>
      </div>

      <MobileApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </>
  );
};
