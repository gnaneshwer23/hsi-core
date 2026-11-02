import { PlatformEngine } from "../components/landing/PlatformEngine";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import { Link } from "react-router-dom";

/** Marketing platform landing — §01 connected-by-design fabric + §02 ecosystem. */
export function Platform() {
  return (
    <>
      <PlatformEngine />
      <EcosystemGrid />
      <section className="section section-bone cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Continue the journey.</h2>
            <p className="lede">
              Explore evidence relationships, then open the live Discovery Centre on real packs.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/explore" className="btn btn-ink">
              Explore evidence <span className="arrow">↗</span>
            </Link>
            <Link to="/discovery-engine" className="btn btn-ghost land-btn-on-light">
              Discovery engine
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
