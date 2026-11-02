import { Link } from "react-router-dom";
import { PlatformEngine } from "../components/landing/PlatformEngine";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import { EvidenceExplorer } from "../components/landing/EvidenceExplorer";
import { DiscoveryWorkbench } from "../components/landing/DiscoveryWorkbench";
import { STATUS_COLUMNS } from "../lib/productMaturity";

/**
 * HSI marketing homepage — founder HTML sections composed as:
 * 01 connected-by-design fabric (index.html) → 02 ecosystem (index 3) →
 * 03 explore (index 2) → 04 discovery engine (index 1) → honesty / status.
 */
export function Home() {
  return (
    <>
      <PlatformEngine />
      <EcosystemGrid />
      <EvidenceExplorer />
      <DiscoveryWorkbench />

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">BOUNDARIES</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Research intelligence — not bedside care.
              </h2>
            </div>
            <p className="lede">
              HSI Core supplies the graded evidence backbone for{" "}
              <strong>Immune Super Intelligence (ISI)</strong>. Agents may propose; humans
              review. No invented MoU, no automatic clinical approval, no live PHI in the
              research graph.
            </p>
          </div>
          <div className="faq">
            <details open>
              <summary>Is ISI clinical decision support?</summary>
              <p>
                No. ISI is research intelligence. It does not diagnose, select therapies at
                the bedside, score patient risk, or decide trial eligibility.
              </p>
            </details>
            <details>
              <summary>Where do patient records fit?</summary>
              <p>
                Not in the current discovery plane. Identifiable or sensitive patient data
                must not enter the general research graph or an LLM by default. Any later
                patient plane needs separate lawful basis, governance, security and clinical
                validation.
              </p>
            </details>
            <details>
              <summary>What is live today?</summary>
              <p>
                See the status columns below and the canonical{" "}
                <Link to="/status">/status</Link> page before treating any CTA as a live
                clinical product.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">STATUS</span>
            <h2 className="display display-md">Available · In development · Planned.</h2>
          </div>
          <div className="maturity-grid status-columns">
            {STATUS_COLUMNS.map((col) => (
              <article
                key={col.id}
                className={`maturity-card status-col status-col-${col.id}`}
              >
                <h3>{col.title}</h3>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="maturity-foot">
            Canonical page: <Link to="/status">/status</Link>
            {" · "}
            Deep links: <Link to="/platform">/platform</Link>
            {" · "}
            <Link to="/explore">/explore</Link>
            {" · "}
            <Link to="/discovery-engine">/discovery-engine</Link>
          </p>
        </div>
      </section>

      <section className="section section-ink cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Start from a real evidence map.</h2>
            <p className="lede">
              Open Discovery on the RA / anti-TNF question, or read how ISI consumes versioned
              exports.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/discovery" className="btn btn-primary">
              Discovery Centre <span className="arrow">↗</span>
            </Link>
            <Link to="/for-isi" className="btn btn-ghost">
              For researchers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
