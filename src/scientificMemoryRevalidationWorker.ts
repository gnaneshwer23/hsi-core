import {adjudicateCapturedPublication} from "./scientificMemoryEnvelopeAdjudication";
type Gateway=Parameters<typeof adjudicateCapturedPublication>[0];
type Candidate=Awaited<ReturnType<typeof adjudicateCapturedPublication>>;
export interface RevalidationLease {jobId:string;leaseId:string;doi:string;version:string;pmid:string;priorQuarantine:boolean}
export interface RevalidationWorkerStore {
 claim():Promise<RevalidationLease|null>;
 commit(lease:RevalidationLease,candidate:Candidate):Promise<void>;
 fail(lease:RevalidationLease):Promise<void>;
}
/** Injected fixture ports only. Commit must atomically bind result to the active lease. */
export function createRevalidationWorker(store:RevalidationWorkerStore,gateway:Gateway,clock:()=>number=Date.now){
 return {async runOnce():Promise<"idle"|"completed"|"retry_requested"|"recovery_required">{
 const lease=await store.claim();
 if(!lease)return "idle";
 try{
 if(!/^10[.]1234\/fixture-[a-z0-9-]{1,80}$/.test(lease.doi)||!/^v[1-9][0-9]{0,8}$/.test(lease.version)||! /^[1-9][0-9]{0,11}$/.test(lease.pmid)||typeof lease.priorQuarantine!=="boolean")throw Error("Invalid fixture identity");
 const candidate=await adjudicateCapturedPublication(gateway,lease.doi,lease.pmid,lease.version,clock);
 if(candidate.identityConflict||candidate.adjudication.doi!==lease.doi||candidate.adjudication.version!==lease.version||candidate.ingestionAllowed!==false||candidate.scientificClaimAllowed!==false)throw Error("Unapproved reassessment");
 if(lease.priorQuarantine&&candidate.decision!=="quarantine")throw Error("Quarantine preserved");
 await store.commit(lease,candidate);
 return "completed";
 }catch{
 try{await store.fail(lease);return "retry_requested";}catch{return "recovery_required";}
 }
 }};
}
