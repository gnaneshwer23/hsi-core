import { Link } from "react-router-dom";
import { useState } from "react";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";

const journey = [
  { title: "Personal health", short: "PERSON", eyebrow: "01 / PERSON", detail: "Symptoms, monitoring and personal observations contribute context when the individual chooses to share them.", product: "Aksh Health", href: "/for-aksh", status: "Scoped patient product; no automatic transfer to research", inputs: ["Symptoms", "Home monitoring", "Personal history"] },
  { title: "Clinical history", short: "CLINICAL", eyebrow: "02 / CLINICAL", detail: "Authorised encounters, diagnoses, medicines and laboratory trends can be interpreted together, with source and time preserved.", product: "HSI Clinical", href: "/products", status: "In development; no live hospital record access claimed", inputs: ["Encounters", "Medication changes", "Lab trends"] },
  { title: "Human biology", short: "BIOLOGY", eyebrow: "03 / BIOLOGY", detail: "Physiology connects organs, tissues, cells and molecular pathways to help explain the biological context of a question.", product: "HSI Platform", href: "/platform", status: "Evidence-grounded biological context; not patient-specific inference", inputs: ["Organs & tissues", "Cells", "Pathways"] },
  { title: "Immune mechanisms", short: "IMMUNE", eyebrow: "04 / IMMUNE", detail: "Investigate immune cell states, pathways, mechanisms and competing explanations for a disease or phenotype.", product: "ISI Research", href: "/for-isi", status: "Research experience; expert interpretation required", inputs: ["Immune cell states", "Mechanisms", "Biomarkers"] },
  { title: "Scientific evidence", short: "EVIDENCE", eyebrow: "05 / EVIDENCE", detail: "Trace publications, graded relationships, uncertainty and contradictions. Proposed hypotheses stay separate from reviewed findings.", product: "ISI Discovery", href: "/for-isi", status: "Existing graded research foundation; source quality varies", inputs: ["Provenance", "Confidence", "Contradictions"] },
  { title: "Research & trials", short: "TRIALS", eyebrow: "06 / TRANSLATION", detail: "Explore how scientific findings could inform research questions and, later, transparent trial pre-screening with clinician confirmation.", product: "HSI Trials", href: "/for-trials", status: "Trial intelligence planned; no eligibility confirmation", inputs: ["Study criteria", "Missing evidence", "Human review"] },
] as const;

const destinations = [
  { id: "isi", index: "01", title: "Immune Super Intelligence", kicker: "RESEARCH & DISCOVERY", description: "Explore immune mechanisms and scientific evidence.", href: "/for-isi" },
  { id: "clinical", index: "02", title: "HSI Clinical", kicker: "CLINICAL INTELLIGENCE", description: "Understand the direction for authorised longitudinal histories.", href: "/products" },
  { id: "aksh", index: "03", title: "Aksh Health", kicker: "PERSONALISED HEALTH", description: "Patient-centred metabolic health and monitoring.", href: "/for-aksh" },
  { id: "trials", index: "04", title: "HSI Trials", kicker: "CLINICAL RESEARCH", description: "Investigate transparent trial evidence workflows.", href: "/for-trials" },
] as const;

function ConnectionArt() {
  return (
    <svg className="hsi-editorial-art" viewBox="0 0 680 610" role="img" aria-label="Illustrative connected biology network linking health context, immune cells, evidence and research">
      <defs>
        <radialGradient id="hsi-halo"><stop stopColor="#2A8579" stopOpacity=".48"/><stop offset="1" stopColor="#17645F" stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="340" cy="302" r="288" fill="url(#hsi-halo)"/>
      {[110,172,235].map(r=><circle key={r} cx="340" cy="300" r={r} stroke="#F3EEE8" strokeOpacity=".17" strokeDasharray="3 12" fill="none"/>)}
      <g stroke="#F3EEE8" strokeOpacity=".35" strokeWidth="1.5">
        <path d="M140 158 340 300 515 134 575 355 340 300 177 465 140 158M177 465 485 492 575 355M515 134 485 492M140 158 575 355"/>
      </g>
      {[[140,158,16],[515,134,13],[575,355,17],[177,465,14],[485,492,12]].map(([x,y,r],i)=><g key={i}><circle cx={x} cy={y} r={r+11} fill="none" stroke="#F3EEE8" strokeOpacity=".2"/><circle cx={x} cy={y} r={r} fill={i===2?"#FF6845":"#F3EEE8"}/></g>)}
      <circle cx="340" cy="300" r="83" fill="#F3EEE8"/><circle cx="340" cy="300" r="65" stroke="#17645F" strokeOpacity=".3" fill="none"/>
      <path d="M301 303c21-53 53-53 78 0-24 54-56 54-78 0Zm39-58v116" stroke="#17645F" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="340" cy="300" r="7" fill="#FF6845"/>
      <g fill="#F3EEE8" fontFamily="system-ui" fontSize="12" letterSpacing="2"><text x="76" y="121">BIOLOGY</text><text x="490" y="94">EVIDENCE</text><text x="508" y="408">RESEARCH</text><text x="74" y="510">HEALTH</text></g>
    </svg>
  );
}

export function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const selected = journey[activeStep];
  return <div className="hsi-editorial">
    <section className="hsi-editorial-hero">
      <div className="hsi-editorial-wrap">
        <div className="hsi-editorial-topline"><span>HEALTH SUPER INTELLIGENCE</span><span>CONNECTED BY DESIGN <b>●</b> GROUNDED IN EVIDENCE</span></div>
        <div className="hsi-editorial-hero-grid">
          <div className="hsi-editorial-copy">
            <p className="hsi-editorial-kicker"><span className="hsi-coral-dot"/> FROM HEALTH CONTEXT TO SCIENTIFIC DISCOVERY</p>
            <h1>HEALTH.<br/><em>REIMAGINED.</em></h1>
            <p className="hsi-editorial-lede">Connecting human biology, scientific evidence and health intelligence — from discovery to the person, with context and human oversight.</p>
            <div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link><Link className="hsi-editorial-textlink" to="/products">Follow the connections <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="hsi-editorial-visual"><ConnectionArt/><div className="hsi-editorial-visual-note"><span>01 — 04 / CONNECTED INTELLIGENCE</span><span>Illustrative connections · not study findings or patient analysis</span></div></div>
        </div>
        <div className="hsi-editorial-bottomline"><span>EXPLORE <b>•</b> CONNECT <b>•</b> UNDERSTAND <b>•</b> DISCOVER</span><Link to="/how-it-works">SEE HOW IT WORKS ↗</Link></div>
      </div>
    </section>
    <section className="hsi-editorial-intro"><div className="hsi-editorial-wrap hsi-editorial-intro-grid"><p className="hsi-editorial-kicker">01 / THE IDEA</p><div><h2>Health is connected.<br/><em>Intelligence should be too.</em></h2><p>Health questions rarely fit inside a single dataset or discipline. HSI brings together evidence-grounded research tools and a connected vision for clinical, patient and trial intelligence — with distinct data permissions and review boundaries.</p></div></div></section>
    <section className="hsi-journey" id="connected-journey" aria-labelledby="hsi-journey-heading">
      <div className="hsi-editorial-wrap">
        <div className="hsi-journey-heading"><div><p className="hsi-editorial-kicker">02 / CONNECTED INTELLIGENCE</p><h2 id="hsi-journey-heading">ONE QUESTION.<br/><em>CONNECTED CONTEXT.</em></h2></div><p>Follow a health question across six connected perspectives. Select any stage to explore what it contributes and which HSI experience it belongs to.</p></div>
        <div className="hsi-journey-stage">
          <div className="hsi-journey-track" role="group" aria-label="Explore connected health intelligence stages">
            {journey.map((step,i)=><button key={step.short} type="button" className={"hsi-journey-node"+(activeStep===i?" is-active":"")} onClick={()=>setActiveStep(i)} aria-pressed={activeStep===i}>
              <span className="hsi-journey-node-index">0{i+1}</span><span className="hsi-journey-node-mark" aria-hidden="true">{i===0?"♡":i===1?"⌁":i===2?"◉":i===3?"✳":i===4?"◇":"⊕"}</span><span className="hsi-journey-node-label">{step.short}</span>
            </button>)}
          </div>
          <div className="hsi-journey-detail" aria-live="polite">
            <div className="hsi-journey-detail-copy"><p className="hsi-editorial-kicker">{selected.eyebrow}</p><h3>{selected.title}</h3><p>{selected.detail}</p><div className="hsi-journey-tags">{selected.inputs.map(input=><span key={input}>{input}</span>)}</div><Link to={selected.href} className="hsi-journey-link">Explore {selected.product} <span aria-hidden="true">↗</span></Link></div>
            <div className="hsi-journey-evidence"><span>CONNECTION STATUS</span><strong>{selected.product}</strong><p>{selected.status}</p><div className="hsi-journey-progress"><span style={{width:((activeStep+1)/journey.length*100)+"%"}}/></div><small>Stage {activeStep+1} of {journey.length} · Illustrative journey, not a patient analysis</small></div>
          </div>
        </div>
        <p className="hsi-journey-boundary">Research evidence and patient-identifiable clinical information remain in separately governed systems. Connections require appropriate authorisation, validated interfaces and human review.</p>
      </div>
    </section>
    <section className="hsi-editorial-products" id="ecosystem"><div className="hsi-editorial-wrap">
      <div className="hsi-editorial-sectionhead"><div><p className="hsi-editorial-kicker">03 / THE EXPERIENCES</p><h2>ONE FOUNDATION.<br/><em>FOUR EXPERIENCES.</em></h2></div><p>Enter through your role or question. Each experience has its own purpose, maturity and access boundaries.</p></div>
      <div className="hsi-editorial-product-grid">{destinations.map((item,i)=>{const product=ECOSYSTEM_PRODUCTS.find(p=>p.id===item.id);return <article className={"hsi-editorial-product hsi-editorial-product-"+item.id} key={item.id}>
        <div className="hsi-editorial-product-top"><span>{item.index} / {item.kicker}</span><span className="hsi-editorial-product-icon" aria-hidden="true">{i===0?"✳":i===1?"⌁":i===2?"♡":"⊕"}</span></div>
        <div className="hsi-editorial-product-body"><h3>{item.title}</h3><p>{item.description}</p></div>
        <div className="hsi-editorial-product-footer"><span>{product ? MATURITY_CHIP_LABEL[product.chip] : "Explore"}</span><Link to={item.href} aria-label={"Explore "+item.title}>Explore <span aria-hidden="true">↗</span></Link></div>
      </article>})}</div>
    </div></section>
    <section className="hsi-editorial-connection"><div className="hsi-editorial-wrap hsi-editorial-connection-grid"><div><p className="hsi-editorial-kicker">04 / THE FOUNDATION</p><h2>CONNECTIONS<br/><em>THAT CARRY MEANING.</em></h2><p>From immune pathways and published findings to permitted clinical context, every relationship needs its source, its uncertainty and its purpose. Research hypotheses remain separate from reviewed evidence.</p><Link className="hsi-editorial-button" to="/platform">Understand the platform <span aria-hidden="true">↗</span></Link></div><div className="hsi-editorial-connection-map"><div className="hsi-editorial-map-core">EVIDENCE<br/>+ CONTEXT</div><span>HUMAN BIOLOGY</span><span>IMMUNE SCIENCE</span><span>LONGITUDINAL HEALTH</span><span>CLINICAL RESEARCH</span></div></div></section>
    <section className="hsi-editorial-outro"><div className="hsi-editorial-wrap"><p className="hsi-editorial-kicker">05 / DISCOVER MORE</p><h2>FROM QUESTIONS<br/><em>TO UNDERSTANDING.</em></h2><p>Explore our research direction and the distinct journeys designed for researchers, care teams and individuals.</p><div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/for-isi">Explore ISI Research <span aria-hidden="true">↗</span></Link><Link className="hsi-editorial-textlink" to="/how-it-works">How it works ↗</Link></div><small>Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to validation.</small></div></section>
  </div>;
}
