import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { DualConsumerDiagram, NetworkGraphDiagram, TriggersFlowDiagram } from "../components/Diagrams";
import { IsiCoworkerMock } from "../components/Mocks";

export function ForIsi() {
  let discoveryUrl: string | null = null;
  try {
    const configured = import.meta.env.VITE_ISI_APP_URL as string | undefined;
    if (configured) {
      const url = new URL(configured);
      if (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
        discoveryUrl = new URL("/hsi/discovery", url).href;
      }
    }
  } catch { /* Invalid deployment configuration must not create a link. */ }
  return (
    <>
      <PageHero
        eyebrow="ISI · researcher-facing workspace"
        title={
          <>
            Explore immune evidence
            <br />
            <span className="accent">with context intact.</span>
          </>
        }
        lede="Immune Super Intelligence is the research workspace for relating immune cells, states, tissues, mechanisms, diseases and evidence. HSI Core supplies the graded, versioned backbone. Not clinical decision support."
      />

      <section className="section section-ink-dots">
        <div className="container">
          <div className="split-headline">
            <div>
              <p className="eyebrow">Connected ISI research application</p>
              <div className="dc-hero-actions">
                <a href="https://www.immune-super-intelligence.co.uk/" className="btn btn-primary" target="_blank" rel="noreferrer">Open Immune Super Intelligence ↗</a>
                {discoveryUrl ? <a href={discoveryUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">Open connected research workspace ↗</a> : null}
              </div>
              <h2 className="display display-md">
                Discovery Centre,
                <br />
                <span className="accent">Phase 7 live.</span>
              </h2>
              <p className="lede" style={{ marginTop: "0.85rem" }}>
                ASK → MAP → REVIEW on regenerable RA / anti-TNF packs — research
                intelligence only, not CDS. Co-worker card below remains
                illustrative demo chrome.
              </p>
              <p style={{ marginTop: "1.25rem" }}>
                <Link to="/discovery" className="btn btn-ink">
                  Open Discovery Centre <span className="arrow">↗</span>
                </Link>
              </p>
            </div>
            <IsiCoworkerMock />
          </div>
        </div>
      </section>

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
          <div className="diagram-plane" style={{ marginTop: "2rem" }}>
            <DualConsumerDiagram title="ISI pulls discovery faces only" />
          </div>
          <div className="diagram-plane" style={{ marginTop: "1.5rem" }}>
            <TriggersFlowDiagram title="Discovery triggers still end at Gate C" />
          </div>
          <ul className="checklist" style={{ marginTop: "2rem" }}>
            <li>Discovery / Ask / Radar only</li>
            <li>Honest established / uncertain / unexplored labels</li>
            <li>REL-* suggestion map — curation pointers, never auto-approve</li>
            <li>Do not edit immunecity for HSI substrate work</li>
          </ul>
          <div className="diagram-plane" style={{ marginTop: "2.5rem" }}>
            <NetworkGraphDiagram title="Radar sees uncertain and unexplored edges" />
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
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
