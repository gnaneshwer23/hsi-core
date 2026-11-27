import {useMemo,useState} from "react";
import {
 EMPTY_DOCK,MODEL_INTERPRETATION,addToDock,agentReadiness,dockInvestigationId,removeFromDock,suggestedQuestion,
 type DockSelection,type GraphModel,type ModeId,type TracedPath,
} from "../../../src/graphWorkspace";
import {
 buildInvestigationRecord,buildSelectionContext,investigateSelection,proposeFromFinding,verifyInvestigationRecord,type AgentName,type AgentResponse,type Finding,
} from "../../../src/knowledgeGraph/graphAgents";

const CLASS_LABEL:Record<string,string>={not_comparable:"Not comparable",insufficient_context:"Insufficient context",potential_disagreement:"Potential disagreement, needs review",consistent_context:"Consistent context",research_gap:"Recorded research question",coverage:"Graph coverage gap",association_only:"Association only",association_with_evidence_boundary:"Association with an evidence boundary"};
const STATUS:Record<AgentResponse["status"],string>={completed:"Completed",abstained:"Abstained",disabled:"Not enabled"};

function download(value:unknown,name:string){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"})),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

type Props={model:GraphModel;mode:ModeId;entity:string|null;assertionId:string|null;compareIds:readonly string[];path:TracedPath|null;onSelectAssertion:(id:string)=>void;onSelectConcept:(id:string)=>void};

/**
 * LEA-04J: the NEXUS dock. It runs the existing deterministic graph agents over a bounded selection from the workspace.
 * Every answer is a candidate finding; a proposal is a file for independent review and never changes the graph.
 */
export function NexusDock({model,mode,entity,assertionId,compareIds,path,onSelectAssertion,onSelectConcept}:Props){
 const [sel,setSel]=useState<DockSelection>(EMPTY_DOCK);
 const [question,setQuestion]=useState<string|null>(null);
 const [responses,setResponses]=useState<AgentResponse[]>([]);
 const [msg,setMsg]=useState("");
 const q=question??suggestedQuestion(mode,sel,model);
 const name=(id:string)=>model.nodes.get(id)?.name??id;
 const rel=(id:string)=>{const a=model.assertions.find(x=>x.id===id);return a?`${a.subject.name} ${a.reportedAs} ${a.object.name}`:id};
 const ready=agentReadiness(sel);
 /* Agent titles cite relationship ids; show the relationship as people read it. The record keeps the ids. */
 const readable=(t:string)=>{let out=t;for(const a of [...model.assertions].sort((x,y)=>y.id.length-x.id.length))if(out.includes(a.id))out=out.split(a.id).join(`“${a.subject.name} ${a.reportedAs} ${a.object.name}”`);return out.replace(/: (not comparable|insufficient context|potential disagreement|consistent context)$/,"");};

 const ctx=useMemo(()=>{
  if(!sel.nodeIds.length&&!sel.edgeIds.length)return {ctx:null,err:""};
  try{return {ctx:buildSelectionContext(model.bundle,{investigationId:dockInvestigationId(model.version,sel),graphVersion:model.version,question:q,nodeIds:sel.nodeIds,edgeIds:sel.edgeIds}),err:""}}
  catch(e){return {ctx:null,err:e instanceof Error?e.message:"The selection cannot be used."}}
 },[model,sel,q]);

 const add=(x:{nodeIds?:readonly string[];edgeIds?:readonly string[]},what:string)=>{const r=addToDock(sel,x);setMsg(r.refused??`Added ${what}.`);if(!r.refused){setSel(r.selection);setResponses([])}};
 const remove=(id:string)=>{setSel(removeFromDock(sel,id));setResponses([]);setMsg("")};
 const run=(agent:AgentName)=>{
  if(!ctx.ctx){setMsg(ctx.err||"Add something to the selection first.");return}
  try{const r=investigateSelection(model.bundle,ctx.ctx,agent);setResponses(rs=>[...rs.filter(x=>x.agent!==agent),r]);setMsg(`${agent} ${STATUS[r.status].toLowerCase()}.`)}
  catch(e){setMsg(e instanceof Error?e.message:"The agent could not run.")}
 };
 const propose=(r:AgentResponse,f:Finding)=>{const p=proposeFromFinding(r,f);download(p,`hsi-nexus-proposal-${r.agent.toLowerCase()}.json`);setMsg("Proposal downloaded for independent review. Nothing was changed in the graph.")};
 const record=()=>{
  if(!ctx.ctx)return;
  const rec=buildInvestigationRecord(model.bundle,ctx.ctx,responses.length?responses.map(r=>r.agent):undefined);
  const problems=verifyInvestigationRecord(model.bundle,rec);
  if(problems.length){setMsg(`Record not downloaded: ${problems.join("; ")}`);return}
  download(rec,`hsi-nexus-investigation-${model.version.slice(0,8)}.json`);setMsg("Investigation record downloaded. Re-running it reproduces the same answers.");
 };

 return (
  <section className="gw-card gw-wide gw-nexus" aria-labelledby="gw-nexus">
   <h2 id="gw-nexus">NEXUS</h2>
   <p className="gw-hint">Runs the deterministic graph checks over the selection you build here. Every answer is a candidate finding; nothing changes the graph.</p>

   <div className="gw-nexus-add" role="group" aria-label="Add to the NEXUS selection">
    <button type="button" className="gw-btn" disabled={!entity} onClick={()=>entity&&add({nodeIds:[entity]},name(entity))}>Add selected concept</button>
    <button type="button" className="gw-btn" disabled={!assertionId} onClick={()=>assertionId&&add({edgeIds:[assertionId]},"the selected relationship")}>Add selected relationship</button>
    <button type="button" className="gw-btn" disabled={compareIds.length<2} onClick={()=>add({edgeIds:compareIds},`${compareIds.length} compared findings`)}>Add compared findings</button>
    <button type="button" className="gw-btn" disabled={!path} onClick={()=>path&&add({nodeIds:[path.nodeIds[0]!,path.nodeIds.at(-1)!]},"the ends of the traced chain")}>Add traced chain ends</button>
    {(sel.nodeIds.length>0||sel.edgeIds.length>0)&&<button type="button" className="gw-link" onClick={()=>{setSel(EMPTY_DOCK);setResponses([]);setQuestion(null);setMsg("Selection cleared.")}}>Clear selection</button>}
   </div>

   {sel.nodeIds.length+sel.edgeIds.length>0?<ul className="gw-chips" aria-label="NEXUS selection">
    {sel.nodeIds.map(id=><li key={id}><button type="button" className="gw-link" onClick={()=>onSelectConcept(id)}>{name(id)}</button><button type="button" className="gw-x" aria-label={`Remove ${name(id)}`} onClick={()=>remove(id)}>×</button></li>)}
    {sel.edgeIds.map(id=><li key={id}><button type="button" className="gw-link" onClick={()=>onSelectAssertion(id)}>{rel(id)}</button><button type="button" className="gw-x" aria-label={`Remove ${rel(id)}`} onClick={()=>remove(id)}>×</button></li>)}
   </ul>:<p className="gw-hint">Select a concept or a relationship in the graph or the table, then add it here.</p>}

   <label className="gw-field gw-nexus-q"><span>Question</span><textarea rows={2} maxLength={500} value={q} onChange={e=>{setQuestion(e.target.value);setResponses([])}}/></label>
   <p className="gw-hint">Questions are checked for personal or clinical identifiers and refused if they look like one.</p>

   <ul className="gw-nexus-agents" aria-label="NEXUS checks">{ready.map(r=><li key={r.agent}>
    <button type="button" className="gw-btn" disabled={!r.ready} onClick={()=>run(r.agent)}>{r.action}</button>
    <small><b>{r.agent}</b> · {r.why}</small>
   </li>)}
    <li><button type="button" className="gw-btn" disabled>Interpret with a language model</button><small>{MODEL_INTERPRETATION.reason}</small></li>
   </ul>
   {ctx.err&&<p className="gw-hint" role="status">{ctx.err}</p>}
   <p className="gw-hint" role="status" aria-live="polite">{msg}</p>

   {responses.map(r=>(
    <article key={r.agent} className="gw-nexus-resp" aria-label={`${r.agent} answer`}>
     <h3>{r.agent} <small>{STATUS[r.status]}</small></h3>
     <ul className="gw-status"><li>Candidate finding</li><li>Deterministic</li><li>Not model-backed</li><li>No scientific approval</li></ul>
     <p className="gw-hint">Scoped to graph version {r.graphVersion.slice(0,8)}: {r.scope.nodeIds.length} concepts, {r.scope.edgeIds.length} relationships, {r.scope.evidenceIds.length} sources.</p>
     {r.abstentionReason&&<p role="note"><strong>No conclusion offered.</strong> {r.abstentionReason}</p>}
     {r.findings.length>0&&<ol className="gw-list">{r.findings.map((f,i)=><li key={i}>
      <p><strong>{readable(f.title)}</strong>{f.class&&<> · <span className="gw-tag">{CLASS_LABEL[f.class]??f.class}</span></>}</p>
      <p>{f.detail}</p>
      <button type="button" className="gw-link" onClick={()=>propose(r,f)}>Download as a proposal for review</button>
     </li>)}</ol>}
     <h4>Uncertainty</h4><ul className="gw-list">{r.uncertainty.map(u=><li key={u}>{u}</li>)}</ul>
    </article>
   ))}
   {responses.length>0&&<button type="button" className="gw-btn" onClick={record}>Download investigation record</button>}
  </section>
 );
}
