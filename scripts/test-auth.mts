/**
 * Auth API smoke tests: signup, signin, me, signout, duplicate user.
 * Spawns an isolated server unless AUTH_BASE is provided.
 */
import { spawn } from 'child_process';
import path from 'path';

const PORT = Number(process.env.SMOKE_AUTH_PORT || 3472);
const EXTERNAL = String(process.env.AUTH_BASE || '').trim();
const BASE = EXTERNAL || `http://127.0.0.1:${PORT}`;
const root = process.cwd();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
    await wait(300);
  }
  throw new Error('Server health timeout');
}

async function json(pathName: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${pathName}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

let child: ReturnType<typeof spawn> | null = null;
let stderr = '';

async function main() {
  if (!EXTERNAL) {
    child = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'server.ts')], {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(PORT),
        HOST: '127.0.0.1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
  }

  console.log(`\nAuth smoke → ${BASE}\n`);
  await waitForHealth();

  const userId = `demo_${Date.now().toString(36)}`;
  const password = 'secret123';

  const health = await json('/api/health');
  assert(health.res.ok && health.body.auth === true, 'health.auth should be true');

  const signup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId, password, displayName: 'Demo User' }),
  });
  assert(signup.res.status === 201, `signup status ${signup.res.status}`);
  assert(signup.body.token && signup.body.user?.userId === userId, 'signup returns token+user');
  console.log('signup OK', userId);

  const dup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  });
  assert(dup.res.status === 409, 'duplicate signup should 409');

  const bad = await json('/api/v1/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ userId, password: 'wrong-pass' }),
  });
  assert(bad.res.status === 401, 'bad password should 401');

  const signin = await json('/api/v1/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  });
  assert(signin.res.ok && signin.body.token, 'signin OK');
  const token = signin.body.token as string;

  const me = await json('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(me.res.ok && me.body.user?.userId === userId, 'me OK');

  const out = await json('/api/v1/auth/signout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(out.res.ok, 'signout OK');

  const me2 = await json('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(me2.res.status === 401, 'token revoked after signout');

  console.log('ALL auth smoke tests passed');
}

main()
  .catch((e) => {
    console.error(e);
    if (stderr) console.error(stderr.slice(-2000));
    process.exitCode = 1;
  })
  .finally(async () => {
    if (child) {
      child.kill('SIGTERM');
      await wait(400);
      try {
        child.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
  });
