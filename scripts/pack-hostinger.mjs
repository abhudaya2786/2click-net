/**
 * Pack production static client for Hostinger public_html upload.
 * Usage: npm run build && npm run pack:hostinger
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const clientDir = path.join(root, 'dist', 'client');
const outDir = path.join(root, 'dist', 'hostinger-upload');
const artifactsDir = '/opt/cursor/artifacts';

if (!fs.existsSync(path.join(clientDir, 'index.html'))) {
  console.error('Missing dist/client — run: npm run build');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(clientDir, outDir, { recursive: true });

const htaccess = `# Hostinger / Apache — SPA + correct JS MIME
Options -MultiViews
RewriteEngine On

# Never serve Vite source paths on production
RewriteRule ^src/ - [R=404,L]

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType application/wasm .wasm
  AddType image/svg+xml .svg
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|mjs)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`;
fs.writeFileSync(path.join(outDir, '.htaccess'), htaccess);

const indexHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
if (indexHtml.includes('/src/main.tsx')) {
  console.error('ERROR: packed index.html still points at /src/main.tsx — build failed');
  process.exit(1);
}
if (!/\/assets\/.+\.js/.test(indexHtml)) {
  console.error('ERROR: packed index.html has no /assets/*.js');
  process.exit(1);
}

const tarPath = path.join(root, 'dist', 'hostinger-mom-upload.tar.gz');
const zipPath = path.join(root, 'dist', 'hostinger-mom-upload.zip');
execSync(`tar -czf "${tarPath}" -C "${outDir}" .`);
try {
  execSync(`cd "${outDir}" && zip -qr "${zipPath}" .`);
} catch {
  console.warn('zip not available — tar.gz only');
}

// Emergency redirect to working Vercel (optional upload as public_html/index.html)
const vercelUrl = process.env.VERCEL_FALLBACK_URL || 'https://temporary-flying-cygnus-dou4esu.vercel.app';
const redirectHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>2Click.in — Voice MoM</title>
  <meta name="description" content="2Click Voice MoM for real-estate marketing teams — field talk to owner text reports." />
  <meta http-equiv="refresh" content="0;url=${vercelUrl}/" />
  <link rel="canonical" href="${vercelUrl}/" />
  <script>location.replace(${JSON.stringify(vercelUrl + '/')});</script>
</head>
<body>
  <p>Opening 2Click Voice MoM… <a href="${vercelUrl}/">Continue</a></p>
</body>
</html>
`;
const redirectPath = path.join(root, 'dist', 'REPLACE_public_html_index.html');
fs.writeFileSync(redirectPath, redirectHtml);

fs.mkdirSync(artifactsDir, { recursive: true });
for (const f of [tarPath, zipPath, redirectPath]) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join(artifactsDir, path.basename(f)));
  }
}

const readme = `HOSTINGER FIX — White screen

Problem: public_html has Vite DEV files:
  <script type="module" src="/src/main.tsx"></script>
Hostinger serves .tsx as text/plain → browser white screen.

Fix (recommended):
1. Hostinger File Manager → open domain public_html
2. DELETE old contents (especially index.html, src/, node_modules if any)
3. Upload hostinger-mom-upload.zip (or extract tar.gz)
4. Ensure public_html/index.html contains /assets/*.js (NOT /src/main.tsx)
5. Ensure public_html/assets/ folder exists with .js + .css
6. Hard refresh: Ctrl+Shift+R

Quick temporary fix:
- Upload ONLY REPLACE_public_html_index.html as public_html/index.html
  (redirects to working Vercel)

Google still shows "Construction Super App":
- That is OLD Google search cache / old meta
- After correct upload, request re-index in Google Search Console
`;
fs.writeFileSync(path.join(outDir, 'README_UPLOAD.txt'), readme);
fs.writeFileSync(path.join(artifactsDir, 'HOSTINGER_WHITE_SCREEN_FIX.txt'), readme);

console.log('Packed:', outDir);
console.log('Archive:', tarPath);
if (fs.existsSync(zipPath)) console.log('Zip:', zipPath);
console.log('Redirect HTML:', redirectPath);
const scriptTag = indexHtml.match(/<script[\s\S]*?<\/script>/);
console.log('index script:', scriptTag ? scriptTag[0] : '(none)');
