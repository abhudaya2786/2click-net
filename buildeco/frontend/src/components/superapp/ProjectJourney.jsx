export function ProjectJourneyTimeline({ stages = [], lang = "en" }) {
  if (!stages.length) return null;
  return (
    <div className="space-y-2">
      {stages.map((st) => (
        <div
          key={st.id}
          className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/80 px-4 py-3"
        >
          <div className="w-10 text-center font-mono text-xs text-muted-foreground">{st.order || ""}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{lang === "hi" ? st.label_hi || st.label : st.label}</p>
            <p className="text-xs text-muted-foreground">
              {st.status} · {st.progress_pct || 0}% · ₹{st.estimated_cost?.toLocaleString("en-IN") || 0}
            </p>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            st.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {st.status}
          </span>
        </div>
      ))}
    </div>
  );
}
