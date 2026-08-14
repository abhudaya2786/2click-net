import React from 'react';
import {
  Building2,
  Mic,
  Inbox,
  ShieldCheck,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

const STEPS = [
  {
    icon: Mic,
    title: 'Employee baat karta hai',
    body: 'Site visit, lead call, ya field huddle — mic se ya type karke.',
  },
  {
    icon: Clock,
    title: 'Working hours me capture',
    body: "Company ke set kiye hours (jaise 9:30–7:30) ke andar talk text banti hai.",
  },
  {
    icon: Inbox,
    title: 'Owner + report desk tak',
    body: "Text report company owner aur jisko report chahiye unke inbox me pahunchti hai.",
  },
];

export const RealEstateSalesLanding: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-hs-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-hs-700 dark:text-hs-300">
            <Building2 className="w-3.5 h-3.5" />
            For Real Estate Marketing Companies
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
            Field team ki har baat —{' '}
            <span className="text-hs-600">text report</span> — seedha owner tak
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Marketing executives, site closers, aur telecallers working time me jo bhi client /
            channel partner se baat karte hain, wo Hindi / English / Hinglish text ban ke company
            owner aur report desk ke paas pahunch jaati hai.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" className="btn-hs" onClick={() => onNavigate('/signup')}>
              Company account banao
              <ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/settings/company')}>
              Owner & report routing
            </button>
            <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/field-talk')}>
              Employee field talk
            </button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-hs-600 text-white flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{s.title}</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.body}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <Users className="w-5 h-5 text-hs-600" />
          Real-estate marketing ke liye kya milta hai
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2.5 text-sm text-slate-700 dark:text-slate-200">
          {[
            'Lead / site visit calls ka text trail',
            'Working hours window (Mon–Sat configurable)',
            'Company Owner inbox',
            'Extra report recipients (Sales Head, CRM desk)',
            'Hinglish baat support (bolo → text)',
            'After-hours talks flagged (optional)',
            'WhatsApp notify hook (phone optional)',
            'Sign Up / Sign In se employee accounts',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-hs-200 dark:border-hs-900 bg-hs-50/60 dark:bg-hs-950/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-hs-600" />
            Demo flow (5 minute)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            1) Owner Sign Up → Company Settings me apna User ID owner set karo → 2) Employee Sign Up
            → Field Talk bhejo → 3) Owner Inbox me text dekho.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button type="button" className="btn-hs" onClick={() => onNavigate('/inbox')}>
            <Inbox className="w-4 h-4" /> Owner Inbox
          </button>
          <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/signin')}>
            Sign In
          </button>
        </div>
      </section>

      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Consent + company policy ke saath use karein — private talks ke liye after-hours / mute
        controls company settings me hain.
      </p>
    </div>
  );
};
