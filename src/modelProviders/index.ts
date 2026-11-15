/**
 * Server-side model provider layer (P1). Credentials come from the environment passed in by the server handler and are
 * never logged, returned or placed in prompts. A provider whose key or model id is unset reports "not_configured";
 * nothing is faked. Runners match `EntailmentModelRunner` so they plug into the existing verifier seam.
 */
import type {FetchLike} from "../fetchLike";

export type ProviderId="openai"|"anthropic";
export type BudgetLimits={maxCalls:number;maxInputChars:number;maxOutputTokens:number;/** Optional. Cost is computed only when both prices are supplied; otherwise it is reported unknown. */maxUsd?:number;usdPer1kInput?:number;usdPer1kOutput?:number};
export type BudgetUsage={calls:number;inputChars:number;outputTokens:number;inputTokens:number;usd:number|null;refused:number};
export class BudgetExceeded extends Error{constructor(readonly reason:string){super("Model budget exceeded: "+reason)}}
export const DEFAULT_BUDGET:BudgetLimits={maxCalls:16,maxInputChars:60_000,maxOutputTokens:400};

export function createBudget(limits:BudgetLimits=DEFAULT_BUDGET){
 const u:BudgetUsage={calls:0,inputChars:0,outputTokens:0,inputTokens:0,usd:limits.usdPer1kInput!==undefined&&limits.usdPer1kOutput!==undefined?0:null,refused:0};
 return {
  limits,
  /** Reserve before a call. Throws instead of letting an unbounded call happen. */
  reserve(inputChars:number){
   const fail=(r:string)=>{u.refused++;throw new BudgetExceeded(r)};
   if(u.calls+1>limits.maxCalls)fail("call limit");
   if(u.inputChars+inputChars>limits.maxInputChars)fail("input size limit");
   if(limits.maxUsd!==undefined&&u.usd!==null&&u.usd>=limits.maxUsd)fail("cost limit");
   u.calls++;u.inputChars+=inputChars;
  },
  record(tokensIn:number|null,tokensOut:number|null){
   if(tokensIn)u.inputTokens+=tokensIn;if(tokensOut)u.outputTokens+=tokensOut;
   if(u.usd!==null&&tokensIn!==null&&tokensOut!==null)u.usd+=tokensIn/1000*limits.usdPer1kInput!+tokensOut/1000*limits.usdPer1kOutput!;
  },
  usage:():Readonly<BudgetUsage>=>({...u})
 };
}
export type Budget=ReturnType<typeof createBudget>;

export type ProviderStatus={provider:ProviderId;configured:boolean;model:string|null;reason:string|null};
type Env=Readonly<Record<string,string|undefined>>;
const ID_RE=/^[A-Za-z0-9][A-Za-z0-9._:/-]{1,99}$/;
export function providerStatus(env:Env):ProviderStatus[]{
 const one=(provider:ProviderId,key:string,model:string):ProviderStatus=>{
  const hasKey=!!env[key]?.trim(),m=env[model]?.trim();
  if(!hasKey)return {provider,configured:false,model:null,reason:key+" is not set"};
  if(!m||!ID_RE.test(m))return {provider,configured:false,model:null,reason:model+" is not set"};
  return {provider,configured:true,model:m,reason:null};
 };
 return [one("openai","OPENAI_API_KEY","HSI_OPENAI_MODEL"),one("anthropic","ANTHROPIC_API_KEY","HSI_ANTHROPIC_MODEL")];
}

const sleep=(ms:number):Promise<void>=>new Promise<void>(r=>{setTimeout(r,ms)});
export function parseJsonObject(text:string):unknown{
 const t=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
 const v=JSON.parse(t);
 if(!v||typeof v!=="object"||Array.isArray(v))throw Error("Model did not return a JSON object");
 return v;
}
async function withRetry<T>(fn:()=>Promise<Response>,read:(r:Response)=>Promise<T>,sleeper:(ms:number)=>Promise<void>):Promise<T>{
 let last:unknown;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const res=await fn();
   if(res.status===429||res.status>=500){last=Error("Provider HTTP "+res.status);await sleeper(400*2**attempt);continue}
   if(!res.ok)throw Error("Provider HTTP "+res.status);
   return await read(res);
  }catch(e){
   if(e instanceof Error&&/^Provider HTTP 4/.test(e.message)&&!/429/.test(e.message))throw e;
   last=e;await sleeper(400*2**attempt);
  }
 }
 throw last instanceof Error?new Error("Provider unavailable: "+last.message.replace(/(sk-|key-)[A-Za-z0-9_-]+/g,"[redacted]")):Error("Provider unavailable");
}
export type RunnerDeps={env:Env;budget:Budget;fetcher?:FetchLike;sleeper?:(ms:number)=>Promise<void>;timeoutMs?:number};
/** Request accepted by every runner. `maxOutputTokens` may only lower or raise the cap up to a hard ceiling. */
export type ModelRequest={instruction:string;claim:string;passage:string;sourceId?:string;sourceVersion?:string;maxOutputTokens?:number;/** The instruction defines its own JSON keys, so no legacy output keys are appended. */ownFormat?:boolean};
export type ModelRunner=(request:ModelRequest)=>Promise<unknown>;
const HARD_OUTPUT_CEILING=1800;
const compose=(r:ModelRequest)=>{
 // Instructions that define their own output keys say "Return JSON with"; the legacy entailment instruction gets the keys appended.
 const own=r.ownFormat===true||/Return JSON with direction/.test(r.instruction);
 const system=own?r.instruction+" Reply with only that JSON object and no other text.":r.instruction+" Reply with only a JSON object with exactly the keys verdict, reason, evidenceSpan. evidenceSpan must be an exact quotation from the passage or null.";
 // The passage is data inside a JSON string, never part of the instructions.
 return {system,user:JSON.stringify({claim:r.claim,passage:r.passage})};
};
const cap=(d:{budget:{limits:BudgetLimits}},r:ModelRequest)=>Math.max(50,Math.min(r.maxOutputTokens??d.budget.limits.maxOutputTokens,HARD_OUTPUT_CEILING));

/** A second, different OpenAI model for the verifier when only one provider key exists. Execution is independent; the provider is not. */
export function openAiSecondModel(env:Env):string|null{
 const a=providerStatus(env)[0]!,m=env.HSI_OPENAI_MODEL_2?.trim();
 return a.configured&&m&&ID_RE.test(m)&&m!==a.model?m:null;
}
export function createOpenAiRunner(d:RunnerDeps,which:"primary"|"second"="primary"):ModelRunner{
 const base=providerStatus(d.env)[0]!;
 if(!base.configured)throw Error("OpenAI is not configured: "+base.reason);
 const second=which==="second"?openAiSecondModel(d.env):null;
 if(which==="second"&&!second)throw Error("HSI_OPENAI_MODEL_2 must be set to a model different from HSI_OPENAI_MODEL");
 const st={...base,model:second??base.model};
 const f=d.fetcher??fetch;
 return async req=>{
  const {system,user}=compose(req);d.budget.reserve(system.length+user.length);
  return withRetry(()=>f("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+d.env.OPENAI_API_KEY},
   body:JSON.stringify({model:st.model,temperature:0,max_tokens:cap(d,req),response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:user}]}),signal:AbortSignal.timeout(d.timeoutMs??20000)}),
   async res=>{const b=await res.json() as any;d.budget.record(b?.usage?.prompt_tokens??null,b?.usage?.completion_tokens??null);return parseJsonObject(String(b?.choices?.[0]?.message?.content??""))},d.sleeper??sleep);
 };
}
export function createAnthropicRunner(d:RunnerDeps):ModelRunner{
 const st=providerStatus(d.env)[1]!;
 if(!st.configured)throw Error("Anthropic is not configured: "+st.reason);
 const f=d.fetcher??fetch;
 return async req=>{
  const {system,user}=compose(req);d.budget.reserve(system.length+user.length);
  return withRetry(()=>f("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":d.env.ANTHROPIC_API_KEY!,"anthropic-version":"2023-06-01"},
   body:JSON.stringify({model:st.model,temperature:0,max_tokens:cap(d,req),system,messages:[{role:"user",content:user}]}),signal:AbortSignal.timeout(d.timeoutMs??20000)}),
   async res=>{const b=await res.json() as any;d.budget.record(b?.usage?.input_tokens??null,b?.usage?.output_tokens??null);return parseJsonObject(String(b?.content?.find((c:any)=>c?.type==="text")?.text??""))},d.sleeper??sleep);
 };
}
