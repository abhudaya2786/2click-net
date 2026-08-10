import axios from "axios";

const PRODUCTION_API = "https://wallet-vendor-mvp.emergent.host";

function resolveBackendUrl() {
  let url = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
  if (!url) return process.env.NODE_ENV === "production" ? PRODUCTION_API : "";
  // Fix misconfigured Vercel env (e.g. doubled URLs)
  if (url.includes("2click.in") || url.includes("vercel.app")) {
    console.warn("REACT_APP_BACKEND_URL points to frontend host; using production API fallback.");
    return PRODUCTION_API;
  }
  const httpsIdx = url.lastIndexOf("https://");
  if (httpsIdx > 0) url = url.slice(httpsIdx);
  return url.replace(/\/$/, "");
}

const BACKEND_URL = resolveBackendUrl();
if (!BACKEND_URL && process.env.NODE_ENV === "production") {
  console.error(
    "REACT_APP_BACKEND_URL is not set. Add it in Vercel → Settings → Environment Variables, then redeploy."
  );
}
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
