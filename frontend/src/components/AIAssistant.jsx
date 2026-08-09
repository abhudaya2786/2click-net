import { useState, useRef, useEffect } from "react";
import { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

export default function AIAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm 2click.in AI. Ask me about tenders, BOQ estimation, solar sizing or GST." },
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

  if (!user) return null;

  const send = async () => {
    if (!input.trim() || busy) return;
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
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "ai", text: "Connection error. Try again." }; return c; });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button data-testid="ai-assistant-toggle" onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-primary text-white flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
        {open ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Sparkles className="h-6 w-6" strokeWidth={1.75} />}
      </button>
      {open && (
        <div data-testid="ai-assistant-panel" className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[520px] bg-card border border-border flex flex-col shadow-2xl">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <span className="font-display font-bold text-sm">2click.in AI</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Gemini</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-white" : "bg-muted"}`}>
                  {m.text || (busy && i === messages.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "")}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input data-testid="ai-input" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything..."
              className="flex-1 bg-background border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button data-testid="ai-send" onClick={send} disabled={busy}
              className="h-9 w-9 bg-primary text-white flex items-center justify-center disabled:opacity-50">
              <Send className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
