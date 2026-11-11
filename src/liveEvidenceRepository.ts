/** A-01 live-evidence storage: authenticated, owner-scoped, idempotent and revisioned.
 * This adapter is deliberately independent of the legacy release-bound SSc planner.
 * Database migration is held pending RLS/least-privilege security review.
 */
import {createHash} from "node:crypto";
import {parseResearchBundle,type ResearchBundle} from "./researchContracts";
export type LiveRecord={id:string;ownerId:string;requestId:string;question:string;revision:number;bundle:ResearchBundle;createdAt:string;updatedAt:string};
export interface LiveSql{query(sql:string,params:unknown[]):Promise<Array<Record<string,unknown>>>;transaction<T>(work:(tx:LiveSql)=>Promise<T>):Promise<T>}
export class LiveConflict extends Error{}
export class LiveDenied extends Error{}\n/** Retry identity is bound to the original question, not a freshly generated retrieval run ID. */\nexport class LiveRetryMismatch extends LiveConflict{}
const idPattern=/^hsi-live-[a-f0-9]{32}$/;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
function ownerId(owner:string){if(!/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/.test(owner))throw new LiveDenied();return owner}
function validateLiveBundle(value:unknown):ResearchBundle{\n const bundle=parseResearchBundle(value);\n if(bundle.context.dataClass!=="public_real"||bundle.containsPhi||bundle.clinicalAdvice||bundle.kgWrite||bundle.claims.length||bundle.passages.length||bundle.relationships.length||bundle.entities.length||bundle.runs.length!==1||bundle.sources.some(s=>s.dataClass!=="public_real"||s.licence.passageUsePermitted||s.licence.status!=="unknown"||s.kind!=="publication"))throw new LiveDenied();\n if(bundle.context.question.length<5||bundle.context.question.length>400)throw new LiveDenied();\n return bundle;\n}\nfunction record(row:Record<string,unknown>):LiveRecord{
 const bundle=validateLiveBundle(typeof row.bundle==="string"?JSON.parse(row.bundle):row.bundle);
 const item={id:String(row.id),ownerId:String(row.owner_id),requestId:String(row.request_id),question:String(row.question),revision:Number(row.revision),bundle,createdAt:new Date(String(row.created_at)).toISOString(),updatedAt:new Date(String(row.updated_at)).toISOString()};
 if(!idPattern.test(item.id)||!Number.isSafeInteger(item.revision)||item.revision<1||bundle.context.question!==item.question)throw new LiveDenied();
 return item;
}
export function createLiveEvidenceRepository(db:LiveSql,authenticatedOwner:string){
 const owner=ownerId(authenticatedOwner);
 return {
  async create(requestId:string,bundleInput:unknown):Promise<{record:LiveRecord;created:boolean}>{
   if(!uuid.test(requestId))throw new LiveDenied();
   const bundle=parseResearchBundle(bundleInput);
   if(bundle.context.dataClass!=="public_real"||bundle.containsPhi||bundle.clinicalAdvice||bundle.kgWrite||bundle.claims.length||bundle.passages.length||bundle.relationships.length||bundle.entities.length||bundle.runs.length!==1)throw new LiveDenied();
   const question=bundle.context.question;
   if(question.length<5||question.length>400)throw new LiveDenied();
   const id="hsi-live-"+hash(owner+"\u0000"+requestId).slice(0,32);
   return db.transaction(async tx=>{
    const rows=await tx.query("INSERT INTO public.hsi_live_investigations(id,owner_id,request_id,question,revision,bundle) VALUES($1,$2,$3,$4,1,$5::jsonb) ON CONFLICT(owner_id,request_id) DO NOTHING RETURNING *",[id,owner,requestId,question,JSON.stringify(bundle)]);
    const existing=rows[0]??(await tx.query("SELECT * FROM public.hsi_live_investigations WHERE owner_id=$1 AND request_id=$2",[owner,requestId]))[0];
    if(!existing)throw new LiveDenied();
    const saved=record(existing);
    if(saved.question!==question)throw new LiveRetryMismatch("Idempotency key reused with a different research question");\n    // Live retrieval creates fresh run IDs and timestamps. Never overwrite the first committed snapshot on retry.
    return {record:saved,created:rows.length===1};
   });
  },
  async get(id:string):Promise<LiveRecord|null>{
   if(!idPattern.test(id))throw new LiveDenied();
   const rows=await db.query("SELECT * FROM public.hsi_live_investigations WHERE owner_id=$1 AND id=$2",[owner,id]);
   return rows[0]?record(rows[0]):null;
  },
  async list(limit=20):Promise<LiveRecord[]>{
   if(!Number.isInteger(limit)||limit<1||limit>25)throw new LiveDenied();
   const rows=await db.query("SELECT * FROM public.hsi_live_investigations WHERE owner_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2",[owner,limit]);
   return rows.map(record);
  },
  async revise(id:string,expectedRevision:number,bundleInput:unknown):Promise<LiveRecord>{
   if(!idPattern.test(id)||!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new LiveDenied();
   const bundle=parseResearchBundle(bundleInput);
   if(bundle.containsPhi||bundle.kgWrite||bundle.clinicalAdvice||bundle.claims.length||bundle.passages.length||bundle.relationships.length||bundle.entities.length||bundle.context.dataClass!=="public_real")throw new LiveDenied();
   const rows=await db.query("UPDATE public.hsi_live_investigations SET bundle=$4::jsonb,revision=revision+1,updated_at=now() WHERE owner_id=$1 AND id=$2 AND revision=$3 AND question=$5 RETURNING *",[owner,id,expectedRevision,JSON.stringify(bundle),bundle.context.question]);
   if(rows.length!==1)throw new LiveConflict("Stale revision or inaccessible investigation");
   return record(rows[0]!);
  }
 };
}
