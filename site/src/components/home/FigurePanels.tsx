import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {loadDomainGraph} from "../../lib/claimGraphClient";
import {agentSummary,PIPELINE} from "../../lib/agentDashboard";

type Snapshot={concepts:number;relationships:number;gaps:{question:string;missing:string}[];sources:number;notRetrieved:number;reviewed:number;version:string};
const clip=(s:string,n=150)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;

/** Panels C to E and the caption of Figure 1. Every figure is read from the published, digest-verified snapshot or the capability records. */
export function FigurePanels(){
  const [s,setS]=useState<Snapshot|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const c=new AbortController();let active=true;const t=setTimeout(()=>c.abort(),12000);
    loadDomainGraph(null,c.signal).then(g=>{
      if(!active)return;
      setS({
        concepts:g.nodes.length,
        relationships:g.edges.filter(e=>e.kind==="source_candidate").length,
        gaps:g.gaps.map(x=>({question:x.question,missing:x.missing})),
        sources:g.sources.length,
        notRetrieved:g.sources.filter(x=>x.identityStatus==="bibliographic_candidate_not_retrieved").length,
        reviewed:g.edges.filter(e=>(e.reviewStatus as string)!=="unreviewed").length,
        version:g.version.slice(0,8),
      });
    }).catch(()=>{if(active)setFailed(true)}).finally(()=>clearTimeout(t));
    return()=>{active=false;c.abort();clearTimeout(t)};
  },[]);
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
