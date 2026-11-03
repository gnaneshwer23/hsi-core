import { useState } from "react";
import { Link } from "react-router-dom";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL, type EcosystemProduct } from "../lib/productMaturity";
import "../styles/products.css";

type ProductId = EcosystemProduct["id"];
const order: ProductId[] = ["aksh", "isi", "clinical", "trials"];
const descriptions: Record<ProductId, { category: string; audience: string; description: string; features: string[]; boundary: string; cta: string }> = {
  aksh: {
    category: "PERSONAL HEALTH & CARE", audience: "People managing their health and the teams supporting them",
    description: "Bring health trends and everyday context into a clearer picture, with care workflows organised around the person.",
    features: ["Health information in context", "Diabetes and metabolic health focus", "Clinician collaboration within scope"],
    boundary: "Care records and clinical decisions remain within Aksh.", cta: "Explore Aksh Health",
  },
  isi: {
    category: "BIOLOGICAL RESEARCH", audience: "Researchers and translational teams",
    description: "Explore immune mechanisms, knowledge relationships and scientific evidence while keeping research context and uncertainty visible.",
    features: ["Immune biology and knowledge exploration", "Evidence context and provenance", "Research investigations and human review"],
    boundary: "For research exploration; not clinical decision support.", cta: "Explore ISI Research",
  },
  clinical: {
    category: "LONGITUDINAL CLINICAL CONTEXT", audience: "Authorised care teams",
    description: "An experience in development for reviewing health information over time, with attention to provenance and professional oversight.",
    features: ["Longitudinal review concept", "Record provenance and information gaps", "Professional oversight by design"],
    boundary: "In development. No live hospital connection or bedside decision support is offered here.", cta: "Understand the foundation",
  },
  trials: {
    category: "CLINICAL RESEARCH", audience: "Study teams and research investigators",
    description: "A planned experience for exploring clinical studies and making screening criteria and missing information easier to understand.",
    features: ["Study discovery concept", "Transparent criteria and missing information", "Investigator-led assessment"],
    boundary: "Planned. No live matching, confirmed eligibility or automatic enrolment.", cta: "Explore the trials concept",
  },
};
const journeys: { id: ProductId; label: string; heading: string; text: string }[] = [
  { id: "aksh", label: "Personal health", heading: "Start with the person.", text: "Aksh Health is the starting point for health information and scoped care workflows, with a focus on diabetes and metabolic health." },
  { id: "isi", label: "Research", heading: "Start with a research question.", text: "ISI Research is the specialist experience for investigating immune biology, knowledge relationships and the evidence behind a question." },
  { id: "clinical", label: "Care teams", heading: "Understand the clinical direction.", text: "HSI Clinical is in development. Explore the shared foundation and the intended approach to longitudinal review before considering a clinical deployment." },
  { id: "trials", label: "Trial research", heading: "Understand the trials direction.", text: "HSI Trials is planned. Explore the concept of transparent study discovery and investigator-led screening; live matching is not available." },
];

function Arrow() {
  return <svg className="prd-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function ProductArt({ id }: { id: ProductId }) {
  return <svg viewBox="0 0 400 190" fill="none" aria-hidden="true">
    <circle cx="200" cy="95" r="80" stroke="currentColor" opacity=".13" />
    <circle cx="200" cy="95" r="56" stroke="currentColor" opacity=".13" strokeDasharray="2 7" />
    {id === "aksh" ? <><circle cx="200" cy="63" r="24" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeOpacity=".5" /><path d="M146 161v-16a54 54 0 0 1 108 0v16" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".5" /><path d="M100 80h35m130 39h35" stroke="currentColor" strokeOpacity=".5" /><circle cx="287" cy="58" r="13" fill="#ff6845" /></> : null}
    {id === "isi" ? <><path d="m107 66 93 29 87-49-22 98-65-49-83 54-10-83m10 83 148-5" stroke="currentColor" strokeOpacity=".45" />{[[107,66,12],[200,95,25],[287,46,10],[265,144,15],[117,149,10]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={i===1 ? "#ff6845" : "currentColor"} fillOpacity={i===1 ? 1 : .4} />)}</> : null}
    {id === "clinical" ? <><path d="M80 95h48l18-25 24 52 25-76 24 68 19-30 20 11h62" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M80 140h240M80 50h240" stroke="currentColor" strokeOpacity=".2" strokeDasharray="3 7" /><circle cx="195" cy="46" r="7" fill="#ff6845" /></> : null}
    {id === "trials" ? <><path d="M130 50h136M130 95h136M130 140h136" stroke="currentColor" strokeOpacity=".45" /><rect x="105" y="32" width="30" height="30" rx="6" stroke="currentColor" /><rect x="105" y="77" width="30" height="30" rx="6" stroke="currentColor" /><rect x="105" y="122" width="30" height="30" rx="6" stroke="currentColor" /><path d="m113 47 5 5 10-12m-15 52 5 5 10-12" stroke="currentColor" strokeWidth="2" /><circle cx="281" cy="140" r="9" fill="#ff6845" /></> : null}
  </svg>;
}

export function Products() {
  const [selected, setSelected] = useState<ProductId>("isi");
  const journey = journeys.find(j => j.id === selected)!;
  const selectedProduct = ECOSYSTEM_PRODUCTS.find(p => p.id === selected)!;

  return <div className="prd-page">
    <section className="prd-hero" aria-labelledby="products-title"><div className="prd-wrap"><p className="prd-eyebrow"><span /> THE HSI ECOSYSTEM</p><div className="prd-hero-grid"><h1 id="products-title">Different questions.<br /><em>A connected foundation.</em></h1><div><p className="prd-lede">From personal health to biological research, find the experience that fits your question. Each product has its own purpose, data and access controls.</p><a className="prd-button" href="#product-collection">Explore the products <Arrow /></a></div></div><div className="prd-hero-foot"><span>AKSH HEALTH <b>→</b> IMMUNE SUPER INTELLIGENCE <b>→</b> HSI</span><Link to="/platform">Meet the shared technology <Arrow /></Link></div></div></section>

    <section className="prd-section prd-finder" aria-labelledby="finder-title"><div className="prd-wrap"><div className="prd-heading"><div><p className="prd-eyebrow">FIND YOUR STARTING POINT</p><h2 id="finder-title">What brings you here?</h2></div><p>Choose an area to understand the relevant product and its current scope.</p></div><div className="prd-journey-selector" role="group" aria-label="Your area of interest">{journeys.map(j=><button type="button" key={j.id} aria-pressed={selected===j.id} aria-controls="product-guidance" onClick={()=>setSelected(j.id)}>{j.label}<Arrow /></button>)}</div><div className="prd-guidance" id="product-guidance" aria-live="polite" aria-atomic="true"><div><span className={`prd-status prd-status-${selectedProduct.chip}`}>{MATURITY_CHIP_LABEL[selectedProduct.chip]}</span><h3>{journey.heading}</h3><p>{journey.text}</p></div><Link to={selectedProduct.primaryCta.href} className="prd-link">{descriptions[selected].cta}<Arrow /></Link></div></div></section>

    <section className="prd-section prd-collection" id="product-collection" aria-labelledby="collection-title"><div className="prd-wrap"><div className="prd-heading"><div><p className="prd-eyebrow">THE PRODUCT COLLECTION</p><h2 id="collection-title">Distinct roles.<br /><em>A shared direction.</em></h2></div><p>Availability is shown for each product. Product overview pages explain the experience; they do not grant access to private workspaces.</p></div><div className="prd-grid">{order.map((id,index)=>{
      const product=ECOSYSTEM_PRODUCTS.find(p=>p.id===id)!;
      const detail=descriptions[id];
      return <article key={id} className={`prd-card prd-card-${id}`} aria-labelledby={`product-${id}-title`}><div className="prd-card-visual"><span className="prd-visual-number">0{index+1}</span><ProductArt id={id}/><span className="prd-visual-label">{detail.category}</span></div><div className="prd-card-body"><div className="prd-card-title"><h3 id={`product-${id}-title`}>{product.name}</h3><span className={`prd-status prd-status-${product.chip}`}>{MATURITY_CHIP_LABEL[product.chip]}</span></div><p className="prd-audience">{detail.audience}</p><p className="prd-description">{detail.description}</p><ul>{detail.features.map(feature=><li key={feature}>{feature}</li>)}</ul><p className="prd-scope">{product.chipDetail}</p><p className="prd-boundary">{detail.boundary}</p><Link className="prd-card-link" to={product.primaryCta.href}>{detail.cta}<Arrow /></Link></div></article>;
    })}</div></div></section>

    <section className="prd-section prd-foundation" aria-labelledby="shared-title"><div className="prd-wrap prd-foundation-grid"><div><p className="prd-eyebrow">WHAT CONNECTS THE EXPERIENCES</p><h2 id="shared-title">Shared technology.<br /><em>Product-owned data.</em></h2><p>HSI is the technology foundation, rather than another patient application. Aksh and ISI retain their own interfaces and databases while using shared tools for knowledge, evidence and review.</p><Link className="prd-link" to="/platform">Explore the platform <Arrow /></Link></div><div className="prd-foundation-points"><article><span>01</span><div><h3>A foundation for investigations</h3><p>Evidence retrieval, knowledge relationships and structured human review.</p></div></article><article><span>02</span><div><h3>Clear ownership and permissions</h3><p>Each product controls its data and access. Sharing code does not create a shared patient database.</p></div></article><article><span>03</span><div><h3>Scope you can understand</h3><p>Available experiences, development work and planned concepts remain clearly distinguished.</p></div></article></div></div></section>

    <section className="prd-section prd-closing"><div className="prd-wrap"><p className="prd-eyebrow">UNDERSTAND THE APPROACH</p><h2>See how the pieces<br /><em>work together.</em></h2><p>Follow the path from a question to context, evidence and human review.</p><div className="prd-actions"><Link className="prd-button" to="/how-it-works">See how it works <Arrow /></Link><Link className="prd-link" to="/platform">Explore the technology <Arrow /></Link></div></div></section>
  </div>;
}
