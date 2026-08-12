import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";

/**
 * Lightweight lead form — stores via POST /api/contact with source + interest.
 */
export default function LeadCaptureForm({
  source = "lead",
  interest = "",
  title = "मुफ़्त कॉलबैक चाहिए?",
  subtitle = "अपना नाम और फ़ोन छोड़ें — हमारी टीम 24 घंटे में संपर्क करेगी।",
  submitLabel = "कॉलबैक भेजें",
  compact = false,
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.phone && !form.email) {
      toast.error("कृपया फ़ोन या ईमेल दें");
      return;
    }
    setBusy(true);
    try {
      await api.post("/contact", {
        name: form.name,
        email: form.email || `${form.phone.replace(/\D/g, "")}@lead.buildecogroup.com`,
        phone: form.phone,
        message: form.message || `Interest: ${interest || source}`,
        source,
        interest: interest || source,
      });
      toast.success("धन्यवाद! हम जल्द संपर्क करेंगे।");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("भेज नहीं हो पाया। फिर से कोशिश करें।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`card-premium bg-card ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0">
          <Phone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Input
          data-testid="lead-name"
          required
          placeholder="आपका नाम"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-none"
        />
        <Input
          data-testid="lead-phone"
          type="tel"
          placeholder="मोबाइल नंबर"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-none"
        />
        {!compact && (
          <Input
            data-testid="lead-email"
            type="email"
            placeholder="ईमेल (वैकल्पिक)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-none"
          />
        )}
        {!compact && (
          <Textarea
            data-testid="lead-message"
            rows={2}
            placeholder="संदेश (वैकल्पिक)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="rounded-none"
          />
        )}
        <Button type="submit" data-testid="lead-submit" disabled={busy} className="w-full rounded-none btn-premium">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </form>
    </div>
  );
}
