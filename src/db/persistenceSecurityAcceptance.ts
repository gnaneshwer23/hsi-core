/** Verify independent staging security evidence. Never enables a route, migration or production write. */
import {createHash,verify,type KeyObject} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {REQUIRED_ACTIVATION_CHECKS} from "./contradictionActivationGate";
import {PERSISTENCE_SCOPE_MIGRATIONS,type PersistenceScope} from "./migrationRehearsal";
export const PERSISTENCE_SECURITY_CHECKS=[...REQUIRED_ACTIVATION_CHECKS,"cross_owner_enumeration_edit_export_denied","revoked_and_wrong_scope_reviewer_denied","pooled_connection_reuse_isolated","logout_session_revocation_enforced","concurrent_idempotent_submission_decision","backup_restore_verified","production_readonly_confirmed"] as const;
export type PersistenceSecurityCheck=(typeof PERSISTENCE_SECURITY_CHECKS)[number];
export type SecurityEvidenceKind="authenticated_http"|"catalogue"|"database_rehearsal"|"database_restore";
export type PersistenceSecurityPacket={
 schemaVersion:"hsi-persistence-security-acceptance-1";id:string;scope:PersistenceScope;
 environment:"isolated_staging";targetHash:string;commitSha:string;
 participants:{researcherA:{principalHash:string;scopeHash:string};researcherB:{principalHash:string;scopeHash:string};reviewer:{principalHash:string}};
 checks:{check:PersistenceSecurityCheck;passed:true;artifactSha256:string;kind:SecurityEvidenceKind}[];
 signerId:string;keyId:string;signedAt:string;expiresAt:string;signature:string;
};
const sha=(s:string|Uint8Array)=>createHash("sha256").update(s).digest("hex"),hex=(v:unknown)=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const fields=["schemaVersion","id","scope","environment","targetHash","commitSha","participants","checks","signerId","keyId","signedAt","expiresAt","signature"];
export function persistenceSecuritySigningText(packet:Omit<PersistenceSecurityPacket,"signature">|PersistenceSecurityPacket){const {signature:_,...body}=packet as PersistenceSecurityPacket;return canonicalEvidenceJson(body);}
export function persistenceTargetHash(target:{projectId:string;branchId:string;scope:PersistenceScope;routeSchemaHash:string;runtimeConfigHash:string}){return sha(canonicalEvidenceJson(target));}
function requiredKind(check:PersistenceSecurityCheck):SecurityEvidenceKind{
 if(check==="restricted_role_no_bypassrls"||check==="production_readonly_confirmed")return "catalogue";
 if(check==="migration_rollback_verified")return "database_rehearsal";
 if(check==="backup_restore_verified")return "database_restore";
 return "authenticated_http";
}
export function createPersistenceSecurityVerifier(config:{
 authorities:readonly {signerId:string;keyId:string;principalHash:string;publicKey:KeyObject;scopes:readonly PersistenceScope[]}[];
 loadEvidence:(hash:string,signal:AbortSignal)=>Promise<Uint8Array>;
 isRevoked:(id:string,signerId:string,signal:AbortSignal)=>Promise<boolean>;
 now?:()=>number;timeoutMs?:number;
}){
 const authorities=config.authorities.map(a=>({...a,scopes:[...a.scopes]})),loadEvidence=config.loadEvidence,isRevoked=config.isRevoked,now=config.now??Date.now,timeoutMs=config.timeoutMs??5000;
 if(!authorities.length||authorities.some(a=>!hex(a.principalHash)||!a.scopes.length||a.scopes.some(scope=>!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,scope))||a.publicKey.type!=="public"||a.publicKey.asymmetricKeyType!=="ed25519")||new Set(authorities.map(a=>JSON.stringify([a.signerId,a.keyId]))).size!==authorities.length||typeof loadEvidence!=="function"||typeof isRevoked!=="function"||!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>10000)throw Error("Independent security authority required");
 return {async verify(input:unknown,expected:{scope:PersistenceScope;targetHash:string;commitSha:string}){
  const denied={acceptedForScope:false,productionActivationApproved:false as const,scientificApproval:false as const};
  try{expected=structuredClone(expected);}catch{return denied;}
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  const operation=async()=>{
   const p=structuredClone(input) as PersistenceSecurityPacket;
   if(!p||typeof p!=="object"||Object.keys(p).sort().join(",")!==[...fields].sort().join(",")||canonicalEvidenceJson(p).length>64000)return false;
   if(p.schemaVersion!=="hsi-persistence-security-acceptance-1"||p.environment!=="isolated_staging"||!Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,p.scope)||p.scope!==expected.scope||p.targetHash!==expected.targetHash||!hex(p.targetHash)||p.commitSha!==expected.commitSha||!/^[a-f0-9]{40}$/.test(p.commitSha)||typeof p.id!=="string"||!/^[A-Za-z0-9:_.-]{1,128}$/.test(p.id))return false;
   const {researcherA:a,researcherB:b,reviewer}=p.participants;
   if(![a.principalHash,b.principalHash,reviewer.principalHash,a.scopeHash,b.scopeHash].every(hex)||a.principalHash===b.principalHash||a.scopeHash===b.scopeHash||[a.principalHash,b.principalHash].includes(reviewer.principalHash))return false;
   const authority=authorities.find(k=>k.signerId===p.signerId&&k.keyId===p.keyId&&k.scopes.includes(p.scope));
   if(!authority||[a.principalHash,b.principalHash].includes(authority.principalHash)||!p.signature||!/^[A-Za-z0-9_-]{86}$/.test(p.signature)||!verify(null,Buffer.from(persistenceSecuritySigningText(p)),authority.publicKey,Buffer.from(p.signature,"base64url")))return false;
   const signed=Date.parse(p.signedAt),expiry=Date.parse(p.expiresAt),current=now();
   if(!Number.isFinite(signed)||!Number.isFinite(expiry)||!Number.isFinite(current)||signed>current||expiry<=current||expiry<=signed||expiry-signed>86400000)return false;
   if(!Array.isArray(p.checks)||p.checks.length!==PERSISTENCE_SECURITY_CHECKS.length||new Set(p.checks.map(c=>c.check)).size!==p.checks.length||new Set(p.checks.map(c=>c.artifactSha256)).size!==p.checks.length)return false;
   for(const check of PERSISTENCE_SECURITY_CHECKS){
    const item=p.checks.find(c=>c.check===check);
    if(!item||item.passed!==true||!hex(item.artifactSha256)||item.kind!==requiredKind(check))return false;
    const bytes=await loadEvidence(item.artifactSha256,controller.signal);
    if(!(bytes instanceof Uint8Array)||bytes.byteLength>1_000_000||sha(bytes)!==item.artifactSha256)return false;
    const evidence=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
    const executed=Date.parse(evidence.executedAt);
    if(evidence.source!=="real_staging_execution"||evidence.fixture!==false||evidence.check!==check||evidence.scope!==p.scope||evidence.targetHash!==p.targetHash||evidence.commitSha!==p.commitSha||evidence.kind!==item.kind||evidence.outcome!=="passed"||!Number.isFinite(executed)||executed>signed||signed-executed>86400000)return false;
   }
   if(await isRevoked(p.id,p.signerId,controller.signal)!==false)return false;
   const after=now();return !controller.signal.aborted&&Number.isFinite(after)&&after>=signed&&after<expiry;
  };
  try{
   const accepted=await Promise.race([operation(),new Promise<false>(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(false)},timeoutMs)})]);
   return {...denied,acceptedForScope:accepted};
  }catch{return denied;}finally{if(timer)clearTimeout(timer);controller.abort();}
 }};
}
