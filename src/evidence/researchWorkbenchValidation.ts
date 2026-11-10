/**
 * Step 8 fail-closed workbench input integrity.
 * Research lead context must match the mechanism candidate context. Unknown
 * dimensions may remain explicitly unknown, but cannot be silently replaced.
 */
import type {ResearchWorkbenchInput} from "./researchWorkbenchDraft";
import {validateMechanismLead} from "./contextualMechanismComparison";
import {validateHsiGraphNode} from "../livingHealthKnowledgeGraph";

const SHARED_CONTEXT_FIELDS=["tissue","cellType","disease","species","experimentalSystem"] as const;
const normalize=(value:string)=>value.trim().toLowerCase();
export function assertWorkbenchContextConsistency(input:ResearchWorkbenchInput):void {
  validateHsiGraphNode(input.pathwayDraft);
  if(input.pathwayDraft.kind!=="pathway"||
     input.pathwayDraft.reviewState!=="draft"||
     input.pathwayDraft.visibility!=="governed_research")
    throw new Error("A governed draft pathway is required");
  validateMechanismLead(input.leftLead);
  validateMechanismLead(input.rightLead);
  for(const lead of [input.leftLead,input.rightLead]){
    for(const field of SHARED_CONTEXT_FIELDS){
      if(normalize(lead.context[field])!==normalize(input.biologicalContext[field]))
        throw new Error(`Evidence context mismatch: ${field}`);
    }
  }
  if(input.leftLead.sourceReference===input.rightLead.sourceReference)
    throw new Error("Independent research leads must have distinct source references");
  if(input.sourceReference!==input.leftLead.sourceReference &&
     input.sourceReference!==input.rightLead.sourceReference)
    throw new Error("Mechanism candidate must reference one of the comparison sources");
}
