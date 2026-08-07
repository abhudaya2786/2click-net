import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e) => { e.preventDefault(); toast.success("Message sent! Our team will reach out within 24 hours."); setForm({ name: "", email: "", message: "" }); };

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-px bg-border border border-border">
      <div className="bg-card p-10">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Get in touch</span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-3">Let's build something big.</h1>
        <p className="mt-4 text-muted-foreground">Questions about enterprise plans, integrations or partnerships? We're here.</p>
        <div className="mt-10 space-y-6">
          {[[Mail, "sales@buildsphere.in"], [Phone, "+91 80 4000 1234"], [MapPin, "Prestige Tech Park, Bengaluru, KA 560103"]].map(([Icon, v], i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" strokeWidth={1.5} /></div>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="bg-card p-10 space-y-5">
        <div><label className="text-sm font-medium mb-1.5 block">Name</label>
          <Input data-testid="contact-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" /></div>
        <div><label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input data-testid="contact-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" /></div>
        <div><label className="text-sm font-medium mb-1.5 block">Message</label>
          <Textarea data-testid="contact-message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-none" /></div>
        <Button type="submit" data-testid="contact-submit" className="rounded-none w-full">Send message</Button>
      </form>
    </div>
  );
}
