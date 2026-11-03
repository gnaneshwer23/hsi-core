import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME } from "../lib/brand";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../lib/productMaturity";
import "../styles/platform.css";

type Product = "aksh" | "clinical" | "isi" | "trials";

const products = {
  aksh: {
    name: "Aksh Health",
    label: "Health & care experience",
    description: "Organises health context and care workflows within Aksh’s own permissions and data environment. Shared technology supports review workflows without copying patient records into HSI.",
    data: "Aksh-owned records and access controls",
    link: "/for-aksh",
  },
  clinical: {
    name: "HSI Clinical",
    label: "Longitudinal clinical intelligence · In development",
    description: "The planned clinical experience will organise authorised encounters, laboratory trends and treatment history for professional review. The public architecture is illustrative, not a live hospital integration.",
    data: "Future clinical records remain subject to identity, authorisation, provenance and care-provider governance",
    link: "/products",
  },
  trials: {
    name: "HSI Trials",
    label: "Trial intelligence · Planned",
    description: "A proposed investigator-led experience for exploring study criteria, missing information and pre-screening questions. No live matching, eligibility confirmation or enrolment is available.",
    data: "Future trial workflows require separate permissions, approved data pathways and investigator confirmation",
    link: "/for-trials",
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


const graphDomains = [
  { id: "patient", number: "01", title: "Patient context", status: "Governed clinical direction", nodes: ["Encounters", "Symptoms", "Laboratory results", "Medications", "Outcomes"], detail: "A longitudinal view can connect encounters, measurements, treatments and outcomes only where identity, purpose and access have been authorised.", boundary: "Identifiable patient information remains in governed clinical or patient environments. It is not copied into the public biomedical graph." },
  { id: "biology", number: "02", title: "Human biology", status: "Research foundation", nodes: ["Organs", "Tissues", "Immune cells", "Pathways", "Biomarkers"], detail: "Trace how organs, tissues, cell states and molecular pathways relate to physiological functions and disease questions.", boundary: "A biological relationship is context, not automatically causal evidence or a clinical conclusion." },
  { id: "microbiome", number: "03", title: "Gut–immune–metabolic", status: "Developing knowledge direction", nodes: ["Microbes", "Metabolites", "Host pathways", "Immune processes", "Metabolic phenotypes"], detail: "Bring microbial functions, host metabolism and immune pathways into a research framework with explicit study context.", boundary: "Population associations are not treated as patient-specific measurements or proven causal mechanisms." },
  { id: "evidence", number: "04", title: "Biomedical evidence", status: "Scoped evidence infrastructure", nodes: ["Publications", "Datasets", "Findings", "Contradictions", "Hypotheses"], detail: "Link source material and versioned findings to uncertainty, conflicting interpretations and researcher-proposed questions.", boundary: "Unreviewed hypotheses remain separate from approved findings. Publication and dataset rights must be checked." },
] as const;

const researchTracks = {
  ssc: { name: "Systemic sclerosis", state: "Curation pending", question: "How do CD4/Tfh, B cells and IL-21 feature in proposed SSc mechanisms?", focus: ["CD4 / Tfh", "B cells", "IL-21", "EBV uncertainty"], boundary: "An emerging research direction, not a verified SSc mechanism release. EBV remains an uncertainty branch." },
  ra: { name: "Rheumatoid arthritis", state: "Research working set", question: "What does RF/anti-CCP evidence suggest about variation in anti-TNF response?", focus: ["RF", "Anti-CCP", "Anti-TNF", "Study heterogeneity"], boundary: "Existing RA materials are a research working set. Source availability does not imply scientific approval." },
} as const;

const intelligenceStages = [
  { label: "Source", detail: "Register permitted research sources and retain origin, version and rights." },
  { label: "Retrieve", detail: "Find relevant passages within an authorised, bounded collection." },
  { label: "Connect", detail: "Explore graph neighbourhoods while retaining relationship context." },
  { label: "Investigate", detail: "Compare findings, surface contradictions and record missing evidence." },
  { label: "Propose", detail: "Record candidate hypotheses separately from established evidence." },
  { label: "Review", detail: "A responsible human reviewer decides what, if anything, is approved." },
] as const;

function Arrow() {
  return <svg className="pl-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function Platform() {
  const [product, setProduct] = useState<Product>("isi");
  const [selected, setSelected] = useState(0);
  const [graphDomain, setGraphDomain] = useState(1);
  const [researchTrack, setResearchTrack] = useState<"ssc" | "ra">("ssc");
  const [intelligenceStage, setIntelligenceStage] = useState(0);
  const currentProduct = products[product];
  const capability = capabilities[selected];

  return (
    <div className="pl-page">
      <section className="pl-hero" aria-labelledby="platform-title">
        <div className="pl-wrap pl-hero-grid">
          <div>
            <p className="pl-eyebrow"><span /> THE HSI PLATFORM</p>
            <h1 id="platform-title">Shared intelligence.<br /><em>Distinct experiences.</em></h1>
            <p className="pl-lede">Explore how governed health context, human biology and scientific evidence can work together through shared intelligence—without collapsing product permissions or confusing hypotheses with approved knowledge.</p>
            <div className="pl-actions"><a className="pl-button" href="#platform-architecture">Explore the architecture <Arrow /></a><Link className="pl-link" to="/how-it-works">Follow the workflow <Arrow /></Link></div>
          </div>
          <div className="pl-foundation" role="img" aria-label="Four distinct HSI product experiences share a technology direction while retaining separate data ownership and maturity states.">
            <div className="pl-foundation-label">ONE FOUNDATION / SEPARATE DATA</div>
            <div className="pl-foundation-products">{ECOSYSTEM_PRODUCTS.map(item => <div key={item.id}><span>{item.name.toUpperCase()}</span><i /><small>{MATURITY_CHIP_LABEL[item.chip]} · separate governance</small></div>)}</div>
            <div className="pl-foundation-lines" aria-hidden="true"><span /><span /></div>
            <div className="pl-foundation-core"><span className="pl-symbol" aria-hidden="true">H</span><div><strong>{PRODUCT_NAME}</strong><span>Shared technology foundation</span></div></div>
            <div className="pl-foundation-tools"><span>Evidence</span><span>Knowledge</span><span>Review</span></div>
            <p>Software reuse. Product-owned data.</p>
          </div>
        </div>
        <div className="pl-wrap pl-hero-foot"><span>RETRIEVE <b>→</b> CONNECT <b>→</b> INVESTIGATE <b>→</b> REVIEW</span><span>Traceable evidence. Human judgement.</span></div>
      </section>

      <section className="pl-section pl-architecture" id="platform-architecture" aria-labelledby="architecture-title">
        <div className="pl-wrap">
          <div className="pl-heading"><div><p className="pl-eyebrow">THE CONNECTED ARCHITECTURE</p><h2 id="architecture-title">Share the technology.<br /><em>Keep the boundaries.</em></h2></div><p>Explore all four products and their current maturity, then inspect the shared technology capabilities. These are not claims of deployed cross-product integrations.</p></div>
          <div className="pl-architecture-layout">
            <div className="pl-product-column">
              <div className="pl-product-selector" role="group" aria-label="Product perspective">{(Object.keys(products) as Product[]).map(id => <button key={id} type="button" aria-pressed={product === id} onClick={() => setProduct(id)}>{products[id].name} <small className="pl-selector-maturity">{MATURITY_CHIP_LABEL[ECOSYSTEM_PRODUCTS.find(item => item.id === id)!.chip]}</small><Arrow /></button>)}</div>
              <div className="pl-product-detail" aria-live="polite" aria-atomic="true"><p className="pl-eyebrow">{currentProduct.label}</p><h3>{currentProduct.name}</h3><p>{currentProduct.description}</p><div className="pl-data-boundary"><span aria-hidden="true">▤</span>{currentProduct.data}</div><Link className="pl-link" to={currentProduct.link}>Explore this product <Arrow /></Link></div>
            </div>
            <div className="pl-core-column">
              <div className="pl-core-heading"><span className="pl-symbol" aria-hidden="true">H</span><div><h3>HSI shared technology</h3><p>Shared code, separate product execution</p></div></div>
              <div className="pl-capability-selector" role="group" aria-label="Shared technology capabilities">{capabilities.map((c, i) => <button key={c.number} type="button" aria-pressed={selected === i} aria-controls="capability-detail" onClick={() => setSelected(i)}><span>{c.number}</span>{c.short}<Arrow /></button>)}</div>
              <div className="pl-capability-detail" id="capability-detail" aria-live="polite" aria-atomic="true"><h3>{capability.name}</h3><p>{capability.description}</p><dl><div><dt>START WITH</dt><dd>{capability.input}</dd></div><div><dt>PRODUCE</dt><dd>{capability.output}</dd></div></dl><p className="pl-boundary-note">{capability.boundary}</p></div>
            </div>
          </div>
          <p className="pl-architecture-note">Architecture explainer · Selecting a product changes this explanation only. Connections represent an architecture direction and existing scoped software reuse, not patient-record transfers, shared access rights or a live data feed.</p>
        </div>
      </section>


      <section className="pl-section pl-graph-section" id="knowledge-graph" aria-labelledby="graph-title">
        <div className="pl-wrap">
          <div className="pl-heading"><div><p className="pl-eyebrow">01 / LIVING HEALTH KNOWLEDGE GRAPH</p><h2 id="graph-title">Four domains.<br /><em>Context in every connection.</em></h2></div><p>Explore the logical knowledge architecture. These domains describe governed relationships, not a single shared database or unrestricted patient-data access.</p></div>
          <div className="pl-graph-explorer">
            <div className="pl-graph-tabs" role="group" aria-label="Knowledge graph domain">{graphDomains.map((domain, index) => <button type="button" key={domain.id} aria-pressed={graphDomain === index} onClick={() => setGraphDomain(index)}><span>{domain.number}</span>{domain.title}</button>)}</div>
            <div className="pl-graph-detail" aria-live="polite" aria-atomic="true">
              <div className="pl-graph-copy"><p className="pl-eyebrow">{graphDomains[graphDomain].status}</p><h3>{graphDomains[graphDomain].title}</h3><p>{graphDomains[graphDomain].detail}</p><div className="pl-graph-boundary"><strong>Evidence and access boundary</strong><p>{graphDomains[graphDomain].boundary}</p></div></div>
              <div className="pl-graph-visual" aria-label={graphDomains[graphDomain].title + " conceptual relationship map"}><div className="pl-graph-hub">HSI<span>CONTEXT</span></div><div className="pl-graph-nodes">{graphDomains[graphDomain].nodes.map((node, index) => <span key={node} className={"pl-graph-node pl-graph-node-" + index}>{node}</span>)}</div><small>Conceptual model · not live patient or research data</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pl-section pl-intelligence-section" id="intelligence" aria-labelledby="intelligence-title">
        <div className="pl-wrap"><div className="pl-heading"><div><p className="pl-eyebrow">02 / EVIDENCE TO INTELLIGENCE</p><h2 id="intelligence-title">Investigate with AI.<br /><em>Decide with evidence.</em></h2></div><p>A supervised research lifecycle. Shared components can support investigations; agent-led discovery and automated ingestion are not presented as deployed capabilities.</p></div>
          <div className="pl-intelligence-steps" role="group" aria-label="Research intelligence stages">{intelligenceStages.map((stage, index) => <button key={stage.label} type="button" aria-pressed={intelligenceStage === index} onClick={() => setIntelligenceStage(index)}><span>{String(index + 1).padStart(2, "0")}</span>{stage.label}</button>)}</div>
          <div className="pl-intelligence-detail" aria-live="polite"><div><span>SELECTED STAGE / {String(intelligenceStage + 1).padStart(2, "0")}</span><h3>{intelligenceStages[intelligenceStage].label}</h3><p>{intelligenceStages[intelligenceStage].detail}</p></div><p>Agent outputs are proposals, not scientific approval. Rights checks, provenance and independent human review remain mandatory.</p></div>
        </div>
      </section>

      <section className="pl-section pl-tracks-section" id="research-tracks" aria-labelledby="tracks-title">
        <div className="pl-wrap"><div className="pl-heading"><div><p className="pl-eyebrow">03 / PARALLEL RESEARCH TRACKS</p><h2 id="tracks-title">Two disease questions.<br /><em>Independent review.</em></h2></div><p>Systemic sclerosis and rheumatoid arthritis follow separate evidence and scientific-review gates. One track cannot approve findings in the other.</p></div>
          <div className="pl-track-layout"><div className="pl-track-tabs" role="group" aria-label="Disease research track">{(Object.keys(researchTracks) as Array<keyof typeof researchTracks>).map(id => <button key={id} type="button" aria-pressed={researchTrack === id} onClick={() => setResearchTrack(id)}><span>{id.toUpperCase()}</span>{researchTracks[id].name}</button>)}</div><div className="pl-track-detail" aria-live="polite"><p className="pl-eyebrow">{researchTracks[researchTrack].state}</p><h3>{researchTracks[researchTrack].question}</h3><div className="pl-track-tags">{researchTracks[researchTrack].focus.map(term => <span key={term}>{term}</span>)}</div><p>{researchTracks[researchTrack].boundary}</p><div className="pl-track-gate">Separate source rights <b>→</b> Versioned evidence <b>→</b> Independent scientist review</div><Link className="pl-link" to="/for-isi">Explore immune research <Arrow /></Link></div></div>
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
