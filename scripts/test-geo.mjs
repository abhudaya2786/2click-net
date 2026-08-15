/**
 * Smoke: reverse geocode Lucknow sample coords via local server.
 */
import { spawn } from 'child_process';
import path from 'path';

const PORT = Number(process.env.SMOKE_GEO_PORT || 3473);
const EXTERNAL = String(process.env.GEO_BASE || '').trim();
const BASE = EXTERNAL || `http://127.0.0.1:${PORT}`;
const root = process.cwd();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('Server health timeout');
}

let child = null;

async function main() {
  if (!EXTERNAL) {
    child = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'server.ts')], {
      cwd: root,
      env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  await waitForHealth();

  const lat = 26.8467;
  const lon = 80.9462;
  const res = await fetch(
    `${BASE}/api/v1/geo/reverse?lat=${lat}&lon=${lon}`,
  );
  const body = await res.json();
  assert(res.ok, `geo status ${res.status}: ${JSON.stringify(body)}`);
  assert(body.displayName, 'displayName required');
  assert(
    String(body.city || body.displayName).toLowerCase().includes('lucknow') ||
      String(body.state || '').toLowerCase().includes('uttar'),
    `expected Lucknow-ish place, got ${body.displayName}`,
  );
  console.log('reverse geocode OK:', body.displayName);
  console.log('city:', body.city, 'state:', body.state);
}

main()
  .then(() => {
    if (child) child.kill('SIGTERM');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    if (child) child.kill('SIGTERM');
    process.exit(1);
  });
