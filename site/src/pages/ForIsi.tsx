import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";

export function ForIsi() {
  return (
    <>
      <PageHero
        eyebrow="For ISI · discovery"
        title={
          <>
            Explore with
            <br />
            <span className="accent">honest grades.</span>
          </>
        }
        lede="Immune Super Intelligence consumes published HSI exports for Ask, Radar, and REL suggestions. Discovery never becomes diagnosis support."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <h2 className="display display-md">
              Consumer,
              <br />
              not editor.
            </h2>
            <p className="lede">
              immunecity and the ISI site pull buildIsiExportBundle / exports/.
              Gate C approve stays human in the product — hsi-core ships maps and
              checklists, not silent promotions.
            </p>
          </div>
          <ul className="checklist" style={{ marginTop: "2rem" }}>
            <li>Discovery / Ask / Radar only</li>
            <li>Honest established / uncertain / unexplored labels</li>
            <li>REL-* suggestion map — curation pointers, never auto-approve</li>
            <li>Do not edit immunecity for HSI substrate work</li>
          </ul>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num" style={{ color: "var(--teal-mid)" }}>
              ARTIFACTS
            </span>
            <h2 className="display display-md">What ISI pulls</h2>
          </div>
          <table className="axis-table">
            <thead>
              <tr>
                <th>Command / API</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>bun run export:isi</code>
                </td>
                <td>ISI JSON export bundle (hsi-isi-export-1)</td>
              </tr>
              <tr>
                <td>
                  <code>bun run export:isi-map</code>
                </td>
                <td>REL suggestion map for Gate C handoff</td>
              </tr>
              <tr>
                <td>
                  <code>buildIsiExportBundle()</code>
                </td>
                <td>Programmatic consumer entry</td>
              </tr>
              <tr>
                <td>
                  <code>listIsiRelSuggestions()</code>
                </td>
                <td>Curation pointers only</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "1.75rem" }}>
            <Link to="/docs" className="btn btn-ink">
              How to run exports <span className="arrow">↗</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-teal">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="section-num">HARD LINE</span>
            <h2 className="display display-md">ISI ≠ CDS</h2>
            <p className="lede">
              Treating discovery as clinical decision support collapses the
              portfolio. Uncertain and unexplored edges exist so the graph can
              stay honest — not so they can slip into clinic cards.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
