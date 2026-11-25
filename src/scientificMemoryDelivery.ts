/** Fixture-only delivery boundary. Revalidation is statement-time, not a durable access lease. */
import type {MemorySql} from "./db/scientificMemoryFixtureAdapter";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scope=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export interface RankedReference {id:string;version:number}
export interface DeliveredMemory extends RankedReference {body:string;sourceRefs:string[];scientificClaimAllowed:false;trust:"untrusted_research_memory"}
export function createScientificMemoryDelivery(sql:MemorySql){
 return {async deliver(token:string,tenant:string,scopeId:string,ranked:readonly RankedReference[]):Promise<DeliveredMemory[]>{
  if(typeof token!=="string"||token.length<16||token.length>4096||/\s/.test(token)||typeof tenant!=="string"||!scope.test(tenant)||typeof scopeId!=="string"||!scope.test(scopeId)||!Array.isArray(ranked)||ranked.length>100)throw Error("Invalid delivery selection");
  const expected=new Map<string,number>();
  for(const r of ranked){if(!r||typeof r.id!=="string"||!uuid.test(r.id)||!Number.isInteger(r.version)||r.version<1||r.version>2147483647||expected.has(r.id.toLowerCase()))throw Error("Invalid delivery reference");expected.set(r.id.toLowerCase(),r.version);}
  if(!expected.size)return [];
  try{
   const rows=await sql.unsafe("SELECT * FROM hsi_memory.revalidate_ranked($1::text,$2::text,$3::text,$4::uuid[],$5::integer[])",[token,tenant,scopeId,"{"+[...expected.keys()].join(",")+"}","{"+[...expected.values()].join(",")+"}"]);
   if(!Array.isArray(rows)||rows.length>expected.size)throw Error();
   const result=new Map<string,DeliveredMemory>();
   for(const raw of rows){
    const r=raw as Record<string,unknown>;
    if(!r||typeof r.record_id!=="string"||typeof r.version!=="number"||expected.get(r.record_id.toLowerCase())!==r.version||result.has(r.record_id.toLowerCase())||typeof r.body!=="string"||new TextEncoder().encode(r.body).length>65536||!Array.isArray(r.source_refs)||r.source_refs.length>100||r.source_refs.some(s=>typeof s!=="string"||s.length>2048))throw Error();
    const id=r.record_id.toLowerCase();
    result.set(id,{id,version:r.version,body:r.body,sourceRefs:[...r.source_refs],scientificClaimAllowed:false,trust:"untrusted_research_memory"});
   }
   return [...expected.keys()].flatMap(id=>{const row=result.get(id);return row?[row]:[];});
  }catch{throw Error("Scientific memory delivery unavailable");}
 }};
}
