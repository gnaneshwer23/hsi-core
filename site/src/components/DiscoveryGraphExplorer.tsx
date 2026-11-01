import { useMemo, useState } from "react";
import type { EvidenceRow } from "../lib/discoveryData";

export type GraphPackToggle = "ra" | "ssc" | "gut" | "neuro";

export type GraphEdgeInput = {
  pack: GraphPackToggle;
  edgeId: string;
  claimId: string;
  subject: string;
  predicate: string;
  object: string;
  evidenceGrade: string;
  teachingStatus?: string;
  pmid: string | null;
  citationLabel?: string | null;
  sourceUrl?: string | null;
  claimText?: string;
};

type LayoutNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  packs: Set<GraphPackToggle>;
};

type LayoutEdge = GraphEdgeInput & {
  sourceId: string;
  targetId: string;
};

const PACK_LABEL: Record<GraphPackToggle, string> = {
  ra: "RA / anti-TNF",
  ssc: "SSc Tfh–B–IL-21",
  gut: "Gut–immune",
  neuro: "Neuroimmune",
};

function gradeColor(grade: string): string {
  const g = grade.toLowerCase();
  if (g === "established") return "#2fcb86";
  if (g === "unexplored") return "#8a94b0";
  return "#e4a65a"; // uncertain default
}

function nodeKey(label: string): string {
  return label.trim().toLowerCase();
}

function layoutGraph(edges: GraphEdgeInput[]): {
  nodes: LayoutNode[];
  links: LayoutEdge[];
} {
  const nodeMap = new Map<string, LayoutNode>();
  const links: LayoutEdge[] = [];

  for (const e of edges) {
    const sKey = nodeKey(e.subject);
    const oKey = nodeKey(e.object);
    if (!nodeMap.has(sKey)) {
      nodeMap.set(sKey, {
        id: sKey,
        label: e.subject,
        x: 0,
        y: 0,
        packs: new Set([e.pack]),
      });
    } else {
      nodeMap.get(sKey)!.packs.add(e.pack);
    }
    if (!nodeMap.has(oKey)) {
      nodeMap.set(oKey, {
        id: oKey,
        label: e.object,
        x: 0,
        y: 0,
        packs: new Set([e.pack]),
      });
    } else {
      nodeMap.get(oKey)!.packs.add(e.pack);
    }
    links.push({ ...e, sourceId: sKey, targetId: oKey });
  }

  const nodes = [...nodeMap.values()];
  const n = Math.max(nodes.length, 1);
  const cx = 420;
  const cy = 260;
  const radius = Math.min(210, 40 + n * 12);
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    node.x = cx + radius * Math.cos(angle);
    node.y = cy + radius * Math.sin(angle);
  });

  return { nodes, links };
}

export function DiscoveryGraphExplorer({
  edges,
  defaultPacks = ["ra"],
}: {
  edges: GraphEdgeInput[];
  defaultPacks?: GraphPackToggle[];
}) {
  const [packs, setPacks] = useState<Set<GraphPackToggle>>(
    () => new Set(defaultPacks),
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const filtered = useMemo(
    () => edges.filter((e) => packs.has(e.pack)),
    [edges, packs],
  );

  const { nodes, links } = useMemo(() => layoutGraph(filtered), [filtered]);

  const selectedEdge =
    links.find((l) => l.edgeId === selectedEdgeId) ??
    (selectedNodeId
      ? links.find(
          (l) =>
            l.sourceId === selectedNodeId || l.targetId === selectedNodeId,
        )
      : undefined);

  function togglePack(p: GraphPackToggle) {
    setPacks((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        if (next.size > 1) next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
    setSelectedEdgeId(null);
    setSelectedNodeId(null);
  }

  const availablePacks = useMemo(() => {
    const set = new Set<GraphPackToggle>();
    for (const e of edges) set.add(e.pack);
    return (["ra", "ssc", "gut", "neuro"] as GraphPackToggle[]).filter((p) =>
      set.has(p),
    );
  }, [edges]);

  return (
    <div className="dc-graph">
      <div className="dc-panel-head" style={{ marginBottom: "0.85rem" }}>
        <h3>Evidence graph</h3>
        <span className="dc-pill">
          {filtered.length} edges · {nodes.length} nodes · not diagnostic
        </span>
      </div>

      <p className="muted" style={{ marginBottom: "0.85rem" }}>
        Interactive MAP graph from regenerable pack JSON. Grades stay honest.
        Click an edge or node for the evidence card. Not CDS / not for clinical
        use.
      </p>

      <div className="dc-chip-row" style={{ marginBottom: "1rem" }}>
        {availablePacks.map((p) => (
          <button
            key={p}
            type="button"
            className={`dc-pill dc-pill-btn${packs.has(p) ? " dc-filter-on" : ""}`}
            onClick={() => togglePack(p)}
            aria-pressed={packs.has(p)}
          >
            {PACK_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="dc-graph-layout">
        <svg
          className="dc-graph-canvas"
          viewBox="0 0 840 520"
          role="img"
          aria-label="Evidence graph explorer"
        >
          <defs>
            <marker
              id="dc-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(143,168,255,0.55)" />
            </marker>
          </defs>

          {links.map((link) => {
            const s = nodes.find((n) => n.id === link.sourceId)!;
            const t = nodes.find((n) => n.id === link.targetId)!;
            const active = selectedEdge?.edgeId === link.edgeId;
            return (
              <g key={link.edgeId}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={gradeColor(link.evidenceGrade)}
                  strokeOpacity={active ? 0.95 : 0.45}
                  strokeWidth={active ? 3.2 : 1.6}
                  markerEnd="url(#dc-arrow)"
                  className="dc-graph-edge"
                  onClick={() => {
                    setSelectedEdgeId(link.edgeId);
                    setSelectedNodeId(null);
                  }}
                />
                <title>
                  {link.subject} —[{link.predicate}]→ {link.object} ·{" "}
                  {link.evidenceGrade}
                </title>
              </g>
            );
          })}

          {nodes.map((node) => {
            const active = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                className="dc-graph-node"
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }}
              >
                <circle
                  r={active ? 16 : 12}
                  fill={active ? "rgba(57,101,250,0.95)" : "rgba(19,25,48,0.92)"}
                  stroke="rgba(143,168,255,0.65)"
                  strokeWidth={active ? 2.4 : 1.4}
                />
                <text
                  y={28}
                  textAnchor="middle"
                  className="dc-graph-label"
                >
                  {node.label.length > 28
                    ? `${node.label.slice(0, 26)}…`
                    : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <aside className="dc-graph-card" aria-live="polite">
          <span className="panel-label">Evidence card</span>
          {selectedEdge ? (
            <>
              <div className="dc-panel-head" style={{ marginTop: "0.55rem" }}>
                <span
                  className={`dc-grade dc-grade-${selectedEdge.evidenceGrade.toLowerCase()}`}
                >
                  {selectedEdge.evidenceGrade}
                </span>
                <span className="dc-pill">{PACK_LABEL[selectedEdge.pack]}</span>
                {selectedEdge.teachingStatus ? (
                  <span className="dc-pill">
                    teaching={selectedEdge.teachingStatus}
                  </span>
                ) : null}
              </div>
              <h4 style={{ marginTop: "0.75rem" }}>
                {selectedEdge.subject}{" "}
                <em style={{ color: "var(--slate)", fontStyle: "normal" }}>
                  —[{selectedEdge.predicate}]→
                </em>{" "}
                {selectedEdge.object}
              </h4>
              {selectedEdge.claimText ? (
                <p className="muted" style={{ marginTop: "0.55rem" }}>
                  {selectedEdge.claimText}
                </p>
              ) : null}
              <div className="dc-meta-row" style={{ marginTop: "0.75rem" }}>
                <code className="dc-mono">{selectedEdge.edgeId}</code>
                <code className="dc-mono">{selectedEdge.claimId}</code>
              </div>
              {selectedEdge.pmid ? (
                <p style={{ marginTop: "0.75rem" }}>
                  <a
                    href={
                      selectedEdge.sourceUrl ??
                      `https://pubmed.ncbi.nlm.nih.gov/${selectedEdge.pmid}/`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    PMID {selectedEdge.pmid}
                  </a>
                  {selectedEdge.citationLabel ? (
                    <span className="muted">
                      {" "}
                      — {selectedEdge.citationLabel}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="muted" style={{ marginTop: "0.75rem" }}>
                  No PMID on this edge.
                </p>
              )}
              <p className="dc-axes-note" style={{ marginTop: "0.85rem" }}>
                Not diagnostic. Grades are research intelligence only — never
                collapse teachingStatus ≠ hsiGrade ≠ CDS.
              </p>
            </>
          ) : (
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Select an edge (or node neighbourhood) to inspect claim, grade,
              and PMID provenance.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Helpers to project pack evidence rows into graph edges. */
export function raRowsToGraphEdges(rows: EvidenceRow[]): GraphEdgeInput[] {
  return rows.map((r) => ({
    pack: "ra" as const,
    edgeId: r.edgeId,
    claimId: r.claimId,
    subject: r.subject,
    predicate: r.relationship,
    object: r.object,
    evidenceGrade: r.evidenceGrade,
    teachingStatus: undefined,
    pmid: r.source.pmid,
    citationLabel: r.source.citationLabel,
    sourceUrl: r.source.sourceUrl,
    claimText: r.claimText,
  }));
}

export function packMapToGraphEdges(
  pack: GraphPackToggle,
  rows: Array<{
    edgeId: string;
    claimId?: string;
    subject: string;
    predicate: string;
    object: string;
    evidenceGrade: string;
    teachingStatus?: string;
    pmid: string | null;
    citationLabel?: string | null;
    sourceUrl?: string | null;
  }>,
): GraphEdgeInput[] {
  return rows.map((r) => ({
    pack,
    edgeId: r.edgeId,
    claimId: r.claimId ?? r.edgeId.replace("HSI-E-", "HSI-C-"),
    subject: r.subject,
    predicate: r.predicate,
    object: r.object,
    evidenceGrade: r.evidenceGrade,
    teachingStatus: r.teachingStatus,
    pmid: r.pmid,
    citationLabel: r.citationLabel,
    sourceUrl: r.sourceUrl,
  }));
}
