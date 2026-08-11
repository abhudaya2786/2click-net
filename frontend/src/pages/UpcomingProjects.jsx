import UpcomingProjectsBlock from "@/components/marketing/UpcomingProjectsBlock";
import PageSEO from "@/components/marketing/PageSEO";
import { useLang } from "@/context/LanguageContext";
import { Link } from "react-router-dom";

export default function UpcomingProjects() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title={hi ? "आगामी प्रोजेक्ट" : "Upcoming projects"}
        description={hi
          ? "2click.in पर राज्य, शहर, BHK, बजट और ज़रूरतों के हिसाब से आगामी प्लॉट, विला और अपार्टमेंट प्रोजेक्ट।"
          : "Browse upcoming plots, villas and apartments on 2click.in by state, city, BHK, budget and requirements."}
        path="/upcoming-projects"
        keywords="upcoming housing projects India, plots by city, new apartment launch, township pre-launch"
      />
      <UpcomingProjectsBlock compact={false} showFilters />

      <section className="mt-12 p-6 border border-border rounded-xl bg-secondary/20">
        <h3 className="font-display font-bold text-lg">
          {hi ? "प्रोजेक्ट में दिलचस्प?" : "Interested in a project?"}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          {hi
            ? "पंजीकरण करें, कंसल्टेंट से बात करें या टेंडर/BOQ के लिए प्लेटफ़ॉर्म का उपयोग करें।"
            : "Register for details, talk to a consultant, or use tenders and BOQ tools on the platform."}
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link to="/register" className="text-sm text-primary hover:underline">{hi ? "पंजीकरण →" : "Sign up →"}</Link>
          <Link to="/consultants" className="text-sm text-primary hover:underline">{hi ? "कंसल्टेंट →" : "Consultants →"}</Link>
          <Link to="/tenders" className="text-sm text-primary hover:underline">{hi ? "टेंडर →" : "Tenders →"}</Link>
          <Link to="/boq-builder" className="text-sm text-primary hover:underline">{hi ? "BOQ बिल्डर →" : "BOQ builder →"}</Link>
        </div>
      </section>
    </div>
  );
}
