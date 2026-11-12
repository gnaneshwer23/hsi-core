/** Proposed operations objectives plus purpose-bound, independently signed release authorization.
 * An operator JSON checklist never constitutes authority. No deployment or invitation side effects.
 */
import {verify,type KeyObject} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {opsHash} from "./pilotOperationsStore";
export const PILOT_OPERATING_OBJECTIVES={version:"hsi-pilot-objectives-proposed-1",soakDays:14,authorizedSuccessRate:0.995,p95ReadMs:2000,p95AcceptedJobAckMs:1000,rpoMs:86400000,rtoMs:14400000,status:"proposed_requires_named_owner_approval"} as const;
export type PilotSoakWindow={startedAt:number;endedAt:number;authorizedRequests:number;successfulAuthorizedRequests:number;correctlyDeniedRequests:number;unknownClassification:number;authorizedReadRequests:number;acceptedJobRequests:number;readLatencyMs:number[];acceptedJobAckMs:number[];acceptedInvestigations:number;completedInvestigations:number;reviewCorrections:number;usefulnessRatings:number[];evidenceHash:string};
const integer=(n:number)=>Number.isSafeInteger(n)&&n>=0;
const percentile=(a:number[],p:number)=>a.length?[...a].sort((x,y)=>x-y)[Math.ceil(p*a.length)-1]!:null;
export async function assessPilotSoak(windowsInput:readonly PilotSoakWindow[],loadScenarioHash:string,verifyWindow:(w:Readonly<PilotSoakWindow>,loadScenarioHash:string)=>Promise<boolean>){
 const windows=[...structuredClone(windowsInput)].sort((a,b)=>a.startedAt-b.startedAt),blockers:string[]=[];
 if(!/^[a-f0-9]{64}$/.test(loadScenarioHash))throw Error("Documented load scenario required");
 for(let n=0;n<windows.length;n++){const w=windows[n]!;if(![w.startedAt,w.endedAt,w.authorizedRequests,w.successfulAuthorizedRequests,w.correctlyDeniedRequests,w.unknownClassification,w.authorizedReadRequests,w.acceptedJobRequests,w.acceptedInvestigations,w.completedInvestigations,w.reviewCorrections].every(integer)||w.endedAt-w.startedAt!==3600000||w.successfulAuthorizedRequests>w.authorizedRequests||![w.readLatencyMs,w.acceptedJobAckMs].every(a=>Array.isArray(a)&&a.every(v=>Number.isFinite(v)&&v>=0))||w.readLatencyMs.length!==w.authorizedReadRequests||w.acceptedJobAckMs.length!==w.acceptedJobRequests||w.authorizedReadRequests+w.acceptedJobRequests>w.authorizedRequests||!Array.isArray(w.usefulnessRatings)||w.usefulnessRatings.some(v=>!Number.isInteger(v)||v<0||v>5)||!/^[a-f0-9]{64}$/.test(w.evidenceHash))throw Error("Invalid soak counters or denominator");
  if(n&&windows[n-1]!.endedAt!==w.startedAt)blockers.push("Missing or overlapping hourly coverage");
  if(!w.authorizedRequests||!w.readLatencyMs.length||!w.acceptedJobAckMs.length)blockers.push("Documented hourly load not demonstrated");
  if(w.unknownClassification)blockers.push("Unclassified requests cannot be excluded as correct denials");
  if(await verifyWindow(structuredClone(w),loadScenarioHash)!==true)throw Error("Trusted telemetry/denial/load evidence required");
 }
 if(windows.length!==14*24)blockers.push("Complete 14-day hourly soak required");
 const total=(k:"authorizedRequests"|"successfulAuthorizedRequests"|"correctlyDeniedRequests"|"acceptedInvestigations"|"completedInvestigations"|"reviewCorrections")=>windows.reduce((n,w)=>n+w[k],0),denominator=total("authorizedRequests"),successRate=denominator?total("successfulAuthorizedRequests")/denominator:null,p95ReadMs=percentile(windows.flatMap(w=>w.readLatencyMs),0.95),p95AckMs=percentile(windows.flatMap(w=>w.acceptedJobAckMs),0.95);
 if(successRate===null||successRate<0.995)blockers.push("Authorized request success objective unmet");if(p95ReadMs===null||p95ReadMs>=2000)blockers.push("p95 authorized read objective unmet");if(p95AckMs===null||p95AckMs>=1000)blockers.push("p95 accepted-job acknowledgement objective unmet");
 const accepted=total("acceptedInvestigations"),completed=total("completedInvestigations"),ratings=windows.flatMap(w=>w.usefulnessRatings);
 if(completed>accepted)blockers.push("Investigation completion cohort exceeds accepted cohort");
 const body={schemaVersion:"hsi-pilot-soak-assessment-1",loadScenarioHash,objectiveHash:opsHash(PILOT_OPERATING_OBJECTIVES),windows:windows.map(w=>w.evidenceHash),authorizedRequests:denominator,successfulAuthorizedRequests:total("successfulAuthorizedRequests"),correctlyDeniedRequests:total("correctlyDeniedRequests"),successRate,p95ReadMs,p95AckMs,investigations:{accepted,completed,completionRate:accepted?completed/accepted:null,reviewCorrections:total("reviewCorrections"),usefulnessRatings:ratings.length,usefulnessMean:ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:null},engineeringObjectivesMet:blockers.length===0,blockers:[...new Set(blockers)],pilotAuthorized:false,scientificApproval:false};return {...body,evidenceHash:opsHash(body)};
}
export const PILOT_RELEASE_GATES=["p0_a","p0_b","p0_c","p1_a","p1_b","soak_14_days","shared_limiter_outage","provider_source_outage_restart","no_duplicate_decisions_or_unreconciled_charges","oncall_delivery_and_acknowledgement","backup_restore_rpo_rto","rollback_last_accepted_artifact_config","rapid_write_provider_kill_switch","tenant_isolation_and_invitation_scope","human_review_material_briefs_and_graph_promotions","pilot_terms_and_feedback_plan"] as const;
export type PilotReleasePacket={schemaVersion:"hsi-pilot-release-1";id:string;artifactSha:string;artifactDigest:string;configurationHash:string;quotaPolicyHash:string;invitationCohortHash:string;issuedAt:string;expiresAt:string;
 objectivesHash:string;gates:Record<(typeof PILOT_RELEASE_GATES)[number],string>;humanReviewEveryMaterialBrief:true;humanReviewEveryGraphPromotion:true;clinicalUse:false;
 signatures:{role:"security"|"scientific"|"operations";ownerRef:string;keyId:string;signature:string}[]};
export function pilotReleaseSigningText(packet:PilotReleasePacket){const {signatures:_,...body}=packet;return "HSI-PILOT-RELEASE-1\n"+canonicalEvidenceJson(body)}
export async function verifyPilotReleasePacket(input:PilotReleasePacket,policy:{
 artifactSha:string;artifactDigest:string;configurationHash:string;quotaPolicyHash:string;invitationCohortHash:string;
 owners:readonly {role:"security"|"scientific"|"operations";ownerRef:string;keyId:string;publicKey:KeyObject}[];
 verifyEvidence:(gate:(typeof PILOT_RELEASE_GATES)[number],evidenceHash:string,artifactSha:string)=>Promise<boolean>;
 now?:()=>number;
}){
 const packet=structuredClone(input),owners=policy.owners.map(o=>({...o})),{verifyEvidence}=policy,now=policy.now??Date.now;
 if(!packet||Object.keys(packet).sort().join()!==["schemaVersion","id","artifactSha","artifactDigest","configurationHash","quotaPolicyHash","invitationCohortHash","issuedAt","expiresAt","objectivesHash","gates","humanReviewEveryMaterialBrief","humanReviewEveryGraphPromotion","clinicalUse","signatures"].sort().join()||packet.schemaVersion!=="hsi-pilot-release-1"||!/^release-[A-Za-z0-9_.-]{1,100}$/.test(packet.id)||![packet.artifactDigest,packet.configurationHash,packet.quotaPolicyHash,packet.invitationCohortHash,packet.objectivesHash].every(h=>/^[a-f0-9]{64}$/.test(h))||!/^[a-f0-9]{40}$/.test(packet.artifactSha)||packet.objectivesHash!==opsHash(PILOT_OPERATING_OBJECTIVES)||packet.humanReviewEveryMaterialBrief!==true||packet.humanReviewEveryGraphPromotion!==true||packet.clinicalUse!==false||["artifactSha","artifactDigest","configurationHash","quotaPolicyHash","invitationCohortHash"].some(k=>packet[k as keyof typeof packet]!==policy[k as "artifactSha"])||!packet.gates||Object.keys(packet.gates).sort().join()!==[...PILOT_RELEASE_GATES].sort().join()||Object.values(packet.gates).some(h=>!/^[a-f0-9]{64}$/.test(h)))throw Error("Exact tested artifact/config/scope and complete release packet required");
 const issued=Date.parse(packet.issuedAt),expires=Date.parse(packet.expiresAt),at=now();if(!Number.isFinite(at)||!Number.isFinite(issued)||!Number.isFinite(expires)||issued>at||expires<=at||expires-issued>86400000||expires<=issued)throw Error("Release authority expired or not current");
 if(!Array.isArray(packet.signatures)||packet.signatures.length!==3||new Set(packet.signatures.map(s=>s.role)).size!==3||packet.signatures.some(s=>!["security","scientific","operations"].includes(s.role)||Object.keys(s).sort().join()!=="keyId,ownerRef,role,signature")||new Set(packet.signatures.map(s=>s.ownerRef)).size!==3||owners.length!==3||new Set(owners.map(o=>o.role)).size!==3||owners.some(o=>!["security","scientific","operations"].includes(o.role))||new Set(owners.map(o=>o.ownerRef)).size!==3||new Set(owners.map(o=>o.publicKey.export({type:"spki",format:"der"}).toString("hex"))).size!==3)throw Error("Three independent named release owners required");
 for(const s of packet.signatures){const owner=owners.find(o=>o.role===s.role&&o.ownerRef===s.ownerRef&&o.keyId===s.keyId);if(!owner||owner.publicKey.type!=="public"||owner.publicKey.asymmetricKeyType!=="ed25519"||!/^[A-Za-z0-9_-]{86}$/.test(s.signature)||!verify(null,Buffer.from(pilotReleaseSigningText(packet)),owner.publicKey,Buffer.from(s.signature,"base64url")))throw Error("Release signature invalid")}
 for(const gate of PILOT_RELEASE_GATES)if(await verifyEvidence(gate,packet.gates[gate],packet.artifactSha)!==true)throw Error("Live release evidence not independently verified: "+gate);
 const after=now();if(after>=expires||after<issued)throw Error("Release expired during verification");
 return {packetHash:opsHash(packet),pilotScopeAuthorized:true,artifactSha:packet.artifactSha,artifactDigest:packet.artifactDigest,expiresAt:packet.expiresAt,scientificApproval:false,graphPromotionApproved:false};
}
/** Clear separation: readiness is authenticated and tests dependencies; liveness never claims DB/provider readiness. */
export function createPilotHealth(deps:{configuration:()=>boolean;authenticate:(request:Request)=>Promise<boolean>;databaseReady:()=>Promise<boolean>;operationsReady:()=>boolean}){return async(request:Request)=>{
 const path=new URL(request.url).pathname;if(request.method!=="GET")return Response.json({code:"METHOD_NOT_ALLOWED"},{status:405});
 if(path==="/api/research/live")return Response.json({live:true,databaseTested:false,providerTested:false},{headers:{"Cache-Control":"no-store"}});
 if(path==="/api/research/configuration")return Response.json({configured:deps.configuration(),databaseTested:false},{status:deps.configuration()?200:503,headers:{"Cache-Control":"no-store"}});
 if(path!=="/api/research/ready")return Response.json({code:"NOT_FOUND"},{status:404});
 if(await deps.authenticate(request)!==true)return Response.json({code:"AUTHENTICATION_REQUIRED"},{status:401});let ready=false,databaseConnectionTested=false;try{if(deps.configuration()&&deps.operationsReady()){databaseConnectionTested=true;ready=await deps.databaseReady()===true}}catch{/* no database error details */}
 return Response.json({ready,databaseConnectionTested,providerTested:false},{status:ready?200:503,headers:{"Cache-Control":"no-store"}});
}}
export async function deliverPilotAlerts(store:import("./pilotOperationsStore").PilotOperationsStore,deliver:(notice:Readonly<{id:string;kind:string;evidenceHash:string}>)=>Promise<{deliveryReceipt:string;acknowledgementReceipt:string|null}>,verifyDelivery:(binding:Readonly<{alertId:string;deliveryReceipt:string;acknowledgementReceipt:string|null}>)=>Promise<boolean>){
 for(const alert of store.alerts().filter(a=>!a.acknowledgement_receipt)){const receipt=await deliver({id:alert.id,kind:alert.kind,evidenceHash:alert.evidence_hash});if(await verifyDelivery({alertId:alert.id,...receipt})!==true)throw Error("Independent on-call delivery evidence required");store.alertReceipt(alert.id,receipt.deliveryReceipt,receipt.acknowledgementReceipt)}
 return {unacknowledged:store.alerts().filter(a=>!a.acknowledgement_receipt).length};
}
