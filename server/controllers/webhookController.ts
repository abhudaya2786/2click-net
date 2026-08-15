/**
 * WhatsApp webhook + command handling controller.
 */

import type { Request, Response } from 'express';
import { enterpriseConfig } from '../config/env.ts';
import {
  parseInboundCommand,
  sendWhatsAppText,
  notifyOwnerExecutiveSummary,
} from '../services/whatsappService.ts';
import { getFieldVisit, listFieldVisits, updateFieldVisit } from '../services/fieldVisitStore.ts';

export function verifyWhatsAppWebhook(req: Request, res: Response) {
  const mode = String(req.query['hub.mode'] || '');
  const token = String(req.query['hub.verify_token'] || '');
  const challenge = String(req.query['hub.challenge'] || '');
  if (mode === 'subscribe' && token === enterpriseConfig.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

/** Immediate 200 OK; process in background. */
export function receiveWhatsAppWebhook(req: Request, res: Response) {
  res.sendStatus(200);

  setImmediate(async () => {
    try {
      const body = req.body || {};
      const entries = body.entry || [];
      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          for (const msg of value.messages || []) {
            const from = msg.from as string;
            const text = msg.text?.body || msg.button?.text || '';
            await handleInboundWhatsApp(from, text);
          }
        }
      }
    } catch (e) {
      console.error('[whatsapp webhook]', e);
    }
  });
}

async function handleInboundWhatsApp(from: string, text: string) {
  const cmd = parseInboundCommand(text);
  const latest = (await listFieldVisits(1))[0];

  if (cmd.type === 'APPROVE') {
    if (latest) await updateFieldVisit(latest.id, { status: 'approved' });
    await sendWhatsAppText(from, latest ? `Approved visit ${latest.id}` : 'No visit to approve.');
    return;
  }

  if (cmd.type === 'REASSIGN') {
    if (latest) {
      await updateFieldVisit(latest.id, { status: 'reassigned', assigneeOverride: cmd.name });
      await sendWhatsAppText(from, `Reassigned latest visit to ${cmd.name}.`);
    } else {
      await sendWhatsAppText(from, 'No visit found to reassign.');
    }
    return;
  }

  if (cmd.type === 'STATUS') {
    const visits = await listFieldVisits(20);
    const match = visits.find(
      (v) =>
        (v.executiveName || '').toLowerCase().includes(cmd.name.toLowerCase()) ||
        (v.assigneeOverride || '').toLowerCase().includes(cmd.name.toLowerCase()) ||
        (v.title || '').toLowerCase().includes(cmd.name.toLowerCase()),
    );
    if (!match) {
      await sendWhatsAppText(from, `No visit found for "${cmd.name}".`);
      return;
    }
    await sendWhatsAppText(
      from,
      `STATUS ${cmd.name}\nVisit: ${match.id}\nTitle: ${match.title}\nStatus: ${match.status}\nDomain: ${match.domain || '—'}\nPDF: ${match.pdfDownloadPath || '—'}`,
    );
    return;
  }

  await sendWhatsAppText(
    from,
    '2Click MoM commands:\nAPPROVE\nREASSIGN [Name]\nSTATUS [Name]',
  );
}

export async function resendOwnerSummary(req: Request, res: Response) {
  const visit = await getFieldVisit(String(req.params.id || ''));
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  const result = await notifyOwnerExecutiveSummary({
    title: visit.title,
    domain: visit.domain,
    siteName: visit.siteName,
    lines: visit.executiveSummaryLines || [visit.executiveSummary || ''],
    visitId: visit.id,
    toPhone: req.body?.toPhone,
  });
  return res.json({ success: result.ok, ...result });
}
