import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import PageSEO from "@/components/marketing/PageSEO";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", { ...form, source: "contact", interest: "general" });
      toast.success("Message sent! Our team will reach out within 24 hours.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch { toast.error("Could not send. Please try again."); } finally { setBusy(false); }
  };

  const OFFICES = [
    ["Head Office", "Gorakhpur, Uttar Pradesh"],
    ["Corporate Office", "Gurugram, Haryana"],
    ["Branch Office", "Vapi, Gujarat"],
  ];

  return (
    <>
      <PageSEO
        title="Contact — Sales, Partnerships & Support"
        description="Contact buildecogroup.com — Gorakhpur head office, Gurugram corporate office. Sales, enterprise plans and partnerships."
        path="/contact"
      />
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-px bg-border border border-border">
      <div className="bg-card p-10">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Get in touch</span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-3">Let's build something big.</h1>
        <p className="mt-4 text-muted-foreground">Questions about enterprise plans, integrations or partnerships? We're here.</p>
        <div className="mt-10 space-y-5">
          <a href="mailto:sales@buildecogroup.com" data-testid="contact-email-link" className="flex items-center gap-4 group">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0"><Mail className="h-5 w-5 text-primary" strokeWidth={1.5} /></div>
            <div><div className="text-xs text-muted-foreground">Email</div><div className="text-sm font-medium group-hover:text-primary transition-colors">sales@buildecogroup.com</div></div>
          </a>
          <a href="tel:+917007254932" data-testid="contact-phone-link" className="flex items-center gap-4 group">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0"><Phone className="h-5 w-5 text-primary" strokeWidth={1.5} /></div>
            <div><div className="text-xs text-muted-foreground">Phone</div><div className="text-sm font-medium group-hover:text-primary transition-colors">+91 70072 54932</div></div>
          </a>
          <div className="pt-5 border-t border-border space-y-4">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Our offices</div>
            {OFFICES.map(([label, v], i) => (
              <div key={i} className="flex items-start gap-4" data-testid={`office-${i}`}>
                <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} /></div>
                <div><div className="text-xs text-muted-foreground">{label}</div><div className="text-sm font-medium">{v}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="bg-card p-10 space-y-5">
        <div><label className="text-sm font-medium mb-1.5 block">Name</label>
          <Input data-testid="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" /></div>
        <div><label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input data-testid="contact-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" /></div>
        <div><label className="text-sm font-medium mb-1.5 block">Phone</label>
          <Input data-testid="contact-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-none" placeholder="+91" /></div>
        <div><label className="text-sm font-medium mb-1.5 block">Message</label>
          <Textarea data-testid="contact-message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-none" /></div>
        <Button type="submit" data-testid="contact-submit" disabled={busy} className="rounded-none w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}</Button>
      </form>
    </div>
    </>
  );
}
