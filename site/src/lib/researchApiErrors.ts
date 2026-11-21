import {parseRetryAfterSeconds,rateLimitedMessage} from "./retryAfter";

export type ResearchApiErrorBody={code?:string;error?:string};

export type ResearchApiErrorContext=
 |"workspace_load"
 |"workspace_create"
 |"live_run"
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
   return context==="workspace_create"
    ?"Your session needs attention. Sign in again before saving."
    :"Sign in with a verified research account to open your investigations.";
  case "EMAIL_NOT_VERIFIED":
   return "Verify your email address before using the research workspace.";
  case "RESEARCH_ACCESS_DENIED":
  case "RESEARCH_ACCESS_REQUIRED":
   return "Research access has not been confirmed. Check your research account or contact the research administrator.";
  case "RESEARCH_WRITES_DISABLED":
   return context==="workspace_create"
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
   return context==="workspace_create"
    ?"Save could not be confirmed. Retry to check the same request without creating a duplicate."
    :"Your investigations could not be loaded. Please retry.";
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

/**
 * Prefer stable `code` honesty, then server `error` text, then context fallback.
 * On 429 / RATE_LIMITED, append a Retry-After wait hint when present.
 */
export async function researchApiErrorMessage(
 res:Response,
 context:ResearchApiErrorContext,
 fallback:string,
):Promise<string>{
 const body=await parseResearchErrorBody(res);
 const fromCode=messageForResearchCode(body.code,context);
 const serverError=body.error?.trim();
 const base=fromCode??(serverError||fallback);
 if(res.status===429||body.code==="RATE_LIMITED"){
  return rateLimitedMessage(res,base,fallback);
 }
 return base;
}

export function researchRetryAfterSeconds(res:Response):number|undefined{
 return parseRetryAfterSeconds(res);
}
