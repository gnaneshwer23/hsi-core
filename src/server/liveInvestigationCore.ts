/**
 * Live-investigation runner without process/shared admission.
 * Public HTTP entry must wrap this with withResearchRequestControls.
 * Ask may call this only after Ask has already paid research_write admission.
 */
import {LIVE_SCENARIOS} from "../investigation/scenarios";
import {runLiveInvestigation,type VerifierSlot} from "../investigation/liveRun";
import {createAnthropicRunner,createBudget,createOpenAiRunner,openAiSecondModel,providerStatus,DEFAULT_BUDGET} from "../modelProviders";
import type {FetchLike} from "../fetchLike";

type Env=Readonly<Record<string,string|undefined>>;
export type LiveInvestigationCoreDependencies={fetcher?:FetchLike;now?:()=>number};
const hits=new Map<string,number[]>();
/** Model-checked runs started on this instance today (UTC). Per instance, so it is a safety net and NOT a shared or exact spend cap: the provider console limit is the real cap. */
const daily={day:"",count:0};
export const DEFAULT_DAILY_MODEL_RUNS=50;
export const resetLiveInvestigationLimiter=()=>{hits.clear();daily.day="";daily.count=0};
const dailyCap=(env:Env)=>{const n=Number(env.HSI_LIVE_MODEL_DAILY_RUNS);return Number.isInteger(n)&&n>=0&&n<=10000?n:DEFAULT_DAILY_MODEL_RUNS};
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

export async function runLiveInvestigationRequest(request:Request,env:Env,deps:LiveInvestigationCoreDependencies={}):Promise<Response>{
 if(request.method==="GET"){
  return json({scenarios:Object.values(LIVE_SCENARIOS).map(s=>({id:s.id,title:s.title,question:s.question})),
   modelStep:{enabled:env.HSI_LIVE_MODEL_STEP_ENABLED==="true",providers:providerStatus(env).map(p=>({provider:p.provider,configured:p.configured}))}});
 }
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"GET, POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({code:"JSON_REQUIRED",error:"JSON body required"},415);
 const raw=await request.text();
 if(raw.length>2000)return json({code:"REQUEST_TOO_LARGE",error:"Request too large"},413);
 let body:any;try{body=JSON.parse(raw)}catch{return json({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 const scenario=typeof body?.scenarioId==="string"?LIVE_SCENARIOS[body.scenarioId]:undefined;
 if(!scenario)return json({code:"UNKNOWN_SCENARIO",error:"Unknown scenario"},404);
 const now=deps.now??Date.now,ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now()-t<600_000);
 if(recent.length>=5){return json({code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"})}
 hits.set(ip,[...recent,now()]);
 if(hits.size>2000)hits.clear();
 let verifiers:readonly [VerifierSlot,VerifierSlot]|null=null,verifierReason="The model step is disabled on this deployment.";
 const budget=createBudget(DEFAULT_BUDGET);
 if(env.HSI_LIVE_MODEL_STEP_ENABLED==="true"){
  const st=providerStatus(env),second=openAiSecondModel(env);
  if(st[0]!.configured&&st[1]!.configured){
   verifiers=[{verifierId:"openai",providerId:"openai",modelId:st[0]!.model!,runner:createOpenAiRunner({env,budget,fetcher:deps.fetcher})},{verifierId:"anthropic",providerId:"anthropic",modelId:st[1]!.model!,runner:createAnthropicRunner({env,budget,fetcher:deps.fetcher})}];
  }else if(st[0]!.configured&&second){
   // One provider: two different models. Independent execution, not independent providers.
   verifiers=[{verifierId:"openai-a",providerId:"openai",modelId:st[0]!.model!,runner:createOpenAiRunner({env,budget,fetcher:deps.fetcher})},{verifierId:"openai-b",providerId:"openai",modelId:second,runner:createOpenAiRunner({env,budget,fetcher:deps.fetcher},"second")}];
  }else verifierReason="Two verifiers are required: either OpenAI and Anthropic, or OpenAI with a different HSI_OPENAI_MODEL_2. Not configured: "+st.filter(p=>!p.configured).map(p=>p.provider+" ("+p.reason+")").join("; ")+".";
 }
 const today=new Date(now()).toISOString().slice(0,10);
 if(verifiers){
  if(daily.day!==today){daily.day=today;daily.count=0}
  if(daily.count>=dailyCap(env)){verifiers=null;verifierReason="The daily limit for model-checked runs was reached on this deployment. Retrieval still ran."}
  else daily.count++;
 }
 const t0=Date.now(),ac=new AbortController();const timer=setTimeout(()=>ac.abort(),25_000);
 try{
  const result=await runLiveInvestigation({scenario,fetcher:deps.fetcher,mailto:env.HSI_OPENALEX_CONTACT,verifiers,verifierReason,budget,maxVerified:4,signal:ac.signal});
  console.log(JSON.stringify({event:"live_investigation",scenario:scenario.id,modelChecked:!!verifiers,calls:budget.usage().calls,inputTokens:budget.usage().inputTokens,outputTokens:budget.usage().outputTokens,refused:budget.usage().refused,ms:Date.now()-t0}));
  return json(result);
 }catch{return json({code:"RUN_FAILED",error:"Investigation could not run. No findings were generated."},502)}
 finally{clearTimeout(timer)}
}
