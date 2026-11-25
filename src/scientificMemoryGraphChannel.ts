/** Fixture-only graph channel. Candidate IDs are server-selected, not a public API. */
import type {MemorySql} from "./db/scientificMemoryFixtureAdapter";
import {createMemoryGraphRetriever,type MemoryGraphLink} from "./scientificMemoryGraphRetrieval";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scope=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export function createMemoryGraphChannel(sql:MemorySql,retriever:Awaited<ReturnType<typeof createMemoryGraphRetriever>>){
 return {async search(token:string,tenant:string,scopeId:string,terms:readonly string[],candidateIds:readonly string[],limit=10){
  if(typeof token!=="string"||token.length<16||token.length>4096||/\s/.test(token)||typeof tenant!=="string"||!scope.test(tenant)||typeof scopeId!=="string"||!scope.test(scopeId)||!Array.isArray(candidateIds)||candidateIds.length>100||Array.from(candidateIds).some(id=>typeof id!=="string"||!uuid.test(id))||new Set(candidateIds.map(id=>id.toLowerCase())).size!==candidateIds.length)throw Error("Invalid graph selection");
  // Validate query even when no candidates exist.
  retriever.rank(terms,[],limit);
  if(candidateIds.length===0)return [];
  const allowed=new Set(candidateIds.map(id=>id.toLowerCase()));
  try{
   const rows=await sql.unsafe("SELECT * FROM hsi_memory.read_graph_links($1::text,$2::text,$3::text,$4::text,$5::uuid[])",[token,tenant,scopeId,retriever.graphVersion,[...candidateIds]]);
   if(rows.length>5000)throw Error();
   const grouped=new Map<string,{id:string;version:number;nodeIds:string[]}>();
   for(const raw of rows){
    const r=raw as Record<string,unknown>;
    if(!r||typeof r.record_id!=="string"||!allowed.has(r.record_id.toLowerCase())||typeof r.version!=="number"||!Number.isSafeInteger(r.version)||r.version<1||typeof r.node_id!=="string")throw Error();
    const id=r.record_id.toLowerCase();
    const entry=grouped.get(id)??{id,version:r.version,nodeIds:[]};
    if(entry.version!==r.version||entry.nodeIds.includes(r.node_id)||entry.nodeIds.length>=50)throw Error();
    entry.nodeIds.push(r.node_id);grouped.set(id,entry);
   }
   const links:MemoryGraphLink[]=[...grouped.values()];
   return retriever.rank(terms,links,limit);
  }catch{throw Error("Graph retrieval unavailable");}
 }};
}
