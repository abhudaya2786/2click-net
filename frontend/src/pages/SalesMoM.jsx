import { useState } from "react";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, formatApiErrorDetail } from "@/lib/api";
import { openWhatsAppShare } from "@/lib/whatsapp";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";
import {
  Loader2, Sparkles, Copy, MessageCircle, FileText,
  Target, AlertTriangle, CheckCircle2, Lightbulb, ListTodo,
} from "lucide-react";

function Badge({ children, tone = "neutral" }) {
  const tones = {
    hot: "bg-orange-500/15 text-orange-700 border-orange-500/30",
    warm: "bg-amber-500/15 text-amber-800 border-amber-500/30",
    cold: "bg-slate-500/15 text-slate-700 border-slate-500/30",
    high: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
    medium: "bg-sky-500/15 text-sky-800 border-sky-500/30",
    low: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    neutral: "bg-muted text-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children, testId }) {
  return (
    <section className="border border-border/70 bg-card/60 p-4 md:p-5" data-testid={testId}>
      <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function BulletList({ items, empty }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{empty || "—"}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm leading-relaxed pl-3 border-l-2 border-primary/40">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function SalesMoM() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [clientName, setClientName] = useState("");
  const [repName, setRepName] = useState("");
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(null);

  const loadSample = async () => {
    try {
      const { data } = await api.get("/sales-mom/sample", { params: { lang: hi ? "hi" : "en" } });
      setTranscript(data.transcript || "");
      setClientName(data.client_name || "");
      setRepName(data.rep_name || "");
      if (data.meeting_date) setMeetingDate(data.meeting_date);
      if (data.example_result) {
        setResult({ ...data.example_result, meta: { ...(data.example_result.meta || {}), engine: "example_hi", demo: true } });
      }
      toast.success(hi ? "सैंपल ट्रांसक्रिप्ट लोड" : "Sample transcript loaded");
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail) || "Failed to load sample");
    }
  };

  const analyze = async () => {
    if ((transcript || "").trim().length < 20) {
      toast.error(hi ? "पूरा ट्रांसक्रिप्ट पेस्ट करें" : "Paste the full conversation transcript");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.post("/sales-mom/analyze", {
        transcript,
        meeting_date: meetingDate || null,
        client_name: clientName || null,
        rep_name: repName || null,
        output_language: hi ? "hi" : "en",
        use_llm: true,
        save: true,
      });
      setResult(data);
      toast.success(hi ? "MoM तैयार" : "MoM generated");
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail) || (hi ? "विश्लेषण विफल" : "Analysis failed"));
    } finally {
      setBusy(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    const payload = {
      mom: result.mom,
      sales_intelligence: result.sales_intelligence,
      action_plan: result.action_plan,
      whatsapp_template_message: result.whatsapp_template_message,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success(hi ? "JSON कॉपी हो गया" : "JSON copied");
  };

  const copyWhatsApp = async () => {
    if (!result?.whatsapp_template_message) return;
    await navigator.clipboard.writeText(result.whatsapp_template_message);
    toast.success(hi ? "WhatsApp मैसेज कॉपी" : "WhatsApp message copied");
  };

  const mom = result?.mom;
  const si = result?.sales_intelligence;
  const leadTone = (si?.lead_status || "").toLowerCase();
  const engTone = (si?.client_engagement_level || "").toLowerCase();

  return (
    <div className="relative min-h-[70vh]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% -10%, hsl(var(--primary) / 0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, hsl(24 90% 50% / 0.08), transparent 50%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted) / 0.35))",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-14">
        <PageSEO
          title="Sales MoM Intelligence — 2click.in"
          description="Turn sales call transcripts into Minutes of Meeting, objections, lead score, and WhatsApp follow-ups."
          path="/sales-mom"
        />

        <header className="max-w-2xl" data-testid="sales-mom-hero">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-primary mb-3">
            {hi ? "सेल्स इंटेलिजेंस" : "Sales Intelligence"}
          </p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight leading-tight">
            {hi ? "मीटिंग मिनट्स + लीड स्कोर" : "Minutes of Meeting + Lead Score"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
            {hi
              ? "सेल्स कॉल ट्रांसक्रिप्ट पेस्ट करें — व्यक्तिगत बात छोड़कर व्यापारिक MoM, आपत्तियाँ, एक्शन प्लान और WhatsApp फॉलो-अप बनता है।"
              : "Paste a Sales Rep ↔ Client transcript. We filter personal chatter and return MoM, objections, action plan, and a WhatsApp follow-up."}
          </p>
        </header>

        <div className="mt-8 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{hi ? "क्लाइंट" : "Client"}</label>
                <Input
                  data-testid="sales-mom-client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Mr. Sharma"
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{hi ? "रेप" : "Sales Rep"}</label>
                <Input
                  data-testid="sales-mom-rep"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 rounded-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{hi ? "मीटिंग तारीख" : "Meeting date"}</label>
              <Input
                type="date"
                data-testid="sales-mom-date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {hi ? "ट्रांसक्रिप्ट" : "Transcript"}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs rounded-none"
                  onClick={loadSample}
                  data-testid="sales-mom-sample"
                >
                  {hi ? "सैंपल लोड करें" : "Load sample"}
                </Button>
              </div>
              <Textarea
                data-testid="sales-mom-transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={16}
                placeholder={"Sales Rep: ...\nClient: ..."}
                className="rounded-none font-mono text-xs leading-relaxed"
              />
            </div>
            <Button
              type="button"
              onClick={analyze}
              disabled={busy}
              data-testid="sales-mom-analyze"
              className="w-full rounded-none gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? (hi ? "विश्लेषण..." : "Analyzing…") : (hi ? "MoM बनाएँ" : "Generate MoM")}
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-4" data-testid="sales-mom-results">
            {!result && !busy && (
              <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                {hi
                  ? "परिणाम यहाँ दिखेंगे — सैंपल लोड करके शुरू करें।"
                  : "Results appear here — load the sample to try it instantly."}
              </div>
            )}
            {busy && (
              <div className="border border-border p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {hi ? "बिजनेस पॉइंट्स निकाल रहे हैं…" : "Extracting business points…"}
              </div>
            )}

            {result && mom && si && (
              <>
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <h2 className="font-display font-extrabold text-xl tracking-tight">{mom.meeting_title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">{mom.executive_summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={leadTone}>{si.lead_status} lead</Badge>
                    <Badge tone={engTone}>{si.client_engagement_level} engagement</Badge>
                    <Badge tone="neutral">{si.conversion_probability_percentage}% conversion</Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Section icon={FileText} title={hi ? "मुख्य चर्चा" : "Key discussion points"} testId="mom-points">
                    <BulletList items={mom.key_discussion_points} />
                  </Section>
                  <Section icon={CheckCircle2} title={hi ? "निर्णय" : "Decisions made"} testId="mom-decisions">
                    <BulletList items={mom.decisions_made} />
                  </Section>
                  <Section icon={AlertTriangle} title={hi ? "क्लाइंट आपत्तियाँ" : "Client objections"} testId="mom-objections">
                    <BulletList items={mom.client_objections} empty={hi ? "कोई आपत्ति नहीं मिली" : "No objections detected"} />
                  </Section>
                  <Section icon={Target} title={hi ? "मिस्ड पिच गैप्स" : "Missed pitch gaps"} testId="mom-gaps">
                    <BulletList items={mom.missed_pitch_gaps} empty={hi ? "कवरेज अच्छा" : "Coverage looks solid"} />
                  </Section>
                </div>

                <Section icon={Lightbulb} title={hi ? "सेल्स इंटेलिजेंस" : "Sales intelligence"} testId="mom-intel">
                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">{hi ? "प्रतिस्पर्धी: " : "Competitors: "}</span>
                      {si.competitors_mentioned?.length
                        ? si.competitors_mentioned.join(", ")
                        : (hi ? "कोई नहीं" : "None mentioned")}
                    </p>
                    <p className="leading-relaxed border-l-2 border-primary/40 pl-3">
                      {si.coaching_tips_for_rep}
                    </p>
                  </div>
                </Section>

                <Section icon={ListTodo} title={hi ? "एक्शन प्लान" : "Action plan"} testId="mom-actions">
                  {!result.action_plan?.length ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground border-b border-border">
                            <th className="py-2 pr-3 font-medium">{hi ? "कार्य" : "Task"}</th>
                            <th className="py-2 pr-3 font-medium">{hi ? "मालिक" : "Owner"}</th>
                            <th className="py-2 pr-3 font-medium">{hi ? "डेडलाइन" : "Deadline"}</th>
                            <th className="py-2 font-medium">{hi ? "रिमाइंडर" : "Reminder"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.action_plan.map((a, i) => (
                            <tr key={i} className="border-b border-border/50 align-top">
                              <td className="py-2.5 pr-3">{a.task}</td>
                              <td className="py-2.5 pr-3 whitespace-nowrap">{a.owner}</td>
                              <td className="py-2.5 pr-3 whitespace-nowrap font-mono text-xs">{a.deadline_date}</td>
                              <td className="py-2.5 whitespace-nowrap font-mono text-xs">{a.reminder_time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>

                <Section icon={MessageCircle} title={hi ? "WhatsApp फॉलो-अप" : "WhatsApp follow-up"} testId="mom-whatsapp">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-muted/40 p-3 border border-border/60">
                    {result.whatsapp_template_message}
                  </pre>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button type="button" variant="outline" size="sm" className="rounded-none gap-2" onClick={copyWhatsApp} data-testid="sales-mom-copy-wa">
                      <Copy className="h-3.5 w-3.5" /> {hi ? "कॉपी" : "Copy"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-none gap-2"
                      onClick={() => openWhatsAppShare(result.whatsapp_template_message)}
                      data-testid="sales-mom-open-wa"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </Button>
                    <Button type="button" variant="secondary" size="sm" className="rounded-none gap-2" onClick={copyJson} data-testid="sales-mom-copy-json">
                      <Copy className="h-3.5 w-3.5" /> {hi ? "JSON कॉपी" : "Copy JSON"}
                    </Button>
                  </div>
                  {result.meta?.engine && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Engine: {result.meta.engine}{result.meta.demo ? " (offline heuristic)" : ""}
                    </p>
                  )}
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
