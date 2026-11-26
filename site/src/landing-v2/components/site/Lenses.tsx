import { useId, useState } from "react";
import { cn } from "../../lib/utils";

const LENSES = [
  { id: "source", label: "Evidence", title: "Which study supports this relationship?", fields: ["Publication and version", "Passage or source locator", "Source-use status"], note: "A citation identifies a source. It does not establish that the claim is supported." },
  { id: "context", label: "Context", title: "Under which experimental conditions?", fields: ["Species, tissue and cell state", "Model, dose and timing", "Assay, population and endpoint"], note: "Missing fields stay visible. Different experimental contexts may explain different findings." },
  { id: "review", label: "Review", title: "What has actually been checked?", fields: ["Extracted claim or hypothesis", "Verification and uncertainty", "Human decision and version"], note: "The published graph contains unreviewed candidates. Scientific approval is a separate human decision." },
] as const;

/** An explanatory schema of what sits behind one graph relationship. It is not a biological finding or a live run. */
export function RelationshipLenses() {
  const [i, setI] = useState(0);
  const id = useId();
  const l = LENSES[i]!;
  return (
    <div className="glass rounded-2xl p-5 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Inside a graph relationship</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 font-display text-lg">
        <span className="rounded-lg border border-border px-4 py-2">Entity</span>
        <span className="text-primary">— candidate relationship →</span>
        <span className="rounded-lg border border-border px-4 py-2">Entity</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="What sits behind the relationship">
        {LENSES.map((x, k) => (
          <button key={x.id} type="button" aria-pressed={k === i} aria-controls={id} onClick={() => setI(k)} className={cn("rounded-full border px-4 py-2 text-sm transition-colors", k === i ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground")}>
            {x.label}
          </button>
        ))}
      </div>
      <div id={id} className="mt-5" aria-live="polite">
        <h3 className="font-display text-xl font-medium">{l.title}</h3>
        <ul className="mt-3 space-y-1.5 text-sm">
          {l.fields.map((f) => (
            <li key={f} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />{f}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">{l.note}</p>
      </div>
    </div>
  );
}
