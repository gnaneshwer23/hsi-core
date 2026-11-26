import type { ReactNode } from "react";
import { SiteLink } from "../../router";
import { StatusTag } from "../site/ui";
import { cn } from "../../lib/utils";
import { AGENTS } from "../agents/agentData";
import { INV_STAGES } from "../investigation/investigationData";
import { STUDIES, groupBy, type Result } from "../contradiction/contradictionData";
import { sources } from "../../lib/site-data";

/**
 * Short homepage previews of sections whose full, interactive version lives on its own platform page.
 * Each is static (no state, no motion), labelled illustrative, and ends in a link to the full page.
 */
function Teaser({ id, eyebrow, title, intro, points, to, cta, children }: { id: string; eyebrow: string; title: string; intro: string; points: string[]; to: string; cta: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-border/60 py-20 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1] tracking-[-0.03em]">{title}</h2>
          <p className="mt-5 max-w-xl font-serif text-xl leading-snug text-foreground/75">{intro}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <SiteLink to={to} className="mt-8 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {cta} <span aria-hidden>→</span>
          </SiteLink>
        </div>
        <div className="glass rounded-2xl p-5 md:p-6">
          <div className="mb-4 flex justify-end">
            <StatusTag s="Illustrative" />
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

const ORDER = ["lit", "verify", "contra", "hyp", "design"];
export function AgentsTeaser() {
  const chain = ORDER.map((id) => AGENTS.find((a) => a.id === id)!);
  return (
    <Teaser
      id="agents"
      eyebrow="05 · Scientific AI agents"
      title="Specialised agents that check one another."
      intro="Each agent has a narrow job. What one produces, a different agent checks, and every chain ends with a person."
      points={["A producer is never its own checker.", "A failed check returns the claim with a reason.", "Only some agents are prototypes; each is labelled."]}
      to="/platform/agents"
      cta="See how agents hand work on"
    >
      <ol className="space-y-2" aria-label="Agent chain">
        {chain.map((a, i) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-4 py-3 text-sm">
            <span>
              <span className="mr-3 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {a.name}
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{a.lane}</span>
            </span>
            <StatusTag s={a.status} />
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 rounded-lg border border-verify/50 bg-verify/10 px-4 py-3 text-sm">
          <span>
            <span className="mr-3 font-mono text-[11px] text-muted-foreground">{String(chain.length + 1).padStart(2, "0")}</span>
            Expert review
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-verify">A person decides</span>
        </li>
      </ol>
    </Teaser>
  );
}

export function InvestigationTeaser() {
  return (
    <Teaser
      id="investigation"
      eyebrow="06 · Investigation record"
      title="From a research question to the next experiment."
      intro="One invented question, followed through ten stages. Each stage keeps what was found, who produced it, who checked it and what stays uncertain."
      points={["A record, not a live run.", "Failed claims stay out, with their reason.", "Memory records decisions; it never makes a finding."]}
      to="/platform/workbench"
      cta="Walk through the ten stages"
    >
      <ol className="grid gap-2 sm:grid-cols-2" aria-label="The ten stages">
        {INV_STAGES.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border font-mono text-[11px] text-muted-foreground">{i + 1}</span>
            {s.title}
          </li>
        ))}
      </ol>
    </Teaser>
  );
}

const dot: Record<Result, string> = { lowers: "bg-verify", "no effect": "bg-muted-foreground/60", raises: "bg-conflict" };
const word: Record<Result, string> = { lowers: "lower", "no effect": "no effect", raises: "rise" };
export function ContradictionTeaser() {
  const all = groupBy(null)[0]!.studies;
  const count = (r: Result) => all.filter((s) => s.result === r).length;
  const groups = groupBy("timing");
  return (
    <Teaser
      id="contradiction"
      eyebrow="07 · Contradiction intelligence"
      title="Most disagreement is missing context."
      intro="Align conflicting studies by model, sex, dose and timing before calling them contradictory, and keep what remains unresolved in view."
      points={["Disagreement is a lead, not proof.", "A missing value stays visible, never dropped.", "The conflict stays marked unresolved."]}
      to="/platform/contradiction-analysis"
      cta="Try the alignment"
    >
      <p className="text-sm text-muted-foreground">
        Counted together, {STUDIES.length} invented studies disagree: {count("lowers")} {word.lowers}, {count("no effect")} {word["no effect"]}, {count("raises")} {word.raises}. Grouped by timing:
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.name} className="rounded-lg border border-border bg-background/50 p-3">
            <p className="text-sm font-medium">{g.name}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${g.name}: ${g.studies.map((s) => word[s.result]).join(", ")}`}>
              {g.studies.map((s) => (
                <li key={s.id} className={cn("size-3.5 rounded-full", dot[s.result])} title={`${s.id}: ${word[s.result]}`} />
              ))}
            </ul>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {g.agree === g.studies.length ? `all ${word[g.majority]}` : `${g.agree} of ${g.studies.length} ${word[g.majority]}`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] text-conflict-ink">Unresolved · requires expert review</p>
    </Teaser>
  );
}

export function DataTeaser() {
  const by = (s: string) => sources.filter((x) => x.status === s);
  return (
    <Teaser
      id="data"
      eyebrow="10 · Data ecosystem"
      title="Grounded in public scientific resources."
      intro="Integration status is shown honestly. Names are listed for reference only and do not imply partnership."
      points={[`${by("Prototype").length} source connected as a prototype.`, `${by("Planned").length} more are planned, not yet connected.`, "A source that is not connected is not searched."]}
      to="/data-sources"
      cta="See every source and its status"
    >
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Sources and status">
        {sources.slice(0, 6).map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2">
            <span>
              <span className="block text-sm font-medium">{s.name}</span>
              <span className="block font-mono text-[11px] text-muted-foreground">{s.type}</span>
            </span>
            <StatusTag s={s.status} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Showing 6 of {sources.length} sources.</p>
    </Teaser>
  );
}
