import { Link } from "react-router-dom";
import { PlatformEngine } from "../components/landing/PlatformEngine";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import { DiscoveryWorkbench } from "../components/landing/DiscoveryWorkbench";

/**
 * HSI marketing homepage — one cohesive narrative:
 * value prop + connected fabric → four products once → one research workflow demo →
 * evidence transparency / human oversight → research collaboration CTA.
 * Maturity ledger stays on /status (footer). Explore lab lives on /explore (not repeated here).
 */
export function Home() {
  return (
    <>
      <PlatformEngine />
      <EcosystemGrid
        footLink={{ to: "/products", label: "All products and maturity ↗" }}
      />
      <DiscoveryWorkbench />

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">Evidence & oversight</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Graded evidence, human review — not bedside care.
              </h2>
            </div>
            <p className="lede">
              HSI publishes context-rich claims with provenance and uncertainty. Agents may
              propose; humans review at Gate C.{" "}
              <strong>Science</strong> on this site is an educational experience. Care decisions
              stay with qualified professionals — ISI Research is not clinical decision support.
            </p>
          </div>
          <div className="faq">
            <details open>
              <summary>Is Science a clinical product?</summary>
              <p>
                No. Science is educational biology context. Clinical workflows belong to product
                planes such as Aksh Health and HSI Clinical (in development) — with their own
                governance.
              </p>
            </details>
            <details>
              <summary>Is ISI Research clinical decision support?</summary>
              <p>
                No. ISI Research explores mechanisms and evidence. It does not diagnose, select
                therapies at the bedside, score patient risk, or decide trial eligibility.
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
              <summary>What is live today?</summary>
              <p>
                See the{" "}
                <Link to="/status">status ledger</Link> for Available / In development / Planned
                labels, or open{" "}
                <Link to="/discovery">Discovery Centre</Link> on versioned evidence packs.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="section section-ink cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Collaborate on research intelligence.</h2>
            <p className="lede">
              Enter via ISI Research, browse the four-product ecosystem, or open Discovery on a
              real graded pack — not a fictional API.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/for-isi" className="btn btn-primary">
              ISI Research <span className="arrow">↗</span>
            </Link>
            <Link to="/discovery" className="btn btn-ghost">
              Discovery Centre
            </Link>
            <Link to="/products" className="btn btn-ghost">
              All products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
