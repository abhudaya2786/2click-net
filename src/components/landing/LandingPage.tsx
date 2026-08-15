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
    body: 'Record with clear consent, pause/resume, and a visible recording indicator — never hidden capture.',
  },
  {
    icon: FileText,
    title: 'AI Transcription',
    body: 'Hindi, English, and Hinglish transcripts via Gemini or OpenAI when keys are configured.',
  },
  {
    icon: Sparkles,
    title: 'AI Minutes',
    body: 'Structured MoM: summary, decisions, discussion points, and action items — no invented facts.',
  },
  {
    icon: ListTodo,
    title: 'Action Items',
    body: 'Track tasks with owner, deadline, priority, and status inside meetings.',
  },
  {
    icon: FileText,
    title: 'PDF & Text Export',
    body: 'Export minutes and transcripts for sharing with your team.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Share',
    body: 'Share short summaries and field talk reports. Business API stays server-side.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Controls',
    body: 'Consent notice, PII redaction options, retention settings, and delete flows.',
  },
  {
    icon: Smartphone,
    title: 'Mobile & PWA',
    body: 'Install as an app on phone browsers; Android APK packaging via Capacitor.',
  },
];

const STEPS = [
  { n: '1', title: 'Speak', body: 'Start a meeting after consent. Record live or paste notes.' },
  { n: '2', title: 'Transcribe', body: 'AI turns speech into Hindi / English / Hinglish text.' },
  { n: '3', title: 'Minutes', body: 'Get decisions, discussion points, and action items.' },
  { n: '4', title: 'Share', body: 'Export PDF/TXT or send summaries to your team.' },
];

const USE_CASES = [
  { icon: Building2, title: 'Real-estate marketing', body: 'Field talk → owner inbox & report desk during work hours.' },
  { icon: Clock, title: 'Office standups', body: 'Capture daily syncs and turn them into tracked tasks.' },
  { icon: Lock, title: 'Client meetings', body: 'Keep a clear record of decisions with privacy controls.' },
];

const FAQS = [
  {
    q: 'Does wake-word work in the background?',
    a: 'In the browser, wake-word and voice commands work while the app is open and microphone permission is granted. Always-on background listening is not claimed on web.',
  },
  {
    q: 'Do I need an API key?',
    a: 'No for demo MoM from pasted transcripts. Live audio transcription needs GEMINI_API_KEY or OPENAI_API_KEY on the server.',
  },
  {
    q: 'Is phone-call recording supported?',
    a: 'Only where the OS and device allow it with consent. Most browsers and Android apps cannot record arbitrary phone calls. Unsupported devices show a clear message.',
  },
  {
    q: 'Is billing live?',
    a: 'Plan UI exists for architecture. Checkout is simulated until Stripe/Razorpay credentials are wired — we do not show fake payment success.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = '2Click.in — AI Voice Meeting & Office Intelligence';
  }, []);

  return (
    <div className="min-h-full bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero — full-bleed brand plane */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(11,75,213,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(14,165,233,0.12), transparent 50%), linear-gradient(180deg, #eef4ff 0%, #f7f9fc 55%, #ffffff 100%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-bold tracking-[0.2em] uppercase text-hs-700"
          >
            2Click.in
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-3 max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-950 dark:text-white"
          >
            AI-Powered Voice Meeting &amp; Office Intelligence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-5 max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            Speak naturally. Get complete transcripts, smart Minutes of Meeting and actionable tasks
            automatically — in Hindi, English, and Hinglish.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button type="button" className="btn-hs !px-5 !py-2.5 text-sm" onClick={() => onNavigate('/signup')}>
              Start Free
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              className="btn-hs-secondary !px-5 !py-2.5 text-sm"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-hs-700 hover:underline px-2"
              onClick={() => onNavigate('/signin')}
            >
              Sign in
            </button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-18">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How it works</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
          Voice → Transcript → AI → Minutes → Tasks → Export / Share
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-3xl font-black text-hs-200 dark:text-hs-800">{s.n}</div>
              <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Capabilities</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Built on features that already ship in this product.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title}>
                  <div className="w-9 h-9 rounded-lg bg-hs-50 dark:bg-hs-900/40 text-hs-700 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 w-4 h-4" aria-hidden />
                  </div>
                  <h3 className="mt-3 font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Use cases</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-8">
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy by design</h2>
            <p className="mt-3 text-slate-300 leading-relaxed">
              Explicit consent before recording. Visible recording indicator. Optional PII redaction.
              You can delete recordings, transcripts, and meetings. We do not implement covert or
              hidden microphone capture.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {['Consent before mic', '🔴 Recording Active indicator', 'Retention & delete controls'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mobile ready</h2>
            <p className="mt-3 text-slate-300 leading-relaxed">
              Progressive Web App install plus Capacitor Android packaging (`in.twoclick.mom`). Use
              the same Voice MoM workflows on desk and phone.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 font-bold text-sm px-4 py-2.5 hover:bg-slate-100"
              onClick={() => onNavigate('/meetings')}
            >
              Open app
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pricing</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
          Start free in demo mode. Live AI usage requires your own provider keys. Paid plans are
          prepared in the product UI; payment providers are not charged until you connect Stripe or
          Razorpay credentials.
        </p>
        <div className="mt-8 grid sm:grid-cols-3 gap-6">
          {[
            { name: 'Free / Demo', price: '₹0', items: ['Paste transcript → MoM', 'Local meeting history', 'Privacy settings'] },
            { name: 'Team', price: 'BYO API', items: ['Live STT + MoM', 'Field talk inbox', 'PWA + Android'] },
            { name: 'Business', price: 'Contact', items: ['Company routing', 'WhatsApp integration', 'Usage metering ready'] },
          ].map((p) => (
            <div key={p.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-900">
              <div className="text-sm font-bold text-hs-700">{p.name}</div>
              <div className="mt-1 text-2xl font-extrabold">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {p.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">FAQ</h2>
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
        </div>
      </section>

      <section className="bg-hs-600 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Ready to try 2Click.in?</h2>
            <p className="mt-1 text-hs-100">Create an account and generate your first MoM in minutes.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-hs-800 font-bold px-5 py-2.5 hover:bg-hs-50"
            onClick={() => onNavigate('/signup')}
          >
            Start Free
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-slate-500">
          <div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">2Click.in</span>
            <span className="mx-2">·</span>
            Voice MoM &amp; Office Intelligence
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
            <button type="button" className="hover:text-hs-700" onClick={() => onNavigate('/signin')}>
              Sign in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
