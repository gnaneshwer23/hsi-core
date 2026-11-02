import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  assessTrialCriteria,
  CRITERION_STATE_LEGEND,
  CRITERION_STATES,
  DEMO_PATIENT_FIXTURES,
  getDemoPatientFixture,
  getDemoTrialStub,
  listDemoTrialStubs,
  type CriterionState,
} from "../../../src/trialsCriteriaMvp";

const DEFAULT_TRIAL_ID = "DEMO-NCT-SYNTH";
const DEFAULT_PATIENT_ID = "syn-trial-patient-partial";
const DEMO_NOW = new Date("2026-11-02T12:00:00.000Z");

const STATE_LABEL: Record<CriterionState, string> = {
  satisfied: "satisfied",
  not_satisfied: "not_satisfied",
  unknown: "unknown",
  ambiguous: "ambiguous",
  requires_investigator_review: "requires_investigator_review",
};

export function TrialsCriteria() {
  const trialStubs = listDemoTrialStubs();
  const [trialId, setTrialId] = useState(DEFAULT_TRIAL_ID);
  const [patientId, setPatientId] = useState(DEFAULT_PATIENT_ID);
  const trial = getDemoTrialStub(trialId);
  const patient = getDemoPatientFixture(patientId);

  if (!trial || !patient) {
    return (
      <>
        <PageHero
          eyebrow="HSI Trials · Planned"
          title={
            <>
              Criteria demo{" "}
              <span className="accent">unavailable.</span>
            </>
          }
          lede="Demo trial or patient fixture missing. Fail closed — no eligibility claim."
        />
        <section className="section section-grid-light">
          <div className="container">
            <Link to="/status#trials" className="btn btn-ghost">
              Back to status
            </Link>
          </div>
        </section>
      </>
    );
  }

  const report = assessTrialCriteria({
    trialId: trial.trialId,
    criteria: trial.criteria,
    patient,
    now: DEMO_NOW,
  });

  const stateCounts = CRITERION_STATES.reduce(
    (acc, s) => {
      acc[s] = report.assessments.filter((a) => a.state === s).length;
      return acc;
    },
    {} as Record<CriterionState, number>,
  );

  return (
    <>
      <PageHero
        eyebrow="HSI Trials · Planned · syntheticOnly"
        title={
          <>
            Criterion five-state{" "}
            <span className="accent">assessment only.</span>
          </>
        }
        lede="Path B / Cap 8 MVP. Multi-trial stub picker — never emits confirmed eligible, patient eligible, or AI confirmed eligible. Investigator owns enrolment decisions."
      />

      <section className="section section-grid-light">
        <div className="container">
          <div className="dc-banner-stack demo-banner-stack">
            <p className="dc-banner dc-banner-danger demo-banner-on-light">
              Never confirmed eligible · confirmedEligible=false · patientEligible=false ·
              overallLabel=criterion_assessment_only ({report.overallLabel})
            </p>
            <p className="dc-banner dc-banner-warn demo-banner-on-light">
              syntheticOnly=true · containsPhi=false · no live registry matcher
            </p>
          </div>

          <div className="trials-never-eligible" role="note">
            <h3>Never confirmed eligible</h3>
            <p>
              Aggregate label is always <code>criterion_assessment_only</code>. Satisfied criteria
              do not accumulate into enrolment suitability. Affirmative enrolment labels (the
              confirmed-/patient-/AI-confirmed-eligible family) are blocked in the report path.
            </p>
          </div>

          <div className="demo-meta-grid">
            <article className="product-card">
              <h3>Trial</h3>
              <p>
                <code>{report.trialId}</code>
              </p>
              <p className="xs muted">{trial.registryNote}</p>
            </article>
            <article className="product-card">
              <h3>Patient fixture</h3>
              <p>
                <code>{report.patientFixtureId}</code>
              </p>
              <p className="xs muted">Synthetic attributes only.</p>
            </article>
            <article className="product-card">
              <h3>Aggregate label</h3>
              <p>
                <code>{report.overallLabel}</code>
              </p>
              <p className="xs muted">Never an enrolment suitability claim.</p>
            </article>
            <article className="product-card">
              <h3>Eligibility flags</h3>
              <p>
                <code>confirmedEligible={String(report.confirmedEligible)}</code>
              </p>
              <p>
                <code>patientEligible={String(report.patientEligible)}</code>
              </p>
            </article>
          </div>

          <div className="section-head" style={{ marginTop: "2rem" }}>
            <span className="section-num">TRIALS</span>
            <h2 className="display display-md">Synthetic trial stubs.</h2>
          </div>
          <div className="demo-fixture-switch" role="group" aria-label="Trial stubs">
            {trialStubs.map((t) => (
              <button
                key={t.trialId}
                type="button"
                className={`demo-fixture-btn${
                  t.trialId === trialId ? " demo-fixture-btn-active" : ""
                }`}
                onClick={() => setTrialId(t.trialId)}
              >
                <code>{t.trialId}</code>
                <span className="muted">{t.displayLabel}</span>
              </button>
            ))}
          </div>

          <div className="section-head" style={{ marginTop: "2rem" }}>
            <span className="section-num">PATIENT</span>
            <h2 className="display display-md">Synthetic patient fixtures.</h2>
          </div>
          <div className="demo-fixture-switch" role="group" aria-label="Trial patient fixtures">
            {DEMO_PATIENT_FIXTURES.map((f) => (
              <button
                key={f.fixtureId}
                type="button"
                className={`demo-fixture-btn${
                  f.fixtureId === patientId ? " demo-fixture-btn-active" : ""
                }`}
                onClick={() => setPatientId(f.fixtureId)}
              >
                <code>{f.fixtureId}</code>
                <span className="muted">
                  syntheticOnly={String(f.syntheticOnly)} · containsPhi=
                  {String(f.containsPhi)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-elevated" id="criterion-legend">
        <div className="container">
          <div className="section-head">
            <span className="section-num">FIVE STATES</span>
            <h2 className="display display-md">Criterion state legend.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "40rem" }}>
            Closed Path B vocabulary. Present in this fixture:{" "}
            {CRITERION_STATES.filter((s) => stateCounts[s] > 0)
              .map((s) => `${STATE_LABEL[s]}×${stateCounts[s]}`)
              .join(" · ") || "none"}
            .
          </p>
          <div className="criterion-legend-grid">
            {CRITERION_STATE_LEGEND.map((entry) => (
              <article key={entry.state} className="criterion-legend-card">
                <span className={`criterion-state criterion-state-${entry.state}`}>
                  {entry.label}
                </span>
                <p className="xs muted">{entry.meaning}</p>
                <p className="xs muted">
                  In fixture: <code>{stateCounts[entry.state]}</code>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">ASSESSMENTS</span>
            <h2 className="display display-md">Per-criterion table.</h2>
          </div>
          <div className="dc-table-wrap">
            <table className="dc-table demo-table">
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>State</th>
                  <th>Attribute</th>
                  <th>Value</th>
                  <th>Method</th>
                  <th>Provenance</th>
                  <th>confirmedEligible</th>
                </tr>
              </thead>
              <tbody>
                {report.assessments.map((a) => (
                  <tr key={a.criterionId}>
                    <td>{a.criterionText}</td>
                    <td>
                      <span className={`criterion-state criterion-state-${a.state}`}>
                        {a.state}
                      </span>
                    </td>
                    <td>
                      <code>{a.attributeKey}</code>
                    </td>
                    <td>
                      {a.attributePresent ? (
                        <code>{String(a.attributeValue)}</code>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <code>{a.method}</code>
                    </td>
                    <td>
                      <span className="provenance-chip">{a.provenanceSource}</span>
                    </td>
                    <td>
                      <code>{String(a.confirmedEligible)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.missingAttributes.length > 0 ? (
            <>
              <div className="section-head" style={{ marginTop: "2rem" }}>
                <span className="section-num">UNKNOWN</span>
                <h2 className="display display-md">Missing attributes panel.</h2>
              </div>
              <div className="missing-info-panel">
                {report.missingAttributes.map((attr) => (
                  <article key={attr} className="missing-info-card">
                    <div className="missing-info-card-head">
                      <code>{attr}</code>
                      <span className="criterion-state criterion-state-unknown">unknown</span>
                    </div>
                    <p>
                      Attribute omitted in the synthetic fixture — state{" "}
                      <code>unknown</code> is meta about absence, not a negative clinical fact.
                    </p>
                    <div className="tag-row">
                      <span className="tag tag-light">missing ≠ negative</span>
                      <span className="tag tag-light">not confirmed eligible</span>
                      <span className="provenance-chip">fixture://trials-attrs</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">HONESTY</span>
            <h2 className="display display-md">Binding limits.</h2>
          </div>
          <ul className="checklist">
            {report.honesty.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1.5rem" }}>
            <Link to="/status#trials" className="btn btn-ghost">
              Trials status
            </Link>
            <Link to="/status#demos" className="text-link">
              All demos
            </Link>
            <Link to="/clinical-timeline" className="text-link">
              Clinical synthetic timeline →
            </Link>
            <Link to="/gateway" className="text-link">
              Gateway →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
