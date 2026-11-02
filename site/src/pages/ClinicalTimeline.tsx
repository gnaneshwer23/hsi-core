import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  buildClinicalTimelineView,
  listSyntheticTimelineFixtures,
  MISSING_INFO_KIND_LABEL,
} from "../../../src/clinicalSyntheticTimeline";

const DEFAULT_FIXTURE = "syn-t2d-multi-provider-01";

export function ClinicalTimeline() {
  const fixtures = listSyntheticTimelineFixtures();
  const [fixtureId, setFixtureId] = useState(DEFAULT_FIXTURE);
  const view = buildClinicalTimelineView(fixtureId);

  if (!view) {
    return (
      <>
        <PageHero
          eyebrow="HSI Clinical · In development"
          title={
            <>
              Synthetic timeline{" "}
              <span className="accent">unavailable.</span>
            </>
          }
          lede="Fixture failed closed. No live EMIS / hospital connector."
        />
        <section className="section section-grid-light">
          <div className="container">
            <Link to="/status#clinical" className="btn btn-ghost">
              Back to status
            </Link>
          </div>
        </section>
      </>
    );
  }

  const kindCounts = view.missingInformation.reduce(
    (acc, m) => {
      acc[m.kind] = (acc[m.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <PageHero
        eyebrow="HSI Clinical · In development · syntheticOnly"
        title={
          <>
            Longitudinal timeline,{" "}
            <span className="accent">fixtures only.</span>
          </>
        }
        lede="Multi-provider synthetic events with Cap 9 missing-information honesty. Not a reconstructed real patient history. No live EMIS, FHIR SoT, or PHI."
      />

      <section className="section section-grid-light">
        <div className="container">
          <div className="dc-banner-stack demo-banner-stack">
            <p className="dc-banner dc-banner-warn demo-banner-on-light">
              syntheticOnly=true · containsPhi=false · liveEmis=false
            </p>
            <p className="dc-banner dc-banner-info demo-banner-on-light">
              Maturity: In development — illustrative fixture {view.fixtureId}
            </p>
          </div>

          <div className="section-head">
            <span className="section-num">FIXTURE</span>
            <h2 className="display display-md">Built-in synthetic patients.</h2>
          </div>
          <div className="demo-fixture-switch" role="group" aria-label="Synthetic fixtures">
            {fixtures.map((f) => (
              <button
                key={f.fixtureId}
                type="button"
                className={`demo-fixture-btn${
                  f.fixtureId === view.fixtureId ? " demo-fixture-btn-active" : ""
                }`}
                onClick={() => setFixtureId(f.fixtureId)}
              >
                <code>{f.fixtureId}</code>
                <span className="muted">{f.displayLabel}</span>
              </button>
            ))}
          </div>

          <div className="tag-row" style={{ marginTop: "1rem" }}>
            <span className="tag tag-light">syntheticOnly</span>
            <span className="tag tag-light">no PHI</span>
            <span className="tag tag-light">no live EMIS</span>
            <span className="tag tag-light">not CDS</span>
            <span className="tag tag-light">Cap 9 missing-info</span>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">TIMELINE</span>
            <h2 className="display display-md">Events by occurredAt.</h2>
          </div>
          <div className="dc-table-wrap">
            <table className="dc-table demo-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Provider</th>
                  <th>Kind</th>
                  <th>Label</th>
                  <th>Codes</th>
                  <th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                {view.events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <code>{e.occurredAt.slice(0, 10)}</code>
                    </td>
                    <td>{e.provider}</td>
                    <td>{e.kind}</td>
                    <td>{e.label}</td>
                    <td>
                      <code>{e.codes.join(", ")}</code>
                    </td>
                    <td>
                      <span className="provenance-chip">{e.sourceSystem}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-head" style={{ marginTop: "2.5rem" }}>
            <span className="section-num">PROVIDERS</span>
            <h2 className="display display-md">Coverage counts.</h2>
          </div>
          <ul className="demo-coverage-list">
            {Object.entries(view.providerCoverage).map(([provider, count]) => (
              <li key={provider}>
                <code>{provider}</code>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-bone" id="missing-info">
        <div className="container">
          <div className="section-head">
            <span className="section-num">CAP 9</span>
            <h2 className="display display-md">Missing information panel.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "40rem" }}>
            Omitted attributes are meta about absence — not negative clinical facts. Do not invent
            values. Kind chips:{" "}
            {Object.entries(kindCounts)
              .map(([k, n]) => `${MISSING_INFO_KIND_LABEL[k as keyof typeof MISSING_INFO_KIND_LABEL] ?? k}×${n}`)
              .join(" · ")}
            .
          </p>

          <div className="missing-info-panel">
            {view.missingInformation.map((m) => (
              <article key={m.attribute} className="missing-info-card">
                <div className="missing-info-card-head">
                  <code>{m.attribute}</code>
                  <span className={`missing-kind missing-kind-${m.kind}`}>
                    {MISSING_INFO_KIND_LABEL[m.kind]}
                  </span>
                </div>
                <p>
                  <strong>Why it matters.</strong> {m.whyItMatters}
                </p>
                <p className="xs muted">
                  <strong>Verification.</strong> {m.verificationStep}
                </p>
                <div className="tag-row">
                  <span className="tag tag-light">missing ≠ negative</span>
                  <span className="tag tag-light">do not invent</span>
                  <span className="provenance-chip">fixture omission</span>
                </div>
              </article>
            ))}
          </div>

          <ul className="checklist" style={{ marginTop: "2rem" }}>
            {view.honesty.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1.5rem" }}>
            <Link to="/status#clinical" className="btn btn-ghost">
              Clinical status
            </Link>
            <Link to="/status#demos" className="text-link">
              All demos
            </Link>
            <Link to="/trials-criteria" className="text-link">
              Trials five-state demo →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
