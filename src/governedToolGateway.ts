/** Governed tool gateway: the one path by which an HSI agent may reach an external scientific tool.
 *
 * It is a policy layer, not evidence that a source is authoritative. Every call is checked in this order and fails closed:
 * registered tool -> agent manifest permission (existing `assertHsiToolPermission`) -> input schema -> licence/clearance ->
 * idempotency replay -> per-investigation budget -> per-tool rate limit -> execution under a timeout, bounded retries, an
 * https host allowlist, no redirects and a response byte cap -> output schema -> sanitise and flag -> provenance -> audit.
 *
 * What it does NOT do, stated plainly:
 * - It is not an MCP server or client. The catalogue and call contract are protocol-neutral so an MCP transport can sit in
 *   front of it later; no MCP wire protocol is implemented here.
 * - Prompt-injection handling is structural (strict output schema, field caps, control-character stripping, output marked
 *   `untrusted`, never concatenated into instructions) plus a heuristic flag. A flag is a signal for review, not a guarantee.
 * - Budgets and rate limits default to memory and reset on restart; pass `createFileLimitStore` (`gatewayLimitStore.ts`) to
 *   persist them on one host. The default idempotency store is in memory; `createFileIdempotencyStore` survives a restart
 *   on one host. Several hosts would need a shared store, which does not exist yet.
 * - The host allowlist is by hostname; it does not pin DNS. Public-address pinning exists for model providers in
 *   `researchV2/pinnedProviderTransport.ts` and is not applied here.
 * - The audit log is hash-chained and holds identifiers, hashes and codes only: never inputs, passages or upstream text.
 *   The file-backed log assumes a single writer.
 * - Caller identity is trusted. `manifest`, `investigationId` and `taskId` are supplied by the caller; the gateway validates the
 *   manifest's shape and role allowlist but cannot authenticate who is calling. `investigationCeiling` bounds task-id rotation within
 *   one investigation id, not rotation of the investigation id itself. Stored idempotent results are bound to (investigation, task)
 *   and re-verified against their own hash on replay.
 * - Dropping the tail of the audit log is not detectable from the chain alone; anchor the head hash elsewhere.
 */
import {createHash} from "node:crypto";
import {appendFileSync,closeSync,existsSync,fsyncSync,mkdirSync,openSync,readFileSync,renameSync,writeSync} from "node:fs";
import {join} from "node:path";
import {createMemoryLimitStore,type GatewayLimitStore} from "./gatewayLimitStore";
import {currentCorrelation,type Logger} from "./observability";
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import {assertHsiToolPermission,HSI_TOOL_IDS,type HsiAgentManifest,type HsiDataClass,type HsiToolId} from "./hsiAgentIntelligenceContracts";
import {europePmcAdapter,type PublicSourceRecord,type SourceFetcher} from "./researchV2/sourceAdapters";

export type RefusalCode="tool_not_registered"|"permission_denied"|"invalid_input"|"licence_blocked"|"budget_exhausted"|"rate_limited"|"egress_blocked"|"timeout"|"upstream_error"|"response_too_large"|"invalid_output"|"aborted"|"internal_error";
const MESSAGES:Record<RefusalCode,string>={
 tool_not_registered:"Tool is not in the approved catalogue",permission_denied:"Agent is not permitted to use this tool",invalid_input:"Input failed validation",
 licence_blocked:"Source licence or clearance does not permit this call",budget_exhausted:"Investigation tool-call budget is exhausted",rate_limited:"Tool rate limit reached",
 egress_blocked:"Request left the approved host list",timeout:"Tool call timed out",upstream_error:"Upstream provider failed",response_too_large:"Response exceeded the byte limit",
 invalid_output:"Provider response failed validation",aborted:"Call was cancelled",internal_error:"Gateway failed closed",
};
class GatewayError extends Error{constructor(readonly code:RefusalCode){super(MESSAGES[code])}}

export type ToolContext={fetch:SourceFetcher;signal:AbortSignal};
export type ToolDefinition<I=unknown,O=unknown>={
 id:HsiToolId;providerId:string;version:string;dataClass:Exclude<HsiDataClass,"identifiable_clinical">;
 /** Exact https hostnames this tool may contact. */
 hosts:readonly string[];
 /** `cleared_only` tools may return passage text and need a clearance check on the gateway; `metadata_only` never may. */
 passageAccess:"metadata_only"|"cleared_only";
 timeoutMs:number;maxAttempts:number;maxResponseBytes:number;ratePerMinute:number;
 parseInput:(value:unknown)=>I;parseOutput:(value:unknown)=>O;
 execute:(input:I,ctx:ToolContext)=>Promise<unknown>;
};
export type ToolProvenance={toolId:HsiToolId;providerId:string;toolVersion:string;retrievedAt:string;requestHash:string;responseHash:string;attempt:number;hosts:readonly string[];passageAccess:ToolDefinition["passageAccess"];dataClass:string};
export type InjectionFlag={code:"possible_prompt_injection";path:string};
export type ToolResult<O=unknown>=
 |{ok:true;data:O;/** Always true: tool output is data, never instructions. */untrusted:true;provenance:ToolProvenance;flags:InjectionFlag[];replayed:boolean;auditSeq:number}
 |{ok:false;code:RefusalCode;message:string;auditSeq:number};
export type ToolRequest={manifest:HsiAgentManifest;investigationId:string;taskId:string;invocationId:string;tool:string;/** Required when more than one provider is registered for the tool id; ambiguity is refused, never guessed. */provider?:string;input:unknown;signal?:AbortSignal};

/* ---------- audit log ---------- */
export type AuditRecord={seq:number;at:string;investigationId:string;taskId:string;invocationId:string;role:string;toolId:string;providerId:string|null;outcome:"success"|"replayed"|"refused";code:RefusalCode|null;attempts:number;durationMs:number;requestHash:string|null;responseHash:string|null;flags:number;/** Present only when the call ran inside `runWithCorrelation`. */requestId?:string;traceId?:string;prevHash:string;hash:string};
const GENESIS="0".repeat(64);
const recordHash=(r:Omit<AuditRecord,"hash">)=>createHash("sha256").update(JSON.stringify(r)).digest("hex");
export function verifyAuditChain(records:readonly AuditRecord[]):{ok:boolean;brokenAt:number|null}{
 let prev=GENESIS;
 for(const [i,r] of records.entries()){
  const {hash,...rest}=r;
  if(r.seq!==i+1||r.prevHash!==prev||recordHash(rest)!==hash)return {ok:false,brokenAt:i+1};
  prev=hash;
 }
 return {ok:true,brokenAt:null};
}
export function createToolAuditLog(opts:{directory?:string;now?:()=>number}={}){
 const now=opts.now??Date.now,file=opts.directory?join(opts.directory,"tool-audit.jsonl"):null;
 if(opts.directory)mkdirSync(opts.directory,{recursive:true});
 const records:AuditRecord[]=file&&existsSync(file)?readFileSync(file,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l) as AuditRecord):[];
 if(!verifyAuditChain(records).ok)throw Error("Tool audit log failed integrity verification");
 return {
  append(entry:Omit<AuditRecord,"seq"|"at"|"prevHash"|"hash">):number{
   const base={seq:records.length+1,at:new Date(now()).toISOString(),...entry,prevHash:records.length?records[records.length-1]!.hash:GENESIS};
   const rec:AuditRecord={...base,hash:recordHash(base)};
   if(file)appendFileSync(file,JSON.stringify(rec)+"\n",{flag:"a"});
   records.push(rec);return rec.seq;
  },
  records:():readonly AuditRecord[]=>records.map(r=>({...r})),
  verify:()=>verifyAuditChain(records),
 };
}
export type ToolAuditLog=ReturnType<typeof createToolAuditLog>;

/* ---------- idempotency ---------- */
/** `scope` binds a stored result to the investigation and task that created it; a record without one is never replayed. */
export type IdempotencyRecord={requestHash:string;scope:string;result:Extract<ToolResult,{ok:true}>};
export type IdempotencyStore={get(invocationId:string):Promise<IdempotencyRecord|null>;put(invocationId:string,value:IdempotencyRecord):Promise<void>};
export function createMemoryIdempotencyStore():IdempotencyStore{
 const m=new Map<string,IdempotencyRecord>();
 return {async get(id){const v=m.get(id);return v?structuredClone(v):null},async put(id,v){m.set(id,structuredClone(v))}};
}

/** Durable idempotency on one host: one file per invocation id, written atomically (temp file, flush, rename).
 * A replayed result is the recorded sanitised output, so a recovered run sees the same data without a second request.
 * It stores tool output, so the directory must be treated like the investigation's own data (private, not public). */
export function createFileIdempotencyStore(dir:string):IdempotencyStore{
 mkdirSync(dir,{recursive:true});
 const path=(id:string)=>{if(!INVOCATION.test(id))throw Error("Invalid invocation id");return join(dir,id+".json")};
 return {
  async get(id){const f=path(id);if(!existsSync(f))return null;return JSON.parse(readFileSync(f,"utf8"))},
  async put(id,v){
   const f=path(id),tmp=`${f}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
   const fd=openSync(tmp,"wx");try{writeSync(fd,JSON.stringify(v));fsyncSync(fd)}finally{closeSync(fd)}
   renameSync(tmp,f);
  },
 };
}

/* ---------- output handling ---------- */
const INJECTION:readonly RegExp[]=[
 /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
 /disregard\s+.{0,40}(instructions?|rules?|guidelines?)/i,
 /\b(you\s+are\s+now|new\s+instructions?\s*:|act\s+as\s+(an?\s+)?(system|admin|developer))/i,
 /\b(system|developer)\s+prompt\b/i,
 /<\/?\s*(system|assistant|tool|function_call|tool_call)\b[^>]*>/i,
 /\[\[?\s*(INST|SYSTEM)\s*\]?\]/i,
];
const MAX_STRING=2_000,MAX_KEY=200,MAX_NODES=20_000,MAX_DEPTH=32;
// Control characters and every Unicode format character (zero-width, bidi, BOM, soft hyphen, tag characters) are removed.
// eslint-disable-next-line no-control-regex
const STRIP=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]|\p{Cf}/gu;
function sanitise(value:unknown):{data:unknown;flags:InjectionFlag[]}{
 const flags:InjectionFlag[]=[];let nodes=0;
 // The heuristic runs on a compatibility-normalised copy, so fullwidth and similar forms cannot hide the phrase.
 const text=(raw:string,max:number,path:string):string=>{
  const clean=raw.replace(STRIP,"").slice(0,max);
  const probe=clean.normalize("NFKC");
  if(INJECTION.some(r=>r.test(probe)))flags.push({code:"possible_prompt_injection",path});
  return clean;
 };
 const walk=(v:unknown,path:string,depth:number):unknown=>{
  if(++nodes>MAX_NODES||depth>MAX_DEPTH)throw new GatewayError("invalid_output");
  if(typeof v==="string")return text(v,MAX_STRING,path);
  if(Array.isArray(v))return v.map((x,i)=>walk(x,`${path}[${i}]`,depth+1));
  if(v&&typeof v==="object")return Object.fromEntries(Object.entries(v as Record<string,unknown>).map(([k,x])=>{
   const key=text(k,MAX_KEY,`${path}.<key>`);
   return [key,walk(x,path?`${path}.${key}`:key,depth+1)];
  }));
  return v;
 };
 return {data:walk(value,"data",0),flags};
}

/* ---------- guarded fetch ---------- */
async function readCapped(res:Response,max:number,signal:AbortSignal):Promise<Uint8Array>{
 const declared=Number(res.headers.get("content-length"));
 if(Number.isFinite(declared)&&declared>max){await res.body?.cancel();throw new GatewayError("response_too_large")}
 if(!res.body)return new Uint8Array();
 const reader=res.body.getReader(),chunks:Uint8Array[]=[];let total=0;
 const onAbort=()=>{reader.cancel().catch(()=>{})};signal.addEventListener("abort",onAbort,{once:true});
 try{for(;;){
  if(signal.aborted)throw Error("aborted");
  const {done,value}=await reader.read();if(done)break;
  total+=value.byteLength;
  if(total>max){await reader.cancel();throw new GatewayError("response_too_large")}
  chunks.push(value);
 }}finally{signal.removeEventListener("abort",onAbort)}
 if(signal.aborted)throw Error("aborted");
 const out=new Uint8Array(total);let o=0;for(const c of chunks){out.set(c,o);o+=c.byteLength}return out;
}
function guardedFetch(tool:ToolDefinition,base:SourceFetcher,signal:AbortSignal):SourceFetcher{
 return async(input,init)=>{
  let u:URL;
  try{u=new URL(typeof input==="string"||input instanceof URL?String(input):input.url)}catch{throw new GatewayError("egress_blocked")}
  if(u.protocol!=="https:"||u.username||u.password||(u.port&&u.port!=="443")||!tool.hosts.includes(u.hostname))throw new GatewayError("egress_blocked");
  const res=await base(u.toString(),{...init,redirect:"error",credentials:"omit",signal:init?.signal?AbortSignal.any([signal,init.signal]):signal});
  const bytes=await readCapped(res,tool.maxResponseBytes,signal);
  return new Response(bytes as unknown as BodyInit,{status:res.status,statusText:res.statusText,headers:res.headers});
 };
}

/* ---------- gateway ---------- */
const HOST=/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
const INVOCATION=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,120}$/;
export function validateToolDefinition(t:ToolDefinition):void{
 if(!(HSI_TOOL_IDS as readonly string[]).includes(t.id)||!t.providerId?.trim()||!/^\d+\.\d+\.\d+$/.test(t.version))throw Error("Invalid tool identity");
 if(!Array.isArray(t.hosts)||!t.hosts.length||t.hosts.some(h=>!HOST.test(h)||!/[a-z]/.test(h.slice(h.lastIndexOf(".")+1))))throw Error("Tool needs an explicit list of lowercase hostnames");
 if(!["metadata_only","cleared_only"].includes(t.passageAccess))throw Error("Invalid passage access");
 if(!Number.isInteger(t.timeoutMs)||t.timeoutMs<100||t.timeoutMs>60_000||!Number.isInteger(t.maxAttempts)||t.maxAttempts<1||t.maxAttempts>3||!Number.isInteger(t.maxResponseBytes)||t.maxResponseBytes<1_024||t.maxResponseBytes>10_000_000||!Number.isInteger(t.ratePerMinute)||t.ratePerMinute<1||t.ratePerMinute>600)throw Error("Invalid tool limits");
}
export type GatewayOptions={
 tools:readonly ToolDefinition[];audit:ToolAuditLog;fetcher?:SourceFetcher;idempotency?:IdempotencyStore;
 /** Per-task call budgets and per-provider rate windows. Default is in memory (reset on restart); pass `createFileLimitStore` to persist them. */
 limits?:GatewayLimitStore;
 /** Total calls one investigation may make across all its task ids, so rotating `taskId` cannot mint fresh budgets. Default 1000. */
 investigationCeiling?:number;
 /** Optional structured logger. One event per call (`gateway.tool_call`): codes, ids, counts and hashes only, never inputs or output. */
 logger?:Logger;
 /** Required for any `cleared_only` tool. Absent or false means the call is refused. */
 clearance?:(ctx:{investigationId:string;toolId:HsiToolId;providerId:string})=>boolean|Promise<boolean>;
 now?:()=>number;sleep?:(ms:number)=>Promise<void>;
};
export function createToolGateway(opts:GatewayOptions){
 const registry=new Map<string,ToolDefinition>(),byId=new Map<string,ToolDefinition[]>();
 const keyOf=(id:string,provider:string)=>`${id}@${provider}`;
 for(const t of opts.tools){
  validateToolDefinition(t);const k=keyOf(t.id,t.providerId);
  if(registry.has(k))throw Error("Duplicate tool and provider");
  registry.set(k,t);byId.set(t.id,[...(byId.get(t.id)??[]),t]);
 }
 const now=opts.now??Date.now,sleep=opts.sleep??(ms=>new Promise<void>(r=>setTimeout(r,ms))),base=opts.fetcher??fetch;
 const idem=opts.idempotency??createMemoryIdempotencyStore();
 const limits=opts.limits??createMemoryLimitStore();
 const ceiling=opts.investigationCeiling??1_000;
 if(!Number.isInteger(ceiling)||ceiling<1)throw Error("Invalid investigation ceiling");

 return {
  catalogue:()=>[...registry.values()].map(t=>({id:t.id,providerId:t.providerId,version:t.version,hosts:[...t.hosts],passageAccess:t.passageAccess,dataClass:t.dataClass})),
  async call(req:ToolRequest):Promise<ToolResult>{
   const started=now();
   const cap=(v:unknown,n=200)=>String(v??"").slice(0,n);
   const corr=currentCorrelation();
   const log=(o:{outcome:AuditRecord["outcome"];code:RefusalCode|null;tool?:ToolDefinition;attempts?:number;requestHash?:string|null;responseHash?:string|null;flags?:number}):number=>{
    const seq=opts.audit.append({
    investigationId:cap(req?.investigationId),taskId:cap(req?.taskId),invocationId:cap(req?.invocationId),role:cap(req?.manifest?.role),
    toolId:cap(req?.tool,60),providerId:o.tool?.providerId??null,outcome:o.outcome,code:o.code,attempts:o.attempts??0,durationMs:Math.max(0,now()-started),
    requestHash:o.requestHash??null,responseHash:o.responseHash??null,flags:o.flags??0,...(corr?{requestId:corr.requestId,...(corr.traceId?{traceId:corr.traceId}:{})}:{})});
    opts.logger?.log(o.outcome==="refused"?"warn":"info","gateway.tool_call",{toolId:cap(req?.tool,60),providerId:o.tool?.providerId??null,outcome:o.outcome,code:o.code,attempts:o.attempts??0,durationMs:Math.max(0,now()-started),flags:o.flags??0,auditSeq:seq,requestHash:o.requestHash??null,responseHash:o.responseHash??null});
    return seq;
   };
   const refuse=(code:RefusalCode,tool?:ToolDefinition,extra:{attempts?:number;requestHash?:string|null}={}):ToolResult=>({ok:false,code,message:MESSAGES[code],auditSeq:log({outcome:"refused",code,tool,...extra})});
   try{
    if(!req||typeof req.investigationId!=="string"||!req.investigationId.trim()||typeof req.taskId!=="string"||!req.taskId.trim()||!INVOCATION.test(String(req.invocationId)))return refuse("invalid_input");
    const candidates=byId.get(String(req.tool))??[];
    let tool:ToolDefinition|undefined;
    if(req.provider!==undefined)tool=registry.get(keyOf(String(req.tool),String(req.provider)));
    else if(candidates.length===1)tool=candidates[0];
    else if(candidates.length>1)return refuse("invalid_input"); // several providers: the caller must name one
    if(!tool)return refuse("tool_not_registered");
    try{assertHsiToolPermission(req.manifest,tool.id,tool.dataClass)}catch{return refuse("permission_denied",tool)}
    let input:unknown;try{input=tool.parseInput(req.input)}catch{return refuse("invalid_input",tool)}
    const requestHash=hashHsiCheckpointInput({tool:tool.id,provider:tool.providerId,version:tool.version,input});
    if(tool.passageAccess==="cleared_only"){
     const cleared=opts.clearance?await opts.clearance({investigationId:req.investigationId,toolId:tool.id,providerId:tool.providerId}):false;
     if(cleared!==true)return refuse("licence_blocked",tool,{requestHash});
    }
    const scope=hashHsiCheckpointInput({investigationId:req.investigationId,taskId:req.taskId});
    const prior=await idem.get(req.invocationId);
    if(prior){
     if(prior.requestHash!==requestHash||prior.scope!==scope)return refuse("invalid_input",tool,{requestHash});
     // A stored result must still match its own recorded hash; an edited file is refused, never replayed to an agent.
     if(hashHsiCheckpointInput(prior.result.data)!==prior.result.provenance.responseHash)throw new GatewayError("internal_error");
     const seq=log({outcome:"replayed",code:null,tool,requestHash,responseHash:prior.result.provenance.responseHash,flags:prior.result.flags.length});
     return {...prior.result,replayed:true,auditSeq:seq};
    }
    // Rate first, then budget: a call refused for rate does not spend the investigation's scarce budget.
    if(!await limits.consumeRate(keyOf(tool.id,tool.providerId),tool.ratePerMinute,now(),60_000))return refuse("rate_limited",tool,{requestHash});
    const budgetKey=req.investigationId+"\u0000"+req.taskId; // each task has its own manifest and its own maxToolCalls
    if(!await limits.consumeBudget(budgetKey,req.manifest.maxToolCalls))return refuse("budget_exhausted",tool,{requestHash});
    if(!await limits.consumeBudget("ceiling\u0000"+req.investigationId,ceiling))return refuse("budget_exhausted",tool,{requestHash});

    let attempt=0,raw:unknown,lastCode:RefusalCode="upstream_error";
    for(attempt=1;attempt<=tool.maxAttempts;attempt++){
     if(req.signal?.aborted)return refuse("aborted",tool,{attempts:attempt-1,requestHash});
     const ctl=new AbortController();let timedOut=false;
     const timer=setTimeout(()=>{timedOut=true;ctl.abort()},tool.timeoutMs);
     const onAbort=()=>ctl.abort();req.signal?.addEventListener("abort",onAbort,{once:true});
     try{
      // Raced against the abort signal, so a tool or fetcher that ignores `signal` still cannot outlive the timeout.
      const stopped=new Promise<never>((_,rej)=>ctl.signal.addEventListener("abort",()=>rej(Error("aborted")),{once:true}));
      raw=await Promise.race([tool.execute(input,{fetch:guardedFetch(tool,base,ctl.signal),signal:ctl.signal}),stopped]);
      lastCode="upstream_error";break;
     }catch(e){
      if(e instanceof GatewayError&&e.code!=="upstream_error"){lastCode=e.code}
      else if(req.signal?.aborted)lastCode="aborted";
      else if(timedOut)lastCode="timeout";
      else{
       lastCode="upstream_error";
       const status=/HTTP (\d{3})/.exec(e instanceof Error?e.message:"")?.[1];
       const retryable=status===undefined?true:status==="429"||status.startsWith("5");
       if(!retryable){return refuse("upstream_error",tool,{attempts:attempt,requestHash})}
      }
      raw=undefined;
      const terminal=lastCode==="egress_blocked"||lastCode==="response_too_large"||lastCode==="aborted";
      if(terminal||attempt>=tool.maxAttempts)return refuse(lastCode,tool,{attempts:attempt,requestHash});
      await sleep(Math.min(2_000,200*2**(attempt-1)));
     }finally{clearTimeout(timer);req.signal?.removeEventListener("abort",onAbort)}
    }
    if(raw===undefined)return refuse(lastCode,tool,{attempts:attempt,requestHash});

    let parsed:unknown;try{parsed=tool.parseOutput(raw)}catch{return refuse("invalid_output",tool,{attempts:attempt,requestHash})}
    const {data,flags}=sanitise(parsed);
    const responseHash=hashHsiCheckpointInput(data);
    const provenance:ToolProvenance={toolId:tool.id,providerId:tool.providerId,toolVersion:tool.version,retrievedAt:new Date(now()).toISOString(),requestHash,responseHash,attempt,hosts:[...tool.hosts],passageAccess:tool.passageAccess,dataClass:tool.dataClass};
    const seq=log({outcome:"success",code:null,tool,attempts:attempt,requestHash,responseHash,flags:flags.length});
    const result:Extract<ToolResult,{ok:true}>={ok:true,data,untrusted:true,provenance,flags,replayed:false,auditSeq:seq};
    await idem.put(req.invocationId,{requestHash,scope,result});
    return result;
   }catch(e){
    const code=e instanceof GatewayError?e.code:"internal_error";
    // If the audit log itself is unavailable nothing is returned but a refusal: no unaudited data ever leaves the gateway.
    try{return refuse(code)}catch{return {ok:false,code:"internal_error",message:MESSAGES.internal_error,auditSeq:0}}
   }
  },
 };
}
export type ToolGateway=ReturnType<typeof createToolGateway>;

/* ---------- first catalogue entry: Europe PMC literature search (metadata only) ---------- */
type LiteratureInput={terms:string[];limit:number};
const isoish=(s:unknown)=>typeof s==="string"&&Number.isFinite(Date.parse(s));
export function europePmcLiteratureSearchTool():ToolDefinition<LiteratureInput,PublicSourceRecord[]>{
 return {
  id:"literature.search",providerId:"europe-pmc",version:"1.0.0",dataClass:"public_biomedical",
  hosts:["www.ebi.ac.uk"],passageAccess:"metadata_only",timeoutMs:15_000,maxAttempts:2,maxResponseBytes:2_000_000,ratePerMinute:30,
  parseInput(v){
   const o=v as {terms?:unknown;limit?:unknown};
   if(!o||typeof o!=="object"||!Array.isArray(o.terms)||o.terms.length<1||o.terms.length>8||o.terms.some(t=>typeof t!=="string"||!t.trim()||t.length>160))throw Error("Invalid terms");
   const limit=o.limit===undefined?20:o.limit;
   if(typeof limit!=="number"||!Number.isInteger(limit)||limit<1||limit>50)throw Error("Invalid limit");
   return {terms:(o.terms as string[]).map(t=>t.trim()),limit};
  },
  parseOutput(v){
   if(!Array.isArray(v)||v.length>50)throw Error("Invalid output");
   return v.map(r=>{
    const x=r as PublicSourceRecord;
    if(!x||typeof x.sourceId!=="string"||!/^europepmc:/.test(x.sourceId)||x.kind!=="publication"||typeof x.canonicalId!=="string"||typeof x.sourceUrl!=="string"||!x.sourceUrl.startsWith("https://europepmc.org/")||!isoish(x.retrievedAt)||x.passageUsePermitted!==false||x.licenceId!==null||x.accessClass!=="public")throw Error("Invalid record");
    // Allowlist metadata fields only; unknown upstream fields are dropped.
    const m=x.metadata??{};
    return {sourceId:x.sourceId,kind:x.kind,canonicalId:x.canonicalId,sourceUrl:x.sourceUrl,retrievedAt:x.retrievedAt,sourceVersion:String(x.sourceVersion??""),licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,
     metadata:{title:typeof m.title==="string"?m.title:null,doi:typeof m.doi==="string"?m.doi:null,pmid:typeof m.pmid==="string"?m.pmid:null,publicationYear:typeof m.publicationYear==="string"||typeof m.publicationYear==="number"?m.publicationYear:null}};
   });
  },
  // Reuses the existing adapter; the gateway supplies the guarded fetch, so the adapter cannot reach any other host.
  execute:(input,ctx)=>europePmcAdapter(ctx.fetch).search(input.terms,input.limit),
 };
}
export const defaultToolCatalogue=():ToolDefinition[]=>[europePmcLiteratureSearchTool() as unknown as ToolDefinition];
