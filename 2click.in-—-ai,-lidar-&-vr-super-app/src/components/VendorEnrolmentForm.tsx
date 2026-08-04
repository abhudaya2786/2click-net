import React, { useState } from 'react';
import { MapPin, Navigation, Edit3, Store, CheckCircle, ExternalLink } from 'lucide-react';
import { getClientCurrentLocation } from '../utils/locationUtils';
import { getSafeLocalStorage, setSafeLocalStorage } from '../lib/storage';

export interface VendorEnrolmentData {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  shopType: string; // उदा: सोलर, टाइल्स, लंबर/प्लाईवुड, लॉजिस्टिक्स/गाड़ी भाड़ा
  pincode: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapUrl: string;
}

export const VendorEnrolmentForm: React.FC = () => {
  const [formData, setFormData] = useState<VendorEnrolmentData>({
    id: `v_${Date.now()}`,
    businessName: '',
    ownerName: '',
    phone: '',
    shopType: 'सोलर रूफटॉप एवं इनवर्टर हब',
    pincode: '',
    address: '',
    latitude: 26.7606, // Default Gorakhpur Lat
    longitude: 83.3732, // Default Gorakhpur Lng
    googleMapUrl: ''
  });

  const [isCustomShopType, setIsCustomShopType] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // ऑटोमेटिक GPS कैप्चर
  const handleFetchGPS = async () => {
    setIsFetchingLocation(true);
    try {
      const coords = await getClientCurrentLocation();
      const mapUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        googleMapUrl: mapUrl
      }));
      alert('📍 आपकी वर्तमान गूगल GPS लोकेशन सफलतापूर्वक कैप्चर हो गई है!');
    } catch (err) {
      alert('GPS ऑटो-डिटेक्ट करने में विफल। कृपया लोकेशन परमिशन चालू करें।');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = getSafeLocalStorage<VendorEnrolmentData[]>('2click_registered_vendors', []);
    setSafeLocalStorage('2click_registered_vendors', [...existing, formData]);
    alert('🎉 आपकी दुकान/सेवा सफलतापूर्वक पंजीकृत हो गई है!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-2xl space-y-5">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <Store size={22} /> वेंडर एवं दुकानदार एनरोलमेंट फ़ॉर्म
        </h2>
        <p className="text-xs text-slate-400">अपनी दुकान का प्रकार सेट करें और सटीक गूगल GPS लोकेशन दर्ज करें</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Business Name */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">दुकान / फर्म का नाम:</label>
          <input
            type="text"
            required
            placeholder="उदा. पूर्वांचल बिल्डिंग एवं सोलर हब"
            value={formData.businessName}
            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Shop Type Selection & Edit Feature */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-slate-300 font-semibold">दुकान / सेवा का प्रकार (Category):</label>
            <button
              type="button"
              onClick={() => setIsCustomShopType(!isCustomShopType)}
              className="text-emerald-400 text-[11px] flex items-center gap-1 hover:underline"
            >
              <Edit3 size={12} /> {isCustomShopType ? 'ड्रॉपडाउन चुनें' : 'कस्टम प्रकार लिखें'}
            </button>
          </div>

          {!isCustomShopType ? (
            <select
              value={formData.shopType}
              onChange={e => setFormData({ ...formData, shopType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="सोलर रूफटॉप एवं इनवर्टर हब">☀️ सोलर रूफटॉप एवं इनवर्टर हब</option>
              <option value="टाइल्स, मार्बल एवं सैनिटरी स्टोर">🧱 टाइल्स, मार्बल एवं सैनिटरी स्टोर</option>
              <option value="लॉजिस्टिक्स एवं गाड़ी भाड़ा (Freight Vehicles)">🚚 लॉजिस्टिक्स एवं गाड़ी भाड़ा (Freight Vehicles)</option>
              <option value="हार्डवेयर, सीमेंट एवं सरिया सप्लायर">🏗️ हार्डवेयर, सीमेंट एवं सरिया सप्लायर</option>
              <option value="आर्किटेक्ट, नक्शा व सिविल कॉन्ट्रैक्टर">📐 आर्किटेक्ट, नक्शा व सिविल कॉन्ट्रैक्टर</option>
              <option value="इलेक्ट्रिकल एवं वायरिंग स्टोर">⚡ इलेक्ट्रिकल एवं वायरिंग स्टोर</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="अपनी दुकान का प्रकार स्वयं लिखें..."
              value={formData.shopType}
              onChange={e => setFormData({ ...formData, shopType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        {/* Pincode & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">पिनकोड (Pincode):</label>
            <input
              type="text"
              required
              placeholder="उदा. 273001"
              value={formData.pincode}
              onChange={e => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">फ़ोन / व्हाट्सएप नंबर:</label>
            <input
              type="text"
              required
              placeholder="9876543210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* GPS Google Location Picker */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin size={16} className="text-amber-400" /> दुकान की गूगल GPS लोकेशन:
            </span>
            <button
              type="button"
              onClick={handleFetchGPS}
              disabled={isFetchingLocation}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition text-[11px]"
            >
              <Navigation size={13} /> {isFetchingLocation ? 'लोकेशन ले रहे हैं...' : '📍 लाइव GPS लोकेशन टैग करें'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 bg-slate-900 p-2 rounded-lg">
            <div>Lat: <span className="text-white font-mono">{formData.latitude}</span></div>
            <div>Lng: <span className="text-white font-mono">{formData.longitude}</span></div>
          </div>

          {formData.googleMapUrl && (
            <a
              href={formData.googleMapUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 text-[11px] inline-flex items-center gap-1 hover:underline"
            >
              <ExternalLink size={12} /> गूगल मैप्स पर अपनी दुकान की लोकेशन देखें
            </a>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> रजिस्टर करें एवं लाइव करें
        </button>

      </form>
    </div>
  );
};
