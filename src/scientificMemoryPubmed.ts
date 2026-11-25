import type {EvidenceStatus} from "./scientificMemoryEvidenceFreshness";
export function normalizePmid(value:string):string{
 if(typeof value!=="string"||! /^[1-9][0-9]{0,11}$/.test(value))throw Error("Invalid PMID");
 return value;
}
export interface PubmedStatusCandidate {pmid:string;status:EvidenceStatus;noticePmids:string[];scientificClaimAllowed:false;ingestionAllowed:false}
/** Interpret a normalized PubMed XML projection, not raw EFetch XML. */
export function interpretPubmedStatus(requestedPmid:string,payload:unknown):PubmedStatusCandidate{
 const pmid=normalizePmid(requestedPmid);
 if(!payload||typeof payload!=="object")throw Error("Invalid PubMed projection");
 const p=payload as Record<string,unknown>;
 if(typeof p.pmid!=="string"||normalizePmid(p.pmid)!==pmid||!Array.isArray(p.commentsCorrections)||p.commentsCorrections.length>1000)throw Error("Invalid PubMed identity or links");
 const notices=new Set<string>();const statuses=new Set<EvidenceStatus>();
 for(const link of p.commentsCorrections){
  if(!link||typeof link!=="object"||typeof link.refType!=="string")throw Error("Invalid PubMed link");
  let status:EvidenceStatus;
  switch(link.refType){
   case "RetractionIn":status="retracted";break;
   case "ErratumIn":status="corrected";break;
   case "ExpressionOfConcernIn":status="expression_of_concern";break;
   case "UpdateIn":case "RepublishedIn":status="superseded";break;
   default:continue;
  }
  statuses.add(status);
  if(link.pmid!==undefined&&link.pmid!==null)notices.add(normalizePmid(link.pmid));
 }
 const status=(["retracted","expression_of_concern","corrected","superseded"] as const).find(s=>statuses.has(s))??"unknown";
 return {pmid,status,noticePmids:[...notices].sort(),scientificClaimAllowed:false,ingestionAllowed:false};
}
