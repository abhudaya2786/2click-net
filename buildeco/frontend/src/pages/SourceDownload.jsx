import { Link } from "react-router-dom";
import { Download, FileArchive, Github, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { GITHUB_REPO, SOURCE_ZIP_LATEST, SOURCE_ZIP_MAIN, SOURCE_ZIP_BRANCH_NAME } from "@/lib/sourceZip";

export default function SourceDownload() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white mb-4">
          <FileArchive className="h-8 w-8" />
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">
          {hi ? "पूरा सोर्स कोड ZIP" : "Download full source ZIP"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {hi
            ? "BuildEco (buildecogroup.com) + 2Click पूरा GitHub repo ZIP में। node_modules शामिल नहीं — अनज़िप के बाद npm install चलाएँ।"
            : "Full GitHub repo for BuildEco (buildecogroup.com) plus 2Click as a ZIP. Unzip, then run npm install in each frontend folder."}
        </p>
      </div>

      <div className="space-y-4">
        <section className="border border-border rounded-xl p-5 bg-card">
          <h2 className="font-display font-bold text-lg">
            {hi ? "यह ब्रांच (ZIP डाउनलोड पेज सहित)" : "This branch (includes ZIP download page)"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{SOURCE_ZIP_BRANCH_NAME}</p>
          <Button className="mt-4 w-full sm:w-auto" asChild>
            <a href={SOURCE_ZIP_LATEST} data-testid="source-zip-latest">
              <Download className="h-4 w-4 mr-2" />
              {hi ? "ZIP डाउनलोड करें" : "Download ZIP"}
            </a>
          </Button>
        </section>

        <section className="border border-border rounded-xl p-5 bg-card">
          <h2 className="font-display font-bold text-lg">{hi ? "main ब्रांच" : "main branch"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {hi ? "GitHub पर मर्ज किया हुआ स्टेबल कोड" : "Merged stable code on GitHub"}
          </p>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
            <a href={SOURCE_ZIP_MAIN} data-testid="source-zip-main">
              <Download className="h-4 w-4 mr-2" />
              {hi ? "main ZIP" : "Download main ZIP"}
            </a>
          </Button>
        </section>

        <section className="border border-border rounded-xl p-5 bg-card text-sm text-muted-foreground space-y-2">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <HardHat className="h-4 w-4 text-primary" />
            {hi ? "अनज़िप के बाद" : "After unzip"}
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>buildeco/frontend → <code className="text-xs">npm install && npm start</code></li>
            <li>buildeco/backend → Python venv + <code className="text-xs">uvicorn server:app --reload --port 8001</code></li>
            <li>
              {hi ? "साइट रूट 2Click Voice MoM है; BuildEco फोल्डर " : "Repo root is 2Click Voice MoM; BuildEco lives in "}
              <code className="text-xs">buildeco/</code>
            </li>
          </ol>
          <a href={GITHUB_REPO} className="inline-flex items-center gap-1 text-primary hover:underline" target="_blank" rel="noreferrer">
            <Github className="h-4 w-4" /> {GITHUB_REPO.replace("https://", "")}
          </a>
        </section>
      </div>

      <p className="text-center mt-8">
        <Link to="/" className="text-sm text-primary hover:underline">{hi ? "होम" : "Home"}</Link>
        {" · "}
        <Link to="/download-app" className="text-sm text-primary hover:underline">{hi ? "ऐप डाउनलोड" : "App download"}</Link>
      </p>
    </div>
  );
}
