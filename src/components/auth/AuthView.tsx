import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthViewProps {
  mode: 'signin' | 'signup';
  onNavigate: (path: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ mode, onNavigate }) => {
  const { signup, signin, isAuthenticated, user, signout } = useAuth();
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(null);

    if (!userId.trim()) {
      setLocalError('User ID required hai.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setLocalError('Password aur confirm password match nahi karte.');
      return;
    }

    setBusy(true);
    try {
      if (isSignup) {
        await signup({
          userId: userId.trim(),
          password,
          displayName: displayName.trim() || undefined,
        });
        setSuccess('Account ban gaya — aap signed in ho.');
      } else {
        await signin({ userId: userId.trim(), password });
        setSuccess('Sign in successful.');
      }
      setTimeout(() => onNavigate('/meetings'), 600);
    } catch (err: any) {
      setLocalError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-hs-600 text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Signed in
              </h1>
              <p className="text-xs text-slate-500">
                {user.displayName} · @{user.userId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/meetings')}
            className="btn-hs w-full justify-center"
          >
            Go to Meetings
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void signout()}
            className="btn-hs-secondary w-full justify-center"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="px-5 sm:px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-hs-600 text-white flex items-center justify-center shadow-sm">
              {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isSignup ? 'Naya account banao' : 'Sign in karo'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                {isSignup
                  ? 'User ID aur password se account banayein'
                  : 'Apna User ID aur password daalein'}
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => onNavigate('/signin')}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${
                !isSignup
                  ? 'bg-white dark:bg-slate-900 text-hs-700 dark:text-hs-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${
                isSignup
                  ? 'bg-white dark:bg-slate-900 text-hs-700 dark:text-hs-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Display name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                autoComplete="name"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-hs-500/30 focus:border-hs-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. rahul_site01"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-hs-500/30 focus:border-hs-400 font-mono"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              3–32 characters · letters, numbers, underscore
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-hs-500/30 focus:border-hs-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Password dobara likhein"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-hs-500/30 focus:border-hs-400"
                />
              </div>
            </div>
          )}

          {localError && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm leading-snug">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm leading-snug">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-hs w-full justify-center !py-3.5 !text-base disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Please wait…
              </>
            ) : isSignup ? (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          <div className="flex items-center gap-2 pt-1 text-sm text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Password hashed server pe store hoti hai — plain text nahi.</span>
          </div>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 mt-5 leading-relaxed">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/signin')}
              className="font-bold text-hs-700 dark:text-hs-300 cursor-pointer hover:underline"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            New here?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              className="font-bold text-hs-700 dark:text-hs-300 cursor-pointer hover:underline"
            >
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export const AccountView: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { user, isAuthenticated, isLoading, signout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading account…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Account</h1>
        <p className="text-sm text-slate-500">Sign in to manage your Voice MoM account.</p>
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="btn-hs" onClick={() => onNavigate('/signin')}>
            Sign In
          </button>
          <button
            type="button"
            className="btn-hs-secondary"
            onClick={() => onNavigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-hs-600 text-white flex items-center justify-center text-lg font-bold">
            {(user.displayName || user.userId).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {user.displayName}
            </h1>
            <p className="text-xs font-mono text-slate-500">@{user.userId}</p>
          </div>
        </div>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <dt className="text-slate-500 font-semibold">User ID</dt>
            <dd className="font-mono text-slate-800 dark:text-slate-200">{user.userId}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <dt className="text-slate-500 font-semibold">Account ID</dt>
            <dd className="font-mono text-slate-800 dark:text-slate-200 truncate">{user.id}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2">
            <dt className="text-slate-500 font-semibold">Created</dt>
            <dd className="text-slate-800 dark:text-slate-200">
              {new Date(user.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="btn-hs" onClick={() => onNavigate('/meetings')}>
            Meetings
          </button>
          <button
            type="button"
            className="btn-hs-secondary"
            onClick={() => void signout().then(() => onNavigate('/signin'))}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
