import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { END_TO_END_WORKFLOW } from "@/lib/platformScreenArchitecture";

/**
 * ASCII end-to-end workflow diagram for platform guide.
 */
export default function EndToEndWorkflowDiagram() {
  const { lang } = useLang();
  const hi = lang === "hi";

  const diagram = hi
    ? `
[ चरण 1: BuildEco बिल्डर ]
           │
           ▼
[ चरण 2: प्रॉपर्टी प्रोफ़ाइलिंग ]
           │
           ├───► [ लागत कैलकुलेटर ] ───► BOQ और सामग्री
           │
           ├───► [ AI डिज़ाइन स्टूडियो ] ──► 3D रेंडर और फ्लोर प्लान
           │
           └───► [ पेशेवर पोर्टल ] ─────► वास्तुकार और ठेकेदार मिलान
                                                       │
                                                       ▼
                                            [ कंस्ट्रक्शन स्टोर चेकआउट ]
`
    : `
[ Step 1: BuildEco Builder ]
           │
           ▼
[ Step 2: Property Profiling ]
           │
           ├───► [ Cost Calculator ] ───► BOQ & Material Breakdown
           │
           ├───► [ AI Design Studio ] ──► 3D Renders & Floor Plans
           │
           └───► [ Professionals Portal ] ► Architect & Contractor Match
                                                       │
                                                       ▼
                                            [ Construction Store Checkout ]
`;

  const nodes = hi ? END_TO_END_WORKFLOW.nodesHi : END_TO_END_WORKFLOW.nodesEn;

  return (
    <div className="space-y-4">
      <pre
        className="text-xs font-mono bg-muted/40 border border-border/60 rounded-2xl p-5 overflow-x-auto leading-relaxed text-muted-foreground"
        data-testid="e2e-workflow-diagram"
      >
        {diagram.trim()}
      </pre>
      <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
        {nodes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 text-xs">
        <Link to="/build" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "बिल्डर शुरू करें" : "Start builder"}
        </Link>
        <Link to="/estimate" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "कैलकुलेटर" : "Calculator"}
        </Link>
        <Link to="/design" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "डिज़ाइन" : "Design"}
        </Link>
        <Link to="/projects" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "डैशबोर्ड" : "Dashboard"}
        </Link>
        <Link to="/store" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "स्टोर" : "Store"}
        </Link>
        <Link to="/professionals" className="px-3 py-1.5 rounded-full border border-border hover:border-primary text-primary">
          {hi ? "पेशेवर" : "Professionals"}
        </Link>
      </div>
    </div>
  );
}
