import {useEffect,useMemo} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import type {GapSignal} from "../../../src/knowledgeGraph/gapIndex";
import {SaveInvestigation} from "./SaveInvestigation";
import {selectionBrief,shortestPath} from "../../../src/knowledgeGraph/selectionBrief";

const pretty=(s:string)=>s.replaceAll("_"," ");
/** Concepts picked on the canvas, the route between two of them, and actions on the selection. Everything is read from the visible graph. */
export function SelectionTray({bundle,picked,setPicked,current,edges,gaps,depth,onExpand,onInspectEdge,onPath}:{bundle:DomainBundle;picked:string[];setPicked:(ids:string[])=>void;current:string;edges:{id:string;s:string;o:string;predicate:string;negated:boolean}[];gaps:GapSignal[];depth:number;onExpand:(id:string,depth:number)=>void;onInspectEdge:(id:string)=>void;onPath:(ids:Set<string>)=>void}){
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id;
 const path=useMemo(()=>picked.length===2?shortestPath(edges,picked[0]!,picked[1]!,4):undefined,[edges,picked]);
 const pathIds=useMemo(()=>new Set(path?path.map(p=>p.edgeId):[]),[path]);
 const pathKey=[...pathIds].join("|");
 useEffect(()=>{onPath(pathIds)},[pathKey]); // eslint-disable-line react-hooks/exhaustive-deps
 const edge=(id:string)=>edges.find(e=>e.id===id);
 const exportBrief=()=>{
  const md=selectionBrief(bundle,picked,{gapQuestions:gaps.map(g=>({id:g.id,question:g.question,entityIds:g.entityIds}))}),u=URL.createObjectURL(new Blob([md],{type:"text/markdown"})),a=document.createElement("a");
  a.href=u;a.download="hsi-research-brief.md";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
 };
 const question=picked.length>1?`What does the evidence say about the relationship between ${picked.map(name).join(", ")}, and in which contexts?`:`What does the evidence say about ${name(picked[0]??current)}, and in which contexts?`;
 return (
  <section className="st" aria-label="Selection">
   <div className="st-head"><h3>Selection ({picked.length})</h3><span className="st-hint">Shift-click concepts or shift-drag a box on the graph. Or add the inspected concept here.</span></div>
   <ul className="st-chips" aria-label="Selected concepts">{picked.map(id=><li key={id}><button type="button" aria-label={`Remove ${name(id)} from the selection`} onClick={()=>setPicked(picked.filter(x=>x!==id))}>{name(id)} ×</button></li>)}</ul>
   <div className="st-actions">
    <button type="button" disabled={picked.includes(current)} onClick={()=>setPicked([...picked,current])}>Add {name(current)}</button>
    <button type="button" disabled={!picked.length} onClick={()=>onExpand(picked[0]!,Math.min(3,depth+1))}>Expand neighbours</button>
    <button type="button" disabled={!picked.length} onClick={exportBrief}>Export evidence-linked brief</button>
    {picked.length>0&&<Link to={"/research/dashboard?q="+encodeURIComponent(question.slice(0,500))+"#dashboard-workspace"}>Investigate with live sources</Link>}
    <button type="button" disabled={!picked.length} onClick={()=>setPicked([])}>Clear</button>
   </div>
   {picked.length>0&&<SaveInvestigation question={question.slice(0,500)}/>}
   {picked.length===2&&path===null&&<p className="st-note" role="status">No route of up to four recorded relationships joins {name(picked[0]!)} and {name(picked[1]!)} in this view. That is a coverage limit of the view and its filters, not evidence they are unrelated.</p>}
   {path&&path.length>0&&<div role="status"><p className="st-note">Route of {path.length} recorded relationship{path.length===1?"":"s"}, highlighted on the graph. It is a path through unreviewed candidates, not evidence of a causal chain.</p>
    <ol className="st-path">{path.map(p=>{const e=edge(p.edgeId);return <li key={p.edgeId}><button type="button" onClick={()=>onInspectEdge(p.edgeId)}>{name(p.from)} {e?.negated?"(did not hold) ":""}{e?pretty(e.predicate):"to"} {name(p.to)}</button></li>})}</ol></div>}
  </section>
 );
}
