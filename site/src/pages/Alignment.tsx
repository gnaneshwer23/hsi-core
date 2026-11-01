import { PageHero } from "../components/PageHero";

export function Alignment() {
  return (
    <>
      <PageHero
        eyebrow="Repo alignment · stack"
        title={
          <>
            Hub and spokes.
            <br />
            <span className="accent">One edit target.</span>
          </>
        }
        lede="hsi-core owns the graded graph and publishes read-only exports. Everything else consumes, shelves, or waits for P3."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="hub-spoke">
            <div className="hub-node">
              <span className="mono" style={{ color: "var(--phosphor)" }}>
                CORE
              </span>
              <h2 className="display" style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>
                gnaneshwer23/hsi-core
              </h2>
              <p className="muted" style={{ marginTop: "0.75rem" }}>
                Sole substrate: grades, seeds, validation, ISI + Aksh exports,
                Gate C docs. Edit here only.
              </p>
            </div>
            <div className="spoke-list">
              <div className="spoke-item consumer">
                <div className="kind">consumer</div>
                <strong>ISI / immunecity</strong>
                <p className="muted" style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  Discovery Ask / Radar — pull exports; do not edit for HSI.
                </p>
              </div>
              <div className="spoke-item consumer">
                <div className="kind">consumer</div>
                <strong>Aksh Health</strong>
                <p className="muted" style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  HITL cards when isCdsSurfacable — consume aksh: map + stubs.
                </p>
              </div>
              <div className="spoke-item reference">
                <div className="kind">reference-only</div>
                <strong>swift-deliveries / hsi-sources</strong>
                <p className="muted" style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  HITL UX patterns / curator shelf — never runtime deps of the core.
                </p>
              </div>
              <div className="spoke-item deferred">
                <div className="kind">deferred · P3</div>
                <strong>AF3 · Boltz · ESM · RDKit · TDC · …</strong>
                <p className="muted" style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  Optional plugins after license review — never grade authority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
              STATUSES
            </span>
            <h2 className="display display-md">Alignment vocabulary</h2>
          </div>
          <table className="axis-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>core</strong>
                </td>
                <td>Sole substrate; edit here</td>
              </tr>
              <tr>
                <td>
                  <strong>consumer</strong>
                </td>
                <td>Pulls published export/API; do not edit for HSI</td>
              </tr>
              <tr>
                <td>
                  <strong>data-source</strong>
                </td>
                <td>Public evidence corpus; ingest pointers only (no PHI)</td>
              </tr>
              <tr>
                <td>
                  <strong>deferred</strong>
                </td>
                <td>Useful later; not wired until P3+ and license review</td>
              </tr>
              <tr>
                <td>
                  <strong>reference-only</strong>
                </td>
                <td>Pattern or shelf; never a dependency of the evidence core</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "1.5rem", color: "rgba(19,25,48,0.65)" }}>
            Full portfolio map:{" "}
            <code>docs/VISION_REPO_ALIGNMENT.md</code>
          </p>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="section-num">NON-NEGOTIABLES</span>
            <h2 className="display display-md">Every spoke inherits these.</h2>
          </div>
          <ul className="checklist">
            <li>Graph and Gate C before agents</li>
            <li>hsiGrade=established requires curationReview=approved</li>
            <li>No unsupported diagnosis; ISI ≠ CDS</li>
            <li>No PHI in seeds/exports; no PHI → LLM on production paths</li>
            <li>Bio-structure / generative tools do not flip evidence grades</li>
            <li>Edit only hsi-core for HSI</li>
          </ul>
        </div>
      </section>
    </>
  );
}
