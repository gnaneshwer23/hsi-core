import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { MarketingJourney, MarketingPage } from "../components/marketing/MarketingPage";
import {
  DEMO_LINKS,
  ECOSYSTEM_PRODUCTS,
  MATURITY_CHIP_LABEL,
  SHARED_CORE_NOTE,
  STATUS_COLUMNS,
} from "../lib/productMaturity";

export function Status() {
  return (
    <MarketingPage bridgeExperience={false}>
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
            In-development fixtures only — not live hospital, registry, or CDS products. Trials
            product chip remains Planned even when the five-state demo is open.
          </p>
          <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
            {DEMO_LINKS.map((d) => {
              // Thin demos are In development; Trials *product* chip stays Planned on the card below.
              const chip = "in_development" as const;
              return (
              <article key={d.to} className="product-card" id={`demo-${d.product}`}>
                <div className="product-card-head">
                  <h3>{d.label}</h3>
                  <span className={`maturity-chip maturity-chip-${chip}`}>
                    {MATURITY_CHIP_LABEL[chip]}
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
          <p className="muted" style={{ marginTop: "1rem" }}>
            Public journey:{" "}
            <Link to="/platform">Platform</Link> · <Link to="/modules">Modules</Link> ·{" "}
            <Link to="/contact">Research access</Link>
          </p>
        </div>
      </section>
      <MarketingJourney
        links={[
          { to: "/platform", label: "Platform", note: "Shared technology" },
          { to: "/modules", label: "Modules", note: "Four products" },
          { to: "/evidence-safety", label: "Evidence & safety", note: "Integrity" },
          { to: "/contact", label: "Research access", note: "Browser draft only" },
        ]}
      />
    </MarketingPage>
  );
}
