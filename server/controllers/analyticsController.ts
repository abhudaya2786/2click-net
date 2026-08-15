/**
 * Lightweight analytics for field workforce visits.
 */

import type { Request, Response } from 'express';
import { listFieldVisits } from '../services/fieldVisitStore.ts';

export async function fieldAnalytics(_req: Request, res: Response) {
  const visits = await listFieldVisits(500);
  const byDomain: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const v of visits) {
    byDomain[v.domain || 'General'] = (byDomain[v.domain || 'General'] || 0) + 1;
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  }
  res.json({
    success: true,
    totals: {
      visits: visits.length,
      withPdf: visits.filter((v) => v.pdfDownloadPath).length,
      notified: visits.filter((v) => v.whatsappMessageId).length,
    },
    byDomain,
    byStatus,
  });
}
