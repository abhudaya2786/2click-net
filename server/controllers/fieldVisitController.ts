/**
 * Field visit processing: PII → Domain MoM → PDF → WhatsApp.
 */

import type { Request, Response } from 'express';
import { enterpriseConfig } from '../config/env.ts';
import { preprocessTranscriptForEnterprise } from '../services/piiFilterService.ts';
import { generateDomainAwareMom } from '../services/geminiDomainService.ts';
import { generateFieldVisitPdf } from '../services/pdfService.ts';
import { notifyOwnerExecutiveSummary, sendWhatsAppDocument } from '../services/whatsappService.ts';
import { stripAudioPayload } from '../services/audioRetentionService.ts';
import {
  getFieldVisit,
  listFieldVisits,
  upsertFieldVisit,
  type FieldVisitRecord,
} from '../services/fieldVisitStore.ts';

function uid(prefix = 'visit') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function processFieldVisit(req: Request, res: Response) {
  try {
    const {
      transcriptText,
      title,
      participants,
      meetingDate,
      languageHint,
      executiveName,
      siteName,
      latitude,
      longitude,
      arrivedAt,
      departedAt,
      notifyWhatsApp = true,
      generatePdf = true,
      toPhone,
    } = req.body || {};

    if (!transcriptText || String(transcriptText).trim().length < 10) {
      return res.status(400).json({ error: 'transcriptText required' });
    }

    const privacy = preprocessTranscriptForEnterprise(String(transcriptText), {
      redactPii: enterpriseConfig.piiRedactionEnabled,
      discardChatter: enterpriseConfig.discardSmallTalk,
    });

    if (!privacy.cleanedText || privacy.cleanedText.length < 8) {
      return res.status(400).json({
        error: 'Transcript empty after privacy filtering (all lines discarded as small-talk?).',
        privacy,
      });
    }

    const visitId = uid('visit');
    const mom = await generateDomainAwareMom({
      transcript: privacy.cleanedText,
      meetingTitle: title || `Field Visit — ${siteName || 'Site'}`,
      meetingDate: meetingDate || new Date().toISOString().slice(0, 10),
      participants: Array.isArray(participants)
        ? participants
        : typeof participants === 'string'
          ? participants.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      languageHint,
      geo: { lat: latitude, lng: longitude, siteName },
    });

    let pdfDownloadPath: string | undefined;
    let pdfFileName: string | undefined;
    if (generatePdf) {
      const pdf = await generateFieldVisitPdf({
        visitId,
        title: title || mom.summary.slice(0, 60) || 'Field Visit',
        domain: mom.domain,
        executiveName,
        siteName,
        latitude,
        longitude,
        arrivedAt,
        departedAt,
        executiveSummary: mom.summary,
        decisions: mom.decisions,
        actionItems: mom.action_items.map((a) => ({
          task: a.task,
          owner: a.responsible_person,
          deadline: a.deadline,
          priority: a.priority,
        })),
        transcript: privacy.cleanedText,
      });
      pdfDownloadPath = pdf.downloadPath;
      pdfFileName = pdf.fileName;
    }

    let whatsappMessageId: string | undefined;
    if (notifyWhatsApp) {
      const wa = await notifyOwnerExecutiveSummary({
        title: title || 'Field Visit',
        domain: mom.domain,
        siteName,
        lines: mom.executiveSummaryLines,
        visitId,
        toPhone,
      });
      whatsappMessageId = wa.messageId;
      if (pdfDownloadPath && enterpriseConfig.whatsapp.enabled) {
        const publicBase = process.env.PUBLIC_BASE_URL || '';
        if (publicBase) {
          await sendWhatsAppDocument({
            toPhone: toPhone || enterpriseConfig.whatsapp.ownerPhone,
            link: `${publicBase.replace(/\/$/, '')}${pdfDownloadPath}`,
            filename: pdfFileName || 'FieldVisit.pdf',
            caption: `Field MoM PDF · ${visitId}`,
          });
        }
      }
    }

    const record: FieldVisitRecord = {
      id: visitId,
      title: title || `Field Visit — ${siteName || mom.domain}`,
      domain: mom.domain,
      status: 'ready',
      executiveName,
      siteName,
      latitude,
      longitude,
      arrivedAt,
      departedAt,
      cleanedTranscript: privacy.cleanedText,
      executiveSummary: mom.summary,
      executiveSummaryLines: mom.executiveSummaryLines,
      decisions: mom.decisions,
      actionItems: mom.action_items.map((a, i) => ({
        task: a.task,
        owner: a.responsible_person,
        deadline: a.deadline,
        deadlineIso: mom.resolvedDeadlines[i]?.resolvedIso || null,
        priority: a.priority,
        status: a.status,
      })),
      pdfDownloadPath,
      whatsappMessageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertFieldVisit(record);

    const payload = {
      success: true,
      visit: record,
      minutes: mom,
      privacy: {
        redactions: privacy.redactions,
        discardedLines: privacy.discardedLines,
        retainedLines: privacy.retainedLines,
      },
      zeroAudioRetention: enterpriseConfig.zeroAudioRetention,
    };

    // Never echo raw audio even if client sent it
    return res.json(stripAudioPayload(payload));
  } catch (e: any) {
    console.error('[field/process]', e);
    return res.status(e.status || 500).json({ error: e.message || 'Field visit processing failed' });
  }
}

export async function listVisits(_req: Request, res: Response) {
  const visits = await listFieldVisits(100);
  res.json({ success: true, visits });
}

export async function getVisit(req: Request, res: Response) {
  const visit = await getFieldVisit(String(req.params.id));
  if (!visit) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, visit });
}

export async function privacyPreview(req: Request, res: Response) {
  const text = String(req.body?.transcriptText || '');
  const result = preprocessTranscriptForEnterprise(text, {
    redactPii: enterpriseConfig.piiRedactionEnabled,
    discardChatter: enterpriseConfig.discardSmallTalk,
  });
  res.json({ success: true, ...result });
}
