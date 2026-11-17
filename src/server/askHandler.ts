/**
 * POST /api/ask {question}. The signed-in front door to model-checked investigations.
 * Requires a provider-verified session with a verified email, the configured public origin, and a per-user hourly limit.
 * The question is routed to a CURATED scenario by named entity and context; nothing free-text reaches a model or the evidence
 * retrieval query. An unroutable question costs nothing on the per-user hourly quota and says so. Process/shared write
 * admission still applies (SEC-01). Per-user limits are per instance (a safety net, not a shared quota); the provider
 * console spend limit remains the real cap.
 */
import type {FetchLike} from "../fetchLike";
import {gatewayJson,verifiedProviderSession} from "./neonAuthGateway";
import {handleLiveInvestigationCore} from "./liveInvestigationHandler";
import {LIVE_SCENARIOS,matchScenario} from "../investigation/scenarios";
import {withResearchRequestControls,type ResearchControls} from "./researchRequestControls";
import {resolveResearchControls} from "./resolveResearchControls";

type Env=Readonly<Record<string,string|undefined>>;
export type AskDependencies={transport?:FetchLike;fetcher?:FetchLike;now?:()=>number;controls?:ResearchControls};
export const ASK_USER_LIMIT_PER_HOUR=10;
const users=new Map<string,number[]>();
export const resetAskLimiter=()=>users.clear();
const httpsOrigin=(v:string|undefined)=>{try{const u=new URL(v?.trim()??"");return u.protocol==="https:"&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==="/"?u.origin:null}catch{return null}};
const httpsBase=(v:string|undefined)=>{try{const u=new URL(v?.trim()??"");return u.protocol==="https:"&&!u.username&&!u.password&&!u.search&&!u.hash?u.href.replace(/\/+$/,""):null}catch{return null}};

export async function handleAsk(request:Request,env:Env,deps:AskDependencies={}):Promise<Response>{
 return withResearchRequestControls(request,()=>handleAskCore(request,env,deps),resolveResearchControls(env,deps.controls??{}));
}

async function handleAskCore(request:Request,env:Env,deps:AskDependencies):Promise<Response>{
 if(request.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{Allow:"POST","Content-Type":"application/json","Cache-Control":"no-store"}});
 const publicOrigin=httpsOrigin(env.HSI_PUBLIC_ORIGIN),authBaseUrl=httpsBase(env.HSI_AUTH_BASE_URL);
 if(!publicOrigin||!authBaseUrl)return gatewayJson({code:"ASK_NOT_CONFIGURED",error:"Ask is not available on this deployment"},503);
 if(request.headers.get("origin")!==publicOrigin)return gatewayJson({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return gatewayJson({error:"JSON body required"},415);
 const raw=await request.text();
 if(raw.length>2000)return gatewayJson({error:"Request too large"},413);
 let body:any;try{body=JSON.parse(raw)}catch{return gatewayJson({error:"Invalid JSON"},400)}
 const question=typeof body?.question==="string"?body.question.trim():"";
 if(question.length<8||question.length>500)return gatewayJson({code:"INVALID_QUESTION",error:"Ask a question between 8 and 500 characters"},400);

 let identity:Awaited<ReturnType<typeof verifiedProviderSession>>;
 try{identity=await verifiedProviderSession({authBaseUrl,publicOrigin},request,deps.transport)}catch{return gatewayJson({code:"AUTH_UNAVAILABLE",error:"Sign-in service unavailable"},503)}
 if(!identity)return gatewayJson({code:"AUTH_REQUIRED",error:"Sign in to ask a question"},401);
 if(!identity.user.emailVerified)return gatewayJson({code:"EMAIL_NOT_VERIFIED",error:"Verify your email to ask a question"},403);

 const now=(deps.now??Date.now)();
 const scenarioId=matchScenario(question);
 if(!scenarioId)return gatewayJson({routed:false,message:"This question is outside the curated investigations available today. Nothing was run.",available:Object.values(LIVE_SCENARIOS).map(s=>({id:s.id,title:s.title,question:s.question}))});

 const recent=(users.get(identity.user.id)??[]).filter(t=>now-t<3_600_000);
 if(recent.length>=ASK_USER_LIMIT_PER_HOUR)return gatewayJson({code:"RATE_LIMITED",error:"Hourly limit reached. Try again later."},429);
 users.set(identity.user.id,[...recent,now]);
 if(users.size>5000)users.clear();

 // Internal call skips a second withResearchRequestControls wrap; Ask already paid research_write admission.
 const inner=new Request(publicOrigin+"/api/research/live-investigation",{method:"POST",headers:{"content-type":"application/json",origin:publicOrigin,"x-forwarded-for":request.headers.get("x-forwarded-for")??"unknown"},body:JSON.stringify({scenarioId})});
 const res=await handleLiveInvestigationCore(inner,env,{fetcher:deps.fetcher,now:deps.now});
 if(!res.ok)return gatewayJson({code:"RUN_FAILED",error:"The investigation could not run. No findings were generated."},res.status===429?429:502);
 const result:any=await res.json();
 return gatewayJson({routed:true,scenarioId,trace:{matchedBy:"named lead entity and disease context",question:"curated scenario, not free text",sources:["Europe PMC","OpenAlex","Open Targets"],modelCheck:result?.verification?.status??"unknown"},result});
}
