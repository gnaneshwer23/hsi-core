import { Link } from "react-router-dom";
import { intelligenceCapabilities } from "../../lib/intelligenceCollective";
import "./HomeIntelligenceCollective.css";

const featured = ["NEXUS","AEGIS","PRISM","ATLAS","HELIX","VERITAS"];
export function HomeIntelligenceCollective(){
 const agents=featured.map(name=>intelligenceCapabilities.find(a=>a.name===name)).filter((a):a is NonNullable<typeof a>=>Boolean(a));
 return <section className="hic-section" aria-labelledby="hic-title"><div className="hic-wrap">
  <div className="hic-heading"><div><p className="hic-eyebrow">THE HSI INTELLIGENCE COLLECTIVE / PROPOSED SYSTEM</p><h2 id="hic-title">Scientific intelligence.<br/><em>Working as one.</em></h2></div><div className="hic-heading-copy"><p>From source integrity to biological mechanisms and independent verification, specialist capabilities are designed to contribute to one evidence-grounded investigation.</p><Link to="/intelligence">Explore all 13 capabilities <span aria-hidden="true">↗</span></Link></div></div>
  <div className="hic-stage"><div className="hic-stage-lead"><span className="hic-index">01 / THE INVESTIGATION</span><h3>One question.<br/>Many perspectives.</h3><p>A coordinated research journey connects source permissions, structured evidence, biological relationships and scientific scrutiny.</p><Link to="/research">See how investigation works ↗</Link></div>
   <div className="hic-capability-grid">{agents.map((a,i)=><Link key={a.slug} to={`/intelligence/${a.slug}`} className="hic-capability"><span className="hic-capability-top"><span>{String(i+1).padStart(2,"0")}</span><span aria-hidden="true">↗</span></span><strong>{a.name}</strong><span className="hic-role">{a.role}</span><span className="hic-purpose">{a.purpose}</span></Link>)}</div>
  </div>
  <div className="hic-footer"><div><span className="hic-small-dot" aria-hidden="true"/> <strong>Evidence before inference.</strong> Every handoff must preserve provenance, context and uncertainty.</div><p>Capability architecture is illustrative. Live scientific execution and independent validation remain gated.</p></div>
 </div></section>;
}
