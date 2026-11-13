import { Link } from "react-router-dom";
import { intelligenceCapabilities as agents, intelligenceLayers } from "../lib/intelligenceCollective";
import "../styles/intelligence-collective.css";

const findAgent = (name:string) => agents.find(a => a.name === name);
function AgentCard({slug}:{slug:string}) {
 const a = agents.find(x=>x.slug===slug);
 if(!a) return null;
 return <Link className="ic-card" to={`/intelligence/${a.slug}`}>
   <span className="ic-card-top"><span className="ic-glyph" aria-hidden="true">{a.icon}</span><span className="ic-card-arrow" aria-hidden="true">↗</span></span>
   <span className="ic-name">{a.name}</span><span className="ic-role">{a.role}</span>
   <span className="ic-card-foot">{a.layer}<span>Explore role →</span></span>
 </Link>;
}
export function IntelligenceCollectiveLanding(){
 return <main className="ic-page">
  <section className="ic-hero"><div className="ic-shell ic-hero-grid"><div>
    <p className="ic-eyebrow"><span className="ic-dot"/> HUMAN SUPER INTELLIGENCE / INTELLIGENCE COLLECTIVE</p>
    <h1>One scientific question.<br/><em>A coordinated intelligence.</em></h1>
    <p className="ic-lead">Meet the proposed specialist capabilities behind HSI: source integrity, biological investigation, independent verification and continuous assurance. Designed to work together, not as disconnected chatbots.</p>
    <div className="ic-actions"><a className="ic-primary" href="#collective">Explore the collective <span>↗</span></a><Link className="ic-secondary" to="/research">See the research workflow ↗</Link></div>
    <p className="ic-honesty">Architecture & capability guide · Not a claim that all agents are live or scientifically validated.</p>
  </div><div className="ic-hero-art" aria-label="Conceptual diagram of coordinated scientific intelligence">
    <div className="ic-orbit ic-orbit-outer"/><div className="ic-orbit ic-orbit-inner"/>
    <div className="ic-core"><small>COORDINATION</small><strong>NEXUS</strong><span>One governed investigation</span></div>
    <span className="ic-satellite ic-s1">AEGIS</span><span className="ic-satellite ic-s2">HELIX</span><span className="ic-satellite ic-s3">VERITAS</span><span className="ic-satellite ic-s4">ATLAS</span>
    <span className="ic-art-note">CONCEPTUAL SYSTEM MAP / NOT LIVE TELEMETRY</span>
  </div></div></section>
  <section className="ic-intro ic-shell"><p className="ic-eyebrow">THE OPERATING PRINCIPLE</p><h2>Specialised by responsibility.<br/><em>United by evidence.</em></h2><p>Each capability has a defined job, a bounded authority and explicit handoffs. Models can propose and challenge findings; deterministic controls enforce rights, access, provenance and review. No agent approves its own scientific conclusions.</p></section>
  <section id="collective" className="ic-collective"><div className="ic-shell"><div className="ic-section-heading"><div><p className="ic-eyebrow">THE COLLECTIVE / 13 CAPABILITIES</p><h2>Explore the intelligence layers.</h2></div><p>Names describe proposed responsibilities. Deployment and validation status are disclosed on every detail page.</p></div>
   {intelligenceLayers.map((layer,i)=><div className="ic-layer" key={layer}><div className="ic-layer-title"><span>0{i+1}</span><h3>{layer}</h3></div><div className="ic-grid">{agents.filter(a=>a.layer===layer).map(a=><AgentCard key={a.slug} slug={a.slug}/>)}</div></div>)}
  </div></section>
  <section className="ic-flow ic-shell"><p className="ic-eyebrow">HOW THE COLLECTIVE WORKS</p><h2>From a question to a reviewable finding.</h2><div className="ic-flow-grid">{["NEXUS coordinates","SCOUT discovers","AEGIS checks rights","PRISM extracts","ATLAS + HELIX connect biology","PARALLAX compares context","VERITAS challenges","ARBITER routes review"].map((s,i)=><div key={s} className="ic-flow-step"><span>{String(i+1).padStart(2,"0")}</span><strong>{s}</strong></div>)}</div><p className="ic-flow-note">HORIZON proposes research gaps; SENTINEL monitors source changes; CALIBER evaluates quality; WARDEN oversees reliability. Human-authorised review remains required where policy demands it.</p></section>
  <section className="ic-close"><div className="ic-shell"><p className="ic-eyebrow">THE RESEARCH MISSION</p><h2>Understand the mechanism.<br/>Preserve the evidence.<br/><em>Explain the uncertainty.</em></h2><div className="ic-actions"><Link className="ic-primary" to="/research">Explore research ↗</Link><Link className="ic-secondary" to="/trust">Review scientific safeguards ↗</Link></div></div></section>
 </main>;
}
export function IntelligenceCapabilityLanding({slug}:{slug:string}){ const a=agents.find(x=>x.slug===slug);
 if(!a)return <main className="ic-page ic-shell ic-missing"><h1>Capability not found</h1><Link to="/intelligence">Return to the collective →</Link></main>;
 return <main className="ic-page"><section className="ic-detail-hero"><div className="ic-shell">
 <Link className="ic-back" to="/intelligence">← Intelligence Collective</Link>
 <p className="ic-eyebrow">{a.layer.toUpperCase()} / PROPOSED CAPABILITY</p>
 <div className="ic-detail-heading"><div><h1>{a.name}<span className="ic-detail-symbol" aria-hidden="true">{a.icon}</span></h1><h2>{a.role}</h2><p className="ic-lead">{a.purpose}</p></div><div className="ic-status"><small>CURRENT IMPLEMENTATION POSITION</small><strong>{a.maturity}</strong><span>Capability naming does not indicate deployment.</span></div></div>
 </div></section>
 <section className="ic-shell ic-detail-body"><div className="ic-detail-main">
 <div className="ic-detail-section"><p className="ic-eyebrow">01 / RESPONSIBILITIES</p><h2>What {a.name} is designed to do.</h2><ul className="ic-checklist">{a.responsibility.map(x=><li key={x}>{x}</li>)}</ul></div>
 <div className="ic-detail-section"><p className="ic-eyebrow">02 / AUTHORITY BOUNDARY</p><h2>Where the responsibility stops.</h2><p>{a.boundary}</p></div>
 <div className="ic-detail-section"><p className="ic-eyebrow">03 / DEPENDENCIES</p><h2>What must exist first.</h2><ul className="ic-checklist">{a.dependencies.map(x=><li key={x}>{x}</li>)}</ul></div>
 </div><aside className="ic-detail-aside"><div className="ic-aside-box"><p className="ic-eyebrow">ARCHITECTURAL LOCATION</p><strong>{a.location}</strong><p>Logical ownership boundary, not a claim of a separately deployed microservice.</p></div><div className="ic-aside-box"><p className="ic-eyebrow">CONNECTED CAPABILITIES</p><div className="ic-partners">{a.partners.map(n=>{const partner=findAgent(n);return partner?<Link key={n} to={`/intelligence/${partner.slug}`}>{n}<span>↗</span></Link>:null})}</div></div></aside></section>
 <section className="ic-shell ic-next"><p className="ic-eyebrow">EXPLORE NEXT</p><h2>One collective. Shared scientific responsibility.</h2><div className="ic-grid">{agents.filter(x=>x.slug!==a.slug).slice(0,3).map(x=><AgentCard key={x.slug} slug={x.slug}/>)}</div><Link className="ic-all" to="/intelligence">View all capabilities ↗</Link></section>
 </main>;
}
