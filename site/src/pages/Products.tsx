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
      "Products reuse shared capability patterns—evidence, knowledge and review—inside their own permissions walls. Shared methods can be reused; any data exchange requires a defined purpose, authorisation and governance.",
  },
  {
    title: "Shared technology · product-owned data",
    detail:
      "Each product controls its authentication, database and access. Sharing code does not create a shared patient or evidence database; authorised, purpose-limited exchange must be explicitly controlled.",
  },
  {
    title: "Scope you can verify",
    detail: "Available experiences, development work and planned concepts stay clearly labelled—this page is a chooser and honesty ledger, not proof of deployed clinical capability.",
  },
] as const;

const productShowcases: Record<ProductId, { question: string; input: string; process: string; output: string; review: string; illustration: string }> = {
  aksh: { question: "What has changed in my metabolic health?", input: "Symptoms, glucose trends, medication context and patient-reported information", process: "Organise a longitudinal picture and flag questions for a care conversation", output: "A personal health timeline and a reviewable summary", review: "Patient and authorised clinician retain control over care decisions", illustration: "GLUCOSE · SYMPTOMS · TIMELINE" },
  isi: { question: "Which immune mechanisms may contribute to systemic sclerosis?", input: "Curated publications, immune-cell evidence and approved biological relationships", process: "Compare pathways, tissue contexts, contradictions and research gaps", output: "A cited investigation brief with candidate hypotheses clearly labelled", review: "An accountable scientist reviews findings before any claim is approved", illustration: "CELLS · PATHWAYS · EVIDENCE" },
  clinical: { question: "What changed across this person's encounters?", input: "Authorised encounter, medication and laboratory records when integrations are validated", process: "Reconstruct chronology, identify gaps and preserve source attribution", output: "A proposed longitudinal review with missing-information flags", review: "Clinician verifies context; live hospital integration is not offered", illustration: "ENCOUNTERS · LABS · MEDICATIONS" },
  trials: { question: "Which study criteria require further evidence?", input: "Study criteria and appropriately authorised clinical context when available", process: "Structure inclusion and exclusion criteria and expose unknowns", output: "An investigator-facing pre-screening evidence checklist", review: "Investigators determine eligibility; no live matching or enrolment", illustration: "STUDIES · CRITERIA · REVIEW" },
};

function ProductsHeroArt() {
  return (
    <aside className="hsi-products-hero-art" aria-label="Four governed products connected through the HSI NEXUS intelligence foundation">
      <p className="hsi-products-hero-art-label">THE HSI ECOSYSTEM / CONCEPTUAL ARCHITECTURE</p>
      <div className="hsi-products-nexus" aria-hidden="true">
        <div className="hsi-products-nexus-orbit">
          {order.map((id, i) => {
            const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === id)!;
            return <div className={`hsi-products-nexus-node hsi-products-nexus-node-${id}`} key={id}>
              <span>0{i + 1}</span><strong>{product.name}</strong><small>{MATURITY_CHIP_LABEL[product.chip]}</small>
            </div>;
          })}
          <div className="hsi-products-nexus-center"><span>HSI</span><strong>NEXUS</strong><small>Governed intelligence</small></div>
        </div>
      </div>
      <p className="hsi-products-hero-art-foot">Shared capabilities · independent product permissions · authorised exchange only</p>
    </aside>
  );
}

function ProductExperienceVisual({ id }: { id: ProductId }) {
  return <div className={`hsi-products-experience hsi-products-experience-${id}`} aria-hidden="true">
    <div className="hsi-products-experience-top"><span>HSI / {id.toUpperCase()}</span><span>ILLUSTRATIVE CONCEPT</span></div>
    {id === "aksh" && <div className="hsi-products-experience-panel">
      <span className="hsi-products-experience-label">PERSONAL HEALTH OVERVIEW</span><strong>Metabolic health context</strong>
      <div className="hsi-products-experience-chart"><svg viewBox="0 0 330 110" preserveAspectRatio="none"><path d="M0 88H330M0 52H330M0 16H330" stroke="currentColor" opacity=".18"/><path d="M0 73 C30 62 45 79 70 57 S110 34 135 56 S180 83 205 49 S248 70 270 38 S310 51 330 24" stroke="#ff6845" strokeWidth="4" fill="none"/></svg></div>
      <div className="hsi-products-experience-pills"><span>Trends</span><span>Symptoms</span><span>Care review</span></div>
    </div>}
    {id === "isi" && <div className="hsi-products-experience-panel">
      <span className="hsi-products-experience-label">IMMUNE EVIDENCE EXPLORER</span><strong>Systemic sclerosis investigation</strong>
      <div className="hsi-products-experience-network"><span>Immune cell</span><span>Pathway</span><span>Tissue</span><span>Evidence</span><span>Hypothesis</span></div>
      <div className="hsi-products-experience-pills"><span>Citations</span><span>Contradictions</span><span>Review</span></div>
    </div>}
    {id === "clinical" && <div className="hsi-products-experience-panel">
      <span className="hsi-products-experience-label">LONGITUDINAL CLINICAL REVIEW</span><strong>Encounter chronology</strong>
      <div className="hsi-products-experience-timeline"><span><b>01</b> Encounter</span><span><b>02</b> Lab trend</span><span><b>03</b> Medication</span><span><b>04</b> Information gap</span></div>
      <div className="hsi-products-experience-pills"><span>Provenance</span><span>Clinician review</span></div>
    </div>}
    {id === "trials" && <div className="hsi-products-experience-panel">
      <span className="hsi-products-experience-label">STUDY CRITERIA REVIEW</span><strong>Evidence checklist</strong>
      <div className="hsi-products-experience-criteria"><span><b>✓</b> Criterion documented</span><span><b>?</b> Further evidence required</span><span><b>—</b> Investigator assessment</span></div>
      <div className="hsi-products-experience-pills"><span>Study criteria</span><span>Human decision</span></div>
    </div>}
    <p>Concept visual · no patient records, live matching or validated clinical output</p>
  </div>;
}


export function Products() {
  const [selected, setSelected] = useState<ProductId>("isi");
  const [showcaseId, setShowcaseId] = useState<ProductId>("isi");
  const journey = journeys.find((j) => j.id === selected)!;
  const selectedProduct = ECOSYSTEM_PRODUCTS.find((p) => p.id === selected)!;
  const showcase = productShowcases[showcaseId];
  const showcaseProduct = ECOSYSTEM_PRODUCTS.find((p) => p.id === showcaseId)!;

  return (
    <div className="hsi-editorial">
      <section className="hsi-products-hero" aria-labelledby="products-title">
        <div className="hsi-editorial-wrap hsi-products-hero-grid">
          <div className="hsi-products-hero-copy">
            <p className="hsi-editorial-kicker">
              <span className="hsi-coral-dot" /> {PRODUCT_NAME} / PRODUCTS
            </p>
            <h1 id="products-title">
              Four specialised products.
              <br />
              <em>One intelligence ecosystem.</em>
            </h1>
            <p className="hsi-editorial-lede">
              From personal health to clinical context, immune discovery and trials research: explore what each product is designed to do, and how governed intelligence connects them.
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
            <p>Choose an area to understand the relevant product and its current scope. Maturity labels describe the current declared scope; this guide does not open a private workspace.</p>
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

      <section className="hsi-products-showcase" id="product-showcase" aria-labelledby="showcase-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead"><div><p className="hsi-editorial-kicker">02 / EXPLORE THE PRODUCT EXPERIENCES</p><h2 id="showcase-title">See the question.<br/><em>Follow the intelligence.</em></h2></div><p>Select a product to explore its intended journey, reviewable output and human decision boundary. These are illustrative workflows, not claims of live integration.</p></div>
          <div className="hsi-products-showcase-tabs" role="group" aria-label="Choose a product experience">
            {order.map(id=>{const product=ECOSYSTEM_PRODUCTS.find(p=>p.id===id)!;return <button key={id} type="button" aria-pressed={showcaseId===id} onClick={()=>setShowcaseId(id)}><strong>{product.name}</strong><small>{MATURITY_CHIP_LABEL[product.chip]}</small></button>})}
          </div>
          <div className={`hsi-products-showcase-stage hsi-products-showcase-${showcaseId}`} aria-live="polite">
            <div className="hsi-products-showcase-narrative">
              <p className="hsi-editorial-kicker">{showcaseProduct.name.toUpperCase()} · ILLUSTRATIVE WORKFLOW</p>
              <h3>{showcase.question}</h3>
              <p className="hsi-products-showcase-status">{MATURITY_CHIP_LABEL[showcaseProduct.chip]} · {showcaseProduct.chipDetail}</p>
              <div className="hsi-products-showcase-sequence"><div><span>01 / CONTEXT</span><p>{showcase.input}</p></div><div><span>02 / INTELLIGENCE</span><p>{showcase.process}</p></div><div><span>03 / REVIEWABLE OUTPUT</span><p>{showcase.output}</p></div></div>
              <p className="hsi-products-showcase-review"><strong>Human decision boundary</strong> {showcase.review}</p>
              <Link className="hsi-editorial-button" to={showcaseProduct.primaryCta.href}>{showcaseProduct.primaryCta.label} <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="hsi-products-showcase-art" role="img" aria-label={`Conceptual visualisation of ${showcaseProduct.name} intelligence workflow`}>
              <span className="hsi-products-showcase-art-kicker">HSI / PRODUCT INTELLIGENCE</span>
              <ProductExperienceVisual id={showcaseId}/>
              <div className="hsi-products-showcase-art-flow"><span>{showcase.illustration}</span><strong>Evidence → Context → Human review</strong></div>
              <small>Conceptual representation · not a live application screenshot</small>
            </div>
          </div>
        </div>
      </section>

      <section className="hsi-products-collection" id="product-collection" aria-labelledby="collection-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead">
            <div>
              <p className="hsi-editorial-kicker">03 / THE PRODUCT COLLECTION</p>
              <h2 id="collection-title">
                Distinct roles.
                <br />
                <em>A shared direction.</em>
              </h2>
            </div>
            <p>
              Repository-declared maturity is shown for each product. Available means scoped access or research experience, not verified clinical deployment. Overview pages do not grant access to private workspaces.
            </p>
          </div>

          <p className="hsi-products-maturity-note"><strong>What these statuses mean:</strong> “Available” refers to a scoped product or research experience, not an independently verified clinical deployment. “In development” and “Planned” do not indicate live clinical integrations, validated trial matching or approved medical-device functionality.</p>
          <div className="hsi-products-grid">
            {order.map((id, index) => {
              const product = ECOSYSTEM_PRODUCTS.find((p) => p.id === id)!;
              const detail = descriptions[id];
              return (
                <article key={id} className={`hsi-products-card hsi-products-card-${id}`} aria-labelledby={`product-${id}-title`}>
                  <div className="hsi-products-card-visual">
                    <span className="hsi-products-visual-number">0{index + 1}</span>
                    <ProductExperienceVisual id={id} />
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
              <p className="hsi-editorial-kicker">04 / WHAT CONNECTS THE EXPERIENCES</p>
              <h2 id="shared-title">
                Shared technology.
                <br />
                <em>Product-owned data.</em>
              </h2>
            </div>
            <p>
              {PRODUCT_SHORT} is an operating model for shared capability patterns—not another patient application. Aksh and ISI retain distinct interfaces, data stores and access controls while reusing methods for knowledge, evidence and review. Any cross-product data exchange requires an authorised purpose, appropriate safeguards and an auditable interface.
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
                aria-label="Connection map: Human Super Intelligence shared technology at the centre. Aksh Health, HSI Clinical, ISI Research and HSI Trials each retain their own access and governance boundaries."
              >
                <div className="hsi-editorial-map-core">
                  {PRODUCT_SHORT}
                  <small>SHARED TECH</small>
                </div>
                <span>AKSH · CONTROLLED ACCESS</span>
                <span>CLINICAL · CONTROLLED ACCESS</span>
                <span>ISI RESEARCH · CONTROLLED ACCESS</span>
                <span>TRIALS · CONTROLLED ACCESS</span>
              </div>
              <p className="hsi-products-connect-legend">
                <b>Shared intelligence capabilities</b>
                <span aria-hidden="true">·</span>
                <b>Governed data access</b>
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
          <p className="hsi-editorial-kicker">05 / UNDERSTAND THE APPROACH</p>
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
            Research tools do not diagnose, prescribe or confirm trial eligibility. Clinical and trial capabilities require separate governance and human validation before consequential use. {PRODUCT_SHORT} is not a single merged patient database; controlled exchange and shared knowledge services are architectural directions, not verified integrations.
          </small>
        </div>
      </section>
    </div>
  );
}
