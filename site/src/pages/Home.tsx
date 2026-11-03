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
  const nodes = [
    {x:145,y:180,label:"HEALTH CONTEXT",n:0},{x:490,y:122,label:"CLINICAL",n:1},
    {x:370,y:270,label:"BIOLOGY",n:2},{x:555,y:390,label:"IMMUNE",n:3},
    {x:180,y:450,label:"EVIDENCE",n:4},{x:420,y:510,label:"RESEARCH",n:5},
  ];
  return <svg className="hsi-editorial-art hsi-new-art" viewBox="0 0 680 610" role="img" aria-label="Illustrative layered scientific network connecting health context, clinical records, biology, immune pathways, evidence and research">
    <defs><radialGradient id="hsi-glow"><stop stopColor="#56A39B" stopOpacity=".42"/><stop offset="1" stopColor="#17645F" stopOpacity="0"/></radialGradient><linearGradient id="hsi-path" x1="0" x2="1"><stop stopColor="#F3EEE8" stopOpacity=".15"/><stop offset=".6" stopColor="#FFB6A1"/><stop offset="1" stopColor="#F3EEE8" stopOpacity=".25"/></linearGradient></defs>
    <circle cx="340" cy="305" r="288" fill="url(#hsi-glow)"/>
    {[118,192,262].map(r=><circle key={r} cx="340" cy="305" r={r} fill="none" stroke="#F3EEE8" strokeOpacity=".18" strokeDasharray="2 10"/>)}
    <g fill="none" stroke="url(#hsi-path)" strokeWidth="1.5"><path d="M145 180 490 122 370 270 555 390 420 510 180 450 145 180M145 180 370 270 180 450M490 122 555 390M370 270 420 510"/></g>
    <g transform="translate(340 305)"><circle r="79" fill="#F3EEE8" fillOpacity=".10" stroke="#F3EEE8" strokeOpacity=".4"/><circle r="57" fill="#F3EEE8" fillOpacity=".94"/><path d="M-34 0C-15-45 14-45 34 0 15 45-14 45-34 0ZM0-42V42" stroke="#17645F" strokeWidth="3" fill="none"/><circle r="6" fill="#FF6845"/></g>
    {nodes.map(({x,y,label,n})=><g key={label}><circle cx={x} cy={y} r="29" fill="#17645F" stroke="#F3EEE8" strokeOpacity=".65"/><circle cx={x} cy={y} r="16" fill={n===3?"#FF6845":"#F3EEE8"}/><circle cx={x} cy={y} r="5" fill="#17645F"/><text x={x} y={y+48} fill="#F3EEE8" fontSize="10" textAnchor="middle" letterSpacing="1.4">{label}</text></g>)}
  </svg>;
}

export function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeLayer, setActiveLayer] = useState(2);
  const selected = journey[activeStep];
  return <div className="hsi-editorial">
    <section className="hsi-editorial-hero">
      <div className="hsi-editorial-wrap">
        <div className="hsi-editorial-topline"><span>HEALTH SUPER INTELLIGENCE</span><span>CONNECTED BY DESIGN <b>●</b> GROUNDED IN EVIDENCE</span></div>
        <div className="hsi-editorial-hero-grid">
          <div className="hsi-editorial-copy">
            <p className="hsi-editorial-kicker"><span className="hsi-coral-dot"/> FROM HEALTH CONTEXT TO SCIENTIFIC DISCOVERY</p>
            <h1>BIOLOGY IS<br/><em>CONNECTED.</em></h1>
            <p className="hsi-editorial-lede">Intelligence should be too. A governed ecosystem connecting human health, biology, immune mechanisms and scientific discovery — with evidence at every step.</p>
            <div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link><a className="hsi-editorial-textlink" href="#connected-journey">Follow the connections <span aria-hidden="true">↗</span></a></div>
          </div>
          <div className="hsi-editorial-visual"><ConnectionArt/><div className="hsi-editorial-visual-note"><span>SIX PERSPECTIVES / ONE ECOSYSTEM</span><span>Illustrative connections · not study findings or patient analysis</span></div></div>
        </div>
        <div className="hsi-editorial-bottomline"><span>EXPLORE <b>•</b> CONNECT <b>•</b> UNDERSTAND <b>•</b> DISCOVER</span><Link to="/how-it-works">SEE HOW IT WORKS ↗</Link></div>
      </div>
    </section>
    <section className="hsi-editorial-intro"><div className="hsi-editorial-wrap hsi-editorial-intro-grid"><p className="hsi-editorial-kicker">01 / THE IDEA</p><div><h2>Beyond disconnected data.<br/><em>Towards connected understanding.</em></h2><p>Health questions rarely fit inside a single dataset or discipline. HSI brings together evidence-grounded research tools and a connected vision for clinical, patient and trial intelligence — with distinct data permissions and review boundaries.</p></div></div></section>
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
    <section className="hsi-rebuild-stack" id="intelligence-foundation" aria-labelledby="hsi-stack-heading">
      <div className="hsi-editorial-wrap">
        <div className="hsi-rebuild-heading"><div><p className="hsi-editorial-kicker">03 / INTELLIGENCE ARCHITECTURE</p><h2 id="hsi-stack-heading">NOT ANOTHER<br/><em>DATA SILO.</em></h2></div><p>HSI is a logical intelligence layer across separately governed systems — not a single database containing everyone's records.</p></div>
        <div className="hsi-rebuild-stack-layout">
          <div className="hsi-rebuild-stack-steps" role="group" aria-label="Explore the HSI intelligence architecture">
            {[
              ["01","DATA & CONTEXT","Permissioned clinical context, patient-generated observations and scientific sources"],
              ["02","BIOLOGICAL KNOWLEDGE","Organs, tissues, cells, immune mechanisms and molecular relationships"],
              ["03","EVIDENCE & PROVENANCE","Source-linked findings, uncertainty, contradictions and reviewed knowledge"],
              ["04","GOVERNED INTELLIGENCE","Research agents propose, accountable humans review, and hypotheses stay separate"],
              ["05","PURPOSE-BUILT EXPERIENCES","Aksh Health, HSI Clinical, ISI Research and HSI Trials"],
            ].map(([number,title,description],i)=><button key={number} type="button" className={"hsi-rebuild-layer"+(activeLayer===i?" is-active":"")} onClick={()=>setActiveLayer(i)} aria-pressed={activeLayer===i}><span>{number}</span><strong>{title}</strong><small>{description}</small><span aria-hidden="true">↗</span></button>)}
          </div>
          <div className="hsi-rebuild-stack-display">
            <p className="hsi-editorial-kicker">CONNECTED INTELLIGENCE / LAYER 0{activeLayer+1}</p>
            <div className="hsi-rebuild-orbit" aria-hidden="true"><span className="hsi-rebuild-orbit-a"/><span className="hsi-rebuild-orbit-b"/><span className="hsi-rebuild-orbit-c"/><b>{["DATA","BIOLOGY","EVIDENCE","REVIEW","EXPERIENCE"][activeLayer]}</b></div>
            <h3>{["Context, with permission.","A map of human biology.","Evidence you can trace.","Agents with accountable review.","One ecosystem, distinct products."][activeLayer]}</h3>
            <p>{["Clinical and patient data are accessed only through authorised interfaces. Public biomedical sources remain separately governed.","Relationships connect physiological systems and immune science without automatically claiming causality.","Every meaningful claim needs a source, review state and uncertainty. Proposed hypotheses do not become approved facts by default.","Agents can retrieve and analyse; scientists and clinicians retain approval and responsibility.","Each product has its own data ownership, validation requirements and user journey."][activeLayer]}</p>
            <Link to="/platform" className="hsi-rebuild-inline-link">Explore the platform architecture ↗</Link>
          </div>
        </div>
      </div>
    </section>
    <section className="hsi-rebuild-story">
      <div className="hsi-editorial-wrap hsi-rebuild-story-grid">
        <div><p className="hsi-editorial-kicker">04 / RESEARCH IN PRACTICE</p><h2>FROM A QUESTION<br/><em>TO TESTABLE INSIGHT.</em></h2><p>Start with an immune mechanism. Follow the evidence. Surface uncertainty and contradictions. Let researchers decide what deserves further investigation.</p><Link className="hsi-editorial-button" to="/for-isi">Enter ISI Research <span aria-hidden="true">↗</span></Link></div>
        <div className="hsi-rebuild-research-visual" aria-label="Illustrative research process, not an actual patient or study result">
          <div className="hsi-rebuild-visual-top"><span>ISI / RESEARCH PROCESS</span><span>ILLUSTRATIVE</span></div>
          <div className="hsi-rebuild-research-node"><span>01</span><strong>Investigate a mechanism</strong><small>Cell states · pathways · disease context</small></div>
          <div className="hsi-rebuild-research-line"/>
          <div className="hsi-rebuild-research-node"><span>02</span><strong>Examine the evidence</strong><small>Sources · provenance · uncertainty</small></div>
          <div className="hsi-rebuild-research-line"/>
          <div className="hsi-rebuild-research-node"><span>03</span><strong>Review a hypothesis</strong><small>Researcher-supervised · not a clinical conclusion</small></div>
          <p>Research workflow illustration. No patient data or fabricated scientific findings.</p>
        </div>
      </div>
    </section>
    <section className="hsi-editorial-products" id="ecosystem"><div className="hsi-editorial-wrap">
      <div className="hsi-editorial-sectionhead"><div><p className="hsi-editorial-kicker">05 / FOUR CONNECTED EXPERIENCES</p><h2>FIND YOUR<br/><em>WAY IN.</em></h2></div><p>Different people, different needs. One connected vision, with explicit boundaries between research and care.</p></div>
      <div className="hsi-editorial-product-grid">{destinations.map((item,i)=>{const product=ECOSYSTEM_PRODUCTS.find(p=>p.id===item.id);return <article className={"hsi-editorial-product hsi-editorial-product-"+item.id} key={item.id}>
        <div className="hsi-editorial-product-top"><span>{item.index} / {item.kicker}</span><span className="hsi-editorial-product-icon" aria-hidden="true">{i===0?"✳":i===1?"⌁":i===2?"♡":"⊕"}</span></div>
        <div className="hsi-editorial-product-body"><h3>{item.title}</h3><p>{item.description}</p></div>
        <div className="hsi-editorial-product-footer"><span>{product ? MATURITY_CHIP_LABEL[product.chip] : "Explore"}</span><Link to={item.href} aria-label={"Explore "+item.title}>Explore <span aria-hidden="true">↗</span></Link></div>
      </article>})}</div>
    </div></section>
    <section className="hsi-editorial-outro"><div className="hsi-editorial-wrap"><p className="hsi-editorial-kicker">06 / DISCOVER MORE</p><h2>FROM QUESTIONS<br/><em>TO UNDERSTANDING.</em></h2><p>Explore our research direction and the distinct journeys designed for researchers, care teams and individuals.</p><div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/for-isi">Explore ISI Research <span aria-hidden="true">↗</span></Link><Link className="hsi-editorial-textlink" to="/how-it-works">How it works ↗</Link></div><small>Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to validation.</small></div></section>
  </div>;
}
