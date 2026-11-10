import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GraphVisual } from "../../features/science/GraphVisual";
import {
  GRAPH_HONESTY,
  GRAPH_KIND_COLOURS,
  graphStartingPoints,
} from "../../features/science/graphExplorer";
import { SCIENCE_GRAPH } from "../../features/science/knowledgeGraph";
import "../../styles/graph-explorer.css";

const STARTERS = graphStartingPoints(SCIENCE_GRAPH, 6);

/** Interactive educational knowledge graph on the homepage — teases `/science/graph`. */
export function HomeKnowledgeGraph() {
  const titleId = useId();
  const defaultId = STARTERS[0]?.id ?? SCIENCE_GRAPH.nodes[0]!.id;
  const [selectedId, setSelectedId] = useState(defaultId);
  const selected = useMemo(
    () => SCIENCE_GRAPH.nodes.find((n) => n.id === selectedId) ?? SCIENCE_GRAPH.nodes[0]!,
    [selectedId],
  );
  const neighbourCount = SCIENCE_GRAPH.edges.filter(
    (e) => e.subjectId === selected.id || e.objectId === selected.id,
  ).length;

  return (
    <section className="cl-home-kg cl-chapter" aria-labelledby={titleId}>
      <div className="cl-chapter-inner cl-home-kg-head">
        <h2 id={titleId}>Explore the Living Health Knowledge Graph.</h2>
        <p className="cl-chapter-lead">
          Cross-domain educational map of human systems. Select a concept, inspect neighbours, then open the full
          explorer for filters and dossiers.
        </p>
        <p className="cl-home-kg-banner" role="note">
          Educational draft · scientificApproval=
          {String(GRAPH_HONESTY.scientificApproval)} · clinicalAdvice=
          {String(GRAPH_HONESTY.clinicalAdvice)} · layout is not biology
        </p>
      </div>

      <div className="cl-chapter-inner cl-home-kg-board">
        <div className="cl-home-kg-starters" role="toolbar" aria-label="Starting points by biological system">
          {STARTERS.map((starter) => (
            <button
              key={starter.id}
              type="button"
              className="cl-home-kg-starter"
              aria-pressed={selected.id === starter.id}
              onClick={() => setSelectedId(starter.id)}
            >
              <i
                style={{ background: GRAPH_KIND_COLOURS[starter.kind] ?? "#9bcac0" }}
                aria-hidden="true"
              />
              <span>{starter.family}</span>
              <strong>{starter.label}</strong>
            </button>
          ))}
        </div>

        <div className="cl-home-kg-stage">
          <GraphVisual
            graph={SCIENCE_GRAPH}
            selected={selected.id}
            onSelect={setSelectedId}
            caption="Homepage educational draft · no scientific approval or clinical advice"
            exportMetadata={{
              scope: "homepage_educational_topic_map",
              surface: GRAPH_HONESTY.surface,
              graphVersion: SCIENCE_GRAPH.version,
            }}
          />
        </div>

        <aside className="cl-home-kg-inspect" aria-live="polite">
          <p className="cl-home-kg-inspect-kicker">Selected concept</p>
          <h3>{selected.label}</h3>
          <p className="cl-home-kg-meta">
            {selected.kind}
            {selected.system ? ` · ${selected.system}` : ""} · {selected.reviewState.replaceAll("_", " ")} ·{" "}
            {neighbourCount} connections in view
          </p>
          <p>{selected.description}</p>
          <p className="cl-home-kg-honesty" role="note">
            Lines are recorded topic connections, not validated causality. Coverage is unequal across domains.
          </p>
          <div className="cl-home-kg-actions">
            <Link to={`/science/graph?node=${encodeURIComponent(selected.id)}`}>Open full graph</Link>
            <Link to="/science">Science overview</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
