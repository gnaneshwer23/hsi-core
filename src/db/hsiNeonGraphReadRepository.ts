/** Phase 3.9 read-only Neon graph repository.
 * Requires an independently provisioned least-privilege DB role and RLS.
 * This module does NOT migrate tables, verify sessions, or grant DB permissions.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {HsiGraphReadRepository} from "../hsiGovernedGraphQuery";
import type {HsiGraphNode,HsiGraphRelationship} from "../livingHealthKnowledgeGraph";
export function createHsiNeonGraphReadRepository(config:{databaseUrl:string;neonProjectId?:string|null}):HsiGraphReadRepository{
 const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return {async list({scope,query,limit,principalId}){
  if(scope!=="governed_research"||!principalId.trim())throw Error("Research graph scope only");
  if(!query.nodeId)throw Error("Focused research graph query required");
  const sql=new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
  try{
   // No client-provided SQL identifiers. Only research-visible graph rows.
   const rows=await sql`SELECT payload FROM hsi_lhkg_relationships WHERE visibility='governed_research' AND (subject_id=${query.nodeId} OR object_id=${query.nodeId}) AND (${query.predicate??null}::text IS NULL OR predicate=${query.predicate??null}) AND (${query.layer??null}::text IS NULL OR layer=${query.layer??null}) ORDER BY id,version LIMIT ${limit}`;
   const relationships:HsiGraphRelationship[]=rows.map((r:Record<string,unknown>)=>r.payload as HsiGraphRelationship);
   const ids=[query.nodeId,...relationships.flatMap(e=>[e.subjectId,e.objectId])];
   const nodes=await sql`SELECT DISTINCT ON (id) payload FROM hsi_lhkg_nodes WHERE visibility='governed_research' AND id IN ${sql(ids)} ORDER BY id,version DESC`;
   return {nodes:nodes.map((r:Record<string,unknown>)=>r.payload as HsiGraphNode),relationships};
  }finally{await sql.close()}
 }};
}
