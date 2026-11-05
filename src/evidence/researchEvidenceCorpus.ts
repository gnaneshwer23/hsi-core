/** Browser-safe, bounded working-evidence contract. It cannot grant rights or scientific approval. */
import {rejectPhiPayload} from "../cdsPhiBoundary";
export type CorpusDisease="rheumatoid_arthritis"|"systemic_sclerosis";
export type CorpusSource={
 id:string;pmid:string;doi:string;title:string;url:string;disease:CorpusDisease;
 identityStatus:"import_receipt_validated"|"repository_metadata_unverified";
 contentVersion:string|null;retrievedAt:string|null;
 rights:{status:"import_receipt_only"|"unverified";licenceUrl:string|null;receiptRef:string|null};
};
export type CorpusPassage={id:string;sourceId:string;sourceVersion:string|null;locator:string;text:string|null;sha256:string|null};
export type CorpusClaim={
 id:string;disease:CorpusDisease;assertion:string;sourceId:string;passageIds:string[];
 context:{model:string;notes:string;population:string|null;tissue:string|null;assay:string|null;intervention:string|null;outcome:string|null;timepoint:string|null;limitations:string;originRef:string};
 status:"unreviewed_candidate";
};
export type ResearchEvidenceCorpus={
 schemaVersion:"hsi-research-evidence-corpus-1";id:"hsi-ra-ssc-working-evidence";version:string;
 status:"working_set";containsPhi:false;clinicalAdvice:false;graphPromotable:false;
 inputs:{path:string;sha256:string}[];sources:CorpusSource[];passages:CorpusPassage[];claims:CorpusClaim[];
};
const sha=/^[a-f0-9]{64}$/;
function fail():never{throw Error("Invalid research evidence corpus")}
function text(x:unknown,max=20000):x is string{return typeof x==="string"&&!!x.trim()&&x.length<=max}
function exact(x:unknown,keys:string[]):void{if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!==[...keys].sort().join(","))fail()}
function disease(x:unknown):x is CorpusDisease{return x==="rheumatoid_arthritis"||x==="systemic_sclerosis"}
export function canonicalEvidenceJson(value:unknown):string{
 return JSON.stringify(value,(_key,row:unknown)=>row&&typeof row==="object"&&!Array.isArray(row)?Object.fromEntries(Object.entries(row).sort(([a],[b])=>a<b?-1:a>b?1:0)):row);
}
export function parseResearchEvidenceCorpus(value:unknown):ResearchEvidenceCorpus{
 exact(value,["schemaVersion","id","version","status","containsPhi","clinicalAdvice","graphPromotable","inputs","sources","passages","claims"]);
 const x=value as ResearchEvidenceCorpus;
 if(x.schemaVersion!=="hsi-research-evidence-corpus-1"||x.id!=="hsi-ra-ssc-working-evidence"||typeof x.version!=="string"||!sha.test(x.version)||x.status!=="working_set"||x.containsPhi!==false||x.clinicalAdvice!==false||x.graphPromotable!==false||
 !Array.isArray(x.inputs)||!x.inputs.length||x.inputs.length>10||!Array.isArray(x.sources)||!x.sources.length||x.sources.length>25||!Array.isArray(x.passages)||x.passages.length>250||!Array.isArray(x.claims)||!x.claims.length||x.claims.length>100)fail();
 const paths=new Set<string>();for(const i of x.inputs){exact(i,["path","sha256"]);if(!text(i.path,200)||!/^research\/[A-Za-z0-9_./-]+\.json$/.test(i.path)||i.path.includes("..")||paths.has(i.path)||!sha.test(i.sha256))fail();paths.add(i.path)}
 const sources=new Map<string,CorpusSource>();
 for(const s of x.sources){
  exact(s,["id","pmid","doi","title","url","disease","identityStatus","contentVersion","retrievedAt","rights"]);
  exact(s.rights,["status","licenceUrl","receiptRef"]);
  if(typeof s.pmid!=="string"||!(/^[1-9]\d{0,8}$/).test(s.pmid)||s.id!=="pmid:"+s.pmid||sources.has(s.id)||!text(s.doi,200)||!/^10\.\d{4,9}\/\S+$/.test(s.doi)||s.doi!==s.doi.toLowerCase()||!text(s.title,4000)||s.url!==`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`||!disease(s.disease))fail();
  if(!["import_receipt_validated","repository_metadata_unverified"].includes(s.identityStatus)||!(["import_receipt_only","unverified"].includes(s.rights.status))||
   (s.contentVersion!==null&&(typeof s.contentVersion!=="string"||!sha.test(s.contentVersion)))||
   (s.retrievedAt!==null&&(!text(s.retrievedAt,40)||!Number.isFinite(Date.parse(s.retrievedAt)))))fail();
  if(s.rights.licenceUrl!==null&&(!text(s.rights.licenceUrl,150)||!/^https:\/\/creativecommons\.org\/(?:licenses\/by\/(?:1\.0|2\.0|2\.5|3\.0|4\.0)|publicdomain\/zero\/1\.0)\/$/.test(s.rights.licenceUrl)))fail();
  if(s.rights.receiptRef!==null&&(!text(s.rights.receiptRef,250)||!paths.has(s.rights.receiptRef.split("#")[0]!)||s.rights.receiptRef.includes("..")))fail();
  if(s.identityStatus==="import_receipt_validated"&&(!s.contentVersion||!s.retrievedAt||s.rights.status!=="import_receipt_only"||!s.rights.licenceUrl||!s.rights.receiptRef))fail();
  if(s.identityStatus==="repository_metadata_unverified"&&(s.contentVersion!==null||s.retrievedAt!==null||s.rights.status!=="unverified"||s.rights.licenceUrl!==null||s.rights.receiptRef!==null))fail();
  sources.set(s.id,s);
 }
 const passages=new Map<string,CorpusPassage>();
 for(const p of x.passages){
  exact(p,["id","sourceId","sourceVersion","locator","text","sha256"]);
  const source=sources.get(p.sourceId);
  if(!text(p.id,150)||passages.has(p.id)||!source||!text(p.locator,1000)||p.sourceVersion!==source.contentVersion)fail();
  if(p.text===null){if(p.sha256!==null)fail()}else if(!text(p.text)||!p.sourceVersion||typeof p.sha256!=="string"||!sha.test(p.sha256)||source.rights.status!=="import_receipt_only")fail();
  passages.set(p.id,p);
 }
 const ids=new Set<string>();
 for(const c of x.claims){
  exact(c,["id","disease","assertion","sourceId","passageIds","context","status"]);
  exact(c.context,["model","notes","population","tissue","assay","intervention","outcome","timepoint","limitations","originRef"]);
  if(!text(c.id,150)||!/^HSI-C-(?:RA|SSC)-[A-Z0-9-]+$/.test(c.id)||ids.has(c.id)||!disease(c.disease)||!text(c.assertion,5000)||sources.get(c.sourceId)?.disease!==c.disease||!Array.isArray(c.passageIds)||!c.passageIds.length||c.passageIds.length>25||new Set(c.passageIds).size!==c.passageIds.length||c.status!=="unreviewed_candidate")fail();
  if(!c.id.startsWith(c.disease==="rheumatoid_arthritis"?"HSI-C-RA-":"HSI-C-SSC-")||c.passageIds.some(id=>passages.get(id)?.sourceId!==c.sourceId))fail();
  for(const k of ["model","notes","limitations","originRef"] as const)if(!text(c.context[k],5000))fail();
  for(const k of ["population","tissue","assay","intervention","outcome","timepoint"] as const)if(c.context[k]!==null&&!text(c.context[k],3000))fail();
  if(!paths.has(c.context.originRef.split("#")[0]!)||c.context.originRef.includes(".."))fail();ids.add(c.id);
 }
 if(new Set(x.sources.map(s=>s.doi)).size!==x.sources.length)fail();
 if(!rejectPhiPayload({textBlobs:[...x.sources.map(s=>s.title),...x.passages.map(p=>p.text??""),...x.claims.flatMap(c=>[c.assertion,...Object.values(c.context).filter((v):v is string=>typeof v==="string")])]}).ok)fail();
 return x;
}
/** Detects accidental/tampered content; a matching hash is not proof of origin, rights or truth. */
export async function verifyResearchEvidenceCorpus(value:unknown,digest:(text:string)=>Promise<string>):Promise<ResearchEvidenceCorpus>{
 const corpus=parseResearchEvidenceCorpus(value);const {version,...body}=corpus;
 if(await digest(canonicalEvidenceJson(body))!==version)fail();
 for(const p of corpus.passages)if(p.text!==null&&await digest(p.text)!==p.sha256)fail();
 return corpus;
}
export type ClaimReadiness={claimId:string;sourceId:string;disease:CorpusDisease;reasons:string[];releaseEligible:false};
export function assessWorkingEvidence(corpus:ResearchEvidenceCorpus):{
 schemaVersion:"hsi-working-evidence-readiness-1";corpusVersion:string;status:"blocked_pending_human_review";graphPromotable:false;
 counts:{sources:number;claims:number;textPassages:number;locatorOnly:number;eligibleClaims:0};claims:ClaimReadiness[];
}{
 parseResearchEvidenceCorpus(corpus);
 return {schemaVersion:"hsi-working-evidence-readiness-1",corpusVersion:corpus.version,status:"blocked_pending_human_review",graphPromotable:false,
  counts:{sources:corpus.sources.length,claims:corpus.claims.length,textPassages:corpus.passages.filter(p=>p.text!==null).length,locatorOnly:corpus.passages.filter(p=>p.text===null).length,eligibleClaims:0},
  claims:corpus.claims.map(c=>{
   const s=corpus.sources.find(s=>s.id===c.sourceId)!;
   const reasons=["human_rights_clearance_required","current_correction_check_required","independent_scientific_review_required"];
   if(s.identityStatus!=="import_receipt_validated")reasons.push("source_identity_verification_required");
   if(s.rights.status==="unverified")reasons.push("licence_evidence_missing");
   if(c.passageIds.some(id=>corpus.passages.find(p=>p.id===id)?.text===null))reasons.push("supporting_passage_not_available");
   for(const key of ["population","tissue","assay","intervention","outcome","timepoint"] as const)if(c.context[key]===null)reasons.push("context_"+key+"_not_extracted");
   return {claimId:c.id,sourceId:c.sourceId,disease:c.disease,reasons,releaseEligible:false};
  })};
}
