/** ARCH-002 Step 2: validate scientific curation candidates. Never auto-approve. */
import { readFileSync } from "node:fs";
export type SscCandidate = {id:string;pmid:string;doi:string;subject:string;predicate:string;object:string;epistemicType:"experimental_finding"|"observational_association";model:string;context:string;evidenceLocator:string;assessment:"abstract_supported_candidate";reviewState:"unreviewed";limitations:string};
export type SscCurationCorpus = {schemaVersion:"hsi-ssc-curation-candidates-1";disease:"systemic sclerosis";status:"draft_evidence_assessment";reviewedByHuman:false;graphPromotable:false;claims:SscCandidate[];comparisonCandidates:{claimIds:string[];type:string;reason:string}[]};
export function validateSscCuration(value:unknown): SscCurationCorpus {
 if(!value||typeof value!=="object")throw Error("Invalid corpus");
 const c=value as SscCurationCorpus;
 if(c.schemaVersion!=="hsi-ssc-curation-candidates-1"||c.disease!=="systemic sclerosis"||c.status!=="draft_evidence_assessment"||c.reviewedByHuman!==false||c.graphPromotable!==false)throw Error("Unsafe curation status");
 if(!Array.isArray(c.claims)||c.claims.length<1||c.claims.length>100)throw Error("Invalid claims");
 const ids=new Set<string>();
 for(const claim of c.claims){
  if(!/^HSI-C-SSC-[A-Z0-9-]+$/.test(claim.id)||ids.has(claim.id))throw Error("Invalid/duplicate claim ID");
  ids.add(claim.id);
  if(!/^\d{1,9}$/.test(claim.pmid)||!/^10\.\d{4,9}\/\S+$/.test(claim.doi))throw Error("Missing source identifiers");
  if(!["experimental_finding","observational_association"].includes(claim.epistemicType)||claim.assessment!=="abstract_supported_candidate"||claim.reviewState!=="unreviewed")throw Error("Unreviewed candidates only");
  for(const key of ["subject","predicate","object","model","context","evidenceLocator","limitations"] as const){if(typeof claim[key]!=="string"||!claim[key].trim())throw Error("Missing scientific context");}
 }
 if(!Array.isArray(c.comparisonCandidates))throw Error("Missing comparisons");
 for(const item of c.comparisonCandidates){if(!Array.isArray(item.claimIds)||item.claimIds.length<2||item.claimIds.some(id=>!ids.has(id)))throw Error("Comparison references unknown claim");}
 return c;
}
export function loadSscCuration(path:string):SscCurationCorpus{return validateSscCuration(JSON.parse(readFileSync(path,"utf8")));}
