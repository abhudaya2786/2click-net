/** Simple 2D floor-plan preview — unlockable layers per step */
const ROOMS = [
  { id: "living", label: "Living", x: 10, y: 10, w: 45, h: 35 },
  { id: "kitchen", label: "Kitchen", x: 58, y: 10, w: 32, h: 25 },
  { id: "bed1", label: "Bed 1", x: 10, y: 50, w: 35, h: 40 },
  { id: "bed2", label: "Bed 2", x: 48, y: 50, w: 42, h: 40 },
];

const LAYER_COLORS = {
  layout_basic: "#C87941",
  layout_boq: "#10B981",
  layout_3d: "#3B82F6",
  layout_electrical: "#F59E0B",
  layout_plumbing: "#06B6D4",
  layout_interior: "#8B5CF6",
};

export default function LayoutViewer({ activeStep = "layout_basic", unlocked = [], segment = "new_home" }) {
  const showElectrical = unlocked.includes("layout_electrical") || activeStep === "layout_electrical";
  const showPlumbing = unlocked.includes("layout_plumbing") || activeStep === "layout_plumbing";
  const showInterior = unlocked.includes("layout_interior") || activeStep === "layout_interior";
  const is3d = unlocked.includes("layout_3d") || activeStep === "layout_3d";

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {is3d ? "3D Preview" : "2D Naksha"} · {segment.replace("_", " ")}
        </span>
        <span className="text-[10px] text-primary font-mono">{activeStep.replace("layout_", "").toUpperCase()}</span>
      </div>
      <svg viewBox="0 0 100 100" className={`w-full max-w-md mx-auto aspect-square ${is3d ? "drop-shadow-lg" : ""}`}
        style={is3d ? { transform: "perspective(400px) rotateX(12deg)", transformOrigin: "center" } : {}}>
        <rect x="2" y="2" width="96" height="96" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
        {ROOMS.map((r) => (
          <g key={r.id}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h}
              fill={LAYER_COLORS.layout_basic + "22"}
              stroke={LAYER_COLORS.layout_basic} strokeWidth="0.6" rx="1" />
            <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" dominantBaseline="middle"
              fontSize="3.5" fill="#334155" fontFamily="system-ui">{r.label}</text>
          </g>
        ))}
        {showElectrical && (
          <g stroke="#F59E0B" strokeWidth="0.4" fill="none">
            <line x1="15" y1="15" x2="85" y2="15" strokeDasharray="2,1" />
            <line x1="15" y1="55" x2="85" y2="55" strokeDasharray="2,1" />
            <circle cx="20" cy="20" r="1.5" fill="#F59E0B" />
            <circle cx="70" cy="60" r="1.5" fill="#F59E0B" />
          </g>
        )}
        {showPlumbing && (
          <g stroke="#06B6D4" strokeWidth="0.5">
            <line x1="65" y1="12" x2="65" y2="35" />
            <line x1="30" y1="88" x2="55" y2="88" />
          </g>
        )}
        {showInterior && (
          <g fill="#8B5CF622" stroke="#8B5CF6" strokeWidth="0.3">
            <rect x="12" y="52" width="12" height="8" rx="0.5" />
            <rect x="50" y="52" width="12" height="8" rx="0.5" />
          </g>
        )}
      </svg>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        {unlocked.length <= 1 ? "पहला layout मुफ़्त है — अगले maps unlock करें" : `${unlocked.length} layers unlocked`}
      </p>
    </div>
  );
}
