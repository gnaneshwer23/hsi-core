/** ARCH-009 adapter boundary for existing deterministic ARCH-003 capabilities.
 * Adapters require caller-owned output storage; they do not call LLMs or publish evidence.
 */
import {planSscInterrogation,type QuestionPlanInput} from "./interrogativeQuestionEngine";
import {evaluateSscFalsification} from "./interrogativeFalsificationEngine";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";
import type {HsiAgentExecutor,HsiAgentStepResult} from "./hsiAgentOrchestrator";
import {
  projectGapVerificationForOutcome,
  type GapVerificationInput,
  type GapVerificationOutcomeSection,
} from "./evidence/gapVerification";
export interface HsiInvestigationArtifactSink{
 saveDraft(investigation:InterrogativeInvestigation):Promise<string>;
 loadDraft(ref:string):Promise<InterrogativeInvestigation>;
 saveFalsification(report:ReturnType<typeof evaluateSscFalsification>):Promise<string>;
 saveGapVerification?(report:GapVerificationOutcomeSection):Promise<string>;
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
