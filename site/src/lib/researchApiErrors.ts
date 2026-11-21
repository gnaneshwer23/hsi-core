import {parseRetryAfterSeconds,rateLimitedMessage} from "./retryAfter";

export type ResearchApiErrorBody={code?:string;error?:string};

export type ResearchApiErrorContext=
 |"workspace_load"
 |"workspace_create"
 |"live_run"
 |"delivery_load"
 |"delivery_submit"
 |"delivery_revise"
 |"brief_download"
 |"outcome_load"
 |"review_queue"
 |"evidence_context"
 |"generic";

/** Read a fail-closed research JSON envelope without throwing on non-JSON. */
export async function parseResearchErrorBody(res:Response):Promise<ResearchApiErrorBody>{
 try{
  const body=await res.json();
  if(!body||typeof body!=="object"||Array.isArray(body))return {};
  const record=body as Record<string,unknown>;
  return {
   code:typeof record.code==="string"?record.code:undefined,
   error:typeof record.error==="string"?record.error:undefined,
  };
 }catch{
  return {};
 }
}

/** Stable honesty copy for known research API codes. Unknown codes fall through. */
export function messageForResearchCode(code:string|undefined,context:ResearchApiErrorContext):string|undefined{
 if(!code)return undefined;
 switch(code){
  case "AUTH_REQUIRED":
  case "BACKEND_PROVIDER_SESSION_REQUIRED":
  case "BACKEND_DATABASE_SESSION_REQUIRED":
   if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"){
    return "Your session needs attention. Sign in again before continuing.";
   }
   if(context==="review_queue"){
    return "Sign in with an independently authorised scientific reviewer account to open this queue.";
   }
   if(context==="delivery_load"||context==="brief_download"||context==="outcome_load"){
    return "Sign in with a verified research account to open this evidence brief.";
   }
   return "Sign in with a verified research account to open your investigations.";
  case "EMAIL_NOT_VERIFIED":
   return "Verify your email address before using the research workspace.";
  case "RESEARCH_ACCESS_DENIED":
  case "RESEARCH_ACCESS_REQUIRED":
   return context==="review_queue"
    ?"The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required."
    :"Research access has not been confirmed. Check your research account or contact the research administrator.";
  case "RESEARCH_WRITES_DISABLED":
   return context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"||context==="evidence_context"
    ?"Saving is not available for your account on this deployment. Your question has been kept here."
    :"Research writes are not enabled or authorized.";
  case "PUBLISHED_RELEASE_REQUIRED":
   return "A published evidence release is required before a new investigation can be saved.";
  case "REQUEST_CONFLICT":
  case "IDEMPOTENCY_CONFLICT":
   return "The selected release or save request is no longer available. Refresh the workspace before trying again.";
  case "INVALID_CREATE_INVESTIGATION":
  case "INVALID_REQUEST":
  case "EMPTY_JSON_REQUIRED":
  case "CLIENT_OVERRIDES_REFUSED":
   return "Use a non-identifying research question of up to 500 characters. Patient information is not permitted.";
  case "WORKSPACE_UNAVAILABLE":
  case "WORKSPACE_DENIED":
  case "RESEARCH_RECORD_DENIED":
   return context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"
    ?"Save could not be confirmed. Retry to check the same request without creating a duplicate."
    :"Your investigations could not be loaded. Please retry.";
  case "DELIVERY_UNAVAILABLE":
  case "DELIVERY_DENIED":
   return "The evidence brief could not be verified. Check research access, source permissions and deployment readiness.";
  case "BRIEF_UNAVAILABLE":
  case "INVALID_BRIEF_FORMAT":
  case "INVALID_EXPORT_QUERY":
   return "Brief unavailable. Refresh the package and verify access before retrying.";
  case "OUTCOME_UNAVAILABLE":
  case "OUTCOME_DENIED":
  case "OUTCOME_RECEIPT_UNAVAILABLE":
  case "INVALID_OUTCOME_FORMAT":
   return "Outcome unavailable. Refresh the brief and verify access before retrying.";
  case "REVISION_UNAVAILABLE":
   return "Revision creation could not be confirmed. Your response is kept here. Retry the same request or refresh to find an existing linked revision.";
  case "REVIEW_QUEUE_UNAVAILABLE":
  case "REVIEW_QUEUE_DENIED":
  case "INVALID_REVIEW_QUEUE_CURSOR":
  case "REVIEW_HISTORY_UNAVAILABLE":
  case "REVIEW_HISTORY_DENIED":
   return "The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
  case "EVIDENCE_CONTEXT_UNAVAILABLE":
  case "EVIDENCE_CONTEXT_DENIED":
   return "The release-bound evidence context could not be verified. Check ownership, draft state and staging write readiness.";
  case "METHOD_NOT_ALLOWED":
   return "This research action is not available with the current request method.";
  case "ORIGIN_NOT_ALLOWED":
   return "This research write must come from the same website origin as the signed-in session.";
  case "RATE_LIMITED":
   return "Rate limit reached. Try again later.";
  case "UNKNOWN_SCENARIO":
   return "That live investigation scenario is not available.";
  case "RUN_FAILED":
   return "Investigation could not run. No findings were generated.";
  case "LIVE_PERSISTENCE_DISABLED":
  case "LIVE_EVIDENCE_DISABLED":
   return "Live evidence persistence is disabled on this deployment.";
  case "GRAPH_WORKSPACE_STORE_DISABLED":
   return "Graph workspace server storage is disabled. This browser can keep a device-local copy only.";
  case "GRAPH_WORKSPACE_DENIED":
   return "Graph workspace operation denied or unavailable.";
  case "SESSION_REQUIRED":
   return "Sign in with a verified research account before using graph workspace server storage.";
  case "SCHEMA_NOT_APPLIED":
   return "Researcher workspace tables are not applied. Nothing was stored or sent.";
  case "NOT_FOUND":
   return "That research resource was not found.";
  case "JSON_REQUIRED":
  case "INVALID_JSON":
  case "PAYLOAD_TOO_LARGE":
  case "REQUEST_TOO_LARGE":
  case "REQUEST_TIMEOUT":
   return context==="live_run"
    ?"The investigation request was refused. Check the scenario and try again."
    :"The research request was refused. Check the question and try again.";
  default:
   return undefined;
 }
}

/** Status honesty when a stable `code` is absent (older envelopes / test doubles). */
export function messageForResearchStatus(status:number,context:ResearchApiErrorContext):string|undefined{
 if(status===401){
  if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"){
   return "Your session needs attention. Sign in again before continuing.";
  }
  if(context==="live_run")return "Sign in is required before a live investigation can run.";
  if(context==="review_queue"){
   return "Sign in with an independently authorised scientific reviewer account to open this queue.";
  }
  if(context==="delivery_load"||context==="brief_download"||context==="outcome_load"||context==="evidence_context"){
   return "Sign in with a verified research account to open this evidence brief.";
  }
  return "Sign in with a verified research account to open your investigations.";
 }
 if(status===403){
  if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"){
   return "Saving is not available for your account on this deployment. Your question has been kept here.";
  }
  if(context==="workspace_load"){
   return "Research access has not been confirmed. Check your research account or contact the research administrator.";
  }
  if(context==="review_queue"){
   return "The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
  }
  if(context==="delivery_load"||context==="brief_download"){
   return "The evidence brief could not be verified. Check research access, source permissions and deployment readiness.";
  }
  if(context==="outcome_load"){
   return "Outcome unavailable. Refresh the brief and verify access before retrying.";
  }
  if(context==="evidence_context"){
   return "The release-bound evidence context could not be verified. Check ownership, draft state and staging write readiness.";
  }
  return undefined;
 }
 if(status===409&&context==="workspace_create"){
  return "The selected release or save request is no longer available. Refresh the workspace before trying again.";
 }
 if(status===400&&context==="workspace_create"){
  return "Use a non-identifying research question of up to 500 characters. Patient information is not permitted.";
 }
 return undefined;
}

/**
 * Prefer stable `code` honesty, then HTTP-status honesty for research surfaces,
 * then server `error` text, then context fallback.
 * On 429 / RATE_LIMITED, append a Retry-After wait hint when present.
 */
export async function researchApiErrorMessage(
 res:Response,
 context:ResearchApiErrorContext,
 fallback:string,
):Promise<string>{
 const body=await parseResearchErrorBody(res);
 const fromCode=messageForResearchCode(body.code,context);
 const fromStatus=fromCode?undefined:messageForResearchStatus(res.status,context);
 const serverError=body.error?.trim();
 const base=fromCode??fromStatus??(serverError||fallback);
 if(res.status===429||body.code==="RATE_LIMITED"){
  return rateLimitedMessage(res,base,fallback);
 }
 return base;
}

export function researchRetryAfterSeconds(res:Response):number|undefined{
 return parseRetryAfterSeconds(res);
}
