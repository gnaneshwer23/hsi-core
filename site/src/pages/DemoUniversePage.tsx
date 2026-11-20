import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DemoUniverseShell } from "../components/demo/DemoUniverseShell";
import {
  buildDemoComparisonView,
  demoUniverseAllowsProductionWrite,
  listDemoScenarioSummaries,
  provenanceLabel,
  type DemoComparisonSide,
  type DemoComparisonView,
} from "../demo";
import "../styles/enterprise-dashboard.css";
import "../styles/demo-universe.css";

function provenanceKind(
  provenance: DemoComparisonSide["provenance"],
): "synthetic" | "curated" | "verified" {
  switch (provenance) {
    case "fully_synthetic_fixture":
      return "synthetic";
    case "curated_demonstration_interpretation":
      return "curated";
    case "verified_public_source":
      return "verified";
    default: {
      const _exhaustive: never = provenance;
      return _exhaustive;
    }
  }
}

function ClaimSide({ label, side }: { label: string; side: DemoComparisonSide }) {
  return (
    <article className="du-side" aria-labelledby={`du-side-${side.claimId}`}>
      <h3 id={`du-side-${side.claimId}`}>{label}</h3>
      <div className="du-meta">
        <span className="du-chip" data-kind={provenanceKind(side.provenance)}>
          {provenanceLabel(side.provenance)}
        </span>
        <span className="du-chip">{side.polarity}</span>
        {side.simulatedResultLabel ? (
          <span className="du-chip" data-kind="synthetic">
            {side.simulatedResultLabel}
          </span>
        ) : null}
      </div>
      <p>{side.summary}</p>
      <dl className="du-dl">
        <div>
          <dt>Model</dt>
          <dd>{side.contextModel}</dd>
        </div>
        <div>
          <dt>Tissue</dt>
          <dd>{side.contextTissue}</dd>
        </div>
        <div>
          <dt>Species</dt>
          <dd>{side.contextSpecies}</dd>
        </div>
        <div>
          <dt>Exposure</dt>
          <dd>{side.contextExposure}</dd>
        </div>
        <div>
          <dt>Endpoint</dt>
          <dd>{side.contextEndpoint}</dd>
        </div>
        {side.publicationTitle ? (
          <div>
            <dt>Publication</dt>
            <dd>
              {side.publicationTitle}
              {side.publicationPmid ? ` · PMID ${side.publicationPmid}` : ""}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function ComparisonBriefPanel({ view }: { view: DemoComparisonView }) {
  const [stepId, setStepId] = useState(view.journeySteps[3]?.id ?? "conflicting-findings");

  return (
    <>
      <p className="ent-banner" role="status">
        Synthetic demonstration · scientific approval:{" "}
        {String(view.honesty.scientificApproval)} · production graph write:{" "}
        {String(view.canWriteToProductionGraph)} · not clinical advice. Mode:{" "}
        {view.honesty.mode}.
      </p>

      <section className="ent-panel" aria-labelledby="du-question">
        <h2 id="du-question">Research question</h2>
        <p className="ent-lead">{view.question}</p>
        <p>
          Domain: <strong>{view.domain}</strong> · Investigation{" "}
          <code>{view.investigationId}</code>
        </p>
      </section>

      <section className="ent-panel" aria-labelledby="du-journey">
        <h2 id="du-journey">Investigation arc</h2>
        <ol className="du-journey">
          {view.journeySteps.map((step) => (
            <li key={step.id} data-active={step.id === stepId ? "true" : "false"}>
              <button type="button" onClick={() => setStepId(step.id)}>
                {step.title}
              </button>
            </li>
          ))}
        </ol>
        <p className="ent-lead" style={{ marginTop: "0.75rem" }}>
          {view.journeySteps.find((s) => s.id === stepId)?.detail}
        </p>
      </section>

      <section className="ent-panel" aria-labelledby="du-compare-heading">
        <h2 id="du-compare-heading">Conflicting findings</h2>
        <p className="ent-lead">{view.comparison.title}</p>
        <div className="du-compare">
          <ClaimSide label="Finding A" side={view.left} />
          <ClaimSide label="Finding B" side={view.right} />
        </div>
        <h3 style={{ marginTop: "1rem", fontSize: "0.95rem" }}>Why they differ</h3>
        <ul>
          {view.comparison.whyTheyDiffer.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h3 style={{ fontSize: "0.95rem" }}>Uncertainty</h3>
        <ul>
          {view.comparison.uncertaintyNotes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="du-abstention" role="note">
          <strong>Abstention.</strong> {view.comparison.abstention}
        </div>
      </section>

      <section className="ent-panel du-graph" aria-labelledby="du-mechanism">
        <div>
          <h2 id="du-mechanism">Mechanism graph (candidate)</h2>
          <p className="ent-lead">
            {view.nodes.length} nodes · {view.edges.length} edges — not scientifically
            approved.
          </p>
          <ul>
            {view.nodes.map((n) => (
              <li key={n.id}>
                <strong>{n.label}</strong> · {n.kind}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Candidate edges</h2>
          <ul>
            {view.edges.map((e) => (
              <li key={e.id}>
                {e.predicate} · {provenanceLabel(e.provenance)}
                <br />
                <span className="ent-lead">{e.uncertainty}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ent-panel" aria-labelledby="du-hyp">
        <h2 id="du-hyp">Candidate hypothesis</h2>
        <p>{view.hypothesisText}</p>
        <h3 style={{ fontSize: "0.95rem" }}>Open gaps</h3>
        <ul className="du-gaps">
          {view.gaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="ent-panel" aria-labelledby="du-brief">
        <h2 id="du-brief">Reviewable research brief</h2>
        <p className="ent-lead">{view.brief.title}</p>
        <h3 style={{ fontSize: "0.95rem" }}>Limitations</h3>
        <ul className="du-brief-limitations">
          {view.brief.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <h3 style={{ fontSize: "0.95rem" }}>Next decisions</h3>
        <ul className="du-brief-next">
          {view.brief.nextDecisions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="ent-lead" style={{ marginTop: "0.75rem" }}>
          Review status: {view.brief.honesty.reviewStatus}.{" "}
          <Link to="/science/study-comparison">Open source-grounded study comparison</Link>
          {" · "}
          <Link to="/context-conflict-audit">Context-conflict audit</Link>
        </p>
      </section>
    </>
  );
}

/** Interactive evidence comparison + brief over Demo Research Universe scenarios. */
export function DemoUniversePage() {
  const scenarios = useMemo(() => listDemoScenarioSummaries(), []);
  const [selectedId, setSelectedId] = useState(scenarios[0]?.scenarioId ?? "gut-immune-metabolic");
  const view = useMemo(() => buildDemoComparisonView(selectedId), [selectedId]);

  return (
    <DemoUniverseShell
      title={view.title}
      subtitle="Evidence comparison and reviewable brief · six seeded scenarios"
    >
      <p className="ent-banner" role="status">
        Demo Research Universe PR3. Production write allowed:{" "}
        {String(demoUniverseAllowsProductionWrite())}. Select a scenario, inspect the
        conflict pair, then read the brief limitations.
      </p>

      <section className="ent-panel" aria-labelledby="du-scenarios">
        <h2 id="du-scenarios">Scenarios</h2>
        <p className="ent-lead">
          Each scenario reuses the shared catalog. Switching scenarios does not persist or
          write research records.
        </p>
        <div className="du-scenario-list" role="list">
          {scenarios.map((s) => (
            <button
              key={s.scenarioId}
              type="button"
              role="listitem"
              aria-pressed={selectedId === s.scenarioId}
              onClick={() => setSelectedId(s.scenarioId)}
            >
              <strong>{s.title}</strong>
              <span>
                {s.domain} · {s.investigationId} · {s.status}
              </span>
            </button>
          ))}
        </div>
      </section>

      <ComparisonBriefPanel key={view.investigationId} view={view} />
    </DemoUniverseShell>
  );
}
