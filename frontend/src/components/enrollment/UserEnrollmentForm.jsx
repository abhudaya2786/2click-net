import { Input } from "@/components/ui/input";
import LocationPicker from "@/components/location/LocationPicker";

export default function UserEnrollmentForm({ value, onChange, location, onLocationChange, showBusiness, t = (k) => k }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4" data-testid="user-enrollment-form">
      <div>
        <h3 className="font-display font-bold text-lg">{t("your_profile")}</h3>
        <p className="text-xs text-muted-foreground">{t("your_profile_hint")}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("full_name")}</label>
          <Input data-testid="enroll-name" value={value.name} onChange={(e) => set("name", e.target.value)} className="rounded-lg" required />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("phone")}</label>
          <Input data-testid="enroll-phone" value={value.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-lg" />
        </div>
        {showBusiness && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("company_name")}</label>
              <Input data-testid="enroll-company" value={value.company} onChange={(e) => set("company", e.target.value)} className="rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("business_type")}</label>
              <Input data-testid="enroll-biz-type" value={value.business_type} onChange={(e) => set("business_type", e.target.value)} className="rounded-lg" />
            </div>
          </>
        )}
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
              set("service_area", loc.location);
            }}
          />
        </div>
      </div>
    </div>
  );
}
