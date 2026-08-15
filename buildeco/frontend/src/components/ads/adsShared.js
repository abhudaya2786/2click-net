export const STATUS_STYLE = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-primary/10 text-primary",
  active: "bg-solar/10 text-solar",
  paused: "bg-amber-500/10 text-amber-600",
  rejected: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

export const STATUS_LABEL = {
  draft: "Draft · Unpaid",
  pending_approval: "Pending Approval",
  active: "Active",
  paused: "Paused",
  rejected: "Rejected",
  expired: "Expired",
};

export const inr = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
export const num = (v) => Number(v || 0).toLocaleString("en-IN");
