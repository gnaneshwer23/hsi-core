/** P1.2: bounded provider-backed research bundle; draft only, no persistence. */
import type {FetchLike} from "../fetchLike";
import {lookupUniProtProtein} from "./uniProtProteinLookup";
import {lookupReactomePathway} from "./reactomePathwayLookup";
import {uniProtProteinDraftNode} from "./uniProtOntologyBridge";
import {reactomePathwayDraftNode} from "./reactomeOntologyBridge";
import {validateHsiLogicalGraph} from "../livingHealthKnowledgeGraph";

export type BiomedicalSourceBundleResult=
 | {ok:false;stage:"uniprot"|"reactome"|"graph_validation";detail:string}
 | {ok:true;sourceIds:readonly string[];sourceUrls:readonly string[];
     retrievedAt:readonly string[];nodes:readonly ReturnType<typeof uniProtProteinDraftNode>[];
     evidenceState:"provider_metadata_only";graphPersisted:false;
     relationshipVerified:false;scientificallyValidated:false};

export async function retrieveBiomedicalSourceBundle(input:{
  proteinAccession:string;reactomeStableId:string;fetcher?:FetchLike;
}):Promise<BiomedicalSourceBundleResult>{
  const [protein,pathway]=await Promise.all([
    lookupUniProtProtein({accession:input.proteinAccession,fetcher:input.fetcher}),
    lookupReactomePathway({stableId:input.reactomeStableId,fetcher:input.fetcher}),
  ]);
  if(!protein.ok)return {ok:false,stage:"uniprot",detail:protein.detail};
  if(!pathway.ok)return {ok:false,stage:"reactome",detail:pathway.detail};
  try{
    const nodes=[uniProtProteinDraftNode(protein.protein),
      reactomePathwayDraftNode(pathway.pathway)];
    validateHsiLogicalGraph(nodes,[]);
    return {ok:true,sourceIds:[protein.protein.accession,pathway.pathway.stableId],
      sourceUrls:[protein.protein.url,pathway.pathway.url],
      retrievedAt:[protein.protein.retrievedAt,pathway.pathway.retrievedAt],
      nodes,evidenceState:"provider_metadata_only",
      graphPersisted:false,relationshipVerified:false,scientificallyValidated:false};
  }catch(e){
    return {ok:false,stage:"graph_validation",
      detail:e instanceof Error?e.message:"Invalid draft graph"};
  }
}
