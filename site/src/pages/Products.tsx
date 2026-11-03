import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";
import "../styles/products.css";

type ProductId = EcosystemProduct["id"];

const order: ProductId[] = ["aksh", "isi", "clinical", "trials"];

const descriptions: Record<
  ProductId,
  { category: string; audience: string; description: string; features: string[]; boundary: string }
> = {
  aksh: {
    category: "PERSONAL HEALTH & CARE",
    audience: "People managing their health and the teams supporting them",
    description:
      "Bring health trends and everyday context into a clearer picture, with care workflows organised around the person.",
    features: ["Health information in context", "Diabetes and metabolic health focus", "Clinician collaboration within scope"],
    boundary: "Care records and clinical decisions remain within Aksh.",
  },
  isi: {
    category: "BIOLOGICAL RESEARCH",
    audience: "Researchers and translational teams",
    description:
      "Explore immune mechanisms, knowledge relationships and scientific evidence while keeping research context and uncertainty visible.",
    features: ["Immune biology and knowledge exploration", "Evidence context and provenance", "Research investigations and human review"],
    boundary: "For research exploration; not clinical decision support.",
  },
  clinical: {
    category: "LONGITUDINAL CLINICAL CONTEXT",
    audience: "Authorised care teams",
    description:
      "An experience in development for reviewing health information over time, with attention to provenance and professional oversight.",
    features: ["Longitudinal review concept", "Record provenance and information gaps", "Professional oversight by design"],
    boundary: "In development. No live hospital connection or bedside decision support is offered here.",
  },
  trials: {
    category: "CLINICAL RESEARCH",
    audience: "Study teams and research investigators",
    description:
      "A planned experience for exploring clinical studies and making screening criteria and missing information easier to understand.",
    features: ["Study discovery concept", "Transparent criteria and missing information", "Investigator-led assessment"],
    boundary: "Planned. No live matching, confirmed eligibility or automatic enrolment.",
  },
};

const journeys: { id: ProductId; label: string; heading: string; text: string }[] = [
  {
    id: "aksh",
    label: "Personal health",
    heading: "Start with the person.",
    text: "Aksh Health is the starting point for health information and scoped care workflows, with a focus on diabetes and metabolic health.",
  },
  {
    id: "isi",
    label: "Research",
    heading: "Start with a research question.",
    text: "ISI Research is the specialist experience for investigating immune biology, knowledge relationships and the evidence behind a question.",
  },
  {
    id: "clinical",
    label: "Care teams",
    heading: "Understand the clinical direction.",
    text: "HSI Clinical is in development. Explore the shared foundation and the intended approach to longitudinal review before considering a clinical deployment.",
  },
  {
    id: "trials",
    label: "Trial research",
    heading: "Understand the trials direction.",
    text: "HSI Trials is planned. Explore the concept of transparent study discovery and investigator-led screening; live matching is not available.",
  },
];

const foundationPoints = [
  {
    title: "An operating model, not a merged stack",
    detail:
      "Products reuse shared capability patterns—evidence, knowledge and review—inside their own permissions walls. Software can travel; records do not.",
  },
  {
    title: "Shared technology · product-owned data",
    detail:
      "Each product controls its authentication, database and access. Sharing code does not create a shared patient or evidence database.",
  },
  {
    title: "Scope you can verify",
    detail: "Available experiences, development work and planned concepts stay clearly labelled—this page is a chooser and honesty ledger, not live access.",
  },
] as const;

function ProductsHeroArt() {
  return (
    <aside
      className="hsi-products-hero-art"
      role="img"
      aria-label="Four products on one Human Super Intelligence foundation: Aksh Health, ISI Research, HSI Clinical and HSI Trials. Each keeps its own data."
    >
      <p className="hsi-products-hero-art-label">Four products · one foundation</p>
      <div className="hsi-products-hero-art-core">
        <span className="hsi-products-hero-symbol" aria-hidden="true">
          {PRODUCT_SHORT[0]}
        </span>
        <div>
          <strong>{PRODUCT_SHORT}</strong>
          <span>Shared technology foundation</span>
        </div>
      </div>
      <ul className="hsi-products-hero-strip">
        {order.map((id) => {
          const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === id)!;
          return (
            <li key={id}>
              <span>{product.name}</span>
              <small>{MATURITY_CHIP_LABEL[product.chip]}</small>
            </li>
          );
        })}
      </ul>
      <p className="hsi-products-hero-art-foot">Chooser · honesty ledger · not live workspace access</p>
    </aside>
  );
}

function ProductArt({ id }: { id: ProductId }) {
  return (
    <svg viewBox="0 0 400 190" fill="none" aria-hidden="true">
      <circle cx="200" cy="95" r="82" stroke="currentColor" strokeWidth="1.25" opacity=".22" />
      <circle cx="200" cy="95" r="58" stroke="currentColor" strokeWidth="1.25" opacity=".18" strokeDasharray="3 6" />
      {id === "aksh" ? (
        <>
          <circle cx="200" cy="62" r="26" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".65" />
          <path
            d="M142 162v-18a58 58 0 0 1 116 0v18"
            fill="currentColor"
            fillOpacity=".16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity=".65"
          />
          <path d="M96 78h38m132 38h38" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".55" />
          <circle cx="290" cy="56" r="14" fill="#ff6845" />
        </>
      ) : null}
      {id === "isi" ? (
        <>
          <path
            d="m104 64 96 32 90-52-24 104-68-52-86 58-8-90m8 90 154-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeOpacity=".55"
          />
          {[
            [104, 64, 13],
            [200, 96, 26],
            [290, 44, 11],
            [268, 148, 16],
            [114, 152, 11],
          ].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={i === 1 ? "#ff6845" : "currentColor"}
              fillOpacity={i === 1 ? 1 : 0.48}
            />
          ))}
        </>
      ) : null}
      {id === "clinical" ? (
        <>
          <path
            d="M76 95h52l20-28 26 56 26-82 26 74 20-32 22 12h66"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
          <path d="M76 142h248M76 48h248" stroke="currentColor" strokeWidth="1.25" strokeOpacity=".28" strokeDasharray="4 6" />
          <circle cx="198" cy="44" r="8" fill="#ff6845" />
        </>
      ) : null}
      {id === "trials" ? (
        <>
          <path d="M128 50h144M128 95h144M128 140h144" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".55" />
          <rect x="100" y="30" width="34" height="34" rx="6" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity=".08" />
          <rect x="100" y="75" width="34" height="34" rx="6" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity=".08" />
          <rect x="100" y="120" width="34" height="34" rx="6" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity=".08" />
          <path d="m110 47 6 6 11-13m-17 52 6 6 11-13" stroke="currentColor" strokeWidth="2.25" />
          <circle cx="286" cy="140" r="10" fill="#ff6845" />
        </>
      ) : null}
    </svg>
  );
}

export function Products() {
  const [selected, setSelected] = useState<ProductId>("isi");
  const journey = journeys.find((j) => j.id === selected)!;
  const selectedProduct = ECOSYSTEM_PRODUCTS.find((p) => p.id === selected)!;

  return (
    <div className="hsi-editorial">
      <section className="hsi-products-hero" aria-labelledby="products-title">
        <div className="hsi-editorial-wrap hsi-products-hero-grid">
          <div className="hsi-products-hero-copy">
            <p className="hsi-editorial-kicker">
              <span className="hsi-coral-dot" /> {PRODUCT_NAME} / PRODUCTS
            </p>
            <h1 id="products-title">
              Different questions.
              <br />
              <em>A connected foundation.</em>
            </h1>
            <p className="hsi-editorial-lede">
              From personal health to biological research, find the experience that fits your question. Each product has its own purpose, data and access controls.
            </p>
            <div className="hsi-editorial-actions">
              <a className="hsi-editorial-button" href="#product-collection">
                Explore the products <span aria-hidden="true">↗</span>
              </a>
              <a className="hsi-editorial-textlink" href="#product-finder">
                Find your starting point ↗
              </a>
            </div>
          </div>
          <ProductsHeroArt />
        </div>
        <div className="hsi-editorial-wrap hsi-products-hero-foot">
          <span>
            Four products <b>·</b> one foundation
          </span>
          <span className="hsi-products-hero-names">
            Aksh Health <b>·</b> ISI Research <b>·</b> HSI Clinical <b>·</b> HSI Trials
          </span>
        </div>
      </section>

      <section className="hsi-products-finder" id="product-finder" aria-labelledby="finder-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">01 / FIND YOUR STARTING POINT</p>
              <h2 id="finder-title">
                What brings
                <br />
                <em>you here?</em>
              </h2>
            </div>
            <p>Choose an area to understand the relevant product and its current scope. This guide does not open a private workspace.</p>
          </div>

          <div className="hsi-products-journey-selector" role="group" aria-label="Your area of interest">
            {journeys.map((j, i) => {
              const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === j.id)!;
              const isActive = selected === j.id;
              return (
                <button
                  type="button"
                  key={j.id}
                  className={"hsi-products-journey-step" + (isActive ? " is-active" : "")}
                  aria-pressed={isActive}
                  aria-controls="product-guidance"
                  onClick={() => setSelected(j.id)}
                >
                  <span className="hsi-products-journey-index">0{i + 1}</span>
                  <span className="hsi-products-journey-copy">
                    <strong>{j.label}</strong>
                    <small>
                      {product.name} · {MATURITY_CHIP_LABEL[product.chip]}
                    </small>
                  </span>
                  <span className="hsi-products-journey-mark" aria-hidden="true">
                    {isActive ? "●" : "↗"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hsi-products-guidance" id="product-guidance" aria-live="polite" aria-atomic="true">
            <div className="hsi-products-guidance-copy">
              <p className="hsi-editorial-kicker">
                {MATURITY_CHIP_LABEL[selectedProduct.chip].toUpperCase()} · {selectedProduct.name.toUpperCase()}
              </p>
              <h3>{journey.heading}</h3>
              <p>{journey.text}</p>
              <p className="hsi-products-guidance-scope">{selectedProduct.chipDetail}</p>
            </div>
            <div className="hsi-products-guidance-aside">
              <span className={`hsi-products-status hsi-products-status-${selectedProduct.chip}`}>
                {MATURITY_CHIP_LABEL[selectedProduct.chip]}
              </span>
              <Link className="hsi-editorial-button" to={selectedProduct.primaryCta.href}>
                {selectedProduct.primaryCta.label} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hsi-products-collection" id="product-collection" aria-labelledby="collection-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">02 / THE PRODUCT COLLECTION</p>
              <h2 id="collection-title">
                Distinct roles.
                <br />
                <em>A shared direction.</em>
              </h2>
            </div>
            <p>
              Availability is shown for each product. Overview pages explain the experience; they do not grant access to private workspaces.
            </p>
          </div>

          <div className="hsi-products-grid">
            {order.map((id, index) => {
              const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === id)!;
              const detail = descriptions[id];
              return (
                <article key={id} className={`hsi-products-card hsi-products-card-${id}`} aria-labelledby={`product-${id}-title`}>
                  <div className="hsi-products-card-visual">
                    <span className="hsi-products-visual-number">0{index + 1}</span>
                    <ProductArt id={id} />
                    <span className="hsi-products-visual-label">{detail.category}</span>
                  </div>
                  <div className="hsi-products-card-body">
                    <div className="hsi-products-card-title">
                      <h3 id={`product-${id}-title`}>{product.name}</h3>
                      <span className={`hsi-products-status hsi-products-status-${product.chip}`}>
                        {MATURITY_CHIP_LABEL[product.chip]}
                      </span>
                    </div>
                    <p className="hsi-products-audience">{detail.audience}</p>
                    <p className="hsi-products-description">{detail.description}</p>
                    {id === "isi" ? (
                      <p className="hsi-products-legal-once">
                        ISI Research is the product name for Immune Super Intelligence’s research workspace.
                      </p>
                    ) : null}
                    <ul>
                      {detail.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <p className="hsi-products-scope">{product.chipDetail}</p>
                    <p className="hsi-products-boundary">
                      <span className="hsi-products-boundary-label">Boundary</span>
                      {detail.boundary}
                    </p>
                    <Link className="hsi-products-card-link" to={product.primaryCta.href}>
                      {product.primaryCta.label} <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hsi-editorial-connection hsi-products-connect" aria-labelledby="shared-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-products-connect-head">
            <div>
              <p className="hsi-editorial-kicker">03 / WHAT CONNECTS THE EXPERIENCES</p>
              <h2 id="shared-title">
                Shared technology.
                <br />
                <em>Product-owned data.</em>
              </h2>
            </div>
            <p>
              {PRODUCT_SHORT} is an operating model for shared capability patterns—not another patient application. Aksh and ISI keep their own interfaces and databases behind permissions walls while reusing tools for knowledge, evidence and review.
            </p>
          </div>

          <div className="hsi-products-connect-body">
            <div className="hsi-products-foundation-points">
              {foundationPoints.map((item, i) => (
                <article key={item.title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hsi-products-connect-visual">
              <div
                className="hsi-editorial-connection-map hsi-products-connection-map"
                role="img"
                aria-label="Connection map: Human Super Intelligence shared technology at the centre. Aksh Health, HSI Clinical, ISI Research and HSI Trials each keep their own data."
              >
                <div className="hsi-editorial-map-core">
                  {PRODUCT_SHORT}
                  <small>SHARED TECH</small>
                </div>
                <span>AKSH · OWN DATA</span>
                <span>CLINICAL · OWN DATA</span>
                <span>ISI RESEARCH · OWN DATA</span>
                <span>TRIALS · OWN DATA</span>
              </div>
              <p className="hsi-products-connect-legend">
                <b>Technology shared</b>
                <span aria-hidden="true">·</span>
                <b>Data never shared</b>
              </p>
              <Link className="hsi-editorial-button" to="/platform">
                Explore the platform <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">04 / UNDERSTAND THE APPROACH</p>
          <h2>
            See how the pieces
            <br />
            <em>work together.</em>
          </h2>
          <p>Follow the path from a question to context, evidence and human review—or inspect the shared technology behind the products.</p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/how-it-works">
              See how it works <span aria-hidden="true">↗</span>
            </Link>
            <Link className="hsi-editorial-textlink" to="/platform">
              Explore the technology ↗
            </Link>
          </div>
          <small>
            Research tools do not diagnose, prescribe or confirm trial eligibility. Clinical and trial capabilities remain separately governed and human-validated. {PRODUCT_SHORT} does not operate a shared evidence database across products.
          </small>
        </div>
      </section>
    </div>
  );
}
