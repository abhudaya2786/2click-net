import { useState } from "react";
import InteriorBOQHub from "@/components/dashboard/InteriorBOQHub";
import VerticalCategoryCalculator from "@/components/dashboard/VerticalCategoryCalculator";

/** Dashboard: hub of category calculators or single vertical calculator */
export default function InteriorBOQCalculator() {
  const [activeVid, setActiveVid] = useState(null);

  if (activeVid) {
    return (
      <VerticalCategoryCalculator
        verticalId={activeVid}
        embedded
        onBack={() => setActiveVid(null)}
      />
    );
  }

  return <InteriorBOQHub onSelect={setActiveVid} />;
}
