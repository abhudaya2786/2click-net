/**
 * Real-estate marketing work-talk → owner inbox smoke test.
 * Spawns an isolated server so leftover data/company ownership cannot flake the run.
 */
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PORT = Number(process.env.SMOKE_COMPANY_PORT || 3471);
const BASE = `http://127.0.0.1:${PORT}`;
const root = process.cwd();
const companyDir = fs.mkdtempSync(path.join(os.tmpdir(), '2click-company-'));

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

const child = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'server.ts')], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(PORT),
    HOST: '127.0.0.1',
    COMPANY_DATA_DIR: companyDir,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stderr = '';
child.stderr.on('data', (d) => {
  stderr += d.toString();
});

async function main() {
  console.log(`\nCompany reports smoke → ${BASE} (data: ${companyDir})\n`);
  await waitForHealth();

  const stamp = Date.now().toString(36);
  const ownerId = `owner_${stamp}`;
  const empId = `emp_${stamp}`;
  const password = 'secret123';

  const ownerSignup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId: ownerId, password, displayName: 'Company Owner' }),
  });
  assert(ownerSignup.res.status === 201, 'owner signup');
  const ownerToken = ownerSignup.body.token as string;

  const empSignup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId: empId, password, displayName: 'Field Exec' }),
  });
  assert(empSignup.res.status === 201, 'employee signup');
  const empToken = empSignup.body.token as string;

  const saveOrg = await json('/api/v1/company/org', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      companyName: 'Skyline RE Marketing',
      industry: 'real_estate_marketing',
      tagline: 'Field talk to owner',
      ownerUserId: ownerId,
      ownerDisplayName: 'Company Owner',
      ownerPhone: '+919999999999',
      reportRecipients: [
        { userId: 'sales_head', displayName: 'Sales Head', title: 'Sales Head' },
      ],
      workHours: {
        enabled: true,
        days: [0, 1, 2, 3, 4, 5, 6],
        startTime: '00:00',
        endTime: '23:59',
        timezone: 'Asia/Kolkata',
      },
      allowAfterHoursCapture: true,
      notifyOwnerOnEveryTalk: true,
    }),
  });
  assert(saveOrg.res.ok, `save org ${saveOrg.res.status} ${saveOrg.body.error}`);
  assert(saveOrg.body.org.ownerUserId === ownerId, 'owner set');

  const talkText =
    'Client ne Palm Residency 2BHK ke liye Monday 11 baje site visit confirm kiya. Token 50k discuss hua.';
  const submit = await json('/api/v1/company/work-talk', {
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      text: talkText,
      leadOrSite: 'Palm Residency',
      locationLabel: 'Andheri',
      talkType: 'client_call',
    }),
  });
  assert(submit.res.status === 201, `submit talk ${submit.body.error}`);
  assert(submit.body.report?.deliveredTo?.length >= 1, 'delivered to someone');
  assert(
    submit.body.report.deliveredTo.some((d: any) => d.userId === ownerId),
    'delivered to owner',
  );
  console.log('work-talk delivered:', submit.body.report.id);

  const inbox = await json('/api/v1/company/work-talk', {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert(inbox.res.ok, 'owner inbox');
  assert(inbox.body.isOwner === true, 'viewer is owner');
  assert(
    (inbox.body.reports || []).some((r: any) => r.text.includes('Palm Residency')),
    'owner sees talk text',
  );
  console.log('owner inbox count', inbox.body.count);

  const empInbox = await json('/api/v1/company/work-talk', {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert(empInbox.res.ok, 'emp inbox');
  assert(
    (empInbox.body.reports || []).every((r: any) => r.employeeUserId === empId),
    'employee only sees own unless report desk',
  );

  console.log('ALL real-estate owner-report smoke tests passed');
}

main()
  .catch((e) => {
    console.error(e);
    console.error(stderr.slice(-2000));
    process.exitCode = 1;
  })
  .finally(async () => {
    child.kill('SIGTERM');
    await wait(400);
    try {
      child.kill('SIGKILL');
    } catch {
      /* ignore */
    }
    try {
      fs.rmSync(companyDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });
