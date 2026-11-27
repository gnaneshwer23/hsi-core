/** Offline scheduling policy; does not execute provider calls or promote evidence. */
export type RevalidationState="quarantine"|"recheck_required"|"insufficient_verified_provenance";
export interface RevalidationCandidate {
 doi:string; version:string; decision:RevalidationState;
 checkedAtMs:number|null; consecutiveFailures:number; lastFailureAtMs:number|null;
}
export function planEvidenceRevalidation(candidate:RevalidationCandidate,nowMs:number){
 const validTime=(n:number)=>Number.isSafeInteger(n)&&n>=0&&n<=nowMs;
 if(!Number.isSafeInteger(nowMs)||nowMs<0||nowMs>Number.MAX_SAFE_INTEGER-30*86400000||
 typeof candidate.doi!=="string"||!/^10[.]1234\/fixture-[a-z0-9-]{1,80}$/.test(candidate.doi)||
 typeof candidate.version!=="string"||!/^v[1-9][0-9]{0,8}$/.test(candidate.version)||
 !["quarantine","recheck_required","insufficient_verified_provenance"].includes(candidate.decision)||
 (candidate.checkedAtMs!==null&&!validTime(candidate.checkedAtMs))||
 !Number.isInteger(candidate.consecutiveFailures)||candidate.consecutiveFailures<0||candidate.consecutiveFailures>100||
 (candidate.lastFailureAtMs!==null&&!validTime(candidate.lastFailureAtMs))||
 (candidate.consecutiveFailures===0)!==(candidate.lastFailureAtMs===null)||
 (candidate.lastFailureAtMs!==null&&candidate.checkedAtMs!==null&&candidate.lastFailureAtMs<candidate.checkedAtMs))throw Error("Invalid revalidation candidate");
 const interval=candidate.decision==="quarantine"?86400000:candidate.decision==="recheck_required"?6*3600000:24*3600000;
 const regularDue=candidate.checkedAtMs===null?0:candidate.checkedAtMs+interval;
 const retryDue=candidate.lastFailureAtMs===null?0:candidate.lastFailureAtMs+Math.min(86400000,60000*2**Math.min(candidate.consecutiveFailures-1,11));
 const dueAtMs=Math.max(regularDue,retryDue);
 return {doi:candidate.doi,version:candidate.version,dueAtMs,due:dueAtMs<=nowMs,
 priority:candidate.decision==="quarantine"?0:candidate.decision==="recheck_required"?1:2,
 quarantinePreserved:candidate.decision==="quarantine",ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
