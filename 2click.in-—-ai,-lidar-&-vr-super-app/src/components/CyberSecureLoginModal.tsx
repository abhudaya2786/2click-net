import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Fingerprint, 
  Wifi, 
  Key, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CyberSecureLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: any) => void;
}

export const CyberSecureLoginModal: React.FC<CyberSecureLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [identity, setIdentity] = useState('shrinet.info@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      const mockUser = {
        id: 'user_cyber_' + Date.now(),
        name: identity.split('@')[0] || 'Authenticated User',
        email: identity,
        role: 'SuperAdmin',
        phone: '+91 9876543210',
        city: 'Gorakhpur'
      };

      onSuccessLogin(mockUser);
      onClose();
    }, 800);
  };

  const handleBiometricAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const mockUser = {
        id: 'user_bio_' + Date.now(),
        name: 'Biometric Authenticated Engineer',
        email: 'engineer@2click.in',
        role: 'SuperAdmin',
        phone: '+91 9876543210',
        city: 'Gorakhpur'
      };
      onSuccessLogin(mockUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Container */}
      <div className="bg-slate-900/90 border border-pink-500/40 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-[0_0_50px_rgba(255,45,120,0.2)] relative overflow-hidden backdrop-blur-xl">
        {/* Top Badges */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HSTS ACTIVE NODE 212</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Title */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Initialize Session</h2>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back to 2click.in neural protocol. Authenticate to proceed.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
              Identity Identifier
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Email or Phone Number"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-4 text-white outline-none font-medium transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Security Protocol Key
              </label>
              <button
                type="button"
                onClick={() => alert('🔑 Password recovery link sent to registered email.')}
                className="text-[10px] font-mono uppercase font-bold text-pink-400 hover:underline cursor-pointer"
              >
                Forgot Key?
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-10 text-white outline-none font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,45,120,0.4)] transition cursor-pointer"
          >
            {isAuthenticating ? 'Authenticating Session...' : 'Access Neural Dashboard'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-500">
              Alternative Matrix
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleBiometricAuth}
            className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 rounded-xl text-slate-300 font-bold hover:text-cyan-400 transition cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>Biometric Authentication</span>
          </button>
        </form>

        {/* Security Feature Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
            <h4 className="text-[10px] font-bold text-pink-400 uppercase">256-bit Encrypted</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">AES end-to-end security for all sessions.</p>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
            <h4 className="text-[10px] font-bold text-cyan-400 uppercase">Decentralized</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Multi-node protocol verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
