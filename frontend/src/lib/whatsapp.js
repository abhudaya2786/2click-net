/** buildecogroup.com sales / support WhatsApp (India, no + prefix in wa.me path). */
export const WHATSAPP_NUMBER = "917007254932";

export function buildWhatsAppUrl(message) {
  const text = (message || "").trim();
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppShare(message) {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}
