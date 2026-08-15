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
  {
    icon: Mic,
    title: 'Voice Meeting',
    body: 'Consent-first recording with a live indicator — never hidden capture.',
  },
  {
    icon: FileText,
    title: 'AI Transcription',
    body: 'Hindi, English, and Hinglish via Gemini or OpenAI when configured.',
  },
  {
    icon: Sparkles,
    title: 'AI Minutes',
    body: 'Summary, decisions, and action items — no invented facts.',
  },
  {
    icon: ListTodo,
    title: 'Action Items',
    body: 'Track owner, deadline, priority, and status inside meetings.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Share',
    body: 'Share summaries and field reports. Tokens stay on the server.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Controls',
    body: 'Consent, PII options, retention settings, and delete flows.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    body: 'PWA install + Android APK (`in.twoclick.mom`).',
  },
  {
    icon: FileText,
    title: 'PDF & Text Export',
    body: 'Export minutes and transcripts for your team.',
  },
];

const STEPS = [
  { n: '01', title: 'Speak', body: 'Start after consent. Record or paste notes.' },
  { n: '02', title: 'Transcribe', body: 'AI turns speech into clear text.' },
  { n: '03', title: 'Minutes', body: 'Decisions and tasks, structured.' },
  { n: '04', title: 'Share', body: 'Export or send to your team.' },
];

const USE_CASES = [
  { icon: Building2, title: 'Real-estate marketing', body: 'Field talk → owner inbox during work hours.' },
  { icon: Clock, title: 'Office standups', body: 'Daily syncs become tracked tasks.' },
  { icon: Lock, title: 'Client meetings', body: 'Clear decisions with privacy controls.' },
];

const FAQS = [
  {
    q: 'Does wake-word work in the background?',
    a: 'In the browser it works while the app is open with mic permission. Always-on background listening is not claimed on web.',
  },
  {
    q: 'Do I need an API key?',
    a: 'No for demo MoM from pasted transcripts. Live audio needs GEMINI_API_KEY or OPENAI_API_KEY on the server.',
  },
  {
    q: 'Is phone-call recording supported?',
    a: 'Only where the OS allows it with consent. Most browsers cannot record arbitrary phone calls.',
  },
  {
    q: 'Is billing live?',
    a: 'Plan UI is prepared. Checkout stays simulated until Stripe/Razorpay is wired.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = '2Click.in — AI Voice Meeting & Office Intelligence';
  }, []);

  return (
    <div className="min-h-full text-slate-900 dark:text-slate-100 bg-[#f3f6fb] dark:bg-slate-950">
      {/* Hero — one composition, brand-first, full-bleed atmosphere */}
      <section className="relative min-h-[100svh] overflow-hidden flex flex-col">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 80% 10%, rgba(11,75,213,0.28), transparent 55%), radial-gradient(ellipse 60% 50% at 5% 90%, rgba(14,165,160,0.18), transparent 50%), linear-gradient(165deg, #0b4bd5 0%, #0a3aa8 38%, #071a3a 100%)',
          }}
        />
        <div className="ai-orb w-72 h-72 bg-sky-300/30 top-[18%] left-[-10%]" aria-hidden />
        <div className="ai-orb w-80 h-80 bg-teal-300/20 bottom-[8%] right-[-12%]" aria-hidden />
        <div className="ai-wave" aria-hidden />

        <div className="relative z-20 flex items-center justify-between px-5 sm:px-8 pt-5">
          <div className="flex items-center gap-2 text-white/90">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Mic className="w-4 h-4" aria-hidden />
            </div>
            <span className="font-display font-extrabold tracking-tight text-lg">2Click</span>
          </div>
          <button
            type="button"
            className="rounded-xl bg-white/15 text-white text-xs font-bold px-3.5 py-2 border border-white/25 hover:bg-white/25 transition"
            onClick={() => onNavigate('/meetings')}
          >
            Open app
          </button>
        </div>

        {/* Product visual plane — edge-to-edge waveform, not a card */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[38%] w-full opacity-40"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M0 120 Q40 40 80 120 T160 120 T240 120 T320 120 T400 120 T480 120 T560 120 T640 120 T720 120 T800 120"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <motion.path
            d="M0 140 Q50 80 100 140 T200 140 T300 140 T400 140 T500 140 T600 140 T700 140 T800 140"
            fill="none"
            stroke="rgba(125,211,252,0.45)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.15, ease: 'easeOut' }}
          />
        </svg>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 sm:px-8 pt-10 pb-20 max-w-3xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-white"
          >
            2Click.in
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 font-display text-xl sm:text-3xl font-bold tracking-tight text-white/95 leading-[1.2] max-w-xl"
          >
            AI Voice Meeting &amp; Office Intelligence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-4 text-base sm:text-lg text-sky-100/90 leading-relaxed max-w-md"
          >
            Speak naturally. Get transcripts, smart Minutes of Meeting, and actionable tasks —
            in Hindi, English, and Hinglish.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-hs-800 font-bold text-sm px-5 py-3 hover:bg-sky-50 active:scale-[0.98] transition"
              onClick={() => onNavigate('/signup')}
            >
              Start Free
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/35 text-white font-semibold text-sm px-5 py-3 hover:bg-white/10 active:scale-[0.98] transition"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-5 sm:px-6 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">How it works</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Voice → Transcript → AI → Minutes → Share</p>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="font-display text-2xl font-extrabold text-hs-200">{s.n}</div>
              <h3 className="mt-1 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-14">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Built for mobile teams</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl">
            Features that already ship — not vaporware.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-hs-50 text-hs-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-6 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Use cases</h2>
        <div className="mt-8 space-y-6">
          {USE_CASES.map((u) => {
            const Icon = u.icon;
            return (
              <div key={u.title} className="flex gap-3">
                <Icon className="w-5 h-5 text-hs-600 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <h3 className="font-bold">{u.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{u.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-14">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy by design</h2>
          <p className="mt-3 text-slate-300 leading-relaxed max-w-xl">
            Explicit consent. Visible recording indicator. Optional PII redaction. No covert mic.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {['Consent before mic', 'Recording Active indicator', 'Retention & delete controls'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 font-bold text-sm px-4 py-2.5"
            onClick={() => onNavigate('/meetings')}
          >
            Open the app
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {FAQS.map((f, i) => (
            <div key={f.q} className="py-4">
              <button
                type="button"
                className="w-full text-left font-bold flex justify-between gap-4"
                aria-expanded={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {f.q}
                <span className="text-slate-400">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-hs-600 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Try 2Click.in free</h2>
            <p className="mt-1 text-hs-100">Generate your first MoM in minutes.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-hs-800 font-bold px-5 py-2.5"
            onClick={() => onNavigate('/signup')}
          >
            Start Free
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-slate-500">
          <div>
            <span className="font-display font-extrabold text-slate-800 dark:text-slate-200">2Click.in</span>
            <span className="mx-2">·</span>
            Voice MoM
          </div>
          <div className="flex flex-wrap gap-4">
            <button type="button" className="hover:text-hs-700" onClick={() => onNavigate('/meetings')}>
              App
            </button>
            <button type="button" className="hover:text-hs-700" onClick={() => onNavigate('/for-real-estate')}>
              Real estate
            </button>
            <button type="button" className="hover:text-hs-700" onClick={() => onNavigate('/settings/privacy')}>
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
