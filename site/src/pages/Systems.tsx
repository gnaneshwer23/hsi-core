import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  IsometricProcess,
  MiniSystemDiagram,
  PipelineDiagram,
  SystemsLayersDiagram,
} from "../components/Diagrams";
import { ClaimMarkerMock } from "../components/Mocks";

export function Systems() {
  const systems = [
    {
      n: "01",
      title: "Outcomes, published",
      body: "What ISI and Aksh see after Gate C — honest grades, maps, and gap reports.",
      kind: "outcomes" as const,
    },
    {
      n: "02",
      title: "Act, inside the graph",
      body: "Score confidence, route to discovery or HITL, write only through published exports.",
      kind: "act" as const,
    },
    {
      n: "03",
      title: "Build and prove",
      body: "Context, evaluation, and governance before anything is clinic-adjacent.",
      kind: "build" as const,
    },
    {
      n: "04",
      title: "Foundations",
      body: "Identity, permissions, and the data layer — one substrate, separate axes.",
      kind: "foundations" as const,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Human Super Intelligence"
        title={
          <>
            The shared evidence
            <br />
            <span className="accent">layer.</span>
          </>
        }
        lede="HSI is the hub: graded edges, claim→marker→observation→action stubs, and published exports. Aksh and ISI are faces of the same graph — never separate invention engines."
      />

      <section className="section section-dark-band">
        <div className="container">
          <div className="section-head">
            <span className="section-num" style={{ color: "rgba(255,255,255,0.65)" }}>
              HOW IT&apos;S DEPLOYED
            </span>
            <h2 className="display display-md" style={{ color: "#fff" }}>
              Four systems on one substrate.
            </h2>
          </div>
          <div className="sys-grid">
            {systems.map((s) => (
              <article key={s.n} className="sys-card">
                <div className="sys-card-visual">
                  <MiniSystemDiagram kind={s.kind} />
                  <div className="sys-card-meta">
                    <span>{s.n}</span>
                    <span aria-hidden>↗</span>
                  </div>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">PROCESS</span>
              <h2 className="display display-md" style={{ marginTop: "0.75rem" }}>
                Software doesn&apos;t{" "}
                <span className="text-cobalt">grade itself.</span>
              </h2>
            </div>
            <p className="lede">
              Schema → seed → Gate C → export. Curators stay in the loop until
              the artifact is publishable.
            </p>
          </div>
          <div className="iso-shell">
            <IsometricProcess />
          </div>
          <div style={{ marginTop: "2rem", maxWidth: "28rem" }}>
            <ClaimMarkerMock />
          </div>
        </div>
      </section>

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
            <Link to="/modules/isi">
              <span className="idx">02</span>
              <span className="title">For ISI discovery</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/modules/aksh-health">
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
