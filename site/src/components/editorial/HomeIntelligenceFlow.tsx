import { useId } from "react";
import { Link } from "react-router-dom";
import {
  DATA_TO_DISCOVERY_STATUS_LABEL,
  type DataToDiscoveryStatus,
} from "../../lib/dataToDiscoveryArchitecture";

type FlowStage = {
  id: string;
  step: string;
  title: string;
  role: string;
  items: readonly string[];
  status: DataToDiscoveryStatus;
  note: string;
  cta: { to: string; label: string };
  emphasis?: "hub";
};

const SOURCES: FlowStage = {
  id: "sources",
  step: "01",
  title: "Scientific sources",
  role: "Evidence inputs",
  items: ["Literature", "Ontologies", "Omics", "Clinical research", "Trial registries"],
  status: "partially_implemented",
  note: "Public adapters cover some providers; broader planes remain incomplete.",
  cta: { to: "/platform", label: "Explore the platform" },
};

const GRAPH: FlowStage = {
  id: "graph",
  step: "02",
  title: "Living Health Knowledge Graph",
  role: "Connected biology",
  items: ["Entity resolution", "Typed relationships", "Provenance", "Uncertainty", "Human review"],
  status: "partially_implemented",
  note: "Draft graph tooling is public; governed writes stay fail-closed.",
  cta: { to: "/science/graph", label: "Open the science graph" },
  emphasis: "hub",
};

const INTEL: FlowStage = {
  id: "intelligence",
  step: "03",
  title: "Scientific intelligence",
  role: "Investigation",
  items: ["Evidence", "Mechanisms", "Contradictions", "Gaps", "Hypotheses"],
  status: "partially_implemented",
  note: "Bounded explorers exist; anonymous live investigation is not claimed.",
  cta: { to: "/research", label: "Research intelligence" },
};

const OUTCOMES: FlowStage = {
  id: "outcomes",
  step: "04",
  title: "Research outcomes",
  role: "Artefacts",
  items: ["Evidence maps", "Investigations", "Briefs", "Hypotheses", "Experiment planning"],
  status: "partially_implemented",
  note: "Public artefacts stay illustrative until research grants and writes are verified.",
  cta: { to: "/evidence-safety", label: "Evidence & safety" },
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

/** Architecture tease — sources → graph hub → intelligence → outcomes. */
export function HomeIntelligenceFlow() {
  const titleId = useId();

  return (
    <section className="cl-flow cl-chapter" aria-labelledby={titleId}>
      <div className="cl-chapter-inner">
        <header className="cl-flow-head">
          <h2 id={titleId}>Connecting evidence across the complexity of biology.</h2>
          <p className="cl-chapter-lead">
            Sources feed a living knowledge graph that supports scientific intelligence and research outcomes. Status
            labels describe engineering wiring — not scientific validation.
          </p>
        </header>

        <ol className="cl-flow-pipeline" aria-label="Evidence to intelligence stages">
          {STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className={"cl-flow-card" + (stage.emphasis === "hub" ? " cl-flow-card-hub" : "")}
            >
              {index > 0 ? (
                <span className="cl-flow-connector" aria-hidden="true">
                  →
                </span>
              ) : null}
              <div className="cl-flow-card-top">
                <span className="cl-flow-step">{stage.step}</span>
                <span className={`cl-flow-status ${statusTone(stage.status)}`}>
                  {DATA_TO_DISCOVERY_STATUS_LABEL[stage.status]}
                </span>
              </div>
              <p className="cl-flow-role">{stage.role}</p>
              <h3>{stage.title}</h3>
              <p className="cl-flow-note">{stage.note}</p>
              <ul className="cl-flow-chips" aria-label={`${stage.title} capabilities`}>
                {stage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="cl-flow-card-cta" to={stage.cta.to}>
                {stage.cta.label}
              </Link>
            </li>
          ))}
        </ol>

        <div className="cl-flow-foot">
          <p className="cl-flow-honesty" role="note">
            Coverage is unequal across sources and domains. Capabilities shown here are illustrative where not live.
          </p>
          <div className="cl-flow-actions">
            <Link to="/technology">Technology</Link>
            <Link to="/platform">Platform</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
