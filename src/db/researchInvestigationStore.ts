/** P1 persistence of deterministic investigation records; trusted backend only.
 * This service cannot authenticate a caller, authorise a graph release or approve a claim.
 */
import {createHash,randomUUID} from "node:crypto";
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {ResearchInvestigation} from "../researchWorkbench";
export type TrustedResearchActor={principalId:string;authenticated:true;roles:readonly string[]};
export async function persistResearchInvestigation(input:{
 actor:TrustedResearchActor|null;investigation:ResearchInvestigation;
 runId?:string;
 dataClass:"public_biomedical"|"licensed_partner";
 databaseUrl:string;neonProjectId?:string|null;
}):Promise<{id:string;stored:true}>{
 const {actor,investigation:run}=input;
 // Distinct persisted execution identity; the deterministic investigation ID remains a content fingerprint.
 const executionId=input.runId??`hsi-run-${randomUUID()}`;
 if(!/^hsi-run-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(executionId))throw Error("Invalid execution ID");
 if(!actor?.authenticated||!actor.principalId.trim()||
 !actor.roles.some(r=>r==="researcher"||r==="scientific_reviewer"||r==="research_admin"))
 throw Error("Authenticated research role required");
 if(!/^hsi-investigation-[a-f0-9]{24}$/.test(run.id)||!run.question.trim()||run.question.length>500||
 run.mode!=="deterministic_release_analysis"||!run.release.id||
 !/^[a-f0-9]{64}$/.test(run.release.manifestHash)||run.hypotheses.length)
 throw Error("Invalid or unreviewed investigation");
 if(run.evidence.some(e=>!e.reviewDecisionId||e.sources.length===0))
 throw Error("Evidence must include review and source provenance");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const body=JSON.stringify(run);
 const digest=createHash("sha256").update(body).digest("hex");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  await sql.begin(async tx=>{
   const releases=await tx`SELECT id,manifest_hash FROM hsi_evidence_graph_releases
    WHERE id=${run.release.id} AND release_version=${run.release.version}
    AND state='published' FOR SHARE`;
   if(releases.length!==1||String(releases[0]?.manifest_hash)!==run.release.manifestHash)
    throw Error("Investigation release is not a published HSI release");
   const ids=run.evidence.map(e=>e.claimId);
   const allowed=await tx`SELECT rc.claim_id FROM hsi_evidence_release_claims rc
    JOIN hsi_evidence_claim_drafts c ON c.id=rc.claim_id
    WHERE rc.release_id=${run.release.id} AND c.status='approved'`;
   const approved=new Set(allowed.map((r:{claim_id:unknown})=>String(r.claim_id)));
   if(ids.some(id=>!approved.has(id)))throw Error("Investigation references unpublished or unapproved claims");
   const existing=await tx`SELECT content_hash,actor_principal FROM hsi_research_investigation_runs
    WHERE id=${executionId}`;
   if(existing.length){
    if(String(existing[0]?.content_hash)!==digest||String(existing[0]?.actor_principal)!==actor.principalId)
      throw Error("Investigation ID collision or changed content");
    return;
   }
   await tx`INSERT INTO hsi_research_investigation_runs
    (id,actor_principal,release_id,release_manifest_hash,question,status,mode,data_class,source_claim_ids,investigation,content_hash)
    VALUES (${executionId},${actor.principalId},${run.release.id},${run.release.manifestHash},
    ${run.question},${run.status},${run.mode},${input.dataClass},
    ${JSON.stringify(ids)}::jsonb,${body}::jsonb,${digest})`;
  });
  return {id:executionId,stored:true};
 }finally{await sql.close();}
}
