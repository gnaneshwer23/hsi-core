/** Caller authority for the governed tool gateway: who may make a tool call, for which investigation, with which permissions.
 *
 * Why it exists. Before this, the gateway trusted whatever `manifest`, `investigationId` and `taskId` a caller put in a request. Code
 * that can call the gateway could therefore claim any investigation, any budget and any tool allowlist. Here the gateway instead
 * demands an AUTHORISATION that only this module can issue, and it re-checks that authorisation on every call.
 *
 * An authorisation is issued only when, on the server, all of these hold:
 * 1. the session token verifies through the injected server-side verifier (never from request JSON or a client claim);
 * 2. the verified principal holds a researcher or research_admin role (a reviewer role alone is read-only);
 * 3. the investigation exists in server-side storage and is owned by that principal in that organisation (not found and not
 *    owned are indistinguishable to the caller);
 * 4. the manifest (role, tool allowlist, call budget, data class) comes from the server's canonical registry, never from the caller.
 *
 * It is unforgeable by construction: an authorisation is a frozen object registered in a module-private WeakMap. A copy, a
 * structured clone, a JSON round trip or an object literal is not in the map and is refused. The session token lives only in that
 * map's closure and is never placed in the authorisation, logs or audit records.
 *
 * `check` runs on EVERY gateway call and re-verifies: expiry, that the session still verifies as the same subject, organisation and
 * session id (so a revoked or expired session stops working at the next call), and that the investigation is still owned by that
 * principal. Any dependency error fails closed.
 *
 * Limits, stated plainly:
 * - Only `public_biomedical` is granted. Licensed-partner data needs an entitlement check that does not exist yet.
 * - It needs a live session. A background job that outlives the user's session needs a server-side delegation grant (job id,
 *   subject, investigation, expiry, revocation); none exists, so such a job's calls are refused once the session ends. That is the
 *   safe direction, and it is the open dependency for authenticated durable execution.
 * - Two dependency lookups per call; there is no cache, by design, so revocation takes effect immediately.
 * - It proves who is calling and for what. It does not make the provider data scientifically valid, and it is not a security
 *   acceptance: an independent reviewer has not examined it. */
import {createHash} from "node:crypto";
import {HSI_AGENT_ROLES,HSI_ROLE_TOOL_ALLOWLIST,validateHsiAgentManifest,type HsiAgentManifest,type HsiAgentRole} from "./hsiAgentIntelligenceContracts";

/** The shape `TrustedSessionGateway.verifySession` already returns. */
export type VerifiedPrincipal={subjectId:string;organizationId:string;sessionId:string;roles:readonly string[]};
export type AuthorisationRefusal="unauthenticated"|"forbidden"|"invalid_request"|"unavailable";
export type GatewayAuthorisation=Readonly<{
 kind:"hsi-gateway-authorisation-1";investigationId:string;taskId:string;role:HsiAgentRole;
 /** Domain-separated hashes: stable for correlating audit records, not reversible to the ids. */
 principalRef:string;tenantRef:string;manifest:HsiAgentManifest;expiresAtMs:number;
}>;
export type CallerAuthorityDeps={
 /** Server-side session verification (for example `TrustedSessionGateway.verifySession`). Must not trust client claims. */
 verifySession:(sessionToken:string)=>Promise<VerifiedPrincipal|null>;
 /** Server-side lookup of the investigation's owner. Return null when it does not exist. */
 resolveInvestigation:(investigationId:string)=>Promise<{ownerSubjectId:string;organizationId:string}|null>;
 /** Canonical manifest for a role. Defaults to `canonicalHsiManifest`. */
 manifests?:(role:HsiAgentRole)=>HsiAgentManifest|undefined;
 now?:()=>number;
 /** How long an authorisation may be presented. Default 5 minutes; each use is re-verified regardless. */
 ttlMs?:number;
};
export interface GatewayCallerAuthority{
 authorise(input:{sessionToken:string;investigationId:string;taskId:string;role:string}):Promise<{ok:true;authorisation:GatewayAuthorisation}|{ok:false;code:AuthorisationRefusal}>;
 check(authorisation:unknown):Promise<GatewayAuthorisation|null>;
}

const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ORG=/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const OPERATOR_ROLES=new Set(["researcher","research_admin"]);
const ref=(domain:string,value:string)=>createHash("sha256").update(`${domain}\u0000${value}`).digest("hex").slice(0,24);

/** The server's canonical manifest for a role. The research runtime builds its task manifests from this too. */
export function canonicalHsiManifest(role:HsiAgentRole,opts:{timeoutMs?:number;dataClass?:"public_biomedical"|"licensed_partner"|"synthetic_demo"}={}):HsiAgentManifest{
 return {
  schemaVersion:"hsi-agent-manifest-1",role,version:"1.0.0",inputSchemaId:"hsi-research-agent-input-v1",outputSchemaId:"hsi-research-agent-output-v1",
  promptVersion:"none",modelVersion:"deterministic-arch003-1",allowedTools:[...HSI_ROLE_TOOL_ALLOWLIST[role]],
  maxToolCalls:3,maxQuestions:12,maxDepth:4,timeoutMs:opts.timeoutMs??30_000,
  dataClasses:opts.dataClass==="licensed_partner"?["licensed_partner"]:["public_biomedical"],
 };
}

function deepFreeze<T extends object>(o:T):T{for(const v of Object.values(o))if(v&&typeof v==="object"&&!Object.isFrozen(v))deepFreeze(v as object);return Object.freeze(o)}

type Internal={token:string;subjectId:string;organizationId:string;sessionId:string;ownerSubjectId:string;investigationId:string;expiresAtMs:number};

export function createGatewayCallerAuthority(deps:CallerAuthorityDeps):GatewayCallerAuthority{
 const issued=new WeakMap<object,Internal>();
 const now=deps.now??Date.now,ttl=deps.ttlMs??300_000;
 if(!Number.isInteger(ttl)||ttl<1_000||ttl>3_600_000)throw Error("Invalid authorisation lifetime");
 const manifests=deps.manifests??((r:HsiAgentRole)=>canonicalHsiManifest(r));
 const validPrincipal=(p:VerifiedPrincipal|null):p is VerifiedPrincipal=>
  !!p&&typeof p.subjectId==="string"&&!!p.subjectId.trim()&&typeof p.sessionId==="string"&&!!p.sessionId.trim()&&typeof p.organizationId==="string"&&ORG.test(p.organizationId)&&Array.isArray(p.roles)&&p.roles.some(r=>OPERATOR_ROLES.has(r));
 return {
  async authorise(input){
   if(!input||typeof input.sessionToken!=="string"||typeof input.investigationId!=="string"||typeof input.taskId!=="string"||typeof input.role!=="string"||
    !ID.test(input.investigationId)||!ID.test(input.taskId)||!(HSI_AGENT_ROLES as readonly string[]).includes(input.role))return {ok:false,code:"invalid_request"};
   const token=input.sessionToken;
   if(token.length<16||token.length>4096||/\s/.test(token))return {ok:false,code:"unauthenticated"};
   let principal:VerifiedPrincipal|null;
   try{principal=await deps.verifySession(token)}catch{return {ok:false,code:"unavailable"}}
   if(!principal)return {ok:false,code:"unauthenticated"};
   if(!validPrincipal(principal))return {ok:false,code:"forbidden"};
   let owner:{ownerSubjectId:string;organizationId:string}|null;
   try{owner=await deps.resolveInvestigation(input.investigationId)}catch{return {ok:false,code:"unavailable"}}
   if(!owner||owner.ownerSubjectId!==principal.subjectId||owner.organizationId!==principal.organizationId)return {ok:false,code:"forbidden"};
   const role=input.role as HsiAgentRole;
   let manifest:HsiAgentManifest|undefined;
   try{manifest=manifests(role);if(!manifest||manifest.role!==role){return {ok:false,code:"unavailable"}}validateHsiAgentManifest(manifest);manifest=structuredClone(manifest)}catch{return {ok:false,code:"unavailable"}}
   if(manifest.dataClasses.some(d=>d!=="public_biomedical"))return {ok:false,code:"forbidden"}; // licensed and demo classes are not granted here
   const expiresAtMs=now()+ttl;
   const authorisation:GatewayAuthorisation=Object.freeze({
    kind:"hsi-gateway-authorisation-1" as const,investigationId:input.investigationId,taskId:input.taskId,role,
    principalRef:ref("principal",principal.subjectId),tenantRef:ref("tenant",principal.organizationId),manifest:deepFreeze(manifest),expiresAtMs,
   });
   issued.set(authorisation,{token,subjectId:principal.subjectId,organizationId:principal.organizationId,sessionId:principal.sessionId,ownerSubjectId:owner.ownerSubjectId,investigationId:input.investigationId,expiresAtMs});
   return {ok:true,authorisation};
  },
  async check(candidate){
   try{
    if(!candidate||typeof candidate!=="object")return null;
    const internal=issued.get(candidate as object);
    if(!internal||now()>=internal.expiresAtMs)return null;
    const principal=await deps.verifySession(internal.token);
    if(!validPrincipal(principal)||principal.subjectId!==internal.subjectId||principal.organizationId!==internal.organizationId||principal.sessionId!==internal.sessionId)return null;
    const owner=await deps.resolveInvestigation(internal.investigationId);
    if(!owner||owner.ownerSubjectId!==principal.subjectId||owner.organizationId!==principal.organizationId)return null;
    return candidate as GatewayAuthorisation;
   }catch{return null}
  },
 };
}

/** Convenience for an API route that holds the verified session: an authoriser the orchestrator can call per task. */
export function authoriseCallsFor(authority:GatewayCallerAuthority,session:{sessionToken:string;investigationId:string}){
 return async(task:{taskId:string;role:HsiAgentRole}):Promise<GatewayAuthorisation>=>{
  const r=await authority.authorise({sessionToken:session.sessionToken,investigationId:session.investigationId,taskId:task.taskId,role:task.role});
  if(!r.ok)throw Error(`Gateway authorisation refused: ${r.code}`);
  return r.authorisation;
 };
}
