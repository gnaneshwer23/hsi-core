import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { PipelineDiagram, SystemsLayersDiagram } from "../components/Diagrams";

export function Systems() {
  return (
    <>
      <PageHero
        eyebrow="Human Systems Intelligence"
        title={
          <>
            The shared evidence
            <br />
            <span className="accent">layer.</span>
          </>
        }
        lede="HSI is the hub: graded edges, claim→marker→observation→action stubs, and published exports. Aksh and ISI are faces of the same graph — never separate invention engines."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <h2 className="display display-md">
              Graph before
              <br />
              agents.
            </h2>
            <p className="lede">
              Agents do not invent grades. Bio plugins do not promote edges.
              Humans curate Gate C. Products consume what hsi-core publishes.
            </p>
          </div>

          <div className="diagram-plane" style={{ marginTop: "2.25rem" }}>
            <SystemsLayersDiagram />
          </div>

          <div className="grade-row" style={{ marginTop: "2.75rem" }}>
            <div className="grade-cell">
              <div className="label" style={{ color: "var(--phosphor)" }}>
                Substrate
              </div>
              <h3>Edges & claims</h3>
              <p>
                T2D / immuno-metabolic bridge first. Evidence-graded relationships
                with translation card types and safety release criteria.
              </p>
            </div>
            <div className="grade-cell">
              <div className="label" style={{ color: "var(--phosphor)" }}>
                Markers
              </div>
              <h3>LOINC links</h3>
              <p>
                claim → marker (LOINC) → observation stubs keep clinic language
                grounded without shipping PHI or write-back.
              </p>
            </div>
            <div className="grade-cell">
              <div className="label" style={{ color: "var(--phosphor)" }}>
                Publish
              </div>
              <h3>Exports</h3>
              <p>
                ISI bundles, Aksh node maps, gap reports, and REL suggestions —
                read-only artifacts for consumers.
              </p>
            </div>
          </div>

          <div className="diagram-plane" style={{ marginTop: "2.5rem" }}>
            <PipelineDiagram />
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
              AXES
            </span>
            <h2 className="display display-md">Do not collapse these.</h2>
            <p className="lede">
              Three independent axes. Collapsing them into one score is an HSI
              anti-pattern.
            </p>
          </div>
          <table className="axis-table">
            <thead>
              <tr>
                <th>Axis</th>
                <th>Values</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>curationReview</strong>
                </td>
                <td>draft → approved / rejected / …</td>
                <td>ISI Gate C lifecycle — human only</td>
              </tr>
              <tr>
                <td>
                  <strong>hsiGrade</strong>
                </td>
                <td>established / uncertain / unexplored</td>
                <td>Evidence honesty for surfaces</td>
              </tr>
              <tr>
                <td>
                  <strong>teachingStatus</strong>
                </td>
                <td>established / associative / hypothesized / unknown</td>
                <td>Pedagogical framing — not a CDS switch</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "1.5rem", color: "rgba(19,25,48,0.7)" }}>
            <strong>Rule:</strong> hsiGrade=established requires
            curationReview=approved. Never promote from PMID alone.
          </p>
        </div>
      </section>

      <section className="section section-teal">
        <div className="container">
          <div className="section-head">
            <span className="section-num">NEXT</span>
            <h2 className="display display-md">Follow the spoke you need.</h2>
          </div>
          <div className="link-strip">
            <Link to="/evidence">
              <span className="idx">01</span>
              <span className="title">Evidence grades & Gate C</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/for-isi">
              <span className="idx">02</span>
              <span className="title">For ISI discovery</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/for-aksh">
              <span className="idx">03</span>
              <span className="title">For Aksh HITL</span>
              <span className="arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
