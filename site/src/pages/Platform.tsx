import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";
import "../styles/platform.css";

type ProductId = EcosystemProduct["id"];

const productCopy: Record<ProductId, { label: string; description: string; data: string; link: string }> = {
  aksh: {
    label: "Health & care experience",
    description: "Organises health context and care workflows within Aksh’s own permissions and data environment. Shared technology supports review workflows without copying patient records into HSI.",
    data: "Aksh-owned records and access controls",
    link: "/for-aksh",
  },
  clinical: {
    label: "Longitudinal clinical intelligence · In development",
    description: "The planned clinical experience will organise authorised encounters, laboratory trends and treatment history for professional review. The public architecture is illustrative, not a live hospital integration.",
    data: "Future clinical records remain subject to identity, authorisation, provenance and care-provider governance",
    link: "/products",
  },
  isi: {
    label: "Specialist research experience",
    description: "Connects immune concepts, existing knowledge relationships and permitted evidence within ISI. Shared investigation tools help researchers inspect context and prepare work for human review.",
    data: "ISI-owned research data and access controls",
    link: "/for-isi",
  },
  trials: {
    label: "Trial intelligence · Planned",
    description: "A proposed investigator-led experience for exploring study criteria, missing information and pre-screening questions. No live matching, eligibility confirmation or enrolment is available.",
    data: "Future trial workflows require separate permissions, approved data pathways and investigator confirmation",
    link: "/for-trials",
  },
};

const capabilities = [
  {
    name: "Retrieve evidence",
    short: "Retrieve",
    number: "01",
    description: "Find relevant passages within the evidence supplied to an investigation. Retrieval is bounded by the selected collection and its permissions.",
    input: "A research question and permitted source passages",
    output: "Relevant passage references with source attribution",
    boundary: "Missing evidence stays visible. This does not imply a live search of all scientific literature.",
    pillar: "Traceable evidence",
  },
  {
    name: "Connect knowledge",
    short: "Connect",
    number: "02",
    description: "Follow existing knowledge relationships to bring relevant biological concepts into view. Keep original identifiers and the context behind each connection.",
    input: "Selected concepts and existing graph relationships",
    output: "A bounded neighbourhood of related concepts",
    boundary: "A graph connection provides context; it does not by itself establish causation or validate a claim.",
    pillar: "Connected context",
  },
  {
    name: "Structure investigations",
    short: "Investigate",
    number: "03",
    description: "Organise the question, evidence references, graph context and explicit assessments into a saved research investigation.",
    input: "Retrieved evidence and relevant biological context",
    output: "A traceable investigation with review checkpoints",
    boundary: "Candidate research questions remain unvalidated. Workflow completion is not scientific approval.",
    pillar: "Connected context",
  },
  {
    name: "Support human review",
    short: "Review",
    number: "04",
    description: "Let authorised reviewers inspect the investigation, record their assessment and export a brief with the evidence references retained.",
    input: "A saved investigation and reviewer assessment",
    output: "A review record and an exportable research brief",
    boundary: "Human review remains explicit. No automated clinical decision or trial eligibility determination is made.",
    pillar: "Human review",
  },
] as const;

const journeySteps = [
  {
    title: "Frame the question",
    detail: "Specify the population, biomarker definitions and outcomes being investigated.",
    note: "Method framing · not a study result",
  },
  {
    title: "Inspect the context",
    detail: "Consider relevant immune mechanisms and distinguish biological context from direct evidence.",
    note: "Connected context · not causation",
  },
  {
    title: "Compare the evidence",
    detail: "Examine permitted sources, study settings, conflicting assessments and missing information.",
    note: "Traceable evidence · gaps stay visible",
  },
  {
    title: "Prepare for review",
    detail: "Bring references, uncertainties and open questions into a brief for human assessment.",
    note: "Human review · not automated approval",
  },
] as const;

const trustPrinciples = [
  {
    title: "Provenance alongside evidence",
    detail: "Retain source references and versions so a reviewer can understand where information came from.",
  },
  {
    title: "Product-owned access",
    detail: "Each product keeps its own authentication, permissions and database. Sharing technology does not grant access to another product’s records.",
  },
  {
    title: "Human control at the decision point",
    detail: "Research outputs support investigation and review. They do not diagnose, prescribe or confirm trial eligibility.",
  },
] as const;

function FoundationArt() {
  return (
    <div
      className="hsi-platform-foundation"
      role="img"
      aria-label="Operating model: Human Super Intelligence is the shared technology foundation. Four product experiences reuse that software while each keeps its own data and governance. Evidence, knowledge and review are reusable patterns—not a live cross-product data pipe."
    >
      <div className="hsi-platform-foundation-label">OPERATING MODEL · HOW IT WORKS</div>
      <p className="hsi-platform-foundation-lede">
        One shared technology foundation. Four product experiences. Separate data ownership. Humans still review.
      </p>

      <div className="hsi-platform-foundation-core">
        <span className="hsi-platform-symbol" aria-hidden="true">{PRODUCT_SHORT[0]}</span>
        <div>
          <strong>{PRODUCT_NAME}</strong>
          <span>Shared technology foundation — software reuse, not a shared evidence database</span>
        </div>
      </div>

      <div className="hsi-platform-foundation-split">
        <div className="hsi-platform-foundation-shared">
          <span className="hsi-platform-foundation-eyebrow">What is shared</span>
          <p>Capability patterns each product can reuse in its own environment.</p>
          <ul>
            <li>Evidence</li>
            <li>Knowledge</li>
            <li>Review</li>
          </ul>
          <small>Connected context · Traceable evidence · Human review</small>
        </div>
        <div className="hsi-platform-foundation-owned">
          <span className="hsi-platform-foundation-eyebrow">What is never shared</span>
          <p>Product data, access rights and governance stay with each experience.</p>
          <div className="hsi-platform-foundation-products">
            {ECOSYSTEM_PRODUCTS.map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <small>{MATURITY_CHIP_LABEL[item.chip]} · own data · own governance</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="hsi-platform-foundation-foot">
        Software reuse. Product-owned data. No live cross-product sync claimed here.
      </p>
    </div>
  );
}

export function Platform() {
  const [productId, setProductId] = useState<ProductId>("isi");
  const [selected, setSelected] = useState(0);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const productMeta = ECOSYSTEM_PRODUCTS.find((item) => item.id === productId)!;
  const currentProduct = productCopy[productId];
  const capability = capabilities[selected];
  const journey = journeySteps[journeyIndex];

  return (
    <div className="hsi-editorial">
      <section className="hsi-platform-hero" aria-labelledby="platform-title">
        <div className="hsi-editorial-wrap hsi-platform-hero-grid">
          <div className="hsi-platform-hero-copy">
            <p className="hsi-editorial-kicker">
              <span className="hsi-coral-dot" /> {PRODUCT_NAME} / PLATFORM
            </p>
            <h1 id="platform-title">
              Shared intelligence.<br />
              <em>Distinct experiences.</em>
            </h1>
            <p className="hsi-editorial-lede">
              The technology that helps connect health questions, biological knowledge and scientific evidence—while keeping each product in control of its own data.
            </p>
            <div className="hsi-editorial-actions">
              <a className="hsi-editorial-button" href="#platform-architecture">Explore the architecture <span aria-hidden="true">↗</span></a>
              <Link className="hsi-editorial-textlink" to="/how-it-works">Follow the workflow ↗</Link>
            </div>
          </div>
          <FoundationArt />
        </div>
        <div className="hsi-editorial-wrap hsi-platform-hero-foot">
          <span>Shared technology · product-owned data</span>
          <span>Connected context · Traceable evidence · Human review</span>
        </div>
      </section>

      <section className="hsi-rebuild-stack hsi-platform-architecture" id="platform-architecture" aria-labelledby="architecture-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-rebuild-heading">
            <div>
              <p className="hsi-editorial-kicker">01 / THE CONNECTED ARCHITECTURE</p>
              <h2 id="architecture-title">
                SHARE THE TECHNOLOGY.<br />
                <em>KEEP THE BOUNDARIES.</em>
              </h2>
            </div>
            <p>Explore all four products and their current maturity, then inspect the shared technology capabilities. These are not claims of deployed cross-product integrations.</p>
          </div>

          <div className="hsi-platform-arch-layout">
            <div className="hsi-platform-arch-products">
              <div className="hsi-rebuild-stack-steps" role="group" aria-label="Product perspective">
                {ECOSYSTEM_PRODUCTS.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={"hsi-rebuild-layer" + (productId === item.id ? " is-active" : "")}
                    aria-pressed={productId === item.id}
                    onClick={() => setProductId(item.id)}
                  >
                    <span>0{i + 1}</span>
                    <strong>{item.name.toUpperCase()}</strong>
                    <small>{MATURITY_CHIP_LABEL[item.chip]} · separate governance</small>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <div className="hsi-platform-product-detail" aria-live="polite" aria-atomic="true">
                <p className="hsi-editorial-kicker">{currentProduct.label}</p>
                <h3>{productMeta.name}</h3>
                <p>{currentProduct.description}</p>
                <div className="hsi-platform-data-boundary">
                  <span aria-hidden="true">▤</span>
                  {currentProduct.data}
                </div>
                <Link className="hsi-rebuild-inline-link" to={currentProduct.link}>
                  Explore this product ↗
                </Link>
              </div>
            </div>

            <div className="hsi-rebuild-stack-display hsi-platform-capability-panel">
              <div className="hsi-platform-core-heading">
                <span className="hsi-platform-symbol" aria-hidden="true">{PRODUCT_SHORT[0]}</span>
                <div>
                  <h3>HSI shared technology</h3>
                  <p>Shared code, separate product execution</p>
                </div>
              </div>
              <div className="hsi-platform-capability-track" role="group" aria-label="Shared technology capabilities">
                {capabilities.map((item, i) => (
                  <button
                    key={item.number}
                    type="button"
                    className={"hsi-research-step" + (selected === i ? " is-active" : "")}
                    aria-pressed={selected === i}
                    aria-controls="capability-detail"
                    onClick={() => setSelected(i)}
                  >
                    <span className="hsi-research-step-index">{item.number}</span>
                    <span className="hsi-research-step-copy">
                      <strong>{item.short}</strong>
                      <small>{item.pillar}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <div className="hsi-research-insight" id="capability-detail" aria-live="polite" aria-atomic="true">
                <span className="hsi-editorial-kicker">SHARED CAPABILITY / {capability.number}</span>
                <h3>{capability.name}</h3>
                <p>{capability.description}</p>
                <dl className="hsi-platform-io">
                  <div>
                    <dt>START WITH</dt>
                    <dd>{capability.input}</dd>
                  </div>
                  <div>
                    <dt>PRODUCE</dt>
                    <dd>{capability.output}</dd>
                  </div>
                </dl>
                <p className="hsi-platform-boundary-note">{capability.boundary}</p>
              </div>
            </div>
          </div>

          <p className="hsi-platform-arch-note">
            Architecture explainer · Selecting a product changes this explanation only. Connections represent an architecture direction and existing scoped software reuse, not patient-record transfers, shared access rights or a live data feed.
          </p>
        </div>
      </section>

      <section className="hsi-rebuild-story" aria-labelledby="journey-title">
        <div className="hsi-editorial-wrap hsi-rebuild-story-grid">
          <div>
            <p className="hsi-editorial-kicker">02 / AN ILLUSTRATIVE RESEARCH JOURNEY</p>
            <h2 id="journey-title">
              A QUESTION BECOMES<br />
              <em>A REVIEWABLE INVESTIGATION.</em>
            </h2>
            <p>
              Consider a research question about variation in anti-TNF response in rheumatoid arthritis. The steps below explain the method, rather than report study findings.
            </p>
            <div className="hsi-platform-journey-note">
              <span aria-hidden="true">+</span>
              <p>An evidence gap stays a gap. The platform should make missing information clear rather than fill it with an unsupported conclusion.</p>
            </div>
          </div>
          <div className="hsi-rebuild-research-visual" aria-label="Illustrative research method for an anti-TNF rheumatoid arthritis question, not study findings">
            <div className="hsi-rebuild-visual-top">
              <span>METHOD / ANTI-TNF · RA</span>
              <span>SELECT A STAGE</span>
            </div>
            <div className="hsi-research-flow" role="group" aria-label="Illustrative research method stages">
              {journeySteps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  className={"hsi-research-step" + (journeyIndex === i ? " is-active" : "")}
                  aria-pressed={journeyIndex === i}
                  onClick={() => setJourneyIndex(i)}
                >
                  <span className="hsi-research-step-index">0{i + 1}</span>
                  <span className="hsi-research-step-copy">
                    <strong>{step.title}</strong>
                    <small>{step.note}</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <div className="hsi-research-insight" aria-live="polite">
              <span className="hsi-editorial-kicker">METHOD LENS / 0{journeyIndex + 1}</span>
              <div className="hsi-research-insight-art" aria-hidden="true"><span /><span /><span /><span /><span /></div>
              <h3>{journey.title}</h3>
              <p>{journey.detail}</p>
            </div>
            <p className="hsi-research-disclaimer">Illustrative workflow only · No patient data or fabricated scientific findings.</p>
          </div>
        </div>
      </section>

      <section className="hsi-editorial-connection" aria-labelledby="trust-title">
        <div className="hsi-editorial-wrap hsi-editorial-connection-grid">
          <div>
            <p className="hsi-editorial-kicker">03 / BUILT AROUND ACCOUNTABILITY</p>
            <h2 id="trust-title">
              The connection matters.<br />
              <em>So does the context.</em>
            </h2>
            <p>
              Provenance, product-owned access and human control keep shared technology from becoming a shared evidence database or an automated clinical decision system.
            </p>
          </div>
          <div className="hsi-platform-principles">
            {trustPrinciples.map((item, i) => (
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
          <p className="hsi-editorial-kicker">04 / FROM FOUNDATION TO EXPERIENCE</p>
          <h2>
            Understand the technology.<br />
            <em>Find your starting point.</em>
          </h2>
          <p>Explore the specialist experiences built around our shared vision.</p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/products">Explore the products <span aria-hidden="true">↗</span></Link>
            <Link className="hsi-editorial-textlink" to="/how-it-works">See how it works ↗</Link>
          </div>
          <small>
            Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to human validation. HSI does not operate a shared evidence database across products.
          </small>
        </div>
      </section>
    </div>
  );
}
