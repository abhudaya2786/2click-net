import { Play, X, Store, ClipboardList, Calculator, Gavel, Sun, FileText, ShoppingBag, HardHat } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ICONS = {
  store: Store,
  boq: ClipboardList,
  interior: ClipboardList,
  mart: Calculator,
  tenders: Gavel,
  solar: Sun,
  enroll: FileText,
  customer: ShoppingBag,
  vendor: Store,
  contractor: HardHat,
};

export default function DemoPanel() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { panelOpen, closePanel, features, launchFeature } = useDemoMode();

  return (
    <Dialog open={panelOpen} onOpenChange={(o) => !o && closePanel()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="demo-panel">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {hi ? "इंटरैक्टिव डेमो — सभी ऑप्शन" : "Interactive demo — all options"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {hi
              ? "कोई भी ऑप्शन चुनें — सैंपल डेटा और डेमो अकाउंट से पूरा फ्लो देखें।"
              : "Pick any option — explore with sample data and demo accounts."}
          </p>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {features.map((f) => {
            const Icon = ICONS[f.icon] || Play;
            return (
              <button
                key={f.id}
                type="button"
                data-testid={`demo-feature-${f.id}`}
                onClick={() => launchFeature(f)}
                className="flex items-start gap-3 p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-sm">{hi ? f.hi : f.en}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{hi ? f.descHi : f.descEn}</div>
                  <span className="text-[10px] font-mono text-primary mt-2 inline-flex items-center gap-1">
                    <Play className="h-3 w-3" /> {hi ? "डेमो चलाएँ" : "Run demo"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DemoFloatingButton() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { openPanel } = useDemoMode();

  return (
    <button
      type="button"
      data-testid="demo-fab"
      onClick={openPanel}
      className="fixed bottom-20 md:bottom-6 left-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground shadow-lg rounded-full px-4 py-2.5 text-sm font-semibold hover:scale-105 transition-transform"
    >
      <Play className="h-4 w-4 fill-current" />
      {hi ? "डेमो" : "Demo"}
    </button>
  );
}

export function DemoModeBanner() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { demoMode, usingSampleData, openPanel } = useDemoMode();

  if (!demoMode && !usingSampleData) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-sm" data-testid="demo-mode-banner">
      <span className="font-medium text-amber-900 dark:text-amber-200">
        {hi ? "🎯 डेमो मोड — सैंपल डेटा" : "🎯 Demo mode — sample data"}
      </span>
      <span className="text-muted-foreground mx-2">·</span>
      <button type="button" onClick={openPanel} className="text-primary font-medium hover:underline">
        {hi ? "और ऑप्शन देखें" : "Try more options"}
      </button>
    </div>
  );
}
