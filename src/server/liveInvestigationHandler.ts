/**
 * POST /api/research/live-investigation {scenarioId}. Curated scenarios only (no free-text prompts), so a public caller
 * cannot steer model spend. Retrieval uses free public sources. The two-model challenge runs only when the deployment
 * sets HSI_LIVE_MODEL_STEP_ENABLED=true and both providers are configured; otherwise the run says so. Process/shared
 * write admission (SEC-01) wraps the public entry after cheap origin/method gates; per-instance IP limiting remains a
 * safety net and is not a substitute for provider-side spend caps. Cross-instance budgets require HSI_SHARED_ADMISSION_URL
 * (D-111); processAdmission alone is per isolate.
 */
import type {FetchLike} from "../fetchLike";
import {withResearchRequestControls,type ResearchControls} from "./researchRequestControls";
import {resolveResearchControls} from "./resolveResearchControls";
import {runLiveInvestigationRequest,resetLiveInvestigationLimiter,DEFAULT_DAILY_MODEL_RUNS} from "./liveInvestigationCore";

export {resetLiveInvestigationLimiter,DEFAULT_DAILY_MODEL_RUNS};

type Env=Readonly<Record<string,string|undefined>>;
export type LiveInvestigationDependencies={fetcher?:FetchLike;now?:()=>number;controls?:ResearchControls};
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

export async function handleLiveInvestigation(request:Request,env:Env,deps:LiveInvestigationDependencies={}):Promise<Response>{
 // Cheap rejects before research_write admission so foreign-origin/method spam does not exhaust the shared write budget.
 if(request.method!=="GET"&&request.method!=="POST")return json({error:"Method not allowed"},405,{Allow:"GET, POST"});
 if(request.method==="POST"){
  const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
  if(pub&&origin&&origin!==pub)return json({error:"Origin not allowed"},403);
  if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({error:"JSON body required"},415);
 }
 return withResearchRequestControls(request,()=>runLiveInvestigationRequest(request,env,deps),resolveResearchControls(env,deps.controls??{}));
}
