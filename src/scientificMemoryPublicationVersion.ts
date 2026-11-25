import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
export interface PublicationVersionAssertion {
 doi:string; version:string; authority:"crossref"|"publisher"|"pubmed"|"europe_pmc";
 locator:string; publicRecord:boolean;
}
export type VersionLinkageResult={state:"corroborated"|"ambiguous"|"insufficient";authorities:string[];ingestionAllowed:false;scientificClaimAllowed:false};
/** Offline corroboration of supplied assertions, not authentication of their provenance. */
export function assessPublicationVersion(doiInput:string,version:string,assertions:readonly PublicationVersionAssertion[]):VersionLinkageResult{
 const doi=normalizeEvidenceDoi(doiInput);
 if(typeof version!=="string"||!version.trim()||version.length>1000||!Array.isArray(assertions)||assertions.length>100)throw Error("Invalid version assessment");
 const authorities=new Set<string>();let conflict=false;
 for(const a of assertions){
  if(!a||!["crossref","publisher","pubmed","europe_pmc"].includes(a.authority)||typeof a.version!=="string"||!a.version.trim()||a.version.length>1000||typeof a.locator!=="string"||!a.locator.trim()||a.locator.length>2048||typeof a.publicRecord!=="boolean")throw Error("Invalid publication assertion");
  if(!a.publicRecord)continue;
  if(normalizeEvidenceDoi(a.doi)!==doi||a.version!==version){conflict=true;continue;}
  authorities.add(a.authority);
 }
 // Crossref and other indexes may share upstream metadata. Require publisher assertion
 // plus an index assertion, but do not infer actual independence from labels.
 const state=conflict?"ambiguous":authorities.has("publisher")&&authorities.size>=2?"corroborated":"insufficient";
 return {state,authorities:[...authorities].sort(),ingestionAllowed:false,scientificClaimAllowed:false};
}
