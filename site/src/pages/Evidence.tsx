import { PageHero } from "../components/PageHero";
import { GateCDiagram, NetworkGraphDiagram } from "../components/Diagrams";

export function Evidence() {
  return (
    <>
      <PageHero
        eyebrow="Evidence · Gate C"
        title={
          <>
            Honesty is the
            <br />
            <span className="accent">release gate.</span>
          </>
        }
        lede="Gate C is human curation. Established edges require approved review. Seeds may be evidence-linked and still pending — that tension is intentional."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="section-head">
            <span className="section-num">GRADES</span>
            <h2 className="display display-md">Three grades. Zero silent promotion.</h2>
          </div>
          <div className="grade-row">
            <div className="grade-cell grade-established">
              <div className="label">established</div>
              <h3>Clinic-adjacent</h3>
              <p>
                Only with curationReview=approved. Eligible for isCdsSurfacable
                checks on the Aksh path.
              </p>
            </div>
            <div className="grade-cell grade-uncertain">
              <div className="label">uncertain</div>
              <h3>Visible doubt</h3>
              <p>
                Shown honestly on discovery surfaces. Never treated as settled
                clinic guidance.
              </p>
            </div>
            <div className="grade-cell grade-unexplored">
              <div className="label">unexplored</div>
              <h3>Named frontier</h3>
              <p>
                Useful for radar and research framing. Forbidden as diagnosis
                support.
              </p>
            </div>
          </div>
          <div className="diagram-plane" style={{ marginTop: "2.5rem" }}>
            <NetworkGraphDiagram title="Graded edges stay explicit on the graph" />
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num" style={{ color: "var(--teal-mid)" }}>
              GATE C
            </span>
            <h2 className="display display-md">Curator checklist lives here.</h2>
            <p className="lede">
              Verified PMID ↔ REL maps ship as markdown under docs/ in hsi-core.
              Neon approve+supports remains a human product-app action outside
              this repository.
            </p>
          </div>
          <div className="diagram-plane" style={{ marginBottom: "2rem" }}>
            <GateCDiagram />
          </div>
          <ul className="checklist">
            <li>Nine evidence-linked maps with verified PMIDs (Barber, CANTOS, Herold, …)</li>
            <li>Handoff status: evidence-linked · Gate C pending until human approve</li>
            <li>Unmapped gaps stay unmapped — no invented RELs</li>
            <li>Extend seeds and export:isi-map inside hsi-core only</li>
          </ul>
          <div className="tag-row">
            <span className="tag" style={{ borderColor: "rgba(4,18,16,0.15)", color: "rgba(4,18,16,0.65)" }}>
              docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md
            </span>
            <span className="tag" style={{ borderColor: "rgba(4,18,16,0.15)", color: "rgba(4,18,16,0.65)" }}>
              bun run export:isi-map
            </span>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="section-num">SAFETY</span>
            <h2 className="display display-md">Release criteria v0</h2>
            <p className="lede">
              No unsupported diagnosis. No PHI in seeds or exports. No PHI → LLM
              on production paths that touch this substrate. Bio-structure tools
              do not flip grades.
            </p>
          </div>
          <div className="faq">
            <details open>
              <summary>Can a PMID alone establish an edge?</summary>
              <p>No. Citation supports curation; Gate C approve is human.</p>
            </details>
            <details>
              <summary>Does ISI approve equal clinic CDS?</summary>
              <p>
                No. ISI ≠ CDS. Aksh needs established + approved before any HITL
                card can surface.
              </p>
            </details>
            <details>
              <summary>Where do checklists live?</summary>
              <p>
                Under docs/ in hsi-core. Do not open immunecity or Aksh product
                PRs for substrate curation.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
