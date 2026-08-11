import { useEffect } from "react";

const SITE = "https://www.2click.in";

/**
 * Injects Organization + WebSite JSON-LD for Google rich results / discoverability.
 */
export default function SiteJsonLd() {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE}/#organization`,
          name: "2click.in",
          url: SITE,
          description: "Construction super app — tenders, brand-wise material store, BOQ calculators, enrollment, solar EPC, consultants, India.",
        },
        {
          "@type": "WebSite",
          "@id": `${SITE}/#website`,
          url: SITE,
          name: "2click.in",
          publisher: { "@id": `${SITE}/#organization` },
          inLanguage: ["en", "hi"],
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE}/store?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "site-jsonld";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return null;
}
