import axios from "axios";

const PRODUCTION_APIS = [
  "https://wallet-vendor-mvp.emergent.host",
  "https://wallet-vendor-mvp.preview.emergentagent.com",
];
const PRODUCTION_API = PRODUCTION_APIS[0];

const FRONTEND_HOSTS = new Set(["buildecogroup.com", "www.buildecogroup.com", "2click.in", "www.2click.in", "localhost"]);
const BLOCKED_BACKEND_HOSTS = ["wallet1.unodev.app", "unodev.app"];

function isFrontendHost(hostname) {
  if (!hostname) return false;
  if (FRONTEND_HOSTS.has(hostname)) return true;
  return hostname.endsWith(".vercel.app") || hostname.endsWith(".buildecogroup.com") || hostname.endsWith(".2click.in");
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
  if (url.includes("buildecogroup.com") || url.includes("vercel.app") || isBlockedBackend(url)) {
    console.warn("REACT_APP_BACKEND_URL is misconfigured; using production API fallback.");
    return PRODUCTION_API;
  }
  const httpsIdx = url.lastIndexOf("https://");
  if (httpsIdx > 0) url = url.slice(httpsIdx);
  return url.replace(/\/$/, "");
}

const BACKEND_URL = resolveBackendUrl();
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

/** Absolute URL for API paths (ads click tracking, uploads). */
export function apiAbsoluteUrl(path = "") {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (BACKEND_URL) return `${BACKEND_URL}${p.startsWith("/api") ? p : `/api${p}`}`;
  if (typeof window !== "undefined") return `${window.location.origin}${p.startsWith("/api") ? p : `/api${p}`}`;
  return p.startsWith("/api") ? p : `/api${p}`;
}

/** Resolve relative upload/banner paths from the API host. */
export function apiAssetUrl(path = "") {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = BACKEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

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
