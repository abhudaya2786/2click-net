import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installNativeApiFetchPatch } from './utils/apiBase.ts';
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx';

installNativeApiFetchPatch();

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:sans-serif;padding:2rem">Missing #root — upload the Vite <b>build</b> (dist/client), not source files.</p>';
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Avoid SW on Capacitor native (can cache a blank shell)
    const isNative =
      typeof (window as any).Capacitor !== 'undefined' &&
      (window as any).Capacitor?.isNativePlatform?.();
    if (isNative) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* PWA optional */
    });
  });
}
