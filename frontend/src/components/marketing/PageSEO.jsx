import { useEffect } from "react";

const SITE = "https://www.2click.in";

/**
 * Updates document title + meta tags for SEO and social sharing.
 * Works without react-helmet — safe for CRA builds.
 */
export default function PageSEO({ title, description, path = "", keywords = "" }) {
  useEffect(() => {
    const fullTitle = title.includes("2click") ? title : `${title} | 2click.in`;
    const url = `${SITE}${path.startsWith("/") ? path : `/${path}`}`;

    document.title = fullTitle;

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("robots", "index, follow");
    if (keywords) setMeta("keywords", keywords);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", "2click.in", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, path, keywords]);

  return null;
}
