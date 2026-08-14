import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Search,
  Loader2,
  AlertCircle,
  Building2,
  Clock,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WorkTalkReport {
  id: string;
  employeeUserId: string;
  employeeDisplayName: string;
  text: string;
  summary: string;
  leadOrSite?: string;
  locationLabel?: string;
  talkType: string;
  withinWorkHours: boolean;
  createdAt: string;
  deliveredTo: Array<{ userId: string; displayName: string; channel: string }>;
  status: string;
}

interface Props {
  onNavigate: (path: string) => void;
}

export const OwnerInboxView: React.FC<Props> = ({ onNavigate }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [reports, setReports] = useState<WorkTalkReport[]>([]);
  const [q, setQ] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isReportDesk, setIsReportDesk] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [withinHours, setWithinHours] = useState(false);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorkTalkReport | null>(null);

  const load = async (query = q) => {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/v1/company/work-talk?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load inbox');
      setReports(data.reports || []);
      setIsOwner(Boolean(data.isOwner));
      setIsReportDesk(Boolean(data.isReportDesk));
      setCompanyName(data.org?.companyName || '');
      setWithinHours(Boolean(data.withinWorkHoursNow));
      if (data.reports?.[0]) setSelected(data.reports[0]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) void load('');
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-3">
        <Inbox className="w-8 h-8 mx-auto text-hs-600" />
        <h1 className="text-lg font-extrabold">Owner / Report Inbox</h1>
        <p className="text-sm text-slate-500">Employee talks yahan text form me aati hain.</p>
        <button className="btn-hs" type="button" onClick={() => onNavigate('/signin')}>
          Sign In
        </button>
      </div>
    );
  }

  const roleBadge = isOwner ? 'Company Owner' : isReportDesk ? 'Report Desk' : 'My talks';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-hs-600" />
            Work Talk Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {companyName || 'Company'} · {roleBadge} · @{user?.userId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
              withinHours
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {withinHours ? 'Work hours ON' : 'After hours'}
          </span>
          <button type="button" className="btn-hs-secondary !px-2.5" onClick={() => void load()}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            placeholder="Search employee / lead / talk text…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load(q)}
          />
        </div>
        <button type="button" className="btn-hs" onClick={() => void load(q)}>
          Search
        </button>
        <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/field-talk')}>
          New talk
        </button>
      </div>

      {err && (
        <div className="flex gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" /> {err}
        </div>
      )}

      {busy ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-2">
          <Inbox className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Abhi koi work talk nahi</p>
          <p className="text-xs text-slate-400">
            Employee Field Talk se baat bhejein — yahan text me dikhegi.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {reports.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  selected?.id === r.id
                    ? 'border-hs-400 bg-hs-50/70 dark:bg-hs-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {r.employeeDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{r.summary}</p>
                {r.leadOrSite && (
                  <div className="mt-1 text-[10px] font-semibold text-hs-700 dark:text-hs-300 truncate">
                    {r.leadOrSite}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-h-[320px]">
            {selected ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                    <User className="w-3.5 h-3.5" /> {selected.employeeDisplayName}
                    <span className="font-mono text-slate-400">@{selected.employeeUserId}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                    {selected.talkType.replace('_', ' ')}
                  </span>
                  {!selected.withinWorkHours && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                      after hours
                    </span>
                  )}
                </div>
                {(selected.leadOrSite || selected.locationLabel) && (
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {selected.leadOrSite && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {selected.leadOrSite}
                      </span>
                    )}
                    {selected.locationLabel && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {selected.locationLabel}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Full talk text
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                    {selected.text}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  Delivered to:{' '}
                  {selected.deliveredTo
                    .map((d) => `${d.displayName} (${d.channel})`)
                    .join(' · ')}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a report</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
