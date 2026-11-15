import {lazy,Suspense,useEffect,useMemo,useState} from "react";
import {useNavigate} from "react-router-dom";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import {loadDomainGraph} from "../../lib/claimGraphClient";
import "../../styles/obsidian-graph.css";

const PRESET={repel:.32,dist:.3,strength:.55,center:.55,size:1.15,text:.8,link:1.3} as const;
const Canvas=lazy(()=>import("../graph/ObsidianGraph").then(m=>({default:m.ObsidianGraph})));
/** The published graph, live and draggable, as the landing hero. Read-only: a click opens that concept in the explorer. */
export function LiveGraphHero(){
 const nav=useNavigate(),[b,setB]=useState<DomainBundle|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);loadDomainGraph(null,c.signal).then(setB).catch(()=>{if(!c.signal.aborted)setFailed(true)}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const data=useMemo(()=>{if(!b)return null;const cand=b.edges.filter(e=>e.kind==="source_candidate"),linked=new Set(cand.flatMap(e=>[e.subjectId,e.objectId]));return {nodes:b.nodes.filter(n=>linked.has(n.id)).map(n=>({id:n.id,label:n.name,kind:n.kind,domain:n.domains[0]??""})),edges:cand.map(e=>({id:e.id,s:e.subjectId,o:e.objectId,predicate:e.predicate,negated:e.negated,contextual:false,model:e.model})),il21:b.nodes.find(n=>n.name==="IL-21")?.id??""}},[b]);
 if(failed)return <div className="lg-wait" role="status">Snapshot unavailable. No substitute graph is shown.</div>;
 if(!data)return <div className="lg-wait" role="status">Verifying the published snapshot…</div>;
 return (
  <figure className="lg">
   <Suspense fallback={<div className="lg-wait" role="status">Loading the graph…</div>}>
    <Canvas showcase preset={PRESET} nodes={data.nodes} edges={data.edges} selected={data.il21} onSelect={id=>nav("/research/knowledge-graph?netScope=global&node="+encodeURIComponent(id))} onSelectEdge={()=>{}} caption={`Live from the published snapshot (version ${b!.version.slice(0,7)}): ${data.nodes.length} linked concepts of ${b!.nodes.length}, ${data.edges.length} candidate relationships. Drag, scroll to zoom, click a concept to open it. Every line is a candidate and unreviewed.`} exportName="hsi-landing-graph"/>
   </Suspense>
  </figure>
 );
}
