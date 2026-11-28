/**
 * HTTP surface for the one investigation store (migration 034; ADR-012/013/014).
 * Fail-closed: disabled unless HSI_INVESTIGATION_STORE_ENABLED is "true", research writes are on and the database is
 * the pinned HSI staging host (the same gate as the graph-workspace store). Production stays off while 034 is held.
 * The browser never sends an owner or principal id; the database derives it from the verified session.
 */
import {assessGraphWorkspaceStoreGate} from "../db/graphWorkspaceWriteGate";
import {createInvestigationStore,carriesApproval,OUTPUT_SECTIONS,type StoreSql,type OutputSection,type MembershipRole} from "../db/investigationStore";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";
import {gatewayJson} from "./neonAuthGateway";

export const INVESTIGATION_STORE_PATH=/^\/api\/research\/investigation-store\/(?:status|scopes|scopes\/members(?:\/\d{1,12})?|investigations(?:\/[0-9a-f-]{36}(?:\/(?:events|outputs|share|status))?)?)$/;

export type InvestigationStoreApiConfig={storeEnabled:boolean;writesEnabled:boolean;databaseUrl:string;neonProjectId?:string|null};
export type InvestigationStoreApiDependencies={openSql?:(databaseUrl:string)=>Promise<{sql:StoreSql;close:()=>Promise<void>|void}>};

function sessionFromCookie(req:Request):string|null{
 const values=(req.headers.get("cookie")??"").split(";").map(s=>s.trim());
 for(const name of ["__Secure-better-auth.session_token","better-auth.session_token"]){
  const pair=values.find(s=>s.startsWith(name+"="));
  if(pair){try{return decodeURIComponent(pair.slice(name.length+1))}catch{return null}}
 }
 return null;
}
async function defaultOpenSql(databaseUrl:string){
 const {SQL}=await import("bun");
 const sql=new SQL(databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 return {sql:sql as unknown as StoreSql,close:()=>sql.close()};
}
async function jsonBody(request:Request):Promise<Record<string,unknown>|Response>{
 if((request.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase()!=="application/json")return gatewayJson({code:"JSON_REQUIRED",error:"JSON required"},415);
 let body:unknown;
 try{body=JSON.parse(await boundedRequestText(request,250_000))}catch(e){if(e instanceof RequestBodyTooLarge||e instanceof RequestBodyTimeout)throw e;return gatewayJson({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 if(!body||typeof body!=="object"||Array.isArray(body))return gatewayJson({code:"OBJECT_REQUIRED",error:"A JSON object is required"},400);
 if(carriesApproval(body))return gatewayJson({code:"APPROVAL_NOT_ACCEPTED",error:"The store records work; it never records scientific approval"},422);
 if("ownerId" in body||"principalId" in body||"owner" in body)return gatewayJson({code:"OWNER_NOT_ACCEPTED",error:"The owner comes from your verified session, not the request"},400);
 return body as Record<string,unknown>;
}
const str=(v:unknown)=>typeof v==="string"?v:"";
/** Database errors are mapped to plain codes; details and tokens never leave the server. */
function dbError(e:unknown):Response{
 const m=String(e instanceof Error?e.message:e).toLowerCase();
 if(m.includes("invalid authenticated session"))return gatewayJson({code:"SESSION_REQUIRED",error:"Sign in again"},401);
 if(m.includes("researcher access denied"))return gatewayJson({code:"RESEARCHER_ACCESS_REQUIRED",error:"Researcher access has not been granted"},403);
 if(m.includes("not found"))return gatewayJson({code:"NOT_FOUND",error:"Not found"},404);
 if(m.includes("cannot be added"))return gatewayJson({code:"GRANTEE_NOT_ELIGIBLE",error:"That account needs a verified sign-in and researcher access first"},403);
 if(m.includes("self-grant"))return gatewayJson({code:"SELF_GRANT_REFUSED",error:"You cannot grant yourself a membership"},403);
 if(m.includes("not a member")||m.includes("scope admin")||m.includes("research admin"))return gatewayJson({code:"SCOPE_PERMISSION_REQUIRED",error:"That needs a membership you do not hold"},403);
 if(m.includes("check constraint")||m.includes("approval")||m.includes("needs 5 to 2000")||m.includes("pin the graph")||m.includes("unknown")||m.includes("not allowed"))return gatewayJson({code:"INVALID_INPUT",error:"The request was refused by a store rule"},422);
 return gatewayJson({code:"STORE_UNAVAILABLE",error:"The investigation store is unavailable"},503);
}

export async function handleInvestigationStoreApi(request:Request,config:InvestigationStoreApiConfig,dependencies:InvestigationStoreApiDependencies={}):Promise<Response|null>{
 const url=new URL(request.url),path=url.pathname;
 if(!INVESTIGATION_STORE_PATH.test(path))return null;
 const gate=assessGraphWorkspaceStoreGate({storeEnabled:config.storeEnabled,writesEnabled:config.writesEnabled,databaseUrl:config.databaseUrl,neonProjectId:config.neonProjectId});
 const reason=gate.reason.replace("HSI_GRAPH_WORKSPACE_STORE_ENABLED","HSI_INVESTIGATION_STORE_ENABLED").replace("Graph workspace store","Investigation store");
 if(path==="/api/research/investigation-store/status"){
  if(request.method!=="GET")return gatewayJson({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405);
  return gatewayJson({service:"hsi-investigation-store",enabled:gate.enabled,path:gate.defaultPath,reason,migration:"034_hsi_investigation_store",migrationHeldForProduction:true,adrs:["ADR-012","ADR-013","ADR-014"],scientificApproval:false});
 }
 if(!gate.enabled)return gatewayJson({code:"INVESTIGATION_STORE_DISABLED",error:"The shared investigation store is not switched on here. Investigations are kept in this browser.",path:"localStorage",reason},403);
 const token=sessionFromCookie(request);
 if(!token)return gatewayJson({code:"SESSION_REQUIRED",error:"Authentication required"},401);
 let handle:{sql:StoreSql;close:()=>Promise<void>|void}|undefined;
 try{
  handle=await (dependencies.openSql??defaultOpenSql)(config.databaseUrl);
  const store=createInvestigationStore(handle.sql,token);
  const m=/^\/api\/research\/investigation-store\/investigations(?:\/([0-9a-f-]{36})(?:\/(events|outputs|share|status))?)?$/.exec(path);
  const method=request.method;
  if(path==="/api/research/investigation-store/scopes"&&method==="GET")return gatewayJson({...(await store.scopes()),scientificApproval:false});
  if(path==="/api/research/investigation-store/scopes"&&method==="POST"){
   const b=await jsonBody(request);if(b instanceof Response)return b;
   await store.createScope(str(b.id),str(b.name));return gatewayJson({ok:true},201);
  }
  if(path==="/api/research/investigation-store/scopes/members"&&method==="POST"){
   const b=await jsonBody(request);if(b instanceof Response)return b;
   const role=str(b.role) as MembershipRole;
   if(!["researcher","reviewer","adjudicator","admin"].includes(role))return gatewayJson({code:"INVALID_INPUT",error:"Unknown role"},422);
   return gatewayJson({membership:await store.grant(str(b.member),str(b.scope),role),grantsApproval:false},201);
  }
  const rev=/^\/api\/research\/investigation-store\/scopes\/members\/(\d{1,12})$/.exec(path);
  if(rev&&method==="DELETE"){await store.revoke(Number(rev[1]));return gatewayJson({ok:true})}
  if(m&&!m[1]&&method==="GET")return gatewayJson({investigations:await store.list(),path:"server",scientificApproval:false});
  if(m&&!m[1]&&method==="POST"){
   const b=await jsonBody(request);if(b instanceof Response)return b;
   const id=await store.create({question:str(b.question),entities:Array.isArray(b.entities)?b.entities.map(String):[],graphVersion:str(b.graphVersion),scope:b.scope?str(b.scope):null});
   return gatewayJson({id,path:"server",scientificApproval:false},201);
  }
  if(m?.[1]&&!m[2]&&method==="GET"){
   const inv=await store.get(m[1]);
   return inv?gatewayJson({investigation:inv,path:"server",scientificApproval:false}):gatewayJson({code:"NOT_FOUND",error:"Not found"},404);
  }
  if(m?.[1]&&m[2]&&method==="POST"){
   const b=await jsonBody(request);if(b instanceof Response)return b;
   if(m[2]==="events")return gatewayJson({seq:await store.appendEvent(m[1],{kind:str(b.kind),payload:(b.payload&&typeof b.payload==="object"?b.payload:{}) as Record<string,unknown>,runId:b.runId?str(b.runId):undefined})},201);
   if(m[2]==="outputs"){
    if(!(OUTPUT_SECTIONS as readonly string[]).includes(str(b.section)))return gatewayJson({code:"INVALID_INPUT",error:"Unknown section"},422);
    return gatewayJson({version:await store.addOutput(m[1],{section:str(b.section) as OutputSection,body:(b.body??{}) as Record<string,unknown>,lineage:(b.lineage??{}) as Record<string,unknown>})},201);
   }
   if(m[2]==="share"){await store.share(m[1],str(b.scope),b.shared===true);return gatewayJson({ok:true})}
   if(m[2]==="status"){const s=str(b.status);if(s!=="active"&&s!=="archived")return gatewayJson({code:"INVALID_INPUT",error:"Unknown status"},422);await store.setStatus(m[1],s);return gatewayJson({ok:true})}
  }
  return gatewayJson({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405);
 }catch(e){
  if(e instanceof RequestBodyTooLarge)return gatewayJson({code:"BODY_TOO_LARGE",error:"Request too large"},413);
  if(e instanceof RequestBodyTimeout)return gatewayJson({code:"BODY_TIMEOUT",error:"Request timed out"},408);
  return dbError(e);
 }finally{await handle?.close()}
}
