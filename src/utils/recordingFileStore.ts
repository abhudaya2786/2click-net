import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { RecordingEntity } from '../types';

const IDB_NAME = '2click_mom_recordings_v1';
const IDB_STORE = 'audio_blobs';
const USER_KEY = 'voice_mom_local_user_v1';

export interface LocalUserProfile {
  id: string;
  displayName: string;
  email?: string;
  createdAt: string;
}

export interface StoredRecordingMeta extends RecordingEntity {
  userId: string;
  /** Absolute-ish path shown to the user (device Documents or browser Downloads). */
  localPath?: string;
  /** Whether file was written to phone Documents via Capacitor. */
  savedToDevice?: boolean;
  /** IndexedDB blob key (same as id usually). */
  blobKey?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function getOrCreateLocalUser(displayName?: string): LocalUserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw) as LocalUserProfile;
  } catch {
    /* ignore */
  }
  const user: LocalUserProfile = {
    id: `user-${Date.now().toString(36)}`,
    displayName: displayName?.trim() || 'MoM User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function updateLocalUser(updates: Partial<LocalUserProfile>): LocalUserProfile {
  const current = getOrCreateLocalUser();
  const next = { ...current, ...updates, id: current.id };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  return next;
}

export async function putRecordingBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getRecordingBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

export async function deleteRecordingBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function dataUrlToBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Folder shown to users on Android: Documents/2ClickMoM/Recordings */
export const DEVICE_RECORDINGS_FOLDER = '2ClickMoM/Recordings';

/**
 * Save audio to a place the user can open later.
 * - Native APK: Documents/2ClickMoM/Recordings/<file>
 * - Browser: triggers Downloads/<file> and keeps IndexedDB copy
 */
export async function saveRecordingToUserVisibleLocation(opts: {
  recordingId: string;
  fileName: string;
  mimeType: string;
  audioDataUrlOrBase64?: string;
  blob?: Blob;
}): Promise<{ localPath: string; savedToDevice: boolean; objectUrl?: string }> {
  let blob = opts.blob || null;
  if (!blob && opts.audioDataUrlOrBase64) {
    const dataUrl = opts.audioDataUrlOrBase64.startsWith('data:')
      ? opts.audioDataUrlOrBase64
      : `data:${opts.mimeType};base64,${opts.audioDataUrlOrBase64}`;
    const res = await fetch(dataUrl);
    blob = await res.blob();
  }
  if (!blob) {
    throw new Error('No audio data to save');
  }

  await putRecordingBlob(opts.recordingId, blob);

  const safeName = opts.fileName.replace(/[^\w.\-()+\s]/g, '_');

  if (Capacitor.isNativePlatform()) {
    const dataUrl = await blobToDataUrl(blob);
    const base64 = dataUrlToBase64(dataUrl);
    const path = `${DEVICE_RECORDINGS_FOLDER}/${safeName}`;
    await Filesystem.mkdir({
      path: DEVICE_RECORDINGS_FOLDER,
      directory: Directory.Documents,
      recursive: true,
    }).catch(() => {
      /* exists */
    });
    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Documents,
    });
    const uri = await Filesystem.getUri({
      path,
      directory: Directory.Documents,
    });
    return {
      localPath: uri.uri || `Documents/${path}`,
      savedToDevice: true,
    };
  }

  // Browser: download into the user's Downloads folder (visible in Files app / Finder)
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = safeName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Keep object URL briefly so <audio> can use it if needed
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

  return {
    localPath: `Downloads/${safeName} (browser download) + app library`,
    savedToDevice: false,
    objectUrl,
  };
}

export async function shareOrOpenRecording(localPath: string, title = 'Voice recording'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Share.share({
      title,
      url: localPath,
      dialogTitle: 'Open or share recording',
    });
  } catch {
    /* user cancelled */
  }
}

export function describeStorageLocation(rec: StoredRecordingMeta): string {
  if (rec.localPath) return rec.localPath;
  if (Capacitor.isNativePlatform()) {
    return `Documents/${DEVICE_RECORDINGS_FOLDER}/${rec.fileName}`;
  }
  return 'Browser app storage (IndexedDB). Use Download to save into your Downloads folder.';
}
