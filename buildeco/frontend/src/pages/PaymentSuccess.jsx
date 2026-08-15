import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { HardHat, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const MAX_POLLS = 6;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState(sessionId ? "polling" : "cancelled"); // polling | paid | pending | cancelled | error
  const polls = useRef(0);

  useEffect(() => {
    if (!sessionId) return;
    let timer;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") { setState("paid"); return; }
      } catch { setState("error"); return; }
      polls.current += 1;
      if (polls.current >= MAX_POLLS) { setState("pending"); return; }
      timer = setTimeout(poll, 2000);
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId]);

  const view = {
    polling: { icon: <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />, title: "Confirming your payment…", sub: "Please wait, this only takes a few seconds." },
    paid: { icon: <CheckCircle2 className="h-10 w-10 text-solar mx-auto" />, title: "Payment successful", sub: "Your invoice has been marked as paid. Thank you!" },
    pending: { icon: <Clock className="h-10 w-10 text-primary mx-auto" />, title: "Payment processing", sub: "We're still confirming. Check your Billing tab shortly." },
    cancelled: { icon: <XCircle className="h-10 w-10 text-muted-foreground mx-auto" />, title: "Payment cancelled", sub: "No charge was made. You can try again anytime." },
    error: { icon: <XCircle className="h-10 w-10 text-destructive mx-auto" />, title: "Could not verify payment", sub: "Please check your Billing tab or try again." },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950" data-testid="payment-result">
      <div className="w-full max-w-sm bg-card border border-border p-8 text-center">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-9 w-9 bg-primary flex items-center justify-center"><HardHat className="h-5 w-5 text-white" strokeWidth={1.75} /></div>
          <span className="font-display font-extrabold text-lg tracking-tight">buildecogroup.com</span>
        </Link>
        {view.icon}
        <h1 data-testid="payment-status" className="font-display font-bold text-xl mt-4">{view.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{view.sub}</p>
        <Link to="/dashboard"><Button data-testid="payment-back" className="rounded-none mt-6 w-full">Back to dashboard</Button></Link>
      </div>
    </div>
  );
}
