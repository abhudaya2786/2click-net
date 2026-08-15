/**
 * Lightweight JSON file store for field visits (offline-friendly server cache).
 * Avoids native SQLite bindings for portability on Vercel/Hostinger Node hosts.
 */

import fs from 'fs/promises';
import path from 'path';
import { enterpriseConfig } from '../config/env.ts';

export interface FieldVisitRecord {
  id: string;
  title: string;
  domain?: string;
  status: 'draft' | 'processing' | 'ready' | 'approved' | 'reassigned';
  executiveName?: string;
  siteName?: string;
  latitude?: number;
  longitude?: number;
  arrivedAt?: string;
  departedAt?: string;
  cleanedTranscript?: string;
  executiveSummary?: string;
  executiveSummaryLines?: string[];
  decisions?: string[];
  actionItems?: Array<{ task: string; owner?: string; deadline?: string; deadlineIso?: string | null; priority?: string; status?: string }>;
  pdfDownloadPath?: string;
  whatsappMessageId?: string;
  assigneeOverride?: string;
  createdAt: string;
  updatedAt: string;
}

function storePath(): string {
  return path.resolve(process.cwd(), enterpriseConfig.fieldVisit.storeDir, 'visits.json');
}

async function readAll(): Promise<FieldVisitRecord[]> {
  try {
    const raw = await fs.readFile(storePath(), 'utf-8');
    return JSON.parse(raw) as FieldVisitRecord[];
  } catch {
    return [];
  }
}

async function writeAll(rows: FieldVisitRecord[]): Promise<void> {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(rows, null, 2), 'utf-8');
}

export async function upsertFieldVisit(rec: FieldVisitRecord): Promise<FieldVisitRecord> {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === rec.id);
  if (idx >= 0) rows[idx] = rec;
  else rows.unshift(rec);
  await writeAll(rows.slice(0, 500));
  return rec;
}

export async function getFieldVisit(id: string): Promise<FieldVisitRecord | null> {
  const rows = await readAll();
  return rows.find((r) => r.id === id) || null;
}

export async function listFieldVisits(limit = 50): Promise<FieldVisitRecord[]> {
  const rows = await readAll();
  return rows.slice(0, limit);
}

export async function updateFieldVisit(
  id: string,
  patch: Partial<FieldVisitRecord>,
): Promise<FieldVisitRecord | null> {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeAll(rows);
  return rows[idx];
}
