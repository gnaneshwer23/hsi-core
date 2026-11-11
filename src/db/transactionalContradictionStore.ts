/**
 * P0.2.4 staging-only transactional contradiction ledger.
 * Requires reviewed database RLS, least-privilege role grants and migrations 024/025.
 * No public route; caller must supply a verified session token from a secure cookie.
 * The database must independently enforce tenant access. This module does not bypass RLS.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {prepareContradictionSnapshot,validateIndependentContradictionReview} from "./scientificContradictionLedger";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import type {EvidenceInput} from "../evidence/canonicalEvidenceWorkflow";
type Config={databaseUrl:string;neonProjectId?:string|null;serverSessionToken:string|null|undefined};
const valid=(s:string)=>typeof s==="string"&&s.trim().length>0;
const db=(input:Config)=>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
};
async function actor(input:Config,role:"researcher"|"scientific_reviewer"){
 const a=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,
  databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!a?.authenticated||!a.principalId?.trim()||
  (role==="researcher"?!a.roles.some(r=>r==="researcher"||r==="research_admin"):!a.roles.includes("scientific_reviewer")))
  throw Error("Authenticated "+role+" required");
 return a.principalId;
}
/** Guarded by a mandatory activation flag: no caller can accidentally write by default. */
function requireActivation(input:{stagingActivationApproved?:boolean}){
 if(input.stagingActivationApproved!==true||process.env.HSI_CONTRADICTION_STAGING_ACTIVATED!=="true"||
  process.env.NODE_ENV==="production")
  throw Error("Contradiction persistence is not activated");
}
export async function createContradictionRecord(input:Config&{
 stagingActivationApproved?:boolean;id:string;tenantId:string;left:EvidenceInput;right:EvidenceInput
}){
 requireActivation(input);
 const principal=await actor(input,"researcher");
 const snapshot=prepareContradictionSnapshot({id:input.id,tenantId:input.tenantId,
  submittedBy:principal,left:input.left,right:input.right});
 const sql=db(input);
 try{
  await sql.begin(async tx=>{
   // This membership query is necessary but not sufficient: database RLS must
   // independently enforce tenant scope on every operation.
   const membership=await tx`SELECT 1 FROM hsi_contradiction_tenant_memberships
    WHERE tenant_id=${input.tenantId} AND principal_id=${principal}
    AND member_role='researcher' AND granted_at<=now() AND revoked_at IS NULL`;
   if(membership.length!==1)throw Error("Tenant researcher membership required");
   await tx`INSERT INTO hsi_contradiction_records
    (id,tenant_id,submitted_by,left_edge_id,right_edge_id,schema_version,classification,snapshot,source_evidence_ids)
    VALUES (${snapshot.id},${snapshot.tenantId},${principal},${snapshot.leftEdgeId},
     ${snapshot.rightEdgeId},${snapshot.schemaVersion},${snapshot.classification},
     ${snapshot},${snapshot.sourceEvidenceIds})`;
  });
  return {id:snapshot.id,reviewStatus:"pending" as const};
 }finally{await sql.close();}
}
export async function appendIndependentContradictionReview(input:Config&{
 stagingActivationApproved?:boolean;contradictionId:string;tenantId:string;
 decision:"approved"|"rejected"|"needs_evidence";rationale:string;sourceLocator:string;
 reviewedAt:string;scope:"ssc"|"ra"
}){
 requireActivation(input);
 if(!valid(input.contradictionId)||!valid(input.tenantId))throw Error("Invalid record or tenant");
 const principal=await actor(input,"scientific_reviewer");
 if(!await verifyHsiReviewerAuthority({principal,reviewedAt:input.reviewedAt,
  databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,scope:input.scope}))
  throw Error("Reviewer authority required");
 const sql=db(input);
 try{
  await sql.begin(async tx=>{
   const membership=await tx`SELECT 1 FROM hsi_contradiction_tenant_memberships
    WHERE tenant_id=${input.tenantId} AND principal_id=${principal}
    AND member_role='scientific_reviewer' AND granted_at<=now() AND revoked_at IS NULL`;
   if(membership.length!==1)throw Error("Tenant reviewer membership required");
   const rows=await tx`SELECT submitted_by FROM hsi_contradiction_records
    WHERE id=${input.contradictionId} AND tenant_id=${input.tenantId} FOR UPDATE`;
   if(rows.length!==1)throw Error("Contradiction not found in tenant");
   const submittedBy=String(rows[0]!.submitted_by);
   validateIndependentContradictionReview({submittedBy,reviewerPrincipal:principal,
    decision:input.decision,rationale:input.rationale,sourceLocator:input.sourceLocator});
   await tx`INSERT INTO hsi_contradiction_review_events
    (contradiction_id,tenant_id,submitted_by,reviewer_principal,decision,rationale,source_locator)
    VALUES (${input.contradictionId},${input.tenantId},${submittedBy},${principal},
     ${input.decision},${input.rationale},${input.sourceLocator})`;
  });
  return {recorded:true as const};
 }finally{await sql.close();}
}
