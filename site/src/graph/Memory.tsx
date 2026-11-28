import {useEffect,useState} from "react";
import {SECTION_LABEL,isStale,latestOutputs,type GraphModel,type MemoryInvestigation} from "../../../src/graphWorkspace";
import type {MemoryClient,ScopeInfo} from "./memoryClient";

const KIND:Record<string,string>={created:"Created",note:"Note",stage:"Stage",selection:"Selection saved",status:"Status changed",shared:"Shared into a scope",unshared:"Sharing stopped",output:"Section saved"};
const when=(iso:string)=>{try{return new Date(iso).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})}catch{return iso}};

type ListProps={model:GraphModel;client:MemoryClient|null;items:MemoryInvestigation[];activeId:string|null;onShow:(i:MemoryInvestigation|null)=>void;onChanged:()=>void};

/** LEA-04G: the Scientific Memory panel. Lists saved investigations and shows one record's log and sections. */
export function MemoryPanel({model,client,items,activeId,onShow,onChanged}:ListProps){
 const [note,setNote]=useState("");
 const [msg,setMsg]=useState("");
 const [showArchived,setShowArchived]=useState(false);
 const active=items.find(i=>i.id===activeId)??null;
 const shown=items.filter(i=>showArchived||i.status==="active");
 const run=async(f:()=>Promise<void>,ok:string)=>{try{await f();setMsg(ok);onChanged()}catch(e){setMsg(e instanceof Error?e.message:"That did not work.")}};
 return (
  <section className="gw-card gw-wide gw-mem" aria-labelledby="gw-mem">
   <h2 id="gw-mem">Scientific Memory</h2>
   <p className="gw-hint" role="status">{client?client.status.reason:"Opening the store…"}</p>
   {shown.length===0?<p className="gw-hint">Nothing saved yet. Build a selection in NEXUS below, then choose “Save to Scientific Memory”.</p>:
   <ul className="gw-list" aria-label="Saved investigations">{shown.map(i=><li key={i.id} data-active={i.id===activeId}>
    <button type="button" onClick={()=>onShow(i.id===activeId?null:i)} aria-pressed={i.id===activeId}>{i.question}</button>
    <small>{i.entities.length} concept{i.entities.length===1?"":"s"} · {i.edgeIds.length} relationship{i.edgeIds.length===1?"":"s"} · updated {when(i.updatedAt)}{i.status==="archived"?" · archived":""}{i.access==="scope"?` · shared with you in ${i.scope}`:""}{isStale(i,model.version)?" · saved against an earlier graph version":""}</small>
   </li>)}</ul>}
   {items.some(i=>i.status==="archived")&&<label className="gw-check"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/> Show archived</label>}
   {active&&<article className="gw-mem-detail" aria-label="Saved investigation">
    <h3>{active.question}</h3>
    <ul className="gw-status"><li>Working record</li><li>No scientific approval</li><li>{active.where==="browser"?"This browser only":"Your account"}</li><li>Graph {active.graphVersion.slice(0,8)}</li></ul>
    {isStale(active,model.version)&&<p role="note" className="gw-hint">This was saved against graph version {active.graphVersion.slice(0,8)}. The graph has changed since; some relationships may have moved or gone.</p>}
    <h4>Sections</h4>
    {latestOutputs(active).length?<ul className="gw-list">{latestOutputs(active).map(o=><li key={o.section}><span>{SECTION_LABEL[o.section]} <small>version {o.version}{o.version>1?`, ${o.version-1} earlier kept`:""}</small></span></li>)}</ul>:<p className="gw-hint">No sections saved yet.</p>}
    <h4>Log</h4>
    <ol className="gw-mem-log">{active.events.map(e=><li key={e.seq}><b>{KIND[e.kind]??e.kind}</b> <small>{when(e.at)}</small>{e.kind==="note"&&typeof e.payload.text==="string"?<p>{e.payload.text}</p>:null}</li>)}</ol>
    {active.access==="owner"&&<>
     <label className="gw-field"><span>Add a note</span><textarea rows={2} maxLength={4000} value={note} onChange={e=>setNote(e.target.value)}/></label>
     <div className="gw-row">
      <button type="button" className="gw-btn" disabled={!note.trim()} onClick={()=>run(async()=>{await client!.note(active.id,note);setNote("")},"Note added to the log.")}>Add note</button>
      <button type="button" className="gw-btn" onClick={()=>run(()=>client!.setStatus(active.id,active.status==="active"?"archived":"active"),active.status==="active"?"Archived. It stays in the record.":"Restored.")}>{active.status==="active"?"Archive":"Restore"}</button>
     </div>
     <p className="gw-hint">Notes and sections are added, never edited. Archiving hides an investigation from the list; it does not delete it.</p>
    </>}
   </article>}
   <p className="gw-hint" role="status" aria-live="polite">{msg}</p>
  </section>
 );
}

/** LEA-04K: the Collaboration panel. Sharing needs the account store and a verified membership in a scope. */
export function CollaborationPanel({client,items,onShow,onChanged}:{client:MemoryClient|null;items:MemoryInvestigation[];onShow:(i:MemoryInvestigation)=>void;onChanged:()=>void}){
 const [scopes,setScopes]=useState<ScopeInfo|null>(null);
 const [msg,setMsg]=useState("");
 const account=client?.status.where==="account";
 useEffect(()=>{if(account)client!.scopes().then(setScopes).catch(()=>setScopes(null))},[client,account]);
 const shared=items.filter(i=>i.access==="scope");
 const mine=items.filter(i=>i.access==="owner"&&i.status==="active");
 const member=new Set(scopes?.memberships.map(m=>m.scope)??[]);
 const share=async(i:MemoryInvestigation,scope:string,on:boolean)=>{try{await client!.share(i.id,scope,on);setMsg(on?`Shared into ${scope}. Members of that scope can read it; only you can change it.`:"Sharing stopped.");onChanged()}catch(e){setMsg(e instanceof Error?e.message:"That did not work.")}};
 return (
  <section className="gw-card gw-wide gw-mem" aria-labelledby="gw-collab">
   <h2 id="gw-collab">Collaboration</h2>
   {!account?<>
    <p className="gw-hint" role="status">Sharing is not switched on here. It needs a signed-in account and the account store, which switches on after the independent database review.</p>
    <ul className="gw-list"><li><span>Programmes are scopes in a registry, such as systemic sclerosis or rheumatoid arthritis. Adding one is a data change, not a code change.</span></li>
     <li><span>Membership is granted by a scope admin, never by yourself, and can be revoked at once.</span></li>
     <li><span>Members read a shared investigation. Only its owner can change it. Membership approves nothing.</span></li></ul>
   </>:<>
    <p className="gw-hint" role="status">{scopes?`You belong to ${scopes.memberships.length?[...member].join(", "):"no scope yet"}.`:"Checking your memberships…"}</p>
    <h3>Shared with you</h3>
    {shared.length?<ul className="gw-list">{shared.map(i=><li key={i.id}><button type="button" onClick={()=>onShow(i)}>{i.question}</button><small>in {i.scope} · read only</small></li>)}</ul>:<p className="gw-hint">Nothing has been shared with you.</p>}
    <h3>Your investigations</h3>
    {mine.length&&member.size?<ul className="gw-list">{mine.map(i=><li key={i.id}><span>{i.question}</span>
     <div className="gw-row">{[...member].map(s=>i.shared&&i.scope===s
      ?<button key={s} type="button" className="gw-btn" onClick={()=>share(i,s,false)}>Stop sharing in {s}</button>
      :<button key={s} type="button" className="gw-btn" onClick={()=>share(i,s,true)}>Share in {s}</button>)}</div></li>)}</ul>
     :<p className="gw-hint">{member.size?"Save an investigation first.":"A scope admin needs to add you to a scope before you can share."}</p>}
   </>}
   <p className="gw-hint" role="status" aria-live="polite">{msg}</p>
  </section>
 );
}
