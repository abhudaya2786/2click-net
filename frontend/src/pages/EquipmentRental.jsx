import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { DEMO_EQUIPMENT_RENTALS, DEMO_EQUIPMENT_META } from "@/lib/demoData";
import PageSEO from "@/components/marketing/PageSEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Truck, Search, MapPin, Loader2, BadgeCheck, Send,
  HardHat, Package, ArrowRight, Construction,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TAB_ALL = "all";
const TAB_LOGISTICS = "logistics";

const CAT_ICONS = {
  jcb_earthmoving: HardHat,
  crane_lifting: Construction,
  concrete: Package,
  road_compaction: Truck,
  transport_tipper: Truck,
  flatbed_haulage: Truck,
  generator_power: Package,
  scaffolding: HardHat,
  material_delivery: Truck,
  specialized: Construction,
};

function filterList(list, { tab, category, state, city, q }) {
  return list.filter((item) => {
    if (tab === TAB_LOGISTICS && !["logistics", "site_delivery", "heavy_haulage"].includes(item.service_type)) return false;
    if (category && category !== "all" && item.category_id !== category) return false;
    if (state && item.state !== state) return false;
    if (city && item.city !== city) return false;
    if (q) {
      const blob = `${item.title} ${item.title_hi || ""} ${item.equipment_model || ""} ${item.vendor_name || ""}`.toLowerCase();
      if (!blob.includes(q.toLowerCase())) return false;
    }
    return true;
  });
}

export default function EquipmentRental() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { user } = useAuth();
  const { demoActive } = useDemoMode();

  const [meta, setMeta] = useState(DEMO_EQUIPMENT_META);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(TAB_ALL);
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [q, setQ] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", start_date: "", duration: "", site_address: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/equipment-rental/meta").then(({ data }) => setMeta(data)).catch(() => setMeta(DEMO_EQUIPMENT_META));
    api.get("/geo/states").then(({ data }) => setStates(data.states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (state) {
      api.get("/geo/cities", { params: { state } }).then(({ data }) => setCities(data.cities || [])).catch(() => setCities([]));
    } else setCities([]);
  }, [state]);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (state) params.state = state;
    if (city) params.city = city;
    if (category !== "all") params.category_id = category;
    if (tab === TAB_LOGISTICS) params.logistics_only = true;
    if (q) params.q = q;
    api.get("/equipment-rental", { params })
      .then(({ data }) => setList(data))
      .catch(() => setList(filterList(DEMO_EQUIPMENT_RENTALS, { tab, category, state, city, q })))
      .finally(() => setLoading(false));
  }, [tab, category, state, city, q]);

  useEffect(() => { load(); }, [load]);

  const displayList = list.length ? list : (demoActive ? filterList(DEMO_EQUIPMENT_RENTALS, { tab, category, state, city, q }) : list);

  const openBook = (item) => {
    if (!user?.name) {
      setForm((f) => ({ ...f, name: user?.name || "", email: user?.email || "" }));
    }
    setBooking(item);
    setForm({
      name: user?.name || "",
      phone: "",
      email: user?.email || "",
      start_date: "",
      duration: item.min_duration || "",
      site_address: "",
      message: hi ? `${item.title_hi || item.title} के लिए बुकिंग` : `Booking for ${item.title}`,
    });
  };

  const submitRequest = async () => {
    if (!form.name.trim()) {
      toast.error(hi ? "नाम दें" : "Name required");
      return;
    }
    setSending(true);
    try {
      await api.post("/equipment-rental/request", {
        listing_id: booking?.id,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        city: city || booking?.city,
        state: state || booking?.state,
        category_id: booking?.category_id,
        service_type: booking?.service_type,
        start_date: form.start_date,
        duration: form.duration,
        site_address: form.site_address,
        message: form.message,
      });
      toast.success(hi ? "बुकिंग अनुरोध भेजा गया!" : "Booking request sent!");
      setBooking(null);
    } catch {
      toast.success(hi ? "अनुरोध दर्ज (डेमो)" : "Request recorded (demo)");
      setBooking(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title={hi ? "कंस्ट्रक्शन उपकरण रेंटल" : "Construction equipment rental"}
        description={hi
          ? "JCB, क्रेन, टिपर, लॉजिस्टिक्स — मशीनरी रेंटल और साइट ट्रांसपोर्ट 2click.in पर।"
          : "JCB, crane, tipper, logistics — machinery rental and site transport on 2click.in."}
        path="/equipment-rental"
        keywords="JCB rental, crane hire, tipper logistics, construction equipment rental India"
      />

      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          {hi ? "रेंटल और लॉजिस्टिक्स" : "Rental & logistics"}
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          {hi ? "कंस्ट्रक्शन उपकरण, मशीनरी रेंटल और लॉजिस्टिक्स" : "Construction equipment, machinery rental & logistics"}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          {hi
            ? "JCB, एक्सकेवेटर, क्रेन, टिपर, फ्लैटबेड, DG, स्कैफोल्डिंग — शहर और सेवा प्रकार के हिसाब से खोजें।"
            : "JCB, excavator, crane, tipper, flatbed, DG, scaffolding — browse by city and service type."}
        </p>
        <Link to="/become-vendor" className="text-sm text-primary hover:underline mt-2 inline-block">
          {hi ? "विक्रेता/फ्लीट ऑपरेटर के रूप में लिस्ट करें →" : "List your fleet as vendor →"}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab(TAB_ALL)}
          className={`px-4 py-2 text-sm border rounded-lg ${tab === TAB_ALL ? "bg-primary text-white border-primary" : "border-border"}`}
        >
          {hi ? "सभी रेंटल" : "All rental"}
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB_LOGISTICS)}
          className={`px-4 py-2 text-sm border rounded-lg flex items-center gap-1.5 ${tab === TAB_LOGISTICS ? "bg-primary text-white border-primary" : "border-border"}`}
        >
          <Truck className="h-4 w-4" />
          {hi ? "लॉजिस्टिक्स और ट्रांसपोर्ट" : "Logistics & transport"}
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-4" data-testid="equipment-category-tabs">
        <button type="button" onClick={() => setCategory("all")}
          className={`px-3 py-1.5 text-xs border rounded-full ${category === "all" ? "bg-primary text-white border-primary" : "border-border"}`}>
          {hi ? "सभी" : "All types"}
        </button>
        {(meta.equipment_categories || []).map((c) => {
          const Icon = CAT_ICONS[c.id] || Truck;
          return (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 text-xs border rounded-full flex items-center gap-1 ${category === c.id ? "bg-primary text-white border-primary" : "border-border"}`}>
              <Icon className="h-3 w-3" />
              {hi ? c.name_hi || c.name : c.name}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={hi ? "खोजें…" : "Search…"} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-9 rounded-md" />
        </div>
        <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} className="h-9 border border-input bg-background px-2 text-sm rounded-md">
          <option value="">{hi ? "सभी राज्य" : "All states"}</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!state} className="h-9 border border-input bg-background px-2 text-sm rounded-md disabled:opacity-50">
          <option value="">{hi ? "सभी शहर" : "All cities"}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : displayList.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{hi ? "कोई लिस्टिंग नहीं — फ़िल्टर बदलें।" : "No listings — try different filters."}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((item) => {
            const Icon = CAT_ICONS[item.category_id] || Truck;
            return (
              <motion.article
                key={item.id}
                data-testid={`equipment-${item.id}`}
                className="border border-border rounded-xl bg-card overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="relative h-40 bg-muted">
                  {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : (
                    <div className="h-full flex items-center justify-center"><Icon className="h-12 w-12 text-muted-foreground/30" /></div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] uppercase bg-background/90 px-2 py-0.5 border border-border">
                    {hi ? item.service_type_name_hi : item.service_type_name}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-bold text-sm leading-snug">{hi ? item.title_hi || item.title : item.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.location_label}
                  </p>
                  <p className="text-xs">{item.equipment_model} · {item.capacity}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary text-sm">{item.rate_label}</span>
                    {item.operator_included && (
                      <span className="text-[10px] border border-border px-1.5 py-0.5">{hi ? "ऑपरेटर" : "Operator"}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {item.vendor_name}
                    {item.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                  </p>
                  <Button size="sm" className="w-full rounded-md mt-2" onClick={() => openBook(item)}>
                    {hi ? "बुक / पूछताछ" : "Book / enquire"}
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Service types overview */}
      <section className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(meta.service_types || []).map((s) => (
          <div key={s.id} className="p-4 border border-border rounded-xl bg-secondary/10">
            <div className="font-display font-bold text-sm">{hi ? s.name_hi : s.name}</div>
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/tenders" className="text-primary hover:underline flex items-center gap-1">{hi ? "टेंडर" : "Tenders"} <ArrowRight className="h-3.5 w-3.5" /></Link>
        <Link to="/store" className="text-primary hover:underline">{hi ? "मटेरियल स्टोर" : "Material store"}</Link>
        <Link to="/boq-builder" className="text-primary hover:underline">{hi ? "BOQ बिल्डर" : "BOQ builder"}</Link>
      </div>

      <Dialog open={!!booking} onOpenChange={(v) => !v && setBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hi ? "रेंटल / लॉजिस्टिक्स अनुरोध" : "Rental / logistics request"}</DialogTitle>
          </DialogHeader>
          {booking && (
            <p className="text-sm text-muted-foreground mb-3">{hi ? booking.title_hi || booking.title : booking.title}</p>
          )}
          <div className="space-y-3">
            <Input placeholder={hi ? "नाम" : "Name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="tel" placeholder={hi ? "मोबाइल" : "Mobile"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input type="email" placeholder={hi ? "ईमेल" : "Email"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder={hi ? "शुरू तारीख" : "Start date"} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input placeholder={hi ? "अवधि (दिन/ट्रिप)" : "Duration (days/trips)"} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input placeholder={hi ? "साइट पता" : "Site address"} value={form.site_address} onChange={(e) => setForm({ ...form, site_address: e.target.value })} />
            <Textarea placeholder={hi ? "संदेश" : "Message"} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
          </div>
          <DialogFooter>
            <Button onClick={submitRequest} disabled={sending} className="rounded-md">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" />{hi ? "भेजें" : "Send"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
