/**
 * Step 6 — human-reviewable, falsifiable experiment proposals.
 * Not an LLM scientific conclusion or automatic protocol recommendation.
 * Requires an explicit investigator-authored prediction and experimental plan.
 */
import type {EvidenceComparison,MechanismEvidenceLead} from "./contextualMechanismComparison";
import {validateMechanismLead} from "./contextualMechanismComparison";

export type ExperimentProposal = {
  id:string;
  status:"draft_unvalidated_hypothesis";
  contradictionClassification:EvidenceComparison["classification"];
  linkedLeadIds:readonly [string,string];
  sourceReferences:readonly [string,string];
  question:string;
  prediction:string;
  experimentalModel:string;
  perturbation:string;
  primaryReadout:string;
  negativeControl:string;
  replicationPlan:string;
  falsificationCriterion:string;
  confounders:readonly string[];
  limitations:readonly string[];
  provenanceStatus:"source_unverified";
  humanReviewRequired:true;
  scientificApproval:false;
  executionAuthorized:false;
};
const textOk=(v:unknown)=>typeof v==="string"&&v.trim().length>=8&&v.length<=2000;
export function proposeFalsifiableExperiment(input:{
  comparison:EvidenceComparison;
  left:MechanismEvidenceLead;
  right:MechanismEvidenceLead;
  question:string;
  prediction:string;
  experimentalModel:string;
  perturbation:string;
  primaryReadout:string;
  negativeControl:string;
  replicationPlan:string;
  falsificationCriterion:string;
  confounders:readonly string[];
  limitations:readonly string[];
}):ExperimentProposal {
  const {comparison,left,right}=input;
  validateMechanismLead(left);validateMechanismLead(right);
  if(comparison.leftId!==left.id||comparison.rightId!==right.id)
    throw new Error("Comparison and source leads must match");
  if(comparison.classification!=="candidate_contradiction"||
     comparison.scientificConclusion!==false||
     comparison.needsHumanReview!==true||
     comparison.needsSourceVerification!==true)
    throw new Error("Only unverified candidate contradictions are eligible");
  const fields=["question","prediction","experimentalModel","perturbation",
    "primaryReadout","negativeControl","replicationPlan","falsificationCriterion"] as const;
  for(const field of fields)if(!textOk(input[field]))throw new Error(`Missing actionable experiment field: ${field}`);
  if(!Array.isArray(input.confounders)||input.confounders.length===0||
     input.confounders.length>20||input.confounders.some(x=>!textOk(x)))
    throw new Error("Confounders must be documented");
  if(!Array.isArray(input.limitations)||input.limitations.length===0||
     input.limitations.length>20||input.limitations.some(x=>!textOk(x)))
    throw new Error("Limitations must be documented");
  return {
    id:`experiment.${left.id}.${right.id}`,
    status:"draft_unvalidated_hypothesis",
    contradictionClassification:comparison.classification,
    linkedLeadIds:[left.id,right.id],
    sourceReferences:[left.sourceReference,right.sourceReference],
    question:input.question,prediction:input.prediction,
    experimentalModel:input.experimentalModel,perturbation:input.perturbation,
    primaryReadout:input.primaryReadout,negativeControl:input.negativeControl,
    replicationPlan:input.replicationPlan,falsificationCriterion:input.falsificationCriterion,
    confounders:[...input.confounders],limitations:[...input.limitations],
    provenanceStatus:"source_unverified",humanReviewRequired:true,
    scientificApproval:false,executionAuthorized:false,
  };
}
