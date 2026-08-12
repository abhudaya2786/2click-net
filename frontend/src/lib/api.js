import axios from "axios";

const PRODUCTION_APIS = [
  "https://wallet-vendor-mvp.emergent.host",
  "https://wallet-vendor-mvp.preview.emergentagent.com",
];
const PRODUCTION_API = PRODUCTION_APIS[0];

const FRONTEND_HOSTS = new Set(["2click.in", "www.2click.in", "localhost"]);
const BLOCKED_BACKEND_HOSTS = ["wallet1.unodev.app", "unodev.app"];

function isFrontendHost(hostname) {
  if (!hostname) return false;
  if (FRONTEND_HOSTS.has(hostname)) return true;
  return hostname.endsWith(".vercel.app") || hostname.endsWith(".2click.in");
}

function isBlockedBackend(url) {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return BLOCKED_BACKEND_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

function resolveBackendUrl() {
  if (typeof window !== "undefined" && isFrontendHost(window.location.hostname)) {
    // Vercel rewrites /api → production backend (see vercel.json)
    return "";
  }

  let url = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
  if (!url) {
    return process.env.NODE_ENV === "production" ? PRODUCTION_API : "";
  }
  if (url.includes("2click.in") || url.includes("vercel.app") || isBlockedBackend(url)) {
    console.warn("REACT_APP_BACKEND_URL is misconfigured; using production API fallback.");
    return PRODUCTION_API;
  }
  const httpsIdx = url.lastIndexOf("https://");
  if (httpsIdx > 0) url = url.slice(httpsIdx);
  return url.replace(/\/$/, "");
}

const BACKEND_URL = resolveBackendUrl();
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
