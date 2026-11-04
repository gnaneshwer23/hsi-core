/** ARCH-009 adapter boundary for existing deterministic ARCH-003 capabilities.
 * Adapters require caller-owned output storage; they do not call LLMs or publish evidence.
 */
import {planSscInterrogation,type QuestionPlanInput} from "./interrogativeQuestionEngine";
import {evaluateSscFalsification} from "./interrogativeFalsificationEngine";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";
import type {HsiAgentExecutor,HsiAgentStepResult} from "./hsiAgentOrchestrator";
export interface HsiInvestigationArtifactSink{
 saveDraft(investigation:InterrogativeInvestigation):Promise<string>;
 loadDraft(ref:string):Promise<InterrogativeInvestigation>;
 saveFalsification(report:ReturnType<typeof evaluateSscFalsification>):Promise<string>;
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
