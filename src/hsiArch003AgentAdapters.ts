/** ARCH-009 adapter boundary for existing deterministic ARCH-003 capabilities.
 * Adapters require caller-owned output storage; they do not call LLMs or publish evidence.
 */
import {planSscInterrogation,type QuestionPlanInput} from "./interrogativeQuestionEngine";
import {evaluateSscFalsification} from "./interrogativeFalsificationEngine";
import {
  interrogatePublishedSscEvidence,
  type BranchGraphBinding,
} from "./interrogativeEvidenceEngine";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";
import type {PublishedReleaseSnapshot} from "./graphRelease";
import type {HsiAgentExecutor,HsiAgentStepResult} from "./hsiAgentOrchestrator";
import {
  projectGapVerificationForOutcome,
  type GapVerificationInput,
  type GapVerificationOutcomeSection,
} from "./evidence/gapVerification";
import {
  emptyHypothesisRegistry,
  proposeHypothesis,
  type HypothesisRegistry,
} from "./evidence/hypothesisRegistry";
import {HSI_CDS_PHI_INVARIANTS} from "./cdsPhiBoundary";
export interface HsiInvestigationArtifactSink{
 saveDraft(investigation:InterrogativeInvestigation):Promise<string>;
 loadDraft(ref:string):Promise<InterrogativeInvestigation>;
 saveFalsification(report:ReturnType<typeof evaluateSscFalsification>):Promise<string>;
 saveGapVerification?(report:GapVerificationOutcomeSection):Promise<string>;
 saveHypothesisRegistry?(registry:HypothesisRegistry):Promise<string>;
}
export function createSscPlannerExecutor(input:{plan:QuestionPlanInput;sink:HsiInvestigationArtifactSink}):HsiAgentExecutor{
 return async({role}):Promise<HsiAgentStepResult>=>{
  if(role!=="question_planner")throw Error("Wrong agent role");
  const draft=planSscInterrogation(input.plan);
  const ref=await input.sink.saveDraft(draft);
  if(!ref?.trim())throw Error("Draft persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}
export function createSscContradictionExecutor(input:{sink:HsiInvestigationArtifactSink;draftRef:string}):HsiAgentExecutor{
 return async({role}):Promise<HsiAgentStepResult>=>{
  if(role!=="contradiction_analyst")throw Error("Wrong agent role");
  const draft=await input.sink.loadDraft(input.draftRef);
  validateInterrogativeInvestigation(draft);
  const report=evaluateSscFalsification(draft);
  const ref=await input.sink.saveFalsification(report);
  if(!ref?.trim())throw Error("Falsification persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}
/** Reuses claim_verifier role — no new agent catalogue entry. Classifies recorded gaps only. */
export function createGapVerificationExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 gapInput:GapVerificationInput;
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="claim_verifier")throw Error("Wrong agent role");
  assertTool("evidence.get");
  if(!input.sink.saveGapVerification){
   return {status:"blocked",outputRef:null,reason:"Gap verification sink not registered"};
  }
  const report=projectGapVerificationForOutcome(input.gapInput);
  if(report.honesty.scientificallyValidated!==false||report.honesty.smeGoldFilled!==false){
   throw Error("Gap verification must remain non-validated without SME gold");
  }
  const ref=await input.sink.saveGapVerification(report);
  if(!ref?.trim())throw Error("Gap verification persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}

/** Evidence retriever over a curated published release snapshot (no live literature). */
export function createSscEvidenceRetrieverExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 draftRef:string;
 snapshot:PublishedReleaseSnapshot;
 bindings:readonly BranchGraphBinding[];
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="evidence_retriever")throw Error("Wrong agent role");
  assertTool("evidence.get");
  const draft=await input.sink.loadDraft(input.draftRef);
  const interrogated=interrogatePublishedSscEvidence({
   plan:draft,
   snapshot:input.snapshot,
   bindings:input.bindings,
  });
  const ref=await input.sink.saveDraft(interrogated);
  if(!ref?.trim())throw Error("Evidence plan persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}

/** Draft-only hypothesis proposals from planned branches — never review-approved. */
export function createSscHypothesisGeneratorExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 draftRef:string;
 investigationId:string;
 now?:()=>string;
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="hypothesis_generator")throw Error("Wrong agent role");
  assertTool("hypothesis.create");
  if(!input.sink.saveHypothesisRegistry){
   return {status:"blocked",outputRef:null,reason:"Hypothesis registry sink not registered"};
  }
  const draft=await input.sink.loadDraft(input.draftRef);
  validateInterrogativeInvestigation(draft);
  let registry=emptyHypothesisRegistry();
  const createdAt=input.now?.()??new Date().toISOString();
  for(const [index,branch] of draft.branches.slice(0,4).entries()){
   registry=proposeHypothesis(registry,{
    id:`hyp-${draft.id.slice(0,24)}-${index+1}`,
    statement:branch.statement,
    subjectId:"ssc",
    predicate:"candidate_mechanism",
    objectId:branch.id,
    falsifier:branch.falsificationTest,
    investigationId:input.investigationId,
    fixtureHonesty:true,
    dataBasis:"fixture_engineering",
    createdAt,
   });
  }
  if(registry.records.some(r=>r.lifecycle!=="proposed")){
   throw Error("Hypothesis generator must only emit proposed drafts");
  }
  const ref=await input.sink.saveHypothesisRegistry(registry);
  if(!ref?.trim())throw Error("Hypothesis registry persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}

/** Deterministic safety/policy gate — refuses clinical PHI tools and Gate C claims. */
export function createSafetyPolicyGateExecutor(input:{
 dataClass:QuestionPlanInput["dataClass"];
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="safety_policy_gate")throw Error("Wrong agent role");
  assertTool("policy.check");
  if(input.dataClass!=="public_biomedical"&&input.dataClass!=="licensed_partner"){
   return {status:"blocked",outputRef:null,reason:"Clinical data class refused by safety policy gate"};
  }
  if(
   HSI_CDS_PHI_INVARIANTS.mayUseLivePhi!==false||
   HSI_CDS_PHI_INVARIANTS.containsPhi!==false||
   HSI_CDS_PHI_INVARIANTS.clinicalActive!==false||
   HSI_CDS_PHI_INVARIANTS.ehrWriteBack!==false
  ){
   throw Error("CDS/PHI invariants must remain closed for research agents");
  }
  return {
   status:"completed",
   outputRef:`policy-cleared:${input.dataClass}`,
   reason:null,
  };
 };
}
