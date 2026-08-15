import {
  Hammer, Store, Sun, Truck, Briefcase, Users, Layers, Compass, Package,
} from "lucide-react";

export const CATEGORY_TYPE_META = {
  construction: {
    label: { en: "Construction", hi: "निर्माण" },
    icon: Hammer,
    color: "text-orange-600",
    bg: "bg-orange-500/10 border-orange-500/25",
    chip: "hover:border-orange-500/60 data-[selected=true]:bg-orange-600 data-[selected=true]:border-orange-600",
  },
  marketplace: {
    label: { en: "Marketplace", hi: "मार्केटप्लेस" },
    icon: Store,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    chip: "hover:border-emerald-500/60 data-[selected=true]:bg-emerald-600 data-[selected=true]:border-emerald-600",
  },
  solar: {
    label: { en: "Solar", hi: "सोलर" },
    icon: Sun,
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-500/25",
    chip: "hover:border-amber-500/60 data-[selected=true]:bg-amber-600 data-[selected=true]:border-amber-600",
  },
  logistics: {
    label: { en: "Logistics", hi: "लॉजिस्टिक्स" },
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/25",
    chip: "hover:border-blue-500/60 data-[selected=true]:bg-blue-600 data-[selected=true]:border-blue-600",
  },
  professional_service: {
    label: { en: "Professional", hi: "प्रोफेशनल" },
    icon: Briefcase,
    color: "text-violet-600",
    bg: "bg-violet-500/10 border-violet-500/25",
    chip: "hover:border-violet-500/60 data-[selected=true]:bg-violet-600 data-[selected=true]:border-violet-600",
  },
  freelancer: {
    label: { en: "Freelancer", hi: "फ्रीलांसर" },
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-500/10 border-pink-500/25",
    chip: "hover:border-pink-500/60 data-[selected=true]:bg-pink-600 data-[selected=true]:border-pink-600",
  },
  architecture: {
    label: { en: "Architecture", hi: "आर्किटेक्चर" },
    icon: Compass,
    color: "text-cyan-600",
    bg: "bg-cyan-500/10 border-cyan-500/25",
    chip: "hover:border-cyan-500/60 data-[selected=true]:bg-cyan-600 data-[selected=true]:border-cyan-600",
  },
  general: {
    label: { en: "General", hi: "सामान्य" },
    icon: Layers,
    color: "text-slate-600",
    bg: "bg-slate-500/10 border-slate-500/25",
    chip: "hover:border-slate-500/60 data-[selected=true]:bg-slate-600 data-[selected=true]:border-slate-600",
  },
};

export function typeMeta(type, lang = "en") {
  const m = CATEGORY_TYPE_META[type] || CATEGORY_TYPE_META.general;
  return { ...m, labelText: m.label[lang] || m.label.en };
}

export function flattenTree(nodes, parentName = "") {
  const out = [];
  for (const n of nodes || []) {
    const item = { ...n, parent_name: parentName || n.name };
    if (n.children?.length) {
      out.push(...flattenTree(n.children, n.name));
    } else {
      out.push(item);
    }
  }
  return out;
}
