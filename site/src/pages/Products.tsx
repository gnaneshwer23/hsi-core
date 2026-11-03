import { Link } from "react-router-dom";
import { EcosystemGrid } from "../components/landing/EcosystemGrid";
import {
  ECOSYSTEM_PRODUCTS,
  MATURITY_CHIP_LABEL,
  SHARED_CORE_NOTE,
} from "../lib/productMaturity";

export function Products() {
  return (
    <>
      <EcosystemGrid
        headingLevel={1}
        footLink={{ to: "/how-it-works", label: "How HSI works ↗" }}
      />

      <section className="section section-grid-light">
        <div className="container">
          <div className="section-head" style={{ marginBottom: "2rem" }}>
            <span className="section-num">PRODUCT DETAIL</span>
            <h2 className="display display-md">Four perspectives. One foundation.</h2>
            <p className="lede" style={{ maxWidth: "40rem" }}>
              {SHARED_CORE_NOTE}
            </p>
          </div>
          <div className="product-grid">
            {ECOSYSTEM_PRODUCTS.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-card-head">
                  <h3>{p.name}</h3>
                  <span className={`maturity-chip maturity-chip-${p.chip}`}>
                    {MATURITY_CHIP_LABEL[p.chip]}
                  </span>
                </div>
                <p>{p.oneLine}</p>
                <p className="xs muted">{p.chipDetail}</p>
                <ul className="product-must-not">
                  {p.mustNot.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
                  <Link
                    to={p.primaryCta.href}
                    className={p.chip === "available" ? "btn btn-primary" : "btn btn-ghost"}
                  >
                    {p.primaryCta.label}
                  </Link>
                  {p.secondaryCta ? (
                    <Link to={p.secondaryCta.href} className="text-link">
                      {p.secondaryCta.label} →
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
