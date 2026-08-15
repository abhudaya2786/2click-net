import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileAudio, FolderOpen, Mic, RefreshCw, Share2, User } from 'lucide-react';
import { meetingDb } from '../../utils/meetingDatabase';
import {
  describeStorageLocation,
  getOrCreateLocalUser,
  getRecordingBlob,
  shareOrOpenRecording,
  updateLocalUser,
  DEVICE_RECORDINGS_FOLDER,
} from '../../utils/recordingFileStore';
import type { RecordingEntity } from '../../types';
import { Capacitor } from '@capacitor/core';

function formatBytes(n: number) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RecordingsLibraryView({ onOpenMeeting }: { onOpenMeeting?: (meetingId: string) => void }) {
  const [user, setUser] = useState(() => getOrCreateLocalUser());
  const [nameDraft, setNameDraft] = useState(user.displayName);
  const [recs, setRecs] = useState<RecordingEntity[]>([]);
  const [playUrls, setPlayUrls] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => {
    const list = meetingDb.listRecordings(user.id);
    setRecs(list);
  };

  useEffect(() => {
    refresh();
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const r of recs) {
        if (r.audioData && (r.audioData.startsWith('data:') || r.audioData.startsWith('blob:'))) {
          next[r.id] = r.audioData;
          continue;
        }
        if (r.blobKey || r.id) {
          const blob = await getRecordingBlob(r.blobKey || r.id);
          if (blob) next[r.id] = URL.createObjectURL(blob);
        }
      }
      if (!cancelled) setPlayUrls(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [recs]);

  const locationHint = useMemo(() => {
    if (Capacitor.isNativePlatform()) {
      return `Phone Files → Documents → ${DEVICE_RECORDINGS_FOLDER}`;
    }
    return 'Browser Downloads folder (after Download) + in-app library below';
  }, []);

  const saveProfile = () => {
    const next = updateLocalUser({ displayName: nameDraft.trim() || 'MoM User' });
    setUser(next);
    setMsg('User profile saved. New recordings will use this name in the file name.');
  };

  const downloadAgain = async (rec: RecordingEntity) => {
    const blob =
      (await getRecordingBlob(rec.blobKey || rec.id)) ||
      (rec.audioData
        ? await fetch(rec.audioData).then((r) => r.blob()).catch(() => null)
        : null);
    if (!blob) {
      setMsg('Audio file not found in library.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = rec.fileName;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(`Saved/downloaded: ${rec.fileName}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-hs-600 text-white flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Voice recordings</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Har recording <strong>aapke user</strong> ke naam se save hoti hai. File yahan se play/download
              kar sakte ho.
            </p>
            <div className="mt-3 rounded-xl bg-hs-50 dark:bg-hs-950/40 border border-hs-100 dark:border-hs-900 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="font-bold text-hs-800 dark:text-hs-200 mb-0.5">Save location (dekhne ke liye)</div>
              <div className="font-mono break-all">{locationHint}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-end">
          <label className="flex-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            User name (file prefix)
            <div className="mt-1 flex gap-2">
              <span className="inline-flex items-center px-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                placeholder="Your name"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={saveProfile}
            className="px-3 py-2 rounded-lg bg-hs-600 text-white text-xs font-bold cursor-pointer"
          >
            Save user
          </button>
          <button
            type="button"
            onClick={refresh}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        {msg && <p className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{msg}</p>}
      </div>

      {recs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Mic className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Abhi koi recording save nahi hai</p>
          <p className="text-xs text-slate-500 mt-1">Record tab se voice record karke stop karo — file yahan dikhegi.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {recs.map((rec) => (
            <li
              key={rec.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <FileAudio className="w-5 h-5 text-hs-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white break-all">{rec.fileName}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>{formatDur(rec.durationSeconds)}</span>
                    <span>•</span>
                    <span>{formatBytes(rec.fileSizeBytes)}</span>
                    <span>•</span>
                    <span>{new Date(rec.recordedAt).toLocaleString()}</span>
                    {rec.savedToDevice && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">Saved on phone</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg px-2 py-1.5 break-all">
                    {describeStorageLocation(rec as any)}
                  </div>
                </div>
              </div>

              {playUrls[rec.id] && (
                <audio controls src={playUrls[rec.id]} className="w-full h-10" />
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadAgain(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hs-600 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download / Save
                </button>
                {Capacitor.isNativePlatform() && rec.localPath && (
                  <button
                    type="button"
                    onClick={() => shareOrOpenRecording(rec.localPath!, rec.fileName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Open / Share
                  </button>
                )}
                {onOpenMeeting && rec.meetingId && !rec.meetingId.startsWith('standalone') && (
                  <button
                    type="button"
                    onClick={() => onOpenMeeting(rec.meetingId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Open meeting
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
