/** Detect / apply mobile-app (PWA / Capacitor) mode on documentElement. */

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    new URLSearchParams(window.location.search).get("source") === "pwa"
  );
}

export function isNativeCapacitor() {
  if (typeof window === "undefined") return false;
  return window.Capacitor?.isNativePlatform?.() === true;
}

export function isAndroidBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function isAppLike() {
  return isStandalonePwa() || isNativeCapacitor();
}

/** Call once at boot — adds html classes for CSS (app-mode / standalone / capacitor). */
export function applyAppModeClass() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("mobile-ready");
  if (isStandalonePwa()) root.classList.add("standalone-pwa");
  if (isNativeCapacitor()) root.classList.add("capacitor-native");
  if (isAppLike()) root.classList.add("app-mode");

  // Keep classes in sync if user installs mid-session
  try {
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => {
      if (mq.matches || window.navigator.standalone) {
        root.classList.add("standalone-pwa", "app-mode");
      }
    };
    mq.addEventListener?.("change", sync);
  } catch {
    /* ignore */
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL || ""}/sw.js`)
      .catch((err) => console.warn("SW registration failed:", err));
  });
}
