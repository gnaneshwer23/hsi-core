/**
 * Phase 9.2: explicit, opt-in live provider verification.
 * No scientific assertions: this checks response shape, source identifiers and
 * draft-only governance against real upstream APIs.
 */
import type {FetchLike} from "../fetchLike";
import {lookupReactomePathway} from "./reactomePathwayLookup";
import {lookupUniProtProtein} from "./uniProtProteinLookup";
import {reactomePathwayDraftNode} from "./reactomeOntologyBridge";
import {uniProtProteinDraftNode} from "./uniProtOntologyBridge";

export type ProviderVerification = {
  provider:"reactome"|"uniprotkb";
  identifier:string;
  ok:boolean;
  error?:string;
  sourceUrl?:string;
  retrievedAt?:string;
  draftOnly:true;
  scientificClaimVerified:false;
};
export type LiveProviderReport={
  checks:readonly ProviderVerification[];
  allPassed:boolean;
  executedAt:string;
  externalNetworkRequired:true;
  scientificValidationComplete:false;
};
export async function verifyLiveBiomedicalProviders(input:{
  proteinAccession:string;
  reactomeStableId:string;
  fetcher?:FetchLike;
}):Promise<LiveProviderReport>{
  const [protein,pathway]=await Promise.all([
    lookupUniProtProtein({accession:input.proteinAccession,fetcher:input.fetcher}),
    lookupReactomePathway({stableId:input.reactomeStableId,fetcher:input.fetcher}),
  ]);
  const checks:ProviderVerification[]=[];
  if(protein.ok){
    try {
      const node=uniProtProteinDraftNode(protein.protein);
      if(node.reviewState!=="draft"||node.visibility!=="governed_research")
        throw new Error("Unsafe protein governance");
      checks.push({provider:"uniprotkb",identifier:protein.protein.accession,
        ok:true,sourceUrl:protein.protein.url,retrievedAt:protein.protein.retrievedAt,
        draftOnly:true,scientificClaimVerified:false});
    }catch(e){
      checks.push({provider:"uniprotkb",identifier:input.proteinAccession,ok:false,
        error:e instanceof Error?e.message:"Draft conversion failed",draftOnly:true,scientificClaimVerified:false});
    }
  }else checks.push({provider:"uniprotkb",identifier:input.proteinAccession,ok:false,
    error:protein.detail,draftOnly:true,scientificClaimVerified:false});
  if(pathway.ok){
    try {
      const node=reactomePathwayDraftNode(pathway.pathway);
      if(node.reviewState!=="draft"||node.visibility!=="governed_research")
        throw new Error("Unsafe pathway governance");
      checks.push({provider:"reactome",identifier:pathway.pathway.stableId,
        ok:true,sourceUrl:pathway.pathway.url,retrievedAt:pathway.pathway.retrievedAt,
        draftOnly:true,scientificClaimVerified:false});
    }catch(e){
      checks.push({provider:"reactome",identifier:input.reactomeStableId,ok:false,
        error:e instanceof Error?e.message:"Draft conversion failed",draftOnly:true,scientificClaimVerified:false});
    }
  }else checks.push({provider:"reactome",identifier:input.reactomeStableId,ok:false,
    error:pathway.detail,draftOnly:true,scientificClaimVerified:false});
  return {checks,allPassed:checks.every(c=>c.ok),executedAt:new Date().toISOString(),
    externalNetworkRequired:true,scientificValidationComplete:false};
}
