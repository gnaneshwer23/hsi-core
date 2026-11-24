import { useState } from "react";
import { Link } from "react-router-dom";
import { FundingCareersShell } from "../components/enterprise/FundingCareersShell";
import {
  fundingCareersDashboardDemo,
  type FundingSketch,
} from "@hsi/enterprise/fundingCareersDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Funding & Careers shell — demonstration fixtures; no invented award rates. */
export function FundingCareersDashboard() {
  const demo = fundingCareersDashboardDemo();
  const [selectedFunding, setSelectedFunding] = useState<FundingSketch>(
    demo.fundingSketches[0]!,
  );

  return (
    <FundingCareersShell
      title={demo.programmeName}
      subtitle="Funding sketches · career pathways · collaborator discovery"
    >
      <p className="ent-banner" role="status">
        {demo.governanceNote}
      </p>

      <section className="ent-stats" aria-label="Funding and careers summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.fundingSketchCount}</strong>
          <span>Funding sketches</span>
          <em>Illustrative</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.careerPathwayCount}</strong>
          <span>Career pathways</span>
          <em>Store held</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.collaboratorCount}</strong>
          <span>Collaborator sketches</span>
          <em>Permission-aware</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.opportunityCount}</strong>
          <span>Candidate questions</span>
          <em>Unreviewed</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="fund-calls-heading">
          <h2 id="fund-calls-heading">Funding sketches</h2>
          <p className="ent-lead">
            Public-call and institutional sketches only. No invented award rates or
            conversion percentages.
          </p>
          <div className="ent-tree" role="group" aria-label="Funding sketches">
            {demo.fundingSketches.map((f) => (
              <button
                key={f.id}
                type="button"
                className="ent-node"
                aria-pressed={selectedFunding.id === f.id}
                onClick={() => setSelectedFunding(f)}
              >
                <strong>{f.title}</strong>
                <span>{f.sourceKind.replaceAll("_", " ")}</span>
                <span>{f.status.replaceAll("_", " ")}</span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <p className="ent-lead" style={{ margin: 0 }}>
              {selectedFunding.note} Award rate invented:{" "}
              {String(selectedFunding.inventedAwardRate)}. Conversion % invented:{" "}
              {String(selectedFunding.inventedConversionPercent)}.
            </p>
            <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
              <Link className="ent-btn" to={selectedFunding.nextSurface}>
                Related surface
              </Link>
            </div>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="fund-career-heading">
          <h2 id="fund-career-heading">Career pathways</h2>
          <p className="ent-lead">
            Proposed only — durable store held. Not a placement marketplace.
          </p>
          <ul>
            {demo.careerPathways.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong> · {c.status.replaceAll("_", " ")} · store:{" "}
                {c.durableStore}. {c.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn ent-btn-secondary" to="/welcome">
              Onboarding / profile
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/enterprise/student">
              Student shell
            </Link>
          </div>
        </section>
      </div>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="fund-collab-heading">
          <h2 id="fund-collab-heading">Collaborator sketches</h2>
          <p className="ent-lead">
            Permission-aware discovery — no automatic IP bleed.
          </p>
          <ul>
            {demo.collaborators.map((c) => (
              <li key={c.id}>
                <strong>{c.displayName}</strong> · {c.kind.replaceAll("_", " ")} ·
                auto IP bleed: {String(c.autoIpBleed)}. {c.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn ent-btn-secondary" to="/enterprise/community">
              Community shell
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/enterprise/lab">
              Lab / Omics shell
            </Link>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="fund-opp-heading">
          <h2 id="fund-opp-heading">Candidate collaboration questions</h2>
          <p className="ent-lead">
            Unreviewed — funding fit is not scientific approval.
          </p>
          <ul>
            {demo.opportunities.map((o) => (
              <li key={o.id}>
                <strong>{o.question}</strong>
                <p className="ent-lead">
                  {o.entities.join(" · ")}. Uncertainty: {o.uncertainty}. Review:{" "}
                  {o.reviewStatus}.
                </p>
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={o.nextInvestigation}>
                    Next surface
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </FundingCareersShell>
  );
}
