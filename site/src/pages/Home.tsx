import { Link } from "react-router-dom";
import { ECOSYSTEM_PRODUCTS, MATURITY_CHIP_LABEL } from "../lib/productMaturity";
import "../styles/hsi-editorial.css";

const destinations = [
  { id: "isi", index: "01", title: "Immune Super Intelligence", kicker: "RESEARCH & DISCOVERY", description: "Investigate immune cells, pathways, disease mechanisms and the evidence behind them.", href: "/for-isi" },
  { id: "clinical", index: "02", title: "HSI Clinical", kicker: "LONGITUDINAL INTELLIGENCE", description: "A developing approach to understanding authorised clinical histories, trends and gaps.", href: "/products" },
  { id: "aksh", index: "03", title: "Aksh Health", kicker: "PERSONALISED HEALTH", description: "Explore a person-centred approach to metabolic health, monitoring and care.", href: "/for-aksh" },
  { id: "trials", index: "04", title: "HSI Trials", kicker: "CLINICAL RESEARCH", description: "A planned pathway from study evidence to transparent, investigator-led screening.", href: "/for-trials" },
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
  return <div className="hsi-editorial">
    <section className="hsi-editorial-hero">
      <div className="hsi-editorial-wrap">
        <div className="hsi-editorial-topline"><span>HEALTH SUPER INTELLIGENCE</span><span>CONNECTED BY DESIGN <b>●</b> GROUNDED IN EVIDENCE</span></div>
        <div className="hsi-editorial-hero-grid">
          <div className="hsi-editorial-copy">
            <p className="hsi-editorial-kicker"><span className="hsi-coral-dot"/> ONE ECOSYSTEM · FOUR CONNECTED PRODUCTS</p>
            <h1>HEALTH.<br/><em>REIMAGINED.</em></h1>
            <p className="hsi-editorial-lede">Connecting human biology, scientific evidence and health intelligence — from discovery to the person, with context and human oversight.</p>
            <div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link><Link className="hsi-editorial-textlink" to="/products">Meet the ecosystem <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div className="hsi-editorial-visual"><ConnectionArt/><div className="hsi-editorial-visual-note"><span>01 — 04 / CONNECTED INTELLIGENCE</span><span>Illustrative connections · not study findings or patient analysis</span></div></div>
        </div>
        <div className="hsi-editorial-bottomline"><span>EXPLORE <b>•</b> CONNECT <b>•</b> UNDERSTAND <b>•</b> DISCOVER</span><Link to="/how-it-works">SEE HOW IT WORKS ↗</Link></div>
      </div>
    </section>
    <section className="hsi-editorial-intro"><div className="hsi-editorial-wrap hsi-editorial-intro-grid"><p className="hsi-editorial-kicker">01 / THE IDEA</p><div><h2>Health is connected.<br/><em>Intelligence should be too.</em></h2><p>Health questions rarely fit inside a single dataset or discipline. HSI brings together evidence-grounded research tools and a connected vision for clinical, patient and trial intelligence — with distinct data permissions and review boundaries.</p></div></div></section>
    <section className="hsi-editorial-products" id="ecosystem"><div className="hsi-editorial-wrap">
      <div className="hsi-editorial-sectionhead"><div><p className="hsi-editorial-kicker">02 / THE ECOSYSTEM</p><h2>FOUR WAYS<br/><em>TO GO DEEPER.</em></h2></div><p>Distinct experiences. One shared scientific foundation. Each product keeps its own data ownership and safety boundaries.</p></div>
      <div className="hsi-editorial-product-grid">{destinations.map((item,i)=>{const product=ECOSYSTEM_PRODUCTS.find(p=>p.id===item.id);return <article className={"hsi-editorial-product hsi-editorial-product-"+item.id} key={item.id}>
        <div className="hsi-editorial-product-top"><span>{item.index} / {item.kicker}</span><span className="hsi-editorial-product-icon" aria-hidden="true">{i===0?"✳":i===1?"⌁":i===2?"♡":"⊕"}</span></div>
        <div className="hsi-editorial-product-body"><h3>{item.title}</h3><p>{item.description}</p></div>
        <div className="hsi-editorial-product-footer"><span>{product ? MATURITY_CHIP_LABEL[product.chip] : "Explore"}</span><Link to={item.href} aria-label={"Explore "+item.title}>Explore <span aria-hidden="true">↗</span></Link></div>
      </article>})}</div>
    </div></section>
    <section className="hsi-editorial-connection"><div className="hsi-editorial-wrap hsi-editorial-connection-grid"><div><p className="hsi-editorial-kicker">03 / THE FOUNDATION</p><h2>CONNECTIONS<br/><em>THAT CARRY MEANING.</em></h2><p>From immune pathways and published findings to permitted clinical context, every relationship needs its source, its uncertainty and its purpose. Research hypotheses remain separate from reviewed evidence.</p><Link className="hsi-editorial-button" to="/platform">Understand the platform <span aria-hidden="true">↗</span></Link></div><div className="hsi-editorial-connection-map"><div className="hsi-editorial-map-core">EVIDENCE<br/>+ CONTEXT</div><span>HUMAN BIOLOGY</span><span>IMMUNE SCIENCE</span><span>LONGITUDINAL HEALTH</span><span>CLINICAL RESEARCH</span></div></div></section>
    <section className="hsi-editorial-outro"><div className="hsi-editorial-wrap"><p className="hsi-editorial-kicker">04 / DISCOVER MORE</p><h2>FROM QUESTIONS<br/><em>TO UNDERSTANDING.</em></h2><p>Explore our research direction and the distinct journeys designed for researchers, care teams and individuals.</p><div className="hsi-editorial-actions"><Link className="hsi-editorial-button" to="/for-isi">Explore ISI Research <span aria-hidden="true">↗</span></Link><Link className="hsi-editorial-textlink" to="/how-it-works">How it works ↗</Link></div><small>Scientific research tools do not provide diagnosis, prescribing or confirmed trial eligibility. Clinical and trial capabilities are separately governed and subject to validation.</small></div></section>
  </div>;
}
