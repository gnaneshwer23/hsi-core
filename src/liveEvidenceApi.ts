/** Authenticated A-01 protocol. Persistence stays disabled until RLS and staging gates pass.
 * Server supplies the verified owner and database adapter; browser cannot supply either.
 */
import {createLiveEvidenceRepository,LiveConflict,LiveDenied,type LiveSql} from "./liveEvidenceRepository";
import {createLiveInvestigationTrace} from "./liveInvestigationTrace";
export type LiveSession={principalId:string;roles:readonly string[];authenticated:true};
export type LiveApiDependencies={
 authenticate:(sessionToken:string)=>Promise<LiveSession|null>;
 database:(principal:LiveSession)=>Promise<{sql:LiveSql;close:()=>Promise<void>}>;
 writesEnabled:boolean;
 retrieve?:(question:string)=>Promise<Awaited<ReturnType<typeof createLiveInvestigationTrace>>>;
};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store","Vary":"Cookie","X-Content-Type-Options":"nosniff"}});
function cookie(request:Request):string|null{
 const raw=request.headers.get("cookie")??"";
 for(const name of ["__Secure-better-auth.session_token","better-auth.session_token"]){
  const pair=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  if(pair){try{const token=decodeURIComponent(pair.slice(name.length+1));return token.length>=16&&token.length<=4096&&!/\s/.test(token)?token:null}catch{return null}}
 }
 return null;
}
export async function handleLiveEvidenceApi(request:Request,deps:LiveApiDependencies):Promise<Response>{
 if(!["GET","POST"].includes(request.method))return json({error:"method_not_allowed"},405);
 const url=new URL(request.url),path=url.pathname;
 if(path!=="/api/research/live-investigations"&&!/^\/api\/research\/live-investigations\/hsi-live-[a-f0-9]{32}$/.test(path))return json({error:"not_found"},404);
 const token=cookie(request);if(!token)return json({error:"authentication_required"},401);
 let actor:LiveSession|null;
 try{actor=await deps.authenticate(token)}catch{return json({error:"authentication_unavailable"},503)}
 if(!actor?.authenticated||!actor.principalId||!actor.roles.some(x=>x==="researcher"||x==="research_admin"))return json({error:"research_access_denied"},403);
 if(!deps.writesEnabled)return json({error:"live_persistence_disabled"},503);
 const isCollection=path==="/api/research/live-investigations";
 if(request.method==="POST"){
  if(!isCollection)return json({error:"method_not_allowed"},405);
  if(request.headers.get("origin")!==url.origin||request.headers.get("sec-fetch-site")==="cross-site")return json({error:"origin_denied"},403);
  if(request.headers.get("content-type")?.split(";")[0]?.trim()!=="application/json")return json({error:"json_required"},415);
  const length=Number(request.headers.get("content-length")??"0");
  if(length>2048)return json({error:"request_too_large"},413);
  let payload:unknown;
  try{
   const body=await request.text();if(body.length>2048)return json({error:"request_too_large"},413);
   payload=JSON.parse(body);
  }catch{return json({error:"invalid_json"},400)}
  if(!payload||typeof payload!=="object"||Array.isArray(payload)||Object.keys(payload).sort().join(",")!=="question,requestId")return json({error:"invalid_request"},400);
  const {question,requestId}=payload as Record<string,unknown>;
  if(typeof question!=="string"||question.trim().length<5||question.length>400||/[<>\u0000-\u001f]/.test(question)||typeof requestId!=="string")return json({error:"invalid_request"},400);
  let connection:Awaited<ReturnType<LiveApiDependencies["database"]>>|undefined;
  try{
   // Never accept a client-supplied bundle, principal, role or review status.
   const trace=await (deps.retrieve??createLiveInvestigationTrace)(question.trim());
   connection=await deps.database(actor);
   const result=await createLiveEvidenceRepository(connection.sql,actor.principalId).create(requestId,trace.bundle);
   return json({id:result.record.id,revision:result.record.revision,created:result.created,reviewStatus:"unreviewed",kgWrite:false},result.created?201:200);
  }catch(e){return e instanceof LiveConflict?json({error:"idempotency_conflict"},409):e instanceof LiveDenied?json({error:"invalid_research_bundle"},400):json({error:"investigation_unavailable"},503)}
  finally{await connection?.close()}
 }
 if(url.search)return json({error:"query_overrides_denied"},400);
 let connection:Awaited<ReturnType<LiveApiDependencies["database"]>>|undefined;
 try{
  connection=await deps.database(actor);
  const repo=createLiveEvidenceRepository(connection.sql,actor.principalId);
  if(isCollection){const records=await repo.list();return json({items:records.map(x=>({id:x.id,question:x.question,revision:x.revision,createdAt:x.createdAt}))})}
  const record=await repo.get(path.split("/").at(-1)!);
  return record?json({record}):json({error:"not_found"},404);
 }catch{return json({error:"investigation_unavailable"},503)}
 finally{await connection?.close()}
}
