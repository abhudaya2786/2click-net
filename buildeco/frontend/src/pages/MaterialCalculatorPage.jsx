import PageSEO from "@/components/marketing/PageSEO";
import MaterialCalculator from "@/components/calculator/MaterialCalculator";
import { useLang } from "@/context/LanguageContext";

export default function MaterialCalculatorPage() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title={lang === "hi" ? "निर्माण सामग्री कैलकुलेटर — buildecogroup.com" : "Material calculator — buildecogroup.com"}
        description={lang === "hi"
          ? "बिल्ट-अप एरिया से सीमेंट, सरिया, ईंट, टाइल्स और कुल लागत का अनुमान"
          : "Estimate cement, steel, bricks, tiles and total cost from built-up area"}
        path="/material-calculator"
      />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 text-center">
        {lang === "hi" ? "तेज़ अनुमान" : "Quick estimate"}
      </p>
      <MaterialCalculator />
    </div>
  );
}
