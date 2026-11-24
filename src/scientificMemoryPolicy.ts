/** SME-02 isolated policy rehearsal. Not authentication, persistence or runtime authorisation. */
export const SCIENTIFIC_MEMORY_RUNTIME_ENABLED = false as const;
export type MemoryKind = "note" | "preference" | "hypothesis" | "evidence_reference" | "investigation_reference";
export type MemoryRecord = Readonly<{
 id:string; tenantId:string; scopeId:string; ownerId:string; kind:MemoryKind;
 version:number; state:"active"|"revoked"|"deleted"; visibility:"private"|"shared";
 dataClass:"synthetic_demo"|"public_biomedical"; sourceRefs:readonly string[];
 retentionUntil:number; scientificClaimAllowed:false;
}>;
export type MemoryGrant = Readonly<{recordId:string;tenantId:string;scopeId:string;principalId:string;expiresAt:number;revoked:boolean}>;
/** Synthetic fixture only. Future DB-verified principal and grants must never come from request body. */
export type MemoryPolicyFixture = Readonly<{principalId:string;tenantId:string;activeScopeIds:readonly string[];sessionActive:boolean}>;
const id = (v:string) => typeof v==="string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(v);
export function canReadMemoryFixture(actor:MemoryPolicyFixture,record:MemoryRecord,grants:readonly MemoryGrant[],now:number):boolean {
 if(!Number.isFinite(now)||!Number.isFinite(record.retentionUntil)||record.retentionUntil<=now||
 !actor.sessionActive||!id(actor.principalId)||!id(actor.tenantId)||!id(record.id)||!id(record.scopeId)||!id(record.ownerId)||
 actor.tenantId!==record.tenantId||!actor.activeScopeIds.includes(record.scopeId)||
 record.state!=="active"||record.scientificClaimAllowed!==false||
 !Number.isSafeInteger(record.version)||record.version<1||
 !["synthetic_demo","public_biomedical"].includes(record.dataClass))return false;
 if(record.visibility!=="private"&&record.visibility!=="shared")return false;
 if(actor.principalId===record.ownerId)return true;
 return record.visibility==="shared"&&grants.some(g=>g.recordId===record.id&&g.tenantId===record.tenantId&&g.scopeId===record.scopeId&&g.principalId===actor.principalId&&g.revoked===false&&Number.isFinite(g.expiresAt)&&g.expiresAt>now);
}
/** Filter before ranking. Caller must reauthorise against fresh DB state before delivery in future runtime. */
export function authorisedMemoryFixtures(actor:MemoryPolicyFixture,records:readonly MemoryRecord[],grants:readonly MemoryGrant[],now:number):MemoryRecord[]{
 return records.filter(r=>canReadMemoryFixture(actor,r,grants,now));
}
