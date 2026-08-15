/**
 * Offline-first audio chunk queue (IndexedDB).
 * Flushes when network is back — used by field session recorder.
 */

const DB_NAME = '2click_field_audio_queue_v1';
const STORE = 'chunks';

export interface QueuedAudioChunk {
  id: string;
  sessionId: string;
  index: number;
  mimeType: string;
  blob: Blob;
  createdAt: string;
  uploaded: boolean;
  overlapMs: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('sessionId', 'sessionId', { unique: false });
        os.createIndex('uploaded', 'uploaded', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueAudioChunk(
  chunk: Omit<QueuedAudioChunk, 'id' | 'createdAt' | 'uploaded'> & { uploaded?: boolean },
): Promise<QueuedAudioChunk> {
  const row: QueuedAudioChunk = {
    ...chunk,
    id: `chunk-${chunk.sessionId}-${chunk.index}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    uploaded: chunk.uploaded ?? false,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(row);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return row;
}

export async function listPendingChunks(sessionId?: string): Promise<QueuedAudioChunk[]> {
  const db = await openDb();
  const rows = await new Promise<QueuedAudioChunk[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as QueuedAudioChunk[]) || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows
    .filter((r) => !r.uploaded && (!sessionId || r.sessionId === sessionId))
    .sort((a, b) => a.index - b.index);
}

export async function markChunkUploaded(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const row = getReq.result as QueuedAudioChunk | undefined;
      if (row) {
        row.uploaded = true;
        store.put(row);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function clearSessionQueue(sessionId: string): Promise<void> {
  const db = await openDb();
  const rows = await listPendingChunks();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    rows
      .filter((r) => r.sessionId === sessionId)
      .forEach((r) => store.delete(r.id));
    // also delete uploaded for session
    const allReq = store.getAll();
    allReq.onsuccess = () => {
      for (const r of (allReq.result as QueuedAudioChunk[]) || []) {
        if (r.sessionId === sessionId) store.delete(r.id);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
