import { Link } from "react-router-dom";
import { PlatformEngine } from "../components/landing/PlatformEngine";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import { EvidenceExplorer } from "../components/landing/EvidenceExplorer";
import { DiscoveryWorkbench } from "../components/landing/DiscoveryWorkbench";

/**
 * HSI marketing homepage — connected fabric → ecosystem → explore → discovery.
 * Maturity ledger stays on /status (footer), not featured here.
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
              HSI supplies the graded evidence backbone for{" "}
              <strong>Immune Super Intelligence (ISI)</strong> and related products. Agents may
              propose; humans review. Care decisions stay with qualified professionals.
            </p>
          </div>
          <div className="faq">
            <details open>
              <summary>Is ISI clinical decision support?</summary>
              <p>
                No. ISI is research intelligence. It does not diagnose, select therapies at the
                bedside, score patient risk, or decide trial eligibility.
              </p>
            </details>
            <details>
              <summary>Where do patient records fit?</summary>
              <p>
                Care records stay in product planes designed for them — such as Aksh Health. They
                do not enter the general research graph by default.
              </p>
            </details>
            <details>
              <summary>Where should I start?</summary>
              <p>
                Open the{" "}
                <Link to="/discovery">Discovery Centre</Link> on a real evidence question, or
                browse the{" "}
                <Link to="/products">four product perspectives</Link>.
              </p>
            </details>
          </div>
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
