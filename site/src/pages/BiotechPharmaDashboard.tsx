import { useState } from "react";
import { Link } from "react-router-dom";
import { BiotechShell } from "../components/enterprise/BiotechShell";
import { DemoUniverseRolePanel } from "../components/demo/DemoUniverseRolePanel";
import {
  biotechDashboardDemo,
  type BiotechTarget,
} from "@hsi/enterprise/biotechDashboardDemo";
import type { EnterpriseTreeNode } from "@hsi/enterprise/enterpriseDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Biotech / Pharma R&D shell — demonstration fixtures; shared science engine. */
export function BiotechPharmaDashboard() {
  const demo = biotechDashboardDemo();
  const [selectedTarget, setSelectedTarget] = useState<BiotechTarget>(demo.targets[0]!);
  const [selectedNode, setSelectedNode] = useState<EnterpriseTreeNode>(demo.targetTree[0]!);
  const [domainFilter, setDomainFilter] = useState("all");

  const nodes =
    domainFilter === "all"
      ? demo.targetTree
      : demo.targetTree.filter((n) => n.domain === domainFilter);
  const domains = ["all", ...new Set(demo.targetTree.map((n) => n.domain))];

  return (
    <BiotechShell title={demo.programmeName} subtitle="Discovery · translational · pharma R&D preview">
      <p className="ent-banner" role="status">
        {demo.governanceNote} {demo.collaborationNote} Mechanism validation here is
        fail-closed and not scientific gold. Competitor rows are illustrative only —
        no invented pipeline stages or success rates.
      </p>

      <section className="ent-stats" aria-label="Biotech summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.trackedTargetCount}</strong>
          <span>Tracked targets</span>
          <em>Demonstration</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.mechanismMapCount}</strong>
          <span>Mechanism maps</span>
          <em>Candidate · not gold</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.landscapeProgrammeCount}</strong>
          <span>Landscape programmes</span>
          <em>Public demo sketches</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.translationalGapCount}</strong>
          <span>Translational gaps</span>
          <em>Not portfolio truth</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="bio-targets-heading">
          <h2 id="bio-targets-heading">Target intelligence</h2>
          <p className="ent-lead">
            Not a separate target database — deep-link into live investigation, targets
            tools and Context Passport for evidence-bound fields.
          </p>
          <div className="ent-tree" role="list">
            {demo.targets.map((t) => (
              <button
                key={t.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selectedTarget.id === t.id}
                onClick={() => setSelectedTarget(t)}
              >
                <strong>{t.name}</strong>
                <span>{t.pathway}</span>
                <span>
                  {t.evidenceState} · {t.mechanismValidation.replaceAll("_", " ")}
                </span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
              Inspect: {selectedTarget.name}
            </h3>
            <p className="ent-lead" style={{ margin: 0 }}>
              Modality hint: {selectedTarget.modalityHint}. Evidence state{" "}
              {selectedTarget.evidenceState}. Mechanism validation is not scientific gold.
            </p>
            <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
              <Link className="ent-btn" to="/research/workspace">
                Open live investigation
              </Link>
              <Link className="ent-btn ent-btn-secondary" to="/research/targets">
                Target tools
              </Link>
            </div>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="bio-map-heading">
          <h2 id="bio-map-heading">Therapeutic landscape map</h2>
          <p className="ent-lead">
            Schematic layout for targets, mechanisms, biomarkers and translational gaps.
            Not biology; open the knowledge graph for real edges.
          </p>
          <label>
            Filter by domain{" "}
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              aria-label="Filter landscape by domain"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All domains" : d}
                </option>
              ))}
            </select>
          </label>
          <div className="ent-tree" role="list" style={{ marginTop: "0.85rem" }}>
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selectedNode.id === node.id}
                onClick={() => setSelectedNode(node)}
              >
                <strong>{node.label}</strong>
                <span>{node.domain}</span>
                <span>
                  {node.reviewStatus} · uncertainty {node.uncertainty}
                </span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
              Selected: {selectedNode.label}
            </h3>
            <p className="ent-lead" style={{ margin: 0 }}>
              Domain {selectedNode.domain}. Review {selectedNode.reviewStatus};
              uncertainty {selectedNode.uncertainty}. Schematic only — open the
              knowledge graph for real edges.
            </p>
          </div>
          <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
            <Link className="ent-btn ent-btn-secondary" to="/research/knowledge-graph">
              Explore knowledge graph
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="bio-comp-heading">
        <h2 id="bio-comp-heading">Competitor programmes (illustrative)</h2>
        <p className="ent-lead">
          Proposed metadata layer only. Status is never treated as pipeline truth.
        </p>
        <ul>
          {demo.competitors.map((c) => (
            <li key={c.id}>
              <strong>{c.label}</strong> — {c.statusLabel.replaceAll("_", " ")}. {c.note}
            </li>
          ))}
        </ul>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="bio-bm-heading">
          <h2 id="bio-bm-heading">Biomarkers</h2>
          <p className="ent-lead">
            Candidate claims only — label source and verification; not clinical
            biomarkers.
          </p>
          <ul>
            {demo.biomarkers.map((b) => (
              <li key={b.id}>
                <strong>{b.name}</strong> · {b.typeHint}. {b.sourceHonesty} (
                {b.verificationState.replaceAll("_", " ")}).
              </li>
            ))}
          </ul>
        </section>

        <section className="ent-panel" aria-labelledby="bio-port-heading">
          <h2 id="bio-port-heading">Research portfolio decisions</h2>
          <p className="ent-lead">
            Personal brief / usefulness continuity for now. Org portfolio needs grants
            and durable writes (held).
          </p>
          <ul>
            {demo.portfolio.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong> — {p.decisionState.replaceAll("_", " ")}.{" "}
                {p.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn" to="/research/workspace">
              Open brief path in workspace
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="bio-gaps-heading">
        <h2 id="bio-gaps-heading">Translational gaps</h2>
        <p className="ent-lead">
          Bridge discovery ↔ clinical <strong>research</strong> only — not bedside CDS.
        </p>
        <ul>
          {demo.translationalGaps.map((g) => (
            <li key={g.id}>
              <strong>{g.question}</strong>
              <p className="ent-lead">
                {g.entities.join(" · ")}. Uncertainty: {g.uncertainty}. Review:{" "}
                {g.reviewStatus}.
              </p>
              <div className="ent-actions">
                <Link className="ent-btn ent-btn-secondary" to={g.nextInvestigation}>
                  Next investigation surface
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/research/gaps">
            Gap register
          </Link>
        </div>
      </section>

      <DemoUniverseRolePanel roleId="biotech" />
    </BiotechShell>
  );
}
