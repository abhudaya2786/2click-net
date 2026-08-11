import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import {
  WORK_TYPES,
  FUNCTION_CATALOG,
  PLATFORM_OPTIONS,
  DASHBOARD_BY_ROLE,
  NAV_QUICK_MAP,
} from "@/lib/platformCompleteGuide";
import { ArrowRight } from "lucide-react";

export default function PlatformCompleteReference() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className="space-y-12" data-testid="platform-complete-reference">
      {/* Types of work */}
      <section>
        <h2 className="font-display font-bold text-xl mb-2">
          {hi ? "प्रकार की कार्य (Types of work)" : "Types of work on 2click.in"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {hi
            ? "प्लेटफ़ॉर्म पर उपलब्ध सभी निर्माण, खरीद, डिज़ाइन और मार्केटप्लेस कार्य।"
            : "Every construction, procurement, design, and marketplace workflow the platform supports."}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {WORK_TYPES.map((w) => (
            <div key={w.id} className="glass-card rounded-xl p-4 border border-border/60">
              <h3 className="font-display font-bold text-sm">{hi ? w.hi : w.en}</h3>
              <p className="text-xs text-muted-foreground mt-1">{hi ? w.optionsHi : w.optionsEn}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {w.paths.map((p) => (
                  <Link
                    key={p}
                    to={p}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border hover:border-primary text-primary"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Options matrix */}
      <section className="glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "विकल्प और सेटिंग्स (Options)" : "Options & settings"}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground mb-2">
              {hi ? "प्रोजेक्ट प्रकार (Build)" : "Project types (Build)"}
            </p>
            <ul className="space-y-1">
              {PLATFORM_OPTIONS.projectTypes.map((o) => (
                <li key={o.id} className="text-muted-foreground">· {hi ? o.hi : o.en}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground mb-2">
              {hi ? "पहचान (Persona)" : "Personas"}
            </p>
            <ul className="space-y-1">
              {PLATFORM_OPTIONS.personas.map((o) => (
                <li key={o.id} className="text-muted-foreground">· {hi ? o.hi : o.en}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground mb-2">
              {hi ? "प्रॉपर्टी प्रकार" : "Property subtypes"}
            </p>
            <ul className="space-y-1">
              {PLATFORM_OPTIONS.propertySubtypes.map((o) => (
                <li key={o.id} className="text-muted-foreground">· {hi ? o.hi : o.en}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-muted-foreground mb-2">
              {hi ? "गुणवत्ता स्तर" : "Quality tiers"}
            </p>
            <ul className="space-y-1">
              {PLATFORM_OPTIONS.qualityTiers.map((o) => (
                <li key={o.id} className="text-muted-foreground">
                  · {hi ? o.hi : o.en}
                </li>
              ))}
              {PLATFORM_OPTIONS.estimateQualities.filter((q) => !PLATFORM_OPTIONS.qualityTiers.find((t) => t.id === q.id)).map((o) => (
                <li key={o.id} className="text-muted-foreground">· {hi ? o.hi : o.en} (estimate)</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-mono uppercase text-muted-foreground mb-2">
              {hi ? "पंजीकरण उपयोगकर्ता प्रकार" : "Enrollment user types"}
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.enrollmentUserTypes.map((u) => (
                <span key={u.code} className="text-xs px-2 py-1 rounded-full bg-muted border border-border">
                  {u.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Function catalog */}
      <section>
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "पूर्ण फ़ंक्शन कैटलॉग" : "Complete function catalog"}
        </h2>
        <div className="space-y-8">
          {FUNCTION_CATALOG.map((cat) => (
            <div key={cat.categoryEn}>
              <h3 className="font-display font-semibold text-base mb-3 text-primary">
                {hi ? cat.categoryHi : cat.categoryEn}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/60 p-4 bg-card/50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <Link to={item.path} className="font-display font-bold text-sm hover:text-primary">
                          {hi ? item.nameHi : item.nameEn}
                        </Link>
                        <p className="text-[10px] font-mono text-muted-foreground">{item.path}</p>
                      </div>
                      <Link to={item.path} className="text-xs text-primary inline-flex items-center gap-1 shrink-0">
                        {hi ? "खोलें" : "Open"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{hi ? "किसके लिए:" : "For:"}</span>{' '}
                      {hi ? item.forHi : item.forEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{hi ? "विकल्प:" : "Options:"}</span>{' '}
                      {hi ? item.optionsHi : item.optionsEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{hi ? "क्लिक फ्लो:" : "Click flow:"}</span>{' '}
                      {hi ? item.clicksHi : item.clicksEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboards */}
      <section className="glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "लॉगिन के बाद डैशबोर्ड" : "Dashboards after login"}
        </h2>
        <div className="space-y-3">
          {DASHBOARD_BY_ROLE.map((d) => (
            <div key={d.roleEn} className="flex flex-wrap gap-x-4 gap-y-1 text-sm border-b border-border/40 pb-3 last:border-0">
              <span className="font-medium min-w-[140px]">{hi ? d.roleHi : d.roleEn}</span>
              <Link to={d.path} className="text-primary font-mono text-xs">{d.path}</Link>
              <span className="text-muted-foreground text-xs flex-1">{hi ? d.panelHi : d.panelEn}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Nav capability quick map */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">
          {hi ? "मुख्य नेव विकल्प → क्षमता" : "Main nav → capability map"}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">{hi ? "नेव" : "Nav"}</th>
                <th className="text-left p-3">{hi ? "क्षमता" : "Capability"}</th>
                <th className="text-left p-3">{hi ? "लॉजिक" : "Logic"}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {NAV_QUICK_MAP.map((row) => (
                <tr key={row.path} className="border-t border-border/40">
                  <td className="p-3 font-medium">{hi ? row.navHi : row.nav}</td>
                  <td className="p-3 text-muted-foreground">{row.capability}</td>
                  <td className="p-3 text-xs text-muted-foreground">{row.logic}</td>
                  <td className="p-3">
                    <Link to={row.path} className="text-primary text-xs hover:underline">
                      {row.path}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
