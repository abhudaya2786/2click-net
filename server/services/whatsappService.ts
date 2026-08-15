/**
 * Meta WhatsApp Business Cloud API service (outbound + inbound command parsing).
 * Runs in mock mode when WHATSAPP_ACCESS_TOKEN is unset.
 */

import { enterpriseConfig } from '../config/env.ts';

export type WhatsAppCommand =
  | { type: 'APPROVE' }
  | { type: 'REASSIGN'; name: string }
  | { type: 'STATUS'; name: string }
  | { type: 'UNKNOWN'; raw: string };

export interface WhatsAppSendResult {
  ok: boolean;
  mock: boolean;
  messageId?: string;
  error?: string;
  preview?: string;
}

function graphUrl(path: string): string {
  const { apiVersion } = enterpriseConfig.whatsapp;
  return `https://graph.facebook.com/${apiVersion}/${path}`;
}

export function parseInboundCommand(text: string): WhatsAppCommand {
  const raw = (text || '').trim();
  const upper = raw.toUpperCase();
  if (upper === 'APPROVE' || upper.startsWith('APPROVE ')) return { type: 'APPROVE' };
  const reassign = raw.match(/^REASSIGN\s+(.+)$/i);
  if (reassign) return { type: 'REASSIGN', name: reassign[1].trim() };
  const status = raw.match(/^STATUS\s+(.+)$/i);
  if (status) return { type: 'STATUS', name: status[1].trim() };
  return { type: 'UNKNOWN', raw };
}

export async function sendWhatsAppText(toPhone: string, body: string): Promise<WhatsAppSendResult> {
  const cfg = enterpriseConfig.whatsapp;
  if (!cfg.enabled) {
    console.info('[whatsapp:mock] text →', toPhone, body);
    return { ok: true, mock: true, messageId: `mock-${Date.now()}`, preview: body };
  }
  try {
    const res = await fetch(graphUrl(`${cfg.phoneNumberId}/messages`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone.replace(/\D/g, ''),
        type: 'text',
        text: { body },
      }),
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      return { ok: false, mock: false, error: json?.error?.message || res.statusText };
    }
    return { ok: true, mock: false, messageId: json?.messages?.[0]?.id };
  } catch (e: any) {
    return { ok: false, mock: false, error: e.message || 'WhatsApp send failed' };
  }
}

export async function sendWhatsAppDocument(opts: {
  toPhone: string;
  link: string;
  filename: string;
  caption?: string;
}): Promise<WhatsAppSendResult> {
  const cfg = enterpriseConfig.whatsapp;
  if (!cfg.enabled) {
    console.info('[whatsapp:mock] document →', opts.toPhone, opts.filename, opts.link);
    return { ok: true, mock: true, messageId: `mock-doc-${Date.now()}`, preview: opts.link };
  }
  try {
    const res = await fetch(graphUrl(`${cfg.phoneNumberId}/messages`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: opts.toPhone.replace(/\D/g, ''),
        type: 'document',
        document: {
          link: opts.link,
          filename: opts.filename,
          caption: opts.caption || opts.filename,
        },
      }),
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      return { ok: false, mock: false, error: json?.error?.message || res.statusText };
    }
    return { ok: true, mock: false, messageId: json?.messages?.[0]?.id };
  } catch (e: any) {
    return { ok: false, mock: false, error: e.message || 'WhatsApp document send failed' };
  }
}

/** 5-line instant executive summary for Owner / Team Leader. */
export function buildFiveLineExecutiveSummary(opts: {
  title: string;
  domain?: string;
  siteName?: string;
  lines: string[];
  visitId?: string;
}): string {
  const lines = opts.lines.filter(Boolean).slice(0, 5);
  while (lines.length < 5) lines.push('—');
  return [
    `2Click MoM · ${opts.title}`,
    `Domain: ${opts.domain || 'General'}${opts.siteName ? ` · Site: ${opts.siteName}` : ''}`,
    ...lines.map((l, i) => `${i + 1}. ${l}`),
    opts.visitId ? `Ref: ${opts.visitId}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function notifyOwnerExecutiveSummary(opts: {
  title: string;
  domain?: string;
  siteName?: string;
  lines: string[];
  visitId?: string;
  toPhone?: string;
}): Promise<WhatsAppSendResult> {
  const to = opts.toPhone || enterpriseConfig.whatsapp.ownerPhone;
  if (!to) {
    return { ok: false, mock: true, error: 'WHATSAPP_OWNER_PHONE not configured' };
  }
  const body = buildFiveLineExecutiveSummary(opts);
  return sendWhatsAppText(to, body);
}
