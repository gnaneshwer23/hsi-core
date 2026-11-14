import {Link} from "react-router-dom";
import "../styles/scientific-public.css";
import "../styles/home-redesign.css";
import "../styles/home-diagrams.css";
import "../styles/platform-diagrams.css";
import {intelligenceCapabilities,intelligenceLayers} from "../lib/intelligenceCollective";
import {AGENT_STATE,agentSummary} from "../lib/agentDashboard";
import {connectedCapabilities,STATUS_TEXT} from "../lib/connectedIntelligence";
import {GraphSnapshotProvider,useGraphSnapshot} from "../components/home/useGraphSnapshot";

const outputs:[string,string][]=[["Evidence record","/evidence-intelligence"],["Context comparison","/context-conflict-audit"],["Gap register","/research/knowledge-graph"],["Draft brief","/research-briefs"]];
const sources=["Publications","Datasets","Ontologies","Research metadata"];
const ladder=["Observation","Interpretation","Verification","Human review","Publication decision"];
const fmt=(n:number)=>n.toLocaleString("en-GB");

function Stack(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const a=agentSummary();
  const wait=failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…";
  return (
    <figure className="pd-figure" aria-labelledby="pd-cap">
      <div className="pd-stack">
        <div className="pd-spine" aria-hidden="true"/>
        <section className="pd-band" aria-labelledby="pd-l5">
          <span className="pd-num" aria-hidden="true">5</span>
          <div className="pd-head"><h2 id="pd-l5">Outputs</h2><p>What a researcher gets.</p></div>
          <ul className="pd-links">{outputs.map(([l,to])=><li key={to}><Link to={to}>{l}</Link></li>)}</ul>
        </section>
        <section className="pd-band pd-dark" data-layer="agents" aria-labelledby="pd-l4">
          <span className="pd-num" aria-hidden="true">4</span>
          <div className="pd-head"><h2 id="pd-l4">Agents</h2><p>{a.capabilities} capabilities read from the graph and propose to it. None approves anything.</p></div>
          <div className="pd-agents">
            {intelligenceLayers.map(layer=>(
              <div key={layer}><h3>{layer}</h3>
                <ul>{intelligenceCapabilities.filter(c=>c.layer===layer).map(c=>(
                  <li key={c.slug}><Link className="pd-chip" to={`/intelligence/${c.slug}`}><span className="pd-dot" data-state={AGENT_STATE[c.slug]!.state} aria-hidden="true"/>{c.name}<span className="sp-sr"> ({AGENT_STATE[c.slug]!.label})</span></Link></li>
                ))}</ul>
              </div>
            ))}
          </div>
          <p className="pd-meta">{a.capabilities} capabilities · {a.liveRuns} live runs · {a.independentlyAccepted} independently accepted · {a.disabled} disabled. Hollow dot: built, no live run. Dashed dot: built and disabled.</p>
        </section>
        <section className="pd-band" aria-labelledby="pd-l3">
          <span className="pd-num" aria-hidden="true">3</span>
          <div className="pd-head"><h2 id="pd-l3">Verify and govern</h2><p>Nothing is promoted silently.</p></div>
          <ol className="pd-ladder">{ladder.map((x,i)=><li key={x} data-human={x==="Human review"||undefined}>{x}{i<ladder.length-1&&<span className="pd-gate" aria-hidden="true"/>}</li>)}</ol>
        </section>
        <section className="pd-band" aria-labelledby="pd-l2">
          <span className="pd-num" aria-hidden="true">2</span>
          <div className="pd-head"><h2 id="pd-l2">Graph and context</h2><p>Relationships keep their source, context and review status.</p></div>
          {s?<dl className="pd-stats"><div><dt>Concepts</dt><dd>{fmt(s.concepts)}</dd></div><div><dt>Candidate relationships</dt><dd>{fmt(s.relationships)}</dd></div><div><dt>Open gaps</dt><dd>{fmt(s.gaps.length)}</dd></div><div><dt>Reviewed</dt><dd>{fmt(s.reviewed)}</dd></div></dl>:<p className="pd-wait">{wait}</p>}
        </section>
        <section className="pd-band" aria-labelledby="pd-l1">
          <span className="pd-num" aria-hidden="true">1</span>
          <div className="pd-head"><h2 id="pd-l1">Governed sources</h2><p>Identity, permissions and passages are checked before use.</p></div>
          <div className="pd-src"><ul className="pd-plain">{sources.map(x=><li key={x}>{x}</li>)}</ul>{s?<p className="pd-meta">{fmt(s.sources)} sources in the snapshot; {fmt(s.notRetrieved)} are bibliographic records, not retrieved passages. Ontologies (MONDO, UBERON, CL, GO, ECO) are mapped as candidates, not approved.</p>:<p className="pd-wait">{wait}</p>}</div>
        </section>
      </div>
      <figcaption id="pd-cap" className="fg-cap"><b>Figure 2.</b> One investigation rises through five layers, from governed sources to the outputs a researcher examines. Governance applies at every layer, and a human decision sits between a model result and any change to the graph. It describes the platform as designed; independent service and scientific acceptance remain required. No clinical advice; no patient data.</figcaption>
    </figure>
  );
}

function Boundaries(){
  const wider=connectedCapabilities.filter(c=>c.id!=="scientific-discovery");
  const core=connectedCapabilities.find(c=>c.id==="scientific-discovery")!;
  return (
    <section className="pd-bound" aria-labelledby="pd-bound-t">
      <div className="hv-inner">
        <h2 id="pd-bound-t">Connected, not merged.</h2>
        <p className="hv-sub">The research graph is the only part available as a preview. The rest is developed separately, under its own governance.</p>
        <div className="pd-map">
          <div className="pd-core">
            <h3>{core.title}</h3>
            <span className="pd-status">{STATUS_TEXT[core.status]}</span>
            <ul>{core.connects.map(x=><li key={x}>{x}</li>)}</ul>
            <p>{core.isNot}</p>
          </div>
          <div className="pd-wall" aria-hidden="true"><span>Separate governance</span></div>
          <ul className="pd-others">
            {wider.map(c=>(
              <li key={c.id}>
                <h3>{c.title}</h3>
                <span className="pd-status" data-status={c.status}>{STATUS_TEXT[c.status]}</span>
                <p>{c.isNot}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="pd-fine">The shared foundation connects governed research artifacts, not patient-record transfers. No patient data enters the research graph, and no live matching, eligibility confirmation or enrolment is offered here.</p>
        <div className="sp-actions"><Link className="sp-button" to="/connected-intelligence">See how capabilities connect <span aria-hidden="true">→</span></Link><Link to="/trust">Review the boundaries →</Link></div>
      </div>
    </section>
  );
}

/** Platform: the architecture as one stack diagram and one boundary diagram. */
export function PlatformPublicPage(){
  return (
    <div className="sp-page fg-page hv-page pd-page">
      <GraphSnapshotProvider>
        <section className="fg-hook" aria-labelledby="pf-title">
          <h1 id="pf-title">The intelligence behind connected biomedical research.</h1>
          <div>
            <p className="fg-lead">Five layers, one trail from source to output, and a human decision before anything is promoted.</p>
            <div className="sp-actions">
              <Link className="sp-button" to="/research">Explore the research workflow <span aria-hidden="true">→</span></Link>
              <Link to="/knowledge-graph">See the knowledge graph →</Link>
            </div>
            <p className="fg-status">Architecture as designed · status read from the capability records</p>
          </div>
        </section>
        <Stack/>
        <Boundaries/>
        <section className="hv-close"><div className="hv-inner"><h2>Three core roles. One accountable investigation.</h2><p className="hv-sub">An orchestrator scopes the work, an evidence and context investigator gathers and compares, and a scientific verifier checks support and uncertainty. More agents are not a substitute for better evidence.</p><div className="sp-actions"><Link className="sp-button" to="/intelligence">Meet the Intelligence Collective <span aria-hidden="true">→</span></Link><Link to="/applications">Explore applications →</Link></div></div></section>
      </GraphSnapshotProvider>
    </div>
  );
}
