/**
 * Phase 9.1: join the independently developed Reactome adapter with the
 * headless research workbench. No publication claim or graph write is implied.
 */
import type {FetchLike} from "../fetchLike";
import {lookupReactomePathway} from "./reactomePathwayLookup";
import {reactomePathwayDraftNode} from "./reactomeOntologyBridge";
import {prepareResearchWorkbenchDraft,type ResearchWorkbenchInput,type ResearchWorkbenchResult} from "./researchWorkbenchDraft";

export type IntegratedWorkbenchInput = Omit<ResearchWorkbenchInput,"pathwayDraft"> & {
  reactomeStableId:string;
  reactomeFetcher?:FetchLike;
};
export type IntegratedWorkbenchResult =
  | {ok:false;stage:"pathway_lookup";detail:string}
  | ResearchWorkbenchResult;

export async function prepareIntegratedResearchDraft(
  input:IntegratedWorkbenchInput,
):Promise<IntegratedWorkbenchResult> {
  const pathway=await lookupReactomePathway({
    stableId:input.reactomeStableId,fetcher:input.reactomeFetcher,
  });
  if(!pathway.ok)return {ok:false,stage:"pathway_lookup",detail:pathway.detail};
  const pathwayDraft=reactomePathwayDraftNode(pathway.pathway);
  return prepareResearchWorkbenchDraft({...input,pathwayDraft});
}
