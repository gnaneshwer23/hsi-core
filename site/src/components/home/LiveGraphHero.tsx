import {lazy,Suspense,useId,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {useSharedBundle} from "../../lib/useSharedBundle";
import {OG_PALETTE} from "../graph/palette";
import "../../styles/obsidian-graph.css";

const PRESET={repel:.32,dist:.3,strength:.55,center:.55,size:1.15,text:.8,link:1.3} as const;
const Canvas=lazy(()=>import("../graph/ObsidianGraph").then(m=>({default:m.ObsidianGraph})));
const HUMAN=/^human/,pretty=(s:string)=>s.replaceAll("_"," ");
/** The published graph, live, with filters and a selection panel on the page. Read-only: nothing is saved, nothing is preselected. */
export function LiveGraphHero(){
 const {bundle:b,failed}=useSharedBundle();
 const [dept,setDept]=useState<string[]>([]),[humanOnly,setHumanOnly]=useState(false),[neg,setNeg]=useState(true),[q,setQ]=useState(""),[sel,setSel]=useState<string|null>(null);
 const qid=useId();
 const all=useMemo(()=>{
  if(!b)return null;
  const cand=b.edges.filter(e=>e.kind==="source_candidate"),linked=new Set(cand.flatMap(e=>[e.subjectId,e.objectId]));
  const nodes=b.nodes.filter(n=>linked.has(n.id)),count=new Map<string,number>();
  for(const n of nodes)count.set(n.domains[0]??"untagged",(count.get(n.domains[0]??"untagged")??0)+1);
  const groups=[...count].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0])),colors=Object.fromEntries(groups.map(([g],i)=>[g,OG_PALETTE[i%OG_PALETTE.length]!]));
  return {cand,nodes,groups,colors,name:new Map(b.nodes.map(n=>[n.id,n.name]))};
 },[b]);
 const view=useMemo(()=>{
  if(!all)return null;
  const okEdge=all.cand.filter(e=>(!humanOnly||HUMAN.test(e.model))&&(neg||!e.negated));
  const okNode=(id:string)=>{const n=all.nodes.find(x=>x.id===id);return !!n&&(!dept.length||dept.includes(n.domains[0]??"untagged"))};
  const edges=okEdge.filter(e=>okNode(e.subjectId)&&okNode(e.objectId));
  const linked=new Set(edges.flatMap(e=>[e.subjectId,e.objectId]));
  const nodes=all.nodes.filter(n=>linked.has(n.id)&&okNode(n.id));
  return {nodes:nodes.map(n=>({id:n.id,label:n.name,kind:n.kind,domain:n.domains[0]??""})),edges:edges.map(e=>({id:e.id,s:e.subjectId,o:e.objectId,predicate:e.predicate,negated:e.negated,contextual:false,model:e.model}))};
 },[all,dept,humanOnly,neg]);
 const hits=useMemo(()=>{
  const t=q.trim().toLowerCase();if(!all||t.length<2)return [];
  const rank=(n:{name:string;aliases:string[]})=>{const names=[n.name,...n.aliases].map(x=>x.toLowerCase());return names.some(x=>x===t)?0:names.some(x=>x.startsWith(t))?1:names.some(x=>x.split(/[\s/()-]+/).some(w=>w===t))?2:3};
  return all.nodes.filter(n=>[n.name,...n.aliases].some(x=>x.toLowerCase().includes(t))).sort((a,b)=>rank(a)-rank(b)||a.name.length-b.name.length||a.name.localeCompare(b.name)).slice(0,6);
 },[all,q]);
 const match=useMemo(()=>q.trim().length>1&&view?new Set(view.nodes.filter(n=>n.label.toLowerCase().includes(q.trim().toLowerCase())).map(n=>n.id)):undefined,[view,q]);
 const node=sel&&b?b.nodes.find(n=>n.id===sel):null;
 const rels=node&&all?all.cand.filter(e=>e.subjectId===node.id||e.objectId===node.id):[];
 const filtered=dept.length>0||humanOnly||!neg;
  const chrome=(
   <div className="lg-chrome">
    <span className="lg-chrome-dots" aria-hidden="true"><i/><i/><i/></span>
    <span className="lg-chrome-title">Published knowledge graph</span>
    <span className="lg-chrome-badge">Live snapshot · candidate-only · unreviewed</span>
   </div>
  );
  if(failed)return <figure className="lg">{chrome}<div className="lg-wait" role="status">Snapshot unavailable. No substitute graph is shown.</div></figure>;
  if(!all||!view)return <figure className="lg">{chrome}<div className="lg-wait lg-load" role="status">Verifying the published snapshot…</div></figure>;
  return (
   <figure className="lg">
    {chrome}
    {view.nodes.length===0?<div className="lg-wait" role="status">No relationships match these filters. That is a filter result, not evidence of absence.</div>:
    <Suspense fallback={<div className="lg-wait lg-load" role="status">Loading the graph…</div>}>
     <Canvas showcase preset={PRESET} groupColors={all.colors} nodes={view.nodes} edges={view.edges} selected={sel??""} highlight={match} onSelect={id=>setSel(s=>s===id?null:id)} onSelectEdge={()=>{}} caption={`Live from the published snapshot (version ${b!.version.slice(0,7)}): showing ${view.nodes.length} of ${b!.nodes.length} concepts and ${view.edges.length} of ${all.cand.length} candidate relationships. Drag a concept, use the zoom buttons or Ctrl or ⌘ with scroll, click to select. Every line is a candidate and unreviewed.`} exportName="hsi-landing-graph"/>
    </Suspense>}
    <div className="lg-filters">
     <div className="lg-search">
      <label htmlFor={qid}>Find a concept</label>
      <input id={qid} type="search" value={q} maxLength={60} placeholder="e.g. IL-21, butyrate, B cell" onChange={e=>setQ(e.target.value)}/>
      {hits.length>0&&<ul className="lg-hits" aria-label="Matching concepts">{hits.map(h=><li key={h.id}><button type="button" onClick={()=>{setSel(h.id);setQ("");setDept([]);setHumanOnly(false);setNeg(true)}}>{h.name}</button></li>)}</ul>}
     </div>
     <ul className="lg-chips" aria-label="Filter by department">
      {all.groups.map(([g,n])=><li key={g}><button type="button" aria-pressed={dept.includes(g)} onClick={()=>setDept(d=>d.includes(g)?d.filter(x=>x!==g):[...d,g])}><i style={{background:all.colors[g]}} aria-hidden="true"/>{pretty(g)} <span>{n}</span></button></li>)}
      <li><button type="button" aria-pressed={humanOnly} onClick={()=>setHumanOnly(v=>!v)}>Human evidence only</button></li>
      <li><button type="button" aria-pressed={!neg} onClick={()=>setNeg(v=>!v)}>Hide findings that did not hold</button></li>
      {(filtered||sel)&&<li><button type="button" className="lg-reset" onClick={()=>{setDept([]);setHumanOnly(false);setNeg(true);setSel(null);setQ("")}}>Reset</button></li>}
     </ul>
    </div>
    <aside className="lg-panel" aria-label="Selected concept" aria-live="polite">
     {node?<>
      <h3>{node.name}</h3>
      <p className="lg-meta">{pretty(node.kind)} · {node.domains.map(pretty).join(", ")||"no department"} · {rels.length} recorded relationship{rels.length===1?"":"s"}</p>
      <ul>{rels.slice(0,5).map(e=><li key={e.id}><span>{all.name.get(e.subjectId)} {e.negated?"did not ":""}{pretty(e.predicate)} {all.name.get(e.objectId)}</span><small>{pretty(e.model)} · {e.sourceId??"no source"} · unreviewed</small></li>)}</ul>
      {rels.length>5&&<p className="lg-meta">And {rels.length-5} more in the explorer.</p>}
      <Link to={"/research/knowledge-graph?netScope=global&node="+encodeURIComponent(node.id)}>Open in the explorer</Link>
     </>:<p className="lg-meta">Select a concept to see its relationships, evidence models and sources. Use the filters to narrow the graph.</p>}
    </aside>
   </figure>
  );
}
