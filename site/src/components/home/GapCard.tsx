import {Link} from "react-router-dom";
import {Icon} from "./AppIcons";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import type {Profile} from "../../lib/researchHome";
import {useGaps} from "../../lib/useGaps";
import type {Signal} from "../../lib/gapFinder";
import {LIVE_INVESTIGATION_PATH} from "../../lib/workbenchPrimary";

const SIG:Record<Signal,string>={under_explored:"Under-explored intersection",well_covered:"Well covered",low_volume:"Too little literature to judge",unavailable:"Count unavailable"};
const n=(x:number|null)=>x===null?"n/a":x.toLocaleString("en-GB");
const ask=(_a:string,_b:string)=>LIVE_INVESTIGATION_PATH;
const graph=(q:string)=>"/research/knowledge-graph?netQuery="+encodeURIComponent(q);

/** Gap finder: gaps recorded in the published graph, and an under-explored-intersection heuristic from literature counts. The two are kept apart. */
export function GapCard({profile,bundle}:{profile:Profile;bundle:DomainBundle|null}){
 const {topics,recorded,plan,state,find}=useGaps(profile,bundle);
 const canCount=plan.pairs.length>0;
 return (
  <section className="rh-card rh-wide rh-gaps" id="rh-gaps" aria-labelledby="rh-gaps-h">
   <header className="rh-card-top"><span className="rh-tile rh-t-violet"><Icon name="graph" size={22}/></span>
    <div><h2 id="rh-gaps-h">Gap finder</h2><p className="rh-sub">{topics.length?`For ${topics.join(", ")}`:"Where your topics are under-studied."}</p></div>
    {canCount&&<div className="rh-radar-tools"><button type="button" className="rh-primary" onClick={()=>void find(state.status==="ready")} disabled={state.status==="loading"}>{state.status==="loading"?"Counting…":state.status==="ready"?"Refresh counts":"Find gaps"}</button></div>}
   </header>
   {!topics.length&&<div className="rh-radar-empty"><p>Add a topic, gene or disease and the gap finder shows gaps recorded in the graph and where the literature is thin.</p><Link className="rh-primary" to="/welcome">Add topics</Link></div>}

   {topics.length>0&&<>
    <div className="rh-gsec"><h3>Recorded in the published graph <span className="rh-chip">Editorial candidate</span></h3>
     {recorded.length===0?<p className="rh-empty">{bundle?"No recorded gap touches your topics.":"Loading the published graph…"}</p>:<ul className="rh-glist">{recorded.map(g=>(
      <li key={g.id}><b>{g.question}</b><span>Missing: {g.missing}</span><small>A possible next study: {g.nextStudy}</small>
       <div className="rh-row"><Link to={graph(g.subject)}>Open in graph</Link><Link to={ask(g.subject,g.object)}>Investigate</Link></div></li>))}</ul>}
    </div>

    <div className="rh-gsec"><h3>Under-explored intersections <span className="rh-chip">Heuristic</span></h3>
     {!canCount&&<p className="rh-empty">Add a second topic, or a topic that matches a graph concept, to compare intersections.</p>}
     {canCount&&state.status==="idle"&&<p className="rh-empty">{plan.pairs.length} pairs ready to count. This asks Europe PMC how often each pair is mentioned together in titles and abstracts.</p>}
     <div role="status" aria-live="polite">{state.status==="error"&&<p className="rh-err" role="alert">{state.error} Nothing was counted, so no gap is implied.</p>}</div>
     {state.status==="ready"&&<ul className="rh-grows">{state.rows.map(r=>{
      const pct=r.share===null?0:Math.min(100,Math.max(r.share>0?2:0,r.share*100*8));
      return <li key={r.a+"|"+r.b} data-signal={r.signal}>
       <div className="rh-gtop"><b>{r.a} × {r.b}</b><span className="rh-sig" data-signal={r.signal}>{SIG[r.signal]}</span></div>
       {r.signal!=="unavailable"?<div className="rh-gbar" role="img" aria-label={`${n(r.joint)} records mention both, ${r.share===null?"":(r.share*100).toFixed(1)+"% of the smaller topic"}`}><i style={{width:pct+"%"}}/></div>:<p className="rh-note">{r.error}</p>}
       <details><summary>Counts and how to check</summary>
        <dl><dt>Mention both</dt><dd>{n(r.joint)}</dd><dt>Mention {r.a}</dt><dd>{n(r.countA)}</dd><dt>Mention {r.b}</dt><dd>{n(r.countB)}</dd>{r.share!==null&&<><dt>Share of the smaller topic</dt><dd>{(r.share*100).toFixed(1)}%</dd></>}</dl>
        <p className="rh-note"><a href={r.queryUrl} target="_blank" rel="noreferrer noopener">Check this search on Europe PMC</a> · <Link to={ask(r.a,r.b)}>Investigate this pair</Link></p></details></li>})}</ul>}
     {state.status==="ready"&&<p className="rh-note">{state.note} Updated {state.at?.slice(0,10)}{state.fromCache?" (saved on this device)":""}. Under-explored means at least 150 records on each side and under 3% overlap. It is a prompt to look, not a finding.</p>}
    </div>
   </>}
  </section>
 );
}
