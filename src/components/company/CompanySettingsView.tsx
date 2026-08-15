import React, { useEffect, useState } from 'react';
import {
  Building2,
  User,
  Phone,
  Plus,
  Trash2,
  Save,
  Clock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReportRecipient {
  userId: string;
  displayName: string;
  phone?: string;
  title?: string;
}

interface WorkHoursConfig {
  enabled: boolean;
  days: number[];
  startTime: string;
  endTime: string;
  timezone: string;
}

interface CompanyOrg {
  companyName: string;
  industry: string;
  tagline: string;
  ownerUserId: string;
  ownerDisplayName: string;
  ownerPhone?: string;
  reportRecipients: ReportRecipient[];
  workHours: WorkHoursConfig;
  allowAfterHoursCapture: boolean;
  notifyOwnerOnEveryTalk: boolean;
}

const DAY_LABELS = [
  { d: 0, label: 'Sun' },
  { d: 1, label: 'Mon' },
  { d: 2, label: 'Tue' },
  { d: 3, label: 'Wed' },
  { d: 4, label: 'Thu' },
  { d: 5, label: 'Fri' },
  { d: 6, label: 'Sat' },
];

interface Props {
  onNavigate: (path: string) => void;
}

export const CompanySettingsView: React.FC<Props> = ({ onNavigate }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [org, setOrg] = useState<CompanyOrg | null>(null);
  const [withinHours, setWithinHours] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/v1/company/org');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Load failed');
    setOrg(data.org);
    setWithinHours(Boolean(data.withinWorkHoursNow));
  };

  useEffect(() => {
    void load().catch((e) => setErr(e.message));
  }, []);

  const save = async () => {
    if (!org || !token) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch('/api/v1/company/org', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(org),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setOrg(data.org);
      setWithinHours(Boolean(data.withinWorkHoursNow));
      setMsg('Company settings saved — owner & report desk ready.');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-3">
        <Building2 className="w-8 h-8 mx-auto text-hs-600" />
        <h1 className="text-lg font-extrabold">Company Settings</h1>
        <p className="text-sm text-slate-500">
          Owner / report routing set karne ke liye pehle Sign In karein.
        </p>
        <button className="btn-hs" type="button" onClick={() => onNavigate('/signin')}>
          Sign In
        </button>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading company…
      </div>
    );
  }

  const toggleDay = (d: number) => {
    const days = org.workHours.days.includes(d)
      ? org.workHours.days.filter((x) => x !== d)
      : [...org.workHours.days, d].sort();
    setOrg({ ...org, workHours: { ...org.workHours, days } });
  };

  const addRecipient = () => {
    setOrg({
      ...org,
      reportRecipients: [
        ...org.reportRecipients,
        { userId: '', displayName: '', title: 'Sales Head', phone: '' },
      ],
    });
  };

  const updateRecipient = (idx: number, patch: Partial<ReportRecipient>) => {
    const next = org.reportRecipients.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setOrg({ ...org, reportRecipients: next });
  };

  const removeRecipient = (idx: number) => {
    setOrg({
      ...org,
      reportRecipients: org.reportRecipients.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-hs-600" />
            Company & Report Routing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-estate marketing team ki baat text mein owner aur report desk tak.
          </p>
        </div>
        <div
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
            withinHours
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {withinHours ? 'Working hours: ON' : 'Working hours: OFF'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Company name
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
            value={org.companyName}
            onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
            placeholder="e.g. Skyline Real Estate Marketing"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Tagline
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
            value={org.tagline}
            onChange={(e) => setOrg({ ...org, tagline: e.target.value })}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Owner User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
                value={org.ownerUserId}
                onChange={(e) => setOrg({ ...org, ownerUserId: e.target.value })}
                placeholder={user?.userId || 'owner_id'}
              />
            </div>
            <button
              type="button"
              className="mt-1 text-[11px] font-semibold text-hs-700 cursor-pointer"
              onClick={() =>
                user &&
                setOrg({
                  ...org,
                  ownerUserId: user.userId,
                  ownerDisplayName: user.displayName || user.userId,
                })
              }
            >
              Use my signed-in ID as Owner
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Owner display name
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              value={org.ownerDisplayName}
              onChange={(e) => setOrg({ ...org, ownerDisplayName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
            Owner WhatsApp (optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
              value={org.ownerPhone || ''}
              onChange={(e) => setOrg({ ...org, ownerPhone: e.target.value })}
              placeholder="+91…"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold flex items-center gap-2">
            <Users className="w-4 h-4 text-hs-600" />
            Report recipients (jisko report chahiye)
          </h2>
          <button type="button" className="btn-hs-secondary !py-1.5 !px-2.5 text-[11px]" onClick={addRecipient}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Sales head, team lead, CRM desk — unke User ID add karein. Employee talk text inke inbox me bhi jayegi.
        </p>
        {org.reportRecipients.length === 0 && (
          <div className="text-xs text-slate-400 italic">Abhi koi extra recipient nahi.</div>
        )}
        {org.reportRecipients.map((r, idx) => (
          <div
            key={idx}
            className="grid sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
          >
            <input
              className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-900"
              placeholder="user_id"
              value={r.userId}
              onChange={(e) => updateRecipient(idx, { userId: e.target.value })}
            />
            <input
              className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
              placeholder="Name"
              value={r.displayName}
              onChange={(e) => updateRecipient(idx, { displayName: e.target.value })}
            />
            <input
              className="sm:col-span-2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
              placeholder="Title"
              value={r.title || ''}
              onChange={(e) => updateRecipient(idx, { title: e.target.value })}
            />
            <input
              className="sm:col-span-3 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-900"
              placeholder="Phone optional"
              value={r.phone || ''}
              onChange={(e) => updateRecipient(idx, { phone: e.target.value })}
            />
            <button
              type="button"
              className="sm:col-span-1 btn-hs-secondary !px-2 justify-center"
              onClick={() => removeRecipient(idx)}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-extrabold flex items-center gap-2">
          <Clock className="w-4 h-4 text-hs-600" /> Working hours
        </h2>
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={org.workHours.enabled}
            onChange={(e) =>
              setOrg({ ...org, workHours: { ...org.workHours, enabled: e.target.checked } })
            }
          />
          Enforce working-hours window
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DAY_LABELS.map(({ d, label }) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                org.workHours.days.includes(d)
                  ? 'bg-hs-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Start</label>
            <input
              type="time"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-950"
              value={org.workHours.startTime}
              onChange={(e) =>
                setOrg({ ...org, workHours: { ...org.workHours, startTime: e.target.value } })
              }
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">End</label>
            <input
              type="time"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-950"
              value={org.workHours.endTime}
              onChange={(e) =>
                setOrg({ ...org, workHours: { ...org.workHours, endTime: e.target.value } })
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={org.allowAfterHoursCapture}
            onChange={(e) => setOrg({ ...org, allowAfterHoursCapture: e.target.checked })}
          />
          After-hours talk bhi save ho (flagged)
        </label>
      </div>

      {err && (
        <div className="flex gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" /> {err}
        </div>
      )}
      {msg && (
        <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-hs" disabled={busy} onClick={() => void save()}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save company settings
        </button>
        <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/inbox')}>
          Open Owner Inbox
        </button>
        <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/field-talk')}>
          Employee Field Talk
        </button>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
        Talk text inbox me deliver hoti hai; WhatsApp number diya ho to mock notify log bhi chalta hai.
      </div>
    </div>
  );
};
