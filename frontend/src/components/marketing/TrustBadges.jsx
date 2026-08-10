import { ShieldCheck, BadgeCheck, MapPin, Building2 } from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, label: "GST Ready" },
  { icon: ShieldCheck, label: "ISO 27001" },
  { icon: MapPin, label: "Made in India" },
  { icon: Building2, label: "Enterprise RBAC" },
];

export default function TrustBadges({ className = "" }) {
  return (
    <div data-testid="trust-badges" className={`flex flex-wrap gap-2 ${className}`}>
      {BADGES.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground border border-border bg-card/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm"
        >
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          {label}
        </span>
      ))}
    </div>
  );
}
