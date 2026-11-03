import { Link } from "react-router-dom";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import { EvidenceExplorer } from "../components/landing/EvidenceExplorer";

/** Public HSI entry: the ecosystem story, not the internal engineering roadmap. */
export function Home() {
  return (
    <>
      <section className="section section-ink">
        <div className="container">
          <span className="section-num">HEALTH SUPER INTELLIGENCE</span>
          <h1 className="display display-xl" style={{ maxWidth: "16ch", marginTop: "1rem" }}>
            Connecting biology, evidence and health intelligence.
          </h1>
          <p className="lede" style={{ maxWidth: "42rem", marginTop: "1.5rem" }}>
            A connected vision for scientific discovery, longitudinal clinical context,
            personal health and clinical trials — built on evidence, permissions and human oversight.
          </p>
          <div className="hero-actions" style={{ marginTop: "2rem" }}>
            <Link to="/platform" className="btn btn-primary">Explore the platform</Link>
            <Link to="/products" className="btn btn-ghost">Discover the ecosystem</Link>
          </div>
        </div>
      </section>
      <EcosystemGrid />
      <EvidenceExplorer />
      <section className="section section-ink cta-band">
        <div className="container cta-band-inner">
          <div>
            <span className="section-num">RESEARCH FIRST</span>
            <h2 className="display display-md">From a question to traceable evidence.</h2>
            <p className="lede">
              Explore immune mechanisms, compare evidence and inspect uncertainty.
              Research outputs require expert review; clinical and patient workflows
              have separate access and validation requirements.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/for-isi" className="btn btn-primary">Explore ISI Research</Link>
            <Link to="/how-it-works" className="btn btn-ghost">How it works</Link>
          </div>
        </div>
      </section>
    </>
  );
}
