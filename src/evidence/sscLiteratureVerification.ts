/** Phase 4.1–4.2: source-to-claim literature verification queue.
 * Metadata discovery is not claim validation; no graph promotion or AI approval.
 */
import type {LiteratureRecord} from "./evidence/europePmcSscDiscovery";

export type SscCandidateClaim={
 id:string;pmid:string;doi:string;subject:string;predicate:string;object:string;
 evidenceLocator:string;context:string;limitations:string;reviewState:string;
};
export type SscCandidatePack={schemaVersion:string;graphPromotable:boolean;reviewedByHuman:boolean;claims:SscCandidateClaim[]};
export type SscVerificationItem={
 claimId:string;pmid:string;sourceTitle:string|null;sourceUrl:string|null;
 status:"metadata_matched_unreviewed"|"metadata_mismatch"|"source_not_retrieved";
 sourceLocator:string;limitations:string;reviewRequired:true;graphPromotable:false;
};
export function prepareSscLiteratureVerification(pack:SscCandidatePack,records:readonly LiteratureRecord[]):SscVerificationItem[]{
 if(pack.schemaVersion!=="hsi-ssc-curation-candidates-1"||pack.graphPromotable||pack.reviewedByHuman)throw Error("Expected unreviewed SSc candidate pack");
 const ids=new Set<string>();
 const byPmid=new Map<string,LiteratureRecord[]>();
 for(const record of records){
  if(record.pmid&&record.sourceType==="MED"&&record.reviewState==="unreviewed"){
   const arr=byPmid.get(record.pmid)??[];arr.push(record);byPmid.set(record.pmid,arr);
  }
 }
 return pack.claims.map(c=>{
  if(!/^HSI-C-SSC-[A-Z0-9-]+$/.test(c.id)||ids.has(c.id)||!/^\d{1,9}$/.test(c.pmid)||!c.evidenceLocator.trim()||!c.limitations.trim()||c.reviewState!=="unreviewed")throw Error("Invalid candidate claim provenance");
  ids.add(c.id);
  const matches=byPmid.get(c.pmid)??[];
  const matched=matches.length===1&&matches[0]!.doi?.toLowerCase()===c.doi.toLowerCase()?matches[0]:null;
  const status=matched?"metadata_matched_unreviewed":matches.length?"metadata_mismatch":"source_not_retrieved";
  return {claimId:c.id,pmid:c.pmid,sourceTitle:matched?.title??null,sourceUrl:matched?.url??null,status,sourceLocator:c.evidenceLocator,limitations:c.limitations,reviewRequired:true as const,graphPromotable:false as const};
 });
}
