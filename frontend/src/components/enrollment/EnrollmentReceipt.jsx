import PrintShareBar from "@/components/enrollment/PrintShareBar";
import { buildEnrollmentReceiptHtml, buildEnrollmentShareText } from "@/lib/printShare";

export default function EnrollmentReceipt({ data, lang = "en", t = (k) => k, showActions = true }) {
  if (!data) return null;
  const hi = lang === "hi";
  const user = data.user || {};
  const shop = data.shop;
  const agreements = data.agreements || [];

  const printHtmlBody = buildEnrollmentReceiptHtml(data, lang);
  const shareText = buildEnrollmentShareText(data, lang);
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/enroll" : "https://www.2click.in/enroll";

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden" data-testid="enrollment-receipt">
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-display font-bold text-sm">{t("enrollment_receipt")}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{new Date().toLocaleString()}</div>
        </div>
        {showActions && (
          <PrintShareBar
            printTitle={hi ? "2click.in पंजीकरण" : "2click.in Enrollment"}
            printHtmlBody={printHtmlBody}
            shareText={shareText}
            shareUrl={shareUrl}
            emailSubject={hi ? "2click.in पंजीकरण रसीद" : "2click.in enrollment receipt"}
            t={t}
          />
        )}
      </div>
      <div className="p-4 space-y-4 text-sm">
        <section>
          <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">{t("your_profile")}</h4>
          <dl className="grid sm:grid-cols-2 gap-2 text-xs">
            <div><dt className="text-muted-foreground">{t("full_name")}</dt><dd className="font-medium">{user.name || data.name}</dd></div>
            <div><dt className="text-muted-foreground">{t("email")}</dt><dd className="font-medium">{user.email || data.email}</dd></div>
            <div><dt className="text-muted-foreground">{t("phone")}</dt><dd>{user.phone || data.phone || "—"}</dd></div>
            <div><dt className="text-muted-foreground">{t("enrollment_status")}</dt><dd><span className="font-mono uppercase text-primary">{user.enrollment_status || data.enrollment_status || "—"}</span></dd></div>
          </dl>
        </section>
        {shop && (
          <section>
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">{t("shop_details")}</h4>
            <dl className="grid sm:grid-cols-2 gap-2 text-xs">
              <div><dt className="text-muted-foreground">{t("shop_name")}</dt><dd className="font-medium">{shop.name}</dd></div>
              <div><dt className="text-muted-foreground">{t("shop_type")}</dt><dd>{shop.shop_type}</dd></div>
              <div><dt className="text-muted-foreground">{t("gst_number")}</dt><dd className="font-mono">{shop.gst_number || "—"}</dd></div>
              <div><dt className="text-muted-foreground">{t("pan_number")}</dt><dd className="font-mono">{shop.pan_number || "—"}</dd></div>
              <div><dt className="text-muted-foreground">{t("location.city")}</dt><dd>{shop.city || "—"}, {shop.state || ""}</dd></div>
              <div><dt className="text-muted-foreground">{t("shop_status")}</dt><dd className="font-mono uppercase">{shop.status}</dd></div>
            </dl>
          </section>
        )}
        {agreements.length > 0 && (
          <section>
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">{t("agreements_accepted")}</h4>
            <ul className="text-xs space-y-1">
              {agreements.map((a) => (
                <li key={a.code || a.agreement_code} className="flex justify-between gap-2 border-b border-border/50 py-1">
                  <span>{a.title || a.agreement_code || a.code}</span>
                  <span className="text-muted-foreground font-mono">v{a.version}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
