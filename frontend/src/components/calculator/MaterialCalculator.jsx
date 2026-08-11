import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/context/LanguageContext";
import {
  calculateConstructionMaterials,
  MATERIAL_QUALITY_TIERS,
  MATERIAL_BRANDS,
} from "@/lib/materialCalculator";
import { Calculator, Store, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const COPY = {
  en: {
    title: "House construction material calculator",
    areaLabel: "Built-up area (sq. ft.)",
    areaPlaceholder: "e.g. 1000",
    qualityLabel: "Construction quality",
    calculate: "Calculate material & cost",
    resultsTitle: "Estimated results",
    totalCost: "Estimated total cost",
    cement: "Cement",
    cementUnit: "bags",
    steel: "Steel (saria)",
    steelUnit: "kg",
    sand: "Sand / M-Sand",
    sandUnit: "cu. ft.",
    aggregate: "Aggregate (gitti)",
    aggregateUnit: "cu. ft.",
    bricks: "Red bricks",
    bricksUnit: "pieces",
    tiles: "Tiles",
    tilesUnit: "sq. ft.",
    paint: "Paint",
    paintUnit: "liters",
    brands: "Brands",
    invalidArea: "Please enter a valid built-up area",
    buyMaterials: "Buy materials in store",
    fullEstimate: "Full cost breakdown",
  },
  hi: {
    title: "मकान निर्माण सामग्री कैलकुलेटर",
    areaLabel: "बिल्ट-अप एरिया (वर्ग फुट)",
    areaPlaceholder: "जैसे 1000",
    qualityLabel: "निर्माण क्वालिटी",
    calculate: "सामग्री और लागत की गणना करें",
    resultsTitle: "अनुमानित परिणाम",
    totalCost: "अनुमानित कुल लागत",
    cement: "सीमेंट",
    cementUnit: "बोरी",
    steel: "सरिया (Steel)",
    steelUnit: "kg",
    sand: "बालू / M-Sand",
    sandUnit: "Cu. Ft.",
    aggregate: "गिट्टी (Aggregate)",
    aggregateUnit: "Cu. Ft.",
    bricks: "लाल ईंटें",
    bricksUnit: "नग",
    tiles: "टाइल्स",
    tilesUnit: "Sq. Ft.",
    paint: "पेंट",
    paintUnit: "लीटर",
    brands: "ब्रांड्स",
    invalidArea: "कृपया सही वर्ग फुट दर्ज करें",
    buyMaterials: "स्टोर में सामग्री खरीदें",
    fullEstimate: "पूर्ण लागत विवरण",
  },
};

function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}

export default function MaterialCalculator({ embedded = false }) {
  const { lang } = useLang();
  const t = COPY[lang] || COPY.en;
  const [area, setArea] = useState("1000");
  const [tierId, setTierId] = useState("standard");
  const [result, setResult] = useState(null);

  const tier = MATERIAL_QUALITY_TIERS.find((q) => q.id === tierId) || MATERIAL_QUALITY_TIERS[1];

  const calculate = () => {
    const sqft = parseFloat(area);
    if (!sqft || sqft <= 0) {
      toast.error(t.invalidArea);
      setResult(null);
      return;
    }
    setResult(calculateConstructionMaterials(sqft, tier.rate));
  };

  const brand = (key) => MATERIAL_BRANDS[key][lang] || MATERIAL_BRANDS[key].en;

  const items = result
    ? [
        { label: t.cement, value: result.cement_bags, unit: t.cementUnit, brands: brand("cement") },
        { label: t.steel, value: result.steel_kg, unit: t.steelUnit, brands: brand("steel") },
        { label: t.sand, value: result.sand_cu_ft, unit: t.sandUnit },
        { label: t.aggregate, value: result.aggregate_cu_ft, unit: t.aggregateUnit },
        { label: t.bricks, value: result.bricks, unit: t.bricksUnit },
        { label: t.tiles, value: result.tiles_sqft, unit: t.tilesUnit, brands: brand("tiles") },
        { label: t.paint, value: result.paint_liters, unit: t.paintUnit, brands: brand("paint") },
      ]
    : [];

  return (
    <div className={embedded ? "" : "mx-auto max-w-lg"}>
      <div className="glass-card rounded-2xl border border-border/60 p-6 md:p-8">
        {!embedded && (
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-center flex-1">{t.title}</h2>
          </div>
        )}

        <label className="text-sm font-semibold block mb-2">{t.areaLabel}</label>
        <Input
          type="number"
          min="1"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder={t.areaPlaceholder}
          className="rounded-xl mb-4"
          data-testid="material-calc-area"
        />

        <label className="text-sm font-semibold block mb-2">{t.qualityLabel}</label>
        <select
          value={tierId}
          onChange={(e) => setTierId(e.target.value)}
          className="w-full h-10 border border-input rounded-xl px-3 text-sm mb-5 bg-background"
          data-testid="material-calc-quality"
        >
          {MATERIAL_QUALITY_TIERS.map((q) => (
            <option key={q.id} value={q.id}>
              {lang === "hi" ? q.labelHi : q.labelEn}
            </option>
          ))}
        </select>

        <Button
          className="w-full rounded-xl h-12 text-base font-bold"
          onClick={calculate}
          data-testid="material-calc-submit"
        >
          {t.calculate}
        </Button>

        {result && (
          <div className="mt-6" data-testid="material-calc-results">
            <h3 className="text-primary font-display font-bold text-lg border-b-2 border-primary pb-2 mb-4">
              {t.resultsTitle}
            </h3>
            <p className="mb-4">
              <strong>{t.totalCost}:</strong>{" "}
              <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                ₹ {fmt(result.total_cost)}
              </span>
            </p>
            <ul className="space-y-3 text-sm leading-relaxed">
              {items.map((item) => (
                <li key={item.label} className="border-b border-border/40 pb-2 last:border-0">
                  <strong>{item.label}:</strong> {fmt(item.value)} {item.unit}
                  {item.brands && (
                    <br />
                  )}
                  {item.brands && (
                    <small className="text-muted-foreground">
                      ({t.brands}: {item.brands})
                    </small>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/store" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  <Store className="h-4 w-4 mr-2" /> {t.buyMaterials}
                </Button>
              </Link>
              <Link to="/estimate" className="flex-1">
                <Button className="w-full rounded-xl">
                  {t.fullEstimate} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
