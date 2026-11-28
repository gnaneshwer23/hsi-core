import type {MemorySql} from "./scientificMemoryFixtureAdapter";
import type {RevalidationLease} from "../scientificMemoryRevalidationWorker";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createRevalidationAccess(sql:MemorySql){
 async function fail(lease:Pick<RevalidationLease,"jobId"|"leaseId">){
 if(!uuid.test(lease.jobId)||!uuid.test(lease.leaseId))throw Error("Invalid lease");
 const rows=await sql.unsafe("SELECT hsi_memory.fail_revalidation($1::uuid,$2::uuid) AS state",[lease.jobId,lease.leaseId]);
 const state=(rows[0] as {state?:unknown}|undefined)?.state;
 if(rows.length!==1||(state!=="queued"&&state!=="failed"))throw Error("Unexpected failure response");
 }
 return {fail,async claim():Promise<RevalidationLease|null>{
 const rows=await sql.unsafe("SELECT * FROM hsi_memory.claim_revalidation()",[]);
 if(!rows.length)return null;
 const r=rows[0] as {job_id:string;lease_id:string;doi:string;source_version:string};
 if(rows.length!==1||typeof r.job_id!=="string"||typeof r.lease_id!=="string"||!uuid.test(r.job_id)||!uuid.test(r.lease_id))throw Error("Invalid claim response");
 const keys={jobId:r.job_id,leaseId:r.lease_id};
 try{
 const ids=await sql.unsafe("SELECT * FROM hsi_memory.read_revalidation_identity($1::uuid,$2::uuid)",[keys.jobId,keys.leaseId]);
 const i=ids[0] as {pmid?:unknown;prior_quarantine?:unknown}|undefined;
 if(ids.length!==1||typeof i?.pmid!=="string"||! /^[1-9][0-9]{0,11}$/.test(i.pmid)||typeof i.prior_quarantine!=="boolean"||typeof r.doi!=="string"||typeof r.source_version!=="string")throw Error("Identity unavailable");
 return {...keys,doi:r.doi,version:r.source_version,pmid:i.pmid,priorQuarantine:i.prior_quarantine};
 }catch(e){await fail(keys);throw e;}
 }};
}
