/** HSI-only delivery transactions; no migrations, grants, clinical writes or publication. */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {loadOrCaptureInvestigationGraphContext} from "./investigationGraphContextStore";
import {createInvestigationDeliveryService,deliveryHash,type DeliveryState} from "../server/investigationDeliveryService";
import {canonicalInvestigationRecord,type ReviewPackage,type DeliveryDecision,type DeliverySubmission,type RevisionLink} from "../investigationDelivery";
import {canonicalGraphContext} from "../investigationGraphContext";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../interrogativeValidation";
export type DeliveryConfig={databaseUrl:string;neonProjectId?:string|null;writesEnabled?:boolean;sscReleaseId?:string;raComparisonReleaseId?:string};
export async function withInvestigationDelivery<T>(config:DeliveryConfig,write:boolean,run:(service:ReturnType<typeof createInvestigationDeliveryService>)=>Promise<T>):Promise<T>{
 const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});if(!guard.ok)throw Error("HSI database required");
 if(write&&(!config.writesEnabled||new URL(config.databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/,"")!==HSI_STAGING_HOST_PREFIX))throw Error("Approved staging writes required");
 let sql:SQL|null=null;const db=()=>sql??=new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 const recordHash=(value:unknown)=>deliveryHash(canonicalInvestigationRecord(value));
 const stateOf=(row:Record<string,unknown>)=>{const i=row.payload as InterrogativeInvestigation;validateInterrogativeInvestigation(i);if(recordHash(i)!==String(row.content_hash)||i.state!==row.state||i.actorPrincipal!==row.actor_principal)throw Error("Investigation integrity failure");return i};
 const service=createInvestigationDeliveryService({writesEnabled:config.writesEnabled===true,
  authenticate:token=>authenticateHsiNeonSession({...config,sessionToken:token}),
  reviewer:principal=>verifyHsiReviewerAuthority({...config,principal,reviewedAt:new Date().toISOString(),scope:"ssc"}),
  load:async(actor,id):Promise<DeliveryState>=>{
   if(!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(id))throw Error("Invalid investigation ID");
   const s=db();const records=await s`SELECT payload,content_hash,state,actor_principal FROM hsi_interrogative_investigations WHERE id=${id} LIMIT 1`;if(records.length!==1)throw Error("Record unavailable");
   const record=stateOf(records[0]!);
   if(record.actorPrincipal!==actor.principalId&&(!actor.roles.includes("scientific_reviewer")||!await verifyHsiReviewerAuthority({...config,principal:actor.principalId,reviewedAt:new Date().toISOString(),scope:"ssc"})))throw Error("Delivery access denied");
   const submissions=await s`SELECT submission_id,package_hash,submitted_by,submitted_at,package_payload FROM hsi_review_submissions WHERE investigation_id=${id} LIMIT 1`;
   const decisions=await s`SELECT decision_payload,decision_hash FROM hsi_review_decisions_v2 WHERE investigation_id=${id} LIMIT 1`;
   const revisions=await s`SELECT parent_id,root_id,revision_number,parent_decision_id,reason FROM hsi_investigation_revision_links WHERE investigation_id=${id} LIMIT 1`;
   const next=await s`SELECT investigation_id,revision_number FROM hsi_investigation_revision_links WHERE parent_id=${id} LIMIT 1`;
   const legacy=await s`SELECT 1 FROM hsi_interrogative_review_decisions WHERE investigation_id=${id} LIMIT 1`;
   const sub=submissions[0],r=revisions[0],decision=decisions[0]?.decision_payload as DeliveryDecision|undefined;
   if(decision&&(decision.decisionHash!==String(decisions[0]!.decision_hash)||deliveryHash(canonicalGraphContext(Object.fromEntries(Object.entries(decision).filter(([k])=>k!=="decisionHash"))))!==decision.decisionHash))throw Error("Decision integrity failure");
   return {record,package:sub?.package_payload as ReviewPackage??null,submission:sub?{id:String(sub.submission_id),packageHash:String(sub.package_hash),submittedBy:String(sub.submitted_by),submittedAt:new Date(String(sub.submitted_at)).toISOString()}:null,decision:decision??null,
    revision:r?{parentId:String(r.parent_id),rootId:String(r.root_id),number:Number(r.revision_number),decisionId:String(r.parent_decision_id),reason:String(r.reason)}:null,successor:next[0]?{id:String(next[0].investigation_id),number:Number(next[0].revision_number)}:null,legacyDecision:legacy.length>0};
  },
  context:async(token,id)=>{const result=await loadOrCaptureInvestigationGraphContext({...config,serverSessionToken:token,investigationId:id,capture:false});return result.context},
  submit:async(actor,state,p,submission)=>db().begin(async tx=>{
   const rows=await tx`SELECT payload,content_hash,state,actor_principal FROM hsi_interrogative_investigations WHERE id=${state.record.id} AND actor_principal=${actor.principalId} FOR UPDATE`;if(rows.length!==1)throw Error("Owned record required");
   const prior=await tx`SELECT package_hash FROM hsi_review_submissions WHERE investigation_id=${state.record.id} LIMIT 1`;if(prior.length){if(prior[0]!.package_hash!==p.packageHash)throw Error("Submission conflict");return}
   const current=stateOf(rows[0]!);if(current.state!=="draft"||recordHash(current)!==recordHash(state.record))throw Error("Stale investigation");
   const grant=await tx`SELECT 1 FROM hsi_research_access WHERE principal_id=${actor.principalId} AND access_role IN ('researcher','research_admin') AND revoked_at IS NULL AND granted_at<=now() FOR SHARE`;if(!grant.length)throw Error("Active researcher grant required");
   const context=await tx`SELECT content_hash FROM hsi_investigation_graph_contexts WHERE investigation_id=${current.id} AND content_hash=${p.context.contentHash} FOR SHARE`;if(context.length!==1)throw Error("Context mismatch");
   // Bun SQL JSON-encodes objects; JSON.stringify would store a jsonb string scalar.
   await tx`INSERT INTO hsi_review_submissions (submission_id,investigation_id,submitted_by,submitted_at,package_hash,investigation_hash,context_hash,package_payload) VALUES (${submission.id},${current.id},${actor.principalId},${submission.submittedAt}::timestamptz,${p.packageHash},${p.investigationHash},${p.context.contentHash},${p})`;
   await tx`UPDATE hsi_interrogative_investigations SET state='awaiting_scientific_review',payload=${p.investigation},content_hash=${p.investigationHash} WHERE id=${current.id}`;
  }),
  decide:async(actor,state,d)=>db().begin(async tx=>{
   const rows=await tx`SELECT payload,content_hash,state,actor_principal FROM hsi_interrogative_investigations WHERE id=${state.record.id} FOR UPDATE`;if(rows.length!==1)throw Error("Record unavailable");
   const prior=await tx`SELECT decision_payload FROM hsi_review_decisions_v2 WHERE submission_id=${d.submissionId} LIMIT 1`;if(prior[0]){const old=prior[0].decision_payload as DeliveryDecision;if(old.reviewerPrincipal===actor.principalId&&old.requestHash===d.requestHash)return old;throw Error("Decision already recorded")}
   const current=stateOf(rows[0]!);if(current.actorPrincipal===actor.principalId||current.state!=="awaiting_scientific_review"||recordHash(current)!==state.package?.investigationHash)throw Error("Independent review of current submission required");
   const authority=await tx`SELECT a.principal_id FROM hsi_reviewer_authority a JOIN neon_auth."user" u ON u.id::text=a.principal_id WHERE a.principal_id=${actor.principalId} AND a.scope='ssc' AND a.reviewer_role='scientific_reviewer' AND a.revoked_at IS NULL AND a.granted_at<=now() AND u."emailVerified"=true AND COALESCE(u.banned,false)=false FOR SHARE OF a,u`;if(!authority.length)throw Error("Current reviewer authority required");
   const sub=await tx`SELECT submission_id FROM hsi_review_submissions WHERE submission_id=${d.submissionId} AND investigation_id=${current.id} AND package_hash=${d.packageHash} AND context_hash=${d.contextHash} AND submitted_by<>${actor.principalId} FOR SHARE`;if(sub.length!==1)throw Error("Submitted package mismatch");
   await tx`INSERT INTO hsi_review_decisions_v2 (decision_id,submission_id,investigation_id,reviewer_principal,outcome,reviewed_at,decision_hash,decision_payload) VALUES (${d.id},${d.submissionId},${current.id},${actor.principalId},${d.outcome},${d.reviewedAt}::timestamptz,${d.decisionHash},${d})`;
   const next:InterrogativeInvestigation={...current,state:d.outcome==="approve_with_limitations"?"reviewed":d.outcome==="reject"?"rejected":"draft",review:d.outcome==="approve_with_limitations"?{reviewerPrincipal:d.reviewerPrincipal,reviewDecisionId:d.id,reviewedAt:d.reviewedAt}:null};validateInterrogativeInvestigation(next);
   await tx`UPDATE hsi_interrogative_investigations SET state=${next.state},payload=${next},content_hash=${recordHash(next)} WHERE id=${current.id}`;return d;
  }),
  revise:async(actor,state,child,requestId,inputHash,link)=>db().begin(async tx=>{
   const locked=await tx`SELECT payload,content_hash,state,actor_principal FROM hsi_interrogative_investigations WHERE id=${state.record.id} AND actor_principal=${actor.principalId} AND state='draft' FOR UPDATE`;if(!locked.length||recordHash(stateOf(locked[0]!))!==recordHash(state.record))throw Error("Owned unchanged revision-requested parent required");
   const existing=await tx`SELECT investigation_id,request_id,input_hash FROM hsi_investigation_revision_links WHERE parent_id=${state.record.id} LIMIT 1`;if(existing[0]){if(existing[0].request_id===requestId&&existing[0].input_hash===inputHash)return {id:String(existing[0].investigation_id)};throw Error("A revision already exists")}
   const decision=await tx`SELECT decision_id FROM hsi_review_decisions_v2 WHERE decision_id=${link.decisionId} AND investigation_id=${state.record.id} AND outcome='request_revision' FOR SHARE`;if(!decision.length)throw Error("Revision decision mismatch");
   const grant=await tx`SELECT 1 FROM hsi_research_access WHERE principal_id=${actor.principalId} AND access_role IN ('researcher','research_admin') AND revoked_at IS NULL AND granted_at<=now() FOR SHARE`;if(!grant.length)throw Error("Researcher grant required");
   const release=await tx`SELECT id FROM hsi_evidence_graph_releases WHERE id=${child.release.id} AND release_version=${child.release.version} AND manifest_hash=${child.release.manifestHash} AND state='published' FOR SHARE`;if(!release.length)throw Error("Published release unavailable");
   validateInterrogativeInvestigation(child);
   await tx`INSERT INTO hsi_interrogative_investigations (id,schema_version,actor_principal,release_id,release_manifest_hash,data_class,state,payload,content_hash) VALUES (${child.id},${child.schemaVersion},${actor.principalId},${child.release.id},${child.release.manifestHash},${child.dataClass},'draft',${child},${recordHash(child)})`;
   await tx`INSERT INTO hsi_investigation_revision_links (investigation_id,parent_id,root_id,revision_number,parent_decision_id,author_principal,request_id,input_hash,reason,created_at) VALUES (${child.id},${link.parentId},${link.rootId},${link.number},${link.decisionId},${actor.principalId},${requestId},${inputHash},${link.reason},${child.createdAt}::timestamptz)`;return {id:child.id};
  })
 });
 try{return await run(service)}finally{if(sql)await (sql as SQL).close()}
}
