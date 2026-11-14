import {useEffect,useMemo,useState} from "react";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {buildInvestigationRecord,buildSelectionContext,investigateSelection,proposeFromFinding,verifyInvestigationRecord,type AgentName,type AgentProposal,type AgentResponse,type Finding} from "../../../src/knowledgeGraph/graphAgents";
import {browserStore,listInvestigations,loadInvestigation,saveInvestigation,type LoadResult} from "../../../src/knowledgeGraph/investigationStore";
import type {DepartmentSlug} from "../../../src/knowledgeGraph/departments";

const ROLE:Record<AgentName,{label:string;action:string;blurb:string}>={
 PARALLAX:{label:"PARALLAX · context and contradiction",action:"Compare evidence",blurb:"Tests whether two findings are comparable before treating a difference as disagreement."},
 VANTAGE:{label:"VANTAGE · gaps",action:"Identify gaps",blurb:"Separates a question the graph records from something the graph has not captured."},
 HELIX:{label:"HELIX · mechanism",action:"Investigate mechanism",blurb:"Lists candidate chains from the graph. Model-backed interpretation is not enabled."},
};
const CLASS_LABEL:Record<string,string>={not_comparable:"Not comparable",insufficient_context:"Insufficient context",potential_disagreement:"Potential disagreement (needs review)",consistent_context:"Consistent context",research_gap:"Recorded research question",coverage:"Graph coverage gap",association_only:"Association only",association_with_evidence_boundary:"Association with an evidence boundary"};
function download(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

function ResponseCard({r,onPropose}:{r:AgentResponse;onPropose:(r:AgentResponse,f:Finding)=>void}){
 return <article className="gi-card" aria-label={`${r.agent} response`}>
  <header><h4>{ROLE[r.agent].label}</h4><span className={r.status==="completed"?"gi-chip":"gi-chip gi-chip-warn"}>{r.status==="completed"?"Completed":r.status==="abstained"?"Abstained":"Not enabled"}</span></header>
  <p className="gi-scope">Scoped to graph version {r.graphVersion.slice(0,8)} · {r.scope.nodeIds.length} concepts · {r.scope.edgeIds.length} relationships · {r.scope.evidenceIds.length} sources</p>
  {r.abstentionReason&&<p className="gi-abstain" role="note"><strong>No conclusion offered.</strong> {r.abstentionReason}</p>}
  {r.findings.length>0&&<ol className="gi-findings">{r.findings.map((f,i)=><li key={i}>
   <p><strong>{f.title}</strong>{f.class&&<span className="gi-class">{CLASS_LABEL[f.class]??f.class}</span>}</p>
   <p>{f.detail}</p>
   <p className="gi-refs">{f.refs.edgeIds.length} relationships · {f.refs.nodeIds.length} concepts · {f.refs.sourceIds.length} sources{f.boundaries?.length?` · evidence stops at hop ${f.boundaries.join(", ")}`:""}</p>
   <button className="gi-btn" onClick={()=>onPropose(r,f)}>Propose for review</button>
  </li>)}</ol>}
  <h5>Uncertainty</h5><ul>{r.uncertainty.map(u=><li key={u}>{u}</li>)}</ul>
  <p className="gi-foot">Candidate finding. No scientific approval. Nothing was published to the graph.</p>
 </article>;
}

export function GraphInvestigation({bundle,nodeIds,edgeIds,department,onRemoveNode,onRemoveEdge,onRestore}:{bundle:DomainBundle;nodeIds:string[];edgeIds:string[];department:DepartmentSlug|null;onRemoveNode:(id:string)=>void;onRemoveEdge:(id:string)=>void;onRestore:(nodeIds:string[],edgeIds:string[])=>void}){
 const [question,setQuestion]=useState("What does the graph record about this selection?"),[responses,setResponses]=useState<AgentResponse[]>([]),[error,setError]=useState(""),[proposal,setProposal]=useState<AgentProposal|null>(null);
 const store=useMemo(()=>browserStore(),[]),[saved,setSaved]=useState(()=>store?listInvestigations(store):[]),[saveMsg,setSaveMsg]=useState(""),[opened,setOpened]=useState<LoadResult|null>(null);
 const refresh=()=>setSaved(store?listInvestigations(store):[]);
 useEffect(()=>{refresh()},[store]);
 async function save(rec:NonNullable<typeof record>){
  if(!store){setSaveMsg("This browser is blocking local storage, so nothing can be saved here. Export the record instead.");return}
  try{const r=await saveInvestigation(bundle,store,rec);setSaveMsg(r.status==="unchanged"?`Already saved as revision ${r.saved.revision}.`:`Saved as revision ${r.saved.revision} on this device only.`);refresh()}
  catch(e){setSaveMsg(e instanceof Error?e.message:"Could not save")}
 }
 async function open(id:string,rev:number){if(store)setOpened(await loadInvestigation(store,id,rev,bundle))}
 const name=(id:string)=>bundle.nodes.find(n=>n.id===id)?.name??id;
 const built=useMemo(()=>{
  try{return {ctx:buildSelectionContext(bundle,{investigationId:`inv-${bundle.version.slice(0,8)}-${nodeIds.length}n${edgeIds.length}e`,graphVersion:bundle.version,question,department,nodeIds,edgeIds}),err:""}}
  catch(e){return {ctx:null,err:e instanceof Error?e.message:"Invalid selection"}}
 },[bundle,question,department,nodeIds,edgeIds]);
 function run(agent:AgentName){
  setError("");setProposal(null);
  if(!built.ctx){setError(built.err);return}
  try{const r=investigateSelection(bundle,built.ctx,agent);setResponses(prev=>[...prev.filter(x=>x.agent!==agent),r].sort((a,b)=>a.agent.localeCompare(b.agent)))}
  catch(e){setError(e instanceof Error?e.message:"The agent could not run")}
 }
 // Results belong to the selection that produced them: a changed selection or question clears them.
 const key=built.ctx?JSON.stringify([built.ctx.nodeIds,built.ctx.edgeIds,built.ctx.question,built.ctx.department]):"";
 const [lastKey,setLastKey]=useState(key);if(key!==lastKey){setLastKey(key);if(responses.length)setResponses([]);if(proposal)setProposal(null)}
 const empty=nodeIds.length===0&&edgeIds.length===0;
 const record=built.ctx&&responses.length?buildInvestigationRecord(bundle,built.ctx,responses.map(r=>r.agent)):null;
 const problems=record?verifyInvestigationRecord(bundle,record):[];
 return <section className="gi-panel" aria-labelledby="gi-heading">
  <h2 id="gi-heading">Investigate this selection</h2>
  <p className="gi-lead">Each agent receives exactly the context below: this graph version, these concepts and relationships, and your question. They do not see anything else and cannot change the graph.</p>
  <div className="gi-selection" aria-label="Investigation selection">
   <div><h3>Concepts ({nodeIds.length})</h3>{nodeIds.length?<ul>{nodeIds.map(id=><li key={id}>{name(id)} <button className="gi-x" onClick={()=>onRemoveNode(id)} aria-label={`Remove ${name(id)} from the investigation`}>Remove</button></li>)}</ul>:<p>None yet. Use “Add to investigation” on a concept.</p>}</div>
   <div><h3>Relationships ({edgeIds.length})</h3>{edgeIds.length?<ul>{edgeIds.map(id=><li key={id}>{id} <button className="gi-x" onClick={()=>onRemoveEdge(id)} aria-label={`Remove relationship ${id} from the investigation`}>Remove</button></li>)}</ul>:<p>None yet. Use “Add to investigation” on a relationship.</p>}</div>
  </div>
  <label className="gi-field">Research question<textarea rows={2} maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)}/></label>
  {built.err&&!empty&&<p className="gi-error" role="alert">{built.err}</p>}
  <div className="gi-actions" role="group" aria-label="Choose an agent">
   {(Object.keys(ROLE) as AgentName[]).map(a=><button key={a} className="gi-btn gi-btn-primary" disabled={empty} onClick={()=>run(a)} title={ROLE[a].blurb}>{ROLE[a].action}</button>)}
  </div>
  {empty&&<p className="gi-note">Add at least one concept or relationship to investigate.</p>}
  {error&&<p className="gi-error" role="alert">{error}</p>}
  <details className="gi-context"><summary>Show the exact context the agents receive</summary><pre>{built.ctx?JSON.stringify(built.ctx,null,2):built.err||"No selection"}</pre></details>
  <div aria-live="polite">{responses.map(r=><ResponseCard key={r.agent} r={r} onPropose={(resp,f)=>setProposal(proposeFromFinding(resp,f))}/>)}</div>
  {proposal&&<section className="gi-proposal" aria-label="Agent proposal"><h3>Proposal (unreviewed)</h3><p>{proposal.summary}</p><p>Proposed by {proposal.proposedBy}. Status: <strong>proposed, unreviewed</strong>. It requires independent human review and cannot be applied to the graph from here.</p></section>}
  {record&&<footer className="gi-export"><p className={problems.length?"gi-error":"gi-verified"}>{problems.length?`Record does not reproduce: ${problems.join("; ")}`:`This record reproduces from graph version ${bundle.version.slice(0,8)}.`}</p>
   <div className="gi-actions"><button className="gi-btn" onClick={()=>save(record)}>Save on this device</button><button className="gi-btn" onClick={()=>download(record,`hsi-investigation-${record.context.investigationId}.json`)}>Export investigation</button></div></footer>}
  {saveMsg&&<p className="gi-note" role="status">{saveMsg}</p>}
  <section className="gi-saved" aria-labelledby="gi-saved-h"><h3 id="gi-saved-h">Saved investigations</h3>
   <p className="gi-note">Saved on this device only, unreviewed, append-only. Saving does not approve anything, and clearing browser data removes them.</p>
   {!store?<p className="gi-note">Local storage is not available in this browser.</p>:saved.length===0?<p className="gi-note">Nothing saved yet.</p>:<ul>{saved.map(x=><li key={x.investigationId}><span>{x.question} <small>· revision {x.latestRevision} · {x.savedAt.slice(0,10)} · graph {x.graphVersion.slice(0,8)}</small></span> <button className="gi-btn" onClick={()=>open(x.investigationId,x.latestRevision)} aria-label={`Open saved investigation ${x.investigationId}`}>Open</button></li>)}</ul>}
   {opened&&<div className="gi-card" role="region" aria-label="Opened saved investigation">
    <h4>{opened.saved.record.context.question}</h4>
    <p className="gi-scope">Revision {opened.saved.revision} · graph version {opened.saved.record.graphVersion.slice(0,8)} · {opened.saved.record.context.nodeIds.length} concepts · {opened.saved.record.context.edgeIds.length} relationships</p>
    <p className={opened.intact?"gi-verified":"gi-error"}>{opened.intact?"Stored content is intact.":`Stored content failed its integrity check: ${opened.problems.join("; ")}`}</p>
    <p className={opened.reproducible?"gi-verified":"gi-error"}>{opened.reproducible?"Reproduces from the current graph.":"Does not reproduce from the current graph; the graph has changed since it was saved."}</p>
    <ul>{opened.saved.record.responses.map(r=><li key={r.agent}><strong>{r.agent}</strong>: {r.status}, {r.findings.length} candidate findings</li>)}</ul>
    <button className="gi-btn" onClick={()=>{onRestore(opened.saved.record.context.nodeIds,opened.saved.record.context.edgeIds);setQuestion(opened.saved.record.context.question);setOpened(null)}}>Use this selection again</button>
   </div>}
  </section>
 </section>;
}
