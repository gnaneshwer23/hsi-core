import {Link} from "react-router-dom";
import {agentSummary,PIPELINE} from "../../lib/agentDashboard";
import {useGraphSnapshot} from "./useGraphSnapshot";

const clip=(s:string,n=150)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;

/** Panels C to E and the caption of Figure 1. Every figure is read from the published, digest-verified snapshot or the capability records. */
export function FigurePanels(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const a=agentSummary();
  const fmt=(n:number)=>n.toLocaleString("en-GB");
  return (
    <>
      <div className="fg-panels">
        <section aria-labelledby="fg-c">
          <span className="fg-letter" aria-hidden="true">C</span>
          <h3 id="fg-c">Missing evidence</h3>
          {s?(
            <>
              <p className="fg-big"><b>{fmt(s.gaps.length)}</b> named gaps</p>
              <ul>{s.gaps.slice(0,2).map(g=><li key={g.question}>{clip(g.missing)}</li>)}</ul>
            </>
          ):<p className="fg-wait">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"}</p>}
          <Link to="/research/knowledge-graph">Inspect the claims and gaps →</Link>
        </section>
        <section aria-labelledby="fg-d">
          <span className="fg-letter" aria-hidden="true">D</span>
          <h3 id="fg-d">Agents around the graph</h3>
          <p className="fg-big"><b>{a.capabilities}</b> capabilities, <b>{a.liveRuns}</b> live runs</p>
          <p>Designed order: {PIPELINE.join(", ").toLowerCase()}. None approves anything. {a.independentlyAccepted} are independently accepted; {a.disabled} model step is disabled.</p>
          <Link to="/intelligence">See each capability's status →</Link>
        </section>
        <section aria-labelledby="fg-e">
          <span className="fg-letter" aria-hidden="true">E</span>
          <h3 id="fg-e">Review status</h3>
          {s?(
            <>
              <p className="fg-big"><b>{fmt(s.reviewed)}</b> of {fmt(s.relationships)} reviewed</p>
              <p>{fmt(s.notRetrieved)} of {fmt(s.sources)} sources are bibliographic records, not retrieved passages. Scientific approval: none.</p>
            </>
          ):<p className="fg-wait">{failed?"Unavailable.":"Verifying snapshot…"}</p>}
          <Link to="/trust">How review and approval stay separate →</Link>
        </section>
      </div>
      <figcaption id="fg-cap" className="fg-cap">
        <b>Figure 1.</b> The HSI knowledge graph{s?`, published snapshot ${s.version}: ${fmt(s.concepts)} concepts and ${fmt(s.relationships)} candidate relationships`:""}. Panel A is the live graph, panel B the evidence behind the selected relationship, panels C to E summarise the same snapshot and the agent records. Every relationship is unreviewed and layout is not biology. Research preview; no clinical advice.
      </figcaption>
    </>
  );
}
