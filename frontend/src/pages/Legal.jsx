import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import PageSEO from "@/components/marketing/PageSEO";
import PrintShareBar from "@/components/enrollment/PrintShareBar";
import { buildAgreementPrintHtml, printHtml } from "@/lib/printShare";

function LegalPage({ code, fallbackTitle }) {
  const { lang, t } = useLang();
  const hi = lang === "hi";
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    api.get(`/enrollment/agreements/${code}`).then(({ data }) => setDoc(data)).catch(() => setDoc(null));
  }, [code]);

  const title = doc ? (hi ? doc.title_hi || doc.title : doc.title) : fallbackTitle;
  const body = doc ? (hi ? doc.content_hi || doc.content : doc.content) : "";
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://www.2click.in/${code.replace("_", "-")}`;

  const handlePrint = () => {
    if (!doc) return;
    printHtml(`2click.in — ${title}`, buildAgreementPrintHtml(doc, lang));
  };

  return (
    <MarketingLayout>
      <PageSEO title={title} description={title} path={`/${code.replace("_", "-")}`} />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Link to="/enroll" className="text-sm text-primary hover:underline">{hi ? "पंजीकरण पर वापस" : "Back to enrollment"}</Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">{title}</h1>
            {doc && <p className="text-xs font-mono text-muted-foreground mt-2">Version {doc.version}</p>}
          </div>
          {doc && (
            <PrintShareBar
              onPrint={handlePrint}
              shareText={`${title}\n\n${body.slice(0, 500)}${body.length > 500 ? "…" : ""}`}
              shareUrl={pageUrl}
              emailSubject={title}
              t={t}
            />
          )}
        </div>
        <div className="mt-8 prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {body || (hi ? "लोड हो रहा है…" : "Loading…")}
        </div>
      </div>
    </MarketingLayout>
  );
}

export function TermsPage() {
  return <LegalPage code="platform_terms" fallbackTitle="Terms of Service" />;
}

export function PrivacyPage() {
  return <LegalPage code="privacy_policy" fallbackTitle="Privacy Policy" />;
}
