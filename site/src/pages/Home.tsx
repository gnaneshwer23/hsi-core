import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const contexts = [
  { id: "immune", label: "Immunity", title: "Look beyond a single marker.", text: "Explore how immune cells, inflammatory signals and tissue context relate to a research question. Evidence needs to be interpreted within the population and setting studied.", nodes: ["Immune cells", "Inflammation", "Tissue context", "Research evidence"] },
  { id: "gut", label: "Gut health", title: "Put the gut in biological context.", text: "Investigate the relationships between the intestinal barrier, microbial communities and immune responses. A possible mechanism is a starting point for research, rather than proof of causation.", nodes: ["Microbiome", "Intestinal barrier", "Immune response", "Research evidence"] },
  { id: "brain", label: "Brain health", title: "Connect systems. Keep the context.", text: "Explore neuroimmune questions across nervous and immune systems. Distinguish findings from cell models, animal studies and human research before drawing conclusions.", nodes: ["Neural signalling", "Immune response", "Study setting", "Research evidence"] },
  { id: "metabolic", label: "Metabolic health", title: "Ask how the pieces relate.", text: "Consider glucose regulation, metabolic pathways and inflammatory biology together. Lifestyle and treatment observations require appropriate permissions and careful interpretation.", nodes: ["Glucose regulation", "Metabolic pathways", "Inflammation", "Research evidence"] },
];

function BiologyArt() {
  return <svg className="home-biology" viewBox="0 0 600 600" role="img" aria-labelledby="biology-title biology-desc">
    <title id="biology-title">A connected view of biology</title>
    <desc id="biology-desc">An abstract illustration of cells connected around a central biological system.</desc>
    <defs>
      <radialGradient id="home-cell"><stop stopColor="#f3eee8"/><stop offset=".45" stopColor="#7eb9a9"/><stop offset="1" stopColor="#17645f" stopOpacity=".2"/></radialGradient>
      <radialGradient id="home-aura"><stop stopColor="#99c6b7" stopOpacity=".3"/><stop offset="1" stopColor="#17645f" stopOpacity="0"/></radialGradient>
      <linearGradient id="home-orbit"><stop stopColor="#f3eee8" stopOpacity=".8"/><stop offset="1" stopColor="#ff6845" stopOpacity=".1"/></linearGradient>
    </defs>
    <circle cx="300" cy="300" r="295" fill="url(#home-aura)"/>
    {[170, 225, 275].map(r => <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="#f3eee8" strokeOpacity=".14" strokeDasharray={r === 225 ? "2 9" : undefined}/>)}
    <g stroke="url(#home-orbit)" fill="none"><path d="M145 180 300 300 470 180M300 300 435 435 155 445 145 180M155 445 300 300 470 180 435 435"/><ellipse cx="300" cy="300" rx="260" ry="105" transform="rotate(-35 300 300)"/></g>
    {[[300,300,100],[145,180,42],[470,180,55],[435,435,44],[155,445,57]].map(([x,y,r], i) => <g key={i}>
      <circle cx={x} cy={y} r={r} fill="url(#home-cell)" stroke="#f3eee8" strokeOpacity=".55"/>
      <circle cx={x} cy={y} r={r * .62} fill="none" stroke="#f3eee8" strokeOpacity=".35"/>
      <circle cx={x - r * .15} cy={y + r * .08} r={r * .3} fill={i === 0 ? "#ff6845" : "#12544f"} stroke="#ff997f" strokeOpacity=".6"/>
      {[0,1,2,3,4,5].map(n => <circle key={n} cx={x + Math.cos(n * 1.04) * r * .77} cy={y + Math.sin(n * 1.04) * r * .77} r="3" fill="#f3eee8" fillOpacity=".7"/>)}
    </g>)}
    <g fill="#f3eee8" fontSize="11" fontFamily="monospace" letterSpacing="2"><text x="62" y="105">OBSERVE</text><text x="426" y="99">CONNECT</text><text x="414" y="523">UNDERSTAND</text></g>
  </svg>;
}

export function Home() {
  const [active, setActive] = useState(0);
  const context = contexts[active];
  return <div className="home-redesign">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-wrap home-hero-grid">
        <div className="home-hero-copy">
          <p className="home-kicker"><span /> HUMAN SUPER INTELLIGENCE</p>
          <h1 id="home-title">Health is connected.<br/><em>Intelligence should be too.</em></h1>
          <p className="home-lede">A shared technology foundation for connecting health context, human biology and scientific evidence—with people at the centre.</p>
          <div className="home-actions"><Link className="home-button" to="/platform">Explore the platform <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link><a className="home-text-link" href="#connected-ecosystem">Meet the ecosystem <span aria-hidden="true">↓</span></a></div>
          <p className="home-hero-note">Built around traceable evidence. Guided by human judgement.</p>
        </div>
        <div className="home-hero-art"><BiologyArt/><div className="home-art-caption"><span className="home-dot"/> A wider lens on human biology <span>HUMAN BIOLOGY</span></div></div>
      </div>
      <div className="home-wrap home-hero-foot"><span>FROM HEALTH CONTEXT TO BIOLOGICAL UNDERSTANDING</span><span>Aksh Health <b>→</b> Immune Super Intelligence <b>→</b> HSI</span></div>
    </section>

    <section className="home-section home-intro">
      <div className="home-wrap home-split"><p className="home-kicker">THE BIGGER PICTURE</p><div><h2>Complex questions deserve<br/><span>a connected view.</span></h2><p>A lab result, a biological pathway and a research paper each tell part of a story. Our vision is to help people understand how those pieces relate, where the evidence is strong, and what still needs investigation.</p></div></div>
    </section>

    <section className="home-section home-ecosystem" id="connected-ecosystem" aria-labelledby="ecosystem-title">
      <div className="home-wrap">
        <div className="home-section-head"><div><p className="home-kicker">ONE VISION. DISTINCT EXPERIENCES.</p><h2 id="ecosystem-title">From the person.<br/>To the biology. To the bigger picture.</h2></div><p>Aksh and ISI keep their own experiences and data. HSI develops the shared technology behind a more connected approach.</p></div>
        <div className="home-product-grid">
          <article className="home-product home-product-aksh"><div className="home-product-art home-person-art" aria-hidden="true"><div className="home-person-head"/><div className="home-person-body"/><span className="home-person-tag">HEALTH CONTEXT</span><i/><i/><i/></div><div className="home-product-content"><p className="home-kicker">01 / THE PERSON</p><h3>Aksh Health</h3><p>Health information and care workflows, organised around the person and the teams supporting them.</p><Link to="/for-aksh">Explore Aksh Health <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div></article>
          <article className="home-product home-product-isi"><div className="home-product-art home-network-art" aria-hidden="true"><svg viewBox="0 0 320 220"><g stroke="currentColor" strokeOpacity=".4" fill="none"><path d="M55 80 160 110 265 60 230 175 160 110 85 180 55 80 265 60M85 180 230 175"/></g>{[[55,80,16],[160,110,29],[265,60,13],[230,175,19],[85,180,12]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill="currentColor" fillOpacity={i===1 ? ".8" : ".3"}/>)}</svg><span className="home-person-tag">BIOLOGICAL CONTEXT</span></div><div className="home-product-content"><p className="home-kicker">02 / THE BIOLOGY</p><h3>Immune Super Intelligence</h3><p>A specialist research experience for exploring immune mechanisms, biological relationships and evidence.</p><Link to="/for-isi">Explore ISI Research <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div></article>
          <article className="home-product home-product-hsi"><div className="home-product-art home-layers-art" aria-hidden="true"><span/><span/><span/><b>HSI</b><small className="home-person-tag">SHARED TECHNOLOGY</small></div><div className="home-product-content"><p className="home-kicker">03 / THE FOUNDATION</p><h3>Human Super Intelligence</h3><p>Shared tools for evidence retrieval, knowledge relationships and investigations that keep human review in the loop.</p><Link to="/platform">Explore the foundation <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div></article>
        </div>
      </div>
    </section>

    <section className="home-section home-context" aria-labelledby="context-title">
      <div className="home-wrap"><div className="home-section-head"><div><p className="home-kicker">EXPLORE THE CONNECTIONS</p><h2 id="context-title">Biology doesn’t work in silos.</h2></div><p>Choose a research area to see the kinds of context a connected approach brings into view.</p></div>
        <div className="home-context-tabs" role="tablist" aria-label="Biological context">{contexts.map((c,i)=><button type="button" role="tab" id={`context-tab-${c.id}`} aria-controls={`context-panel-${c.id}`} aria-selected={active===i} tabIndex={active===i ? 0 : -1} key={c.id} onClick={()=>setActive(i)} onKeyDown={event=>{let next=i;if(event.key==="ArrowRight") next=(i+1)%contexts.length;else if(event.key==="ArrowLeft") next=(i+contexts.length-1)%contexts.length;else if(event.key==="Home") next=0;else if(event.key==="End") next=contexts.length-1;else return;event.preventDefault();setActive(next);document.getElementById(`context-tab-${contexts[next].id}`)?.focus();}}>{c.label}<svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></button>)}</div>
        <div className="home-context-panel" role="tabpanel" id={`context-panel-${context.id}`} aria-labelledby={`context-tab-${context.id}`} tabIndex={0}>
          <div className="home-context-copy"><p className="home-kicker">A CONNECTED RESEARCH PERSPECTIVE</p><h3>{context.title}</h3><p>{context.text}</p><Link className="home-text-link" to="/science">Discover the science <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div>
          <div className="home-concept-map"><p>CONCEPTUAL VIEW</p><div className="home-concept-centre">{context.label}</div><div className="home-concept-nodes">{context.nodes.map((n,i)=><span key={n}><small>0{i+1}</small>{n}</span>)}</div><small>Illustrative connections · not study findings or patient analysis</small></div>
        </div>
      </div>
    </section>

    <section className="home-section home-workflow"><div className="home-wrap"><div className="home-section-head"><div><p className="home-kicker">HOW THE THINKING CONNECTS</p><h2>A clearer path<br/>from question to understanding.</h2></div><Link className="home-text-link" to="/how-it-works">How it works <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div><div className="home-steps">{[
      ["01", "Start with a question", "Define the research question and the context needed to investigate it."],
      ["02", "Connect the biology", "Explore relevant cells, pathways and relationships in the knowledge graph."],
      ["03", "Examine the evidence", "Review sources, study context, conflicting findings and uncertainty."],
      ["04", "Keep people in control", "Prepare a traceable investigation for human review and further research."],
    ].map(([n,title,text])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="home-section home-trust"><div className="home-wrap home-trust-grid"><div><p className="home-kicker">TRUST IS PART OF THE DESIGN</p><h2>More context.<br/>Clearer limits.<br/><em>Human judgement.</em></h2></div><div className="home-principles"><article><h3>Evidence you can trace</h3><p>Sources and research context belong alongside a claim, so people can assess what it means and where it falls short.</p></article><article><h3>Data stays with its product</h3><p>Shared technology does not mean a shared patient database. Aksh and ISI retain their own data and access controls.</p></article><article><h3>Research with clear boundaries</h3><p>Research investigations support exploration and review. They do not provide diagnosis, treatment decisions or confirmed trial eligibility.</p></article></div></div></section>

    <section className="home-section home-closing"><div className="home-wrap"><p className="home-kicker">HUMAN SUPER INTELLIGENCE</p><h2>See the connections.<br/><em>Ask better questions.</em></h2><p>Discover the technology and the specialist experiences shaping our vision.</p><div className="home-actions"><Link to="/platform" className="home-button">Explore the platform <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link><Link to="/products" className="home-text-link">Find your starting point <svg className="home-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div></div></section>
  </div>;
}
