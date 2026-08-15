import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  FileText,
  ListTodo,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Clock,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const FEATURES = [
  { icon: Mic, title: 'Voice Meeting', body: 'Consent ke baad record — hidden capture nahi.' },
  { icon: FileText, title: 'AI Transcription', body: 'Hindi, English, Hinglish transcript.' },
  { icon: Sparkles, title: 'AI Minutes', body: 'Summary, decisions, action items.' },
  { icon: ListTodo, title: 'Action Items', body: 'Owner, deadline, priority track karo.' },
  { icon: MessageCircle, title: 'WhatsApp Share', body: 'Team ko summary bhejo.' },
  { icon: ShieldCheck, title: 'Privacy', body: 'Consent, PII options, delete controls.' },
  { icon: Smartphone, title: 'Mobile App', body: 'PWA + Android APK support.' },
  { icon: FileText, title: 'PDF Export', body: 'Minutes aur transcript export.' },
];

const STEPS = [
  { n: '1', title: 'Bolo', body: 'Consent ke baad record / notes.' },
  { n: '2', title: 'Transcript', body: 'AI clear text banata hai.' },
  { n: '3', title: 'Minutes', body: 'Decisions + tasks ready.' },
  { n: '4', title: 'Share', body: 'Team ko bhejo / export.' },
];

const USE_CASES = [
  { icon: Building2, title: 'Real-estate marketing', body: 'Field talk → owner inbox.' },
  { icon: Clock, title: 'Office standups', body: 'Daily sync → tracked tasks.' },
  { icon: Lock, title: 'Client meetings', body: 'Clear decisions + privacy.' },
];

const FAQS = [
  {
    q: 'Wake-word background me chalta hai?',
    a: 'Browser me app open + mic permission ke saath. Always-on background web pe claim nahi.',
  },
  {
    q: 'API key zaroori hai?',
    a: 'Demo MoM ke liye nahi. Live audio ke liye server pe GEMINI/OPENAI key.',
  },
  {
    q: 'Phone call record hota hai?',
    a: 'Sirf jahan OS allow kare + consent. Most browsers arbitrary calls record nahi karte.',
  },
  {
    q: 'Billing live hai?',
    a: 'Plan UI ready hai. Checkout Stripe/Razorpay wire hone tak simulated.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = '2Click.in — AI Voice Meeting & Office Intelligence';
  }, []);

  return (
    <div className="min-h-full text-slate-900 bg-[#eef2f6]">
      {/* Paytm-style full-bleed navy/cyan hero */}
      <section className="relative min-h-[100svh] overflow-hidden flex flex-col">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 90% 0%, rgba(0,186,242,0.45), transparent 55%), linear-gradient(165deg, #002e6e 0%, #003a8c 48%, #0077b8 100%)',
          }}
        />
        <div className="ai-orb w-72 h-72 bg-cyan-300/25 top-[20%] left-[-12%]" aria-hidden />
        <div className="ai-wave" aria-hidden />

        <div className="relative z-20 flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Mic className="w-5 h-5" aria-hidden />
            </div>
            <span className="font-display font-extrabold tracking-tight text-xl">2Click</span>
          </div>
          <button
            type="button"
            className="rounded-full bg-white text-[#002e6e] text-sm font-bold px-4 py-2.5 min-h-11 active:scale-[0.98]"
            onClick={() => onNavigate('/meetings')}
          >
            App kholo
          </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-16 max-w-xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-white"
          >
            2Click.in
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white leading-snug"
          >
            Meeting se Minutes — Paytm jaisi simple app
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4 text-lg text-sky-50/95 leading-relaxed"
          >
            Bolkar record karo. Transcript + smart MoM + tasks — Hindi, English, Hinglish.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-col gap-3"
          >
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00baf2] text-white font-bold text-base px-6 py-3.5 min-h-12 shadow-lg shadow-cyan-500/35 active:scale-[0.98]"
              onClick={() => onNavigate('/signup')}
            >
              Free shuru karo
              <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/50 text-white font-bold text-base px-6 py-3.5 min-h-12 active:scale-[0.98]"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Kaise kaam karta hai
            </button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm px-5 py-8 sm:px-8">
          <h2 className="font-display text-2xl font-extrabold text-[#002e6e]">Kaise kaam karta hai</h2>
          <p className="mt-2 text-slate-600">Bolo → Transcript → AI → Minutes → Share</p>
          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-[#e8f9fe] px-4 py-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#00baf2] text-white font-extrabold flex items-center justify-center">
                  {s.n}
                </div>
                <h3 className="mt-3 font-bold text-[#002e6e]">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-sm px-5 py-8 sm:px-8">
          <h2 className="font-display text-2xl font-extrabold text-[#002e6e]">Sab kuch ek app me</h2>
          <p className="mt-2 text-slate-600">Jo features already ship hote hain.</p>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center px-1">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-[#e8f9fe] text-[#002e6e] flex items-center justify-center">
                    <Icon className="w-6 h-6" aria-hidden />
                  </div>
                  <h3 className="mt-2.5 font-bold text-sm text-[#002e6e]">{f.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-snug">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-sm px-5 py-8 sm:px-8">
          <h2 className="font-display text-2xl font-extrabold text-[#002e6e]">Kis ke liye</h2>
          <div className="mt-6 space-y-4">
            {USE_CASES.map((u) => {
              const Icon = u.icon;
              return (
                <div key={u.title} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f9fe] text-[#00baf2] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#002e6e]">{u.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-600">{u.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#002e6e] text-white">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-display text-2xl font-extrabold">Privacy pehle</h2>
          <p className="mt-3 text-sky-100 leading-relaxed max-w-xl">
            Explicit consent. Recording Active dikhega. Optional PII redaction. No covert mic.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-sky-50">
            {['Consent before mic', 'Recording Active indicator', 'Retention & delete controls'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00baf2]" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#00baf2] text-white font-bold text-sm px-5 py-3"
            onClick={() => onNavigate('/meetings')}
          >
            App kholo
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm px-5 py-8">
          <h2 className="font-display text-2xl font-extrabold text-[#002e6e]">FAQ</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {FAQS.map((f, i) => (
              <div key={f.q} className="py-4">
                <button
                  type="button"
                  className="w-full text-left font-bold text-[#002e6e] flex justify-between gap-4"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {f.q}
                  <span className="text-[#00baf2]">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#00baf2] text-white">
        <div className="mx-auto max-w-5xl px-5 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold">2Click free try karo</h2>
            <p className="mt-1 text-sky-50">Pehla MoM minutes me.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white text-[#002e6e] font-bold px-6 py-3"
            onClick={() => onNavigate('/signup')}
          >
            Free shuru karo
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-slate-500">
          <div>
            <span className="font-display font-extrabold text-[#002e6e]">2Click.in</span>
            <span className="mx-2">·</span>
            Voice MoM
          </div>
          <div className="flex flex-wrap gap-4">
            <button type="button" className="hover:text-[#00baf2] font-semibold" onClick={() => onNavigate('/meetings')}>
              App
            </button>
            <button type="button" className="hover:text-[#00baf2] font-semibold" onClick={() => onNavigate('/for-real-estate')}>
              Real estate
            </button>
            <button type="button" className="hover:text-[#00baf2] font-semibold" onClick={() => onNavigate('/settings/privacy')}>
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
