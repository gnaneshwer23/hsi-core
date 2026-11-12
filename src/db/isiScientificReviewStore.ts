/** P0.4.2 HSI-only trusted scientific review store. Never called from a browser. */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority,HSI_REVIEWER_SCOPES,type HsiReviewerScope} from "./reviewerAuthority";
import {validateScientificReviewEvent,type ScientificReviewEvent} from "../adapters/isiScientificReviewEvent";
/** Resolver is trusted server wiring, never request JSON. It must verify subject membership
 * and authority scope against the exact immutable release. No resolver is provisioned here.
 */
export type ResolveIsiReviewScope=(releaseHash:string,subjectId:string,subjectKind:"ontology"|"claim")=>Promise<HsiReviewerScope|null>;
export async function persistIsiScientificReview(input:{event:ScientificReviewEvent;subjectKind:"ontology"|"claim";sessionToken:string|null;databaseUrl:string;neonProjectId?:string|null},dependencies?:{resolveReviewScope:ResolveIsiReviewScope}):Promise<{stored:true}>{
 input={...input,event:structuredClone(input.event)};
 const e=validateScientificReviewEvent(structuredClone(input.event));
 const resolveReviewScope=dependencies?.resolveReviewScope;
 if(typeof resolveReviewScope!=="function"||!["ontology","claim"].includes(input.subjectKind))throw Error("Trusted release/subject scope binding required");
 let scope:HsiReviewerScope|null;
 try{scope=await resolveReviewScope(e.releaseHash,e.subjectId,input.subjectKind)}catch{throw Error("Trusted review scope unavailable")}
 if(!scope||!HSI_REVIEWER_SCOPES.includes(scope))throw Error("Trusted release/subject scope binding required");
 if(!input.sessionToken)throw Error("Researcher authentication required");
 if(!assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId}).ok)throw Error("HSI database required");
 const actor=await authenticateHsiNeonSession({sessionToken:input.sessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor||actor.principalId!==e.reviewerPrincipal||!actor.roles.includes("scientific_reviewer"))throw Error("Independent scientific reviewer session required");
 const authorised=await verifyHsiReviewerAuthority({principal:actor.principalId,reviewedAt:new Date().toISOString(),databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,scope});
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
