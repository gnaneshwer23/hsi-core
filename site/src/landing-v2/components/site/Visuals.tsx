import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { StatusTag } from "./ui";

type Dom = "micro" | "immune" | "neuro" | "omics" | "disease";
const domColor: Record<Dom, string> = {
  micro: "var(--verify)",
  immune: "var(--primary)",
  neuro: "var(--helix)",
  omics: "var(--helix)",
  disease: "var(--signal)",
};
const domName: Record<Dom, string> = {
  micro: "Microbiome & metabolism",
  immune: "Immunology",
  neuro: "Neuroscience",
  omics: "Genomics",
  disease: "Disease mechanisms",
};

type GNode = { id: string; x: number; y: number; d: Dom; r?: number; kind: string; note: string };
const gNodes: GNode[] = [
  {
    id: "Gut microbiota",
    x: 80,
    y: 210,
    d: "micro",
    r: 11,
    kind: "Community",
    note: "Commensal taxa producing short-chain fatty acids and tryptophan metabolites.",
  },
  {
    id: "Butyrate",
    x: 190,
    y: 120,
    d: "micro",
    kind: "Metabolite",
    note: "SCFA studied for effects on epithelial barrier and Treg differentiation.",
  },
  {
    id: "Indole-3-propionate",
    x: 200,
    y: 300,
    d: "micro",
    kind: "Metabolite",
    note: "Tryptophan-derived metabolite; AhR/PXR ligand candidate.",
  },
  {
    id: "GPR43",
    x: 300,
    y: 70,
    d: "immune",
    kind: "Receptor",
    note: "FFAR2; SCFA-sensing GPCR expressed on immune and epithelial cells.",
  },
  {
    id: "HDAC inhibition",
    x: 320,
    y: 175,
    d: "omics",
    kind: "Mechanism",
    note: "Butyrate is a known HDAC inhibitor affecting FOXP3 locus acetylation.",
  },
  {
    id: "AhR",
    x: 320,
    y: 300,
    d: "immune",
    kind: "Receptor",
    note: "Aryl hydrocarbon receptor; links microbial metabolites to immune tone.",
  },
  {
    id: "FOXP3⁺ Treg",
    x: 440,
    y: 120,
    d: "immune",
    r: 10,
    kind: "Cell state",
    note: "Regulatory T cells; expansion reported in murine SCFA studies.",
  },
  {
    id: "IL-10",
    x: 540,
    y: 70,
    d: "immune",
    kind: "Cytokine",
    note: "Anti-inflammatory cytokine readout used across many models.",
  },
  {
    id: "Barrier (ZO-1)",
    x: 440,
    y: 235,
    d: "omics",
    kind: "Tissue",
    note: "Tight junction integrity; proposed link to systemic inflammation.",
  },
  {
    id: "Microglia",
    x: 560,
    y: 300,
    d: "neuro",
    r: 10,
    kind: "Cell state",
    note: "CNS-resident immune cells; activation measured as neuroinflammation proxy.",
  },
  {
    id: "IL-6",
    x: 580,
    y: 185,
    d: "immune",
    kind: "Cytokine",
    note: "Pro-inflammatory cytokine; peripheral and CSF measurements differ.",
  },
  {
    id: "α-synuclein",
    x: 690,
    y: 250,
    d: "neuro",
    kind: "Protein",
    note: "SNCA aggregation; gut-origin propagation hypotheses remain debated.",
  },
  {
    id: "Neuroinflammation",
    x: 700,
    y: 120,
    d: "disease",
    r: 12,
    kind: "Phenotype",
    note: "Composite phenotype — operational definitions vary between studies.",
  },
];
type E = [string, string, "support" | "contested" | "hypothesis"];
const gEdges: E[] = [
  ["Gut microbiota", "Butyrate", "support"],
  ["Gut microbiota", "Indole-3-propionate", "support"],
  ["Butyrate", "GPR43", "support"],
  ["Butyrate", "HDAC inhibition", "support"],
  ["Indole-3-propionate", "AhR", "support"],
  ["GPR43", "FOXP3⁺ Treg", "support"],
  ["HDAC inhibition", "FOXP3⁺ Treg", "support"],
  ["FOXP3⁺ Treg", "IL-10", "support"],
  ["Butyrate", "Barrier (ZO-1)", "contested"],
  ["Barrier (ZO-1)", "IL-6", "contested"],
  ["AhR", "Microglia", "hypothesis"],
  ["IL-6", "Microglia", "support"],
  ["IL-10", "Neuroinflammation", "contested"],
  ["Microglia", "Neuroinflammation", "support"],
  ["Microglia", "α-synuclein", "hypothesis"],
  ["α-synuclein", "Neuroinflammation", "contested"],
  ["AhR", "Barrier (ZO-1)", "hypothesis"],
];
const edgeStyle = {
  support: { c: "var(--verify)", dash: undefined, l: "Supported (model-dependent)" },
  contested: { c: "var(--conflict)", dash: "5 5", l: "Contested" },
  hypothesis: { c: "var(--helix)", dash: "2 6", l: "Hypothesis" },
} as const;

function curve(a: GNode, b: GNode) {
  const mx = (a.x + b.x) / 2,
    my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}

export function KnowledgeGraph({
  className,
  compact,
}: {
  className?: string | undefined;
  compact?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string>("Butyrate");
  const focus = active ?? pinned;
  const byId = useMemo(() => Object.fromEntries(gNodes.map((n) => [n.id, n])), []);
  const neighbours = useMemo(
    () => new Set(gEdges.flatMap(([a, b]) => (a === focus ? [b] : b === focus ? [a] : []))),
    [focus],
  );
  const node = byId[focus]!;
  const links = gEdges.filter(([a, b]) => a === focus || b === focus);
  return (
    <div className={cn("glass relative overflow-hidden rounded-2xl", className)}>
      <div className="pointer-events-none absolute inset-0 grid-fine opacity-40" />
      <div className="relative flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-verify" />
          knowledge-graph · gut–brain axis · 13 entities · 17 relations
        </div>
        <StatusTag s="Illustrative" />
      </div>
      <svg
        viewBox="0 0 780 370"
        className="relative w-full"
        role="group"
        aria-label="Interactive illustrative knowledge graph of the gut–brain axis. Select an entity to inspect its relations."
      >
        <defs>
          <filter id="kg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="kg-halo">
            <stop offset="0" stopColor="var(--primary)" stopOpacity=".35" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={node.x}
          cy={node.y}
          r="70"
          fill="url(#kg-halo)"
          className="transition-all duration-500"
        />
        {gEdges.map(([a, b, t], i) => {
          const on = a === focus || b === focus;
          const st = edgeStyle[t];
          const d = curve(byId[a]!, byId[b]!);
          return (
            <g key={i} opacity={on ? 1 : 0.22} className="transition-opacity duration-300">
              {on && (
                <path
                  d={d}
                  stroke={st.c}
                  strokeWidth="5"
                  fill="none"
                  opacity=".35"
                  filter="url(#kg-glow)"
                />
              )}
              <path
                d={d}
                stroke={st.c}
                strokeWidth={on ? 1.8 : 1.1}
                fill="none"
                strokeDasharray={st.dash}
              />
              {on && (
                <circle r="2.6" fill={st.c}>
                  <animateMotion dur={`${2 + (i % 3) * 0.6}s`} repeatCount="indefinite" path={d} />
                </circle>
              )}
            </g>
          );
        })}
        {gNodes.map((n, i) => {
          const isF = n.id === focus,
            isN = neighbours.has(n.id);
          const r = n.r ?? 8;
          return (
            <g
              key={n.id}
              tabIndex={0}
              role="button"
              aria-label={`${n.id}, ${n.kind}`}
              aria-pressed={pinned === n.id}
              className="cursor-pointer outline-none [&:focus-visible_.ring]:opacity-100"
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              onClick={() => setPinned(n.id)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPinned(n.id))
              }
              opacity={isF || isN || !focus ? 1 : 0.4}
              style={{ transition: "opacity .3s" }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={r + 9}
                fill={domColor[n.d]}
                opacity=".12"
                className="animate-node"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              <circle
                className="ring opacity-0"
                cx={n.x}
                cy={n.y}
                r={r + 5}
                fill="none"
                stroke="var(--ring)"
                strokeWidth="1.5"
              />
              {isF && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 4}
                  fill="none"
                  stroke={domColor[n.d]}
                  strokeWidth="1.2"
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill="var(--background)"
                stroke={domColor[n.d]}
                strokeWidth="2"
              />
              <circle cx={n.x} cy={n.y} r={r * 0.45} fill={domColor[n.d]} />
              {(!compact || isF || isN) && (
                <text
                  x={n.x}
                  y={n.y + r + 16}
                  textAnchor="middle"
                  fill={isF ? "var(--foreground)" : "var(--muted-foreground)"}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  {n.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="relative grid gap-3 border-t border-border/70 p-4 sm:grid-cols-[1fr_auto]">
        <div key={focus} className="animate-rise">
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: domColor[node.d] }}
          >
            {node.kind} · {domName[node.d]}
          </p>
          <p className="mt-1 font-display text-base font-semibold">{node.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">{node.note}</p>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            {links.length} relations · {links.filter((l) => l[2] === "contested").length} contested
          </p>
        </div>
        <ul className="flex flex-wrap content-start gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground sm:flex-col">
          {Object.values(edgeStyle).map((s) => (
            <li key={s.l} className="flex items-center gap-2">
              <svg width="22" height="4" aria-hidden>
                <line
                  x1="0"
                  y1="2"
                  x2="22"
                  y2="2"
                  stroke={s.c}
                  strokeWidth="2"
                  strokeDasharray={s.dash}
                />
              </svg>
              {s.l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const layers = [
  { k: "Genome", c: "var(--helix)", items: ["NOD2", "HLA-DRB1", "LRRK2"] },
  { k: "Transcriptome", c: "var(--primary)", items: ["FOXP3 ↑", "IL6 ↑", "TREM2"] },
  { k: "Proteome", c: "var(--primary)", items: ["ZO-1 ↓", "IL-10", "α-syn"] },
  { k: "Metabolome", c: "var(--verify)", items: ["Butyrate ↓", "IPA", "Kynurenine ↑"] },
  { k: "Phenotype", c: "var(--signal)", items: ["Gut permeability", "CSF IL-6", "Motor signs"] },
];

export function PathwayMap({ className }: { className?: string | undefined }) {
  const [hl, setHl] = useState<number | null>(null);
  const W = 760,
    colW = W / layers.length;
  const paths: [number, number, number][] = [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 1],
    [2, 0, 0],
    [1, 2, 0],
    [3, 1, 1],
    [3, 0, 2],
    [2, 1, 2],
    [2, 2, 2],
    [3, 2, 1],
    [1, 0, 1],
    [3, 1, 0],
  ];
  const y = (row: number) => 70 + row * 80;
  return (
    <div className={cn("glass relative overflow-hidden rounded-2xl", className)}>
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <span className="font-mono text-[11px] text-muted-foreground">
          multi-omics correlation · layer → layer associations
        </span>
        <StatusTag s="Illustrative" />
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} 290`}
          className="min-w-[640px] w-full"
          role="img"
          aria-label="Illustrative multi-omics pathway map across genome, transcriptome, proteome, metabolome and phenotype layers"
        >
          <defs>
            <filter id="pm-glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            {layers.slice(0, -1).map((l, i) => (
              <linearGradient key={i} id={`pm-g${i}`} x1="0" x2="1">
                <stop offset="0" stopColor={l.c} />
                <stop offset="1" stopColor={layers[i + 1]!.c} />
              </linearGradient>
            ))}
          </defs>
          {layers.map((l, i) => (
            <g key={l.k}>
              <rect
                x={i * colW + 14}
                y="20"
                width={colW - 28}
                height="260"
                rx="12"
                fill={l.c}
                opacity=".04"
                stroke={l.c}
                strokeOpacity=".18"
              />
              <text
                x={i * colW + colW / 2}
                y="42"
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill={l.c}
                letterSpacing="2"
              >
                {l.k.toUpperCase()}
              </text>
            </g>
          ))}
          {paths.map(([col, a, b], i) => {
            const x1 = col * colW + colW - 30,
              x2 = (col + 1) * colW + 30;
            const d = `M${x1},${y(a)} C${x1 + 50},${y(a)} ${x2 - 50},${y(b)} ${x2},${y(b)}`;
            const on = hl === null || hl === col || hl === col + 1;
            return (
              <g key={i} opacity={on ? 1 : 0.15} style={{ transition: "opacity .3s" }}>
                <path
                  d={d}
                  stroke={`url(#pm-g${col})`}
                  strokeWidth="4"
                  fill="none"
                  opacity=".45"
                  filter="url(#pm-glow)"
                />
                <path
                  d={d}
                  stroke={`url(#pm-g${col})`}
                  strokeWidth="1.4"
                  fill="none"
                  className="animate-dash"
                />
              </g>
            );
          })}
          {layers.map((l, i) =>
            l.items.map((it, r) => (
              <g
                key={it}
                onMouseEnter={() => setHl(i)}
                onMouseLeave={() => setHl(null)}
                className="cursor-default"
              >
                <rect
                  x={i * colW + 26}
                  y={y(r) - 14}
                  width={colW - 52}
                  height="28"
                  rx="14"
                  fill="var(--background)"
                  stroke={l.c}
                  strokeOpacity=".6"
                />
                <circle cx={i * colW + 40} cy={y(r)} r="3" fill={l.c} />
                <text
                  x={i * colW + 50}
                  y={y(r) + 4}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fill="var(--foreground)"
                >
                  {it}
                </text>
              </g>
            )),
          )}
        </svg>
      </div>
      <p className="border-t border-border/70 px-4 py-2 font-mono text-[11px] text-muted-foreground">
        Associations shown are illustrative and do not represent validated causal links.
      </p>
    </div>
  );
}

export function ConfidenceMeter({
  value,
  label,
  tone = "primary",
}: {
  value: number;
  label: string;
  tone?: "primary" | "verify" | "signal" | "helix";
}) {
  const bg = { primary: "bg-primary", verify: "bg-verify", signal: "bg-signal", helix: "bg-helix" }[
    tone
  ];
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}%</span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", bg)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
