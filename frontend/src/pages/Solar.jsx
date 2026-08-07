import { Sun } from "lucide-react";
import SolarEstimator from "@/components/solar/SolarEstimator";

const SOLAR_IMG = "https://images.unsplash.com/photo-1726554068139-d3669703634a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxzb2xhciUyMHBhbmVscyUyMGRyb25lJTIwdmlldyUyMGdyZWVuJTIwZW5lcmd5fGVufDB8fHx8MTc4NjA3NzM3OHww&ixlib=rb-4.1.0&q=85";

export default function Solar() {
  return (
    <div>
      <section className="relative border-b border-border">
        <img src={SOLAR_IMG} alt="Solar" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 py-20 text-white">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-solar border border-solar/40 px-3 py-1.5 mb-5">
            <Sun className="h-3.5 w-3.5" /> Solar EPC Engine
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight max-w-2xl leading-tight">Full solar EPC — sizing, BOQ, subsidy & loan in one shot.</h1>
          <p className="mt-4 text-slate-300 max-w-xl">Get a complete engineering estimate: system sizing, a tiered Bill of Quantities, PM Surya Ghar subsidy, EMI financing, 25-year generation model and a bank-ready DPR.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-14">
        <SolarEstimator />
      </section>
    </div>
  );
}
