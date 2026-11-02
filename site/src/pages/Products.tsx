import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  ECOSYSTEM_PRODUCTS,
  MATURITY_CHIP_LABEL,
  SHARED_CORE_NOTE,
} from "../lib/productMaturity";

export function Products() {
  return (
    <>
      <PageHero
        eyebrow="One ecosystem · four products"
        title={
          <>
            Specialised experiences,{" "}
            <span className="accent">shared governance.</span>
          </>
        }
        lede="Health Super Intelligence is four connected product surfaces — not four unrelated apps and not one monolith. Status chips must match /status."
      />

      <section className="section section-grid-light">
        <div className="container">
          <p className="lede" style={{ maxWidth: "40rem", marginBottom: "2rem" }}>
            {SHARED_CORE_NOTE}
          </p>
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
                  <Link to="/status" className="text-link">
                    Status →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
