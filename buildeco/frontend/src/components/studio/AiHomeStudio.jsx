import { useCallback, useState } from "react";
import { Box, MapPinned } from "lucide-react";
import GpsLocator from "./GpsLocator";
import Studio3DViewer from "./Studio3DViewer";

export default function AiHomeStudio() {
  const [location, setLocation] = useState({
    ok: false,
    lat: null,
    lon: null,
    address: "",
    parsed: null,
    error: null,
  });

  const onLocationChange = useCallback((next) => {
    setLocation(next || {
      ok: false,
      lat: null,
      lon: null,
      address: "",
      parsed: null,
      error: null,
    });
  }, []);

  return (
    <section className="rounded-3xl border border-border bg-slate-50/80 p-4 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Box className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AI 3D Home Studio</p>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">GPS site + live 3D preview</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Nominatim reverse geocoding and a Three.js home canvas. Existing AI design tools stay on the default studio view.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GpsLocator onLocationChange={onLocationChange} />
        <Studio3DViewer
          latitude={location.lat}
          longitude={location.lon}
          address={location.address}
        />
      </div>

      {location.parsed?.city ? (
        <p className="mt-4 text-sm text-muted-foreground inline-flex items-center gap-2">
          <MapPinned className="h-4 w-4" />
          Site city: {location.parsed.city}
          {location.parsed.state ? `, ${location.parsed.state}` : ""}
          {location.parsed.pincode ? ` · ${location.parsed.pincode}` : ""}
        </p>
      ) : null}
    </section>
  );
}
