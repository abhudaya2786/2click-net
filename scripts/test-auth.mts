/**
 * Auth API smoke tests: signup, signin, me, signout, duplicate user.
 * Expects server at AUTH_BASE (default http://127.0.0.1:3000).
 */
const BASE = process.env.AUTH_BASE || 'http://127.0.0.1:3000';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function json(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
