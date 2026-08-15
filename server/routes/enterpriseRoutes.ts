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
  app.post('/api/field/process', processFieldVisit);
  app.get('/api/field/visits', listVisits);
  app.get('/api/field/visits/:id', getVisit);
  app.post('/api/field/privacy/preview', privacyPreview);
  app.post('/api/field/visits/:id/notify', resendOwnerSummary);
  app.get('/api/field/analytics', fieldAnalytics);

  // Serve generated PDFs
  const pdfDir = path.resolve(process.cwd(), enterpriseConfig.fieldVisit.pdfStorageDir);
  app.use('/api/field/pdfs', express.static(pdfDir));

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
