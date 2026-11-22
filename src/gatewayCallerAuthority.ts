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
 * - A live session is needed to ISSUE anything. A background job that outlives the session uses a delegation grant
 *   (`jobDelegationGrants.ts`), created by `delegate` while the session is live and honoured by `authoriseDelegated`. Every use of a
 *   grant re-reads the grant, its revocation marker, expiry, role scope, the account's standing and investigation ownership.
 * - Two dependency lookups per call; there is no cache, by design, so revocation takes effect immediately.
 * - It proves who is calling and for what. It does not make the provider data scientifically valid, and it is not a security
 *   acceptance: an independent reviewer has not examined it. */
import {createHash} from "node:crypto";
import {isGrantId,type DelegationGrantStore} from "./jobDelegationGrants";
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
 /** Enables background jobs: grants created by `delegate` and honoured by `authoriseDelegated`. Both need `resolveStanding`. */
 grants?:DelegationGrantStore;
 /** Server-side account standing, checked on every delegated call: null when the user is disabled or no longer a member of the organisation.
  * This is how account-level changes stop a job even though the originating session is long gone. */
 resolveStanding?:(subjectId:string,organizationId:string)=>Promise<{roles:readonly string[]}|null>;
 now?:()=>number;
 /** How long an authorisation may be presented. Default 5 minutes; each use is re-verified regardless. */
 ttlMs?:number;
};
export interface GatewayCallerAuthority{
 authorise(input:{sessionToken:string;investigationId:string;taskId:string;role:string}):Promise<{ok:true;authorisation:GatewayAuthorisation}|{ok:false;code:AuthorisationRefusal}>;
 check(authorisation:unknown):Promise<GatewayAuthorisation|null>;
 /** Needs a LIVE verified session and ownership now. Records a grant so the named job can keep acting after the session ends. */
 delegate(input:{sessionToken:string;investigationId:string;jobId:string;roles:readonly string[];lifetimeMs?:number}):Promise<{ok:true;grantId:string}|{ok:false;code:AuthorisationRefusal}>;
 /** For a worker: turns a grant id and its job id into a gateway authorisation, re-checking the grant, revocation, standing and ownership. */
 authoriseDelegated(input:{grantId:string;jobId:string;taskId:string;role:string}):Promise<{ok:true;authorisation:GatewayAuthorisation}|{ok:false;code:AuthorisationRefusal}>;
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

type Internal=
 |{kind:"session";token:string;subjectId:string;organizationId:string;sessionId:string;investigationId:string;expiresAtMs:number}
 |{kind:"grant";grantId:string;jobId:string;subjectId:string;organizationId:string;investigationId:string;roles:readonly string[];expiresAtMs:number};

export function createGatewayCallerAuthority(deps:CallerAuthorityDeps):GatewayCallerAuthority{
 const issued=new WeakMap<object,Internal>();
 const now=deps.now??Date.now,ttl=deps.ttlMs??300_000;
 if(!Number.isInteger(ttl)||ttl<1_000||ttl>3_600_000)throw Error("Invalid authorisation lifetime");
 const manifests=deps.manifests??((r:HsiAgentRole)=>canonicalHsiManifest(r));
 const validPrincipal=(p:VerifiedPrincipal|null):p is VerifiedPrincipal=>
  !!p&&typeof p.subjectId==="string"&&!!p.subjectId.trim()&&typeof p.sessionId==="string"&&!!p.sessionId.trim()&&typeof p.organizationId==="string"&&ORG.test(p.organizationId)&&Array.isArray(p.roles)&&p.roles.some(r=>OPERATOR_ROLES.has(r));
 const orgOk=(o:string)=>typeof o==="string"&&ORG.test(o);
 const operator=(roles:readonly string[]|undefined)=>Array.isArray(roles)&&roles.some(r=>OPERATOR_ROLES.has(r));
 const ownerOk=(o:{ownerSubjectId:string;organizationId:string}|null,subjectId:string,organizationId:string)=>!!o&&o.ownerSubjectId===subjectId&&o.organizationId===organizationId;
 /** Canonical manifest for a role, validated, cloned, and restricted to the public data class. */
 const manifestFor=(role:HsiAgentRole):{ok:true;manifest:HsiAgentManifest}|{ok:false;code:AuthorisationRefusal}=>{
  try{
   let m=manifests(role);if(!m||m.role!==role)return {ok:false,code:"unavailable"};
   validateHsiAgentManifest(m);m=structuredClone(m);
   if(m.dataClasses.some(d=>d!=="public_biomedical"))return {ok:false,code:"forbidden"}; // licensed and demo classes are not granted here
   return {ok:true,manifest:m};
  }catch{return {ok:false,code:"unavailable"}}
 };
 const issue=(internal:Internal,role:HsiAgentRole,taskId:string,manifest:HsiAgentManifest)=>{
  const expiresAtMs=Math.min(now()+ttl,internal.expiresAtMs);
  const authorisation:GatewayAuthorisation=Object.freeze({
   kind:"hsi-gateway-authorisation-1" as const,investigationId:internal.investigationId,taskId,role,
   principalRef:ref("principal",internal.subjectId),tenantRef:ref("tenant",internal.organizationId),manifest:deepFreeze(manifest),expiresAtMs,
  });
  issued.set(authorisation,{...internal,expiresAtMs});
  return authorisation;
 };
 /** The live-session half shared by `authorise` and `delegate`. */
 async function establish(sessionToken:unknown,investigationId:unknown):Promise<{ok:true;principal:VerifiedPrincipal}|{ok:false;code:AuthorisationRefusal}>{
  if(typeof sessionToken!=="string"||typeof investigationId!=="string"||!ID.test(investigationId))return {ok:false,code:"invalid_request"};
  if(sessionToken.length<16||sessionToken.length>4096||/\s/.test(sessionToken))return {ok:false,code:"unauthenticated"};
  let principal:VerifiedPrincipal|null;
  try{principal=await deps.verifySession(sessionToken)}catch{return {ok:false,code:"unavailable"}}
  if(!principal)return {ok:false,code:"unauthenticated"};
  if(!validPrincipal(principal))return {ok:false,code:"forbidden"};
  let owner:{ownerSubjectId:string;organizationId:string}|null;
  try{owner=await deps.resolveInvestigation(investigationId)}catch{return {ok:false,code:"unavailable"}}
  if(!ownerOk(owner,principal.subjectId,principal.organizationId))return {ok:false,code:"forbidden"};
  return {ok:true,principal};
 }
 return {
  async authorise(input){
   if(!input||typeof input.taskId!=="string"||typeof input.role!=="string"||!ID.test(input.taskId)||!(HSI_AGENT_ROLES as readonly string[]).includes(input.role))return {ok:false,code:"invalid_request"};
   const e=await establish(input.sessionToken,input.investigationId);if(!e.ok)return e;
   const role=input.role as HsiAgentRole,m=manifestFor(role);if(!m.ok)return m;
   const p=e.principal;
   return {ok:true,authorisation:issue({kind:"session",token:input.sessionToken,subjectId:p.subjectId,organizationId:p.organizationId,sessionId:p.sessionId,investigationId:input.investigationId,expiresAtMs:Number.MAX_SAFE_INTEGER},role,input.taskId,m.manifest)};
  },
  async delegate(input){
   if(!deps.grants||!deps.resolveStanding)return {ok:false,code:"unavailable"};
   if(!input||typeof input.jobId!=="string"||!ID.test(input.jobId)||!Array.isArray(input.roles)||!input.roles.length||input.roles.some(r=>typeof r!=="string"||!(HSI_AGENT_ROLES as readonly string[]).includes(r)))return {ok:false,code:"invalid_request"};
   const lifetime=input.lifetimeMs??86_400_000;
   if(!Number.isInteger(lifetime)||lifetime<60_000)return {ok:false,code:"invalid_request"};
   const e=await establish(input.sessionToken,input.investigationId);if(!e.ok)return e;
   // Every requested role must be one the server would issue; a grant never widens what a live session could do.
   for(const r of input.roles){const m=manifestFor(r as HsiAgentRole);if(!m.ok)return m}
   try{
    const t=now();
    const {grantId}=await deps.grants.create({jobId:input.jobId,subjectId:e.principal.subjectId,organizationId:e.principal.organizationId,investigationId:input.investigationId,roles:[...input.roles] as HsiAgentRole[],createdAtMs:t,expiresAtMs:t+lifetime,createdBySessionRef:ref("session",e.principal.sessionId)});
    return {ok:true,grantId};
   }catch{return {ok:false,code:"invalid_request"}}
  },
  async authoriseDelegated(input){
   if(!deps.grants||!deps.resolveStanding)return {ok:false,code:"unavailable"};
   if(!input||!isGrantId(input.grantId)||typeof input.jobId!=="string"||typeof input.taskId!=="string"||!ID.test(input.taskId)||!(HSI_AGENT_ROLES as readonly string[]).includes(input.role))return {ok:false,code:"invalid_request"};
   const v=await validateGrant(input.grantId,input.jobId,input.role);
   if(!v.ok)return v;
   const role=input.role as HsiAgentRole,m=manifestFor(role);if(!m.ok)return m;
   const g=v.grant;
   return {ok:true,authorisation:issue({kind:"grant",grantId:g.grantId,jobId:g.jobId,subjectId:g.subjectId,organizationId:g.organizationId,investigationId:g.investigationId,roles:g.roles,expiresAtMs:g.expiresAtMs},role,input.taskId,m.manifest)};
  },
  async check(candidate){
   try{
    if(!candidate||typeof candidate!=="object")return null;
    const internal=issued.get(candidate as object);
    if(!internal||now()>=internal.expiresAtMs)return null;
    const a=candidate as GatewayAuthorisation;
    if(internal.kind==="session"){
     const principal=await deps.verifySession(internal.token);
     if(!validPrincipal(principal)||principal.subjectId!==internal.subjectId||principal.organizationId!==internal.organizationId||principal.sessionId!==internal.sessionId)return null;
     const owner=await deps.resolveInvestigation(internal.investigationId);
     return ownerOk(owner,principal.subjectId,principal.organizationId)?a:null;
    }
    const v=await validateGrant(internal.grantId,internal.jobId,a.role);
    return v.ok&&v.grant.subjectId===internal.subjectId&&v.grant.organizationId===internal.organizationId&&v.grant.investigationId===internal.investigationId?a:null;
   }catch{return null}
  },
 };
 /** Grant state, revocation, expiry, role scope, account standing and ownership: all re-read on every use. */
 async function validateGrant(grantId:string,jobId:string,role:string):Promise<{ok:true;grant:import("./jobDelegationGrants").DelegationGrant}|{ok:false;code:AuthorisationRefusal}>{
  let state;try{state=await deps.grants!.get(grantId)}catch{return {ok:false,code:"unavailable"}}
  if(!state||state.revoked||state.grant.jobId!==jobId)return {ok:false,code:"forbidden"};
  const g=state.grant;
  if(now()>=g.expiresAtMs||!g.roles.includes(role as HsiAgentRole))return {ok:false,code:"forbidden"};
  let standing;try{standing=await deps.resolveStanding!(g.subjectId,g.organizationId)}catch{return {ok:false,code:"unavailable"}}
  if(!standing||!operator(standing.roles))return {ok:false,code:"forbidden"};
  let owner;try{owner=await deps.resolveInvestigation(g.investigationId)}catch{return {ok:false,code:"unavailable"}}
  if(!ownerOk(owner,g.subjectId,g.organizationId)||!orgOk(g.organizationId))return {ok:false,code:"forbidden"};
  return {ok:true,grant:g};
 }
}

/** Convenience for an API route that holds the verified session: an authoriser the orchestrator can call per task. */
export function authoriseCallsFor(authority:GatewayCallerAuthority,session:{sessionToken:string;investigationId:string}){
 return async(task:{taskId:string;role:HsiAgentRole}):Promise<GatewayAuthorisation>=>{
  const r=await authority.authorise({sessionToken:session.sessionToken,investigationId:session.investigationId,taskId:task.taskId,role:task.role});
  if(!r.ok)throw Error(`Gateway authorisation refused: ${r.code}`);
  return r.authorisation;
 };
}

/** Convenience for a worker: an authoriser for one job's tasks, backed by its grant. */
export function authoriseJobCallsFor(authority:GatewayCallerAuthority,job:{grantId:string;jobId:string}){
 return async(task:{taskId:string;role:HsiAgentRole}):Promise<GatewayAuthorisation>=>{
  const r=await authority.authoriseDelegated({grantId:job.grantId,jobId:job.jobId,taskId:task.taskId,role:task.role});
  if(!r.ok)throw Error(`Gateway authorisation refused: ${r.code}`);
  return r.authorisation;
 };
}
