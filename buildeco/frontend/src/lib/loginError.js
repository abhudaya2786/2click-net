import { formatApiErrorDetail } from "./api";
import { LOGIN_PROFILES } from "./loginProfiles";

export function isDemoCredential(email, password) {
  const em = String(email || "").trim().toLowerCase();
  const pw = String(password || "");
  return LOGIN_PROFILES.some((p) => p.demo && p.demo.email.toLowerCase() === em && p.demo.password === pw);
}

export function formatLoginError(error, { hi = false, email = "", password = "" } = {}) {
  const t = (en, h) => (hi ? h : en);
  const status = error?.response?.status;
  const data = error?.response?.data;
  const raw = typeof data === "string" ? data : "";
  const looksHtml = raw.startsWith("<!") || /<html/i.test(raw);
  const detail = formatApiErrorDetail(data?.detail);

  if (!error?.response) {
    return t(
      "Cannot reach the login server. Check your connection and try again.",
      "लॉगिन सर्वर से कनेक्ट नहीं हो पाया। कनेक्शन जाँचें और फिर कोशिश करें।",
    );
  }

  if (status === 404 || looksHtml) {
    return t(
      "Login API is not available on this host. Use Sign up, or try Demo for a local workspace.",
      "इस होस्ट पर लॉगिन API उपलब्ध नहीं है। साइन अप करें, या डेमो से लोकल वर्कस्पेस खोलें।",
    );
  }

  if (status === 429 || /lock|too many/i.test(String(detail))) {
    return t("Too many login attempts. Wait a few minutes and try again.", "बहुत कोशिशें हो गईं। कुछ मिनट बाद फिर कोशिश करें।");
  }

  if (status === 401) {
    if (isDemoCredential(email, password)) {
      return t(
        "Live demo accounts (customer/vendor/contractor/architect@buildecogroup.com) are not on this server yet. Sign up to create a real account, or tap Demo to open a local workspace.",
        "लाइव डेमो खाते इस सर्वर पर नहीं हैं। नया खाता बनाएँ, या डेमो से लोकल वर्कस्पेस खोलें।",
      );
    }
    return t(
      "Invalid email or password. If you do not have an account, use Sign up.",
      "ईमेल या पासवर्ड गलत है। खाता नहीं है तो साइन अप करें।",
    );
  }

  if (detail && detail !== "Something went wrong. Please try again.") return detail;
  return error?.message || t("Login failed. Please try again.", "लॉगिन नहीं हो पाया। फिर कोशिश करें।");
}
