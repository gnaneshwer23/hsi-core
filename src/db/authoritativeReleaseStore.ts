/** HSI-only, server-side published release loader.
 * Fail closed until a release has a verifiable manifest and current scientific approval.
 * Identity must be verified by the calling server; this is not an HTTP endpoint.
 */
import {SQL} from "bun";
import {createHash} from "node:crypto";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {PublishedReleaseSnapshot,ReleaseClaim,SourceEvidence,ReviewDecisionSnapshot} from "../graphRelease";
import type {TrustedResearchActor} from "./researchInvestigationStore";

export async function loadHsiPublishedRelease(input:{
 actor:TrustedResearchActor|null;version:string;databaseUrl:string;neonProjectId?:string|null;
}):Promise<PublishedReleaseSnapshot>{
 if(!input.actor?.authenticated||!input.actor.principalId.trim()||
 !input.actor.roles.some(r=>["researcher","scientific_reviewer","research_admin"].includes(r)))
 throw Error("Verified researcher role required");
 if(!/^\d+\.\d+\.\d+$/.test(input.version))throw Error("Invalid release version");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  return await sql.begin(async tx=>{
   const releases=await tx`SELECT id,release_version,manifest_hash,created_at
    FROM hsi_evidence_graph_releases WHERE release_version=${input.version} AND state='published' FOR SHARE`;
   if(releases.length!==1)throw Error("Published HSI release not found");
   const release=releases[0]!;
   const links=await tx`SELECT rc.claim_id,rc.review_decision_id
    FROM hsi_evidence_release_claims rc WHERE rc.release_id=${String(release.id)} ORDER BY rc.claim_id`;
   if(!links.length)throw Error("Published release has no claims");
   const ids=links.map((r:{claim_id:unknown})=>String(r.claim_id));
   if(new Set(ids).size!==ids.length)throw Error("Duplicate release claims");
   const generatedAt=new Date(String(release.created_at)).toISOString();
   const expected=createHash("sha256").update(JSON.stringify({
    schemaVersion:"hsi-graph-release-1",releaseId:String(release.id),
    releaseVersion:input.version,claimIds:ids,generatedAt,
   })).digest("hex");
   if(expected!==String(release.manifest_hash))
    throw Error("Published release manifest integrity cannot be verified");
   const claims:ReleaseClaim[]=[];
   for(const link of links){
    const claimId=String(link.claim_id);
    const records=await tx`SELECT * FROM hsi_evidence_claim_drafts WHERE id=${claimId}`;
    if(records.length!==1||String(records[0]?.status)!=="approved")
     throw Error("Published claim is missing or not approved");
    const c=records[0]!;
    const supports=await tx`SELECT s.id,s.licence_status,s.retraction_status,s.metadata,cs.polarity
     FROM hsi_evidence_claim_support cs JOIN hsi_evidence_sources s ON s.id=cs.source_id
     WHERE cs.claim_id=${claimId}`;
    if(!supports.length||supports.some((s:{licence_status:unknown;retraction_status:unknown;polarity:unknown})=>
      ["unverified","prohibited"].includes(String(s.licence_status))||
      String(s.retraction_status)!=="none_reported"||String(s.polarity)==="contradicts"))
      throw Error("Source rights, corrections or contradiction unresolved");
    const decisions=await tx`SELECT id,claim_id,decision,reviewer_principal,reviewer_role,reviewed_at,
     evidence_reviewed,conflict_of_interest_declared
     FROM hsi_evidence_review_decisions WHERE claim_id=${claimId}
     ORDER BY reviewed_at DESC,id DESC`;
    const latest=decisions[0];
    if(!latest||String(latest.id)!==String(link.review_decision_id)||
      String(latest.decision)!=="approve"||String(latest.reviewer_role)!=="scientific_reviewer"||
      latest.conflict_of_interest_declared!==true||
      !Array.isArray(latest.evidence_reviewed)||!latest.evidence_reviewed.length)
      throw Error("Current accountable scientific approval not verified");
    // Reviewer role in a database row is insufficient proof of authenticated reviewer authority.
    // Until reviewer identity is checked against a trusted identity registry, refuse retrieval.
    throw Error("P0 blocker: reviewer identity authority registry not connected");
   }
   return {manifest:{schemaVersion:"hsi-graph-release-1",releaseId:String(release.id),
    releaseVersion:input.version,generatedAt,claimIds:ids,
    manifestHash:String(release.manifest_hash),status:"published"},claims};
  });
 }finally{await sql.close();}
}
