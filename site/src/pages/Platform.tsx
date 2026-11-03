import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/platform.css";

type Product = "aksh" | "isi";

const products = {
  aksh: {
    name: "Aksh Health",
    label: "Health & care experience",
    description: "Organises health context and care workflows within Aksh’s own permissions and data environment. Shared technology supports review workflows without copying patient records into HSI.",
    data: "Aksh-owned records and access controls",
    link: "/for-aksh",
  },
  isi: {
    name: "Immune Super Intelligence",
    label: "Specialist research experience",
    description: "Connects immune concepts, existing knowledge relationships and permitted evidence within ISI. Shared investigation tools help researchers inspect context and prepare work for human review.",
    data: "ISI-owned research data and access controls",
    link: "/for-isi",
  },
};

const capabilities = [
  {
    name: "Retrieve evidence", short: "Retrieve", number: "01",
    description: "Find relevant passages within the evidence supplied to an investigation. Retrieval is bounded by the selected collection and its permissions.",
    input: "A research question and permitted source passages",
    output: "Relevant passage references with source attribution",
    boundary: "Missing evidence stays visible. This does not imply a live search of all scientific literature.",
  },
  {
    name: "Connect knowledge", short: "Connect", number: "02",
    description: "Follow existing knowledge relationships to bring relevant biological concepts into view. Keep original identifiers and the context behind each connection.",
    input: "Selected concepts and existing graph relationships",
    output: "A bounded neighbourhood of related concepts",
    boundary: "A graph connection provides context; it does not by itself establish causation or validate a claim.",
  },
  {
    name: "Structure investigations", short: "Investigate", number: "03",
    description: "Organise the question, evidence references, graph context and explicit assessments into a saved research investigation.",
    input: "Retrieved evidence and relevant biological context",
    output: "A traceable investigation with review checkpoints",
    boundary: "Candidate research questions remain unvalidated. Workflow completion is not scientific approval.",
  },
  {
    name: "Support human review", short: "Review", number: "04",
    description: "Let authorised reviewers inspect the investigation, record their assessment and export a brief with the evidence references retained.",
    input: "A saved investigation and reviewer assessment",
    output: "A review record and an exportable research brief",
    boundary: "Human review remains explicit. No automated clinical decision or trial eligibility determination is made.",
  },
];

function Arrow() {
  return <svg className="pl-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function Platform() {
  const [product, setProduct] = useState<Product>("isi");
  const [selected, setSelected] = useState(0);
  const currentProduct = products[product];
  const capability = capabilities[selected];

  return (
    <div className="pl-page">
      <section className="pl-hero" aria-labelledby="platform-title">
        <div className="pl-wrap pl-hero-grid">
          <div>
            <p className="pl-eyebrow"><span /> THE HSI PLATFORM</p>
            <h1 id="platform-title">Shared intelligence.<br /><em>Distinct experiences.</em></h1>
            <p className="pl-lede">The technology that helps connect health questions, biological knowledge and scientific evidence—while keeping each product in control of its own data.</p>
            <div className="pl-actions"><a className="pl-button" href="#platform-architecture">Explore the architecture <Arrow /></a><Link className="pl-link" to="/how-it-works">Follow the workflow <Arrow /></Link></div>
          </div>
          <div className="pl-foundation" role="img" aria-label="Aksh Health and ISI Research use HSI shared technology while retaining separate product data stores.">
            <div className="pl-foundation-label">ONE FOUNDATION / SEPARATE DATA</div>
            <div className="pl-foundation-products"><div><span>AKSH HEALTH</span><i /><small>Own data & permissions</small></div><div><span>ISI RESEARCH</span><i /><small>Own data & permissions</small></div></div>
            <div className="pl-foundation-lines" aria-hidden="true"><span /><span /></div>
            <div className="pl-foundation-core"><span className="pl-symbol" aria-hidden="true">H</span><div><strong>Human Super Intelligence</strong><span>Shared technology foundation</span></div></div>
            <div className="pl-foundation-tools"><span>Evidence</span><span>Knowledge</span><span>Review</span></div>
            <p>Software reuse. Product-owned data.</p>
          </div>
        </div>
        <div className="pl-wrap pl-hero-foot"><span>RETRIEVE <b>→</b> CONNECT <b>→</b> INVESTIGATE <b>→</b> REVIEW</span><span>Traceable evidence. Human judgement.</span></div>
      </section>

      <section className="pl-section pl-architecture" id="platform-architecture" aria-labelledby="architecture-title">
        <div className="pl-wrap">
          <div className="pl-heading"><div><p className="pl-eyebrow">THE CONNECTED ARCHITECTURE</p><h2 id="architecture-title">Share the technology.<br /><em>Keep the boundaries.</em></h2></div><p>Explore a product’s role, then select a capability to see what the shared foundation does.</p></div>
          <div className="pl-architecture-layout">
            <div className="pl-product-column">
              <div className="pl-product-selector" role="group" aria-label="Product perspective">{(Object.keys(products) as Product[]).map(id => <button key={id} type="button" aria-pressed={product === id} onClick={() => setProduct(id)}>{id === "aksh" ? "Aksh Health" : "ISI Research"}<Arrow /></button>)}</div>
              <div className="pl-product-detail" aria-live="polite" aria-atomic="true"><p className="pl-eyebrow">{currentProduct.label}</p><h3>{currentProduct.name}</h3><p>{currentProduct.description}</p><div className="pl-data-boundary"><span aria-hidden="true">▤</span>{currentProduct.data}</div><Link className="pl-link" to={currentProduct.link}>Explore this product <Arrow /></Link></div>
            </div>
            <div className="pl-core-column">
              <div className="pl-core-heading"><span className="pl-symbol" aria-hidden="true">H</span><div><h3>HSI shared technology</h3><p>Shared code, separate product execution</p></div></div>
              <div className="pl-capability-selector" role="group" aria-label="Shared technology capabilities">{capabilities.map((c, i) => <button key={c.number} type="button" aria-pressed={selected === i} aria-controls="capability-detail" onClick={() => setSelected(i)}><span>{c.number}</span>{c.short}<Arrow /></button>)}</div>
              <div className="pl-capability-detail" id="capability-detail" aria-live="polite" aria-atomic="true"><h3>{capability.name}</h3><p>{capability.description}</p><dl><div><dt>START WITH</dt><dd>{capability.input}</dd></div><div><dt>PRODUCE</dt><dd>{capability.output}</dd></div></dl><p className="pl-boundary-note">{capability.boundary}</p></div>
            </div>
          </div>
          <p className="pl-architecture-note">Architecture explainer · Selecting a product changes this explanation only. Connections represent software reuse, not patient-record transfers or a live data feed.</p>
        </div>
      </section>

      <section className="pl-section pl-journey" aria-labelledby="journey-title">
        <div className="pl-wrap"><div className="pl-heading"><div><p className="pl-eyebrow">AN ILLUSTRATIVE RESEARCH JOURNEY</p><h2 id="journey-title">A question becomes<br /><em>a reviewable investigation.</em></h2></div><p>Consider a research question about variation in anti-TNF response in rheumatoid arthritis. The steps below explain the method, rather than report study findings.</p></div>
          <ol className="pl-steps">
            <li><span>01</span><h3>Frame the question</h3><p>Specify the population, biomarker definitions and outcomes being investigated.</p></li>
            <li><span>02</span><h3>Inspect the context</h3><p>Consider relevant immune mechanisms and distinguish biological context from direct evidence.</p></li>
            <li><span>03</span><h3>Compare the evidence</h3><p>Examine permitted sources, study settings, conflicting assessments and missing information.</p></li>
            <li><span>04</span><h3>Prepare for review</h3><p>Bring references, uncertainties and open questions into a brief for human assessment.</p></li>
          </ol>
          <div className="pl-journey-note"><span aria-hidden="true">+</span><p>An evidence gap stays a gap. The platform should make missing information clear rather than fill it with an unsupported conclusion.</p></div>
        </div>
      </section>

      <section className="pl-section pl-trust" aria-labelledby="trust-title"><div className="pl-wrap pl-trust-grid"><div><p className="pl-eyebrow">BUILT AROUND ACCOUNTABILITY</p><h2 id="trust-title">The connection matters.<br /><em>So does the context.</em></h2></div><div className="pl-principles"><article><span>01</span><div><h3>Provenance alongside evidence</h3><p>Retain source references and versions so a reviewer can understand where information came from.</p></div></article><article><span>02</span><div><h3>Product-owned access</h3><p>Each product keeps its own authentication, permissions and database. Sharing technology does not grant access to another product’s records.</p></div></article><article><span>03</span><div><h3>Human control at the decision point</h3><p>Research outputs support investigation and review. They do not diagnose, prescribe or confirm trial eligibility.</p></div></article></div></div></section>

      <section className="pl-section pl-closing"><div className="pl-wrap"><p className="pl-eyebrow">FROM FOUNDATION TO EXPERIENCE</p><h2>Understand the technology.<br /><em>Find your starting point.</em></h2><p>Explore the specialist experiences built around our shared vision.</p><div className="pl-actions"><Link className="pl-button" to="/products">Explore the products <Arrow /></Link><Link className="pl-link" to="/how-it-works">See how it works <Arrow /></Link></div></div></section>
    </div>
  );
}
