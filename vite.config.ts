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
  build: {
    // Vercel serves /public from the CDN; local/Docker production uses the same folder.
    outDir: 'public',
    emptyOutDir: true,
  },
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
});
