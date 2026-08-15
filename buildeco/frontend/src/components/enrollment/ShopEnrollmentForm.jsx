import { Input } from "@/components/ui/input";
import LocationPicker from "@/components/location/LocationPicker";

const SHOP_TYPES = [
  { value: "material_store", en: "Material Store", hi: "सामग्री की दुकान" },
  { value: "hardware", en: "Hardware", hi: "हार्डवेयर" },
  { value: "steel_trader", en: "Steel Trader", hi: "स्टील व्यापारी" },
  { value: "cement_dealer", en: "Cement Dealer", hi: "सीमेंट डीलर" },
  { value: "solar_shop", en: "Solar Shop", hi: "सोलर शॉप" },
  { value: "general", en: "General", hi: "सामान्य" },
];

export default function ShopEnrollmentForm({ value, onChange, location, onLocationChange, lang = "en", t = (k) => k }) {
  const hi = lang === "hi";
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4" data-testid="shop-enrollment-form">
      <div>
        <h3 className="font-display font-bold text-lg">{t("shop_details")}</h3>
        <p className="text-xs text-muted-foreground">{t("shop_details_hint")}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("shop_name")}</label>
          <Input data-testid="shop-name" value={value.name} onChange={(e) => set("name", e.target.value)} className="rounded-lg" required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("shop_type")}</label>
          <select
            data-testid="shop-type"
            value={value.shop_type}
            onChange={(e) => set("shop_type", e.target.value)}
            className="w-full h-10 border border-input bg-background px-3 text-sm rounded-lg"
          >
            {SHOP_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{hi ? s.hi : s.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("business_type")}</label>
          <Input data-testid="shop-biz-type" value={value.business_type} onChange={(e) => set("business_type", e.target.value)} placeholder="Wholesale / Retail" className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("gst_number")}</label>
          <Input data-testid="shop-gst" value={value.gst_number} onChange={(e) => set("gst_number", e.target.value)} placeholder="22AAAAA0000A1Z5" className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("pan_number")}</label>
          <Input data-testid="shop-pan" value={value.pan_number} onChange={(e) => set("pan_number", e.target.value)} placeholder="ABCDE1234F" className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("shop_phone")}</label>
          <Input data-testid="shop-phone" value={value.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-lg" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("shop_email")}</label>
          <Input data-testid="shop-email" type="email" value={value.email} onChange={(e) => set("email", e.target.value)} className="rounded-lg" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("address_line")}</label>
          <Input data-testid="shop-address" value={value.address_line} onChange={(e) => set("address_line", e.target.value)} className="rounded-lg" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-1.5 block">{t("service_area")}</label>
          <LocationPicker
            pincodeFirst
            value={location}
            onChange={(loc) => {
              onLocationChange(loc);
              set("state", loc.state);
              set("city", loc.city);
              set("district", loc.district);
              set("pincode", loc.pincode);
            }}
          />
        </div>
      </div>
    </div>
  );
}
