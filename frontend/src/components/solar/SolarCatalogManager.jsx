import { useState } from "react";
import { Sun, Layers } from "lucide-react";
import SolarBrandsManager from "@/components/solar/SolarBrandsManager";
import SolarPackagesManager from "@/components/solar/SolarPackagesManager";

const SUB = [
  { id: "brands", label: "Brands & Prices", icon: Sun },
  { id: "packages", label: "Package Presets", icon: Layers },
];

export default function SolarCatalogManager({ scope = "admin" }) {
  const [tab, setTab] = useState("brands");
  return (
    <div className="space-y-4" data-testid={`solar-catalog-${scope}`}>
      <div className="flex flex-wrap gap-1 border border-border bg-card">
        {SUB.map((s) => (
          <button key={s.id} data-testid={`solar-subtab-${s.id}`} onClick={() => setTab(s.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${tab === s.id ? "bg-primary text-white" : "hover:bg-accent text-muted-foreground"}`}>
            <s.icon className="h-4 w-4" strokeWidth={1.5} />{s.label}
          </button>
        ))}
      </div>
      {tab === "brands" && <SolarBrandsManager scope={scope} />}
      {tab === "packages" && <SolarPackagesManager scope={scope} />}
    </div>
  );
}
