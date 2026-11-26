import { useState } from "react";
import { cn } from "../../lib/utils";
import { agents as siteAgents } from "../../lib/site-data";
import { StatusTag } from "../site/ui";
import { StatusChip } from "../atlas/EvidenceLegend";
import { INV_STAGES, QUESTION } from "./investigationData";
import { SiteLink } from "../../router";

export function InvestigationRecord({ className, labTo }: { className?: string; labTo?: string }) {
  const [i, setI] = useState(0);
  const s = INV_STAGES[i]!;
  const maturity = s.by.fixed ?? siteAgents.find((a) => a.name === s.by.agent)?.status;
  const last = INV_STAGES.length - 1;
  return (
    <div className={cn("glass relative overflow-hidden rounded-2xl", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          Example investigation record · <span className="text-foreground">a record, not a run</span>
        </p>
        <StatusTag s="Illustrative" />
      </div>
      <div className="border-b border-border/70 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Question</p>
        <p className="mt-1 font-serif text-xl leading-snug">{QUESTION}</p>
      </div>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <ol className="flex gap-1 overflow-x-auto border-b border-border/70 p-3 lg:flex-col lg:gap-0 lg:border-b-0 lg:border-r lg:p-4" aria-label="Investigation stages">
          {INV_STAGES.map((st, k) => (
            <li key={st.id} className="relative shrink-0 lg:pb-1">
              {k < last && <span className="absolute left-[19px] top-9 hidden h-[calc(100%-1.5rem)] w-px bg-border lg:block" aria-hidden />}
              <button
                type="button"
                aria-current={k === i ? "step" : undefined}
                onClick={() => setI(k)}
                className={cn("relative flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] transition-colors", k === i ? "bg-primary/10 text-foreground ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground")}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px]", k === i ? "border-primary bg-primary text-primary-foreground" : k < i ? "border-verify text-verify" : "border-border")}>
                  {k < i ? "✓" : k + 1}
                </span>
                <span className="whitespace-nowrap lg:whitespace-normal">{st.title}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="min-w-0 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Stage {String(i + 1).padStart(2, "0")} of {INV_STAGES.length}
          </p>
          <h3 className="mt-1 font-display text-2xl font-medium">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.answers}</p>
          <dl className="mt-5 divide-y divide-border/60 rounded-xl border border-border/70 bg-background/50">
            {s.fields.map(([k, v], n) => (
              <div key={k + n} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[170px_1fr] sm:gap-4">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {s.chain && (
            <ul className="mt-4 space-y-2" aria-label="Proposed route and the status of each link">
              {s.chain.map((c) => (
                <li key={c.from} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{c.from} → {c.to}</span>
                  <StatusChip status={c.status} />
                </li>
              ))}
            </ul>
          )}
          {s.id === "compare" && labTo && (
            <p className="mt-4 text-sm">
              <SiteLink to={labTo} className="text-primary underline underline-offset-2">Try the alignment in the contradiction lab →</SiteLink>
            </p>
          )}
          <div className="mt-6 flex items-center justify-between gap-2">
            <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-md border border-border px-3 py-2 text-sm hover:border-primary disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={i === last} onClick={() => setI(i + 1)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
              Next stage →
            </button>
          </div>
        </div>

        <aside className="space-y-5 border-t border-border/70 p-5 lg:border-l lg:border-t-0" aria-live="polite" aria-label="Provenance of this stage">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Produced by</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium">
              {s.by.label}
              {maturity && <StatusTag s={maturity} />}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Checked by</p>
            <p className="mt-2 text-sm">{s.checkedBy}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Stays visible</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.stays}</p>
          </div>
          <p className="rounded-md border border-border/70 p-3 text-xs text-muted-foreground">
            Illustrative: one invented question followed through ten stages. There are no counts, scores or live results, and nothing here is a finding.
          </p>
        </aside>
      </div>
    </div>
  );
}
