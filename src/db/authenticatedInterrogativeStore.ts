/** ARCH-003 authenticated investigation persistence. Trusted server only.
 * Does not publish, approve or mutate investigation payloads.
 */
import {SQL} from "bun";
import {createHash} from "node:crypto";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../interrogativeContracts";
function canonical(value:unknown):string{
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&typeof value==="object")return "{"+Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}";
 return JSON.stringify(value)??"null";
}
function digest(i:InterrogativeInvestigation){return createHash("sha256").update(canonical(i)).digest("hex")}
function requireActor(actor:Awaited<ReturnType<typeof authenticateHsiNeonSession>>){
 if(!actor?.authenticated||!actor.principalId.trim()||!actor.roles.some(r=>["researcher","scientific_reviewer","research_admin"].includes(r)))throw Error("Verified research access required");
 return actor;
}
export async function saveAuthenticatedInterrogativeInvestigation(input:{
 serverSessionToken:string|null|undefined;investigation:InterrogativeInvestigation;
 databaseUrl:string;neonProjectId?:string|null;
}):Promise<{id:string;contentHash:string;stored:true}>{
 const actor=requireActor(await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId}));
 const i=input.investigation;validateInterrogativeInvestigation(i);
 if(i.actorPrincipal!==actor.principalId||i.state!=="draft"||i.review!==null)throw Error("Only own unreviewed draft can be saved");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const contentHash=digest(i);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  await sql.begin(async tx=>{
   const release=await tx`SELECT id FROM hsi_evidence_graph_releases WHERE id=${i.release.id} AND release_version=${i.release.version} AND manifest_hash=${i.release.manifestHash} AND state='published' FOR SHARE`;
   if(release.length!==1)throw Error("Published release identity not verified");
   const claimIds=[...new Set(i.branches.flatMap(b=>[...b.supporting,...b.opposing].map(e=>e.claimId)))];
   if(claimIds.length){
    const rows=await tx`SELECT claim_id FROM hsi_evidence_release_claims WHERE release_id=${i.release.id}`;
    const permitted=new Set(rows.map((r:{claim_id:unknown})=>String(r.claim_id)));
    if(claimIds.some(id=>!permitted.has(id)))throw Error("Investigation references claims outside release");
   }
   const existing=await tx`SELECT content_hash,actor_principal FROM hsi_interrogative_investigations WHERE id=${i.id} FOR UPDATE`;
   if(existing.length){
    if(String(existing[0]?.content_hash)!==contentHash||String(existing[0]?.actor_principal)!==actor.principalId)throw Error("Immutable investigation conflict");
    return;
   }
   await tx`INSERT INTO hsi_interrogative_investigations (id,schema_version,actor_principal,release_id,release_manifest_hash,data_class,state,payload,content_hash) VALUES (${i.id},${i.schemaVersion},${actor.principalId},${i.release.id},${i.release.manifestHash},${i.dataClass},${i.state},${JSON.stringify(i)}::jsonb,${contentHash})`;
  });
  return {id:i.id,contentHash,stored:true};
 }finally{await sql.close()}
}
export async function loadAuthenticatedInterrogativeInvestigation(input:{
 serverSessionToken:string|null|undefined;investigationId:string;databaseUrl:string;neonProjectId?:string|null;
}):Promise<InterrogativeInvestigation>{
 const actor=requireActor(await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId}));
 if(!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(input.investigationId))throw Error("Invalid investigation ID");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT payload,content_hash,actor_principal FROM hsi_interrogative_investigations WHERE id=${input.investigationId} AND actor_principal=${actor.principalId} LIMIT 1`;
  if(rows.length!==1)throw Error("Investigation not found or access denied");
  const i=rows[0]!.payload as InterrogativeInvestigation;
  validateInterrogativeInvestigation(i);
  if(i.id!==input.investigationId||i.actorPrincipal!==actor.principalId||fingerprintInterrogativeInvestigation(i)!==String(rows[0]!.content_hash))throw Error("Investigation integrity failure");
  return i;
 }finally{await sql.close()}
}
