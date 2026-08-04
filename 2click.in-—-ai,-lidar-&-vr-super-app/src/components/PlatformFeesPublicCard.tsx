import React, { useState } from 'react';
import { ShieldCheck, Tag, Sparkles, Building2, Store, Truck, Award, Layers, Clock, Check, Calendar, ArrowRight, Zap, Sun, Wrench, BadgePercent } from 'lucide-react';
import { SystemSettings } from '../types';

interface PlatformFeesPublicCardProps {
  systemSettings?: SystemSettings;
  compact?: boolean;
}

export const PlatformFeesPublicCard: React.FC<PlatformFeesPublicCardProps> = ({ systemSettings, compact = false }) => {
  const [selectedDuration, setSelectedDuration] = useState<'1_month' | '1_year' | '3_year'>('1_year');
  const [feeTab, setFeeTab] = useState<'membership' | 'services'>('membership');

  const fees = systemSettings?.platformFees || {
    userFeeINR: 0,
    dukandarFeeINR: 1499,
    supplierFeeINR: 2999,
    brandFeeINR: 4999,
    materialProviderFeeINR: 1999,
    feePeriod: '1 Year',
    gstApplicable: true,
    showFeesOnPublicApp: true,
    notes: 'Official platform registration, verification badge & escrow protected deal access.'
  };

  // Duration multiplier and discount calculation
  const getDurationData = (baseYearlyFee: number) => {
    if (baseYearlyFee === 0) return { fee: 0, durationLabel: 'Lifetime FREE', savings: '100% Free' };
    if (selectedDuration === '1_month') {
      const monthlyFee = Math.round((baseYearlyFee * 1.25) / 12);
      return { fee: monthlyFee, durationLabel: 'प्रति माह (Per Month)', savings: 'Monthly Pay' };
    }
    if (selectedDuration === '1_year') {
      return { fee: baseYearlyFee, durationLabel: '1 वर्ष (1 Year Access)', savings: 'Standard Rate' };
    }
    // 3 Years (30% discount)
    const threeYearFee = Math.round(baseYearlyFee * 3 * 0.7);
    return { fee: threeYearFee, durationLabel: '3 वर्ष (3 Years VIP Access)', savings: '30% Mega Discount' };
  };

  const membershipPlans = [
    {
      title: 'ग्राहक / यूज़र (Client / User)',
      subtitle: 'प्रॉपर्टी मालिक एवं खरीदार',
      baseFee: fees.userFeeINR,
      icon: <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      badge: 'Free Member',
      features: ['2D/3D AI Naksha maps', 'Direct Vendor Bidding', 'Escrow Payment Safety']
    },
    {
      title: 'दुकानदार (Dukandar / Retailer)',
      subtitle: 'रिटेलर शॉपकीपर व मर्चेंट स्टोर',
      baseFee: fees.dukandarFeeINR,
      icon: <Store className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: 'Retail Partner',
      features: ['Local Buyer Lead Alerts', 'Digital Rate Board Listing', 'GST Invoice Generator']
    },
    {
      title: 'सप्लायर एवं वेंडर (Supplier / Vendor)',
      subtitle: 'कांट्रैक्टर, प्लंबर, इलेक्ट्रिशियन व होलसेलर',
      baseFee: fees.supplierFeeINR,
      icon: <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'Verified Vendor',
      features: ['Direct Construction Tenders', 'Unlimited Material Listing', 'Priority Site Inspection']
    },
    {
      title: 'सोलर व ब्रांड पार्टनर (Solar & Brand)',
      subtitle: 'सोलर पैनल, सीमेंट, स्टील एवं MEP एम्पैनल्ड ब्रांड्स',
      baseFee: fees.brandFeeINR,
      icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badge: 'Brand Exclusive',
      features: ['DISCOM Net-metering Portal', 'Govt Subsidy Help Desk', 'District Direct Franchise']
    },
    {
      title: 'मटीरियल प्रोवाइडर (Material Provider)',
      subtitle: 'बिल्डिंग मटीरियल व फिटिंग डिस्ट्रीब्यूटर',
      baseFee: fees.materialProviderFeeINR,
      icon: <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Material Hub',
      features: ['Bulk Mill Direct Orders', 'Transporter Freight Match', 'Verified Rate Catalog']
    }
  ];

  // Service Fee Charges & SLA Time Duration
  const serviceChargeItems = [
    {
      serviceName: 'सोलर पैनल व इनवर्टर इंस्टॉलेशन (Solar System Rooftop Installation)',
      serviceCharge: '₹8,000 / KW',
      timeDuration: '3 से 7 कार्य दिवस (3 to 7 Days SLA)',
      warrantyDuration: '5 वर्ष फ्री सर्विस + 25 वर्ष वारंटी',
      icon: <Sun className="w-5 h-5 text-amber-500" />
    },
    {
      serviceName: 'आर्किटेक्ट AI नक्शा व वास्तु मैप (Architect 2D/3D Floor Plan)',
      serviceCharge: '₹15 / वर्ग फ़ुट (Sq.Ft.)',
      timeDuration: '24 से 48 घंटे (Instant Delivery)',
      warrantyDuration: '7 दिन फ्री रिवीज़न व संशोधन',
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />
    },
    {
      serviceName: 'सिविल इंजीनियर लोड ऑडिट (Structural Civil Load Audit & BOQ)',
      serviceCharge: '₹2,500 / साइट विजिट',
      timeDuration: '24 घंटे (Same Day Report)',
      warrantyDuration: 'बैंक होम लोन प्रमाणित रिपोर्ट',
      icon: <Building2 className="w-5 h-5 text-emerald-500" />
    },
    {
      serviceName: 'इलेक्ट्रिशियन व प्लंबर ऑन-डिमांड सर्विस (Electrician & Plumber Visit)',
      serviceCharge: '₹350 / सेवा कॉल',
      timeDuration: '2 से 4 घंटे (Same Day Quick Visit)',
      warrantyDuration: '30 दिन कार्य वारंटी गारंटी',
      icon: <Wrench className="w-5 h-5 text-sky-500" />
    },
    {
      serviceName: 'मटीरियल क्रेन व ट्रक होम डिलीवरी (Crane Freight Transport Delivery)',
      serviceCharge: '₹500 / ट्रिप (जिला क्षेत्र)',
      timeDuration: '4 से 8 घंटे एक्सप्रेस डिलीवरी',
      warrantyDuration: 'ट्रांजिट इंश्योरेंस एवं ज़ीरो डैमेज',
      icon: <Truck className="w-5 h-5 text-purple-500" />
    }
  ];

  if (compact) {
    return (
      <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white rounded-2xl border border-teal-500/30 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-extrabold flex items-center gap-1.5 text-teal-300">
            <Tag className="w-4 h-4 text-amber-400" /> मेंबरशिप फ़ीस, सर्विस चार्ज एवं टाइम समयावधि (Platform Rates)
          </span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px]">
            <button
              onClick={() => setSelectedDuration('1_month')}
              className={`px-2 py-0.5 rounded-lg font-bold transition ${selectedDuration === '1_month' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
            >
              1 Month
            </button>
            <button
              onClick={() => setSelectedDuration('1_year')}
              className={`px-2 py-0.5 rounded-lg font-bold transition ${selectedDuration === '1_year' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
            >
              1 Year
            </button>
            <button
              onClick={() => setSelectedDuration('3_year')}
              className={`px-2 py-0.5 rounded-lg font-bold transition ${selectedDuration === '3_year' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
            >
              3 Years (30% Off)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          {membershipPlans.map((plan, idx) => {
            const data = getDurationData(plan.baseFee);
            return (
              <div key={idx} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-center flex flex-col justify-between">
                <div className="text-[10px] text-slate-300 font-bold truncate">{plan.title.split('(')[0]}</div>
                <div className="font-black text-amber-300 text-sm mt-0.5">
                  {data.fee === 0 ? 'FREE' : `₹${data.fee.toLocaleString('en-IN')}`}
                </div>
                <div className="text-[9px] text-teal-300 font-semibold">{data.durationLabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 text-white rounded-3xl border border-teal-500/40 shadow-2xl space-y-6 my-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <ShieldCheck className="w-48 h-48 text-teal-400" />
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/30 pb-5">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Membership Fees &amp; Service SLA Time Schedule
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            मेंबरशिप शुल्क, सर्विस चार्ज एवं कार्य समयावधि (Platform Rates &amp; Durations)
          </h3>
          <p className="text-xs text-slate-300">
            2CLICK प्लेटफ़ॉर्म पारदर्शी मूल्य निर्धारण: रोल अनुसार मेंबरशिप प्लान्स तथा प्रत्येक सर्विस का सर्विस चार्ज व गारंटी टाइम अवधि देखें।
          </p>
        </div>

        {/* Tab Switcher: Membership vs Service Charges */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setFeeTab('membership')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              feeTab === 'membership' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>मेंबरशिप फीस (Membership Plans)</span>
          </button>
          <button
            onClick={() => setFeeTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              feeTab === 'services' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>सर्विस चार्ज व समय अवधि (Service Charges &amp; SLA)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MEMBERSHIP FEES WITH TIME DURATION SELECTOR */}
      {feeTab === 'membership' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Duration Selector Bar */}
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>समय अवधि चुनें (Select Membership Duration Option):</span>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedDuration('1_month')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition text-center cursor-pointer border ${
                  selectedDuration === '1_month'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:border-amber-400/50'
                }`}
              >
                1 महीना (Monthly)
              </button>

              <button
                onClick={() => setSelectedDuration('1_year')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition text-center cursor-pointer border ${
                  selectedDuration === '1_year'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:border-amber-400/50'
                }`}
              >
                1 वर्ष (1 Year)
              </button>

              <button
                onClick={() => setSelectedDuration('3_year')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition text-center cursor-pointer border relative ${
                  selectedDuration === '3_year'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:border-amber-400/50'
                }`}
              >
                <span className="block">3 वर्ष (3 Years)</span>
                <span className="text-[9px] text-emerald-950 font-black uppercase">30% छूट Save</span>
              </button>
            </div>
          </div>

          {/* Membership Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {membershipPlans.map((plan, index) => {
              const data = getDurationData(plan.baseFee);
              return (
                <div
                  key={index}
                  className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-teal-400/60 transition duration-300 flex flex-col justify-between space-y-4 shadow-lg hover:-translate-y-1"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                        {plan.icon}
                      </div>
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[9px] font-black uppercase rounded border border-teal-500/30">
                        {plan.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-white">{plan.title}</h4>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">{plan.subtitle}</p>
                    </div>
                  </div>

                  {/* Fee Box */}
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                    <div className="text-[9px] text-slate-400 font-extrabold uppercase">मेंबरशिप शुल्क (Membership Rate)</div>
                    <div className="text-2xl font-black text-amber-300">
                      {data.fee === 0 ? 'FREE' : `₹${data.fee.toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[10px] text-teal-300 font-bold flex items-center justify-between pt-1 border-t border-white/10">
                      <span>अवधि: {data.durationLabel}</span>
                    </div>
                  </div>

                  {/* Included features list */}
                  <ul className="space-y-1.5 text-[10px] text-slate-300 pt-1">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE CHARGES & EXECUTION TIME DURATION (SLA) */}
      {feeTab === 'services' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-teal-900/30 rounded-2xl border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong>प्रत्येक सेवा का निर्धारित सर्विस चार्ज एवं कार्य पूरा होने की समयावधि:</strong> नीचे दी गई सभी सेवाएं लाइसेंस प्राप्त पेशेवरों द्वारा एस्क्रो सुरक्षा के साथ पूरी की जाती हैं।
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceChargeItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-3 hover:border-amber-400/50 transition">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white leading-snug">{item.serviceName}</h4>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">सर्विस चार्ज (Service Fee):</span>
                    <span className="font-black text-amber-300 text-sm">{item.serviceCharge}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                    <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      कार्य समयावधि (Duration SLA):
                    </span>
                    <span className="font-extrabold text-white text-[11px]">{item.timeDuration}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px]">
                    <span className="text-slate-400">गारंटी / वारंटी:</span>
                    <span className="font-bold text-emerald-400">{item.warrantyDuration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Notes */}
      <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{fees.notes || '100% Verified Escrow Protected & GST Compliant Services'}</span>
        </div>
        {fees.gstApplicable && (
          <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded text-[10px] font-mono border border-amber-400/30 shrink-0">
            + 18% GST Applicable on Official Invoice
          </span>
        )}
      </div>
    </div>
  );
};

