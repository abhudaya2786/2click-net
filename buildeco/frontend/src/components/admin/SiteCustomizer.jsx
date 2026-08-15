import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Palette, Languages, MapPin, Layout, Image } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import GeoPincodeManager from "@/components/admin/GeoPincodeManager";

const A = "/admin";
const LAYOUTS = [
  { id: "standard", label: "Standard" },
  { id: "compact", label: "Compact" },
  { id: "wide", label: "Wide" },
];
const ICON_MODES = [
  { id: "hardhat", label: "Default icon" },
  { id: "logo", label: "Logo image" },
  { id: "support", label: "Supporter badge" },
];

export default function SiteCustomizer() {
  const { refresh } = useBranding();
  const [section, setSection] = useState("theme");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: "BuildEco Group",
    tagline: "",
    primary_color: "#FF5A1F",
    accent_color: "#10B981",
    logo: "",
    favicon: "",
    default_theme: "light",
    layout: "standard",
    navbar_style: "sticky",
    icon_mode: "hardhat",
    support_badge_url: "",
    footer_text: "",
    hero_layout: "split",
    card_style: "rounded",
    enabled_languages: ["en", "hi"],
    default_language: "en",
  });
  const [locales, setLocales] = useState({ enabled: ["en", "hi"], default: "en", strings: {} });

  const load = useCallback(async () => {
    const [{ data: site }, { data: loc }] = await Promise.all([
      api.get("/site-config"),
      api.get(`${A}/locales`),
    ]);
    setForm({
      brand_name: site.brand_name || "",
      tagline: site.tagline || "",
      primary_color: site.primary_color || "#FF5A1F",
      accent_color: site.accent_color || "#10B981",
      logo: site.logo || "",
      favicon: site.favicon || "",
      ...site.theme,
    });
    setLocales(loc);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveTheme = async () => {
    setSaving(true);
    try {
      await api.patch(`${A}/site-theme`, {
        brand_name: form.brand_name,
        tagline: form.tagline,
        primary_color: form.primary_color,
        accent_color: form.accent_color,
        logo: form.logo,
        favicon: form.favicon,
        default_theme: form.default_theme,
        layout: form.layout,
        navbar_style: form.navbar_style,
        icon_mode: form.icon_mode,
        support_badge_url: form.support_badge_url,
        footer_text: form.footer_text,
        hero_layout: form.hero_layout,
        card_style: form.card_style,
        enabled_languages: form.enabled_languages,
        default_language: form.default_language,
      });
      toast.success("Website theme saved — live for all users");
      refresh();
    } catch {
      toast.error("Save failed — super admin only");
    } finally {
      setSaving(false);
    }
  };

  const saveLocales = async () => {
    setSaving(true);
    try {
      await api.patch(`${A}/locales`, locales);
      toast.success("Languages saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "theme", label: "Theme & Colors", icon: Palette },
    { id: "layout", label: "Layout & Icons", icon: Layout },
    { id: "languages", label: "Languages", icon: Languages },
    { id: "geo", label: "Pincode / GPS", icon: MapPin },
  ];

  return (
    <div className="bg-card border border-border">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-sm tracking-tight">Website Customization</h3>
          <p className="text-[10px] text-muted-foreground">Super Admin only — changes apply to entire site for all users</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`site-tab-${t.id}`}
              onClick={() => setSection(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border ${section === t.id ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}
            >
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {section === "theme" && (
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
            <div><label className="text-xs font-medium mb-1 block">Brand name</label>
              <Input value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} className="rounded-none" /></div>
            <div><label className="text-xs font-medium mb-1 block">Tagline</label>
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="rounded-none" /></div>
            <div><label className="text-xs font-medium mb-1 block">Primary color</label>
              <div className="flex gap-2"><input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="h-10 w-14 border" />
                <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="rounded-none" /></div></div>
            <div><label className="text-xs font-medium mb-1 block">Accent color</label>
              <div className="flex gap-2"><input type="color" value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="h-10 w-14 border" />
                <Input value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="rounded-none" /></div></div>
            <div><label className="text-xs font-medium mb-1 block">Default theme</label>
              <select value={form.default_theme} onChange={(e) => set("default_theme", e.target.value)} className="w-full h-10 border px-3 text-sm">
                <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
              </select></div>
            <div><label className="text-xs font-medium mb-1 block">Footer text</label>
              <Input value={form.footer_text} onChange={(e) => set("footer_text", e.target.value)} className="rounded-none" /></div>
          </div>
        )}

        {section === "layout" && (
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
            <div><label className="text-xs font-medium mb-1 block">Page layout</label>
              <select value={form.layout} onChange={(e) => set("layout", e.target.value)} className="w-full h-10 border px-3 text-sm">
                {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select></div>
            <div><label className="text-xs font-medium mb-1 block">Hero layout</label>
              <select value={form.hero_layout} onChange={(e) => set("hero_layout", e.target.value)} className="w-full h-10 border px-3 text-sm">
                <option value="split">Split image + text</option><option value="centered">Centered</option><option value="full">Full width image</option>
              </select></div>
            <div><label className="text-xs font-medium mb-1 block">Navbar icon</label>
              <select value={form.icon_mode} onChange={(e) => set("icon_mode", e.target.value)} className="w-full h-10 border px-3 text-sm">
                {ICON_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select></div>
            <div><label className="text-xs font-medium mb-1 block flex items-center gap-1"><Image className="h-3 w-3" /> Logo URL</label>
              <Input value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://…" className="rounded-none" /></div>
            <div><label className="text-xs font-medium mb-1 block">Favicon URL</label>
              <Input value={form.favicon} onChange={(e) => set("favicon", e.target.value)} className="rounded-none" /></div>
            <div><label className="text-xs font-medium mb-1 block">Supporter / partner badge URL</label>
              <Input value={form.support_badge_url} onChange={(e) => set("support_badge_url", e.target.value)} className="rounded-none" /></div>
          </div>
        )}

        {section === "languages" && (
          <div className="max-w-xl space-y-4">
            <p className="text-xs text-muted-foreground">Enabled languages appear in navbar for all users.</p>
            <div className="flex gap-4">
              {["en", "hi"].map((code) => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(locales.enabled || []).includes(code)}
                    onChange={(e) => {
                      const en = new Set(locales.enabled || []);
                      if (e.target.checked) en.add(code); else en.delete(code);
                      setLocales({ ...locales, enabled: [...en] });
                    }}
                  />
                  {code === "en" ? "English" : "हिन्दी"}
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Default language</label>
              <select
                value={locales.default || "en"}
                onChange={(e) => setLocales({ ...locales, default: e.target.value })}
                className="w-full h-10 border px-3 text-sm max-w-xs"
              >
                {(locales.enabled || ["en"]).map((c) => (
                  <option key={c} value={c}>{c === "hi" ? "हिन्दी" : "English"}</option>
                ))}
              </select>
            </div>
            <Button onClick={saveLocales} disabled={saving} className="rounded-none">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save languages"}
            </Button>
          </div>
        )}

        {section === "geo" && <GeoPincodeManager />}

        {(section === "theme" || section === "layout") && (
          <Button data-testid="site-theme-save" onClick={saveTheme} disabled={saving} className="rounded-none mt-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish to live website"}
          </Button>
        )}
      </div>
    </div>
  );
}
