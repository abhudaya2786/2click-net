import { Link } from "react-router-dom";
import { Store, CheckCircle2, ArrowRight, IndianRupee, Gavel, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/marketing/PageSEO";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import WhatsAppShare from "@/components/marketing/WhatsAppShare";

const STEPS = [
  { n: "1", t: "फॉर्म भरें", tEn: "Fill form", d: "दुकान या vendor विवरण और KYC शुरू करें", dEn: "Start shop or vendor details and KYC" },
  { n: "2", t: "दस्तावेज़ जमा", tEn: "Submit documents", d: "GST, PAN और दुकान दस्तावेज़ अपलोड", dEn: "Upload GST, PAN and shop documents" },
  { n: "3", t: "सत्यापन", tEn: "Verification", d: "टीम सत्यापन और अनुमोदन", dEn: "Team verification and approval" },
  { n: "4", t: "स्टोर लाइव", tEn: "Store live", d: "Marketplace पर लिस्टिंग और ऑर्डर", dEn: "Live on marketplace — receive orders" },
];

const BENEFITS = [
  { icon: IndianRupee, t: "कमीशन पर कमाई", d: "हर ऑर्डर पर platform fee — Solar 3%, Steel 2.5%" },
  { icon: Gavel, t: "टेंडर बिडिंग", d: "Live reverse auction में सबसे कम बोली लगाएँ" },
  { icon: Sun, t: "Solar leads", d: "Solar portal से तैयार ग्राहक आपके पास" },
  { icon: Store, t: "Super Mart", d: "Material rate catalog में अपनी दरें दिखाएँ" },
];

export default function BecomeVendor() {
  const waMsg = "नमस्ते 2click.in — मैं vendor के रूप में अपनी दुकान online लगाना चाहता/चाहती हूँ।";

  return (
    <div>
      <PageSEO
        title="Vendor बनें — B2B Marketplace पर बेचें"
        description="2click.in पर vendor बनें। Construction materials, solar, steel online बेचें। Tender bidding, commission model, free onboarding."
        path="/become-vendor"
      />

      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/30">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Vendor Onboarding</span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mt-3 leading-tight">
              अपनी दुकान <span className="text-primary">2click.in</span> पर लगाएँ
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg">
              India का construction super-app — Marketplace, Tenders, Solar और ERP एक ही platform पर।
              हज़ारों buyers आप तक पहुँचेंगे।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/enroll?mode=shop">
                <Button size="lg" className="btn-premium" data-testid="vendor-register-cta">
                  दुकान पंजीकरण <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/enroll?mode=vendor">
                <Button size="lg" variant="outline" data-testid="vendor-enroll-cta">
                  Vendor पंजीकरण
                </Button>
              </Link>
              <WhatsAppShare message={waMsg} label="WhatsApp पर बात करें" />
            </div>
          </div>
          <LeadCaptureForm
            source="become-vendor"
            interest="vendor"
            title="Vendor onboarding में मदद चाहिए?"
            subtitle="नाम और फ़ोन दें — हमारी टीम आपको step-by-step गाइड करेगी।"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-14">
        <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-8">4 आसान स्टेप</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card-premium p-6">
              <span className="font-mono text-2xl font-bold text-primary">{s.n}</span>
              <h3 className="font-display font-bold mt-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-14">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mb-8">Vendor को क्या मिलता है?</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.t} className="p-6 border border-border">
                <b.icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-display font-bold">{b.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{b.d}</p>
              </div>
            ))}
          </div>
          <ul className="mt-10 space-y-2">
            {["मुफ़्त लिस्टिंग (Starter plan)", "Dashboard से orders track करें", "Wallet payments support", "Admin support: +91 70072 54932"].map((line) => (
              <li key={line} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
