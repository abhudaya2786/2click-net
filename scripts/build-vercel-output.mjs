/**
 * Produce Vercel Build Output API layout:
 *   .vercel/output/static/*          — Vite SPA
 *   .vercel/output/functions/api.func — Express (bundled CJS)
 *   .vercel/output/config.json
 *
 * Bypasses fragile zero-config detection that was failing Production on the
 * GitHub-connected Vercel project (www kept old static HTML → signup 405).
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, '.vercel', 'output');

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, env: process.env });
}

rmSync(out, { recursive: true, force: true });
run('npm run build:client');

const externals = [
  'vite',
  'tsx',
  'esbuild',
  'lightningcss',
  '@vitejs/*',
  '@tailwindcss/*',
  'react',
  'react-dom',
  'lucide-react',
  'motion',
  'canvas-confetti',
  '@capacitor/*',
]
  .map((p) => `--external:${p}`)
  .join(' ');

run(
  [
    'npx esbuild scripts/vercel-api-entry.ts',
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--outfile=api/index.cjs',
    '--legal-comments=none',
    externals,
  ].join(' '),
);

// Also refresh legacy ESM entry for local tooling / older configs
run('npm run build:vercel-api');

const staticDir = path.join(out, 'static');
mkdirSync(staticDir, { recursive: true });
cpSync(path.join(root, 'dist', 'client'), staticDir, { recursive: true });

const funcDir = path.join(out, 'functions', 'api.func');
mkdirSync(funcDir, { recursive: true });
cpSync(path.join(root, 'api', 'index.cjs'), path.join(funcDir, 'index.js'));
writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: true,
      supportsResponseStreaming: true,
      maxDuration: 30,
    },
    null,
    2,
  ),
);

writeFileSync(
  path.join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/api(?:/.*)?$', dest: '/api' },
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);

if (!existsSync(path.join(staticDir, 'index.html'))) {
  throw new Error('Build Output API: missing static/index.html');
}
if (!existsSync(path.join(funcDir, 'index.js'))) {
  throw new Error('Build Output API: missing api.func/index.js');
}

console.log('Vercel Build Output ready at .vercel/output');
