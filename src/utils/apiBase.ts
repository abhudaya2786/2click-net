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

const DEFAULT_API_BASE = '';

/**
 * Prefer VITE_API_BASE_URL / window override.
 * Native APK without env falls back to https://2click.in (canonical production).
 * Temporary Vercel preview hosts must be set explicitly via VITE_API_BASE_URL.
 */
function nativeFallbackBase(): string {
  return 'https://2click.in';
}

function isBrowserDev(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

/**
 * Resolve API origin for `/api/*` calls.
 * - Local/dev web: always same-origin (ignore leftover APK VITE_API_BASE_URL in the shell)
 * - Production web: honor baked VITE_API_BASE_URL (Hostinger UI → Vercel API)
 * - Native: env, window override, or 2click.in
 */
export function getApiBase(): string {
  const fromWindow =
    typeof window !== 'undefined' && window.__MOM_API_BASE__
      ? String(window.__MOM_API_BASE__).trim()
      : '';
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || '').trim();

  if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
    // Dev server / local Express — never silently send signup to a remote preview
    if (isBrowserDev()) {
      return fromWindow.replace(/\/$/, '');
    }
    return (fromWindow || fromEnv || DEFAULT_API_BASE).replace(/\/$/, '');
  }

  const fallback = Capacitor.isNativePlatform() ? nativeFallbackBase() : DEFAULT_API_BASE;
  return (fromWindow || fromEnv || fallback).replace(/\/$/, '');
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
