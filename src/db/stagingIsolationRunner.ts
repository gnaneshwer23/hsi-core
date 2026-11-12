/** Bounded scope-specific HTTP observation runner. Never signs acceptance or runs migrations. */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {PERSISTENCE_SCOPE_MIGRATIONS,type PersistenceScope} from "./migrationRehearsal";
import {PERSISTENCE_SECURITY_CHECKS,type PersistenceSecurityCheck} from "./persistenceSecurityAcceptance";
export const NEXT_B_UNASSIGNED = Object.freeze({staging_target_ref:"NOT_APPROVED",private_config_ref:"UNASSIGNED",researcher_a_ref:"UNASSIGNED",researcher_b_ref:"UNASSIGNED",reviewer_ref:"UNASSIGNED",security_signer_ref:"UNASSIGNED",approval_record_ref:"NOT_APPROVED"});
export type IsolationActor="researcher_a"|"researcher_b"|"reviewer"|"revoked_session"|"anonymous";
export type IsolationProbe={id:string;check:PersistenceSecurityCheck;actor:IsolationActor;path:string;method:"GET"|"POST";body?:unknown;expectedStatus:number;expectedBodySha256:string};
const digest=(value:string)=>createHash("sha256").update(value).digest("hex");
const hex=(v:unknown)=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
/** Exact JSON digest assertions require positive controls; denied status alone is not evidence of isolation. */
export function createStagingIsolationRunner(options:{
 enabled?:boolean;fixture:boolean;origin:string;approvedOrigin:string;productionOrigins:readonly string[];
 scope:PersistenceScope;targetHash:string;commitSha:string;allowStagingMutations?:boolean;
 authorize:()=>Promise<boolean>;session:(actor:IsolationActor)=>Promise<string|null>;
 /** Trusted server transport: redirects must be rejected. Never accept transport/configuration from clients. */
 transport:(request:Request)=>Promise<Response>;timeoutMs?:number;maxResponseBytes?:number;
}){
 const o={...options,productionOrigins:[...options.productionOrigins]},timeout=o.timeoutMs??5000,max=o.maxResponseBytes??65536;
 const url=new URL(o.origin);
 if(url.protocol!=="https:"||url.origin!==o.origin||o.origin!==o.approvedOrigin||!o.productionOrigins.length||o.productionOrigins.includes(o.origin)||!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,o.scope)||!hex(o.targetHash)||!/^[a-f0-9]{40}$/.test(o.commitSha)||!Number.isInteger(timeout)||timeout<100||timeout>30000||!Number.isInteger(max)||max<256||max>1000000)throw Error("Invalid isolated staging binding");
 let running=false;
 return {async run(input:readonly IsolationProbe[]){
  if(o.enabled!==true)throw Error("Isolation HTTP execution disabled");
  if(running)throw Error("Isolation run already active");
  const probes=structuredClone(input);
  if(!Array.isArray(probes)||!probes.length||probes.length>100||new Set(probes.map(p=>p?.id)).size!==probes.length)throw Error("Invalid isolation probes");
  for(const p of probes){
   if(!p||!/^[-a-z0-9_]{1,100}$/.test(p.id)||!PERSISTENCE_SECURITY_CHECKS.includes(p.check)||["restricted_role_no_bypassrls","production_readonly_confirmed","migration_rollback_verified","backup_restore_verified"].includes(p.check)||!["researcher_a","researcher_b","reviewer","revoked_session","anonymous"].includes(p.actor)||typeof p.path!=="string"||!/^\/api\/research\/[A-Za-z0-9/_-]+(?:\?[A-Za-z0-9_=&%-]*)?$/.test(p.path)||!["GET","POST"].includes(p.method)||p.method==="POST"&&!o.allowStagingMutations||p.method==="GET"&&p.body!==undefined||!Number.isInteger(p.expectedStatus)||p.expectedStatus<200||p.expectedStatus>499||!hex(p.expectedBodySha256)||JSON.stringify(p.body??null).length>16000)throw Error("Invalid isolation probe boundary");
  }
  running=true;
  const observations=[];
  try{
   for(const p of probes){
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
    let status:number|null=null,bodySha256:string|null=null,outcome="failed";
    try{
     const operation=async()=>{
      if(await o.authorize()!==true)throw Error("Not approved");
      const session=await o.session(p.actor);
      if(controller.signal.aborted||p.actor==="anonymous"&&session!==null||p.actor!=="anonymous"&&(!session||/[\r\n]/.test(session)))throw Error("Session unavailable");
      const headers=new Headers({accept:"application/json"});if(session)headers.set("cookie",session);
      if(p.method==="POST")headers.set("content-type","application/json");
      const response=await o.transport(new Request(o.origin+p.path,{method:p.method,headers,body:p.method==="POST"?JSON.stringify(p.body??{}):undefined,redirect:"error",signal:controller.signal}));
      if(controller.signal.aborted||response.redirected||response.url&&new URL(response.url).origin!==o.origin)throw Error("Redirect refused");
      status=response.status;
      if(!response.body)throw Error("Missing response");
      const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
      try{for(;;){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>max)throw Error("Overflow");chunks.push(next.value);}}finally{void reader.cancel().catch(()=>{});}
      const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
      bodySha256=digest(canonicalEvidenceJson(JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes))));
      return status===p.expectedStatus&&bodySha256===p.expectedBodySha256;
     };
     const passed=await Promise.race([operation(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Deadline"));},timeout)})]);
     outcome=passed?"matched":"mismatch";
    }catch{/* Never retain raw transport/auth errors, sessions or response contents. */}
    finally{if(timer)clearTimeout(timer);controller.abort();}
    observations.push({probeId:p.id,check:p.check,actor:p.actor,status,bodySha256,outcome});
    if(outcome!=="matched")break;
   }
   return {scope:o.scope,targetHash:o.targetHash,commitSha:o.commitSha,fixture:o.fixture,observations,unexecutedProbeIds:probes.slice(observations.length).map(p=>p.id),acceptedForScope:false as const,productionActivationApproved:false as const,scientificApproval:false as const};
  }finally{running=false;}
 }};
}
