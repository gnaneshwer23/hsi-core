import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { NetworkGraphDiagram } from "../components/Diagrams";
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
        lede="Immune Super Intelligence is the research workspace for relating immune cells, states, tissues, mechanisms, diseases and evidence. HSI supplies the graded, versioned backbone. Not clinical decision support."
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
              <h2 className="display display-md" style={{ marginTop: "1.75rem" }}>
                Discovery Centre
                <br />
                <span className="accent">on real packs.</span>
              </h2>
              <p className="lede" style={{ marginTop: "0.85rem" }}>
                ASK → MAP → REVIEW on regenerable RA / anti-TNF evidence — research
                intelligence only, not bedside care.
              </p>
              <p style={{ marginTop: "1.25rem" }}>
                <Link to="/discovery" className="btn btn-primary">
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
              Honest grades.
              <br />
              <span className="accent">Human review.</span>
            </h2>
            <p className="lede">
              ISI surfaces established, uncertain and unexplored relationships so researchers
              can see what is supported — and what still needs work. Suggestions assist curation;
              humans decide what enters the product graph.
            </p>
          </div>
          <ul className="checklist" style={{ marginTop: "2rem" }}>
            <li>Discovery, Ask and Radar on graded evidence</li>
            <li>Clear established / uncertain / unexplored labels</li>
            <li>Suggestion maps that never auto-promote into the graph</li>
            <li>Versioned exports ISI can consume without silent edits</li>
          </ul>
          <div className="diagram-plane" style={{ marginTop: "2.5rem" }}>
            <NetworkGraphDiagram title="Radar sees uncertain and unexplored edges" />
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">WHERE TO GO</span>
            <h2 className="display display-md">Continue in product surfaces</h2>
          </div>
          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1.25rem" }}>
            <Link to="/discovery" className="btn btn-primary">
              Discovery Centre <span className="arrow">↗</span>
            </Link>
            <Link to="/explore" className="btn btn-ghost land-btn-on-light">
              Explore evidence
            </Link>
            <Link to="/sources" className="btn btn-ghost land-btn-on-light">
              Source registry
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-teal">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="section-num">HARD LINE</span>
            <h2 className="display display-md">ISI ≠ clinical decision support</h2>
            <p className="lede">
              Treating discovery as bedside decision support collapses the portfolio. Uncertain
              and unexplored edges exist so the graph can stay honest — not so they can slip into
              clinic cards.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
