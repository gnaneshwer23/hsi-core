import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { StatusTag } from "../site/ui";
import { AGENTS, BOARD, FLOWS, HUMAN, QUESTION, TRACES, agentById, type Flow } from "./agentData";

type Box = { id: string; name: string; x: number; y: number; w: number; h: number };
const boxes: Record<string, Box> = {
  q: QUESTION,
  human: HUMAN,
  ...Object.fromEntries(AGENTS.map((a) => [a.id, { id: a.id, name: a.name, x: a.x, y: a.y, w: BOARD.nodeW, h: BOARD.nodeH }])),
};

/** A smooth connector between the facing sides of two boxes. Returns drawn a little lower so they run beside the forward hand-off. */
function connector(f: Flow) {
  const a = boxes[f.from]!, b = boxes[f.to]!, off = f.kind === "return" ? 16 : 0;
  const overlapX = a.x < b.x + b.w && b.x < a.x + a.w;
  if (overlapX) {
    const down = b.y > a.y, x1 = a.x + a.w / 2 + off, x2 = b.x + b.w / 2 + off, y1 = down ? a.y + a.h : a.y, y2 = down ? b.y : b.y + b.h, ym = (y1 + y2) / 2;
    return { d: `M${x1},${y1} C${x1},${ym} ${x2},${ym} ${x2},${y2}`, lx: (x1 + x2) / 2, ly: ym - 6 };
  }
  const right = b.x > a.x, x1 = right ? a.x + a.w : a.x, x2 = right ? b.x : b.x + b.w, y1 = a.y + a.h / 2 + off, y2 = b.y + b.h / 2 + off, xm = (x1 + x2) / 2;
  return { d: `M${x1},${y1} C${xm},${y1} ${xm},${y2} ${x2},${y2}`, lx: xm, ly: (y1 + y2) / 2 - 8 };
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduce;
}

const outcomeStyle = { passed: "text-verify", returned: "text-conflict-ink", flagged: "text-conflict-ink" } as const;
const outcomeLabel = { passed: "Passed to review", returned: "Returned, not in output", flagged: "Flagged as unresolved" } as const;

export function AgentBoard({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [traceId, setTraceId] = useState<string>("conflict");
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const trace = TRACES.find((t) => t.id === traceId)!;
  const cur = trace.steps[Math.min(step, trace.steps.length - 1)]!;
  const activeFlows = useMemo(() => new Set(trace.steps.map((s) => s.flow).filter(Boolean) as string[]), [trace]);
  const activeNodes = useMemo(() => {
    const s = new Set<string>();
    for (const st of trace.steps) {
      s.add(st.at);
      const f = FLOWS.find((x) => x.id === st.flow);
      if (f) {
        s.add(f.from);
        s.add(f.to);
      }
    }
    return s;
  }, [trace]);
  const focusId = picked ?? cur.at;
  const agent = agentById[focusId];

  const choose = (id: string) => {
    setTraceId(id);
    setStep(0);
    setPicked(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trace an example claim</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example traces">
          {TRACES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={traceId === t.id}
              onClick={() => choose(t.id)}
              className={cn("rounded-full border px-3.5 py-2 text-sm transition-colors", traceId === t.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0 grid-fine opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
          <p className="font-mono text-[11px] text-muted-foreground">orchestration · {AGENTS.length} agents · producers are checked by separate agents · every chain ends with a person</p>
          <StatusTag s="Illustrative" />
        </div>
        <p className="relative px-4 pt-3 text-xs text-muted-foreground md:hidden">On small screens the board is an overview. Agent names and steps are in the lists below.</p>
        <svg
          viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
          className="relative block h-auto w-full"
          role="img"
          aria-label="Illustrative orchestration of specialised agents. A research question goes to literature synthesis, whose cited claims are checked by evidence verification. Contradiction detection aligns studies by context and sends conflicts and gaps to hypothesis generation and, with its uncertainty, to expert review. Verification can return a claim to synthesis with a reason. Use the trace buttons and the lists below the board to follow an example."
        >
          <defs>
            <marker id="ab-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>
          {[{ x: 4, y: 20, h: 92, l: "PRODUCE" }, { x: 150, y: 160, h: 106, l: "CHECK" }, { x: 4, y: 304, h: 106, l: "PRODUCE" }].map((b) => (
            <g key={b.y + b.l}>
              <rect x={b.x} y={b.y} width={BOARD.w - 4 - b.x} height={b.h} rx="12" fill="var(--card)" fillOpacity="0.35" stroke="var(--border)" strokeOpacity="0.6" />
              <text x={b.x + 14} y={b.y + 18} className="max-md:hidden" fill="var(--muted-foreground)" fontFamily="var(--font-sans)" fontSize="10.5" >{b.l}</text>
            </g>
          ))}

          {FLOWS.map((f) => {
            const c = connector(f), on = activeFlows.has(f.id), ret = f.kind === "return";
            const colour = ret ? "var(--conflict)" : "var(--primary)";
            return (
              <g key={f.id} opacity={on ? 1 : 0.28} style={{ transition: "opacity .25s" }}>
                <path d={c.d} fill="none" stroke={colour} strokeWidth={on ? 2 : 1.2} strokeDasharray={ret ? "6 5" : undefined} markerEnd="url(#ab-arrow)" />
              </g>
            );
          })}

          {/* a particle travels the current step's hand-off; none under reduced motion */}
          {!reduce &&
            (() => {
              const f = FLOWS.find((x) => x.id === cur.flow);
              if (!f) return null;
              return (
                <circle key={cur.flow! + traceId + step} r="4" fill={f.kind === "return" ? "var(--conflict)" : "var(--primary)"}>
                  <animateMotion dur="1.6s" repeatCount="indefinite" path={connector(f).d} />
                </circle>
              );
            })()}

          {Object.values(boxes).map((b) => {
            const a = agentById[b.id], on = activeNodes.has(b.id), isFocus = focusId === b.id, human = b.id === "human", q = b.id === "q";
            return (
              <g key={b.id} opacity={on || isFocus ? 1 : 0.4} style={{ transition: "opacity .25s", cursor: a ? "pointer" : "default" }} onClick={() => a && setPicked(b.id)}>
                {human && <rect x={b.x - 5} y={b.y - 5} width={b.w + 10} height={b.h + 10} rx="14" fill="none" stroke="var(--verify)" strokeOpacity="0.5" />}
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="10" fill="var(--background)" stroke={human ? "var(--verify)" : isFocus ? "var(--foreground)" : "var(--border)"} strokeWidth={isFocus ? 2 : 1.4} />
                <text x={b.x + b.w / 2} y={b.y + (a ? 28 : 38)} textAnchor="middle" className="max-md:hidden" fill="var(--foreground)" fontFamily="var(--font-sans)" fontSize="12.5" fontWeight="500">
                  {b.name}
                </text>
                {a && (
                  <text x={b.x + b.w / 2} y={b.y + 49} textAnchor="middle" className="max-md:hidden" fill="var(--muted-foreground)" fontFamily="var(--font-sans)" fontSize="10.5" >
                    {a.status}
                  </text>
                )}
                {(human || q) && <circle cx={b.x + b.w - 12} cy={b.y + 12} r="3.5" fill={human ? "var(--verify)" : "var(--muted-foreground)"} />}
              </g>
            );
          })}
          {FLOWS.filter((f) => activeFlows.has(f.id)).map((f) => {
            const c = connector(f);
            return (
              <text key={f.id} x={c.lx} y={c.ly} textAnchor="middle" className="max-md:hidden" fill="var(--foreground)" fontFamily="var(--font-sans)" fontSize="10.5" stroke="var(--background)" strokeWidth="4" paintOrder="stroke">
                {f.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Example claim</p>
          <h3 className="mt-2 font-display text-xl font-medium">{trace.claim}</h3>
          <ol className="mt-4 space-y-2">
            {trace.steps.map((s, i) => {
              const on = i === step && !picked;
              const who = s.at === "q" ? QUESTION.name : s.at === "human" ? HUMAN.name : agentById[s.at]!.name;
              return (
                <li key={i}>
                  <button
                    type="button"
                    aria-current={on ? "step" : undefined}
                    onClick={() => {
                      setStep(i);
                      setPicked(null);
                    }}
                    className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors", on ? "border-primary bg-primary/10" : "border-border hover:border-primary/60")}
                  >
                    <span className="mr-2 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-medium">{who}</span>
                    <span className="mt-1 block text-muted-foreground">{s.note}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-sm">
            <span className={cn("font-medium", outcomeStyle[trace.outcome])}>{outcomeLabel[trace.outcome]}. </span>
            <span className="text-muted-foreground">{trace.outcomeText}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5" aria-live="polite" aria-atomic="true">
          {agent ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{agent.lane === "produce" ? "Produces" : "Checks"}</p>
                  <h3 className="mt-2 font-display text-xl font-medium">{agent.name}</h3>
                </div>
                <StatusTag s={agent.status} />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Takes</dt><dd>{agent.takes}</dd></div>
                <div><dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Hands on</dt><dd>{agent.gives}</dd></div>
                <div><dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Checked by</dt><dd>{agent.checkedBy}</dd></div>
                <div><dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Does not</dt><dd className="text-muted-foreground">{agent.limit}</dd></div>
              </dl>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-medium">{focusId === "human" ? "Expert review" : "Research question"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {focusId === "human"
                  ? "Agents propose; scientists decide. A reviewer sees the evidence, the conflicts and the uncertainty, and records a decision with a reason."
                  : "The question and its scope are fixed first, so every later step answers the same question."}
              </p>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Agents</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={picked === a.id}
                onClick={() => setPicked((p) => (p === a.id ? null : a.id))}
                className={cn("flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors", picked === a.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/60")}
              >
                <span>{a.name}</span>
                <StatusTag s={a.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Illustrative: this shows how specialised agents are designed to hand work on and be checked. Only some are prototypes; none is a validated scientific result. Example claims are invented.
      </p>
    </div>
  );
}
