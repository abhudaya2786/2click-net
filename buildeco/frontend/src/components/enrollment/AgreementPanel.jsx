import { Check, FileText, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrintShareBar from "@/components/enrollment/PrintShareBar";
import { buildAgreementPrintHtml, buildAgreementsBundleHtml, printHtml } from "@/lib/printShare";
import { openWhatsAppShare } from "@/lib/whatsapp";

export default function AgreementPanel({
  agreements = [],
  accepted = {},
  onToggle,
  lang = "en",
  t = (k) => k,
}) {
  const hi = lang === "hi";

  if (!agreements.length) {
    return <p className="text-sm text-muted-foreground">{t("loading_agreements")}</p>;
  }

  const printOne = (a) => {
    const title = hi ? a.title_hi || a.title : a.title;
    printHtml(`buildecogroup.com — ${title}`, buildAgreementPrintHtml(a, lang));
  };

  const shareOne = (a) => {
    const title = hi ? a.title_hi || a.title : a.title;
    const content = hi ? a.content_hi || a.content : a.content;
    openWhatsAppShare(`${title}\n\n${content}\n\n— buildecogroup.com`);
  };

  const printAll = () => {
    printHtml(hi ? "buildecogroup.com समझौते" : "buildecogroup.com Agreements", buildAgreementsBundleHtml(agreements, lang));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("agreements_intro")}</p>
        <PrintShareBar
          onPrint={printAll}
          printTitle={hi ? "buildecogroup.com समझौते" : "buildecogroup.com Agreements"}
          printHtmlBody={buildAgreementsBundleHtml(agreements, lang)}
          shareText={hi ? "buildecogroup.com पंजीकरण समझौते — www.buildecogroup.com/enroll" : "buildecogroup.com enrollment agreements — www.buildecogroup.com/enroll"}
          shareUrl="https://www.buildecogroup.com/enroll"
          emailSubject={hi ? "buildecogroup.com समझौते" : "buildecogroup.com agreements"}
          t={(k) => (k === "print" ? t("print_all") : t(k))}
          size="sm"
        />
      </div>

      {agreements.map((a) => {
        const title = hi ? a.title_hi || a.title : a.title;
        const content = hi ? a.content_hi || a.content : a.content;
        const on = accepted[a.code];
        return (
          <div key={a.code} className={`border rounded-xl overflow-hidden ${on ? "border-primary/40 bg-primary/5" : "border-border"}`}>
            <label className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="checkbox"
                data-testid={`agreement-${a.code}`}
                checked={on || false}
                onChange={() => onToggle(a.code)}
                className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  {title}
                  {a.required && <span className="text-[10px] font-mono uppercase text-destructive">{t("required")}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">v{a.version}</p>
              </div>
              {on && <Check className="h-4 w-4 text-primary shrink-0" />}
            </label>
            <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-border/50 bg-muted/20 pt-2">
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={() => printOne(a)}>
                <Printer className="h-3.5 w-3.5" />{t("print")}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={() => shareOne(a)}>
                <Share2 className="h-3.5 w-3.5" />{t("share")}
              </Button>
            </div>
            <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/30 p-3 max-h-40 overflow-y-auto">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
