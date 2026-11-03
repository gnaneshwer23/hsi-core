import { Link } from "react-router-dom";
import { useRef, useState } from "react";
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

const landscapeDomains = [
  {title:"PERSON & LONGITUDINAL HEALTH",short:"HEALTH",x:10,y:43,description:"Symptoms, observations and longitudinal patient context, shared only with appropriate permission.",href:"/for-aksh",status:"Aksh Health · scoped"},
  {title:"CLINICAL CONTEXT",short:"CLINICAL",x:23,y:28,description:"Encounters, laboratory results, medication history and outcomes from authorised clinical sources.",href:"/products",status:"HSI Clinical · in development"},
  {title:"ORGANS & PHYSIOLOGY",short:"BIOLOGY",x:35,y:51,description:"Organ systems, tissues, cells and physiology connect health questions to biological mechanisms.",href:"/platform",status:"Biology context · research foundation"},
  {title:"IMMUNE SYSTEM",short:"IMMUNITY",x:47,y:29,description:"Immune cell states, signalling pathways and mechanisms interpreted with evidence and uncertainty.",href:"/for-isi",status:"ISI Research · available"},
  {title:"GUT MICROBIOME & METABOLISM",short:"MICROBIOME",x:59,y:53,description:"Microbial functions, metabolites and host pathways; associations are not assumed causal.",href:"/platform",status:"Cross-domain knowledge · developing"},
  {title:"GENOMICS & MULTI-OMICS",short:"OMICS",x:71,y:31,description:"Genomic, proteomic and multi-omics context can inform biological research when validated.",href:"/platform",status:"Omics context · research direction"},
  {title:"SCIENTIFIC EVIDENCE",short:"EVIDENCE",x:82,y:46,description:"Publications, experiments, provenance, graded findings, contradictions and hypotheses.",href:"/for-isi",status:"ISI evidence foundation · available"},
  {title:"RESEARCH & CLINICAL TRIALS",short:"TRIALS",x:92,y:37,description:"Trial criteria and missing evidence can support future investigator-led pre-screening.",href:"/for-trials",status:"HSI Trials · planned"},
] as const;

function LandscapeArt() {
  const z = (x:number, depth:number) => {
    const hill=(c:number,w:number,h:number)=>Math.exp(-Math.pow((x-c)/w,2))*h;
    return 305+depth*6.1-hill(310,135,95)*(1-depth*.012)-hill(720,115,112)*(1-depth*.012)-hill(1120,115,78)*(1-depth*.012)-hill(1510,95,64)*(1-depth*.012)+hill(520,105,44);
  };
  const rows=Array.from({length:35},(_,i)=>Array.from({length:101},(_,j)=>{const x=j*17;return `${j?"L":"M"}${x.toFixed(1)} ${z(x,i-15).toFixed(1)}`}).join(" "));
  const columns=Array.from({length:88},(_,i)=>Array.from({length:35},(_,j)=>{const x=i*19.4;return `${j?"L":"M"}${x.toFixed(1)} ${z(x,j-15).toFixed(1)}`}).join(" "));
  return <svg className="hsi-panorama-mesh" viewBox="0 0 1700 510" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Illustrative three-dimensional fine-line scientific landscape linking eight domains of health and biomedical research">
    <defs><linearGradient id="hsi-mesh-teal" x1="0" y1="0" x2="1" y2=".3"><stop stopColor="#17645F" stopOpacity=".23"/><stop offset=".45" stopColor="#247C76" stopOpacity=".67"/><stop offset="1" stopColor="#17645F" stopOpacity=".3"/></linearGradient><radialGradient id="hsi-mesh-wash"><stop stopColor="#B9DED4" stopOpacity=".45"/><stop offset="1" stopColor="#F3EEE8" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="810" cy="270" rx="800" ry="230" fill="url(#hsi-mesh-wash)"/>
    <g fill="none" stroke="url(#hsi-mesh-teal)" strokeWidth=".85">{rows.map((d,i)=><path key={"r"+i} d={d}/>)}{columns.map((d,i)=><path key={"c"+i} d={d}/>)}</g>
    <path d="M40 260 C300 360 370 110 580 290 S930 155 1130 275 S1460 145 1660 280" fill="none" stroke="#FF6845" strokeWidth="1.2" strokeDasharray="2 9" opacity=".7"/>
  </svg>;
}

function ConnectedUnderstandingArt() {
  return <svg className="hsi-idea-art" viewBox="0 0 660 560" role="img" aria-label="Illustrative connection between a person, clinical information, biological pathways and scientific evidence, linked by a shared knowledge network">
    <defs>
      <radialGradient id="idea-glow"><stop stopColor="#C4E5DB" stopOpacity=".8"/><stop offset="1" stopColor="#F3EEE8" stopOpacity="0"/></radialGradient>
      <linearGradient id="idea-ink" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#17645F"/><stop offset="1" stopColor="#72B9AB"/></linearGradient>
    </defs>
    <ellipse cx="325" cy="280" rx="310" ry="250" fill="url(#idea-glow)"/>
    {[100,155,213].map(r=><circle key={r} cx="327" cy="270" r={r} fill="none" stroke="#17645F" strokeOpacity=".15" strokeDasharray="3 9"/>)}
    <g fill="none" stroke="#17645F" strokeOpacity=".25" strokeWidth="1.3">
      <path d="M125 150 330 105 520 158 550 370 330 455 110 360Z"/>
      <path d="M125 150 330 270 520 158M110 360 330 270 550 370M330 105 330 270 330 455"/>
      <path d="M125 150 550 370M520 158 110 360" strokeDasharray="4 8"/>
    </g>
    <g transform="translate(327 270)">
      <circle r="96" fill="#17645F"/>
      <circle r="79" fill="none" stroke="#F3EEE8" strokeOpacity=".38" strokeDasharray="3 7"/>
      <path d="M-42 -10 C-32-55 16-63 38-20 C59 25 19 62-15 45 C-50 29-58 14-42-10Z" fill="none" stroke="#F3EEE8" strokeWidth="2.2"/>
      <path d="M-43 -9 4-25 38-20 14 28-15 45-43-9M4-25 14 28" fill="none" stroke="#F3EEE8" strokeOpacity=".6"/>
      {[[-43,-9],[4,-25],[38,-20],[14,28],[-15,45]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill={i===1?"#FF6845":"#F3EEE8"}/>)}
    </g>
    {[
      {x:125,y:150,title:"PERSON",subtitle:"Context",icon:"♡"},
      {x:330,y:105,title:"CLINICAL",subtitle:"History",icon:"+"},
      {x:520,y:158,title:"BIOLOGY",subtitle:"Mechanisms",icon:"✳"},
      {x:550,y:370,title:"EVIDENCE",subtitle:"Provenance",icon:"◇"},
      {x:330,y:455,title:"RESEARCH",subtitle:"Discovery",icon:"↗"},
      {x:110,y:360,title:"REVIEW",subtitle:"Governance",icon:"✓"},
    ].map(({x,y,title,subtitle,icon})=><g key={title}>
      <circle cx={x} cy={y} r="39" fill="#FFFAF4" stroke="#17645F" strokeOpacity=".45"/>
      <circle cx={x} cy={y} r="29" fill="#F3EEE8" stroke="#17645F" strokeOpacity=".3"/>
      <text x={x} y={y+7} textAnchor="middle" fontSize="25" fill="#17645F">{icon}</text>
      <text x={x} y={y+60} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#17645F">{title}</text>
      <text x={x} y={y+75} textAnchor="middle" fontSize="10" fill="#466D67">{subtitle}</text>
    </g>)}
    <g fill="#FF6845"><circle cx="228" cy="187" r="5"/><circle cx="432" cy="210" r="5"/><circle cx="436" cy="401" r="5"/></g>
  </svg>;
}

export function Home() {
  const domainStripRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [activeLayer, setActiveLayer] = useState(2);
  const [activeHeroNode, setActiveHeroNode] = useState<number|null>(null);
  const selected = journey[activeStep];
  return <div className="hsi-editorial">
    <section className="hsi-panorama" aria-labelledby="hsi-panorama-title">
      <div className="hsi-editorial-wrap hsi-panorama-heading">
        <p className="hsi-editorial-kicker"><span className="hsi-coral-dot"/> HEALTH SUPER INTELLIGENCE / ONE CONNECTED ECOSYSTEM</p>
        <h1 id="hsi-panorama-title">A connected intelligence ecosystem <em>for health and discovery.</em></h1>
        <p>Built around traceable evidence. Guided by human judgement.</p>
      </div>
      <div className="hsi-panorama-stage">
        <LandscapeArt/>
        <div className="hsi-panorama-points">
          {landscapeDomains.map((domain,i)=><button key={domain.short} type="button" className={"hsi-panorama-point"+(activeHeroNode===i?" is-active":"")} style={{left:domain.x+"%",top:domain.y+"%"}} onClick={()=>setActiveHeroNode(activeHeroNode===i?null:i)} aria-pressed={activeHeroNode===i} aria-label={"Explore "+domain.title}>
            <span className="hsi-panorama-point-label">{domain.title}</span><span className="hsi-panorama-point-stem"/><span className="hsi-panorama-point-marker"/>
          </button>)}
        </div>
        {activeHeroNode!==null&&<div className="hsi-panorama-panel" aria-live="polite"><button type="button" className="hsi-panorama-close" aria-label="Close domain details" onClick={()=>setActiveHeroNode(null)}>×</button><span className="hsi-editorial-kicker">CONNECTED DOMAIN / 0{activeHeroNode+1}</span><h2>{landscapeDomains[activeHeroNode].title}</h2><p>{landscapeDomains[activeHeroNode].description}</p><small>{landscapeDomains[activeHeroNode].status}</small><Link to={landscapeDomains[activeHeroNode].href}>Explore this domain ↗</Link></div>}
      </div>
      <div className="hsi-editorial-wrap hsi-panorama-caption"><span>FROM HEALTH CONTEXT TO BIOLOGICAL UNDERSTANDING</span><span>Illustrative connections · not study findings or patient analysis · SELECT A MARKER TO EXPLORE</span></div>
      <div className="hsi-editorial-wrap hsi-domain-carousel" aria-label="Eight connected health intelligence domains">
        <div className="hsi-domain-carousel-head"><span>EXPLORE THE EIGHT CONNECTED DOMAINS</span><div><button type="button" aria-label="Scroll domains left" onClick={()=>domainStripRef.current?.scrollBy({left:-440,behavior:"smooth"})}>←</button><button type="button" aria-label="Scroll domains right" onClick={()=>domainStripRef.current?.scrollBy({left:440,behavior:"smooth"})}>→</button></div></div>
        <div className="hsi-panorama-domain-strip" ref={domainStripRef} role="group" aria-label="Scrollable domain sequence">{landscapeDomains.map((domain,i)=><button type="button" key={domain.short} className={activeHeroNode===i?"is-active":""} onClick={()=>{setActiveHeroNode(i);document.getElementById("hsi-panorama-title")?.scrollIntoView({behavior:"smooth",block:"start"});}}><span className="hsi-panorama-domain-number">{String(i+1).padStart(2,"0")}</span><strong>{domain.short}</strong><span aria-hidden="true">↗</span></button>)}</div>
        <p className="hsi-domain-carousel-hint">Scroll horizontally or use the arrows to explore all eight domains. Select a domain to see its connection.</p>
      </div>
      <div className="hsi-editorial-wrap hsi-panorama-actions"><Link className="hsi-editorial-button" to="/platform">Explore the platform ↗</Link><a className="hsi-editorial-textlink" href="#connected-journey">Follow the connections ↗</a></div>
    </section>
    <section className="hsi-editorial-intro"><div className="hsi-editorial-wrap hsi-idea-grid"><div className="hsi-idea-copy"><p className="hsi-editorial-kicker">01 / THE IDEA</p><h2>Beyond disconnected data.<br/><em>Towards connected understanding.</em></h2><p>Health questions rarely fit inside a single dataset or discipline. HSI brings together evidence-grounded research tools and a connected vision for clinical, patient and trial intelligence — with distinct data permissions and review boundaries.</p><Link className="hsi-editorial-textlink" to="/platform">Discover how the connections work ↗</Link></div><figure className="hsi-idea-figure"><ConnectedUnderstandingArt/><figcaption>Illustrative connection map · not a patient record or scientific result</figcaption></figure></div></section>
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
