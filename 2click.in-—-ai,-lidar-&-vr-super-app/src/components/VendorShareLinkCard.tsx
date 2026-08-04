import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { VendorProfile } from '../types/vendor';

interface VendorDashboardProps {
  vendor: VendorProfile;
}

export const VendorShareLinkCard: React.FC<VendorDashboardProps> = ({ vendor }) => {
  const [copied, setCopied] = useState(false);

  // 1. Create admin unique link
  const uniqueVendorLink = `${window.location.origin}/?vendorId=${vendor.id}`;

  // 2. Link copy handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(uniqueVendorLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. WhatsApp share handler
  const handleWhatsAppShare = () => {
    const text = `Hello! Visit the official website of ${vendor.whiteLabelSettings?.brandTitle || vendor.businessName} to check rates & services for your requirements:\n\n${uniqueVendorLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <Share2 size={16} /> Your Personal White-Label Shareable Link
        </h4>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Super Admin Approved
        </span>
      </div>

      <p className="text-[11px] text-slate-400">
        Share this link on WhatsApp or social media. Customers visiting through this link will see <span className="text-slate-200 font-semibold">only your branding, your rates, and your helpline number</span>.
      </p>

      {/* Link Input Box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={uniqueVendorLink}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none"
        />
        <button
          onClick={handleCopyLink}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl border border-slate-700 transition"
          title="Copy Link"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>

      {/* WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
      >
        <MessageSquare size={16} /> Send to Customer via WhatsApp
      </button>
    </div>
  );
};
