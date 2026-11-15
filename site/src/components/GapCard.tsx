import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import type {GapSignal} from "../../../src/knowledgeGraph/gapIndex";

const pretty=(s:string)=>s.replaceAll("_"," ");
const FIELD:Record<string,string>={tissue:"tissue",population:"population",assay:"assay",timepoint:"timepoint",intervention:"intervention",outcome:"outcome"};
/** One research gap from the gap index, with its evidence and what to do next. Everything is read from the published graph; nothing is generated. */
export function GapCard({gap,bundle,onInspectEdge,onSelectNode,onFocus,heading="h3"}:{gap:GapSignal;bundle:DomainBundle;onInspectEdge:(id:string)=>void;onSelectNode:(id:string)=>void;onFocus?:()=>void;heading?:"h3"|"h4"}){
 const H=heading,name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id,edge=(id:string)=>bundle.edges.find(e=>e.id===id);
 const touching=gap.touchingCandidateEdgeIds.filter(id=>!gap.supportingCandidateEdgeIds.includes(id));
 const label=(id:string)=>{const e=edge(id);return e?`${name(e.subjectId)} ${e.negated?"does not ":""}${pretty(e.predicate)} ${name(e.objectId)}`:id};
 const src=gap.sourceIds.map(id=>bundle.sources.find(s=>s.id===id)).filter((s):s is NonNullable<typeof s>=>!!s);
 const [a,b]=gap.entityIds;
 return (
  <article className="gc" aria-label={`Research gap: ${gap.question}`}>
   <H>{gap.question}</H>
   <p className="gc-badges"><span>Unreviewed research gap</span><span>Graph coverage gap</span><span>Triage {gap.priorityScore} of 100</span></p>
   <p className="gc-note">A coverage gap means this snapshot lacks the evidence. It does not show the literature lacks it: a bounded live search is the next check. The triage number only orders gaps; it is not importance or confidence, and no clinical decision follows from it.</p>
   <p className="gc-ents"><button type="button" onClick={()=>onSelectNode(a)}>{name(a)}</button><span aria-hidden="true">↔</span><button type="button" onClick={()=>onSelectNode(b)}>{name(b)}</button></p>
   <dl>
    <dt>Missing</dt><dd>{gap.missingEvidence}</dd>
    <dt>Possible next study</dt><dd>{gap.nextStudy}</dd>
    {gap.conditions.length>0&&<><dt>Conditions</dt><dd>{gap.conditions.join(", ")}</dd></>}
    <dt>Why it ranks here</dt><dd><ul>{gap.reasons.map(r=><li key={r}>{r}</li>)}</ul></dd>
    <dt>Context still unresolved</dt><dd>{gap.unresolvedContextFields.length?gap.unresolvedContextFields.map(f=><span key={f} className="gc-chip">{FIELD[f]??f}</span>):"None"}</dd>
   </dl>
   <h4>Evidence in this snapshot</h4>
   {gap.supportingCandidateEdgeIds.length===0?<p>No relationship directly connects these two concepts.</p>:<ul className="gc-list">{gap.supportingCandidateEdgeIds.map(id=><li key={id}><button type="button" onClick={()=>onInspectEdge(id)}>Inspect: {label(id)}</button></li>)}</ul>}
   {touching.length>0&&<details><summary>{touching.length} relationship{touching.length===1?"":"s"} touch either concept</summary><ul className="gc-list">{touching.slice(0,12).map(id=><li key={id}><button type="button" onClick={()=>onInspectEdge(id)}>{label(id)}</button></li>)}</ul></details>}
   {src.length>0&&<details><summary>{src.length} source record{src.length===1?"":"s"} (identity not verified)</summary><ul className="gc-list">{src.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <small>{s.pmid?`PMID ${s.pmid}`:s.doi?`DOI ${s.doi}`:"no identifier recorded"}</small></li>)}</ul></details>}
   <div className="gc-actions">
    {onFocus&&<button type="button" onClick={onFocus}>Show on the graph</button>}
    <Link to={"/research/dashboard?q="+encodeURIComponent(`What does the evidence say about the relationship between ${name(a)} and ${name(b)}, and in which contexts?`)+"#dashboard-workspace"}>Investigate with live sources</Link>
    <Link to="/research/gaps">Open in the Gap Register</Link>
   </div>
  </article>
 );
}
