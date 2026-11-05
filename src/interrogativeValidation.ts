/** ARCH-003 Step 2: versioned, evidence-grounded investigation contracts.
 * Schema is a pure contract; it does not run agents, approve claims or publish evidence.
 * HSI owns investigation data independently of ISI and Aksh.
 */
import type {DataClass} from "./p1ResearchGovernance";

export const INTERROGATIVE_SCHEMA_VERSION="hsi-interrogative-investigation-1" as const;
export type EvidenceKind="established_evidence"|"association"|"computational_inference"|"unvalidated_hypothesis";
export type BranchAssessment="supported"|"partially_supported"|"contested"|"context_limited"|"inconclusive"|"insufficient_evidence";
export type InvestigationState="draft"|"awaiting_scientific_review"|"reviewed"|"rejected";
export type QuestionNode={
 id:string;parentId:string|null;text:string;purpose:"clarify"|"discriminate"|"falsify";
 depth:number;status:"pending"|"answered"|"unanswerable";
};
export type EvidenceTrace={
 claimId:string;sourceIds:readonly string[];reviewDecisionId:string;
 polarity:"supports"|"contradicts"|"contextualises";
 evidenceKind:EvidenceKind;context:Record<string,unknown>;
 graphPath:readonly string[];
};
export type HypothesisBranch={
 id:string;questionId:string;statement:string;classification:EvidenceKind;
 supporting:readonly EvidenceTrace[];opposing:readonly EvidenceTrace[];
 missingEvidence:readonly string[];falsificationTest:string;
 assessment:BranchAssessment;uncertainty:readonly string[];
};
export type InterrogativeInvestigation={
 schemaVersion:typeof INTERROGATIVE_SCHEMA_VERSION;
 id:string;actorPrincipal:string;question:string;createdAt:string;
 dataClass:Extract<DataClass,"public_biomedical"|"licensed_partner">;
 release:{id:string;version:string;manifestHash:string};
 state:InvestigationState;
 questions:readonly QuestionNode[];branches:readonly HypothesisBranch[];
 conclusion:{text:string;assessment:BranchAssessment;limitations:readonly string[]};
 provenance:{agentRuns:readonly {agentId:string;version:string;modelVersion:string;promptVersion:string;toolCalls:readonly string[]}[];retrievalIds:readonly string[]};
 review:{reviewerPrincipal:string;reviewDecisionId:string;reviewedAt:string}|null;
};
export const INTERROGATION_LIMITS={maxQuestions:24,maxDepth:4,maxBranches:12,maxEvidencePerBranch:40,maxGraphPath:16,maxTextLength:2000} as const;
export function validateInterrogativeInvestigation(x:InterrogativeInvestigation):void{
 const fail=(m:string):never=>{throw Error("Invalid ARCH-003 investigation: "+m)};
 if(x.schemaVersion!==INTERROGATIVE_SCHEMA_VERSION||!/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/.test(x.id))fail("schema or identity");
 if(!x.actorPrincipal.trim()||!x.question.trim()||x.question.length>500||!Number.isFinite(Date.parse(x.createdAt)))fail("actor, question or time");
 if(!["public_biomedical","licensed_partner"].includes(x.dataClass))fail("forbidden data class");
 if(!x.release.id||!/^\d+\.\d+\.\d+$/.test(x.release.version)||!/^[a-f0-9]{64}$/.test(x.release.manifestHash))fail("unverified release reference");
 if(x.questions.length>INTERROGATION_LIMITS.maxQuestions||x.branches.length>INTERROGATION_LIMITS.maxBranches)fail("execution limits");
 const ids=new Set<string>();
 for(const q of x.questions){
  if(!q.id||ids.has(q.id)||!q.text.trim()||q.text.length>INTERROGATION_LIMITS.maxTextLength||!Number.isInteger(q.depth)||q.depth<0||q.depth>INTERROGATION_LIMITS.maxDepth)fail("question invalid");
  ids.add(q.id);
 }
 for(const q of x.questions){
  const parent=x.questions.find(p=>p.id===q.parentId);
  if(q.parentId!==null&&(!parent||parent.depth!==q.depth-1))fail("question parent invalid");
  if(q.parentId===null&&q.depth!==0)fail("root question invalid");
 }
 const branchIds=new Set<string>();
 for(const b of x.branches){
  if(!b.id||branchIds.has(b.id)||!ids.has(b.questionId)||!b.statement.trim()||b.statement.length>INTERROGATION_LIMITS.maxTextLength||!b.falsificationTest.trim())fail("branch invalid");
  branchIds.add(b.id);
  if(b.supporting.length>INTERROGATION_LIMITS.maxEvidencePerBranch||b.opposing.length>INTERROGATION_LIMITS.maxEvidencePerBranch)fail("evidence limit");
  for(const [side,items] of [["supports",b.supporting],["contradicts",b.opposing]] as const){
   for(const e of items){
    if(e.polarity!==side||!e.claimId||!e.reviewDecisionId||!e.sourceIds.length||e.graphPath.length>INTERROGATION_LIMITS.maxGraphPath)fail("evidence provenance or polarity");
    if(e.evidenceKind==="unvalidated_hypothesis")fail("hypothesis cannot be evidence");
   }
  }
  if(b.classification==="unvalidated_hypothesis"&&b.assessment==="supported")fail("hypothesis cannot be established");
  if(b.assessment==="supported"&&!b.supporting.length)fail("unsupported conclusion");
 }
 if(!x.conclusion.text.trim()||x.conclusion.text.length>INTERROGATION_LIMITS.maxTextLength)fail("conclusion invalid");
 if(x.state==="reviewed"&&(!x.review?.reviewerPrincipal||!x.review.reviewDecisionId||!Number.isFinite(Date.parse(x.review.reviewedAt))))fail("missing human review");
 if(x.state!=="reviewed"&&x.review!==null)fail("review cannot predate decision");
}
