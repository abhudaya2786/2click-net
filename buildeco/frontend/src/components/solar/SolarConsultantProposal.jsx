import { FileText } from "lucide-react";

export default function SolarConsultantProposal({ proposal }) {
  if (!proposal?.sections?.length) return null;
  return (
    <div className="border border-border space-y-5 p-5" data-testid="solar-consultant-proposal">
      <div className="flex items-start gap-2">
        <FileText className="h-5 w-5 text-solar shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-solar">{proposal.role}</p>
          <p className="text-sm mt-1 leading-relaxed">{proposal.intro}</p>
        </div>
      </div>
      {proposal.sections.map((sec) => (
        <section key={sec.id} data-testid={`proposal-section-${sec.id}`}>
          <h3 className="font-display font-bold text-base mb-2">{sec.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{sec.body}</p>
          {sec.bullets?.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
              {sec.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
        </section>
      ))}
      {proposal.closing && <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{proposal.closing}</p>}
    </div>
  );
}
