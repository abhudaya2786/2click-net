import { ShieldCheck, BadgeCheck, MapPin, Building2 } from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, label: "GST Ready" },
  { icon: ShieldCheck, label: "ISO 27001" },
  { icon: MapPin, label: "Made in India" },
  { icon: Building2, label: "Enterprise RBAC" },
];

export default function TrustBadges({ className = "" }) {
  return (
    <div data-testid="trust-badges" className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
      {BADGES.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5 text-primary/80" strokeWidth={1.75} />
          {label}
        </span>
      ))}
    </div>
  );
}
