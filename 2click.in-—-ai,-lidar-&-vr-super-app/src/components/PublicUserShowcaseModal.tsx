import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Phone, 
  MessageSquare, 
  MapPin, 
  CheckCircle2, 
  Share2, 
  Copy, 
  QrCode, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Send, 
  Building2, 
  Tag, 
  Info,
  BadgeCheck
} from 'lucide-react';
import { User, UserShareSettings } from '../types';

interface PublicUserShowcaseModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  isPreviewMode?: boolean;
}

export const PublicUserShowcaseModal: React.FC<PublicUserShowcaseModalProps> = ({
  user,
  isOpen,
  onClose,
  isPreviewMode = false
}) => {
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  // Fallback share settings if not explicitly defined
  const settings: UserShareSettings = user.shareSettings || {
    showProducts: true,
    showPrices: true,
    showContactPhone: true,
    showAddressLocation: true,
    showKhataQrPayment: true,
    showRatingReviews: true,
    showGstin: true,
    headlineMessage: `Authorized Dealer & Certified Service Provider in ${user.district || user.city || 'India'}`
  };

  const shareUrl = `${window.location.origin}/?shareUser=${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = (productTitle?: string) => {
    const text = productTitle 
      ? `Hello ${user.name}, I found your product "${productTitle}" on 2Click Engineering Marketplace. Please share availability & rates.`
      : `Hello ${user.name}, I am interested in your services listed on 2Click Engineering Marketplace.`;
    
    const phoneNum = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${phoneNum.length === 10 ? '91' + phoneNum : phoneNum}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryMsg('');
    }, 4000);
  };

  // Sample products if none explicitly provided
  const products = user.customProducts && user.customProducts.length > 0 
    ? user.customProducts 
    : [
        {
          id: 'PROD-1',
          title: 'Ultratech Cement (PPC 50kg Bag)',
          category: 'Building Materials',
          priceINR: 380,
          unit: 'Bag',
          imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
          inStock: true,
          description: 'High-strength Portland Pozzolana Cement for slab casting & masonry.'
        },
        {
          id: 'PROD-2',
          title: 'Tata Tiscon Fe550D TMT Steel Bars (12mm)',
          category: 'Structural Steel',
          priceINR: 62000,
          unit: 'Ton',
          imageUrl: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80',
          inStock: true,
          description: 'Ductile high-yield TMT rebar with earthquake resistant properties.'
        },
        {
          id: 'PROD-3',
          title: '5kW On-Grid Solar Rooftop System',
          category: 'Solar Energy Solutions',
          priceINR: 245000,
          unit: 'Set',
          imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5057d0256?auto=format&fit=crop&w=600&q=80',
          inStock: true,
          description: 'Tier-1 Bifacial panels with 5kVA Solar Inverter & Net Metering guidance.'
        }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 my-auto relative animate-in fade-in zoom-in duration-200">
        
        {/* TOP PREVIEW BANNER IF IN PREVIEW MODE */}
        {isPreviewMode && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 font-black text-xs text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>👁️ PUBLIC PREVIEW MODE: यह रूप आपके ग्राहक / क्लाइंट को लिंक खोलने पर दिखेगा</span>
          </div>
        )}

        {/* HEADER COVER */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-900 p-6 sm:p-8 text-white relative">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-teal-600/30 border-2 border-teal-400/50 flex items-center justify-center text-3xl font-black text-teal-300 shadow-xl shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 text-teal-400" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  {user.role} Showcase
                </span>

                {user.isKycVerified && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-black flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Provider
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {user.companyName || user.name}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm font-medium">
                {settings.headlineMessage || `Certified ${user.role} in ${user.district || user.city || 'India'}`}
              </p>

              {settings.showAddressLocation && (user.district || user.city) && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{user.city || user.district}, India</span>
                </p>
              )}
            </div>

            {/* Rating Badge */}
            {settings.showRatingReviews && (
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center shrink-0">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-black text-lg text-white">{user.rating || 4.9}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-bold block mt-0.5">Customer Trust Score</span>
              </div>
            )}
          </div>

          {/* Share & Contact Quick Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied Link!' : 'Copy Shareable Link'}</span>
              </button>

              {settings.showContactPhone && user.phone && (
                <button
                  onClick={() => handleSendWhatsApp()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Contact</span>
                </button>
              )}
            </div>

            {settings.showGstin && user.gstinNumber && (
              <span className="text-[11px] text-slate-400 font-bold bg-black/30 px-3 py-1 rounded-lg">
                GSTIN: <strong className="text-teal-300">{user.gstinNumber}</strong>
              </span>
            )}
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-thin">
          
          {/* SECTION 1: PRODUCTS / SERVICES CATALOG */}
          {settings.showProducts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-teal-600" />
                  Featured Product &amp; Material Catalog ({products.length})
                </h3>
                <span className="text-xs text-slate-400">Direct From Seller</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 flex flex-col justify-between hover:shadow-lg transition">
                    <div className="space-y-2">
                      <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                        <img src={p.imageUrl} alt={p.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white font-extrabold text-[10px] rounded-md backdrop-blur-md">
                          {p.category}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                        {p.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">RATE</span>
                        {settings.showPrices ? (
                          <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                            ₹{p.priceINR.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">/{p.unit}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                            Call for Best Rate
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSendWhatsApp(p.title)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] rounded-xl transition flex items-center gap-1 shadow-sm"
                      >
                        <MessageSquare className="w-3 h-3" /> Inquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: UPI / QR PAYMENT SECTION (IF PERMITTED BY USER) */}
          {settings.showKhataQrPayment && (
            <div className="bg-gradient-to-r from-teal-900/10 via-emerald-900/10 to-indigo-900/10 p-5 rounded-3xl border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-[10px] rounded-md uppercase">
                  Instant Payment Accepted
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Pay Directly via UPI / PhonePe / Paytm / GPay
                </h4>
                <p className="text-xs text-slate-500">
                  Scan QR code or use official UPI handle for instant billing settlement.
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 shrink-0 text-center space-y-1">
                <QrCode className="w-20 h-20 text-slate-900 mx-auto" />
                <span className="text-[10px] font-black text-teal-700 block">
                  UPI ID: 2click.{user.id.toLowerCase()}@okaxis
                </span>
              </div>
            </div>
          )}

          {/* SECTION 3: DIRECT INQUIRY FORM */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Send Direct Message / Requirement to {user.name}
            </h4>

            {inquirySent ? (
              <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>आपका मैसेज सफलतापूर्वक भेज दिया गया है! विक्रेता जल्द ही संपर्क करेगा।</span>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your material requirement or work details..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Send Inquiry
                </button>
              </form>
            )}
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            2Click Verified Public Showcase
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
