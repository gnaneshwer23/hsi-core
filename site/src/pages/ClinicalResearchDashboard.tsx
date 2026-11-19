import { useState } from "react";
import { Link } from "react-router-dom";
import { ClinicalResearchShell } from "../components/enterprise/ClinicalResearchShell";
import {
  clinicalResearchDashboardDemo,
  type ClinicalAssociation,
} from "@hsi/enterprise/clinicalResearchDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Clinical Research shell — synthetic demonstration only; not CDS; no PHI. */
export function ClinicalResearchDashboard() {
  const demo = clinicalResearchDashboardDemo();
  const [selectedAssoc, setSelectedAssoc] = useState<ClinicalAssociation>(
    demo.associations[0]!,
  );
  const maxBar = Math.max(...demo.opsCharts.flatMap((c) => c.bars.map((b) => b.value)), 1);

  return (
    <ClinicalResearchShell
      title={demo.programmeName}
      subtitle="Authorised clinical research teams · synthetic preview"
    >
      <p className="ent-banner" role="status">
        {demo.boundaryNote} {demo.collaborationNote} Association is not causation.
        Ops charts below are labelled demonstration counts.
      </p>

      <section className="ent-stats" aria-label="Clinical research summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.syntheticCohortSlots}</strong>
          <span>Cohort slots</span>
          <em>Synthetic / held</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.phenotypeCount}</strong>
          <span>Phenotype sketches</span>
          <em>Research phenotypes</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.trialResearchCount}</strong>
          <span>Trial research rows</span>
          <em>Not bedside CDS</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.associationCount}</strong>
          <span>Associations</span>
          <em>≠ causation</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="clin-cohort-heading">
          <h2 id="clin-cohort-heading">Approved research cohorts</h2>
          <p className="ent-lead">
            Synthetic clinical plane only in this repo. Durable approved cohorts stay
            disabled until ADR-0010 owner gates close.
          </p>
          <ul>
            {demo.cohorts.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong> — {c.dataClass.replaceAll("_", " ")}; enabled:{" "}
                {String(c.enabled)}. {c.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn" to="/research/cohort">
              Open synthetic cohort plane
            </Link>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="clin-pheno-heading">
          <h2 id="clin-pheno-heading">Disease phenotypes (research)</h2>
          <p className="ent-lead">
            Passport / phenotype metadata for research — never chart write-back.
          </p>
          <ul>
            {demo.phenotypes.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong> · {p.reviewStatus.replaceAll("_", " ")}.{" "}
                {p.passportHonesty}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
              Open live investigation / passport
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="clin-obs-heading">
        <h2 id="clin-obs-heading">Longitudinal laboratory observations</h2>
        <p className="ent-lead">Proposed research observations — synthetic demo series only.</p>
        {demo.observations.map((o) => (
          <div key={o.id}>
            <strong>{o.label}</strong>
            <p className="ent-lead">
              {o.points.map((p) => `${p.t}:${p.valueLabel}`).join(" · ")} — {o.note}
            </p>
          </div>
        ))}
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="clin-trial-heading">
          <h2 id="clin-trial-heading">Trial eligibility research</h2>
          <p className="ent-lead">
            Research planning support — not bedside eligibility CDS. Investigators retain
            every decision.
          </p>
          <ul>
            {demo.trials.map((t) => (
              <li key={t.id}>
                <strong>{t.title}</strong> · {t.phaseLabel}. Honesty:{" "}
                {t.eligibilityHonesty.replaceAll("_", " ")}. {t.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn" to="/research/prescreen">
              Synthetic pre-screening
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/science/clinical-trials">
              Clinical trials science page
            </Link>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="clin-assoc-heading">
          <h2 id="clin-assoc-heading">Molecular–clinical associations</h2>
          <p className="ent-lead">Candidate links only — association ≠ causation.</p>
          <div className="ent-tree" role="list">
            {demo.associations.map((a) => (
              <button
                key={a.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selectedAssoc.id === a.id}
                onClick={() => setSelectedAssoc(a)}
              >
                <strong>{a.claim}</strong>
                <span>{a.reviewStatus.replaceAll("_", " ")}</span>
                <span>association ≠ causation: {String(a.associationNotCausation)}</span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
              Selected association
            </h3>
            <p className="ent-lead" style={{ margin: 0 }}>
              {selectedAssoc.claim}. Not causation. Open the next surface for evidence-bound
              fields.
            </p>
            <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
              <Link className="ent-btn ent-btn-secondary" to={selectedAssoc.nextSurface}>
                Next investigation surface
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="clin-ops-heading">
        <h2 id="clin-ops-heading">Ops analytics (demonstration)</h2>
        <p className="ent-lead">
          Enrollment / site sketches for trials research chrome. Values are synthetic
          labelled demos — never invent conversion or safety claims.
        </p>
        {demo.opsCharts.map((chart) => (
          <div key={chart.id}>
            <strong>{chart.title}</strong>
            <p className="ent-lead">{chart.note}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
              {chart.bars.map((b) => (
                <li
                  key={b.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "5rem 1fr 2.5rem",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.35rem",
                  }}
                >
                  <span>{b.label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "block",
                      height: "0.55rem",
                      background: "var(--ent-accent, #1a4a6b)",
                      width: `${Math.round((b.value / maxBar) * 100)}%`,
                      borderRadius: "2px",
                    }}
                  />
                  <span>{b.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="ent-panel" aria-labelledby="clin-gaps-heading">
        <h2 id="clin-gaps-heading">Research questions</h2>
        <ul>
          {demo.opportunities.map((g) => (
            <li key={g.id}>
              <strong>{g.question}</strong>
              <p className="ent-lead">
                {g.entities.join(" · ")}. Uncertainty: {g.uncertainty}. Review:{" "}
                {g.reviewStatus}.
              </p>
              <div className="ent-actions">
                <Link className="ent-btn ent-btn-secondary" to={g.nextInvestigation}>
                  Next surface
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </ClinicalResearchShell>
  );
}
