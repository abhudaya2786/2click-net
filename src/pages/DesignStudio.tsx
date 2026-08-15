import { useState } from 'react';
import { Box } from 'lucide-react';
import { GpsLocatorPanel } from '../components/designStudio/GpsLocatorPanel';
import { HomePreview3D } from '../components/designStudio/HomePreview3D';
import { ReverseGeocodeResult } from '../utils/geoCoder';

/** Smart Property & Home Designer — GPS + 3D preview. Isolated from MoM UI. */
export function DesignStudioPage() {
  const [location, setLocation] = useState<ReverseGeocodeResult | null>(null);

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-[#00baf2]/10 text-[#00baf2] grid place-items-center">
          <Box className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Smart Property & Home Designer</p>
          <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">AI 3D Home Studio</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Nominatim reverse geocoding (English labels) plus a 3D home preview. Existing Voice MoM screens are unchanged.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GpsLocatorPanel onLocationChange={setLocation} />
        <HomePreview3D
          latitude={location?.lat}
          longitude={location?.lon}
          address={location?.displayName}
        />
      </div>
    </section>
  );
}

export default DesignStudioPage;
