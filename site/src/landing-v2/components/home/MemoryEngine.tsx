import { useState } from "react";
import { cn } from "../../lib/utils";

type N = {
  id: string;
  x: number;
  y: number;
  t: string;
  since: number;
  kind: "question" | "evidence" | "conflict" | "hypothesis" | "past";
  revised?: number;
  scope: "private" | "team" | "institution";
};
const nodes: N[] = [
  {
    id: "q",
    x: 12,
    y: 50,
    t: "Do microbial metabolites shape neuroinflammation?",
    since: 0,
    kind: "question",
    scope: "private",
  },
  {
    id: "e1",
    x: 32,
    y: 26,
    t: "Butyrate ↑ Treg (murine)",
    since: 1,
    kind: "evidence",
    scope: "team",
  },
  { id: "e2", x: 34, y: 72, t: "IPA → AhR signalling", since: 1, kind: "evidence", scope: "team" },
  {
    id: "e3",
    x: 52,
    y: 44,
    t: "Microglial activation ↓",
    since: 1,
    kind: "evidence",
    scope: "team",
    revised: 2,
  },
  {
    id: "c1",
    x: 56,
    y: 82,
    t: "No effect: low-dose, post-insult",
    since: 2,
    kind: "conflict",
    scope: "team",
  },
  {
    id: "h1",
    x: 74,
    y: 30,
    t: "H1 v1: butyrate is protective",
    since: 1,
    kind: "hypothesis",
    scope: "private",
    revised: 3,
  },
  {
    id: "h2",
    x: 76,
    y: 58,
    t: "H1 v2: effect depends on dose & timing",
    since: 3,
    kind: "hypothesis",
    scope: "team",
  },
  {
    id: "p1",
    x: 92,
    y: 18,
    t: "2025 barrier-integrity study (lab archive)",
    since: 4,
    kind: "past",
    scope: "institution",
  },
  {
    id: "n",
    x: 92,
    y: 78,
    t: "Next: sex-stratified gnotobiotic design",
    since: 4,
    kind: "question",
    scope: "team",
  },
];
const edges: [string, string, number][] = [
  ["q", "e1", 1],
  ["q", "e2", 1],
  ["e1", "e3", 1],
  ["e2", "e3", 1],
  ["e3", "h1", 1],
  ["e1", "h1", 1],
  ["c1", "e3", 2],
  ["c1", "h2", 3],
  ["e3", "h2", 3],
  ["h2", "n", 4],
  ["p1", "h2", 4],
  ["p1", "e1", 4],
];
const days = [
  {
    d: "Day 1",
    t: "Research question",
    n: "A PhD researcher frames the question. Scope, species and inclusion rules are recorded with it.",
    v: "v1.0 · created",
  },
  {
    d: "Day 14",
    t: "New evidence",
    n: "Three findings are linked, each with its source passage, model system and verification status.",
    v: "v1.1 · 3 evidence records added",
  },
  {
    d: "Day 30",
    t: "Conflict investigated",
    n: "A conflicting low-dose study is found. The earlier claim is not deleted — it is marked contested, with the reason.",
    v: "v1.2 · claim e3 marked contested",
  },
  {
    d: "Day 60",
    t: "Hypothesis revised",
    n: "H1 is revised to a context-dependent form. Version 1 stays in the record so the reasoning can be audited.",
    v: "v1.3 · H1 superseded by H1 v2",
  },
  {
    d: "Day 90",
    t: "Investigation resumed",
    n: "Months later the team resumes. Authorised institutional memory surfaces an archived study that informs the next design.",
    v: "v1.4 · linked institutional record",
  },
];
const kc = {
  question: "var(--foreground)",
  evidence: "var(--verify)",
  conflict: "var(--conflict)",
  hypothesis: "var(--signal)",
  past: "var(--helix)",
} as const;
const scopeLabel = { private: "Private", team: "Lab team", institution: "Institution" } as const;

export function MemoryEngine() {
  const [s, setS] = useState(0);
  const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const day = days[s]!;
  return (
    <section
      className="relative border-t border-border bg-background py-24 md:py-32"
      aria-labelledby="mem-h"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              03 — Scientific Memory Engine
            </p>
            <h2
              id="mem-h"
              className="mt-6 font-display text-[clamp(2.4rem,5vw,4.75rem)] font-medium leading-[0.95] tracking-[-0.035em]"
            >
              Your research should never have to{" "}
              <span className="font-serif font-light italic text-primary">start from zero.</span>
            </h2>
          </div>
          <p className="max-w-lg font-serif text-xl leading-snug text-foreground/75 lg:justify-self-end">
            HSI is designed to preserve questions, evidence, decisions, corrections and unresolved
            doubts — so knowledge compounds instead of disappearing when a project ends.
          </p>
        </div>

        <div className="mt-16 border-y border-border">
          <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
            <div className="pointer-events-none absolute inset-0 grid-fine opacity-30" />
            {(["private", "team", "institution"] as const).map((sc, i) => (
              <div
                key={sc}
                className="absolute inset-y-0 border-l border-dashed border-border/80"
                style={{ left: `${[0, 24, 84][i]}%`, width: `${[24, 60, 16][i]}%` }}
              >
                <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {scopeLabel[sc]}
                  {sc === "institution" && s < 4 ? " · locked" : ""}
                </span>
              </div>
            ))}
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {edges.map(([a, b, since], i) => {
                const A = by[a]!,
                  B = by[b]!;
                const on = since <= s;
                const fresh = since === s;
                return (
                  <line
                    key={i}
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke={
                      a === "c1"
                        ? "var(--conflict)"
                        : fresh
                          ? "var(--primary)"
                          : "var(--foreground)"
                    }
                    strokeOpacity={on ? (fresh ? 0.9 : 0.3) : 0}
                    strokeWidth={fresh ? 1.4 : 0.8}
                    strokeDasharray={b === "e3" && a === "c1" ? "4 3" : undefined}
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "stroke-opacity .6s" }}
                  />
                );
              })}
            </svg>
            {nodes.map((n) => {
              const on = n.since <= s;
              const fresh = n.since === s;
              const superseded = n.revised !== undefined && n.revised <= s;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "absolute w-[clamp(7rem,15vw,12rem)] -translate-x-1/2 -translate-y-1/2 transition-all duration-700",
                    on ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                  )}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1 size-2.5 shrink-0 rounded-full",
                        fresh && "ring-4 ring-primary/25",
                      )}
                      style={{ background: kc[n.kind] }}
                    />
                    <p
                      className={cn(
                        "text-[11px] leading-snug md:text-xs",
                        superseded
                          ? "text-muted-foreground line-through decoration-conflict"
                          : "text-foreground",
                      )}
                    >
                      {n.t}
                    </p>
                  </div>
                  {superseded && (
                    <p className="ml-4.5 mt-0.5 font-mono text-[9px] uppercase tracking-wider text-conflict">
                      {n.kind === "hypothesis" ? "superseded" : "contested"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-[1fr_380px]">
          <ol
            className="grid grid-cols-5 border-t border-border"
            aria-label="Investigation timeline"
          >
            {days.map((d, i) => (
              <li key={d.d}>
                <button
                  onClick={() => setS(i)}
                  aria-current={i === s ? "step" : undefined}
                  className={cn(
                    "relative -mt-px w-full border-t-2 pt-4 text-left transition-colors",
                    i === s
                      ? "border-primary"
                      : i < s
                        ? "border-foreground/40"
                        : "border-transparent hover:border-border",
                  )}
                >
                  <span
                    className={cn(
                      "block font-mono text-[10px] uppercase tracking-[0.2em] md:text-[11px]",
                      i === s ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {d.d}
                  </span>
                  <span className="mt-1 hidden text-sm md:block">{d.t}</span>
                </button>
              </li>
            ))}
          </ol>
          <div key={s} className="animate-rise">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {day.d} — {day.t}
            </p>
            <p className="mt-3 font-serif text-lg leading-snug">{day.n}</p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">{day.v}</p>
          </div>
        </div>
        <p className="mt-10 font-mono text-[10px] text-muted-foreground">
          Product demonstration with illustrative data. Memory is designed to follow private, team
          and institutional permissions — no one sees research they are not authorised to access.
        </p>
      </div>
    </section>
  );
}
