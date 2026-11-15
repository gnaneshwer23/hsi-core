import {useMemo} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {buildGapIndex,type GapSignal} from "../../../src/knowledgeGraph/gapIndex";
import {GapCard} from "./GapCard";

const pretty=(s:string)=>s.replaceAll("_"," ");
export function useGapIndex(bundle:DomainBundle|null):{gaps:GapSignal[];error:string}{
 return useMemo(()=>{if(!bundle)return {gaps:[],error:""};try{return {gaps:buildGapIndex(bundle),error:""}}catch(e){return {gaps:[],error:e instanceof Error?e.message:"The gap index could not be built."}}},[bundle]);
}
/** What the published graph says about one concept: connections by evidence model, findings that did not hold, gaps from the gap index, limits and next steps. */
export function NodeIntelligence({bundle,nodeId,gaps,gapError,onInspectEdge,onCompare,onSelectNode,onFocusGap}:{bundle:DomainBundle;nodeId:string;gaps:GapSignal[];gapError:string;onInspectEdge:(id:string)=>void;onCompare:(id:string)=>void;onSelectNode:(id:string)=>void;onFocusGap?:(g:GapSignal)=>void}){
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id,node=bundle.nodes.find(n=>n.id===nodeId);
 const edges=useMemo(()=>bundle.edges.filter(e=>e.kind==="source_candidate"&&(e.subjectId===nodeId||e.objectId===nodeId)),[bundle,nodeId]);
 const byModel=useMemo(()=>{const m=new Map<string,number>();for(const e of edges)m.set(e.model,(m.get(e.model)??0)+1);return [...m].sort((a,b)=>b[1]-a[1])},[edges]);
 const negated=edges.filter(e=>e.negated),human=edges.filter(e=>/^human/.test(e.model)).length;
 const mine=gaps.filter(g=>g.entityIds.includes(nodeId));
 const limits=[...new Set(edges.map(e=>e.limitations))].slice(0,3),sources=new Set(edges.map(e=>e.sourceId).filter(Boolean)).size;
 const other=(e:(typeof edges)[number])=>name(e.subjectId===nodeId?e.objectId:e.subjectId);
 const label=(e:(typeof edges)[number])=>`${name(e.subjectId)} ${e.negated?"does not ":""}${pretty(e.predicate)} ${name(e.objectId)}`;
 return (
  <section className="ni" aria-label="Entity intelligence">
   <h3>What the graph holds for {node?.name}</h3>
   <p className="ni-sum"><b>{edges.length}</b> recorded relationship{edges.length===1?"":"s"} from <b>{sources}</b> source record{sources===1?"":"s"} · <b>{human}</b> with human evidence · <b>{negated.length}</b> did not hold · <b>{mine.length}</b> gap{mine.length===1?"":"s"}. All candidates, none reviewed.</p>
   {edges.length>0&&<>
    <h4>Evidence by model</h4>
    <ul className="ni-chips" aria-label="Relationships by evidence model">{byModel.map(([m,n])=><li key={m}>{pretty(m)} <span>{n}</span></li>)}</ul>
    {human===0&&<p className="ni-warn">No human evidence is recorded for this concept in this snapshot.</p>}
    <details open={negated.length>0}><summary>Findings that did not hold ({negated.length})</summary>
     {negated.length===0?<p>None recorded. That reflects what was extracted, not agreement across studies.</p>:<ul className="ni-list">{negated.map(e=><li key={e.id}><button type="button" onClick={()=>onInspectEdge(e.id)}>{label(e)}</button><button type="button" className="ni-sub" onClick={()=>onCompare(e.id)}>Compare</button></li>)}</ul>}
    </details>
    <details><summary>All connections ({edges.length})</summary><ul className="ni-list">{edges.map(e=><li key={e.id}><button type="button" onClick={()=>onInspectEdge(e.id)}>{pretty(e.predicate)}: {other(e)}</button><small>{pretty(e.model)}{e.negated?" · did not hold":""}</small></li>)}</ul></details>
   </>}
   <h4>Research gaps</h4>
   {gapError&&<p className="ni-warn" role="alert">The gap index could not be built, so no gaps are shown: {gapError}</p>}
   {!gapError&&mine.length===0&&<p>No recorded gap names this concept. That is a coverage limit of the snapshot, not a finding.</p>}
   {mine.map(g=><GapCard key={g.id} gap={g} bundle={bundle} heading="h4" onInspectEdge={onInspectEdge} onSelectNode={onSelectNode} onFocus={onFocusGap?()=>onFocusGap(g):undefined}/>)}
   <h4>Limits</h4>
   <ul className="ni-limits"><li>No relationship in this snapshot is scientifically reviewed and confidence is not calibrated.</li>{limits.map(l=><li key={l}>{l}</li>)}</ul>
   <h4>Follow up</h4>
   <div className="gc-actions">
    <Link to={"/research/dashboard?q="+encodeURIComponent(`What does the evidence say about ${node?.name}, and in which contexts?`)+"#dashboard-workspace"}>Investigate with live sources</Link>
    <Link to="/research/gaps">Open the Gap Register</Link>
    <Link to="/research/methods">Compare research methods</Link>
   </div>
  </section>
 );
}
