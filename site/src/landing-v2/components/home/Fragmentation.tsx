import { useEffect, useRef, useState } from "react";

const frags = [
  ["Publication", "SCFA supplementation and colonic Treg frequency", 0],
  ["Dataset", "16S rRNA profiles · faecal samples", 0],
  ["Lab note", "Batch 3 inconsistent — check dosing", 1],
  ["Preprint", "Microglial priming after dysbiosis", 1],
  ["Database", "FFAR2 · receptor annotation", 0],
  ["Assay", "CSF IL-6 · ELISA readout", 1],
  ["Publication", "AhR ligands and astrocyte signalling", 2],
  ["Dataset", "scRNA-seq · colonic lamina propria", 2],
  ["Protocol", "Gnotobiotic colonisation v2", 0],
  ["Database", "Tryptophan metabolism pathway", 2],
  ["Observation", "No effect in female cohort", 1],
  ["Publication", "Barrier permeability and systemic IL-6", 2],
] as const;
const clusterLabel = ["Microbiome & metabolism", "Neuroimmune signalling", "Barrier & tissue"];
const centres = [
  [24, 56],
  [52, 34],
  [78, 60],
];

function seeded(i: number) {
  const x = Math.sin(i * 91.7) * 10000;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}
const start = frags.map((_, i) => [
  8 + seeded(i) * 80,
  12 + seeded(i + 50) * 76,
  (seeded(i + 9) - 0.5) * 28,
]);
const end = frags.map((f, i) => {
  const c = centres[f[2]]!,
    k = frags.slice(0, i).filter((g) => g[2] === f[2]).length,
    a = k * 1.6 + f[2];
  return [c[0]! + Math.cos(a) * 11, c[1]! + Math.sin(a) * 14, 0];
});
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function Fragmentation() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setP(clamp(-r.top / (r.height - window.innerHeight)));
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  const m = ease(clamp((p - 0.12) / 0.45));
  const link = clamp((p - 0.5) / 0.2);
  const intel = clamp((p - 0.72) / 0.2);
  const phase = p < 0.4 ? 0 : p < 0.7 ? 1 : 2;
  const copy = [
    [
      "Knowledge is abundant.",
      "Understanding is fragmented.",
      "Publications, datasets, lab notes and database entries describe the same biology — in isolation, scattered across tools and people.",
    ],
    [
      "Evidence finds",
      "its context.",
      "HSI is designed to resolve each record into biological entities and relations, so related findings converge into one connected network.",
    ],
    [
      "Connection becomes",
      "intelligence.",
      "Memory, evidence, biological context and specialised agents operate over the network — every claim traceable to where it came from.",
    ],
  ][phase]!;
  return (
    <section
      id="how"
      ref={ref}
      className="relative h-[340vh] bg-paper text-ink"
      aria-label="From fragmented knowledge to connected intelligence"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-8 px-5 pt-24 md:px-10 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative z-10 flex flex-col justify-between pb-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">
                02 — The scientific challenge
              </p>
              <div key={phase} className="animate-rise">
                <h2 className="mt-8 font-display text-[clamp(2.4rem,4.6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                  {copy[0]}{" "}
                  <span className="font-serif font-light italic text-primary-ink">{copy[1]}</span>
                </h2>
                <p className="mt-6 max-w-sm font-serif text-lg leading-snug text-ink-muted md:text-xl">
                  {copy[2]}
                </p>
              </div>
            </div>
            <ol className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.2em]">
              {["Fragmentation", "Connection", "Intelligence"].map((s, i) => (
                <li key={s} className={i === phase ? "text-primary-ink" : "text-ink-muted"}>
                  <span className="mr-2">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="relative min-h-[50vh]">
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {frags.map((f, i) =>
                frags
                  .slice(i + 1)
                  .map((g, j) =>
                    g[2] === f[2] && j < 3 ? (
                      <line
                        key={`${i}-${j}`}
                        x1={end[i]![0]}
                        y1={end[i]![1]}
                        x2={end[i + 1 + j]![0]}
                        y2={end[i + 1 + j]![1]}
                        stroke="var(--ink)"
                        strokeOpacity={0.35 * link}
                        strokeWidth=".15"
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null,
                  ),
              )}
              {[
                [0, 1],
                [1, 2],
                [0, 2],
              ].map(([a, b]) => (
                <line
                  key={`c${a}${b}`}
                  x1={centres[a!]![0]}
                  y1={centres[a!]![1]}
                  x2={centres[b!]![0]}
                  y2={centres[b!]![1]}
                  stroke="var(--primary)"
                  strokeOpacity={link}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {centres.map((c, i) => (
                <circle
                  key={i}
                  cx={c[0]}
                  cy={c[1]}
                  r={18 * intel}
                  fill="none"
                  stroke="var(--primary)"
                  strokeOpacity={0.5 * intel}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {centres.map((c, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-ink"
                style={{ left: `${c[0]}%`, top: `${c[1]! - 22}%`, opacity: link.toFixed(3) }}
              >
                {clusterLabel[i]}
              </span>
            ))}
            {frags.map((f, i) => {
              const s = start[i]!,
                e = end[i]!;
              const x = s[0]! + (e[0]! - s[0]!) * m,
                y = s[1]! + (e[1]! - s[1]!) * m,
                rot = s[2]! * (1 - m);
              const sz = 1 - m * 0.55;
              return (
                <div
                  key={i}
                  className="absolute w-44 -translate-x-1/2 -translate-y-1/2 border border-ink/15 bg-paper px-3 py-2 shadow-[0_12px_30px_-18px_var(--ink)] will-change-transform"
                  style={{
                    left: `${x.toFixed(2)}%`,
                    top: `${y.toFixed(2)}%`,
                    transform: `translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${sz.toFixed(3)})`,
                  }}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary-ink">
                    {f[0]}
                  </p>
                  <p
                    className="mt-1 text-xs leading-snug"
                    style={{ opacity: (1 - m * 0.4).toFixed(3) }}
                  >
                    {f[1]}
                  </p>
                </div>
              );
            })}
            <div
              className="absolute bottom-6 right-0 flex flex-wrap justify-end gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ opacity: intel }}
            >
              {["Memory", "Evidence", "Biological context", "Agents"].map((l) => (
                <span key={l} className="border-t border-ink pt-1">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mx-auto w-full max-w-[1440px] px-5 pb-5 font-mono text-[10px] text-ink-muted md:px-10">
          Records shown are illustrative examples, not real citations.
        </p>
      </div>
    </section>
  );
}
