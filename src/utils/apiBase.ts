import { Capacitor } from '@capacitor/core';

/**
 * Native APK loads bundled web assets (capacitor:// / https://localhost).
 * Relative `/api/*` must be rewritten to the live MoM backend.
 *
 * Set at build time: VITE_API_BASE_URL=https://your-mom-host
 * Or at runtime: window.__MOM_API_BASE__ = 'https://...'
 */
declare global {
  interface Window {
    __MOM_API_BASE__?: string;
  }
}

const DEFAULT_API_BASE = 'https://temporary-flying-cygnus-dou4esu.vercel.app';

export function getApiBase(): string {
  const fromWindow =
    typeof window !== 'undefined' && window.__MOM_API_BASE__
      ? String(window.__MOM_API_BASE__).trim()
      : '';
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  return (fromWindow || fromEnv || (Capacitor.isNativePlatform() ? DEFAULT_API_BASE : '')).replace(
    /\/$/,
    '',
  );
}

export function resolveApiUrl(input: string): string {
  if (!input.startsWith('/api')) return input;
  const base = getApiBase();
  return base ? `${base}${input}` : input;
}

/** Patch window.fetch once so existing `/api/...` calls work inside the APK WebView. */
export function installNativeApiFetchPatch(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__momFetchPatched) return;
  if (!Capacitor.isNativePlatform() && !getApiBase()) return;

  const base = getApiBase();
  if (!base) return;

  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      return original(resolveApiUrl(input), init);
    }
    if (input instanceof URL) {
      const path = input.pathname + input.search;
      if (path.startsWith('/api')) {
        return original(resolveApiUrl(path), init);
      }
    }
    if (typeof Request !== 'undefined' && input instanceof Request) {
      const url = input.url;
      try {
        const u = new URL(url, window.location.origin);
        if (u.pathname.startsWith('/api') && u.origin === window.location.origin) {
          return original(new Request(resolveApiUrl(u.pathname + u.search), input), init);
        }
      } catch {
        /* fall through */
      }
    }
    return original(input, init);
  };

  (window as any).__momFetchPatched = true;
  console.info('[MoM] API base for native/web:', base);
}
