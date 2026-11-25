import { useEffect, useMemo, useState } from "react";
import { Link } from "../../router";
import { cn } from "../../lib/utils";
import { StatusTag } from "../site/ui";
import { AtlasTerritory } from "./AtlasArt";
import { EvidenceLegend, StatusChip } from "./EvidenceLegend";
import {
  ATLAS_DOMAINS,
  ATLAS_EDGES,
  ATLAS_ENTITIES,
  ATLAS_PATHWAYS,
  ATLAS_VIEW,
  STATUS_META,
  domainByKey,
  edgeById,
  entityById,
  pathwayById,
  pathwayConflicts,
  pathwayDomains,
  relationsOf,
  weakestStatus,
  type AtlasDomainKey,
  type AtlasEdge,
  type AtlasEntity,
} from "./atlasData";

type Sel = { kind: "entity" | "edge"; id: string } | null;

function useReducedMotion() {
  const [reduce, setReduce] = useState(true); // assume reduced until measured, so nothing animates before the preference is known
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduce;
}

function edgePath(a: AtlasEntity, b: AtlasEntity) {
  const dx = b.x - a.x, dy = b.y - a.y, k = 0.16;
  const cx = (a.x + b.x) / 2 - dy * k, cy = (a.y + b.y) / 2 + dx * k;
  return `M${a.x},${a.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x},${b.y}`;
}

const edgeLabel = (e: AtlasEdge) => `${entityById[e.from]!.label} → ${entityById[e.to]!.label}`;

export function BiologicalAtlas({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [pathwayId, setPathwayId] = useState<string | null>("treg");
  const [domainFocus, setDomainFocus] = useState<AtlasDomainKey | null>(null);
  const [sel, setSel] = useState<Sel>(null);

  const pathway = pathwayId ? pathwayById[pathwayId]! : null;
  const activeEdgeIds = useMemo(() => new Set(pathway?.edges ?? []), [pathway]);
  const activeEntityIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of pathway?.edges ?? []) {
      s.add(edgeById[id]!.from);
      s.add(edgeById[id]!.to);
    }
    return s;
  }, [pathway]);
  const selEntity = sel?.kind === "entity" ? entityById[sel.id]! : null;
  const selEdge = sel?.kind === "edge" ? edgeById[sel.id]! : null;
  const related = useMemo(() => {
    const s = new Set<string>();
    if (selEntity) for (const e of relationsOf(selEntity.id)) s.add(e.id);
    if (selEdge) s.add(selEdge.id);
    return s;
  }, [selEntity, selEdge]);

  const choosePathway = (id: string) => {
    setPathwayId((cur) => (cur === id ? null : id));
    setSel(null);
  };
  const entityDim = (e: AtlasEntity) => {
    if (domainFocus && e.domain !== domainFocus) return true;
    if (selEntity || selEdge) return !(selEntity?.id === e.id || (selEdge && (selEdge.from === e.id || selEdge.to === e.id)) || (selEntity && relationsOf(selEntity.id).some((r) => r.from === e.id || r.to === e.id)));
    if (pathway) return !activeEntityIds.has(e.id);
    return false;
  };

  const nConflicts = ATLAS_EDGES.filter((e) => e.status === "contested").length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Follow a pathway</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pathways">
            {ATLAS_PATHWAYS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={pathwayId === p.id}
                onClick={() => choosePathway(p.id)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-left text-sm transition-colors",
                  pathwayId === p.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Focus a domain</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Domains">
            {ATLAS_DOMAINS.map((d) => (
              <button
                key={d.key}
                type="button"
                aria-pressed={domainFocus === d.key}
                onClick={() => setDomainFocus((cur) => (cur === d.key ? null : d.key))}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm transition-colors",
                  domainFocus === d.key ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The atlas */}
      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0 grid-fine opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
          <p className="font-mono text-[11px] text-muted-foreground">
            atlas · {ATLAS_DOMAINS.length} domains · {ATLAS_ENTITIES.length} entities · {ATLAS_EDGES.length} relations · {nConflicts} unresolved conflicts
          </p>
          <StatusTag s="Illustrative" />
        </div>
        <p className="relative px-4 pt-3 text-xs text-muted-foreground md:hidden">
          On small screens the map is an overview. Labels are in the pathway steps and lists below.
        </p>
        <svg
          viewBox={`0 0 ${ATLAS_VIEW.w} ${ATLAS_VIEW.h}`}
          className="relative block h-auto w-full"
          role="img"
          aria-label="Illustrative atlas connecting six biological domains: microbiome and metabolism, immunology and inflammation, neuroscience, genomics and multi-omics, organ and tissue biology, and disease mechanisms. Entities are linked by relations with different evidence statuses. Use the pathway and domain buttons and the lists below the map to explore it."
        >
          <defs>
            <filter id="atlas-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          {ATLAS_DOMAINS.map((d, i) => (
            <AtlasTerritory key={d.key} d={d} index={i} dimmed={!!domainFocus && domainFocus !== d.key} />
          ))}

          {/* relations: all faint, active ones in their status style */}
          <g fill="none" strokeLinecap="round">
            {ATLAS_EDGES.map((e) => {
              const a = entityById[e.from]!, b = entityById[e.to]!, m = STATUS_META[e.status];
              const active = activeEdgeIds.has(e.id) || related.has(e.id);
              const dim = (domainFocus && a.domain !== domainFocus && b.domain !== domainFocus) || (!active && (pathway || selEntity || selEdge));
              return (
                <g key={e.id} opacity={dim ? 0.12 : active ? 1 : 0.5} style={{ transition: "opacity .25s" }}>
                  {active && <path d={edgePath(a, b)} stroke={m.colour} strokeWidth={m.width + 5} opacity={0.18} filter="url(#atlas-glow)" />}
                  <path d={edgePath(a, b)} stroke={m.colour} strokeWidth={active ? m.width : m.width * 0.6} strokeDasharray={m.dash} />
                  {/* wide invisible target for pointer users; keyboard users use the step list */}
                  <path d={edgePath(a, b)} stroke="transparent" strokeWidth={16} style={{ cursor: "pointer" }} onClick={() => setSel({ kind: "edge", id: e.id })} />
                </g>
              );
            })}
          </g>

          {/* flowing particles on the active pathway; none when motion is reduced */}
          {!reduce &&
            pathway?.edges.map((id, i) => {
              const e = edgeById[id]!;
              return (
                <circle key={id + (pathwayId ?? "")} r="3.2" fill={STATUS_META[e.status].colour}>
                  <animateMotion dur="3.4s" begin={`${(i * 0.45).toFixed(2)}s`} repeatCount="indefinite" path={edgePath(entityById[e.from]!, entityById[e.to]!)} />
                </circle>
              );
            })}

          {/* entities */}
          {ATLAS_ENTITIES.map((e) => {
            const dim = entityDim(e), st = weakestStatus(e.id), isSel = selEntity?.id === e.id;
            const end = e.anchor === "end";
            return (
              <g key={e.id} opacity={dim ? 0.3 : 1} style={{ transition: "opacity .25s", cursor: "pointer" }} onClick={() => setSel({ kind: "entity", id: e.id })}>
                <circle cx={e.x} cy={e.y} r="20" fill="transparent" />
                {isSel && <circle cx={e.x} cy={e.y} r="15" fill="none" stroke="var(--foreground)" strokeWidth="1.2" />}
                <circle cx={e.x} cy={e.y} r="8" fill="var(--background)" stroke={domainByKey[e.domain].accent} strokeWidth="2" />
                <circle cx={e.x + 8} cy={e.y - 8} r="4" fill={STATUS_META[st].colour} stroke="var(--background)" strokeWidth="1.5" />
                <text
                  x={e.x + (end ? -14 : 14)}
                  y={e.y + 4.5}
                  textAnchor={end ? "end" : "start"}
                  className="max-md:hidden"
                  fill="var(--foreground)"
                  fontFamily="var(--font-sans)"
                  fontSize="13.5"
                  stroke="var(--background)"
                  strokeWidth="4"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {e.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pathway steps and detail */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          {pathway ? (
            <>
              <h3 className="font-display text-xl font-medium">{pathway.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pathway.summary}</p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                crosses {pathwayDomains(pathway).length} domains · {pathwayConflicts(pathway)} unresolved {pathwayConflicts(pathway) === 1 ? "conflict" : "conflicts"}
              </p>
              <ol className="mt-4 space-y-2">
                {pathway.edges.map((id, i) => {
                  const e = edgeById[id]!;
                  const on = selEdge?.id === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        aria-current={on ? "true" : undefined}
                        onClick={() => setSel({ kind: "edge", id })}
                        className={cn("flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors", on ? "border-primary bg-primary/10" : "border-border hover:border-primary/60")}
                      >
                        <span>
                          <span className="mr-2 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                          {edgeLabel(e)}
                        </span>
                        <StatusChip status={e.status} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-medium">The whole atlas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No pathway is selected, so every relation is shown faintly. Choose a pathway above to follow one route across domains, or select an entity on the map or in the list below.
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5" aria-live="polite" aria-atomic="true">
          {selEntity ? (
            <EntityDetail e={selEntity} onPick={(id) => setSel({ kind: "edge", id })} onPathway={choosePathway} />
          ) : selEdge ? (
            <EdgeDetail e={selEdge} onEntity={(id) => setSel({ kind: "entity", id })} />
          ) : domainFocus ? (
            <DomainDetail k={domainFocus} onPick={(id) => setSel({ kind: "entity", id })} />
          ) : (
            <>
              <h3 className="font-display text-xl font-medium">Select an entity or a step</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Details show what an entity is, how its relations are evidenced and, for conflicts, what is unresolved.
              </p>
            </>
          )}
        </div>
      </div>

      <EvidenceLegend />

      <div className="grid gap-3 md:grid-cols-2">
        <details className="rounded-xl border border-border bg-card/40 p-4">
          <summary className="cursor-pointer text-sm font-medium">Browse all {ATLAS_ENTITIES.length} entities</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {ATLAS_DOMAINS.map((d) => (
              <div key={d.key}>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{d.name}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {ATLAS_ENTITIES.filter((e) => e.domain === d.key).map((e) => (
                    <li key={e.id}>
                      <button type="button" onClick={() => setSel({ kind: "entity", id: e.id })} className="rounded border border-border px-2 py-1 text-xs hover:border-primary/60">
                        {e.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
        <details className="rounded-xl border border-border bg-card/40 p-4">
          <summary className="cursor-pointer text-sm font-medium">Text view of all {ATLAS_EDGES.length} relations</summary>
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Every relation in the illustrative atlas, with its evidence status</caption>
              <thead>
                <tr className="text-muted-foreground">
                  <th scope="col" className="py-1 pr-3 font-medium">Relation</th>
                  <th scope="col" className="py-1 pr-3 font-medium">Status</th>
                  <th scope="col" className="py-1 font-medium">Basis</th>
                </tr>
              </thead>
              <tbody>
                {ATLAS_EDGES.map((e) => (
                  <tr key={e.id} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3">{edgeLabel(e)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{STATUS_META[e.status].short}</td>
                    <td className="py-2 text-muted-foreground">{e.basis}{e.unresolved ? ` Unresolved: ${e.unresolved}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <p className="text-xs text-muted-foreground">
        Illustrative: a curated summary of widely discussed biology, written to show how HSI represents entities, relations and evidence status. It is not an HSI output,
        not a validated map, and carries no study counts or confidence scores. Drawings are schematic and not to scale.{" "}
        <Link to="/science" className="text-primary underline underline-offset-2">Explore the six domains →</Link>
      </p>
    </div>
  );
}

function EntityDetail({ e, onPick, onPathway }: { e: AtlasEntity; onPick: (edgeId: string) => void; onPathway: (id: string) => void }) {
  const rels = relationsOf(e.id);
  const inPaths = ATLAS_PATHWAYS.filter((p) => p.edges.some((id) => edgeById[id]!.from === e.id || edgeById[id]!.to === e.id));
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{domainByKey[e.domain].name} · {e.kind}</p>
      <h3 className="mt-2 font-display text-xl font-medium">{e.label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{e.note}</p>
      <ul className="mt-4 space-y-2">
        {rels.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => onPick(r.id)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-primary/60">
              <span>{edgeLabel(r)}</span>
              <StatusChip status={r.status} />
            </button>
          </li>
        ))}
      </ul>
      {inPaths.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          In pathways:{" "}
          {inPaths.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <button type="button" className="text-primary hover:underline" onClick={() => onPathway(p.id)}>
                {p.name}
              </button>
            </span>
          ))}
        </p>
      )}
    </>
  );
}

function EdgeDetail({ e, onEntity }: { e: AtlasEdge; onEntity: (id: string) => void }) {
  const a = entityById[e.from]!, b = entityById[e.to]!;
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Relation · {domainByKey[a.domain].short} → {domainByKey[b.domain].short}</p>
      <h3 className="mt-2 font-display text-xl font-medium">{edgeLabel(e)}</h3>
      <div className="mt-3"><StatusChip status={e.status} /></div>
      <p className="mt-3 text-sm text-muted-foreground">{e.basis}</p>
      {e.unresolved && (
        <p className="mt-3 rounded-lg border border-conflict/50 bg-conflict/10 p-3 text-sm">
          <span className="font-medium text-conflict-ink">Unresolved. </span>
          {e.unresolved}
        </p>
      )}
      <p className="mt-4 text-sm">
        <button type="button" className="text-primary hover:underline" onClick={() => onEntity(a.id)}>{a.label}</button>
        {" · "}
        <button type="button" className="text-primary hover:underline" onClick={() => onEntity(b.id)}>{b.label}</button>
      </p>
    </>
  );
}

function DomainDetail({ k, onPick }: { k: AtlasDomainKey; onPick: (id: string) => void }) {
  const d = domainByKey[k];
  const ents = ATLAS_ENTITIES.filter((e) => e.domain === k);
  const cross = ATLAS_EDGES.filter((e) => (entityById[e.from]!.domain === k) !== (entityById[e.to]!.domain === k)).length;
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Domain</p>
      <h3 className="mt-2 font-display text-xl font-medium">{d.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{ents.length} entities in this illustration, {cross} relations that cross into other domains.</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ents.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => onPick(e.id)} className="rounded border border-border px-2 py-1 text-xs hover:border-primary/60">{e.label}</button>
          </li>
        ))}
      </ul>
    </>
  );
}
