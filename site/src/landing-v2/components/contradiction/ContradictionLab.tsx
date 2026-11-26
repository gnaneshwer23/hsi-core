import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { StatusTag } from "../site/ui";
import { CLAIM, STUDIES, VARIABLES, agreement, gaps, groupBy, resolves, verdict, type Result, type Variable } from "./contradictionData";

const glyph: Record<Result, { sym: string; cls: string; label: string }> = {
  lowers: { sym: "▼", cls: "text-verify", label: "Lowers" },
  "no effect": { sym: "–", cls: "text-muted-foreground", label: "No effect" },
  raises: { sym: "▲", cls: "text-conflict-ink", label: "Raises" },
};

export function ContradictionLab({ className }: { className?: string }) {
  const [variable, setVariable] = useState<Variable | null>(null);
  const groups = useMemo(() => groupBy(variable), [variable]);
  const scores = useMemo(() => VARIABLES.map((v) => ({ ...v, score: agreement(v.key) })), []);
  const base = agreement(null);
  const best = [...scores].sort((a, b) => b.score - a.score)[0]!;
  const v = variable ? verdict(agreement(variable)) : null;
  const counts = { lowers: 0, "no effect": 0, raises: 0 } as Record<Result, number>;
  for (const s of STUDIES) counts[s.result]++;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
          <p className="font-mono text-xs text-muted-foreground">
            Claim under review: <span className="text-foreground">“{CLAIM}”</span>
          </p>
          <StatusTag s="Illustrative" />
        </div>

        <div className="grid gap-6 border-b border-border/70 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">The studies disagree</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {STUDIES.length} invented studies: {counts.lowers} report lowering, {counts["no effect"]} no effect and {counts.raises} a rise. Counted together this looks like a contradiction.
              Aligning them by context shows whether it is one.
            </p>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full border border-border" role="img" aria-label={`${counts.lowers} lower, ${counts["no effect"]} no effect, ${counts.raises} raise`}>
              <div className="bg-verify" style={{ width: `${(counts.lowers / STUDIES.length) * 100}%` }} />
              <div className="bg-muted-foreground/60" style={{ width: `${(counts["no effect"] / STUDIES.length) * 100}%` }} />
              <div className="bg-conflict" style={{ width: `${(counts.raises / STUDIES.length) * 100}%` }} />
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Align by a context variable</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Context variables">
              <button type="button" aria-pressed={variable === null} onClick={() => setVariable(null)} className={cn("rounded-full border px-3.5 py-2 text-sm transition-colors", variable === null ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground")}>
                No grouping
              </button>
              {VARIABLES.map((x) => (
                <button key={x.key} type="button" aria-pressed={variable === x.key} onClick={() => setVariable(x.key)} className={cn("rounded-full border px-3.5 py-2 text-sm transition-colors", variable === x.key ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground")}>
                  {x.label}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-2" aria-label="How well each variable separates the results">
              {scores.map((s) => (
                <li key={s.key} className="grid grid-cols-[72px_1fr_44px] items-center gap-3 font-mono text-[11px]">
                  <span className={cn(s.key === best.key ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                  <span className="relative h-2 rounded-full bg-border/60">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${s.score * 100}%` }} />
                    <span className="absolute -top-1 h-4 w-px bg-foreground/60" style={{ left: `${base * 100}%` }} aria-hidden />
                  </span>
                  <span className="text-right text-muted-foreground">{Math.round(s.score * 100)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Bars show the share of results that match their group’s majority; the tick is the ungrouped baseline ({Math.round(base * 100)}%). Groups of one are not scored.</p>
          </div>
        </div>

        <div className="overflow-x-auto p-5" role="region" aria-label="Studies, scrollable" tabIndex={0}>
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Invented studies{variable ? `, grouped by ${variable}` : ""}, with their context and result</caption>
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-normal">Study</th>
                {VARIABLES.map((x) => (
                  <th scope="col" key={x.key} className={cn("py-2 pr-3 font-normal", variable === x.key && "text-foreground")}>{x.label}</th>
                ))}
                <th scope="col" className="py-2 font-normal">Result</th>
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.name}>
                {variable && (
                  <tr>
                    <th scope="rowgroup" colSpan={6} className="border-t border-border bg-background/40 px-0 py-2 text-left font-normal">
                      <span className="font-medium">{g.name}</span>
                      <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                        {g.studies.length} {g.studies.length === 1 ? "study" : "studies"} ·{" "}
                        {g.scored ? (g.agree === g.studies.length ? `all ${glyph[g.majority].label.toLowerCase()}` : `${g.agree} of ${g.studies.length} ${glyph[g.majority].label.toLowerCase()}`) : g.name === "Not reported" ? "value missing, not scored" : "too few to assess"}
                      </span>
                    </th>
                  </tr>
                )}
                {g.studies.map((s) => (
                  <tr key={s.id} className="border-t border-border/50">
                    <th scope="row" className="py-2 pr-3 font-mono text-xs font-normal text-muted-foreground">{s.id}</th>
                    <td className="py-2 pr-3">{s.model}</td>
                    <td className="py-2 pr-3">{s.sex}</td>
                    <td className={cn("py-2 pr-3", s.dose === "Not reported" && "text-signal")}>{s.dose}</td>
                    <td className="py-2 pr-3">{s.timing}</td>
                    <td className={cn("py-2 whitespace-nowrap", glyph[s.result].cls)}>
                      <span aria-hidden className="mr-1.5">{glyph[s.result].sym}</span>
                      {glyph[s.result].label}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="border-t border-border/70 bg-background/40 p-5" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary">Contextual assessment</p>
          {variable && v ? (
            <p className="mt-2 text-sm">
              Grouped by <span className="font-medium">{VARIABLES.find((x) => x.key === variable)!.label.toLowerCase()}</span>: {v.label.toLowerCase()} ({Math.round(agreement(variable) * 100)}% agreement within groups).
              {" "}
              <span className="text-muted-foreground">What would resolve it: {resolves[variable]}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a context variable to regroup the studies. In this example {best.label.toLowerCase()} separates the results best ({Math.round(best.score * 100)}%), but that is a lead, not a conclusion.
            </p>
          )}
          <p className="mt-4 text-sm">
            <span className="rounded-full border border-conflict/50 bg-conflict/10 px-2.5 py-0.5 font-mono text-[11px] text-conflict-ink">Unresolved · requires expert review</span>
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Gaps kept visible</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {gaps().map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Illustrative: the studies, their attributes and results are invented to show how disagreement is aligned by context. No real publication, study count, confidence score or conclusion is implied.
      </p>
    </div>
  );
}
