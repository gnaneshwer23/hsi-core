/**
 * Step 7: bounded research-workbench composition (headless).
 * No graph persistence, autonomous claim extraction, clinical use, or approvals.
 * Reactome pathway draft is supplied by the separate Step 2 adapter/bridge once
 * PR #183 is integrated. Never infer membership from metadata co-occurrence.
 */
import type {FetchLike} from "../fetchLike";
import type {HsiGraphNode} from "../livingHealthKnowledgeGraph";
import {lookupUniProtProtein} from "./uniProtProteinLookup";
import {uniProtProteinDraftNode} from "./uniProtOntologyBridge";
import {buildProteinPathwayCandidate,type ProteinPathwayContext} from "./proteinPathwayMechanismCandidates";
import {compareMechanismLeads,type MechanismEvidenceLead} from "./contextualMechanismComparison";
import {proposeFalsifiableExperiment,type ExperimentProposal} from "./falsifiableExperimentProposals";
import {assertWorkbenchContextConsistency} from "./researchWorkbenchValidation";

export type ResearchWorkbenchInput = {
  proteinAccession:string;
  pathwayDraft:HsiGraphNode;
  sourceReference:string;
  biologicalContext:ProteinPathwayContext;
  leftLead:MechanismEvidenceLead;
  rightLead:MechanismEvidenceLead;
  experiment:Omit<Parameters<typeof proposeFalsifiableExperiment>[0],
    "comparison"|"left"|"right">;
  fetcher?:FetchLike;
};
export type ResearchWorkbenchResult =
  | {ok:false;stage:"protein_lookup"|"mechanism_candidate"|"evidence_comparison"|"experiment_proposal";detail:string}
  | {ok:true;proteinDraft:HsiGraphNode;pathwayDraft:HsiGraphNode;
      mechanismCandidate:ReturnType<typeof buildProteinPathwayCandidate>;
      comparison:ReturnType<typeof compareMechanismLeads>;
      proposal:ExperimentProposal;
      reviewState:"draft";productionPersisted:false;scientificApproval:false};

export async function prepareResearchWorkbenchDraft(input:ResearchWorkbenchInput):Promise<ResearchWorkbenchResult> {
  const proteinLookup=await lookupUniProtProtein({
    accession:input.proteinAccession,fetcher:input.fetcher,
  });
  if(!proteinLookup.ok)return {ok:false,stage:"protein_lookup",detail:proteinLookup.detail};
  const proteinDraft=uniProtProteinDraftNode(proteinLookup.protein);
  let mechanismCandidate:ReturnType<typeof buildProteinPathwayCandidate>;
  try {
    mechanismCandidate=buildProteinPathwayCandidate({
      protein:proteinDraft,pathway:input.pathwayDraft,
      sourceReference:input.sourceReference,context:input.biologicalContext,
    });
  } catch(e) {
    return {ok:false,stage:"mechanism_candidate",detail:e instanceof Error?e.message:"Invalid candidate"};
  }
  let comparison:ReturnType<typeof compareMechanismLeads>;
  try {
    assertWorkbenchContextConsistency(input);
    comparison=compareMechanismLeads(input.leftLead,input.rightLead);
    if(input.leftLead.proteinAccession!==proteinLookup.protein.accession ||
       input.rightLead.proteinAccession!==proteinLookup.protein.accession ||
       input.leftLead.pathwayStableId!==input.pathwayDraft.sourceIdentifiers.find(x=>x.system==="Reactome")?.value ||
       input.rightLead.pathwayStableId!==input.pathwayDraft.sourceIdentifiers.find(x=>x.system==="Reactome")?.value)
      throw new Error("Research leads must match the selected protein and pathway");
  } catch(e) {
    return {ok:false,stage:"evidence_comparison",detail:e instanceof Error?e.message:"Invalid evidence"};
  }
  try {
    const proposal=proposeFalsifiableExperiment({
      comparison,left:input.leftLead,right:input.rightLead,...input.experiment,
    });
    return {ok:true,proteinDraft,pathwayDraft:input.pathwayDraft,
      mechanismCandidate,comparison,proposal,
      reviewState:"draft",productionPersisted:false,scientificApproval:false};
  } catch(e) {
    return {ok:false,stage:"experiment_proposal",detail:e instanceof Error?e.message:"Invalid proposal"};
  }
}
