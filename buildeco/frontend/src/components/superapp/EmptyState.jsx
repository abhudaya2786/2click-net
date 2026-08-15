import { Button } from "@/components/ui/button";
import { Loader2, Inbox, WifiOff, AlertCircle } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  variant = "empty",
}) {
  const VIcon = variant === "error" ? AlertCircle : variant === "network" ? WifiOff : Icon;
  return (
    <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-border bg-muted/20">
      <VIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" strokeWidth={1.25} />
      <h3 className="font-display font-bold text-lg">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5 rounded-xl" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted/60" />
      ))}
    </div>
  );
}
