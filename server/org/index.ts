/**
 * Company org + work-talk report API for real-estate marketing ops.
 */
import type { Express, Request, Response } from 'express';
import { authStore, readBearerToken } from '../auth/store.ts';
import { companyOrgStore, isWithinWorkHours, type CompanyRole } from './store.ts';

async function requireUser(req: Request) {
  const token = readBearerToken(req);
  const user = await authStore.getUserForToken(token);
  if (!user) {
    const err = new Error('Sign in required');
    (err as any).status = 401;
    throw err;
  }
  return user;
}

export function registerCompanyOrgRoutes(app: Express) {
  app.get('/api/v1/company/org', async (req, res) => {
    try {
      const org = await companyOrgStore.getOrg();
      const user = await authStore.getUserForToken(readBearerToken(req));
      const payload = user
        ? org
        : {
            ...org,
            ownerPhone: org.ownerPhone ? '[hidden]' : '',
            reportRecipients: (org.reportRecipients || []).map((r: any) => ({
              ...r,
              phone: r.phone ? '[hidden]' : '',
            })),
          };
      res.json({
        success: true,
        org: payload,
        withinWorkHoursNow: isWithinWorkHours(org.workHours),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to load company settings' });
    }
  });

  app.put('/api/v1/company/org', async (req, res) => {
    try {
      const user = await requireUser(req);
      const current = await companyOrgStore.getOrg();
      if (current.ownerUserId && current.ownerUserId !== user.userId) {
        return res.status(403).json({
          error: 'Only the company owner can update organization settings.',
        });
      }
      const body = req.body || {};
      const org = await companyOrgStore.updateOrg({
        companyName: body.companyName,
        industry: body.industry,
        tagline: body.tagline,
        // First save claims ownership; ownerUserId cannot be stolen by others
        ownerUserId: current.ownerUserId || user.userId,
        ownerDisplayName: body.ownerDisplayName || user.displayName || user.userId,
        ownerPhone: body.ownerPhone,
        reportRecipients: body.reportRecipients,
        workHours: body.workHours,
        allowAfterHoursCapture: body.allowAfterHoursCapture,
        notifyOwnerOnEveryTalk: body.notifyOwnerOnEveryTalk,
      });
      res.json({
        success: true,
        org,
        withinWorkHoursNow: isWithinWorkHours(org.workHours),
      });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Failed to save company settings' });
    }
  });

  /** Employee posts spoken/typed talk → text delivered to owner + report desk */
  app.post('/api/v1/company/work-talk', async (req, res) => {
    try {
      const user = await requireUser(req);
      const body = req.body || {};
      const role = (body.employeeRole || 'employee') as CompanyRole;
      const report = await companyOrgStore.submitWorkTalk({
        employeeUserId: user.userId,
        employeeDisplayName: user.displayName || user.userId,
        employeeRole: role,
        text: body.text || body.transcript || body.raw_text,
        leadOrSite: body.leadOrSite || body.site || body.lead,
        locationLabel: body.locationLabel || body.location,
        talkType: body.talkType,
      });
      res.status(201).json({
        success: true,
        report,
        message:
          'Talk text company owner aur report recipients ke inbox tak pahunch gaya.',
      });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Failed to submit work talk' });
    }
  });

  /** Owner / report desk inbox (or employee own talks) */
  app.get('/api/v1/company/work-talk', async (req, res) => {
    try {
      const user = await requireUser(req);
      const mineOnly = String(req.query.mine || '') === '1';
      const q = String(req.query.q || '');
      const data = await companyOrgStore.listReportsForViewer(user.userId, { mineOnly, q });
      res.json({ success: true, ...data });
    } catch (e: any) {
      res.status(e.status || 500).json({ error: e.message || 'Failed to load reports' });
    }
  });

  app.get('/api/v1/company/work-hours/status', async (_req, res) => {
    try {
      const org = await companyOrgStore.getOrg();
      res.json({
        success: true,
        withinWorkHoursNow: isWithinWorkHours(org.workHours),
        workHours: org.workHours,
        companyName: org.companyName,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed' });
    }
  });
}
