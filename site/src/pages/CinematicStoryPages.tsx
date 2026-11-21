import type {ReactNode} from "react";
import {Link} from "react-router-dom";
import {intelligenceCapabilities,intelligenceLayers} from "../lib/intelligenceCollective";

function Page({eye,title,lead,children,id}:{eye:string;title:string;lead:string;children:ReactNode;id:string}){
 return (
  <div className="cine">
   <header className="cine-section">
    <div className="cine-wrap">
     <p className="cine-eye">— {eye}</p>
     <h1 id={id}>{title}</h1>
     <p className="cine-lead">{lead}</p>
    </div>
   </header>
   {children}
  </div>
 );
}

export function IntelligencePublicPage(){
 const groups=intelligenceLayers.map(layer=>({layer,items:intelligenceCapabilities.filter(c=>c.layer===layer)}));
 return (
  <Page id="intel-title" eye="The HSI intelligence collective" title="Scientific investigation needs more than one perspective." lead="HSI’s Intelligence Collective is an architecture of specialised scientific agents with distinct responsibilities. Some discover evidence. Others examine biological context, investigate mechanisms, challenge interpretations or coordinate scientific review.">
   <section className="cine-section" aria-labelledby="intel-groups">
    <div className="cine-wrap cine-groups">
     <h2 id="intel-groups">The collective</h2>
     {groups.map(g=>(
      <div className="cine-group" key={g.layer}>
       <h3>{g.layer}</h3>
       <ul className="cine-list">
        {g.items.map(c=>(
         <li key={c.slug}><h3 style={{margin:0}}>{c.name} — {c.role}</h3><p style={{margin:".2rem 0 0"}}>{c.purpose}</p></li>
        ))}
       </ul>
      </div>
     ))}
    </div>
   </section>
   <section className="cine-section">
    <div className="cine-wrap">
     <h2>Built around accountability</h2>
     <p>The goal is not to replace scientific judgement with automated agreement. It is to make scientific investigations more inspectable, reproducible and explicit about uncertainty.</p>
     <p className="cine-note">Agent responsibilities are defined; full autonomous production operation and independent scientific acceptance remain under development.</p>
     <Link className="cine-btn" to="/how-it-works">Understand the HSI Architecture</Link>
    </div>
   </section>
  </Page>
 );
}

const GAP_KINDS=[
 ["Evidence gaps","Where direct or reliable evidence is limited."],
 ["Mechanistic gaps","Where biological relationships are observed but not adequately explained."],
 ["Context gaps","Where findings differ across biological conditions."],
 ["Methodological gaps","Where experimental designs leave important questions unanswered."],
 ["Cross-domain gaps","Where potentially relevant findings have not been directly investigated together."],
 ["Translational gaps","Where laboratory findings have uncertain relevance to human biology or disease."],
] as const;

export function ResearchGapsPublicPage(){
 return (
  <Page id="gaps-title" eye="Research gap intelligence" title="The next breakthrough may begin with what’s missing." lead="Finding scientific evidence is only the beginning. Researchers also need to understand where evidence is weak, where mechanisms remain unresolved and which questions could produce the most informative next result.">
   <section className="cine-section">
    <div className="cine-wrap">
     <p>HSI’s proposed Research Gap Navigator is designed to connect evidence gaps with actionable research directions.</p>
     <h2>Discover different kinds of gaps</h2>
     <ul className="cine-cols cine-list">
      {GAP_KINDS.map(([t,d])=><li key={t}><h3 style={{margin:0}}>{t}</h3><p style={{margin:".2rem 0 0"}}>{d}</p></li>)}
     </ul>
     <h2>From unanswered question to testable next step</h2>
     <p>For each candidate gap, the goal is to show why it matters, which evidence supports identifying it, what the search may have missed, which alternative explanations remain, which experiments could help, and which groups have relevant expertise.</p>
     <p>Not every missing paper represents a research gap. HSI should distinguish an actual scientific gap from incomplete retrieval, unavailable full text or differences in terminology.</p>
     <p className="cine-note">Dedicated Gap Navigator experience is under development. Existing HSI gap-analysis foundations are available within research-preview workflows. The published snapshot currently records its gaps inside the knowledge graph, with zero scientifically reviewed relationships.</p>
     <div className="cine-cta" style={{justifyContent:"flex-start"}}>
      <Link className="cine-btn" to="/research/gaps">Open the recorded gap register</Link>
      <Link className="cine-btn cine-btn-line" to="/knowledge-graph">Explore the Knowledge Graph</Link>
     </div>
    </div>
   </section>
  </Page>
 );
}

export function ScientificCompanionPublicPage(){
 return (
  <Page id="comp-title" eye="Conversational scientific intelligence" title="Discuss science. Challenge assumptions. Explore possibilities." lead="Research advances through questions, discussion and critical examination. The HSI Scientific Companion is envisioned as a conversational interface to the platform’s evidence, knowledge graph and scientific investigation tools.">
   <section className="cine-section">
    <div className="cine-wrap">
     <p className="cine-future">Future capability — not a live service</p>
     <h2>A conversation grounded in science</h2>
     <ul className="cine-cols cine-list">
      {["Explain a biological mechanism.","Compare findings from different studies.","Identify weaknesses in an interpretation.","Explore alternative hypotheses.","Discuss experimental controls.","Navigate the knowledge graph.","Explain why evidence may be insufficient.","Suggest what to investigate next."].map(item=><li key={item}>{item}</li>)}
     </ul>
     <h2>From text to voice and audiovisual interaction</h2>
     <p>We envision a companion that researchers can engage with through natural conversation, with optional real-time voice and avatar experiences. The underlying scientific reasoning must remain evidence-grounded regardless of the interface.</p>
     <h2>A research partner that can say “I don’t know.”</h2>
     <p>Scientific confidence should reflect evidence quality, not conversational fluency. The companion must be able to abstain, identify uncertainty and show the evidence behind its explanations.</p>
     <p className="cine-note">Planned capability. Real-time voice and audiovisual interaction are not currently live HSI features.</p>
    </div>
   </section>
  </Page>
 );
}

export function ValidationPublicPage(){
 return (
  <Page id="val-title" eye="Scientific trust and transparency" title="Scientific intelligence must be accountable to evidence." lead="AI can help researchers investigate complex questions. It can also misinterpret findings, overlook experimental context and produce unsupported conclusions. HSI is designed around explicit scientific boundaries.">
   <section className="cine-section" id="validation">
    <div className="cine-wrap">
     <h2>Validation is a methodology, not a scoreboard.</h2>
     <ul className="cine-list">
      <li><h3 style={{margin:0}}>Evidence before interpretation</h3><p>Scientific claims should remain traceable to identifiable sources and permitted supporting material.</p></li>
      <li><h3 style={{margin:0}}>Context before comparison</h3><p>Different experimental conditions may explain apparently contradictory findings.</p></li>
      <li><h3 style={{margin:0}}>Uncertainty before confidence</h3><p>Insufficient evidence must remain visible rather than being converted into a confident answer.</p></li>
      <li><h3 style={{margin:0}}>Independent verification</h3><p>Candidate interpretations should be challenged through separate assessments and appropriate scientific evaluation.</p></li>
      <li><h3 style={{margin:0}}>Governance before graph promotion</h3><p>Extracted claims and generated hypotheses must not automatically become approved scientific knowledge.</p></li>
      <li><h3 style={{margin:0}}>Transparent maturity</h3><p>We distinguish implemented capabilities, research demonstrations, unreviewed candidate findings and functionality still awaiting scientific acceptance.</p></li>
     </ul>
     <p>The workflow-rehearsal surface at /research/validation is a different page. It is not this methodology, and it is not clinical validation. Public pages do not invent accuracy percentages.</p>
     <p className="cine-promise">Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.</p>
     <div className="cine-cta" style={{justifyContent:"flex-start"}}>
      <Link className="cine-btn" to="/how-it-works">Explore Our Scientific Approach</Link>
      <Link className="cine-btn cine-btn-line" to="/trust">Privacy, terms and accessibility</Link>
     </div>
    </div>
   </section>
  </Page>
 );
}
