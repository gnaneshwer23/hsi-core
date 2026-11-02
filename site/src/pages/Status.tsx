import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  DEMO_LINKS,
  ECOSYSTEM_PRODUCTS,
  MATURITY_CHIP_LABEL,
  SHARED_CORE_NOTE,
  STATUS_COLUMNS,
} from "../lib/productMaturity";

export function Status() {
  return (
    <>
      <PageHero
        eyebrow="Living status · source of truth for CTAs"
        title={
          <>
            Available, in development,{" "}
            <span className="accent">planned.</span>
          </>
        }
        lede="Audit-aligned honesty for the four-product ecosystem. Primary CTAs must resolve here, to an Available surface, or to collaborate — never a hollow mock that looks production."
      />

      <section className="section section-grid-light">
        <div className="container">
          <div className="maturity-grid status-columns">
            {STATUS_COLUMNS.map((col) => (
              <article key={col.id} className={`maturity-card status-col status-col-${col.id}`}>
                <h3>{col.title}</h3>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-elevated" id="demos">
        <div className="container">
          <div className="section-head">
            <span className="section-num">THIN DEMOS</span>
            <h2 className="display display-md">Clinical + Trials substrate UI.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "40rem" }}>
            In-development and Planned products expose honesty-labelled fixtures — not live
            hospital or registry products.
          </p>
          <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
            {DEMO_LINKS.map((d) => {
              const chip =
                d.product === "trials"
                  ? ("planned" as const)
                  : ("in_development" as const);
              const chipLabel = chip === "planned" ? "Planned" : "In development";
              return (
              <article key={d.to} className="product-card" id={`demo-${d.product}`}>
                <div className="product-card-head">
                  <h3>{d.label}</h3>
                  <span className={`maturity-chip maturity-chip-${chip}`}>
                    {chipLabel}
                  </span>
                </div>
                <p className="xs muted">{d.note}</p>
                <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
                  <Link to={d.to} className="btn btn-ghost">
                    Open demo
                  </Link>
                  <Link
                    to={
                      d.product === "gateway"
                        ? "/gateway#gateway-policy"
                        : `/status#${d.product}`
                    }
                    className="text-link"
                  >
                    {d.product === "gateway" ? "Policy anchors →" : "Product card →"}
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-elevated" id="products">
        <div className="container">
          <div className="section-head">
            <span className="section-num">FOUR PRODUCTS</span>
            <h2 className="display display-md">Chip truth per product.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "40rem" }}>
            {SHARED_CORE_NOTE}
          </p>
          <div className="product-grid">
            {ECOSYSTEM_PRODUCTS.map((p) => (
              <article key={p.id} className="product-card" id={p.id}>
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
                  <Link to={p.primaryCta.href} className="btn btn-ghost">
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

      <section className="section section-bone" id="collaborate">
        <div className="container">
          <div className="section-head">
            <span className="section-num">COLLABORATE</span>
            <h2 className="display display-md">Partner conversations.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "36rem" }}>
            Institutional, research-partner, or clinic pilot talks welcome. No invented MoU,
            partner logos, or “locked pilot” claims without a written confirmation on file.
          </p>
          <p className="muted">
            Engineering detail (secondary):{" "}
            <Link to="/roadmap">roadmap</Link> · <Link to="/docs">docs</Link> ·{" "}
            <Link to="/curator">curator</Link>
          </p>
        </div>
      </section>
    </>
  );
}
