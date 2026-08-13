import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

/**
 * Warns visitors when the API proxy is down or returning HTML instead of JSON.
 */
export default function ApiStatusBanner() {
  const [bad, setBad] = useState(false);
  const [lang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const hi = lang === "hi";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, headers } = await api.get("/", { timeout: 12000 });
        const ctype = String(headers?.["content-type"] || "");
        if (cancelled) return;
        if (ctype.includes("text/html") || typeof data === "string") {
          setBad(true);
          return;
        }
        if (!data || data.status !== "ok") setBad(true);
        else setBad(false);
      } catch {
        if (!cancelled) setBad(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!bad) return null;

  return (
    <div
      className="bg-amber-500/15 border-b border-amber-500/40 text-amber-950 dark:text-amber-100 text-xs sm:text-sm px-3 py-2 text-center"
      data-testid="api-status-banner"
      role="status"
    >
      {hi
        ? "सर्वर कनेक्शन अस्थिर है। कृपया कुछ देर बाद रिफ्रेश करें। ओनर: docs/OWNER_CONTROL.md"
        : "API connection is unstable. Please refresh shortly. Owner setup: docs/OWNER_CONTROL.md"}{" "}
      <Link to="/sys/console" className="underline font-medium ml-1">
        /sys/console
      </Link>
    </div>
  );
}
