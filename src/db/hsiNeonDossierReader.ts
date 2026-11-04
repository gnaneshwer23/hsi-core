/** Phase 3.9 read-only evidence dossier adapter; no migration is applied.
 * An authorised, least-privilege DB role and reviewed RLS policy are required
 * before this can return data. No reviewer authority is inferred from payload.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {HsiWorkbenchDossierReader} from "../hsiResearchWorkbenchIntegration";
import type {HsiRelationshipDossier} from "../hsiEvidenceTemporalDossier";
export function createHsiNeonDossierReader(config:{databaseUrl:string;neonProjectId?:string|null}):HsiWorkbenchDossierReader{
 const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return {async readByRelationshipIds({ids,principalId}){
  if(!principalId.trim()||ids.length>100||new Set(ids).size!==ids.length)throw Error("Invalid evidence dossier request");
  if(!ids.length)return [];
  const sql=new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
  try{
   const rows=await sql`SELECT payload FROM hsi_lhkg_dossiers WHERE relationship_id IN ${sql([...ids])} ORDER BY relationship_id,relationship_version DESC LIMIT 100`;
   return rows.map((r:Record<string,unknown>)=>r.payload as HsiRelationshipDossier);
  }finally{await sql.close()}
 }};
}
