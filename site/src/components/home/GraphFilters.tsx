import {useId,useMemo,useState} from "react";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import {facets,isFiltered,NO_FILTER,type GraphFilter,type ProgramView} from "../../lib/program";
import {searchEntities} from "../../lib/researchHome";

const label=(s:string)=>s.replaceAll("_"," ");
type Key="kinds"|"domains"|"models"|"conditions";
const GROUPS:{key:Key;title:string;note:string}[]=[
 {key:"kinds",title:"Concept types",note:"Genes, cells, diseases and so on."},
 {key:"domains",title:"Department",note:"The area of biology a concept is tagged to."},
 {key:"models",title:"Evidence model",note:"What the recorded relationship was studied in."},
 {key:"conditions",title:"Condition",note:"The disease a relationship is recorded for."},
];
/** Choose what appears in your graph. Nothing selected means everything in your neighbourhood. Filters narrow the picture; they never change the record. */
export function GraphFilters({bundle,base,f,setF}:{bundle:DomainBundle;base:ProgramView;f:GraphFilter;setF:(f:GraphFilter)=>void}){
 const [open,setOpen]=useState(false),[q,setQ]=useState(""),id=useId();
 const fac=useMemo(()=>facets(bundle,base),[bundle,base]);
 const hits=useMemo(()=>q.trim().length>1?searchEntities(bundle.nodes,q,6):[],[bundle,q]);
 const names=new Map(bundle.nodes.map(n=>[n.id,n.name]));
 const toggle=(k:Key,v:string)=>setF({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]});
 const active=(["kinds","domains","models","conditions"] as Key[]).reduce((n,k)=>n+f[k].length,0)+(f.negated?0:1)+f.extra.length;
 return (
  <section className="pgf" aria-label="Graph filters">
   <div className="pgf-bar">
    <button type="button" className="pgf-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(o=>!o)}>Filters{active?` (${active})`:""}</button>
    <ul className="pgf-active" aria-label="Active filters">
     {f.extra.map(x=><li key={x}><button type="button" aria-label={`Remove added concept ${names.get(x)}`} onClick={()=>setF({...f,extra:f.extra.filter(y=>y!==x)})}>+ {names.get(x)} ×</button></li>)}
     {(["kinds","domains","models","conditions"] as Key[]).flatMap(k=>f[k].map(v=><li key={k+v}><button type="button" aria-label={`Remove filter ${label(v)}`} onClick={()=>toggle(k,v)}>{label(v)} ×</button></li>))}
     {!f.negated&&<li><button type="button" aria-label="Show relationships reported not to hold again" onClick={()=>setF({...f,negated:true})}>Without negated ×</button></li>}
    </ul>
    {isFiltered(f)||f.extra.length>0?<button type="button" className="pgf-reset" onClick={()=>setF(NO_FILTER)}>Reset</button>:null}
   </div>
   {open&&<div className="pgf-panel" id={id}>
    <div className="pgf-group">
     <h3>Add a concept to your view</h3>
     <label className="rh-vh" htmlFor={id+"-q"}>Find a concept in the published graph</label>
     <input id={id+"-q"} className="pgf-search" value={q} maxLength={80} onChange={e=>setQ(e.target.value)} placeholder="Type a gene, cell, drug or disease"/>
     {hits.length>0&&<ul className="pgf-hits">{hits.map(h=><li key={h.id}><button type="button" onClick={()=>{if(!f.extra.includes(h.id)&&!base.anchors.some(a=>a.id===h.id))setF({...f,extra:[...f.extra,h.id]});setQ("")}}>{h.name}<small>{h.kind}</small></button></li>)}</ul>}
     {q.trim().length>1&&hits.length===0&&<p className="pgf-note" role="status">No concept matches. A search miss, not evidence of absence.</p>}
    </div>
    {GROUPS.map(g=>fac[g.key].length>1||f[g.key].length>0?(
     <fieldset className="pgf-group" key={g.key}>
      <legend>{g.title}</legend>
      <div className="pgf-chips">{fac[g.key].map(([v,n])=><button key={v} type="button" aria-pressed={f[g.key].includes(v)} onClick={()=>toggle(g.key,v)}>{label(v)} <span>{n}</span></button>)}</div>
      <p className="pgf-note">{g.note} None selected shows all.</p>
     </fieldset>):null)}
    <fieldset className="pgf-group">
     <legend>Findings that did not hold</legend>
     <label className="pr-check"><input type="checkbox" checked={f.negated} onChange={e=>setF({...f,negated:e.target.checked})}/> Include relationships recorded as negated ({fac.negated})</label>
    </fieldset>
   </div>}
  </section>
 );
}
