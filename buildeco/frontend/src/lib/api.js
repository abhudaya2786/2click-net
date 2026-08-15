import axios from "axios";

const PRODUCTION_APIS = [
  "https://wallet-vendor-mvp.emergent.host",
  "https://wallet-vendor-mvp.preview.emergentagent.com",
];
const PRODUCTION_API = PRODUCTION_APIS[0];

const BLOCKED_BACKEND_HOSTS = ["wallet1.unodev.app", "unodev.app"];

function isBlockedBackend(url) {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return BLOCKED_BACKEND_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

function resolveBackendUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (host === "localhost" || host === "127.0.0.1") {
      const local = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
      if (local && !local.includes("buildecogroup.com") && !isBlockedBackend(local)) return local;
      return "";
    }
    // Hostinger / Vercel / custom domain: never post login to a static host (HTML 404).
    if (
      host === "buildecogroup.com" ||
      host === "www.buildecogroup.com" ||
      host.endsWith(".buildecogroup.com") ||
      host.endsWith(".vercel.app") ||
      /hostinger|hstgr/i.test(host)
    ) {
      return PRODUCTION_API;
    }
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

function isHtmlBody(data) {
  return typeof data === "string" && /<!DOCTYPE|<html/i.test(data);
}

function shouldRetryOnProductionApi(error) {
  const cfg = error?.config;
  if (!cfg || cfg.__prodRetry) return false;
  const base = String(cfg.baseURL || "");
  if (base.includes("emergent.host") || base.includes("emergentagent.com")) return false;
  const status = error?.response?.status;
  const data = error?.response?.data;
  return !error.response || status === 404 || status === 502 || status === 503 || isHtmlBody(data);
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    try {
      if (shouldRetryOnProductionApi(error)) {
        error.config.__prodRetry = true;
        error.config.baseURL = `${PRODUCTION_API}/api`;
        return api.request(error.config);
      }
    } catch {
      /* keep original error */
    }
    return Promise.reject(error);
  },
);

export function formatApiErrorDetail(detail) {
  if (detail == null || detail === "") return "";
  if (typeof detail === "string") {
    if (/<!DOCTYPE|<html/i.test(detail)) return "";
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : "")).filter(Boolean).join(" ");
  }
  if (detail && typeof detail === "object") {
    if (typeof detail.msg === "string") return detail.msg;
    if (typeof detail.message === "string") return detail.message;
    if (typeof detail.detail === "string") return detail.detail;
    if (typeof detail.error === "string") return detail.error;
  }
  return "";
}

/** Human login/API error — never dump "[object Object]" or a blank HTML 404. */
export function formatAxiosError(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  if (!error.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  const { status, data } = error.response;
  if (status === 404 || isHtmlBody(data)) {
    return "Login server was not found on this website host. Retrying the BuildEco API — if this continues, use Sign up or Demo.";
  }
  const parsed = formatApiErrorDetail(
    data && typeof data === "object" ? (data.detail ?? data.message ?? data.error ?? data) : data,
  );
  if (parsed) return parsed;
  if (status === 401) return "Invalid email or password.";
  if (status === 422) return "Please enter a valid email and password.";
  if (status >= 500) return "The login server is temporarily unavailable. Please try again in a minute.";
  return fallback;
}
