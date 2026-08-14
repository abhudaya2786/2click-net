/**
 * Enterprise smoke tests — additive routes only (does not replace MoM suite).
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.SMOKE_PORT || 3461);
const BASE = `http://127.0.0.1:${PORT}`;
const root = process.cwd();

function wait(ms) {
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

let passed = 0;
let failed = 0;
function ok(name, cond) {
  if (cond) {
    console.log(`  ✓ ${name}`);
    passed += 1;
  } else {
    console.log(`  ✗ ${name}`);
    failed += 1;
  }
}

const child = spawn(
  process.execPath,
  ['--import', 'tsx', path.join(root, 'server.ts')],
  {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(PORT),
      HOST: '127.0.0.1',
      ZERO_AUDIO_RETENTION: 'true',
      PII_REDACTION_ENABLED: 'true',
      DISCARD_SMALL_TALK: 'true',
      WHATSAPP_VERIFY_TOKEN: '2click-mom-verify',
      // Force mock WhatsApp
      WHATSAPP_ACCESS_TOKEN: '',
      WHATSAPP_PHONE_NUMBER_ID: '',
      WHATSAPP_OWNER_PHONE: '919999999999',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

let stderr = '';
child.stderr.on('data', (d) => {
  stderr += d.toString();
});

try {
  console.log(`\nEnterprise smoke → ${BASE}\n`);
  await waitForHealth();

  const health = await (await fetch(`${BASE}/api/health`)).json();
  ok('health ok', health.ok === true);
  ok('enterprise block present', Boolean(health.enterprise));

  const ent = await (await fetch(`${BASE}/api/enterprise/health`)).json();
  ok('enterprise health', ent.ok === true && ent.modules?.pdf === true);
  ok('whatsapp mock mode', ent.modules?.whatsapp === 'mock');

  const challenge = await fetch(
    `${BASE}/webhook?hub.mode=subscribe&hub.verify_token=2click-mom-verify&hub.challenge=smoke123`,
  );
  ok('whatsapp GET verify', challenge.status === 200 && (await challenge.text()) === 'smoke123');

  const badVerify = await fetch(
    `${BASE}/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=x`,
  );
  ok('whatsapp verify rejects bad token', badVerify.status === 403);

  const postWh = await fetch(`${BASE}/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [{ from: '919999999999', text: { body: 'STATUS Test' } }],
              },
            },
          ],
        },
      ],
    }),
  });
  ok('whatsapp POST returns 200 immediately', postWh.status === 200);

  const preview = await (
    await fetch(`${BASE}/api/field/privacy/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        transcriptText:
          'Namaste, how are you?\nBusiness: slab casting scheduled.\nCall 9876543210 PAN ABCDE1234F Aadhaar 2345 6789 0123',
      }),
    })
  ).json();
  ok('privacy preview success', preview.success === true);
  ok('phone redacted', String(preview.cleanedText).includes('[REDACTED]'));
  ok('small-talk discarded', preview.discardedLines >= 1);

  // Domain MoM works with live keys OR demo heuristic fallback (no keys)
  const proc = await fetch(`${BASE}/api/field/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      transcriptText:
        'Site engineer: foundation pour complete. Next material delivery kal subah 11 baje. Phone 9988776655. PAN ABCDE1234F.',
      siteName: 'Client Site',
      title: 'Smoke Field Visit',
      notifyWhatsApp: true,
      generatePdf: true,
      latitude: 19.06,
      longitude: 72.86,
    }),
  });
  const pj = await proc.json();
  ok('field process 200', proc.status === 200 && pj.success === true);
  ok('domain classified', Boolean(pj.minutes?.domain || pj.visit?.domain));
  ok('pdf path returned', Boolean(pj.visit?.pdfDownloadPath));
  ok('pii redacted in visit transcript', String(pj.visit?.cleanedTranscript || '').includes('[REDACTED]'));
  if (pj.visit?.pdfDownloadPath) {
    const pdfRes = await fetch(`${BASE}${pj.visit.pdfDownloadPath}`);
    const buf = Buffer.from(await pdfRes.arrayBuffer());
    ok('pdf downloadable', pdfRes.status === 200 && buf.slice(0, 4).toString() === '%PDF');
    fs.writeFileSync('/opt/cursor/artifacts/smoke_field_visit.pdf', buf);
  }
  ok('no audio echoed', !pj.audioBase64 && !pj.meeting?.audioUrl);
  ok('whatsapp mock notify id', Boolean(pj.visit?.whatsappMessageId));

  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  console.log(hasKey ? '  · live AI key detected' : '  · demo heuristic MoM (no API key)');

  const analytics = await (await fetch(`${BASE}/api/field/analytics`)).json();
  ok('analytics endpoint', analytics.success === true);

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed) {
    console.error(stderr.slice(-2000));
    process.exitCode = 1;
  }
} catch (e) {
  console.error(e);
  console.error(stderr.slice(-2000));
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
  await wait(500);
  try {
    child.kill('SIGKILL');
  } catch {
    /* ignore */
  }
}
