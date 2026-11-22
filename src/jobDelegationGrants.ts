/** Server-side delegation grants: how a background job keeps acting for a researcher after that researcher's session has ended.
 *
 * Problem. The gateway caller authority re-verifies a live session on every call, which is right for an HTTP request and wrong for
 * a durable job: the job outlives the browser session, so without something else its calls would simply stop. Keeping the
 * session token alive for the job would be worse (a long-lived bearer secret in a queue). A grant is the narrow alternative.
 *
 * A grant records, on the server only: this job, for this subject and organisation, on this investigation, may act in these roles
 * until this time. It is created ONLY by `authority.delegate`, which requires a live verified session and ownership at that moment.
 * It carries no secret a worker could replay elsewhere: the worker holds a grant id and a job id, and only the authority (server
 * code with the verifier, the ownership lookup and this store) turns them into a gateway authorisation.
 *
 * Properties:
 * - Tamper-evident: each record carries an HMAC-SHA256 under a server signing key (at least 32 bytes). A record that fails
 *   verification is treated as corrupt and refuses the call; it is never silently ignored or repaired.
 * - Revocation is a separate, signed, append-only marker. A grant can be revoked but never un-revoked, and rewriting the grant file
 *   cannot clear a revocation.
 * - Bounded: a lifetime of at most 24 hours by default (hard maximum 7 days), a role list (least privilege) and one job id.
 *
 * Not provided: key rotation, a database-backed store (this one is files on one host or a shared volume, with the same atomicity
 * limits as `fileLock`), listing or bulk revocation by subject, and any protection from someone who holds both the files and the
 * signing key. Losing the key invalidates every grant (fail closed). Account-level changes (user disabled, role removed,
 * membership ended) are handled by the authority's standing check on every call, not by this store. */
import {createHmac,randomUUID,timingSafeEqual} from "node:crypto";
import {existsSync,mkdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {withFileLock,writeFileAtomic,type FileLockOptions} from "./fileLock";
import {HSI_AGENT_ROLES,type HsiAgentRole} from "./hsiAgentIntelligenceContracts";

export type DelegationGrant={
 schemaVersion:"hsi-job-grant-1";grantId:string;jobId:string;subjectId:string;organizationId:string;investigationId:string;
 roles:HsiAgentRole[];createdAtMs:number;expiresAtMs:number;
 /** Domain-separated hash of the originating session id, for audit; the session itself is not needed afterwards. */
 createdBySessionRef:string;
};
export const REVOCATION_REASONS=["user_cancelled","admin_revoked","account_changed","job_finished","suspected_compromise"] as const;
export type RevocationReason=typeof REVOCATION_REASONS[number];
export type GrantState={grant:DelegationGrant;revoked:null|{atMs:number;reason:RevocationReason}};

export interface DelegationGrantStore{
 create(input:Omit<DelegationGrant,"schemaVersion"|"grantId">):Promise<{grantId:string}>;
 /** Null when no such grant exists. Throws when a record exists but is corrupt, forged or unreadable (callers must fail closed). */
 get(grantId:string):Promise<GrantState|null>;
 /** Idempotent. Revoking an unknown grant is an error so a typo cannot look like success. */
 revoke(grantId:string,reason:RevocationReason):Promise<void>;
}

const GRANT_ID=/^g-[a-f0-9]{32}$/;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export const isGrantId=(v:unknown):v is string=>typeof v==="string"&&GRANT_ID.test(v);

/** Fixed key order so the MAC is stable across writes. */
const canonicalGrant=(g:DelegationGrant)=>JSON.stringify({schemaVersion:g.schemaVersion,grantId:g.grantId,jobId:g.jobId,subjectId:g.subjectId,organizationId:g.organizationId,investigationId:g.investigationId,roles:[...g.roles],createdAtMs:g.createdAtMs,expiresAtMs:g.expiresAtMs,createdBySessionRef:g.createdBySessionRef});
const canonicalRevocation=(grantId:string,atMs:number,reason:string)=>JSON.stringify({kind:"hsi-job-grant-revocation-1",grantId,atMs,reason});

export function validateGrantInput(g:Omit<DelegationGrant,"schemaVersion"|"grantId">,maxLifetimeMs:number,nowMs:number):void{
 if(!g||!ID.test(g.jobId)||!ID.test(g.investigationId)||typeof g.subjectId!=="string"||!g.subjectId.trim()||g.subjectId.length>256||!ID.test(g.organizationId))throw Error("Invalid grant identity");
 if(!Array.isArray(g.roles)||!g.roles.length||g.roles.length>9||new Set(g.roles).size!==g.roles.length||g.roles.some(r=>!(HSI_AGENT_ROLES as readonly string[]).includes(r)))throw Error("Invalid grant roles");
 if(!Number.isSafeInteger(g.createdAtMs)||!Number.isSafeInteger(g.expiresAtMs)||g.expiresAtMs<=g.createdAtMs||g.expiresAtMs-g.createdAtMs>maxLifetimeMs||g.expiresAtMs<=nowMs)throw Error("Invalid grant lifetime");
 if(!/^[a-f0-9]{24}$/.test(g.createdBySessionRef))throw Error("Invalid session reference");
}

function parseGrant(v:unknown):DelegationGrant{
 const g=v as DelegationGrant;
 if(!g||typeof g!=="object"||g.schemaVersion!=="hsi-job-grant-1"||!isGrantId(g.grantId))throw Error("Corrupt grant");
 validateGrantInput(g,Number.MAX_SAFE_INTEGER,0);
 return g;
}

const mac=(key:Buffer,text:string)=>createHmac("sha256",key).update(text).digest();
const same=(a:Buffer,b:Buffer)=>a.length===b.length&&timingSafeEqual(a,b);

export type FileGrantStoreOptions=FileLockOptions&{
 /** At least 32 bytes of server-only key material (for example 32 random bytes, base64 in a secret). Never logged or stored with the grants. */
 signingKey:string|Uint8Array;
 /** Default 24 hours, hard maximum 7 days. */
 maxLifetimeMs?:number;
 now?:()=>number;
};

export function createFileGrantStore(dir:string,opts:FileGrantStoreOptions):DelegationGrantStore{
 const key=Buffer.from(opts.signingKey as never);
 if(key.length<32)throw Error("Grant signing key must be at least 32 bytes");
 const maxLife=opts.maxLifetimeMs??86_400_000;
 if(!Number.isInteger(maxLife)||maxLife<1_000||maxLife>7*86_400_000)throw Error("Invalid maximum grant lifetime");
 const now=opts.now??Date.now;
 for(const sub of ["grants","revocations"])mkdirSync(join(dir,sub),{recursive:true});
 const gFile=(id:string)=>join(dir,"grants",`${id}.json`),rFile=(id:string)=>join(dir,"revocations",`${id}.json`);
 const readSigned=<T>(file:string,text:(v:T)=>string):T|null=>{
  if(!existsSync(file))return null;
  const raw=JSON.parse(readFileSync(file,"utf8")) as {body:T;mac:string};
  if(!raw||typeof raw.mac!=="string"||!/^[a-f0-9]{64}$/.test(raw.mac)||!same(mac(key,text(raw.body)),Buffer.from(raw.mac,"hex")))throw Error("Grant record failed verification");
  return raw.body;
 };
 return {
  async create(input){
   const t=now();validateGrantInput(input,maxLife,t);
   const grantId="g-"+randomUUID().replace(/-/g,"");
   const grant:DelegationGrant={schemaVersion:"hsi-job-grant-1",grantId,...input,roles:[...input.roles]};
   await withFileLock(gFile(grantId)+".lock",()=>{
    if(existsSync(gFile(grantId)))throw Error("Grant id collision");
    writeFileAtomic(gFile(grantId),JSON.stringify({body:grant,mac:mac(key,canonicalGrant(grant)).toString("hex")}));
   },opts);
   return {grantId};
  },
  async get(grantId){
   if(!isGrantId(grantId))return null;
   const body=readSigned<DelegationGrant>(gFile(grantId),canonicalGrant);
   if(!body)return null;
   const grant=parseGrant(body);
   if(grant.grantId!==grantId)throw Error("Grant record does not match its id");
   const rev=readSigned<{grantId:string;atMs:number;reason:RevocationReason}>(rFile(grantId),r=>canonicalRevocation(r.grantId,r.atMs,r.reason));
   if(rev&&(rev.grantId!==grantId||!(REVOCATION_REASONS as readonly string[]).includes(rev.reason)||!Number.isSafeInteger(rev.atMs)))throw Error("Revocation record is corrupt");
   return {grant,revoked:rev?{atMs:rev.atMs,reason:rev.reason}:null};
  },
  async revoke(grantId,reason){
   if(!isGrantId(grantId)||!(REVOCATION_REASONS as readonly string[]).includes(reason))throw Error("Invalid revocation");
   if(!existsSync(gFile(grantId)))throw Error("Unknown grant");
   await withFileLock(rFile(grantId)+".lock",()=>{
    if(existsSync(rFile(grantId)))return; // already revoked: keep the original time and reason
    const body={grantId,atMs:now(),reason};
    writeFileAtomic(rFile(grantId),JSON.stringify({body,mac:mac(key,canonicalRevocation(body.grantId,body.atMs,body.reason)).toString("hex")}));
   },opts);
  },
 };
}
