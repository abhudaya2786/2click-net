import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, Download, FileSpreadsheet } from "lucide-react";

const A = "/admin";

export default function GeoPincodeManager() {
  const [summary, setSummary] = useState({ total: 0, by_state: [] });
  const [filter, setFilter] = useState({ state: "", city: "", district: "" });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pinForm, setPinForm] = useState({ pincode: "", state: "", city: "", district: "", lat: "", lng: "" });
  const [jsonPaste, setJsonPaste] = useState("");

  const loadSummary = () =>
    api.get(`${A}/geo/summary`).then(({ data }) => setSummary(data)).catch(() => {});

  const loadStates = () =>
    api.get("/geo/states").then(({ data }) => setStates(data.states || [])).catch(() => {});

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter.state) params.state = filter.state;
      if (filter.city) params.city = filter.city;
      if (filter.district) params.district = filter.district;
      const { data } = await api.get(`${A}/geo/pincodes`, { params });
      setRows(data.pincodes || []);
      setTotal(data.total || 0);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadSummary();
    loadStates();
  }, []);

  useEffect(() => {
    if (!filter.state) {
      setDistricts([]);
      setCities([]);
      return;
    }
    api.get("/geo/districts", { params: { state: filter.state } })
      .then(({ data }) => setDistricts(data.districts || []))
      .catch(() => setDistricts([]));
    const params = { state: filter.state };
    if (filter.district) params.district = filter.district;
    api.get("/geo/cities", { params })
      .then(({ data }) => setCities(data.cities || []))
      .catch(() => setCities([]));
  }, [filter.state, filter.district]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const addOne = async () => {
    try {
      await api.post(`${A}/geo/pincodes`, {
        ...pinForm,
        lat: parseFloat(pinForm.lat) || 0,
        lng: parseFloat(pinForm.lng) || 0,
      });
      toast.success("Pincode added");
      setPinForm({ pincode: "", state: "", city: "", district: "", lat: "", lng: "" });
      loadSummary();
      loadList();
    } catch {
      toast.error("Invalid pincode row");
    }
  };

  const uploadCsv = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post(`${A}/geo/pincodes/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Imported ${data.imported} pincodes (${data.skipped} skipped)`);
      loadSummary();
      loadList();
      loadStates();
    } catch {
      toast.error("CSV upload failed — check headers: pincode,state,city,district,lat,lng");
    } finally {
      setUploading(false);
    }
  };

  const uploadJson = async () => {
    try {
      const parsed = JSON.parse(jsonPaste);
      const rowsPayload = Array.isArray(parsed) ? parsed : parsed.rows || parsed.pincodes;
      if (!Array.isArray(rowsPayload) || !rowsPayload.length) {
        toast.error("JSON must be an array of pincode rows");
        return;
      }
      setUploading(true);
      const { data } = await api.post(`${A}/geo/pincodes/bulk`, { rows: rowsPayload });
      toast.success(`Imported ${data.imported} pincodes (${data.skipped} skipped)`);
      setJsonPaste("");
      loadSummary();
      loadList();
      loadStates();
    } catch {
      toast.error("Invalid JSON bulk upload");
    } finally {
      setUploading(false);
    }
  };

  const templateCsv = `pincode,state,city,district,lat,lng
400001,Maharashtra,Mumbai,Mumbai,18.9388,72.8354
411001,Maharashtra,Pune,Pune,18.5204,73.8567
110001,Delhi,New Delhi,Central Delhi,28.6139,77.2090
`;

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pincodes_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Pincode master ({summary.total} total)</p>
          <p className="text-xs text-muted-foreground">
            Upload state / district / city wise lists. Enrollment uses pincode to auto-fill location.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5 mr-1" /> CSV template
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-border p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> CSV upload
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Columns: pincode, state, city, district, lat, lng. Upload full state or district sheets.
          </p>
          <Input
            type="file"
            accept=".csv,text/csv"
            className="rounded-none text-xs"
            disabled={uploading}
            onChange={(e) => uploadCsv(e.target.files?.[0])}
          />
          {uploading && <p className="text-xs flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
        </div>

        <div className="border border-border p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" /> JSON bulk paste
          </h4>
          <textarea
            className="w-full min-h-[88px] border border-input px-2 py-1.5 text-xs font-mono"
            placeholder='[{"pincode":"400001","state":"Maharashtra","city":"Mumbai","district":"Mumbai"}]'
            value={jsonPaste}
            onChange={(e) => setJsonPaste(e.target.value)}
          />
          <Button type="button" size="sm" className="rounded-none" disabled={uploading} onClick={uploadJson}>
            Import JSON
          </Button>
        </div>
      </div>

      <div className="border border-border p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide">Add single pincode</h4>
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Input placeholder="Pincode" value={pinForm.pincode} onChange={(e) => setPinForm({ ...pinForm, pincode: e.target.value })} className="rounded-none" />
          <Input placeholder="State" value={pinForm.state} onChange={(e) => setPinForm({ ...pinForm, state: e.target.value })} className="rounded-none" />
          <Input placeholder="District" value={pinForm.district} onChange={(e) => setPinForm({ ...pinForm, district: e.target.value })} className="rounded-none" />
          <Input placeholder="City" value={pinForm.city} onChange={(e) => setPinForm({ ...pinForm, city: e.target.value })} className="rounded-none" />
          <Input placeholder="Lat" value={pinForm.lat} onChange={(e) => setPinForm({ ...pinForm, lat: e.target.value })} className="rounded-none" />
          <Input placeholder="Lng" value={pinForm.lng} onChange={(e) => setPinForm({ ...pinForm, lng: e.target.value })} className="rounded-none" />
        </div>
        <Button onClick={addOne} className="rounded-none" size="sm">Add pincode</Button>
      </div>

      {summary.by_state?.length > 0 && (
        <div className="border border-border overflow-hidden">
          <div className="px-3 py-2 bg-muted/40 text-xs font-medium">State-wise counts</div>
          <div className="max-h-32 overflow-y-auto text-xs font-mono">
            {summary.by_state.map((s) => (
              <button
                key={s.state}
                type="button"
                className="block w-full text-left px-3 py-1 hover:bg-accent border-b border-border/40 last:border-0"
                onClick={() => setFilter({ state: s.state, city: "", district: "" })}
              >
                {s.state}: {s.count} pincodes · {s.districts} districts · {s.cities} cities
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid sm:grid-cols-4 gap-2">
          <select
            value={filter.state}
            onChange={(e) => setFilter({ state: e.target.value, city: "", district: "" })}
            className="h-9 border px-2 text-sm"
          >
            <option value="">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filter.district}
            onChange={(e) => setFilter({ ...filter, district: e.target.value, city: "" })}
            disabled={!filter.state}
            className="h-9 border px-2 text-sm disabled:opacity-50"
          >
            <option value="">All districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filter.city}
            onChange={(e) => setFilter({ ...filter, city: e.target.value })}
            disabled={!filter.state}
            className="h-9 border px-2 text-sm disabled:opacity-50"
          >
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={() => setFilter({ state: "", city: "", district: "" })}>
            Clear filters
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {rows.length} of {total}
          {loading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
        </div>

        <div className="border border-border max-h-64 overflow-y-auto text-xs font-mono">
          {rows.map((r) => (
            <div key={r.pincode} className="px-3 py-1.5 border-b border-border/40 flex justify-between gap-2">
              <span className="font-semibold">{r.pincode}</span>
              <span className="text-muted-foreground truncate">{r.state} · {r.district} · {r.city}</span>
            </div>
          ))}
          {!loading && rows.length === 0 && (
            <p className="px-3 py-4 text-muted-foreground">No pincodes — upload a CSV or add manually.</p>
          )}
        </div>
      </div>
    </div>
  );
}
