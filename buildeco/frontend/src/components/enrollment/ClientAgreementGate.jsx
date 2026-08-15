import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import AgreementPanel from "@/components/enrollment/AgreementPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Gate freelancer enquiries until client agreement is accepted */
export default function ClientAgreementGate({ open, onOpenChange, onAccepted }) {
  const { lang, t } = useLang();
  const hi = lang === "hi";
  const [agreement, setAgreement] = useState(null);
  const [accepted, setAccepted] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get("/enrollment/agreements/client_agreement")
      .then(({ data }) => setAgreement(data))
      .catch(() => setAgreement(null));
    setAccepted({});
  }, [open]);

  const confirm = async () => {
    if (!accepted.client_agreement) {
      toast.error(t("accept_all_agreements"));
      return;
    }
    setBusy(true);
    try {
      await api.post("/enrollment/accept", { agreement_code: "client_agreement", enrollment_mode: "user" });
      toast.success(hi ? "क्लाइंट समझौता स्वीकृत" : "Client agreement accepted");
      onAccepted?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{hi ? "क्लाइंट समझौता" : "Client agreement"}</DialogTitle>
        </DialogHeader>
        {agreement ? (
          <AgreementPanel
            agreements={[agreement]}
            accepted={accepted}
            onToggle={(code) => setAccepted((a) => ({ ...a, [code]: !a[code] }))}
            lang={lang}
            t={t}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t("loading_agreements")}</p>
        )}
        <p className="text-xs text-muted-foreground">
          <Link to="/client-agreement" className="text-primary hover:underline" target="_blank" rel="noreferrer">
            {hi ? "पूरा समझौता पढ़ें" : "Read full agreement"}
          </Link>
        </p>
        <DialogFooter>
          <Button onClick={confirm} disabled={busy || !agreement} className="rounded-none w-full sm:w-auto">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (hi ? "स्वीकार करें और जारी रखें" : "Accept and continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
