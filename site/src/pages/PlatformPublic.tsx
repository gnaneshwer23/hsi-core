import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/home-redesign.css";
import "../styles/platform-figure.css";
import {intelligenceCapabilities,intelligenceLayers} from "../lib/intelligenceCollective";
import {AGENT_STATE,agentSummary} from "../lib/agentDashboard";
import {useGraphSnapshot} from "../components/home/useGraphSnapshot";

const experience:[string,string][]=[
  ["Investigation","/research"],["Evidence","/evidence-intelligence"],["Context-Conflict Audit","/context-conflict-audit"],["Research briefs","/research-briefs"],
];
const sources=["Publications","Datasets","Ontologies","Research metadata"];
const governance=[
  ["Study observation","What a source reports, with its version, passage and conditions."],
  ["Computational interpretation","An inference to examine; uncertainty stays attached."],
  ["Independent verification","Check support, context, source rights and missing evidence."],
  ["Human scientific review","A scoped independent decision on an immutable version."],
  ["Separate publication decision","No automatic promotion into reviewed graph knowledge."],
] as const;
const fmt=(n:number)=>n.toLocaleString("en-GB");

/** Platform page. Figure 2 shows how one investigation moves through three layers, with governance crossing all of them. */
export function PlatformPublicPage(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const a=agentSummary();
  return (
    <div className="sp-page fg-page pf-page">
      <section className="fg-hook" aria-labelledby="pf-title">
        <h1 id="pf-title">The intelligence behind connected biomedical research.</h1>
        <div>
          <p className="fg-lead">Understand how HSI connects evidence, biological relationships, contextual reasoning and scientific governance.</p>
          <div className="sp-actions">
            <Link className="sp-button" to="/research">Explore the research workflow <span aria-hidden="true">→</span></Link>
            <Link to="/knowledge-graph">See the knowledge graph →</Link>
          </div>
          <p className="fg-status">Architecture as designed · status read from the capability records</p>
        </div>
      </section>

      <figure className="fg pf-figure" aria-labelledby="pf-cap">
        <div className="pf-stack">
          <div className="pf-layers">
            <section className="pf-band" aria-labelledby="pf-a">
              <span className="fg-letter" aria-hidden="true">A</span>
              <h2 id="pf-a">Research experience</h2>
              <p>A question, comparable observations, uncertainty and a versioned outcome for a researcher to examine.</p>
              <ul className="pf-links">{experience.map(([l,to])=><li key={to}><Link to={to}>{l}</Link></li>)}</ul>
            </section>
            <section className="pf-band pf-foundation" aria-labelledby="pf-b">
              <span className="fg-letter" aria-hidden="true">B</span>
              <h2 id="pf-b">Scientific intelligence foundation</h2>
              <p>The knowledge graph retains provenance and review state. Capabilities read from it and propose to it; none approves anything.</p>
              <div className="pf-agents">
                {intelligenceLayers.map(layer=>(
                  <div key={layer}>
                    <h3>{layer}</h3>
                    <ul>
                      {intelligenceCapabilities.filter(c=>c.layer===layer).map(c=>(
                        <li key={c.slug}><Link to={`/intelligence/${c.slug}`}>{c.name}</Link><span className="pf-state" data-state={AGENT_STATE[c.slug]!.state} title={AGENT_STATE[c.slug]!.label}><span className="sp-sr">{AGENT_STATE[c.slug]!.label}</span></span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="pf-meta">{a.capabilities} capabilities · {a.liveRuns} live runs · {a.independentlyAccepted} independently accepted · {a.disabled} disabled. A hollow dot means built with no live run; a dashed dot means built and disabled.</p>
            </section>
            <section className="pf-band" aria-labelledby="pf-c">
              <span className="fg-letter" aria-hidden="true">C</span>
              <h2 id="pf-c">Governed biomedical sources</h2>
              <p>Source identity, current permissions, passage versions and correction or retraction checks must be verified before use.</p>
              <ul className="pf-links pf-plain">{sources.map(x=><li key={x}>{x}</li>)}</ul>
              <p className="pf-meta">{s?`Published snapshot: ${fmt(s.sources)} sources, ${fmt(s.notRetrieved)} of them bibliographic records, not retrieved passages.`:failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"} Public ontologies (MONDO, UBERON, CL, GO, ECO) are mapped as candidates, not approved.</p>
            </section>
          </div>
          <aside className="pf-rail" aria-labelledby="pf-d">
            <span className="fg-letter" aria-hidden="true">D</span>
            <h2 id="pf-d">Governance crosses every layer</h2>
            <ol>
              {governance.map(([t,d])=><li key={t}><strong>{t}</strong><span>{d}</span></li>)}
            </ol>
            <Link to="/trust">How evidence, inference and approval stay separate →</Link>
          </aside>
        </div>
        <figcaption id="pf-cap" className="fg-cap">
          <b>Figure 2.</b> One investigation moves up through three layers: governed sources (C), the scientific intelligence foundation (B) and the research experience (A). Governance (D) applies at every step. Architecture describes the foundation as designed; independent service and scientific acceptance remain required. No clinical advice; no patient data.
        </figcaption>
      </figure>

      <section className="pf-text" aria-labelledby="pf-roles">
        <h2 id="pf-roles">Three core roles. One accountable investigation.</h2>
        <p>The orchestrator coordinates scope and budgets; the evidence and context investigator gathers and compares; the scientific verifier checks support and uncertainty. Specialist biological tools support these roles. An optional planner remains restricted until an independently reviewed comparison demonstrates benefit. More agents are not a substitute for better evidence.</p>
        <p><Link to="/intelligence">Meet the Intelligence Collective →</Link></p>
      </section>
      <section className="pf-text" aria-labelledby="pf-sep">
        <h2 id="pf-sep">Interoperable research. Separate responsibilities.</h2>
        <p>The scientific, clinical, patient-reported and study-related capabilities retain their own governance, data and interfaces. The shared foundation connects governed research artifacts, not patient-record transfers. Scientific research does not depend on a live care system. No live matching, eligibility confirmation or enrolment is offered here.</p>
        <p>Engineering preparation, deployment success and scientific validation are different states. Live provider operations, source rights, staging isolation and independent scientific acceptance remain separately gated.</p>
        <div className="sp-actions">
          <Link className="sp-button" to="/applications">Explore applications <span aria-hidden="true">→</span></Link>
          <Link to="/connected-intelligence">See how capabilities connect →</Link>
          <Link to="/trust">Review the boundaries →</Link>
        </div>
      </section>
    </div>
  );
}
