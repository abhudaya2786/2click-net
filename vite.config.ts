import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // PWA icons/manifest/sw live here; outDir stays dist/client (separate folders).
  publicDir: 'static-pwa',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
});
