/** HTTP surface for recorded-fixture literature runs: submit, status, health and the verified brief.
 *
 * Fixture mode only. Every run uses RECORDED provider responses (see `literatureFixtureJob.ts`); the brief says so and cannot be relabelled. It
 * is mounted by whatever host owns the NEXUS `out` directory and supplies the three server-side dependencies below. It is NOT wired into
 * `vercelResearch.ts` or any Vercel entry: serverless functions have no durable local disk for the job queue, the research writes flag and
 * the database migrations are held, and #622/#624 touch those entries. Until a host with a durable store exists, production returns 404
 * for these routes and the workbench page says so.
 *
 * Identity never comes from the request body. The session token is derived by the host (`sessionToken(request)`, for example from the verified
 * provider cookie); ownership comes from the signed grant through the caller authority; the browser sends only an investigation id and search
 * terms. Not found and not yours are the same 404. Responses carry no grant id, tenant reference, path or provider text. */
import {existsSync} from "node:fs";
import {join,resolve} from "node:path";
import type {GatewayCallerAuthority} from "../gatewayCallerAuthority";
import {loadJobBrief,resultFile} from "../literatureFixtureJob";
import {renderLiteratureBrief} from "../literatureBrief";
import {createJobJournal} from "../nexusJobs";
import {authoriseJobOwner,submitAuthenticatedLiteratureJob} from "../nexusRunCommand";
import {nexusHealth} from "../nexusWorkerHealth";

export type NexusFixtureApiDeps={
 /** The directory the NEXUS worker drains. */
 out:string;authority:GatewayCallerAuthority;
 /** Server-derived session token (verified cookie or header). Never read from the body or query. */
 sessionToken:(request:Request)=>string|null;
 /** Server-side check that the token belongs to a verified researcher; used by the health route, which has no investigation. */
 authenticate:(token:string)=>Promise<boolean>;
 /** The only origin allowed to POST. Required: this API refuses to run without a same-origin check. */
 publicOrigin:string;
 /** Mirrors the research writes flag. Submitting is refused when false. */
 writesEnabled:boolean;
 now?:()=>number;
};
const PREFIX="/api/research/nexus/";
const JOB_ID=/^fl-[a-f0-9]{16}$/;
const INVESTIGATION=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const MAX_BODY=4_096;
const HEADERS={"cache-control":"no-store","x-content-type-options":"nosniff"} as const;

const json=(body:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{...HEADERS,"content-type":"application/json; charset=utf-8",...extra}});
const fail=(code:string,status:number,error:string,extra:Record<string,string>={})=>json({code,error},status,extra);
const REFUSALS:Record<string,[number,string,string]>={
 unauthenticated:[401,"AUTH_REQUIRED","Sign in with verified research access."],
 invalid_request:[400,"INVALID_REQUEST","The request was not valid."],
 unavailable:[503,"SERVICE_UNAVAILABLE","The service could not verify this request. Try again later."],
};
function refusal(code:string):Response{
 const r=REFUSALS[code];if(r)return fail(r[1],r[0],r[2]);
 return fail("NOT_FOUND",404,"Not found"); // forbidden, no_grant, unreadable grant: indistinguishable from an unknown job
}

export async function handleNexusFixtureApi(request:Request,deps:NexusFixtureApiDeps):Promise<Response|null>{
 const url=new URL(request.url);
 if(!url.pathname.startsWith(PREFIX))return null;
 const rest=url.pathname.slice(PREFIX.length).replace(/\/+$/,"");
 const out=resolve(deps.out);
 const token=deps.sessionToken(request);
 const method=request.method;

 if(rest==="health"){
  if(method!=="GET")return fail("METHOD_NOT_ALLOWED",405,"Method not allowed",{allow:"GET"});
  if(!token||!(await deps.authenticate(token).catch(()=>false)))return refusal("unauthenticated");
  // Coarse on purpose: no counts, no worker ids, no job ids. Another researcher's activity is not visible here.
  const h=nexusHealth({out,now:deps.now});
  return json({status:h.status,reasons:h.reasons,at:h.at,dataMode:"fixture_recorded"});
 }

 if(rest==="jobs"){
  if(method!=="POST")return fail("METHOD_NOT_ALLOWED",405,"Method not allowed",{allow:"POST"});
  if(request.headers.get("origin")!==deps.publicOrigin)return fail("ORIGIN_REFUSED",403,"Cross-origin requests are not accepted.");
  if(!/^application\/json(\s*;|$)/i.test(request.headers.get("content-type")??""))return fail("INVALID_REQUEST",415,"JSON required.");
  if(!deps.writesEnabled)return fail("RESEARCH_WRITES_DISABLED",403,"Starting a run requires enabled research writes.");
  if(!token)return refusal("unauthenticated");
  const len=Number(request.headers.get("content-length")??"0");
  if(Number.isFinite(len)&&len>MAX_BODY)return fail("INVALID_REQUEST",413,"Request too large.");
  const text=await request.text();
  if(text.length>MAX_BODY)return fail("INVALID_REQUEST",413,"Request too large.");
  let body:unknown;try{body=JSON.parse(text)}catch{return refusal("invalid_request")}
  const b=body as {investigationId?:unknown;terms?:unknown};
  // Exactly these two keys. Tenant, roles, grant, job kind and fixture choice are not the browser's to set.
  if(!b||typeof b!=="object"||Array.isArray(b)||Object.keys(b).sort().join(",")!=="investigationId,terms"||typeof b.investigationId!=="string"||!INVESTIGATION.test(b.investigationId))return refusal("invalid_request");
  const r=await submitAuthenticatedLiteratureJob({out,terms:b.terms,authority:deps.authority,sessionToken:token,investigationId:b.investigationId,now:deps.now}).catch(()=>({ok:false as const,code:"unavailable"}));
  if(!r.ok)return refusal(r.code);
  return json({jobId:r.jobId,created:r.created,dataMode:"fixture_recorded"},r.created?202:200);
 }

 const m=/^jobs\/(fl-[a-f0-9]{16})(?:\/(brief))?$/.exec(rest);
 if(m&&JOB_ID.test(m[1]!)){
  if(method!=="GET")return fail("METHOD_NOT_ALLOWED",405,"Method not allowed",{allow:"GET"});
  if(!token)return refusal("unauthenticated");
  const jobId=m[1]!;
  const owner=await authoriseJobOwner({out,authority:deps.authority,sessionToken:token,jobId}).catch(()=>({ok:false as const,code:"unavailable"}));
  if(!owner.ok)return refusal(owner.code);
  const state=createJobJournal(join(out,"jobs"),{now:deps.now}).state(jobId);
  if(!state)return refusal("forbidden");
  if(!m[2]){
   return json({jobId,status:state.status,attempts:state.attempts,cancelRequested:state.cancelRequested,progress:state.progress?{stage:state.progress.stage,step:state.progress.step,of:state.progress.of}:null,
    errorCode:state.lastErrorCode,briefAvailable:state.status==="completed"&&existsSync(resultFile(out,jobId)),dataMode:"fixture_recorded"});
  }
  if(state.status!=="completed")return fail("BRIEF_NOT_READY",409,"The brief is not ready.");
  let loaded;try{loaded=await loadJobBrief(out,jobId)}catch{return fail("BRIEF_UNVERIFIED",502,"The stored brief failed verification and was not served.")}
  if(!loaded)return fail("BRIEF_NOT_READY",409,"The brief is not ready.");
  const format=url.searchParams.get("format")??"json";
  if(format!=="json"&&format!=="markdown")return refusal("invalid_request");
  const body=renderLiteratureBrief(loaded.brief,format);
  return new Response(body,{status:200,headers:{...HEADERS,"content-type":format==="json"?"application/json; charset=utf-8":"text/markdown; charset=utf-8","content-disposition":`attachment; filename="${jobId}-${loaded.brief.contentHash.slice(0,12)}.${format==="json"?"json":"md"}"`,"x-hsi-brief-sha256":loaded.brief.contentHash}});
 }
 return fail("NOT_FOUND",404,"Not found");
}
