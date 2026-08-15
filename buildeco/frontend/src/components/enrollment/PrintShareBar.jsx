import { Printer, Copy, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { openWhatsAppShare } from "@/lib/whatsapp";
import { copyToClipboard, shareViaEmail, printHtml } from "@/lib/printShare";

export default function PrintShareBar({
  onPrint,
  printTitle,
  printHtmlBody,
  shareText,
  shareUrl,
  emailSubject,
  t = (k) => k,
  className = "",
  size = "sm",
}) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    if (printHtmlBody && printTitle) {
      const ok = printHtml(printTitle, printHtmlBody);
      if (!ok) toast.error(t("print_popup_blocked"));
    }
  };

  const handleCopy = async () => {
    const text = [shareText, shareUrl].filter(Boolean).join("\n\n");
    if (!text) return;
    await copyToClipboard(text);
    toast.success(t("copied"));
  };

  const handleWhatsApp = () => {
    const text = [shareText, shareUrl].filter(Boolean).join("\n\n");
    if (text) openWhatsAppShare(text);
  };

  const handleEmail = () => {
    shareViaEmail(emailSubject || "buildecogroup.com", [shareText, shareUrl].filter(Boolean).join("\n\n"));
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} data-testid="print-share-bar">
      <Button type="button" variant="outline" size={size} className="rounded-lg gap-1.5" onClick={handlePrint} data-testid="btn-print">
        <Printer className="h-3.5 w-3.5" />{t("print")}
      </Button>
      <Button type="button" variant="outline" size={size} className="rounded-lg gap-1.5" onClick={handleWhatsApp} data-testid="btn-share-whatsapp">
        <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />{t("share_whatsapp")}
      </Button>
      <Button type="button" variant="outline" size={size} className="rounded-lg gap-1.5" onClick={handleCopy} data-testid="btn-share-copy">
        <Copy className="h-3.5 w-3.5" />{t("copy")}
      </Button>
      <Button type="button" variant="outline" size={size} className="rounded-lg gap-1.5" onClick={handleEmail} data-testid="btn-share-email">
        <Mail className="h-3.5 w-3.5" />{t("share_email")}
      </Button>
    </div>
  );
}
