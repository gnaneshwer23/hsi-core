import { BiologyArtwork } from "../components/editorial/Editorial";
import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import {
  PlatformConnectionMap,
  SharedSoftwareArt,
} from "../components/platform/PlatformArt";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";
import "../styles/platform.css";

type ProductId = EcosystemProduct["id"];

/** Arrow/Home/End navigation for exclusive radiogroups built from buttons. */
function moveRadioFocus(
  event: KeyboardEvent<HTMLElement>,
  index: number,
  length: number,
  select: (next: number) => void,
) {
  let next: number | null = null;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      next = (index + 1) % length;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      next = (index - 1 + length) % length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  select(next);
  const group = event.currentTarget.closest("[role='radiogroup']");
  const radios = group?.querySelectorAll<HTMLElement>('[role="radio"]');
  radios?.[next]?.focus();
}

const productCopy: Record<ProductId, { label: string; description: string; data: string; link: string }> = {
  aksh: {
    label: "Health & care experience",
    description: "Organises health context and care work within Aksh’s own permissions and data environment. Shared Human Super Intelligence patterns support review without copying patient records into HSI.",
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
    description: "Connects immune concepts, existing knowledge relationships and permitted evidence within ISI Research. Shared investigation tools help researchers inspect context and prepare work for human review—inside ISI Research’s own data boundary.",
    data: "ISI Research–owned research data and access controls",
    link: "/for-isi",
  },
  trials: {
    label: "Trial intelligence · Planned",
    description: "A proposed investigator-led experience for exploring study criteria, missing information and pre-screening questions. No live matching, eligibility confirmation or enrolment is available.",
    data: "Future trial capabilities require separate permissions, approved data pathways and investigator confirmation",
    link: "/for-trials",
  },
};

/** Reusable capability patterns — not ordered stages of a live pipeline. */
const capabilities = [
  {
    name: "Evidence",
    short: "Evidence",
    number: "01",
    description: "Find relevant passages within the evidence supplied to an investigation. Retrieval is bounded by the selected collection and its permissions.",
    input: "A research question and permitted source passages",
    output: "Relevant passage references with source attribution",
    boundary: "Missing evidence stays visible. This does not imply a live search of all scientific literature.",
    pillar: "Traceable evidence",
  },
  {
    name: "Knowledge",
    short: "Knowledge",
    number: "02",
    description: "Follow existing knowledge relationships to bring relevant biological concepts into view. Keep original identifiers and the context behind each connection.",
    input: "Selected concepts and existing graph relationships",
    output: "A bounded neighbourhood of related concepts",
    boundary: "A graph connection provides context; it does not by itself establish causation or validate a claim.",
    pillar: "Connected context",
  },
  {
    name: "Investigation",
    short: "Investigation",
    number: "03",
    description: "Organise the question, evidence references, graph context and explicit assessments into a saved research investigation inside the product that owns the data.",
    input: "Permitted evidence references and relevant biological context",
    output: "A traceable investigation ready for human review",
    boundary: "Candidate research questions remain unvalidated. Saving an investigation is not scientific approval.",
    pillar: "Connected context",
  },
  {
    name: "Review",
    short: "Review",
    number: "04",
    description: "Let authorised reviewers inspect the investigation, record their assessment and export a brief with the evidence references retained.",
    input: "A saved investigation and reviewer assessment",
    output: "A review record and an exportable research brief",
    boundary: "Human review remains explicit. No automated clinical decision or trial eligibility determination is made.",
    pillar: "Human review",
  },
] as const;

/** Method lenses for one illustrative question — not a product workflow. */
const methodLenses = [
  {
    title: "Frame the question",
    detail: "Specify the population, biomarker definitions and outcomes being investigated—before treating any answer as settled.",
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

/** Compact experience entries — ownership-first, no storefront photography. */
const experienceEntries: readonly {
  id: ProductId;
  href: string;
  ownership: string;
}[] = [
  {
    id: "aksh",
    href: "/for-aksh",
    ownership: "Aksh-owned health records and access controls",
  },
  {
    id: "isi",
    href: "/for-isi",
    ownership: "ISI Research–owned evidence and research data",
  },
  {
    id: "clinical",
    href: "/products",
    ownership: "Care-provider governed clinical records — not a live hospital feed",
  },
  {
    id: "trials",
    href: "/for-trials",
    ownership: "Investigator-led pathways · separate permissions",
  },
];

export function Platform() {
  const [productId, setProductId] = useState<ProductId>("isi");
  const [selected, setSelected] = useState(0);
  const [lensIndex, setLensIndex] = useState(0);
  const productMeta = ECOSYSTEM_PRODUCTS.find((item) => item.id === productId)!;
  const currentProduct = productCopy[productId];
  const capability = capabilities[selected];
  const lens = methodLenses[lensIndex];

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
              <Link className="hsi-editorial-textlink" to="/how-it-works">See how investigations work ↗</Link>
            </div>
          </div>
          <BiologyArtwork />
        </div>
        <div className="hsi-editorial-wrap hsi-platform-hero-foot">
          <span>Shared technology · product-owned data</span>
          <span>Connected context · Traceable evidence · Human review</span>
        </div>
      </section>

      <section className="hsi-editorial-intro hsi-platform-idea" aria-labelledby="operating-idea-title">
        <div className="hsi-editorial-wrap hsi-idea-grid">
          <div className="hsi-idea-copy">
            <p className="hsi-editorial-kicker">01 / THE OPERATING IDEA</p>
            <h2 id="operating-idea-title">
              Share the software.<br />
              <em>Never share the records.</em>
            </h2>
            <p>
              Products reuse HSI capabilities for evidence, biological knowledge, investigation and review while keeping their records under their own permissions. Shared technology connects the work; source ownership and access remain with each product.
            </p>
            <a className="hsi-editorial-textlink" href="#platform-architecture">
              Inspect the architecture ↗
            </a>
          </div>
          <figure className="hsi-idea-figure">
            <SharedSoftwareArt />
            <figcaption>
              Shared research technology. Product-owned records and permissions.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="hsi-rebuild-stack hsi-platform-architecture" id="platform-architecture" aria-labelledby="architecture-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-rebuild-heading">
            <div>
              <p className="hsi-editorial-kicker">02 / THE CONNECTED ARCHITECTURE</p>
              <h2 id="architecture-title">
                SHARE THE TECHNOLOGY.<br />
                <em>KEEP THE BOUNDARIES.</em>
              </h2>
            </div>
            <p>
              Pick a product to see its data boundary, then inspect shared capability patterns. Patterns are reusable software—not ordered stages of a live cross-product pipeline, and not claims of deployed integrations.
            </p>
          </div>

          <div className="hsi-platform-arch-layout">
            <div className="hsi-platform-arch-products">
              <div
                className="hsi-rebuild-stack-steps"
                role="radiogroup"
                aria-label="Product perspective"
              >
                {ECOSYSTEM_PRODUCTS.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    className={"hsi-rebuild-layer" + (productId === item.id ? " is-active" : "")}
                    aria-checked={productId === item.id}
                    aria-controls="product-detail"
                    tabIndex={productId === item.id ? 0 : -1}
                    onClick={() => setProductId(item.id)}
                    onKeyDown={(event) =>
                      moveRadioFocus(event, i, ECOSYSTEM_PRODUCTS.length, (next) =>
                        setProductId(ECOSYSTEM_PRODUCTS[next]!.id),
                      )
                    }
                  >
                    <span>0{i + 1}</span>
                    <strong>{item.name.toUpperCase()}</strong>
                    <small>{MATURITY_CHIP_LABEL[item.chip]} · separate governance</small>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <div
                className="hsi-platform-product-detail"
                id="product-detail"
                aria-live="polite"
                aria-atomic="true"
              >
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
                  <h3>{PRODUCT_SHORT} shared technology</h3>
                  <p>Reusable patterns · separate product data</p>
                </div>
              </div>
              <div className="hsi-rebuild-orbit hsi-platform-capability-orbit" aria-hidden="true">
                <span className="hsi-rebuild-orbit-a" />
                <span className="hsi-rebuild-orbit-b" />
                <span className="hsi-rebuild-orbit-c" />
                <b>{capability.short.toUpperCase()}</b>
              </div>
              <div
                className="hsi-platform-capability-track"
                role="radiogroup"
                aria-label="Shared capability patterns, not a pipeline"
              >
                {capabilities.map((item, i) => (
                  <button
                    key={item.number}
                    type="button"
                    role="radio"
                    className={"hsi-research-step" + (selected === i ? " is-active" : "")}
                    aria-checked={selected === i}
                    aria-controls="capability-detail"
                    tabIndex={selected === i ? 0 : -1}
                    onClick={() => setSelected(i)}
                    onKeyDown={(event) =>
                      moveRadioFocus(event, i, capabilities.length, setSelected)
                    }
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
                <span className="hsi-editorial-kicker">CAPABILITY PATTERN / {capability.number}</span>
                <h3>{capability.name}</h3>
                <p>{capability.description}</p>
                <dl className="hsi-platform-io">
                  <div>
                    <dt>BOUNDED TO</dt>
                    <dd>{capability.input}</dd>
                  </div>
                  <div>
                    <dt>SURFACES</dt>
                    <dd>{capability.output}</dd>
                  </div>
                </dl>
                <p className="hsi-platform-boundary-note">{capability.boundary}</p>
              </div>
            </div>
          </div>

          <p className="hsi-platform-arch-note">
            Architecture explainer · Selecting a product changes this explanation only. Capability patterns describe software reuse inside each product’s own environment—not patient-record transfers, shared access rights or a live data feed.
          </p>
        </div>
      </section>

      <section className="hsi-rebuild-story" aria-labelledby="method-title">
        <div className="hsi-editorial-wrap hsi-rebuild-story-grid">
          <div>
            <p className="hsi-editorial-kicker">03 / METHOD LENSES · NOT A PIPELINE</p>
            <h2 id="method-title">
              HOW AN INVESTIGATION<br />
              <em>SHOULD BE REVIEWED.</em>
            </h2>
            <p>
              Consider a research question about variation in anti-TNF response in rheumatoid arthritis. Each lens below is a way to inspect that question—not a stage in a product workflow that runs itself.
            </p>
            <div className="hsi-platform-journey-note">
              <span aria-hidden="true">+</span>
              <p>An evidence gap stays a gap. Human Super Intelligence should make missing information clear rather than fill it with an unsupported conclusion.</p>
            </div>
          </div>
          <div
            className="hsi-rebuild-research-visual"
            aria-label="Illustrative method lenses for an anti-TNF rheumatoid arthritis question, not a live product workflow or study findings"
          >
            <div className="hsi-rebuild-visual-top">
              <span>METHOD / ANTI-TNF · RA</span>
              <span>CHOOSE A LENS</span>
            </div>
            <div
              className="hsi-research-flow"
              role="radiogroup"
              aria-label="Illustrative method lenses"
            >
              {methodLenses.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  role="radio"
                  className={"hsi-research-step" + (lensIndex === i ? " is-active" : "")}
                  aria-checked={lensIndex === i}
                  aria-controls="method-lens-detail"
                  tabIndex={lensIndex === i ? 0 : -1}
                  onClick={() => setLensIndex(i)}
                  onKeyDown={(event) =>
                    moveRadioFocus(event, i, methodLenses.length, setLensIndex)
                  }
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
            <div
              className="hsi-research-insight"
              id="method-lens-detail"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="hsi-editorial-kicker">METHOD LENS / 0{lensIndex + 1}</span>
              <div className="hsi-research-insight-art" aria-hidden="true"><span /><span /><span /><span /><span /></div>
              <h3>{lens.title}</h3>
              <p>{lens.detail}</p>
            </div>
            <p className="hsi-research-disclaimer">Illustrative method only · Not a product pipeline · No patient data or fabricated scientific findings.</p>
          </div>
        </div>
      </section>

      <section className="hsi-editorial-connection hsi-platform-accountability" aria-labelledby="trust-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-platform-trust-head">
            <div>
              <p className="hsi-editorial-kicker">04 / BUILT AROUND ACCOUNTABILITY</p>
              <h2 id="trust-title">
                Shared technology.<br />
                <em>Separate accountability.</em>
              </h2>
            </div>
            <p>
              Provenance, product-owned access and human control keep Human Super Intelligence from becoming a shared evidence database or an automated clinical decision system. Technology patterns can be reused; records never sync across products by default.
            </p>
          </div>

          <div className="hsi-platform-trust-body">
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

            <PlatformConnectionMap />
          </div>
        </div>
      </section>

      <section className="hsi-platform-experiences" aria-labelledby="experiences-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-platform-experiences-head">
            <div>
              <p className="hsi-editorial-kicker">05 / EXPERIENCE ENTRY</p>
              <h2 id="experiences-title">
                Four experiences.<br />
                <em>Four ownership lines.</em>
              </h2>
            </div>
            <p>
              Pick a starting product. Each reuses shared Human Super Intelligence patterns inside its own data boundary—software can be shared; records are not.
            </p>
          </div>

          <div className="hsi-platform-experience-grid" role="list">
            {experienceEntries.map((entry) => {
              const product = ECOSYSTEM_PRODUCTS.find((item) => item.id === entry.id)!;
              const ownershipId = `experience-ownership-${entry.id}`;
              return (
                <article
                  key={entry.id}
                  className={"hsi-platform-experience hsi-platform-experience-" + entry.id}
                  role="listitem"
                >
                  <div className="hsi-platform-experience-top">
                    <h3 id={`experience-title-${entry.id}`}>{product.name}</h3>
                    <span className={`maturity-chip maturity-chip-${product.chip}`}>
                      {MATURITY_CHIP_LABEL[product.chip]}
                    </span>
                  </div>
                  <p className="hsi-platform-experience-ownership" id={ownershipId}>
                    {entry.ownership}
                  </p>
                  <Link
                    className="hsi-platform-experience-link"
                    to={entry.href}
                    aria-labelledby={`experience-title-${entry.id}`}
                    aria-describedby={ownershipId}
                  >
                    Enter {product.name} <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="hsi-platform-experiences-cta">
            <Link className="hsi-editorial-button" to="/products">
              Open the products catalogue <span aria-hidden="true">↗</span>
            </Link>
            <Link className="hsi-editorial-textlink" to="/how-it-works">
              See how investigations work ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">06 / KEEP THE BOUNDARIES CLEAR</p>
          <h2>
            Understand the operating model.<br />
            <em>Stay honest about what is shared.</em>
          </h2>
          <p>
            Technology patterns can travel across products. Patient records, research collections and trial data stay behind each product’s permissions wall.
          </p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/products">Explore the products <span aria-hidden="true">↗</span></Link>
            <Link className="hsi-editorial-textlink" to="/status">Check product maturity ↗</Link>
          </div>
          <small>
            Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to human validation. Human Super Intelligence does not operate a shared evidence database across products.
          </small>
        </div>
      </section>
    </div>
  );
}
