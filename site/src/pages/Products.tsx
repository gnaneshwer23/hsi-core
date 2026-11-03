import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";
import "../styles/products.css";

type ProductId = EcosystemProduct["id"];

const order: ProductId[] = ["aksh", "isi", "clinical", "trials"];

const descriptions: Record<ProductId, { category: string; audience: string; description: string; features: string[]; boundary: string; cta: string }> = {
  aksh: {
    category: "PERSONAL HEALTH & CARE",
    audience: "People managing their health and the teams supporting them",
    description: "Bring health trends and everyday context into a clearer picture, with care workflows organised around the person.",
    features: ["Health information in context", "Diabetes and metabolic health focus", "Clinician collaboration within scope"],
    boundary: "Care records and clinical decisions remain within Aksh.",
    cta: "Explore Aksh Health",
  },
  isi: {
    category: "BIOLOGICAL RESEARCH",
    audience: "Researchers and translational teams",
    description: "Explore immune mechanisms, knowledge relationships and scientific evidence while keeping research context and uncertainty visible.",
    features: ["Immune biology and knowledge exploration", "Evidence context and provenance", "Research investigations and human review"],
    boundary: "For research exploration; not clinical decision support.",
    cta: "Explore ISI Research",
  },
  clinical: {
    category: "LONGITUDINAL CLINICAL CONTEXT",
    audience: "Authorised care teams",
    description: "An experience in development for reviewing health information over time, with attention to provenance and professional oversight.",
    features: ["Longitudinal review concept", "Record provenance and information gaps", "Professional oversight by design"],
    boundary: "In development. No live hospital connection or bedside decision support is offered here.",
    cta: "Understand the foundation",
  },
  trials: {
    category: "CLINICAL RESEARCH",
    audience: "Study teams and research investigators",
    description: "A planned experience for exploring clinical studies and making screening criteria and missing information easier to understand.",
    features: ["Study discovery concept", "Transparent criteria and missing information", "Investigator-led assessment"],
    boundary: "Planned. No live matching, confirmed eligibility or automatic enrolment.",
    cta: "Explore the trials concept",
  },
};

const journeys: { id: ProductId; label: string; heading: string; text: string }[] = [
  { id: "aksh", label: "Personal health", heading: "Start with the person.", text: "Aksh Health is the starting point for health information and scoped care workflows, with a focus on diabetes and metabolic health." },
  { id: "isi", label: "Research", heading: "Start with a research question.", text: "ISI Research is the specialist experience for investigating immune biology, knowledge relationships and the evidence behind a question." },
  { id: "clinical", label: "Care teams", heading: "Understand the clinical direction.", text: "HSI Clinical is in development. Explore the shared foundation and the intended approach to longitudinal review before considering a clinical deployment." },
  { id: "trials", label: "Trial research", heading: "Understand the trials direction.", text: "HSI Trials is planned. Explore the concept of transparent study discovery and investigator-led screening; live matching is not available." },
];

const foundationPoints = [
  {
    title: "A foundation for investigations",
    detail: "Evidence retrieval, knowledge relationships and structured human review.",
  },
  {
    title: "Clear ownership and permissions",
    detail: "Each product controls its data and access. Sharing code does not create a shared patient database.",
  },
  {
    title: "Scope you can understand",
    detail: "Available experiences, development work and planned concepts remain clearly distinguished.",
  },
] as const;

function ProductArt({ id }: { id: ProductId }) {
  return (
    <svg viewBox="0 0 400 190" fill="none" aria-hidden="true">
      <circle cx="200" cy="95" r="80" stroke="currentColor" opacity=".13" />
      <circle cx="200" cy="95" r="56" stroke="currentColor" opacity=".13" strokeDasharray="2 7" />
      {id === "aksh" ? (
        <>
          <circle cx="200" cy="63" r="24" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeOpacity=".5" />
          <path d="M146 161v-16a54 54 0 0 1 108 0v16" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".5" />
          <path d="M100 80h35m130 39h35" stroke="currentColor" strokeOpacity=".5" />
          <circle cx="287" cy="58" r="13" fill="#ff6845" />
        </>
      ) : null}
      {id === "isi" ? (
        <>
          <path d="m107 66 93 29 87-49-22 98-65-49-83 54-10-83m10 83 148-5" stroke="currentColor" strokeOpacity=".45" />
          {[[107, 66, 12], [200, 95, 25], [287, 46, 10], [265, 144, 15], [117, 149, 10]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i === 1 ? "#ff6845" : "currentColor"} fillOpacity={i === 1 ? 1 : 0.4} />
          ))}
        </>
      ) : null}
      {id === "clinical" ? (
        <>
          <path d="M80 95h48l18-25 24 52 25-76 24 68 19-30 20 11h62" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M80 140h240M80 50h240" stroke="currentColor" strokeOpacity=".2" strokeDasharray="3 7" />
          <circle cx="195" cy="46" r="7" fill="#ff6845" />
        </>
      ) : null}
      {id === "trials" ? (
        <>
          <path d="M130 50h136M130 95h136M130 140h136" stroke="currentColor" strokeOpacity=".45" />
          <rect x="105" y="32" width="30" height="30" rx="6" stroke="currentColor" />
          <rect x="105" y="77" width="30" height="30" rx="6" stroke="currentColor" />
          <rect x="105" y="122" width="30" height="30" rx="6" stroke="currentColor" />
          <path d="m113 47 5 5 10-12m-15 52 5 5 10-12" stroke="currentColor" strokeWidth="2" />
          <circle cx="281" cy="140" r="9" fill="#ff6845" />
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
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">
            <span className="hsi-coral-dot" /> {PRODUCT_NAME} / PRODUCTS
          </p>
          <div className="hsi-products-hero-grid">
            <h1 id="products-title">
              Different questions.<br />
              <em>A connected foundation.</em>
            </h1>
            <div>
              <p className="hsi-editorial-lede">
                From personal health to biological research, find the experience that fits your question. Each product has its own purpose, data and access controls.
              </p>
              <div className="hsi-editorial-actions">
                <a className="hsi-editorial-button" href="#product-collection">
                  Explore the products <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
          <div className="hsi-products-hero-foot">
            <span>
              AKSH HEALTH <b>→</b> ISI RESEARCH <b>→</b> {PRODUCT_SHORT}
            </span>
            <Link className="hsi-editorial-textlink" to="/platform">
              Meet the shared technology ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="hsi-products-finder" aria-labelledby="finder-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">01 / FIND YOUR STARTING POINT</p>
              <h2 id="finder-title">
                What brings<br />
                <em>you here?</em>
              </h2>
            </div>
            <p>Choose an area to understand the relevant product and its current scope.</p>
          </div>

          <div className="hsi-products-journey-selector" role="group" aria-label="Your area of interest">
            {journeys.map((j, i) => (
              <button
                type="button"
                key={j.id}
                className={"hsi-research-step" + (selected === j.id ? " is-active" : "")}
                aria-pressed={selected === j.id}
                aria-controls="product-guidance"
                onClick={() => setSelected(j.id)}
              >
                <span className="hsi-research-step-index">0{i + 1}</span>
                <span className="hsi-research-step-copy">
                  <strong>{j.label}</strong>
                  <small>{ECOSYSTEM_PRODUCTS.find((p) => p.id === j.id)!.name}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className="hsi-products-guidance" id="product-guidance" aria-live="polite" aria-atomic="true">
            <div>
              <p className="hsi-editorial-kicker">
                {MATURITY_CHIP_LABEL[selectedProduct.chip].toUpperCase()} · {selectedProduct.name.toUpperCase()}
              </p>
              <h3>{journey.heading}</h3>
              <p>{journey.text}</p>
            </div>
            <Link className="hsi-rebuild-inline-link" to={selectedProduct.primaryCta.href}>
              {descriptions[selected].cta} ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="hsi-products-collection" id="product-collection" aria-labelledby="collection-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">02 / THE PRODUCT COLLECTION</p>
              <h2 id="collection-title">
                Distinct roles.<br />
                <em>A shared direction.</em>
              </h2>
            </div>
            <p>Availability is shown for each product. Product overview pages explain the experience; they do not grant access to private workspaces.</p>
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
                    <p className="hsi-products-boundary">{detail.boundary}</p>
                    <Link className="hsi-products-card-link" to={product.primaryCta.href}>
                      {detail.cta} <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hsi-editorial-connection" aria-labelledby="shared-title">
        <div className="hsi-editorial-wrap hsi-editorial-connection-grid">
          <div>
            <p className="hsi-editorial-kicker">03 / WHAT CONNECTS THE EXPERIENCES</p>
            <h2 id="shared-title">
              Shared technology.<br />
              <em>Product-owned data.</em>
            </h2>
            <p>
              {PRODUCT_SHORT} is the technology foundation, rather than another patient application. Aksh and ISI retain their own interfaces and databases while using shared tools for knowledge, evidence and review.
            </p>
            <Link className="hsi-editorial-button" to="/platform">
              Explore the platform <span aria-hidden="true">↗</span>
            </Link>
          </div>
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
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">04 / UNDERSTAND THE APPROACH</p>
          <h2>
            See how the pieces<br />
            <em>work together.</em>
          </h2>
          <p>Follow the path from a question to context, evidence and human review.</p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/how-it-works">
              See how it works <span aria-hidden="true">↗</span>
            </Link>
            <Link className="hsi-editorial-textlink" to="/platform">
              Explore the technology ↗
            </Link>
          </div>
          <small>
            Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to human validation. HSI does not operate a shared evidence database across products.
          </small>
        </div>
      </section>
    </div>
  );
}
