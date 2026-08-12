import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUEST_TIPS = {
  en: [
    "Estimate construction cost with plot area and quality tier.",
    "Plan solar sizing from monthly electricity bill.",
    "Use Build → 2 clicks to open your AI project dashboard.",
    "Compare materials and request vendor quotations in Store.",
  ],
  hi: [
    "प्लॉट एरिया और गुणवत्ता से निर्माण लागत अनुमान।",
    "मासिक बिल से सोलर साइज़िंग की योजना बनाएं।",
    "बिल्ड → 2 क्लिक से AI प्रोजेक्ट डैशबोर्ड खोलें।",
    "स्टोर में सामग्री तुलना और विक्रेता कोटेशन।",
  ],
};

export default function AIAssistant() {
  const { user } = useAuth();
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: lang === "hi"
      ? "नमस्ते! मैं BuildEco AI हूँ। निर्माण लागत, सोलर, सामग्री और प्रोजेक्ट योजना में मदद करता हूँ।"
      : "Hi! I'm BuildEco AI. I help with construction cost, solar, materials and project planning." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener("open-ai-assistant", openAssistant);
    return () => window.removeEventListener("open-ai-assistant", openAssistant);
  }, []);

  const send = async () => {
    if (!input.trim() || busy) return;
    if (!user) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: "" }]);
    setBusy(true);
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("bs_token")}` },
        body: JSON.stringify({ message: text, session_id: sessionRef.current }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const p of parts) {
          const line = p.replace(/^data:/, "").trim();
          if (!line || line === "[DONE]") continue;
          try {
            const obj = JSON.parse(line);
            if (obj.session_id) sessionRef.current = obj.session_id;
            if (obj.delta) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "ai", text: copy[copy.length - 1].text + obj.delta };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((m) => { const copy = [...m]; copy[copy.length - 1] = { role: "ai", text: "Connection error. Try again." }; return copy; });
    } finally {
      setBusy(false);
    }
  };

  const tips = GUEST_TIPS[lang] || GUEST_TIPS.en;

  return (
    <>
      <button
        data-testid="ai-assistant-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform"
        aria-label="Ask BuildEco AI"
      >
        {open ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Sparkles className="h-6 w-6" strokeWidth={1.75} />}
      </button>
      {open && (
        <div
          data-testid="ai-assistant-panel"
          className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[92vw] max-w-sm h-[480px] bg-card border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <span className="font-display font-bold text-sm">Ask BuildEco AI</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap rounded-xl ${m.role === "user" ? "bg-primary text-white" : "bg-muted"}`}>
                  {m.text || (busy && i === messages.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "")}
                </div>
              </div>
            ))}
            {!user && (
              <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
                <p className="text-sm text-muted-foreground">{c.loginForAi}</p>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  {tips.map((t) => <li key={t}>· {t}</li>)}
                </ul>
                <Link to="/login">
                  <Button size="sm" className="w-full rounded-xl">{lang === "hi" ? "लॉग इन" : "Log in"}</Button>
                </Link>
                <Link to="/estimate" className="block text-center text-xs text-primary hover:underline">
                  {c.ctaFreeEstimate}
                </Link>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {user && (
            <div className="p-3 border-t border-border flex gap-2">
              <input
                data-testid="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={lang === "hi" ? "कुछ भी पूछें…" : "Ask anything…"}
                className="flex-1 bg-background border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                data-testid="ai-send"
                onClick={send}
                disabled={busy}
                className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
