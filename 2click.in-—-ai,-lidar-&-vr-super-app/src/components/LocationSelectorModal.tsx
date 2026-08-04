import React, { useState } from 'react';
import { MapPin, Building, Compass, CheckCircle2, Navigation, Search, X, Sparkles } from 'lucide-react';
import { INDIAN_LOCATION_HIERARCHY, StateDetail, DistrictDetail, SubDistrictMandal, AreaDetail } from '../data/locationHierarchy';
import { useLocationScope } from '../context/LocationContext';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (locData: {
    state: string;
    district: string;
    subDistrict: string;
    areaName: string;
    pincode: string;
  }) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation
}) => {
  const { setSelectedCity, setPinCode } = useLocationScope();

  // State selections (Default: Lucknow, Uttar Pradesh)
  const [selectedStateName, setSelectedStateName] = useState<string>('Uttar Pradesh (उत्तर प्रदेश)');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Lucknow (लखनऊ)');
  const [selectedSubDistrictName, setSelectedSubDistrictName] = useState<string>('Lucknow Sadar (लखनऊ सदर)');
  const [selectedAreaName, setSelectedAreaName] = useState<string>('Hazratganj (हजरतगंज)');
  const [selectedPinCode, setSelectedPinCode] = useState<string>('226001');

  if (!isOpen) return null;

  // Derive objects from hierarchy
  const activeState: StateDetail = INDIAN_LOCATION_HIERARCHY.find(s => s.name === selectedStateName) || INDIAN_LOCATION_HIERARCHY[0];
  const activeDistrict: DistrictDetail = activeState.districts.find(d => d.name === selectedDistrictName) || activeState.districts[0];
  const activeSubDistrict: SubDistrictMandal = activeDistrict.subDistricts.find(sd => sd.name === selectedSubDistrictName) || activeDistrict.subDistricts[0];
  const activeAreas: AreaDetail[] = activeSubDistrict ? activeSubDistrict.areas : [];

  const handleStateChange = (newStateName: string) => {
    setSelectedStateName(newStateName);
    const st = INDIAN_LOCATION_HIERARCHY.find(s => s.name === newStateName);
    if (st && st.districts.length > 0) {
      const dist = st.districts[0];
      setSelectedDistrictName(dist.name);
      if (dist.subDistricts.length > 0) {
        const sd = dist.subDistricts[0];
        setSelectedSubDistrictName(sd.name);
        if (sd.areas.length > 0) {
          setSelectedAreaName(sd.areas[0].areaName);
          setSelectedPinCode(sd.areas[0].pincode);
        }
      }
    }
  };

  const handleDistrictChange = (newDistrictName: string) => {
    setSelectedDistrictName(newDistrictName);
    const dist = activeState.districts.find(d => d.name === newDistrictName);
    if (dist && dist.subDistricts.length > 0) {
      const sd = dist.subDistricts[0];
      setSelectedSubDistrictName(sd.name);
      if (sd.areas.length > 0) {
        setSelectedAreaName(sd.areas[0].areaName);
        setSelectedPinCode(sd.areas[0].pincode);
      }
    }
  };

  const handleSubDistrictChange = (newSubDistrictName: string) => {
    setSelectedSubDistrictName(newSubDistrictName);
    const sd = activeDistrict.subDistricts.find(s => s.name === newSubDistrictName);
    if (sd && sd.areas.length > 0) {
      setSelectedAreaName(sd.areas[0].areaName);
      setSelectedPinCode(sd.areas[0].pincode);
    }
  };

  const handleAreaChange = (areaObj: AreaDetail) => {
    setSelectedAreaName(areaObj.areaName);
    setSelectedPinCode(areaObj.pincode);
  };

  const handleApplyLocation = () => {
    // Extract plain city name (e.g., 'Lucknow' from 'Lucknow (लखनऊ)')
    const cleanCityName = selectedDistrictName.split(' ')[0].trim();
    
    // Update global location context
    setSelectedCity(cleanCityName);
    setPinCode(selectedPinCode);

    if (onSelectLocation) {
      onSelectLocation({
        state: selectedStateName,
        district: cleanCityName,
        subDistrict: selectedSubDistrictName,
        areaName: selectedAreaName,
        pincode: selectedPinCode
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-teal-500/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>📍 विस्तृत लोकेशन चयन (Complete Location Hierarchy)</span>
              </h3>
              <p className="text-xs text-slate-400">
                राज्य, जिला, तहसील/मण्डल एवं एरिया/पिनकोड चुनकर सही क्षेत्रीय रेट्स प्राप्त करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 4 Level Geographic Cascade */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Active Preset Quick Badge */}
          <div className="p-3 rounded-2xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-between text-teal-200 font-bold">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>डिफ़ॉल्ट प्रोजेक्ट ज़ोन: <strong>Lucknow (लखनऊ, उत्तर प्रदेश)</strong></span>
            </span>
            <button
              type="button"
              onClick={() => {
                handleStateChange('Uttar Pradesh (उत्तर प्रदेश)');
                setSelectedDistrictName('Lucknow (लखनऊ)');
                setSelectedSubDistrictName('Lucknow Sadar (लखनऊ सदर)');
                setSelectedAreaName('Hazratganj (हजरतगंज)');
                setSelectedPinCode('226001');
              }}
              className="px-3 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[11px] transition shadow-sm cursor-pointer"
            >
              Lucknow चुनें
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. STATE SELECTOR (राज्य) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>1. राज्य (State Select):</span>
              </label>
              <select
                value={selectedStateName}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              >
                {INDIAN_LOCATION_HIERARCHY.map(st => (
                  <option key={st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            {/* 2. DISTRICT SELECTOR (जिला) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>2. जिला (District Select):</span>
              </label>
              <select
                value={selectedDistrictName}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              >
                {activeState.districts.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 3. SUB-DISTRICT / MANDAL / TEHSIL SELECTOR (तहसील/मण्डल) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>3. तहसील / मण्डल (Sub-District / Tehsil):</span>
              </label>
              <select
                value={selectedSubDistrictName}
                onChange={(e) => handleSubDistrictChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              >
                {activeDistrict.subDistricts.map(sd => (
                  <option key={sd.name} value={sd.name}>{sd.name}</option>
                ))}
              </select>
            </div>

            {/* 4. AREA NAME & PINCODE SELECTOR (क्षेत्र का नाम/पिन) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>4. क्षेत्र का नाम / एरिया नाम (Area &amp; PIN Code):</span>
              </label>
              <select
                value={selectedAreaName}
                onChange={(e) => {
                  const areaObj = activeAreas.find(a => a.areaName === e.target.value);
                  if (areaObj) handleAreaChange(areaObj);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
              >
                {activeAreas.map(a => (
                  <option key={a.areaName} value={a.areaName}>
                    {a.areaName} (PIN: {a.pincode})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Location Full Summary Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>चयनित पूर्ण पता (Full Location Selected Summary):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-900">
              <div className="bg-slate-900 p-2 rounded-xl">
                <div className="text-slate-500 font-medium text-[10px]">राज्य:</div>
                <div className="font-bold text-teal-300 truncate">{selectedStateName}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl">
                <div className="text-slate-500 font-medium text-[10px]">जिला:</div>
                <div className="font-bold text-teal-300 truncate">{selectedDistrictName}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl">
                <div className="text-slate-500 font-medium text-[10px]">तहसील/मण्डल:</div>
                <div className="font-bold text-teal-300 truncate">{selectedSubDistrictName}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl">
                <div className="text-slate-500 font-medium text-[10px]">एरिया व PIN:</div>
                <div className="font-bold text-amber-300 truncate">{selectedAreaName} ({selectedPinCode})</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            रद्द करें (Cancel)
          </button>
          <button
            type="button"
            onClick={handleApplyLocation}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/20 cursor-pointer"
          >
            लोकेशन सेट करें (Set Location)
          </button>
        </div>

      </div>
    </div>
  );
};
