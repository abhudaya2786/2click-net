#!/usr/bin/env node
/**
 * End-to-end API smoke tests for 2Click Voice MoM.
 * Spawns an isolated server (no AI keys → demo mode) unless SMOKE_BASE_URL is set.
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.SMOKE_PORT || 3457);
const HOST = '127.0.0.1';
const BASE = process.env.SMOKE_BASE_URL || `http://${HOST}:${PORT}`;
const ownServer = !process.env.SMOKE_BASE_URL;

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    failures.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

async function req(method, urlPath, body) {
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text };
  }
  return { status: res.status, json, text };
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await req('GET', '/api/health');
      if (r.status === 200 && r.json?.ok) return r;
    } catch {
      // retry
    }
    await delay(250);
  }
  throw new Error(`Server did not become healthy at ${BASE}`);
}

let child = null;

async function startServer() {
  if (!ownServer) return;
  child = spawn(
    process.execPath,
    ['--import', 'tsx', path.join(root, 'server.ts')],
    {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(PORT),
        HOST,
        NODE_ENV: 'development',
        // Force demo mode for deterministic smoke tests
        GEMINI_API_KEY: '',
        OPENAI_API_KEY: '',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  child.stdout.on('data', (d) => {
    if (process.env.SMOKE_VERBOSE) process.stdout.write(`[server] ${d}`);
  });
  child.stderr.on('data', (d) => {
    if (process.env.SMOKE_VERBOSE) process.stderr.write(`[server.err] ${d}`);
  });
  child.on('exit', (code, signal) => {
    if (failed === 0 && code && code !== 0) {
      console.error(`Server exited early code=${code} signal=${signal}`);
    }
  });
}

async function stopServer() {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
  await delay(300);
  if (!child.killed) child.kill('SIGKILL');
}

async function run() {
  console.log(`\nMoM smoke tests → ${BASE}${ownServer ? ' (spawned)' : ''}\n`);
  await startServer();
  try {
    const health = await waitForHealth();
    assert(health.json.ok === true, 'GET /api/health ok');
    assert(health.json.app === '2click-voice-mom', 'health reports app name');
    assert(health.json.demoMode === true || health.json.gemini || health.json.openai, 'health reports demo or live AI');

    const html = await fetch(BASE + '/');
    assert(html.status === 200, 'GET / returns 200');
    const htmlText = await html.text();
    assert(/2click|mom|minutes|notetaker/i.test(htmlText), 'HTML shell contains MoM branding');

    // Meetings CRUD
    const created = await req('POST', '/api/meetings', {
      title: 'Smoke Test Meeting',
      executiveSummary: 'CRUD check',
      status: 'READY',
    });
    assert(created.status === 200 && created.json.success, 'POST /api/meetings');
    const mid = created.json.meeting?.id;
    assert(Boolean(mid), 'meeting id returned');

    const listed = await req('GET', `/api/meetings?q=${encodeURIComponent('Smoke')}`);
    assert(
      listed.status === 200 && listed.json.meetings?.some((m) => m.id === mid),
      'GET /api/meetings?q= finds created meeting',
    );

    const one = await req('GET', `/api/meetings/${mid}`);
    assert(one.status === 200 && one.json.meeting?.id === mid, 'GET /api/meetings/:id');

    const patched = await req('PATCH', `/api/meetings/${mid}`, { title: 'Smoke Test Meeting (patched)' });
    assert(patched.status === 200 && patched.json.meeting?.title.includes('patched'), 'PATCH /api/meetings/:id');

    const stated = await req('PUT', `/api/meetings/${mid}/state`, { status: 'ARCHIVED' });
    assert(stated.status === 200 && stated.json.meeting?.status === 'ARCHIVED', 'PUT /api/meetings/:id/state');

    // Demo MoM from transcript (works without API keys)
    const transcript = [
      'Alice: We decided to ship v1 next Monday.',
      'Bob: I will prepare the release notes by Friday.',
      'Alice: There is a risk around App Store review delays.',
      'Bob: Next meeting will cover launch checklist.',
    ].join('\n');

    const mom = await req('POST', '/api/generate-mom', {
      transcriptText: transcript,
      context: {
        title: 'Launch Sync',
        participants: 'Alice, Bob',
        meetingType: 'Sprint',
      },
    });
    assert(mom.status === 200 && mom.json.success === true, 'POST /api/generate-mom (transcript/demo)');
    assert(Boolean(mom.json.meeting?.executiveSummary), 'MoM includes executiveSummary');
    assert(Array.isArray(mom.json.meeting?.actionItems), 'MoM includes actionItems');
    assert(Array.isArray(mom.json.meeting?.decisions), 'MoM includes decisions');
    assert(
      mom.json.minutes?.provider === 'demo' || mom.json.minutes?.provider === 'gemini' || mom.json.minutes?.provider === 'openai',
      'minutes provider reported',
    );

    const short = await req('POST', '/api/generate-mom', { transcriptText: 'too short' });
    assert(short.status === 400, 'POST /api/generate-mom rejects short transcript');

    const audioOnly = await req('POST', '/api/generate-mom', {
      audioBase64: 'AAAA',
      mimeType: 'audio/webm',
    });
    if (health.json.demoMode) {
      assert(audioOnly.status === 503, 'audio-only MoM returns 503 in demo mode');
    } else {
      assert(audioOnly.status !== 404, 'audio-only MoM route exists when live keys set');
    }

    const minutes = await req('POST', '/api/minutes/generate', {
      transcript,
      meetingTitle: 'Launch Sync',
      participants: ['Alice', 'Bob'],
    });
    assert(minutes.status === 200 && minutes.json.success === true, 'POST /api/minutes/generate');
    assert(typeof minutes.json.summary === 'string' && minutes.json.summary.length > 0, 'minutes summary present');

    const chat = await req('POST', '/api/chat-meeting', {
      meetingData: mom.json.meeting,
      currentPrompt: 'What did we decide?',
    });
    assert(chat.status === 200 && chat.json.success === true && chat.json.reply, 'POST /api/chat-meeting');

    const email = await req('POST', '/api/generate-email', {
      meetingData: mom.json.meeting,
      emailStyle: 'professional',
      recipient: 'Alice',
    });
    assert(email.status === 200 && email.json.success === true && email.json.emailText, 'POST /api/generate-email');

    const scheduleDetect = await req('POST', '/api/detect-schedule', {
      meetingData: { ...mom.json.meeting, nextMeeting: 'Friday launch checklist' },
    });
    assert(
      scheduleDetect.status === 200 && scheduleDetect.json.events?.length >= 1,
      'POST /api/detect-schedule returns events',
    );

    const sch = await req('POST', '/api/schedules', {
      title: 'Follow-up',
      date: '2026-08-21',
      time: '10:00',
    });
    assert(sch.status === 200 && sch.json.schedule?.id, 'POST /api/schedules');
    const schList = await req('GET', '/api/schedules');
    assert(schList.status === 200 && Array.isArray(schList.json.schedules), 'GET /api/schedules');

    const plans = await req('GET', '/api/billing/plans');
    assert(plans.status === 200 && Array.isArray(plans.json.plans) && plans.json.plans.length > 0, 'GET /api/billing/plans');

    const billingCfg = await req('GET', '/api/billing/config');
    assert(billingCfg.status === 200 && billingCfg.json.provider, 'GET /api/billing/config');

    const privacy = await req('GET', '/api/privacy/policy?orgId=smoke');
    assert(privacy.status === 200 && privacy.json.policy, 'GET /api/privacy/policy');

    const consent = await req('POST', '/api/consents', { orgId: 'smoke', granted: true });
    assert(consent.status === 200 && consent.json.consent?.id, 'POST /api/consents');

    const audit = await req('POST', '/api/audit-logs', { action: 'smoke', orgId: 'smoke' });
    assert(audit.status === 200 && audit.json.log?.id, 'POST /api/audit-logs');

    const del = await req('DELETE', `/api/meetings/${mid}`);
    assert(del.status === 200 && del.json.success, 'DELETE /api/meetings/:id');
    const gone = await req('GET', `/api/meetings/${mid}`);
    assert(gone.status === 404, 'deleted meeting returns 404');
  } finally {
    await stopServer();
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.error('Failures:\n' + failures.map((f) => ` - ${f}`).join('\n'));
    process.exit(1);
  }
}

run().catch(async (err) => {
  console.error(err);
  await stopServer();
  process.exit(1);
});
