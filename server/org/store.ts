/**
 * Real-estate marketing company org + work-talk reports.
 * Employee talk (text) is routed to company owner and designated report recipients.
 */
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export type CompanyRole = 'owner' | 'manager' | 'employee';

export interface ReportRecipient {
  userId: string;
  displayName: string;
  phone?: string;
  /** Why they receive reports (e.g. Team Lead, Sales Head) */
  title?: string;
}

export interface WorkHoursConfig {
  enabled: boolean;
  /** 0=Sun … 6=Sat */
  days: number[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

export interface CompanyOrgSettings {
  companyName: string;
  industry: 'real_estate_marketing' | 'real_estate' | 'sales' | 'general';
  tagline: string;
  ownerUserId: string;
  ownerDisplayName: string;
  ownerPhone?: string;
  reportRecipients: ReportRecipient[];
  workHours: WorkHoursConfig;
  /** If true, talk outside work hours is still saved but flagged */
  allowAfterHoursCapture: boolean;
  notifyOwnerOnEveryTalk: boolean;
  updatedAt: string;
}

export interface WorkTalkDelivery {
  userId: string;
  displayName: string;
  channel: 'inbox' | 'whatsapp_mock' | 'whatsapp';
  deliveredAt: string;
  preview?: string;
}

export interface WorkTalkReport {
  id: string;
  employeeUserId: string;
  employeeDisplayName: string;
  employeeRole: CompanyRole;
  text: string;
  summary: string;
  /** Optional lead / site / project context for real-estate marketing */
  leadOrSite?: string;
  locationLabel?: string;
  talkType: 'client_call' | 'site_visit' | 'team_huddle' | 'field_note' | 'other';
  withinWorkHours: boolean;
  createdAt: string;
  deliveredTo: WorkTalkDelivery[];
  status: 'delivered' | 'queued' | 'flagged_after_hours';
}

const DEFAULT_ORG: CompanyOrgSettings = {
  companyName: '2Click Real Estate Marketing',
  industry: 'real_estate_marketing',
  tagline: 'Employee field talk → text → Owner & report desk',
  ownerUserId: '',
  ownerDisplayName: '',
  ownerPhone: '',
  reportRecipients: [],
  workHours: {
    enabled: true,
    days: [1, 2, 3, 4, 5, 6], // Mon–Sat
    startTime: '09:30',
    endTime: '19:30',
    timezone: 'Asia/Kolkata',
  },
  allowAfterHoursCapture: true,
  notifyOwnerOnEveryTalk: true,
  updatedAt: new Date(0).toISOString(),
};

function dataDir() {
  return path.join(process.cwd(), 'data', 'company');
}

function orgFile() {
  return path.join(dataDir(), 'org.json');
}

function reportsFile() {
  return path.join(dataDir(), 'work_talk_reports.json');
}

async function ensureDir() {
  await fs.mkdir(dataDir(), { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await ensureDir();
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(':').map((n) => Number(n));
  return (h || 0) * 60 + (m || 0);
}

/** Check if now is within configured work hours (Asia/Kolkata wall clock by default). */
export function isWithinWorkHours(cfg: WorkHoursConfig, at = new Date()): boolean {
  if (!cfg.enabled) return true;
  // Use locale parts for configured timezone
  let day: number;
  let minutes: number;
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: cfg.timezone || 'Asia/Kolkata',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = Object.fromEntries(fmt.formatToParts(at).map((p) => [p.type, p.value]));
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    day = map[parts.weekday] ?? at.getDay();
    minutes = Number(parts.hour) * 60 + Number(parts.minute);
  } catch {
    day = at.getDay();
    minutes = at.getHours() * 60 + at.getMinutes();
  }
  if (!cfg.days.includes(day)) return false;
  const start = parseHm(cfg.startTime || '09:00');
  const end = parseHm(cfg.endTime || '18:00');
  return minutes >= start && minutes <= end;
}

function summarizeTalk(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 220) return cleaned;
  return `${cleaned.slice(0, 217)}…`;
}

export class CompanyOrgStore {
  private org: CompanyOrgSettings = { ...DEFAULT_ORG };
  private reports: WorkTalkReport[] = [];
  private loaded = false;

  async init() {
    if (this.loaded) return;
    await ensureDir();
    this.org = { ...DEFAULT_ORG, ...(await readJson<Partial<CompanyOrgSettings>>(orgFile(), {})) };
    this.reports = await readJson<WorkTalkReport[]>(reportsFile(), []);
    this.loaded = true;
  }

  async getOrg(): Promise<CompanyOrgSettings> {
    await this.init();
    return this.org;
  }

  async updateOrg(patch: Partial<CompanyOrgSettings>): Promise<CompanyOrgSettings> {
    await this.init();
    this.org = {
      ...this.org,
      ...patch,
      workHours: {
        ...this.org.workHours,
        ...(patch.workHours || {}),
      },
      reportRecipients: Array.isArray(patch.reportRecipients)
        ? patch.reportRecipients
        : this.org.reportRecipients,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(orgFile(), this.org);
    return this.org;
  }

  /** Recipients who must receive every work-talk text (owner + report desk). */
  getDeliveryTargets(org: CompanyOrgSettings): ReportRecipient[] {
    const targets: ReportRecipient[] = [];
    if (org.ownerUserId) {
      targets.push({
        userId: org.ownerUserId,
        displayName: org.ownerDisplayName || org.ownerUserId,
        phone: org.ownerPhone,
        title: 'Company Owner',
      });
    }
    for (const r of org.reportRecipients || []) {
      if (!r.userId) continue;
      if (targets.some((t) => t.userId.toLowerCase() === r.userId.toLowerCase())) continue;
      targets.push(r);
    }
    return targets;
  }

  async submitWorkTalk(input: {
    employeeUserId: string;
    employeeDisplayName: string;
    employeeRole?: CompanyRole;
    text: string;
    leadOrSite?: string;
    locationLabel?: string;
    talkType?: WorkTalkReport['talkType'];
  }): Promise<WorkTalkReport> {
    await this.init();
    const text = String(input.text || '').replace(/\s+/g, ' ').trim();
    if (text.length < 3) {
      throw Object.assign(new Error('Talk text too short — bolo / type at least a few words.'), {
        status: 400,
      });
    }

    const within = isWithinWorkHours(this.org.workHours);
    if (!within && !this.org.allowAfterHoursCapture) {
      throw Object.assign(
        new Error('Abhi working hours ke bahar hai. Owner ne after-hours capture band rakha hai.'),
        { status: 403 },
      );
    }

    const targets = this.getDeliveryTargets(this.org);
    if (targets.length === 0) {
      throw Object.assign(
        new Error('Company Owner / report recipients set nahi hain. Pehle Company Settings mein add karein.'),
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const deliveredTo: WorkTalkDelivery[] = targets.map((t) => {
      const preview = `[${input.employeeDisplayName}] ${summarizeTalk(text)}`;
      // WhatsApp mock log when phone present
      if (t.phone) {
        console.info('[work-talk:whatsapp:mock]', t.phone, preview);
      }
      return {
        userId: t.userId,
        displayName: t.displayName,
        channel: t.phone ? 'whatsapp_mock' : 'inbox',
        deliveredAt: now,
        preview,
      };
    });

    const report: WorkTalkReport = {
      id: `talk-${randomBytes(6).toString('hex')}`,
      employeeUserId: input.employeeUserId,
      employeeDisplayName: input.employeeDisplayName,
      employeeRole: input.employeeRole || 'employee',
      text,
      summary: summarizeTalk(text),
      leadOrSite: input.leadOrSite?.trim() || undefined,
      locationLabel: input.locationLabel?.trim() || undefined,
      talkType: input.talkType || 'field_note',
      withinWorkHours: within,
      createdAt: now,
      deliveredTo,
      status: within ? 'delivered' : 'flagged_after_hours',
    };

    this.reports.unshift(report);
    if (this.reports.length > 2000) this.reports.length = 2000;
    await writeJson(reportsFile(), this.reports);
    return report;
  }

  async listReportsForViewer(viewerUserId: string, opts?: { mineOnly?: boolean; q?: string }) {
    await this.init();
    const org = this.org;
    const viewer = viewerUserId.toLowerCase();
    const isOwner = org.ownerUserId.toLowerCase() === viewer;
    const isReportDesk = org.reportRecipients.some((r) => r.userId.toLowerCase() === viewer);

    let rows = this.reports;
    if (opts?.mineOnly) {
      rows = rows.filter((r) => r.employeeUserId.toLowerCase() === viewer);
    } else if (!isOwner && !isReportDesk) {
      // Regular employee: only own talks
      rows = rows.filter((r) => r.employeeUserId.toLowerCase() === viewer);
    } else {
      // Owner / report desk: all talks delivered to them (or all company talks)
      rows = rows.filter(
        (r) =>
          r.deliveredTo.some((d) => d.userId.toLowerCase() === viewer) ||
          isOwner ||
          isReportDesk,
      );
    }

    const q = (opts?.q || '').toLowerCase().trim();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.text.toLowerCase().includes(q) ||
          r.employeeDisplayName.toLowerCase().includes(q) ||
          (r.leadOrSite || '').toLowerCase().includes(q),
      );
    }
    return {
      org,
      isOwner,
      isReportDesk,
      withinWorkHoursNow: isWithinWorkHours(org.workHours),
      count: rows.length,
      reports: rows,
    };
  }
}

export const companyOrgStore = new CompanyOrgStore();
