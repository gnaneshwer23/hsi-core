/** Offline adapters over existing source imports. Never fetches, grants, approves or publishes. */
import {createHash} from "node:crypto";
import {parseRaEvidenceRelease} from "../raEvidenceRelease";
import {prepareSscLiteratureVerification,type SscCandidatePack} from "./sscLiteratureVerification";
import {canonicalEvidenceJson,parseResearchEvidenceCorpus,assessWorkingEvidence,
 type ResearchEvidenceCorpus,type CorpusSource,type CorpusPassage,type CorpusClaim} from "./researchEvidenceCorpus";
export const CORPUS_INPUT_PATHS={ra:"research/ra-anti-tnf/release.json",ssc:"research/ssc-tfh-il21/curation-candidates.v1.json",verification:"research/ssc-tfh-il21/abstract-verification.v1.json"} as const;
const hash=(text:string)=>createHash("sha256").update(text).digest("hex");
type CandidatePack=SscCandidatePack&{disease:string;claims:Array<SscCandidatePack["claims"][number]&{model:string}>};
type Verification={schemaVersion:string;reviewedByHuman:boolean;graphPromotable:boolean;sources:{pmid:string;doi:string;url:string;title:string}[]};
export function buildResearchEvidenceCorpus(input:{ra:unknown;ssc:unknown;verification:unknown}):ResearchEvidenceCorpus{
 const ra=parseRaEvidenceRelease(input.ra),ssc=input.ssc as CandidatePack,v=input.verification as Verification;
 if(!ssc||ssc.disease!=="systemic sclerosis"||!Array.isArray(ssc.claims)||ssc.claims.length!==5||!v||v.schemaVersion!=="hsi-ssc-abstract-verification-1"||v.reviewedByHuman!==false||v.graphPromotable!==false||!Array.isArray(v.sources)||v.sources.length!==3)throw Error("Expected bounded, unreviewed SSc source inputs");
 prepareSscLiteratureVerification(ssc,[]);
 const sources:CorpusSource[]=ra.sources.map(s=>({id:"pmid:"+s.pmid,pmid:s.pmid!,doi:s.doi!.toLowerCase(),title:s.title,url:`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`,disease:"rheumatoid_arthritis",
  identityStatus:"import_receipt_validated",contentVersion:s.provenance.version,retrievedAt:s.provenance.retrievedAt,
  rights:{status:"import_receipt_only",licenceUrl:s.licence.identifier,receiptRef:CORPUS_INPUT_PATHS.ra+"#receipts/"+s.id}}));
 for(const s of v.sources){
  if(!s||!s.pmid||s.url!==`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`||!s.title||!s.doi)throw Error("Invalid SSc bibliographic source");
  sources.push({id:"pmid:"+s.pmid,pmid:s.pmid,doi:s.doi.toLowerCase(),title:s.title,url:s.url,disease:"systemic_sclerosis",identityStatus:"repository_metadata_unverified",contentVersion:null,retrievedAt:null,rights:{status:"unverified",licenceUrl:null,receiptRef:null}});
 }
 const passages:CorpusPassage[]=ra.passages.map(p=>({id:p.id,sourceId:"pmid:"+ra.sources.find(s=>s.id===p.sourceId)!.pmid,sourceVersion:p.sourceVersion,locator:p.locator,text:p.text,sha256:p.sha256}));
 const claims:CorpusClaim[]=[];
 // Only values explicit in the existing candidate's subject/model/context are
 // structured here. Unknown assay, timing and population details remain null.
 // Quote the two Results paragraphs verbatim. No serology-response inference is
 // mapped onto unrelated anti-TNF efficacy edges, and no scientific approval is implied.
 for(const [pmid,kind] of [["18375541","COHORT"],["24586782","META"]] as const){
  const results=passages.find(p=>p.id===`PMID-${pmid}-ABSTRACT-3`),methods=passages.find(p=>p.id===`PMID-${pmid}-ABSTRACT-2`);
  if(!results?.text||!methods?.text)throw Error("RA Results and Methods passages required");
  const cohort=kind==="COHORT";
  claims.push({id:`HSI-C-RA-SEROLOGY-${kind}-RESULTS`,disease:"rheumatoid_arthritis",assertion:results.text,sourceId:"pmid:"+pmid,passageIds:[results.id,methods.id],status:"unreviewed_candidate",
   context:{model:cohort?"Human observational cohort":"Meta-analysis of human studies",notes:methods.text,
    population:cohort?"642 RA patients (abstract Results)":"14 studies; 5561 RA patients (abstract Results)",
    tissue:cohort?"Serum for RF/anti-CCP; genotyping material not specified in abstract":null,
    assay:cohort?"Commercial RF/anti-CCP and SE kits; PTPN22 R620W by Sequenom MassArray (abstract Methods)":null,
    intervention:cohort?"Infliximab, etanercept or adalimumab (abstract Results)":"Anti-TNF agents; treatment subgroups reported in abstract Results",
    outcome:cohort?"Absolute change in DAS28":"Clinical response by DAS28, ACR20 or EULAR; pooled relative risks",
    timepoint:cohort?"6 months":"Subgroups: at least 6 months versus less than 6 months",
    limitations:cohort?"Source-reported association; abstract-only extraction; limited response variance explained. No individual treatment recommendation.":"Abstract-only extraction; differing response criteria, follow-up and heterogeneity require independent assessment. No individual prediction.",
    originRef:CORPUS_INPUT_PATHS.ra+"#passages/"+results.id}});
 }
 for(const c of ssc.claims){
  const source=sources.find(s=>s.pmid===c.pmid&&s.disease==="systemic_sclerosis");
  if(!source||source.doi!==c.doi.toLowerCase()||!c.model)throw Error("SSc candidate/source identity mismatch");
  const passageId=c.id+"-LOCATOR";
  passages.push({id:passageId,sourceId:source.id,sourceVersion:null,locator:c.evidenceLocator,text:null,sha256:null});
  const extracted={
   population:c.context.includes("50 SSc patients and 32 healthy controls")?"50 SSc patients and 32 healthy controls":c.model==="human case-control"&&c.object==="SSc cohort"?c.object:null,
   tissue:c.model==="human SSc skin"?c.model:null,
   assay:/flow cytometry/i.test(c.context)?"Flow cytometry":c.context.includes("Tfh–B-cell coculture")?"Tfh–B-cell coculture":null,
   intervention:c.model==="human ex vivo coculture"&&c.context.includes("IL-21R blockade/JAK1/2 inhibition")?"IL-21R blockade/JAK1/2 inhibition":c.model==="GVHD-SSc mouse model"&&c.context.includes("Anti-ICOS antibody and IL-21 neutralisation")?"Anti-ICOS antibody and IL-21 neutralisation":null
  };
  claims.push({id:c.id,disease:"systemic_sclerosis",assertion:c.subject+" → "+c.predicate+" → "+c.object,sourceId:source.id,passageIds:[passageId],status:"unreviewed_candidate",
   context:{model:c.model,notes:c.context,...extracted,outcome:c.object,timepoint:null,limitations:c.limitations,originRef:CORPUS_INPUT_PATHS.ssc+"#claims/"+c.id}});
 }
 const inputs=(Object.keys(CORPUS_INPUT_PATHS) as Array<keyof typeof CORPUS_INPUT_PATHS>).map(key=>({path:CORPUS_INPUT_PATHS[key],sha256:hash(canonicalEvidenceJson(input[key]))}));
 const body={schemaVersion:"hsi-research-evidence-corpus-1" as const,id:"hsi-ra-ssc-working-evidence" as const,status:"working_set" as const,containsPhi:false as const,clinicalAdvice:false as const,graphPromotable:false as const,inputs,sources,passages,claims};
 return parseResearchEvidenceCorpus({...body,version:hash(canonicalEvidenceJson(body))});
}
export function buildEvidenceReviewPacket(corpus:ResearchEvidenceCorpus){
 const report=assessWorkingEvidence(corpus);
 return {schemaVersion:"hsi-evidence-review-packet-1",corpusVersion:corpus.version,status:"unassigned_pending_human_review",grantsAuthority:false,publishesGraph:false,
  instructions:"Preparation only. Complete source rights, correction checks and claim review through trusted authenticated services. Filling this file never grants permissions or approves a release.",
  sources:corpus.sources.map(s=>({sourceId:s.id,doi:s.doi,scope:s.disease,sourceVersion:s.contentVersion,
   rights:{assignedPrincipal:null,decision:null,recordId:null,licenceEvidenceUri:s.rights.licenceUrl,permittedUses:[],rationale:null},
   integrity:{assignedPrincipal:null,decision:null,recordId:null,checkedAt:null,evidenceUri:null}})),
  claims:report.claims.map(c=>({claimId:c.claimId,sourceId:c.sourceId,passageIds:corpus.claims.find(x=>x.id===c.claimId)!.passageIds,missingChecks:c.reasons,
   assignedPrincipal:null,decision:null,recordId:null,evidenceReviewed:[],conflictOfInterestDeclared:null,rationale:null}))};
}
