import {useEffect,useId,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {EMPTY_TREE_FILTERS,HSI_DOMAINS,buildDomainTree,type GraphModel,type HsiDomain,type TreeConcept,type TreeFilters} from "../../../src/graphWorkspace";
import "./tree.css";

type Props={
 model:GraphModel;
 /** In the workspace: select in place. On public pages: link into the workspace. */
 onSelectConcept?:(id:string)=>void;onSelectRelationship?:(id:string)=>void;
 /** Heading level for domain names, so the tree fits the page outline. */
 level?:2|3;
};

/** Loads unreviewed type proposals for grouping, only when they were made against this graph version. */
function useProposals(version:string){
 const [m,setM]=useState<ReadonlyMap<string,string>|undefined>();
 useEffect(()=>{let live=true;import("./ontologyData").then(d=>{if(live&&d.TYPES.mappedAgainst===version)setM(new Map(d.TYPES.proposals.map(p=>[p.conceptId,p.proposedType])))},()=>{});return()=>{live=false}},[version]);
 return m;
}

/**
 * The published graph as a tree: six domains, concept types, concepts, then each concept's relationships with
 * their studies. Search and filters apply to every level. A readable alternative to the network view.
 */
export function GraphTree({model,onSelectConcept,onSelectRelationship,level=2}:Props){
 const [f,setF]=useState<TreeFilters>(EMPTY_TREE_FILTERS);
 const proposals=useProposals(model.version);
 const tree=useMemo(()=>buildDomainTree(model,f,proposals),[model,f,proposals]);
 const all=useMemo(()=>buildDomainTree(model,{...f,domains:[]},proposals),[model,f,proposals]);
 const sid=useId();
 const H=(level===2?"h2":"h3") as "h2";
 const open=f.query.trim().length>1;
 const toggle=(d:HsiDomain)=>setF({...f,domains:f.domains.includes(d)?f.domains.filter(x=>x!==d):[...f.domains,d]});
 const concept=(c:TreeConcept)=>onSelectConcept
  ?<button type="button" className="gt-link" onClick={()=>onSelectConcept(c.id)}>Inspect this concept</button>
  :<Link className="gt-link" to={`/workspace/graph?q=${encodeURIComponent(c.name)}`}>Open {c.name} in the explorer</Link>;

 return (
  <div className="gt">
   <div className="gt-bar" role="search">
    <label htmlFor={sid} className="gt-label">Search the graph</label>
    <input id={sid} type="search" value={f.query} placeholder="IL-21, butyrate, microglia" onChange={e=>setF({...f,query:e.target.value.slice(0,120)})}/>
    <div className="gt-chips" role="group" aria-label="Domains">
     {HSI_DOMAINS.map(d=>{const n=all.domains.find(x=>x.key===d.key)?.concepts??0;return <button key={d.key} type="button" aria-pressed={f.domains.includes(d.key)} onClick={()=>toggle(d.key)}>{d.label} <span>{n}</span></button>})}
    </div>
    <div className="gt-opts">
     <label><input type="checkbox" checked={f.humanOnly} onChange={e=>setF({...f,humanOnly:e.target.checked})}/> Human evidence only</label>
     <label><input type="checkbox" checked={f.hideNegated} onChange={e=>setF({...f,hideNegated:e.target.checked})}/> Hide findings recorded as not holding</label>
     {tree.filtered&&<button type="button" className="gt-reset" onClick={()=>setF(EMPTY_TREE_FILTERS)}>Clear filters</button>}
    </div>
   </div>
   <p className="gt-sum" role="status">{tree.totals.concepts} concepts and {tree.totals.relationships} relationships{tree.filtered?" match":""}. Every relationship is a candidate and unreviewed.</p>
   {tree.totals.concepts===0?<p className="gt-empty">Nothing matches. This is a filter result, not a statement that the graph lacks it.</p>:
   <ul className="gt-tree">
    {tree.domains.filter(d=>!f.domains.length||d.concepts>0).map(d=>(
     <li key={d.key}>
      <details open={open||f.domains.length>0||undefined}>
       <summary><H className="gt-d">{d.label}</H><span className="gt-n">{d.concepts?`${d.concepts} concepts · ${d.relationships} relationships`:"Nothing recorded yet"}</span></summary>
       {d.types.length>0&&<ul>{d.types.map(t=>(
        <li key={t.kind}>
         <details open={open||undefined}>
          <summary><span className="gt-t">{t.label}</span>{t.proposed&&<span className="gt-p">proposed</span>}<span className="gt-n">{t.concepts.length}</span></summary>
          <ul>{t.concepts.map(c=>(
           <li key={c.id}>
            <details open={(open&&c.matched)||undefined}>
             <summary><span className="gt-c">{c.name}</span><span className="gt-n">{c.relationships.length}{c.domainCount>1?` · in ${c.domainCount} domains`:""}</span></summary>
             <div className="gt-body">
              <p>{concept(c)}</p>
              <ul className="gt-rels">{c.relationships.map(r=>(
               <li key={r.id+r.direction}>
                <span>{r.direction==="out"?<>{r.reportedAs} <b>{r.otherName}</b></>:<><b>{r.otherName}</b> {r.reportedAs} {c.name}</>}{r.negated?" (recorded as not holding)":""}</span>
                <small>{r.species??"Species not stated"} · {r.pmid?`PMID ${r.pmid.replace(/^pmid:/i,"")}`:r.doi?`DOI ${r.doi}`:"No identifier recorded"} · candidate{onSelectRelationship&&<> · <button type="button" className="gt-link" onClick={()=>onSelectRelationship(r.id)}>Inspect</button></>}</small>
               </li>))}</ul>
             </div>
            </details>
           </li>))}</ul>
         </details>
        </li>))}</ul>}
      </details>
     </li>))}
   </ul>}
   {proposals&&<p className="gt-note">Groups marked “proposed” come from an unreviewed, rule-based type proposal for concepts the graph records only as “biological concept”. They do not change any concept.</p>}
  </div>
 );
}
