/**
 * HTTP surface for the graph-workspace Neon adapter (A3.3).
 * Fail-closed: disabled unless assessGraphWorkspaceStoreGate says enabled.
 * Migrations 031–033 remain held; enabling the flag does not apply schema.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {assessGraphWorkspaceStoreGate} from "../db/graphWorkspaceWriteGate";
import {createGraphWorkspace,type UnsafeSql} from "../db/graphWorkspaceStore";
import {parseDomainBundle,type DomainBundle} from "../knowledgeGraph/domainGraph";
import type {InvestigationRecord} from "../knowledgeGraph/graphAgents";
import type {CandidateMappingsFile,DecisionInput} from "../ontology/mappingReview";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";
import {gatewayJson} from "./neonAuthGateway";

export type GraphWorkspaceApiConfig={
 storeEnabled:boolean;
 writesEnabled:boolean;
 databaseUrl:string;
 neonProjectId?:string|null;
};

export type GraphWorkspaceApiDependencies={
 openSql?:(databaseUrl:string)=>Promise<{sql:UnsafeSql;close:()=>Promise<void>|void}>;
 loadGraph?:()=>DomainBundle;
 loadMappings?:()=>CandidateMappingsFile;
};

function sessionFromCookie(req:Request):string|null{
 const cookies=req.headers.get("cookie")??"";
 const values=cookies.split(";").map(s=>s.trim());
 for(const name of ["__Secure-better-auth.session_token","better-auth.session_token"]){
  const pair=values.find(s=>s.startsWith(name+"="));
  if(pair){
   try{return decodeURIComponent(pair.slice(name.length+1))}
   catch{return null}
  }
 }
 return null;
}

function defaultGraph():DomainBundle{
 const raw=JSON.parse(readFileSync(join(process.cwd(),"research/domain-graph/graph.v1.json"),"utf8"));
 return parseDomainBundle(raw);
}

function defaultMappings():CandidateMappingsFile{
 return JSON.parse(readFileSync(join(process.cwd(),"research/ontology/candidate-mappings.v1.json"),"utf8")) as CandidateMappingsFile;
}

async function defaultOpenSql(databaseUrl:string):Promise<{sql:UnsafeSql;close:()=>Promise<void>|void}>{
 const {SQL}=await import("bun");
 const sql=new SQL(databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 return {sql:sql as unknown as UnsafeSql,close:()=>sql.close()};
}

/**
 * Handles `/api/research/graph-workspace/*`.
 * Returns null when the path is not in this surface.
 */
export async function handleGraphWorkspaceApi(
 request:Request,
 config:GraphWorkspaceApiConfig,
 dependencies:GraphWorkspaceApiDependencies={},
):Promise<Response|null>{
 const url=new URL(request.url);
 const path=url.pathname;
 if(!path.startsWith("/api/research/graph-workspace"))return null;

 const gate=assessGraphWorkspaceStoreGate({
  storeEnabled:config.storeEnabled,
  writesEnabled:config.writesEnabled,
  databaseUrl:config.databaseUrl,
  neonProjectId:config.neonProjectId,
 });

 if(path==="/api/research/graph-workspace/status"){
  if(request.method!=="GET")return gatewayJson({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405);
  return gatewayJson({
   service:"hsi-graph-workspace",
   enabled:gate.enabled,
   path:gate.defaultPath,
   reason:gate.reason,
   holdsUnchanged:gate.holdsUnchanged,
   acceptedForScope:gate.acceptedForScope,
   scientificApproval:false,
  });
 }

 if(!gate.enabled){
  return gatewayJson({
   code:"GRAPH_WORKSPACE_STORE_DISABLED",
   error:"Graph workspace server store is disabled. Use device-local storage.",
   path:"localStorage",
   reason:gate.reason,
  },403);
 }

 const token=sessionFromCookie(request);
 if(!token)return gatewayJson({code:"SESSION_REQUIRED",error:"Authentication required"},401);

 const open=dependencies.openSql??defaultOpenSql;
 let handle:{sql:UnsafeSql;close:()=>Promise<void>|void}|undefined;
 try{
  handle=await open(config.databaseUrl);
  const workspace=createGraphWorkspace(handle.sql,token);

  if(path==="/api/research/graph-workspace/investigations"&&request.method==="GET"){
   return gatewayJson({investigations:await workspace.investigations.list(),path:"server"});
  }

  if(path==="/api/research/graph-workspace/investigations"&&request.method==="POST"){
   if((request.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase()!=="application/json"){
    return gatewayJson({code:"JSON_REQUIRED",error:"JSON required"},415);
   }
   const text=await boundedRequestText(request,200_000);
   let body:unknown;
   try{body=JSON.parse(text)}catch{return gatewayJson({code:"INVALID_JSON",error:"Invalid JSON"},400)}
   if(!body||typeof body!=="object"||!("record" in body))return gatewayJson({code:"RECORD_REQUIRED",error:"record required"},400);
   const record=(body as {record:InvestigationRecord}).record;
   const graph=(dependencies.loadGraph??defaultGraph)();
   const result=await workspace.investigations.save(graph,record);
   return gatewayJson({...result,path:"server",scientificApproval:false});
  }

  const getMatch=/^\/api\/research\/graph-workspace\/investigations\/([A-Za-z0-9][A-Za-z0-9:_-]{2,80})$/.exec(path);
  if(getMatch&&request.method==="GET"){
   const revision=Number(url.searchParams.get("revision")??"");
   if(!Number.isInteger(revision)||revision<1)return gatewayJson({code:"REVISION_REQUIRED",error:"revision query required"},400);
   const saved=await workspace.investigations.get(getMatch[1]!,revision);
   if(!saved)return gatewayJson({code:"NOT_FOUND",error:"not_found"},404);
   return gatewayJson({saved,path:"server",scientificApproval:false});
  }

  if(path==="/api/research/graph-workspace/recommendations"&&request.method==="GET"){
   const mappings=(dependencies.loadMappings??defaultMappings)();
   const listed=await workspace.recommendations.list(mappings);
   const decisions=[...listed.entries()].map(([conceptId,rows])=>({
    conceptId,
    revisions:rows.map(r=>({decision:r.decision,identityVerifiedByServer:r.identityVerifiedByServer})),
   }));
   return gatewayJson({decisions,path:"server",scientificApproval:false});
  }

  if(path==="/api/research/graph-workspace/recommendations"&&request.method==="POST"){
   if((request.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase()!=="application/json"){
    return gatewayJson({code:"JSON_REQUIRED",error:"JSON required"},415);
   }
   const text=await boundedRequestText(request,32_000);
   let body:unknown;
   try{body=JSON.parse(text)}catch{return gatewayJson({code:"INVALID_JSON",error:"Invalid JSON"},400)}
   if(!body||typeof body!=="object")return gatewayJson({code:"INVALID_BODY",error:"Invalid body"},400);
   const input=body as DecisionInput;
   if(typeof input.conceptId!=="string"||typeof input.reason!=="string"||typeof input.reviewerLabel!=="string"){
    return gatewayJson({code:"INVALID_DECISION_INPUT",error:"Invalid decision input"},400);
   }
   const mappings=(dependencies.loadMappings??defaultMappings)();
   const result=await workspace.recommendations.record(mappings,input);
   return gatewayJson({...result,path:"server",scientificApproval:false,exactMappingApproved:false});
  }

  return gatewayJson({code:"NOT_FOUND",error:"Not found"},404);
 }catch(error){
  if(error instanceof RequestBodyTooLarge)return gatewayJson({code:"PAYLOAD_TOO_LARGE",error:"Payload too large"},413);
  if(error instanceof RequestBodyTimeout)return gatewayJson({code:"REQUEST_TIMEOUT",error:"Request body timed out"},408);
  return gatewayJson({code:"GRAPH_WORKSPACE_DENIED",error:"Graph workspace operation denied or unavailable"},403);
 }finally{
  if(handle)await handle.close();
 }
}
