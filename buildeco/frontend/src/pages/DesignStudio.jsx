import { useState } from "react";
import PageSEO from "@/components/marketing/PageSEO";
import Ai3dHomeStudio from "@/components/design/Ai3dHomeStudio";
import LocationSelector from "@/components/LocationSelector";
import GpsTracker from "@/components/GpsTracker";
import House3D from "@/components/House3D";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Sparkles } from "lucide-react";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { CORE_PLATFORM_SCREENS } from "@/lib/platformScreenArchitecture";
import { formatLiveAddress } from "@/lib/nominatim";

export default function DesignStudio() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const hi = lang === "hi";
  const screenMeta = CORE_PLATFORM_SCREENS.find((s) => s.id === "design");
  const [location, setLocation] = useState({
    state: "", city: "", district: "", pincode: "", lat: null, lng: null, location: "", display_name: "",
  });
  const [userAddress, setUserAddress] = useState("");

  const applyLocation = (next) => {
    setLocation(next);
    setUserAddress(formatLiveAddress(next) || next.location || "");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title={hi ? "Smart Property & Home Designer — buildecogroup.com" : "Smart Property & Home Designer — buildecogroup.com"}
        description={hi
          ? "लोकेशन चुनें या GPS से पता लें, फिर 3D होम डिज़ाइन देखें"
          : "Pick a location or use GPS, then view your 3D home design"}
        path="/design"
      />
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.nav.design}</p>
      </div>
      <h1 className="font-display font-extrabold text-3xl tracking-tight">
        {hi ? "Smart Property & Home Designer" : "Smart Property & Home Designer"}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {hi
          ? "राज्य/शहर चुनें या GPS से लाइव पता लें — दाईं ओर 3D होम प्रीव्यू।"
          : "Select state and city, or fetch live GPS — 3D home preview on the right."}
      </p>

      {screenMeta && (
        <div className="mt-6">
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-6">
        <div className="flex-1 min-w-[280px] space-y-4">
          <h3 className="font-display font-bold text-lg">
            {hi ? "1. अपनी लोकेशन चुनें" : "1. Select Your Location"}
          </h3>
          <LocationSelector value={location} onChange={applyLocation} />

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {hi ? "या" : "OR"}
          </p>

          <GpsTracker
            onLocationFound={(address, loc) => {
              setUserAddress(address);
              if (loc) {
                setLocation((prev) => ({
                  ...prev,
                  ...loc,
                  location: address,
                }));
              }
            }}
          />

          {userAddress && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300" data-testid="live-location-banner">
              <strong>{hi ? "आपकी लाइव लोकेशन:" : "Your Live Location:"}</strong> {userAddress}
            </div>
          )}
        </div>

        <div className="flex-[2] min-w-[320px]">
          <h3 className="font-display font-bold text-lg mb-3">
            {hi ? "2. अपना 3D होम डिज़ाइन देखें" : "2. View Your 3D Home Design"}
          </h3>
          <House3D locationLabel={userAddress} />
        </div>
      </div>

      <div className="mt-12">
        <Ai3dHomeStudio locationHint={userAddress} />
      </div>
    </div>
  );
}
