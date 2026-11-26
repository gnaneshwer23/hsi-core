import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "../../router";
import { HERO_DOMAINS, type HeroDomainKey } from "./hero-domains";

const HeroScene = lazy(() => import("./HeroScene"));

function StaticSystem({ focus }: { focus: HeroDomainKey | null }) {
  const pairs: [number, number][] = [
    [3, 0],
    [0, 2],
    [2, 1],
    [3, 2],
    [4, 2],
    [0, 1],
    [4, 1],
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="size-full"
      aria-hidden
    >
      {pairs.map(([a, b], i) => {
        const A = HERO_DOMAINS[a]!.screen,
          B = HERO_DOMAINS[b]!.screen;
        return (
          <path
            key={i}
            d={`M${A[0]},${A[1]} Q50,${(A[1] + B[1]) / 2 - 8} ${B[0]},${B[1]}`}
            stroke="var(--primary)"
            strokeOpacity=".4"
            strokeWidth=".15"
            fill="none"
          />
        );
      })}
      {HERO_DOMAINS.map((d) => (
        <g key={d.key} opacity={!focus || focus === d.key ? 1 : 0.3}>
          <circle
            cx={d.screen[0]}
            cy={d.screen[1]}
            r="5"
            fill="var(--primary)"
            fillOpacity=".08"
            stroke="var(--foreground)"
            strokeOpacity=".3"
            strokeWidth=".15"
          />
          <circle cx={d.screen[0]} cy={d.screen[1]} r="1" fill="var(--primary)" />
        </g>
      ))}
    </svg>
  );
}

export function Hero() {
  const [focus, setFocus] = useState<HeroDomainKey | null>(null);
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const c = document.createElement("canvas");
    const ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
    setWebgl(ok && !reduce && !small);
  }, []);
  const sel = HERO_DOMAINS.find((d) => d.key === focus);
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        {webgl ? (
          <Suspense fallback={<StaticSystem focus={focus} />}>
            <HeroScene focus={focus} onFocus={setFocus} />
          </Suspense>
        ) : (
          <StaticSystem focus={focus} />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]" />
      <div className="pointer-events-none mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-between px-5 pb-10 pt-24 md:px-10">
        <p className="text-sm text-muted-foreground">A research platform in development</p>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_320px]">
          <div className="pointer-events-auto">
            <h1 className="max-w-5xl font-display text-[clamp(2.6rem,6.2vw,6rem)] font-medium leading-[0.92] tracking-[-0.04em]">
              See what the evidence supports,{" "}
              <span className="text-muted-foreground">and where it does not.</span>
            </h1>
            <p className="mt-6 max-w-xl font-serif text-xl leading-snug text-foreground/80 md:text-2xl">
              HSI links published studies to the biology they describe. For each claim, you can see where it came from, what it applied to and where studies disagree.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                to="/knowledge-graph"
                className="group inline-flex items-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore the knowledge graph{" "}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <a
                href="#how"
                className="border-b border-foreground/40 pb-1 text-sm hover:border-primary hover:text-primary"
              >
                How it works
              </a>
            </div>
          </div>
          <div className="pointer-events-auto border-l border-border pl-5">
            <p className="text-sm text-muted-foreground">Explore the system</p>
            <ul className="mt-3">
              {HERO_DOMAINS.map((d) => (
                <li key={d.key}>
                  <button
                    onMouseEnter={() => setFocus(d.key)}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus(d.key)}
                    onBlur={() => setFocus(null)}
                    className="group flex w-full items-baseline gap-4 py-1.5 text-left"
                  >
                    <span
                      className={
                        focus === d.key
                          ? "text-primary"
                          : "text-foreground/85 group-hover:text-foreground"
                      }
                    >
                      {d.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p
              className="mt-4 min-h-[3rem] font-serif text-sm italic text-muted-foreground"
              aria-live="polite"
            >
              {sel ? sel.detail : "Hover a structure to reveal how it connects."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
