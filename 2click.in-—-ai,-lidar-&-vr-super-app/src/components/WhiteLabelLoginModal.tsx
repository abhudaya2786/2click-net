import React, { useState } from 'react';
import { X, ShieldCheck, Phone, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

interface WhiteLabelLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (userData: { name: string; role: string }) => void;
  brandTitle?: string;
  vendorLogo?: string;
}

export const WhiteLabelLoginModal: React.FC<WhiteLabelLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  brandTitle = '2click.in Super App',
}) => {
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');
  const [role, setRole] = useState<'regular_user' | 'vendor_admin' | 'super_admin'>('regular_user');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneOrEmail) {
      alert('कृपया मोबाइल नंबर या ईमेल दर्ज करें!');
      return;
    }

    // Demo Smooth Login Trigger
    const dummyName = phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : 'Abhudaya Pratap';
    onSuccessLogin({
      name: dummyName,
      role: role === 'super_admin' ? 'Super Admin' : role === 'vendor_admin' ? 'Field Admin' : 'User'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 overflow-hidden">
        
        {/* Top Glow Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles size={13} /> {brandTitle}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">लॉगिन / साइन इन करें</h2>
          <p className="text-xs text-slate-400">सुरक्षित RBAC एक्सेस के लिए अपने क्रेडेंशियल्स दर्ज करें</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setRole('regular_user')}
            className={`py-2 rounded-xl transition cursor-pointer ${role === 'regular_user' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            👤 User
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor_admin')}
            className={`py-2 rounded-xl transition cursor-pointer ${role === 'vendor_admin' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🛡️ Vendor
          </button>
          <button
            type="button"
            onClick={() => setRole('super_admin')}
            className={`py-2 rounded-xl transition cursor-pointer ${role === 'super_admin' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            👑 Super Admin
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          {/* Phone / Email Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">मोबाइल नंबर या ईमेल ID:</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                type="text"
                required
                placeholder="उदा. 9876543210 या admin@2click.in"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Login Method Switcher (OTP vs Password) */}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">लॉगिन का माध्यम:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLoginMethod('OTP')}
                className={`px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${loginMethod === 'OTP' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-800 text-slate-400'}`}
              >
                OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('PASSWORD')}
                className={`px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${loginMethod === 'PASSWORD' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-slate-800 text-slate-400'}`}
              >
                Password
              </button>
            </div>
          </div>

          {/* Dynamic OTP or Password Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {loginMethod === 'OTP' ? 'ओटीपी (OTP):' : 'पासवर्ड (Password):'}
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                type={loginMethod === 'PASSWORD' ? 'password' : 'text'}
                required
                placeholder={loginMethod === 'OTP' ? '4 या 6 अंकों का OTP' : '••••••••'}
                value={passwordOrOtp}
                onChange={(e) => setPasswordOrOtp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            <span>लॉगिन करें</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-emerald-400" /> End-to-End SSL Encrypted & Session Guarded
        </div>

      </div>
    </div>
  );
};
