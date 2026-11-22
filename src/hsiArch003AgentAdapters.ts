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
/** Deterministic entity resolution over planned branches (U44) — not ontology authority. */
export type HsiEntityResolutionArtifact={
 schemaVersion:"hsi-entity-resolution-artifact-1";
 investigationId:string;
 entities:readonly {id:string;label:string;kind:"branch"|"focus"|"subject";source:"interrogative_draft"}[];
 scientificApproval:false;
 graphPromotable:false;
};
/** Deterministic mechanism graph reasoning over planned branches (U44). */
export type HsiGraphReasoningArtifact={
 schemaVersion:"hsi-graph-reasoning-artifact-1";
 investigationId:string;
 mechanisms:readonly {branchId:string;statement:string;assessment:string}[];
 scientificApproval:false;
 graphPromotable:false;
};
/** Deterministic interrogative research brief (U44) — not a decision brief GO. */
export type HsiInterrogatorBriefArtifact={
 schemaVersion:"hsi-interrogator-brief-artifact-1";
 investigationId:string;
 question:string;
 nextQuestions:readonly string[];
 limitations:readonly string[];
 scientificApproval:false;
 clinicalAdvice:false;
};
export interface HsiInvestigationArtifactSink{
 saveDraft(investigation:InterrogativeInvestigation):Promise<string>;
 loadDraft(ref:string):Promise<InterrogativeInvestigation>;
 saveFalsification(report:ReturnType<typeof evaluateSscFalsification>):Promise<string>;
 saveGapVerification?(report:GapVerificationOutcomeSection):Promise<string>;
 saveHypothesisRegistry?(registry:HypothesisRegistry):Promise<string>;
 saveEntityResolution?(report:HsiEntityResolutionArtifact):Promise<string>;
 saveGraphReasoning?(report:HsiGraphReasoningArtifact):Promise<string>;
 saveInterrogatorBrief?(report:HsiInterrogatorBriefArtifact):Promise<string>;
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

/** U44 — resolve planned branch/focus entities (ontology.lookup + graph.query checks only). */
export function createSscEntityResolverExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 draftRef:string;
 investigationId:string;
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="entity_resolver")throw Error("Wrong agent role");
  assertTool("ontology.lookup");
  assertTool("graph.query");
  if(!input.sink.saveEntityResolution){
   return {status:"blocked",outputRef:null,reason:"Entity resolution sink not registered"};
  }
  const draft=await input.sink.loadDraft(input.draftRef);
  validateInterrogativeInvestigation(draft);
  const entities:HsiEntityResolutionArtifact["entities"]=[
   {id:"ssc",label:"systemic sclerosis",kind:"focus",source:"interrogative_draft"},
   {id:"subject:ssc",label:"SSc subject",kind:"subject",source:"interrogative_draft"},
   ...draft.branches.map((b)=>({
    id:b.id,
    label:b.statement.slice(0,160),
    kind:"branch" as const,
    source:"interrogative_draft" as const,
   })),
  ];
  const report:HsiEntityResolutionArtifact={
   schemaVersion:"hsi-entity-resolution-artifact-1",
   investigationId:input.investigationId,
   entities,
   scientificApproval:false,
   graphPromotable:false,
  };
  const ref=await input.sink.saveEntityResolution(report);
  if(!ref?.trim())throw Error("Entity resolution persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}

/** U44 — mechanism reasoning over planned branches (graph.query + evidence.get checks). */
export function createSscGraphReasonerExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 draftRef:string;
 investigationId:string;
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="graph_reasoner")throw Error("Wrong agent role");
  assertTool("graph.query");
  assertTool("evidence.get");
  if(!input.sink.saveGraphReasoning){
   return {status:"blocked",outputRef:null,reason:"Graph reasoning sink not registered"};
  }
  const draft=await input.sink.loadDraft(input.draftRef);
  validateInterrogativeInvestigation(draft);
  const report:HsiGraphReasoningArtifact={
   schemaVersion:"hsi-graph-reasoning-artifact-1",
   investigationId:input.investigationId,
   mechanisms:draft.branches.map((b)=>({
    branchId:b.id,
    statement:b.statement,
    assessment:b.assessment,
   })),
   scientificApproval:false,
   graphPromotable:false,
  };
  const ref=await input.sink.saveGraphReasoning(report);
  if(!ref?.trim())throw Error("Graph reasoning persistence failed");
  return {status:"completed",outputRef:ref,reason:null};
 };
}

/** U44 — interrogative research brief from planned missing evidence (not clinical advice). */
export function createSscInterrogatorExecutor(input:{
 sink:HsiInvestigationArtifactSink;
 draftRef:string;
 investigationId:string;
}):HsiAgentExecutor{
 return async({role,assertTool}):Promise<HsiAgentStepResult>=>{
  if(role!=="interrogator")throw Error("Wrong agent role");
  assertTool("graph.query");
  assertTool("evidence.get");
  assertTool("ontology.lookup");
  if(!input.sink.saveInterrogatorBrief){
   return {status:"blocked",outputRef:null,reason:"Interrogator brief sink not registered"};
  }
  const draft=await input.sink.loadDraft(input.draftRef);
  validateInterrogativeInvestigation(draft);
  const nextQuestions=draft.branches
   .flatMap((b)=>b.missingEvidence.slice(0,2))
   .map((m)=>`What evidence would address: ${m}?`)
   .slice(0,8);
  const report:HsiInterrogatorBriefArtifact={
   schemaVersion:"hsi-interrogator-brief-artifact-1",
   investigationId:input.investigationId,
   question:draft.question,
   nextQuestions:nextQuestions.length
    ? nextQuestions
    : ["What additional public evidence would reduce uncertainty on the planned branches?"],
   limitations:[
    ...draft.conclusion.limitations,
    "Interrogator brief is deterministic engineering output — not scientific approval or clinical advice.",
   ],
   scientificApproval:false,
   clinicalAdvice:false,
  };
  const ref=await input.sink.saveInterrogatorBrief(report);
  if(!ref?.trim())throw Error("Interrogator brief persistence failed");
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
