import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, PhoneCall } from 'lucide-react';
import { calculateDistanceKm, getClientCurrentLocation } from '../utils/locationUtils';

// मॉक डेटा: आसपास के दुकानदार एवं सेवाएँ
const MOCK_VENDORS = [
  { id: '1', name: 'पूर्वांचल सोलर हब', category: 'सोलर', phone: '9876543210', pincode: '273001', lat: 26.7606, lng: 83.3732, address: 'गोलघर, गोरखपुर' },
  { id: '2', name: 'मौर्या टाइल्स एवं मार्बल', category: 'टाइल्स', phone: '9123456789', pincode: '273001', lat: 26.7700, lng: 83.3800, address: 'पादरी बाज़ार, गोरखपुर' },
  { id: '3', name: 'जय माँ विंध्यवासिनी लॉजिस्टिक्स (गाड़ी भाड़ा)', category: 'लॉजिस्टिक्स', phone: '9988776655', pincode: '273002', lat: 26.7800, lng: 83.3600, address: 'महराजगंज रोड, कैंपियरगंज' },
  { id: '4', name: 'गुप्ता हार्डवेयर एवं सीमेंट स्टोर', category: 'हार्डवेयर', phone: '9450001122', pincode: '273001', lat: 26.7500, lng: 83.3900, address: 'मोहद्दीपुर, गोरखपुर' }
];

export const HyperLocalDirectory: React.FC = () => {
  // Client's location state
  const [clientPos, setClientPos] = useState({ lat: 26.7606, lng: 83.3732 });
  const [selectedPincode, setSelectedPincode] = useState('273001');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(5); // Default 5 km radius
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // GPS Auto Select
  const handleAutoGPS = async () => {
    try {
      const coords = await getClientCurrentLocation();
      setClientPos(coords);
      alert('📍 आपकी वर्तमान GPS लोकेशन के अनुसार आसपास की दुकानें फ़िल्टर हो गई हैं!');
    } catch (e) {
      alert('लोकेशन प्राप्त करने में असमर्थ।');
    }
  };

  // दूरी के हिसाब से फ़िल्टर किया गया डेटा
  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.map(vendor => {
      const distance = calculateDistanceKm(clientPos.lat, clientPos.lng, vendor.lat, vendor.lng);
      return { ...vendor, distance };
    })
    .filter(v => v.distance <= maxRadiusKm) // केवल सेट किए गए दायरे के अंदर वाले दिखाएं
    .filter(v => selectedCategory === 'ALL' || v.category === selectedCategory)
    .sort((a, b) => a.distance - b.distance); // सबसे पास वाली दुकान सबसे ऊपर
  }, [clientPos, maxRadiusKm, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      
      {/* Search Header Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-amber-400" size={22} /> हाइपर-लोकल वेंडर एवं सप्लायर हब
            </h2>
            <p className="text-xs text-slate-400">ग्राहक/आर्किटेक्ट की चुनी लोकेशन के आसपास की दुकानें व सेवाएँ</p>
          </div>

          <button
            onClick={handleAutoGPS}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
          >
            <Navigation size={14} /> GPS ऑटो-लोकेशन सेट करें
          </button>
        </div>

        {/* Distance Radius & Category Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          {/* 1. Radius Selector */}
          <div>
            <label className="block text-slate-400 mb-1">खोज का दायरा (Distance Radius):</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[3, 5, 10, 25].map(radius => (
                <button
                  key={radius}
                  onClick={() => setMaxRadiusKm(radius)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition ${maxRadiusKm === radius ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pincode Input */}
          <div>
            <label className="block text-slate-400 mb-1">पिनकोड दर्ज करें:</label>
            <input
              type="text"
              value={selectedPincode}
              onChange={e => setSelectedPincode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-amber-500"
              placeholder="उदा. 273001"
            />
          </div>

          {/* 3. Category Filter */}
          <div>
            <label className="block text-slate-400 mb-1">आवश्यकता का प्रकार:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">🌐 सभी (सोलर, टाइल्स, लॉजिस्टिक्स)</option>
              <option value="सोलर">☀️ सोलर रूफटॉप</option>
              <option value="टाइल्स">🧱 टाइल्स एवं मार्बल</option>
              <option value="लॉजिस्टिक्स">🚚 लॉजिस्टिक्स / गाड़ी भाड़ा</option>
              <option value="हार्डवेयर">🏗️ हार्डवेयर एवं निर्माण</option>
            </select>
          </div>

        </div>
      </div>

      {/* Directory Vendor List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>{maxRadiusKm} km दायरे में उपलब्ध दुकानें / सप्लायर ({filteredVendors.length}):</span>
          <span className="text-amber-400">निकटतम दूरी के अनुसार व्यवस्थित</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map(vendor => (
            <div key={vendor.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                    {vendor.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{vendor.name}</h3>
                  <p className="text-xs text-slate-400">{vendor.address} ({vendor.pincode})</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">{vendor.distance} km</span>
                  <span className="text-[10px] text-slate-500">दूरी</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall size={14} /> कॉल करें
                </a>
                <a
                  href={`https://www.google.com/maps?q=${vendor.lat},${vendor.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl border border-slate-700 text-xs flex items-center gap-1"
                >
                  <Navigation size={14} /> नेविगेट करें
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
