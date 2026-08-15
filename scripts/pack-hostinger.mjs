#!/usr/bin/env node
/**
 * Pack Vite production client for Hostinger public_html upload.
 * Fixes blank white screen caused by serving /src/main.tsx as text/plain.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const clientDir = path.join(root, 'dist', 'client');
const outDir = path.join(root, 'dist', 'hostinger-upload');
const tarball = path.join(root, 'dist', 'hostinger-mom-upload.tar.gz');

const HTACCESS = `# 2Click MoM — Hostinger static shell
# Prevents MIME text/plain on JS modules (blank white screen).
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType application/wasm .wasm
  AddType application/manifest+json .webmanifest
  AddType image/png .png
  AddType image/svg+xml .svg
  AddType image/webp .webp
</IfModule>

# Never serve Vite source as modules from this static host
RedirectMatch 404 (?i)^/src/.*\\.(tsx?|jsx?)$

Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

function mustExist(p, label) {
  if (!fs.existsSync(p)) {
    throw new Error(`${label} missing: ${p}. Run \`npm run build\` first.`);
  }
}

mustExist(clientDir, 'dist/client');
mustExist(path.join(clientDir, 'index.html'), 'built index.html');

const indexHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');
if (indexHtml.includes('/src/main.tsx')) {
  throw new Error('Built index.html still references /src/main.tsx — Vite build failed');
}
if (!/\/assets\/index-[^"]+\.js/.test(indexHtml)) {
  throw new Error('Built index.html missing hashed /assets/*.js entry');
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Optional PWA extras from public/ — never overwrite built index/assets with stale copies
const publicDir = path.join(root, 'public');
if (fs.existsSync(publicDir)) {
  for (const name of ['icons', 'manifest.webmanifest', 'sw.js', 'robots.txt', 'favicon.ico']) {
    const src = path.join(publicDir, name);
    if (!fs.existsSync(src)) continue;
    execSync(`cp -a "${src}" "${outDir}/"`);
  }
}

// Client build is the source of truth for index.html + hashed assets
execSync(`cp -a "${clientDir}/." "${outDir}/"`);

fs.writeFileSync(path.join(outDir, '.htaccess'), HTACCESS);

// Sanity: no source tree
if (fs.existsSync(path.join(outDir, 'src'))) {
  fs.rmSync(path.join(outDir, 'src'), { recursive: true, force: true });
}

// Drop stale hashed assets not referenced by final index.html
const finalHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
const needed = new Set(
  [...finalHtml.matchAll(/\/assets\/(index-[A-Za-z0-9_-]+\.(?:js|css))/g)].map((m) => m[1]),
);
const assetsDir = path.join(outDir, 'assets');
if (fs.existsSync(assetsDir)) {
  for (const f of fs.readdirSync(assetsDir)) {
    if ((f.startsWith('index-') || f.endsWith('.js') || f.endsWith('.css')) && !needed.has(f)) {
      fs.unlinkSync(path.join(assetsDir, f));
    }
  }
}

execSync(`tar -czf "${tarball}" -C "${outDir}" .`);
const size = fs.statSync(tarball).size;
console.log('Hostinger pack ready:');
console.log('  folder:', outDir);
console.log('  tarball:', tarball, `(${Math.round(size / 1024)} KB)`);
console.log('  entry:', indexHtml.match(/src="([^"]+)"/)?.[1]);
console.log('Upload contents of dist/hostinger-upload/ into Hostinger public_html (replace old files).');
