import { useState } from "react";
import { Check, FileText } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("agreements_intro")}</p>
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
            <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/30 p-3 max-h-32 overflow-y-auto">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
