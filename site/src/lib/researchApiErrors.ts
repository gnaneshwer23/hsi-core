import {parseRetryAfterSeconds,rateLimitedMessage} from "./retryAfter";

export type ResearchApiErrorBody={code?:string;error?:string};

export type ResearchApiErrorContext=
 |"workspace_load"
 |"workspace_create"
 |"live_run"
 |"delivery_load"
 |"delivery_submit"
 |"delivery_revise"
 |"delivery_decide"
 |"brief_download"
 |"outcome_load"
 |"review_queue"
 |"review_history"
 |"evidence_context"
 |"investigation_load"
 |"scientific_retrieval"
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
   if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"||context==="delivery_decide"){
    return "Your session needs attention. Sign in again before continuing.";
   }
   if(context==="review_queue"||context==="review_history"){
    return "Sign in with an independently authorised scientific reviewer account to open this queue.";
   }
   if(context==="delivery_load"||context==="brief_download"||context==="outcome_load"||context==="investigation_load"){
    return "Sign in with a verified research account to open this evidence brief.";
   }
   return "Sign in with a verified research account to open your investigations.";
  case "EMAIL_NOT_VERIFIED":
   return "Verify your email address before using the research workspace.";
  case "RESEARCH_ACCESS_DENIED":
  case "RESEARCH_ACCESS_REQUIRED":
   if(context==="review_queue"){
    return "The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
   }
   if(context==="review_history"){
    return "Review history unavailable or access denied.";
   }
   return "Research access has not been confirmed. Check your research account or contact the research administrator.";
  case "RESEARCH_WRITES_DISABLED":
   return context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"||context==="delivery_decide"||context==="evidence_context"
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
   if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"){
    return "Save could not be confirmed. Retry to check the same request without creating a duplicate.";
   }
   if(context==="delivery_decide"){
    return "The decision could not be confirmed. Your input is retained. Retry the same request or refresh to check whether it was recorded.";
   }
   if(context==="investigation_load"){
    return "Unable to load an authorised investigation. Sign in with a verified research account or contact the research administrator.";
   }
   return "Your investigations could not be loaded. Please retry.";
  case "INVESTIGATION_MISMATCH":
   return "The decision could not be confirmed. Your input is retained. Retry the same request or refresh to check whether it was recorded.";
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
   return "The research outcome could not be verified. Refresh to check current evidence and access.";
  case "REVISION_UNAVAILABLE":
   return "Revision creation could not be confirmed. Your response is kept here. Retry the same request or refresh to find an existing linked revision.";
  case "REVIEW_QUEUE_UNAVAILABLE":
  case "REVIEW_QUEUE_DENIED":
  case "INVALID_REVIEW_QUEUE_CURSOR":
   return "The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
  case "REVIEW_HISTORY_UNAVAILABLE":
  case "REVIEW_HISTORY_DENIED":
   return context==="review_history"
    ?"Review history unavailable or access denied."
    :"The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
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
   return context==="scientific_retrieval"
    ?"The scientific retrieval request could not be completed. Nothing was generated."
    :"Investigation could not run. No findings were generated.";
  case "RETRIEVAL_UNAVAILABLE":
   return "Scientific retrieval is unavailable. No claims can be verified while retrieval is unavailable.";
  case "INVALID_SEARCH_TERM":
  case "INVALID_CURSOR":
  case "INVALID_SEED":
  case "INVALID_LIMIT":
  case "INVALID_TOPICS":
  case "INVALID_DAYS":
  case "INVALID_ORCID":
  case "INVALID_PAPERS":
  case "INVALID_TERMS":
  case "INVALID_PAIRS":
  case "INVALID_INPUT":
   return "Check the search or retrieval inputs and try again.";
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
   return context==="investigation_load"
    ?"Unable to load an authorised investigation. Sign in with a verified research account or contact the research administrator."
    :"That research resource was not found.";
  case "JSON_REQUIRED":
  case "INVALID_JSON":
  case "PAYLOAD_TOO_LARGE":
  case "REQUEST_TOO_LARGE":
  case "REQUEST_TIMEOUT":
   if(context==="live_run")return "The investigation request was refused. Check the scenario and try again.";
   if(context==="scientific_retrieval")return "The scientific retrieval request was refused. Check the inputs and try again.";
   return "The research request was refused. Check the question and try again.";
  default:
   return undefined;
 }
}

/** Status honesty when a stable `code` is absent (older envelopes / test doubles). */
export function messageForResearchStatus(status:number,context:ResearchApiErrorContext):string|undefined{
 if(status===401){
  if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"||context==="delivery_decide"){
   return "Your session needs attention. Sign in again before continuing.";
  }
  if(context==="live_run")return "Sign in is required before a live investigation can run.";
  if(context==="review_queue"||context==="review_history"){
   return "Sign in with an independently authorised scientific reviewer account to open this queue.";
  }
  if(context==="delivery_load"||context==="brief_download"||context==="outcome_load"||context==="evidence_context"||context==="investigation_load"){
   return "Sign in with a verified research account to open this evidence brief.";
  }
  return "Sign in with a verified research account to open your investigations.";
 }
 if(status===403){
  if(context==="workspace_create"||context==="delivery_submit"||context==="delivery_revise"){
   return "Saving is not available for your account on this deployment. Your question has been kept here.";
  }
  if(context==="delivery_decide"){
   return "The decision could not be confirmed. Your input is retained. Retry the same request or refresh to check whether it was recorded.";
  }
  if(context==="workspace_load"){
   return "Research access has not been confirmed. Check your research account or contact the research administrator.";
  }
  if(context==="review_queue"){
   return "The independent reviewer queue could not be verified. Active SSc reviewer authority and a working research session are required.";
  }
  if(context==="review_history"){
   return "Review history unavailable or access denied.";
  }
  if(context==="delivery_load"||context==="brief_download"){
   return "The evidence brief could not be verified. Check research access, source permissions and deployment readiness.";
  }
  if(context==="outcome_load"){
   return "The research outcome could not be verified. Refresh to check current evidence and access.";
  }
  if(context==="evidence_context"){
   return "The release-bound evidence context could not be verified. Check ownership, draft state and staging write readiness.";
  }
  if(context==="investigation_load"){
   return "Unable to load an authorised investigation. Sign in with a verified research account or contact the research administrator.";
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
 * Use when the response body was already parsed (or cloned).
 */
export function formatResearchApiError(
 res:Response,
 body:ResearchApiErrorBody,
 context:ResearchApiErrorContext,
 fallback:string,
):string{
 const fromCode=messageForResearchCode(body.code,context);
 const fromStatus=fromCode?undefined:messageForResearchStatus(res.status,context);
 const serverError=body.error?.trim();
 const base=fromCode??fromStatus??(serverError||fallback);
 if(res.status===429||body.code==="RATE_LIMITED"){
  return rateLimitedMessage(res,base,fallback);
 }
 return base;
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
 return formatResearchApiError(res,await parseResearchErrorBody(res),context,fallback);
}

export function researchRetryAfterSeconds(res:Response):number|undefined{
 return parseRetryAfterSeconds(res);
}
