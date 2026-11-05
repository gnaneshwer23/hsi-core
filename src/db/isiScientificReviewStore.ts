/** P0.4.2 HSI-only trusted scientific review store. Never called from a browser. */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {validateScientificReviewEvent,type ScientificReviewEvent} from "../adapters/isiScientificReviewEvent";
export async function persistIsiScientificReview(input:{event:ScientificReviewEvent;subjectKind:"ontology"|"claim";sessionToken:string|null;databaseUrl:string;neonProjectId?:string|null}):Promise<{stored:true}>{
 const e=validateScientificReviewEvent(input.event);
 if(!input.sessionToken)throw Error("Researcher authentication required");
 if(!assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId}).ok)throw Error("HSI database required");
 const actor=await authenticateHsiNeonSession({sessionToken:input.sessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor||actor.principalId!==e.reviewerPrincipal||!actor.roles.includes("scientific_reviewer"))throw Error("Independent scientific reviewer session required");
 const authorised=await verifyHsiReviewerAuthority({principal:actor.principalId,reviewedAt:new Date().toISOString(),databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!authorised)throw Error("Scientific reviewer authority denied");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  await sql.begin(async tx=>{
   const releases=await tx`SELECT release_hash FROM hsi_isi_intake WHERE release_hash=${e.releaseHash} FOR SHARE`;
   if(releases.length!==1)throw Error("Unknown ISI release");
   await tx`INSERT INTO hsi_isi_review_events (release_hash,subject_id,subject_kind,decision,source_locator,rationale,submitted_by,reviewer_principal) VALUES (${e.releaseHash},${e.subjectId},${input.subjectKind},${e.decision},${e.sourceLocator},${e.rationale},${e.submittedBy},${e.reviewerPrincipal})`;
  });
  return {stored:true};
 }finally{await sql.close()}
}
