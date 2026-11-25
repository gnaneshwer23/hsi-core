import { useEffect, useState } from "react";
import { Link } from "../../router";
import { Bot, CheckCircle2, CircleDashed, FileSearch, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { domains, investigationStages, personas } from "../../lib/site-data";
import { StatusTag } from "./ui";
import { ConfidenceMeter, KnowledgeGraph, PathwayMap } from "./Visuals";

export function BioNetwork({ className }: { className?: string | undefined }) {
  return <KnowledgeGraph className={className} compact />;
}

const stageAgents = [
  "Orchestrator",
  "Literature Synthesis",
  "Literature Synthesis",
  "Multi-omics Correlation",
  "Contradiction Detection",
  "Evidence Verification",
  "Hypothesis Generation",
  "Hypothesis Generation",
  "Experimental Design",
  "Memory Engine",
];
const stageConf = [92, 74, 68, 41, 38, 22, 55, 34, 30, 96];
const records = [
  {
    id: "R-01",
    t: "Murine colitis model, oral butyrate supplementation",
    design: "In vivo · mouse · n=12/group",
    dir: "support",
  },
  {
    id: "R-02",
    t: "Germ-free mice recolonised with SCFA-producing consortium",
    design: "Gnotobiotic · mouse",
    dir: "support",
  },
  {
    id: "R-03",
    t: "Low-dose acute butyrate after injury",
    design: "In vivo · mouse · mixed sex",
    dir: "conflict",
  },
  {
    id: "R-04",
    t: "Faecal SCFA in a human case–control cohort",
    design: "Observational · human",
    dir: "neutral",
  },
];

function Drawer({ rec, onClose }: { rec: (typeof records)[number] | null; onClose: () => void }) {
  return (
    <aside
      aria-hidden={!rec}
      className={cn(
        "absolute inset-y-0 right-0 z-10 w-full max-w-sm lg:right-[280px] border-l border-border bg-popover/95 p-5 backdrop-blur-xl transition-transform duration-300",
        rec ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      {rec && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Source provenance · {rec.id}
              </p>
              <h4 className="mt-2 font-semibold">{rec.t}</h4>
            </div>
            <button
              onClick={onClose}
              aria-label="Close provenance drawer"
              className="grid size-9 place-items-center rounded-md hover:bg-accent"
            >
              <X className="size-4" />
            </button>
          </div>
          <dl className="mt-5 space-y-3 font-mono text-xs">
            {[
              ["Study design", rec.design],
              ["Retrieved from", "PubMed (prototype connector)"],
              ["Access basis", "Open abstract"],
              ["Retraction check", "No notice found"],
              ["Extracted passage", "§ Results, para 2"],
              ["Verified by", "Evidence Verification agent"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <blockquote className="mt-5 border-l-2 border-primary pl-3 text-sm text-muted-foreground">
            “…supplementation was associated with reduced markers of inflammation relative to
            vehicle controls…”
          </blockquote>
          <p className="mt-5 rounded-md border border-signal/40 bg-signal/10 p-3 font-mono text-[11px] text-signal">
            Illustrative record — not a real citation.
          </p>
        </>
      )}
    </aside>
  );
}

export function InvestigationDemo() {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  const [rec, setRec] = useState<(typeof records)[number] | null>(null);
  const s = investigationStages[i]!;
  useEffect(() => {
    if (!rec) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setRec(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [rec]);
  const lines = s.o.split("\n");
  useEffect(() => {
    setTick(0);
    const id = setInterval(() => setTick((t) => (t >= lines.length + 1 ? t : t + 1)), 420);
    return () => clearInterval(id);
  }, [i, lines.length]);
  const done = tick > lines.length;
  const conf = stageConf[i]!;
  return (
    <div className="glass relative overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-signal/60" />
            <span className="size-2.5 rounded-full bg-verify/60" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            hsi://workbench / gut-brain-axis / v1.3
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            Lab group · private
          </span>
          <StatusTag s="Illustrative" />
        </div>
      </div>
      <div className="grid lg:grid-cols-[250px_1fr_280px]">
        <ol
          className="flex gap-1 overflow-x-auto border-b border-border/70 p-3 lg:flex-col lg:border-b-0 lg:border-r"
          aria-label="Investigation stages"
        >
          {investigationStages.map((st, k) => (
            <li key={st.t} className="shrink-0">
              <button
                onClick={() => setI(k)}
                aria-current={k === i ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                  k === i
                    ? "bg-primary/12 text-foreground ring-1 ring-primary/40"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {k < i ? (
                  <CheckCircle2 className="size-4 shrink-0 text-verify" />
                ) : k === i ? (
                  <Loader2
                    className={cn("size-4 shrink-0 text-primary", !done && "animate-spin")}
                  />
                ) : (
                  <CircleDashed className="size-4 shrink-0" />
                )}
                <span className="whitespace-nowrap lg:whitespace-normal">{st.t}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="min-w-0 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Stage {String(i + 1).padStart(2, "0")} / 10
          </p>
          <h3 className="mt-1 text-xl font-semibold">{s.t}</h3>
          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 font-mono text-[13px]">
            <div className="relative flex items-center gap-2 overflow-hidden border-b border-border/70 px-4 py-2 text-[11px] text-muted-foreground">
              <Bot className="size-3.5 text-primary" /> agent:{" "}
              <span className="text-foreground">{stageAgents[i]}</span>
              <span className="ml-auto">{done ? "complete" : "running…"}</span>
              {!done && (
                <span className="absolute bottom-0 left-0 h-px w-1/3 animate-scan bg-primary" />
              )}
            </div>
            <ul className="space-y-2 p-4" aria-live="polite">
              {lines.slice(0, tick).map((l, k) => (
                <li key={k} className="animate-rise flex gap-3">
                  <span className="text-muted-foreground">{String(k + 1).padStart(2, "0")}</span>
                  <span className="text-foreground/90">{l}</span>
                </li>
              ))}
              {!done && <li className="h-4 w-2 animate-pulse bg-primary/70" aria-hidden />}
            </ul>
          </div>
          {i === 3 && <PathwayMap className="mt-5" />}
          {i === 4 && (
            <div className="mt-5">
              <ContradictionPanel compact />
            </div>
          )}
          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              disabled={i === 0}
              onClick={() => setI(i - 1)}
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={i === investigationStages.length - 1}
              onClick={() => setI(i + 1)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Next stage →
            </button>
          </div>
        </div>
        <div className="space-y-5 border-t border-border/70 p-5 lg:border-l lg:border-t-0">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Confidence
            </p>
            <div className="mt-3 space-y-3">
              <ConfidenceMeter
                label="Stage confidence"
                value={conf}
                tone={conf > 70 ? "verify" : conf > 40 ? "primary" : "signal"}
              />
              <ConfidenceMeter label="Human evidence share" value={i < 2 ? 0 : 18} tone="helix" />
              <ConfidenceMeter
                label="Citation coverage"
                value={Math.min(100, 60 + i * 4)}
                tone="primary"
              />
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Evidence records
            </p>
            <ul className="mt-2 space-y-1.5">
              {records.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setRec(r)}
                    className="group flex w-full items-start gap-2 rounded-lg border border-border/70 bg-background/50 p-2.5 text-left text-xs hover:border-primary/50"
                  >
                    <span
                      className={cn(
                        "mt-1 size-1.5 shrink-0 rounded-full",
                        r.dir === "support"
                          ? "bg-verify"
                          : r.dir === "conflict"
                            ? "bg-signal"
                            : "bg-muted-foreground",
                      )}
                    />
                    <span className="flex-1">
                      <span className="font-mono text-muted-foreground">{r.id}</span> {r.t}
                    </span>
                    <FileSearch className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="rounded-md border border-border/70 p-3 text-xs text-muted-foreground">
            Outputs require expert review before any experimental decision.
          </p>
        </div>
      </div>
      <Drawer rec={rec} onClose={() => setRec(null)} />
    </div>
  );
}

const dotColor: Record<string, string> = {
  primary: "bg-primary",
  helix: "bg-helix",
  verify: "bg-verify",
  signal: "bg-signal",
};

export function DomainTabs() {
  const [k, setK] = useState(0);
  const d = domains[k]!;
  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {domains.map((x, j) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={j === k}
            onClick={() => setK(j)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              j === k
                ? "border-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("size-2 rounded-full", dotColor[x.color])} />
            {x.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8 grid gap-8 glass rounded-2xl p-6 md:p-8 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold">{d.name}</h3>
          <p className="mt-3 text-muted-foreground">{d.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {d.ids.map((id) => (
              <span
                key={id}
                className="rounded border border-border bg-background px-2 py-1 font-mono text-xs"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Example research questions
          </p>
          <ul className="mt-3 space-y-3">
            {d.questions.map((q) => (
              <li key={q} className="border-l-2 border-primary/50 pl-4 text-sm">
                {q}
              </li>
            ))}
          </ul>
          <Link to="/science" className="mt-6 inline-block text-sm text-primary hover:underline">
            Explore all domains →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PersonaTabs() {
  const [k, setK] = useState(0);
  const p = personas[k]!;
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div role="tablist" className="flex flex-col gap-1">
        {personas.map((x, j) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={j === k}
            onClick={() => setK(j)}
            className={cn(
              "rounded-lg px-4 py-3 text-left text-sm",
              j === k ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl font-semibold">{p.name}</h3>
        <p className="mt-3 text-signal">
          Challenge: <span className="text-muted-foreground">{p.pain}</span>
        </p>
        <ul className="mt-6 space-y-3">
          {p.value.map((v) => (
            <li key={v} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-verify" />
              {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const studies = [
  { l: "Mouse · high dose · pre-insult", e: -0.62, lo: -0.9, hi: -0.34, n: 14 },
  { l: "Mouse · gnotobiotic", e: -0.41, lo: -0.7, hi: -0.12, n: 5 },
  { l: "Mouse · low dose · post-insult", e: 0.08, lo: -0.22, hi: 0.38, n: 3 },
  { l: "Human · observational", e: -0.05, lo: -0.45, hi: 0.35, n: 1 },
];

export function ContradictionPanel({ compact }: { compact?: boolean }) {
  const X = (v: number) => 50 + v * 45;
  return (
    <div className={cn("glass overflow-hidden rounded-2xl", compact && "rounded-xl")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          Claim under review:{" "}
          <span className="text-foreground">“Butyrate reduces neuroinflammation.”</span>
        </p>
        <StatusTag s="Illustrative" />
      </div>
      <div className="grid gap-px bg-border/60 md:grid-cols-2">
        <div className="bg-card/80 p-5">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-verify">
            <span className="size-1.5 rounded-full bg-verify" />
            Supporting · 19 records
          </p>
          <p className="mt-3 text-sm">
            Murine models report reduced microglial activation after oral butyrate.
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            <dt className="text-muted-foreground">Model</dt>
            <dd>Mouse, mostly male</dd>
            <dt className="text-muted-foreground">Dose</dt>
            <dd>High, chronic</dd>
            <dt className="text-muted-foreground">Timing</dt>
            <dd>Pre-insult</dd>
          </dl>
        </div>
        <div className="bg-card/80 p-5">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Conflicting · 4 records
          </p>
          <p className="mt-3 text-sm">
            Smaller studies report no effect or raised inflammatory markers.
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            <dt className="text-muted-foreground">Model</dt>
            <dd>Mouse mixed sex; human cohort</dd>
            <dt className="text-muted-foreground">Dose</dt>
            <dd>Low, acute</dd>
            <dt className="text-muted-foreground">Timing</dt>
            <dd>Post-insult</dd>
          </dl>
        </div>
      </div>
      {!compact && (
        <div className="border-t border-border/70 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Effect on inflammatory markers by context (standardised, illustrative)
          </p>
          <div className="mt-3 space-y-2.5">
            {studies.map((s) => (
              <div
                key={s.l}
                className="grid grid-cols-[minmax(0,180px)_1fr_40px] items-center gap-3 font-mono text-[11px]"
              >
                <span className="truncate text-muted-foreground">{s.l}</span>
                <div className="relative h-5">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                  <div
                    className="absolute top-1/2 h-px -translate-y-1/2 bg-foreground/50"
                    style={{ left: `${X(s.lo)}%`, width: `${X(s.hi) - X(s.lo)}%` }}
                  />
                  <div
                    className={cn(
                      "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45",
                      s.hi < 0 ? "bg-verify" : "bg-conflict",
                    )}
                    style={{ left: `${X(s.e)}%` }}
                  />
                </div>
                <span className="text-right text-muted-foreground">n={s.n}</span>
              </div>
            ))}
            <div className="grid grid-cols-[minmax(0,180px)_1fr_40px] gap-3 font-mono text-[10px] text-muted-foreground">
              <span />
              <div className="flex justify-between">
                <span>← reduces</span>
                <span>no effect</span>
                <span>increases →</span>
              </div>
              <span />
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-border/70 bg-background/40 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Contextual assessment
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Disagreement is plausibly explained by dose, timing and sex rather than true
          contradiction. Human evidence is sparse.{" "}
          <span className="text-foreground">Confidence: low · Requires expert review.</span>
        </p>
        {!compact && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ConfidenceMeter label="Murine consistency" value={71} tone="verify" />
            <ConfidenceMeter label="Human translatability" value={14} tone="signal" />
            <ConfidenceMeter label="Overall confidence" value={28} tone="primary" />
          </div>
        )}
      </div>
    </div>
  );
}
