/** P2 authorization preparation only. No provider, reviewer grant, community launch, clinical or graph activation. */
import {opsHash} from "../operations/pilotOperationsStore";
import {parseTranslationalLandscapeSnapshot,projectTranslationalForOutcome,type TranslationalLandscapeSnapshot} from "../evidence/translationalEvidenceAttach";
const hash=(s:unknown):s is string=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const ref=(s:unknown):s is string=>typeof s==="string"&&/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,255}$/.test(s);
export type ExpansionScope={domain:string;sourcePackRef:string;sourcePackVersion:string;manifestHash:string;scopedReviewerGrantRef:string};
export type ExpansionRequest={pilotReleasePacketHash:string;pilotEvidenceHash:string;pilotFailureLedgerHash:string;
 scopes:ExpansionScope[];trialContextRequested:boolean;communityRequested:boolean;clinicalPhiRequested:false};
export type PilotFailure={id:string;resolutionReceipt:string|null};
export async function prepareControlledExpansion(input:ExpansionRequest,deps:{
 /** Must verify P1-C actual acceptance and complete observed pilot ledger, not a merged PR or submitted checklist. */
 loadAcceptedPilot:(packetHash:string,evidenceHash:string,failureLedgerHash:string)=>Promise<{receiptRef:string;observedFailures:PilotFailure[]}>;
 verifyPilotAndResolutions:(binding:Readonly<{request:ExpansionRequest;pilotReceiptRef:string;observedFailures:PilotFailure[]}>)=>Promise<boolean>;
 /** Current source rights/retraction, domain-specific expertise and active tenant-scoped grants; never infer from SSc or release-owner role. */
 verifyScope:(scope:Readonly<ExpansionScope>)=>Promise<boolean>;
 verifyCommunityOperations?:()=>Promise<boolean>;
}){
 const request=structuredClone(input);
 if(![request.pilotReleasePacketHash,request.pilotEvidenceHash,request.pilotFailureLedgerHash].every(hash)||!Array.isArray(request.scopes)||!request.scopes.length||request.scopes.length>30||new Set(request.scopes.map(s=>s.domain)).size!==request.scopes.length||request.scopes.some(s=>![s.domain,s.sourcePackRef,s.sourcePackVersion,s.scopedReviewerGrantRef].every(ref)||!hash(s.manifestHash)||Object.keys(s).sort().join()!=="domain,manifestHash,scopedReviewerGrantRef,sourcePackRef,sourcePackVersion")||typeof request.trialContextRequested!=="boolean"||typeof request.communityRequested!=="boolean"||request.clinicalPhiRequested!==false||Object.keys(request).sort().join()!==["pilotReleasePacketHash","pilotEvidenceHash","pilotFailureLedgerHash","scopes","trialContextRequested","communityRequested","clinicalPhiRequested"].sort().join())throw Error("Bounded research-only expansion request required");
 const pilot=structuredClone(await deps.loadAcceptedPilot(request.pilotReleasePacketHash,request.pilotEvidenceHash,request.pilotFailureLedgerHash));
 if(!ref(pilot.receiptRef)||!Array.isArray(pilot.observedFailures)||new Set(pilot.observedFailures.map(f=>f.id)).size!==pilot.observedFailures.length||pilot.observedFailures.some(f=>!ref(f.id)||!ref(f.resolutionReceipt)))throw Error("Every observed pilot failure must have a verified resolution");
 if(await deps.verifyPilotAndResolutions({request:structuredClone(request),pilotReceiptRef:pilot.receiptRef,observedFailures:structuredClone(pilot.observedFailures)})!==true)throw Error("P1-C actual acceptance and resolved pilot failures required");
 for(const scope of request.scopes)if(await deps.verifyScope(structuredClone(scope))!==true)throw Error("Current source pack and independent disease/tenant-scoped authority required");
 if(request.communityRequested&&(!deps.verifyCommunityOperations||await deps.verifyCommunityOperations()!==true))throw Error("Actual moderation delivery, response coverage and ownership required");
 const body={schemaVersion:"hsi-p2-expansion-candidate-1",request,pilotReceiptRef:pilot.receiptRef,agentCountIncrease:0,plannerEnabled:false,planningMode:"deterministic_falsification_fields",trialEligibilityAssessed:false,clinicalPhiEnabled:false,communityLaunched:false,productionPromotionPerformed:false,scientificApproval:false,graphPromotable:false};
 return {...body,candidateHash:opsHash(body)};
}
/** Reuses O-04; a signed expansion candidate does not convert registry presence into efficacy or eligibility. */
export async function prepareGovernedTrialContext(input:{investigationId:string;sourceReleaseRef:string;candidateHash:string;snapshot:TranslationalLandscapeSnapshot},verify:(binding:Readonly<{investigationId:string;sourceReleaseRef:string;candidateHash:string;snapshotHash:string}>)=>Promise<boolean>){
 const captured=structuredClone(input),snapshot=parseTranslationalLandscapeSnapshot(captured.snapshot),snapshotHash=opsHash(snapshot);
 if(!ref(captured.investigationId)||!ref(captured.sourceReleaseRef)||!hash(captured.candidateHash)||await verify({investigationId:captured.investigationId,sourceReleaseRef:captured.sourceReleaseRef,candidateHash:captured.candidateHash,snapshotHash})!==true)throw Error("Governed same-investigation/source-release trial context authority required");
 return {investigationId:captured.investigationId,sourceReleaseRef:captured.sourceReleaseRef,snapshotHash,section:projectTranslationalForOutcome(snapshot),eligibilityAssessed:false,clinicalAdvice:false,graphPromotable:false};
}
