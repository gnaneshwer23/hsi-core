import { useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  DATA_TO_DISCOVERY_STATUS_LABEL,
  type DataToDiscoveryStatus,
} from "../../lib/dataToDiscoveryArchitecture";

type FlowStage = {
  id: string;
  title: string;
  items: readonly string[];
  status: DataToDiscoveryStatus;
  note: string;
};

const SOURCES: FlowStage = {
  id: "sources",
  title: "Scientific information sources",
  items: [
    "Scientific literature",
    "Biomedical ontologies",
    "Genomics and transcriptomics",
    "Proteomics and metabolomics",
    "Single-cell and spatial datasets",
    "Microbiome research",
    "Clinical research evidence",
    "Clinical trial registries",
  ],
  status: "partially_implemented",
  note: "Public adapters exist for some providers; broader ontology and omics planes remain incomplete.",
};

const GRAPH: FlowStage = {
  id: "graph",
  title: "HSI Living Health Knowledge Graph",
  items: [
    "Biological entity resolution",
    "Typed scientific relationships",
    "Evidence provenance",
    "Contextual interpretation",
    "Scientific uncertainty",
    "Temporal information",
    "Human scientific review",
  ],
  status: "partially_implemented",
  note: "Draft graph tooling is public; governed writes stay fail-closed and human-reviewed.",
};

const INTEL: FlowStage = {
  id: "intelligence",
  title: "HSI Scientific Intelligence",
  items: [
    "Evidence investigation",
    "Mechanism analysis",
    "Cross-system reasoning",
    "Contradiction analysis",
    "Research gap identification",
    "Hypothesis development",
  ],
  status: "partially_implemented",
  note: "Bounded agent stages and explorers exist; anonymous live investigation is not claimed.",
};

const OUTCOMES: FlowStage = {
  id: "outcomes",
  title: "Research outcomes",
  items: [
    "Evidence maps",
    "Mechanism investigations",
    "Research briefs",
    "Candidate hypotheses",
    "Experiment planning",
    "Translational research insights",
  ],
  status: "partially_implemented",
  note: "Outcome artefacts are illustrative on the public homepage until research grants and writes are verified.",
};

const STAGES = [SOURCES, GRAPH, INTEL, OUTCOMES] as const;

function statusTone(status: DataToDiscoveryStatus): string {
  switch (status) {
    case "integrated":
      return "cl-flow-status-ok";
    case "partially_implemented":
      return "cl-flow-status-partial";
    case "fixture_only":
      return "cl-flow-status-seed";
    case "blocked":
      return "cl-flow-status-blocked";
    case "missing":
      return "cl-flow-status-missing";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Section 3 — architecture storytelling with honest capability statuses. */
export function HomeIntelligenceFlow() {
  const titleId = useId();
  const [active, setActive] = useState<(typeof STAGES)[number]["id"]>("sources");
  const stage = STAGES.find((s) => s.id === active) ?? SOURCES;

  return (
    <section className="cl-flow cl-chapter" aria-labelledby={titleId}>
      <div className="cl-chapter-inner">
        <h2 id={titleId}>Connecting evidence across the complexity of biology.</h2>
        <p className="cl-chapter-lead">
          Sources feed a living knowledge graph that supports scientific intelligence and research outcomes. Status
          labels describe engineering wiring — not scientific validation or open anonymous execution.
        </p>
        <div className="cl-flow-rail" role="tablist" aria-label="Architecture stages">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active === s.id}
              id={`flow-tab-${s.id}`}
              aria-controls={`flow-panel-${s.id}`}
              onClick={() => setActive(s.id)}
            >
              <span className={`cl-flow-status ${statusTone(s.status)}`}>
                {DATA_TO_DISCOVERY_STATUS_LABEL[s.status]}
              </span>
              {s.title}
            </button>
          ))}
        </div>
        <article
          className="cl-flow-panel"
          id={`flow-panel-${stage.id}`}
          role="tabpanel"
          aria-labelledby={`flow-tab-${stage.id}`}
        >
          <h3>{stage.title}</h3>
          <p>{stage.note}</p>
          <ul>
            {stage.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="cl-flow-actions">
            <Link to="/technology">Open Technology architecture</Link>
            <Link to="/research">Research intelligence overview</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
