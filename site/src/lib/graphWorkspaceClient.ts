/**
 * Client dual-path for graph workspace persistence (A3.3).
 * Default: device-local localStorage. Server path only when /status reports enabled.
 * Never imports the Neon adapter into the browser bundle.
 */
import type {FetchLike} from "../../../src/fetchLike";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {verifyInvestigationRecord,type InvestigationRecord} from "../../../src/knowledgeGraph/graphAgents";
import {
 browserStore,
 listInvestigations,
 loadInvestigation,
 recordDigest,
 saveInvestigation,
 type LoadResult,
 type SavedInvestigation,
 type SaveResult,
} from "../../../src/knowledgeGraph/investigationStore";

export type GraphWorkspaceClientMode="local"|"server";

export type GraphWorkspaceStatus={
 enabled:boolean;
 path:"localStorage"|"server";
 reason:string;
 holdsUnchanged:boolean;
 acceptedForScope:false;
 scientificApproval:false;
};

const STATUS_URL="/api/research/graph-workspace/status";

/** Resolves mode; any failure or disabled gate keeps localStorage. */
export async function resolveGraphWorkspaceMode(
 fetchImpl:FetchLike=fetch,
):Promise<{mode:GraphWorkspaceClientMode;status:GraphWorkspaceStatus|null}>{
 try{
  const response=await fetchImpl(STATUS_URL,{method:"GET",credentials:"same-origin",cache:"no-store"});
  if(!response.ok)return{mode:"local",status:null};
  const body=await response.json() as Partial<GraphWorkspaceStatus>;
  if(body.enabled===true&&body.path==="server"){
   return{
    mode:"server",
    status:{
     enabled:true,
     path:"server",
     reason:typeof body.reason==="string"?body.reason:"staging_flag_and_writes",
     holdsUnchanged:body.holdsUnchanged!==false,
     acceptedForScope:false,
     scientificApproval:false,
    },
   };
  }
  return{
   mode:"local",
   status:{
    enabled:false,
    path:"localStorage",
    reason:typeof body.reason==="string"?body.reason:"disabled",
    holdsUnchanged:true,
    acceptedForScope:false,
    scientificApproval:false,
   },
  };
 }catch{
  return{mode:"local",status:null};
 }
}

export type InvestigationSummary={
 investigationId:string;
 latestRevision:number;
 savedAt:string;
 question:string;
 graphVersion:string;
};

export async function listGraphInvestigations(
 mode:GraphWorkspaceClientMode,
 fetchImpl:FetchLike=fetch,
):Promise<InvestigationSummary[]>{
 if(mode==="local"){
  const store=browserStore();
  return store?listInvestigations(store):[];
 }
 const response=await fetchImpl("/api/research/graph-workspace/investigations",{
  method:"GET",credentials:"same-origin",cache:"no-store",
 });
 if(!response.ok)throw Error("Could not list server investigations");
 const body=await response.json() as {investigations?:InvestigationSummary[]};
 return Array.isArray(body.investigations)?body.investigations:[];
}

export async function saveGraphInvestigation(
 mode:GraphWorkspaceClientMode,
 bundle:DomainBundle,
 record:InvestigationRecord,
 fetchImpl:FetchLike=fetch,
):Promise<SaveResult&{path:GraphWorkspaceClientMode}>{
 if(mode==="local"){
  const store=browserStore();
  if(!store)throw Error("This browser is blocking local storage, so nothing can be saved here. Export the record instead.");
  const result=await saveInvestigation(bundle,store,record);
  return{...result,path:"local"};
 }
 const response=await fetchImpl("/api/research/graph-workspace/investigations",{
  method:"POST",
  credentials:"same-origin",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({record}),
 });
 if(!response.ok){
  const err=await response.json().catch(()=>({})) as {error?:string};
  throw Error(err.error??"Could not save on the server");
 }
 const body=await response.json() as SaveResult;
 return{...body,path:"server"};
}

export async function loadGraphInvestigation(
 mode:GraphWorkspaceClientMode,
 id:string,
 revision:number,
 bundle:DomainBundle,
 fetchImpl:FetchLike=fetch,
):Promise<LoadResult|null>{
 if(mode==="local"){
  const store=browserStore();
  return store?loadInvestigation(store,id,revision,bundle):null;
 }
 const response=await fetchImpl(
  `/api/research/graph-workspace/investigations/${encodeURIComponent(id)}?revision=${revision}`,
  {method:"GET",credentials:"same-origin",cache:"no-store"},
 );
 if(response.status===404)return null;
 if(!response.ok)throw Error("Could not load server investigation");
 const body=await response.json() as {saved?:SavedInvestigation};
 const saved=body.saved;
 if(!saved||saved.schemaVersion!=="hsi-saved-investigation-1")return null;
 const problems:string[]=[];
 if(saved.investigationId!==id||saved.revision!==revision)problems.push("Stored identity does not match its key");
 if(await recordDigest(saved.record)!==saved.digest)problems.push("Record content does not match its digest");
 if(saved.scientificApproval!==false||saved.reviewStatus!=="unreviewed")problems.push("A saved record may not carry approval");
 const repro=verifyInvestigationRecord(bundle,saved.record);
 const reproducible=repro.length===0;
 if(repro.length)problems.push("Not reproducible against this graph: "+repro.join("; "));
 return{
  saved,
  intact:!problems.some(p=>!p.startsWith("Not reproducible")),
  reproducible,
  problems,
 };
}
