import type { Express } from 'express';
import express from 'express';
import path from 'path';
import { enterpriseConfig } from '../config/env.ts';
import {
  verifyWhatsAppWebhook,
  receiveWhatsAppWebhook,
  resendOwnerSummary,
} from '../controllers/webhookController.ts';
import {
  processFieldVisit,
  listVisits,
  getVisit,
  privacyPreview,
} from '../controllers/fieldVisitController.ts';
import { fieldAnalytics } from '../controllers/analyticsController.ts';
import { createRateLimiter, requireAuth, requireAuthWhenLiveAi } from '../security/middleware.ts';

const fieldAiGate = requireAuthWhenLiveAi();
const fieldRate = createRateLimiter({ windowMs: 60_000, max: 40, keyPrefix: 'field' });

/**
 * Mount enterprise field-workforce routes WITHOUT removing existing MoM routes.
 */
export function registerEnterpriseRoutes(app: Express) {
  // Meta WhatsApp webhook (GET verify + POST receive)
  app.get('/webhook', verifyWhatsAppWebhook);
  app.get('/api/webhook/whatsapp', verifyWhatsAppWebhook);
  app.post('/webhook', receiveWhatsAppWebhook);
  app.post('/api/webhook/whatsapp', receiveWhatsAppWebhook);

  // Field visit pipeline
  app.post('/api/field/process', fieldRate, fieldAiGate, processFieldVisit);
  app.get('/api/field/visits', requireAuth, listVisits);
  app.get('/api/field/visits/:id', requireAuth, getVisit);
  app.post('/api/field/privacy/preview', privacyPreview);
  app.post('/api/field/visits/:id/notify', requireAuth, resendOwnerSummary);
  // Analytics is cheap local aggregate; open in demo, auth-gated when live AI is on
  app.get('/api/field/analytics', requireAuthWhenLiveAi(), fieldAnalytics);

  // Serve generated PDFs — opaque filenames (visit id) act as capability URLs so
  // field/process → pdfDownloadPath works without a second login hop.
  const pdfDir = path.resolve(process.cwd(), enterpriseConfig.fieldVisit.pdfStorageDir);
  const pdfRate = createRateLimiter({ windowMs: 60_000, max: 60, keyPrefix: 'pdf' });
  app.use('/api/field/pdfs', pdfRate, express.static(pdfDir));

  // Health extension (additive path — does not replace /api/health)
  app.get('/api/enterprise/health', (_req, res) => {
    res.json({
      ok: true,
      modules: {
        pii: true,
        domainMom: true,
        whatsapp: enterpriseConfig.whatsapp.enabled ? 'live' : 'mock',
        pdf: true,
        zeroAudioRetention: enterpriseConfig.zeroAudioRetention,
        geofenceRadiusDefaultM: enterpriseConfig.fieldVisit.defaultGeofenceRadiusMeters,
        audioChunkSeconds: enterpriseConfig.fieldVisit.chunkSeconds,
        audioOverlapSeconds: enterpriseConfig.fieldVisit.overlapSeconds,
      },
    });
  });
}
