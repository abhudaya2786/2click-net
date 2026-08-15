import LayoutViewer from "@/components/homebuild/LayoutViewer";

/** 3D home preview canvas (isometric floor plan). */
export default function House3D({ locationLabel = "", segment = "new_home", builtUpSqft = 0 }) {
  return (
    <div className="h-full min-h-[420px] rounded-xl bg-muted/40 p-3 border border-border/60" data-testid="house-3d">
      <p className="text-xs text-muted-foreground mb-2" data-testid="house-3d-location">
        {[locationLabel, builtUpSqft ? `${builtUpSqft} sqft` : ""].filter(Boolean).join(" · ") || "3D preview"}
      </p>
      <LayoutViewer activeStep="layout_3d" unlocked={["layout_basic", "layout_3d"]} segment={segment} />
    </div>
  );
}
