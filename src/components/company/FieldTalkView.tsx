import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatShortPlace, reverseGeocode } from '../../utils/reverseGeocode';

interface Props {
  onNavigate: (path: string) => void;
}

type TalkType = 'client_call' | 'site_visit' | 'team_huddle' | 'field_note' | 'other';

export const FieldTalkView: React.FC<Props> = ({ onNavigate }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [text, setText] = useState('');
  const [leadOrSite, setLeadOrSite] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [talkType, setTalkType] = useState<TalkType>('client_call');
  const [listening, setListening] = useState(false);
  const [withinHours, setWithinHours] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const fillLocationFromGps = async () => {
    setErr(null);
    if (!('geolocation' in navigator)) {
      setErr('GPS is browser pe available nahi hai.');
      return;
    }
    setGeoBusy(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        });
      });
      const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setLocationLabel(formatShortPlace(place) || place.displayName);
      setOk(`Location: ${place.displayName}`);
    } catch (e: any) {
      setErr(e?.message || 'GPS / address lookup fail');
    } finally {
      setGeoBusy(false);
    }
  };

  useEffect(() => {
    fetch('/api/v1/company/work-hours/status')
      .then((r) => r.json())
      .then((d) => {
        setWithinHours(Boolean(d.withinWorkHoursNow));
        setCompanyName(d.companyName || '');
      })
      .catch(() => {});
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const startListening = () => {
    setErr(null);
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErr('Chrome/Edge mein mic se text ke liye Web Speech chahiye. Text type bhi kar sakte ho.');
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'hi-IN';
    rec.onresult = (event: any) => {
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += t + ' ';
      }
      if (finalChunk.trim()) {
        setText((prev) => `${prev} ${finalChunk}`.replace(/\s+/g, ' ').trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    setListening(false);
  };

  const submit = async () => {
    if (!token) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      if (listening) stopListening();
      const res = await fetch('/api/v1/company/work-talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          leadOrSite,
          locationLabel,
          talkType,
          employeeRole: 'employee',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      const delivered = (data.report?.deliveredTo || [])
        .map((d: any) => d.displayName || d.userId)
        .join(', ');
      setOk(`Owner / report desk tak pahunch gaya: ${delivered}`);
      setText('');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-3">
        <Mic className="w-8 h-8 mx-auto text-hs-600" />
        <h1 className="text-lg font-extrabold">Employee Field Talk</h1>
        <p className="text-sm text-slate-500">
          Working hours me baat capture karke owner tak bhejne ke liye Sign In karein.
        </p>
        <button className="btn-hs" type="button" onClick={() => onNavigate('/signin')}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-hs-600" />
            Field Talk → Text Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {companyName || 'Company'} · @{user?.userId} · baat text ban ke owner tak
          </p>
        </div>
        <div
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
            withinHours
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {withinHours ? 'Work hours active' : 'Outside work hours'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Talk type
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              value={talkType}
              onChange={(e) => setTalkType(e.target.value as TalkType)}
            >
              <option value="client_call">Client / lead call</option>
              <option value="site_visit">Site / project visit</option>
              <option value="team_huddle">Team huddle</option>
              <option value="field_note">Field note</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Lead / project / site
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                value={leadOrSite}
                onChange={(e) => setLeadOrSite(e.target.value)}
                placeholder="e.g. Palm Residency Tower B"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              Location label
            </label>
            <button
              type="button"
              onClick={() => void fillLocationFromGps()}
              disabled={geoBusy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              <MapPin className="w-3.5 h-3.5" />
              {geoBusy ? 'GPS…' : 'GPS → address'}
            </button>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g. Andheri site office"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              Talk text (Hindi / English / Hinglish)
            </label>
            <button
              type="button"
              onClick={() => (listening ? stopListening() : startListening())}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                listening
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {listening ? 'Stop mic' : 'Start mic → text'}
            </button>
          </div>
          <textarea
            className="w-full min-h-[160px] px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Client ne 2BHK Palm Residency ke liye site visit Monday 11 baje confirm kiya…"
          />
          {listening && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1 animate-pulse">
              Listening… bolo, text yahan aa raha hai.
            </p>
          )}
        </div>

        {err && (
          <div className="flex gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" /> {err}
          </div>
        )}
        {ok && (
          <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {ok}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-hs"
            disabled={busy || !text.trim()}
            onClick={() => void submit()}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to Owner & Report Desk
          </button>
          <button type="button" className="btn-hs-secondary" onClick={() => onNavigate('/inbox')}>
            Open inbox
          </button>
        </div>
      </div>
    </div>
  );
};
