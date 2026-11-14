import {useMemo,useState} from "react";
import type {DomainBundle,DomainEdge} from "../../../src/knowledgeGraph/domainGraph";
import {DEPARTMENT_SLUGS,crossDepartmentPaths,departmentCoverage,projectDepartment,verifyPathReconstruction,type CrossDepartmentPath,type DepartmentSlug} from "../../../src/knowledgeGraph/departments";
import {departmentBySlug} from "../lib/departments";
import "../styles/department-lens.css";

const pretty=(s:string)=>s.replaceAll("_"," ");
const MODEL_LABEL:Record<string,string>={human_in_vivo:"Human participants",human_ex_vivo:"Human cells (ex vivo)",human_cell_line:"Human cell line",mouse:"Mouse",rodent:"Rodent",mixed:"Mixed models",unspecified:"Model not specified"};
function download(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

/** The relationship dossier: everything the graph records about one edge, with its limits stated, not implied. */
function Dossier({bundle,edge,onClose}:{bundle:DomainBundle;edge:DomainEdge;onClose:()=>void}){
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id,source=bundle.sources.find(s=>s.id===edge.sourceId);
 const others=bundle.edges.filter(e=>e.id!==edge.id&&((e.subjectId===edge.subjectId&&e.objectId===edge.objectId)||(e.subjectId===edge.objectId&&e.objectId===edge.subjectId)));
 return <section className="dl-dossier" aria-label="Relationship dossier">
  <div className="dl-dossier-head"><div><p className="dl-kicker">RELATIONSHIP DOSSIER</p><h3>{name(edge.subjectId)} <span aria-hidden="true">→</span><span className="dl-sr"> to </span> {name(edge.objectId)}</h3></div><button className="dl-btn" onClick={onClose}>Close dossier</button></div>
  <p className="dl-assertion">{edge.assertion}</p>
  <dl className="dl-facts">
   <div><dt>Recorded as</dt><dd>{edge.kind==="research_gap"?"Unresolved research connection (a question, not evidence)":"Source-linked candidate"}</dd></div>
   <div><dt>Predicate</dt><dd>{pretty(edge.predicate)}{edge.negated?" (negative finding)":""}</dd></div>
   <div><dt>Study model</dt><dd>{MODEL_LABEL[edge.model]??edge.model}</dd></div>
   <div><dt>Design</dt><dd>{edge.design}</dd></div>
   <div><dt>Tissue</dt><dd>{edge.tissue??"Not reported"}</dd></div>
   <div><dt>Population</dt><dd>{edge.population??"Not reported"}</dd></div>
   <div><dt>Assay</dt><dd>{edge.assay??"Not reported"}</dd></div>
   <div><dt>Intervention and outcome</dt><dd>{[edge.intervention,edge.outcome].filter(Boolean).join(" → ")||"Not reported"}</dd></div>
   <div><dt>Disease contexts</dt><dd>{edge.conditions.length?edge.conditions.join(", "):"None recorded"}</dd></div>
   <div><dt>Limitations</dt><dd>{edge.limitations||"None recorded"}</dd></div>
  </dl>
  {edge.scopeWarnings.length>0&&<><h4>Scope warnings</h4><ul>{edge.scopeWarnings.map(w=><li key={w}>{w}</li>)}</ul></>}
  <h4>Source</h4>
  {source?<p><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><br/>{source.pmid?`PMID ${source.pmid}`:source.doi} · {pretty(source.identityStatus)} · rights {pretty(source.rights)}</p>:<p>No source record is attached. This is a recorded question, not a finding.</p>}
  <h4>Review and uncertainty</h4>
  <ul className="dl-status"><li>Review status: <strong>Unreviewed</strong></li><li>Confidence: <strong>Not calibrated</strong></li><li>Scientific claim: <strong>Not allowed</strong></li><li>Context: {pretty(edge.contextStatus)}</li></ul>
  <h4>Other records for this pair</h4>
  {others.length?<ul>{others.map(o=><li key={o.id}><strong>{o.id}</strong>: {pretty(o.predicate)}{o.negated?" — negative finding":""} · {MODEL_LABEL[o.model]??o.model} · {o.kind==="research_gap"?"unresolved gap":"source candidate"}</li>)}</ul>:<p>No other record for this pair. Absence of a record is not evidence of absence.</p>}
 </section>;
}

function PathCard({bundle,path,index,onInspect}:{bundle:DomainBundle;path:CrossDepartmentPath;index:number;onInspect:(edgeId:string)=>void}){
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id,ok=verifyPathReconstruction(bundle,path);
 const supported=path.boundaries.length===0;
 return <article className="dl-path" aria-label={`Path ${index+1}`}>
  <header><h3>Path {index+1} · {path.hops.length} {path.hops.length===1?"hop":"hops"}</h3>
   <p className={supported?"dl-chip":"dl-chip dl-chip-stop"}>{supported?"Candidate evidence at every hop":`Evidence stops at hop ${path.boundaries.join(", ")}`}</p></header>
  <ol className="dl-hops">{path.hops.map((h,i)=><li key={h.edgeId} className={h.evidenceStops?"dl-hop dl-hop-stop":"dl-hop"}>
   <p><strong>{name(h.fromId)}</strong> <span aria-hidden="true">{h.direction==="forward"?"→":"←"}</span><span className="dl-sr">{h.direction==="forward"?" leads to ":" is read in reverse from "}</span> <strong>{name(h.toId)}</strong></p>
   <p className="dl-meta">{pretty(h.predicate)}{h.direction==="reverse"?" (read in reverse)":""} · {MODEL_LABEL[h.model]??h.model}{h.tissue?` · ${h.tissue}`:""}{h.conditions.length?` · ${h.conditions.slice(0,2).join(", ")}`:""}</p>
   {h.evidenceStops&&<p className="dl-stop"><span aria-hidden="true">■ </span>Evidence stops here: {h.evidence==="research_gap"?"an unresolved research gap, not a finding":h.negated?"a negative finding":"no source is attached"}.</p>}
   <button className="dl-btn" onClick={()=>onInspect(h.edgeId)} aria-label={`Inspect relationship ${i+1}: ${name(h.fromId)} and ${name(h.toId)}`}>Inspect relationship</button>
  </li>)}</ol>
  <ul className="dl-warnings">{path.warnings.map(w=><li key={w}>{w}</li>)}</ul>
  <footer><span className="dl-verified">{ok?`Reconstructable from graph version ${bundle.version.slice(0,8)}`:"Does not reconstruct from this graph version"}</span>
   <button className="dl-btn" onClick={()=>download({schemaVersion:"hsi-cross-department-path-1",graphVersion:bundle.version,path:path.reconstruct,hops:path.hops,departmentsTraversed:path.departmentsTraversed,boundaries:path.boundaries,warnings:path.warnings,causalConclusionAllowed:false,verification:{reconstructs:ok},scientificApproval:false},`hsi-path-${index+1}.json`)}>Export path</button></footer>
 </article>;
}

export function DepartmentLens({bundle,selectedId,onShowInGraph}:{bundle:DomainBundle;selectedId?:string;onShowInGraph:(id:string)=>void}){
 const coverage=useMemo(()=>departmentCoverage(bundle),[bundle]);
 const [dept,setDept]=useState<DepartmentSlug>("microbiome"),[query,setQuery]=useState(""),[start,setStart]=useState(selectedId??""),[target,setTarget]=useState<DepartmentSlug>("neuroscience"),[hops,setHops]=useState(4),[edgeId,setEdgeId]=useState("");
 const projection=useMemo(()=>projectDepartment(bundle,dept),[bundle,dept]);
 const concepts=useMemo(()=>projection.nodes.filter(n=>!query.trim()||n.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0,12),[projection,query]);
 const startNode=bundle.nodes.find(n=>n.id===start);
 const result=useMemo(()=>startNode?crossDepartmentPaths(bundle,startNode.id,target,{maxHops:hops,maxPaths:8}):null,[bundle,startNode,target,hops]);
 const edge=bundle.edges.find(e=>e.id===edgeId);
 const info=departmentBySlug(dept);
 return <div className="dl-page">
  <p className="dl-banner" role="note">Candidate relationships from the public research graph. All are unreviewed, none is validated knowledge, and a path is an association chain, not a causal mechanism. Graph version {bundle.version.slice(0,8)}.</p>
  <section aria-labelledby="dl-rail"><h2 id="dl-rail">Six departments, one graph</h2>
   <div className="dl-rail" role="group" aria-label="Choose a department">{DEPARTMENT_SLUGS.map(s=>{const c=coverage.departments.find(d=>d.department===s)!,d=departmentBySlug(s);return <button key={s} className="dl-dept" aria-pressed={dept===s} onClick={()=>{setDept(s);setQuery("")}}><span className="dl-dept-name">{d?.name??s}</span><span className="dl-dept-cov">{c.concepts?`${c.concepts} candidate concepts`:"No graph coverage"}</span></button>})}</div>
   <p className="dl-note" aria-live="polite">{info?.tagline} {projection.note} {coverage.conceptsInSeveralDepartments} concepts belong to more than one department; each is one entity with several contexts.</p>
   {projection.status==="candidate_coverage"&&<>
    <dl className="dl-counts"><div><dt>Concepts</dt><dd>{projection.counts.concepts}</dd></div><div><dt>Candidate relationships</dt><dd>{projection.counts.candidateEdges}</dd></div><div><dt>Unresolved gaps</dt><dd>{projection.counts.gapEdges}</dd></div><div><dt>Shared with other departments</dt><dd>{projection.counts.sharedConcepts}</dd></div></dl>
    <label className="dl-field">Find a concept in this department<input type="search" maxLength={120} value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <ul className="dl-concepts">{concepts.map(n=><li key={n.id}><button className="dl-btn" aria-pressed={start===n.id} onClick={()=>{setStart(n.id);setEdgeId("")}}>{n.name}</button></li>)}</ul>
    {concepts.length===0&&<p className="dl-note">No concept in this department matches that search.</p>}
   </>}
  </section>
  <section aria-labelledby="dl-paths"><h2 id="dl-paths">Follow a connection into another department</h2>
   <div className="dl-controls">
    <p className="dl-start"><span>Starting concept</span><strong>{startNode?.name??"Choose a concept above"}</strong>{startNode&&<button className="dl-btn" onClick={()=>onShowInGraph(startNode.id)}>Show in graph</button>}</p>
    <label className="dl-field">Into department<select value={target} onChange={e=>{setTarget(e.target.value as DepartmentSlug);setEdgeId("")}}>{DEPARTMENT_SLUGS.map(s=><option key={s} value={s}>{departmentBySlug(s)?.name??s}</option>)}</select></label>
    <label className="dl-field">At most<select value={hops} onChange={e=>setHops(Number(e.target.value))}>{[2,3,4,5].map(n=><option key={n} value={n}>{n} hops</option>)}</select></label>
   </div>
   <div aria-live="polite" className="dl-result">
    {!startNode&&<p>Select a starting concept from a department above, or from the graph tab.</p>}
    {result?.status==="target_has_no_graph_coverage"&&<p>The target department has no concept in the graph yet. Nothing is inferred; this is a coverage gap, not evidence of absence.</p>}
    {result?.status==="no_path_within_bound"&&<p>No path of {hops} hops or fewer connects this concept to that department in the current graph. That reflects coverage in this graph, not proof that no connection exists.</p>}
    {result?.status==="paths_found"&&<p>{result.paths.length} {result.paths.length===1?"path":"paths"} found{result.truncated?" (more exist; results are bounded)":""}. Paths with complete candidate evidence are listed first.</p>}
   </div>
   {result?.paths.map((p,i)=><PathCard key={p.reconstruct.edgeIds.join("|")} bundle={bundle} path={p} index={i} onInspect={setEdgeId}/>)}
  </section>
  {edge&&<Dossier bundle={bundle} edge={edge} onClose={()=>setEdgeId("")}/>}
 </div>;
}
