import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsAppShare } from "@/lib/whatsapp";

export default function WhatsAppShare({ message, label = "WhatsApp पर शेयर करें", className = "", variant = "outline", size = "default" }) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      data-testid="whatsapp-share"
      className={`rounded-none gap-2 ${className}`}
      onClick={() => openWhatsAppShare(message)}
    >
      <MessageCircle className="h-4 w-4 text-[#25D366]" />
      {label}
    </Button>
  );
}
