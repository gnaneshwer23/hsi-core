import {useState} from "react";
import {parseInvestigationWorkspace,type InvestigationWorkspace,type InvestigationSummary} from "@hsi/interrogativeWorkspace";

/** Uses existing HSI-owned authenticated workspace. No client-supplied identity, role or evidence. */
export function SavedResearchInvestigations({question}:{question:string}){
 const [workspace,setWorkspace]=useState<InvestigationWorkspace|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [cursor,setCursor]=useState<{createdAt:string;id:string}|null>(null);
 const [items,setItems]=useState<InvestigationSummary[]>([]);
 async function load(next:{createdAt:string;id:string}|null=null){
  setBusy(true);setError("");setNotice("");
  try{
   const url="/api/research/investigations"+(next?"?cursor="+encodeURIComponent(JSON.stringify(next)):"");
   const response=await fetch(url,{credentials:"same-origin",headers:{Accept:"application/json"},cache:"no-store"});
   if(response.status===401)throw new Error("Sign in with a verified HSI research account to access saved investigations.");
   if(!response.ok)throw new Error("Saved investigations are unavailable or this account lacks access.");
   const result=parseInvestigationWorkspace(await response.json());
   setWorkspace(result);setItems(previous=>next?[...previous,...result.items.filter(x=>!previous.some(y=>y.id===x.id))]:result.items);
   setCursor(result.nextCursor);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load saved investigations.");}
  finally{setBusy(false);}
 }
 async function save(){
  const release=workspace?.releases[0];
  if(!workspace?.canCreate||!workspace.writesEnabled||!release||!question.trim()||question.trim().length>500)return;
  setBusy(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/research/investigations",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({question:question.trim(),releaseId:release.id,requestId:crypto.randomUUID()})});
   if(!response.ok)throw new Error(response.status===403?"Research writes are not enabled or authorized.":"Unable to create an investigation for the configured release.");
   const result=await response.json() as {id?:string};
   if(!result.id||!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(result.id))throw new Error("Unexpected saved investigation response.");
   setNotice("Research investigation saved under the server-approved release. Live PubMed retrieval was not attached or scientifically approved.");
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Save failed.");}
  finally{setBusy(false);}
 }
 return <section className="sde-callout" aria-label="Authenticated saved research investigations">
  <strong>Saved research investigations · authenticated HSI workspace</strong>
  <p>This workspace uses HSI's existing server-verified account, owner-scoped storage and published research releases. It does not persist the separate live PubMed trace or turn it into approved evidence.</p>
  <button type="button" disabled={busy} onClick={()=>void load()}>{busy?"Loading…":"Load my saved investigations"}</button>
  {error&&<p role="alert" className="sde-warning">{error}</p>}
  {notice&&<p role="status">{notice}</p>}
  {workspace&&<div>
   <p>{items.length} investigation(s) loaded · {workspace.writesEnabled?"research writes enabled":"research writes disabled"} · {workspace.releases.length?"configured release available":"no eligible published release"}</p>
   {items.map(item=><article key={item.id} className="sde-item"><strong>{item.question}</strong><p>{item.state.replaceAll("_"," ")} · {item.createdAt}</p><a href={"/research/scientific-workbench"}>Open authenticated scientific workbench</a><small> · {item.id}</small></article>)}
   {cursor&&<button type="button" disabled={busy} onClick={()=>void load(cursor)}>Load more</button>}
   {workspace.canCreate&&workspace.releases.length>0?<button type="button" disabled={busy||question.trim().length<5||question.trim().length>500} onClick={()=>void save()}>Save question as investigation under configured release</button>:<p className="sde-warning">Creation is unavailable until a published release and authorized research writes are configured. Arbitrary live literature is not automatically eligible for release-backed persistence.</p>}
  </div>}
 </section>;
}
