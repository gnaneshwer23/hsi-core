/** Draft indication protocols and research-design context only. No patient intake or scientific approval. */
import {rejectPhiPayload} from "./cdsPhiBoundary";
import {validateHsiOntologyIdentifier} from "./hsiOntologyRegistry";
import {CRITERION_STATES,type CriterionState} from "./trialsCriteriaMvp";
export const RESEARCH_COVERAGE_VERSION="hsi-research-coverage-1" as const;
export type CoverageVariable={id:string;label:string;kind:"lab"|"lifestyle"|"medication_context";identifier:{system:"LOINC";value:string}|null;mapping:"unreviewed_hint"|"not_mapped";unit:string|null;purpose:"protocol_requirement_not_finding"};
export type CoverageProtocol={id:string;label:string;axis:"gut"|"brain"|"metabolic";disease:{label:string;mondoId:string;mapping:"unreviewed_hint"};question:string;requiredSample:string;variables:CoverageVariable[];backgroundEdgeIds:string[];registryConditionTerms:string[];limitations:string[]};
export type BackgroundReference={seedEdgeId:string;subjectId:string;subjectLabel:string;predicate:string;objectId:string;objectLabel:string;pmid:string|null;citationLabel:string|null;sourcePath:string;sourceVersion:string;contextNote:string;relation:"background_context_only";sourceStatus:"repository_locator_unverified";rights:"unverified";scientificReview:"unreviewed";supportsIndication:false;passageText:null};
export type CoveragePack=CoverageProtocol&{status:"protocol_draft";scientificReview:"unreviewed";releaseEligible:false;graphPromotable:false;background:BackgroundReference[]};
export type RegistryRecord={nctId:string;title:string;conditions:string[];status:"RECRUITING"|"NOT_YET_RECRUITING"|"ACTIVE_NOT_RECRUITING"|"ENROLLING_BY_INVITATION"|"COMPLETED"|"TERMINATED"|"WITHDRAWN"|"SUSPENDED"|"UNKNOWN";lastUpdateDate:string;url:string};
export type RegistrySnapshot={schemaVersion:"hsi-public-registry-snapshot-1";version:string;origin:"operator_supplied_unverified";scope:"public_registry_metadata";containsPhi:false;retrievedAt:string;records:RegistryRecord[]};
export type ResearchCoverageCatalogue={schemaVersion:typeof RESEARCH_COVERAGE_VERSION;version:string;status:"protocol_drafts";containsPhi:false;clinicalAdvice:false;graphPromotable:false;releaseEligible:false;inputs:{path:string;sha256:string}[];packs:CoveragePack[];registry:RegistrySnapshot|null};
export const coverageCanonical=(value:unknown):string=>JSON.stringify(value,(_key,row:unknown)=>row&&typeof row==="object"&&!Array.isArray(row)?Object.fromEntries(Object.entries(row).sort(([a],[b])=>a<b?-1:a>b?1:0)):row);
export const RESEARCH_UNIT_TOKENS=["%","mmol/mol","mg/dL","mmol/L","mg/L","ug/g","ng/L","1"] as const;
const researchUnit=(value:unknown)=>value===null||(typeof value==="string"&&(RESEARCH_UNIT_TOKENS as readonly string[]).includes(value));
const sha=/^[a-f0-9]{64}$/,id=/^[a-z][a-z0-9-]{1,79}$/;
function exact(x:unknown,keys:string[]){if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!==[...keys].sort().join(","))throw Error("Invalid research coverage fields")}
function text(x:unknown,max=2000):x is string{return typeof x==="string"&&!!x.trim()&&x.length<=max}
function unique(xs:string[]){return new Set(xs).size===xs.length}
function strings(x:unknown,max:number):x is string[]{return Array.isArray(x)&&x.length<=max&&unique(x)&&x.every(s=>text(s))}
function nonIdentifying(values:string[]){if(!rejectPhiPayload({textBlobs:values}).ok)throw Error("Non-identifying research metadata required")}
export function validateCoverageProtocol(value:unknown):asserts value is CoverageProtocol{
 exact(value,["id","label","axis","disease","question","requiredSample","variables","backgroundEdgeIds","registryConditionTerms","limitations"]);const p=value as CoverageProtocol;
 exact(p.disease,["label","mondoId","mapping"]);
 if(!id.test(p.id)||!text(p.label,120)||!["gut","brain","metabolic"].includes(p.axis)||!text(p.disease.label,120)||p.disease.mapping!=="unreviewed_hint"||!text(p.question,500)||!text(p.requiredSample,200)||!Array.isArray(p.variables)||!p.variables.length||p.variables.length>12||!unique(p.variables.map(v=>v.id))||!strings(p.backgroundEdgeIds,10)||p.backgroundEdgeIds.some(x=>!/^HSI-E-[A-Z0-9-]+$/.test(x))||!strings(p.registryConditionTerms,5)||!p.registryConditionTerms.length||!strings(p.limitations,10)||!p.limitations.length)throw Error("Invalid bounded coverage protocol");
 validateHsiOntologyIdentifier("MONDO",p.disease.mondoId);
 for(const v of p.variables){exact(v,["id","label","kind","identifier","mapping","unit","purpose"]);if(!id.test(v.id)||!text(v.label,150)||!["lab","lifestyle","medication_context"].includes(v.kind)||v.purpose!=="protocol_requirement_not_finding"||!researchUnit(v.unit))throw Error("Invalid protocol variable");
  if(v.identifier!==null){exact(v.identifier,["system","value"]);if(v.identifier.system!=="LOINC"||v.mapping!=="unreviewed_hint"||v.kind!=="lab")throw Error("Invalid ontology hint");validateHsiOntologyIdentifier("LOINC",v.identifier.value)}else if(v.mapping!=="not_mapped")throw Error("Missing mapping must remain explicit");
  if(v.kind!=="lab"&&v.unit!==null)throw Error("No invented lifestyle or medication units");
 }
 nonIdentifying([p.label,p.question,p.requiredSample,p.disease.label,...p.variables.map(v=>v.label),...p.registryConditionTerms,...p.limitations]);
}
export function parseResearchCoverageCatalogue(value:unknown):ResearchCoverageCatalogue{
 exact(value,["schemaVersion","version","status","containsPhi","clinicalAdvice","graphPromotable","releaseEligible","inputs","packs","registry"]);const c=value as ResearchCoverageCatalogue;
 if(c.schemaVersion!==RESEARCH_COVERAGE_VERSION||!sha.test(c.version)||c.status!=="protocol_drafts"||c.containsPhi!==false||c.clinicalAdvice!==false||c.graphPromotable!==false||c.releaseEligible!==false||!Array.isArray(c.inputs)||!c.inputs.length||c.inputs.length>10||!unique(c.inputs.map(i=>i.path))||!Array.isArray(c.packs)||!c.packs.length||c.packs.length>20||!unique(c.packs.map(p=>p.id)))throw Error("Invalid research coverage catalogue");
 for(const i of c.inputs){exact(i,["path","sha256"]);if(!text(i.path,200)||!sha.test(i.sha256)||!(/^(?:research\/coverage\/[a-zA-Z0-9.-]+\.json|src\/seed\/[a-zA-Z0-9]+\.ts)$/).test(i.path)||i.path.includes(".."))throw Error("Invalid coverage origin")}
 for(const p of c.packs){exact(p,["id","label","axis","disease","question","requiredSample","variables","backgroundEdgeIds","registryConditionTerms","limitations","status","scientificReview","releaseEligible","graphPromotable","background"]);
  const {status,scientificReview,releaseEligible,graphPromotable,background,...protocol}=p;validateCoverageProtocol(protocol);
  if(status!=="protocol_draft"||scientificReview!=="unreviewed"||releaseEligible!==false||graphPromotable!==false||!Array.isArray(background)||background.length!==p.backgroundEdgeIds.length||!unique(background.map(b=>b.seedEdgeId)))throw Error("Draft protocol cannot grant scientific authority");
  for(const b of background){exact(b,["seedEdgeId","subjectId","subjectLabel","predicate","objectId","objectLabel","pmid","citationLabel","sourcePath","sourceVersion","contextNote","relation","sourceStatus","rights","scientificReview","supportsIndication","passageText"]);
   if(!p.backgroundEdgeIds.includes(b.seedEdgeId)||![b.subjectId,b.subjectLabel,b.predicate,b.objectId,b.objectLabel].every(x=>text(x,200))||(b.pmid!==null&&!/^[1-9][0-9]{0,8}$/.test(b.pmid))||(b.citationLabel!==null&&!text(b.citationLabel,2000))||c.inputs.find(i=>i.path===b.sourcePath)?.sha256!==b.sourceVersion||!text(b.contextNote,3000)||b.relation!=="background_context_only"||b.sourceStatus!=="repository_locator_unverified"||b.rights!=="unverified"||b.scientificReview!=="unreviewed"||b.supportsIndication!==false||b.passageText!==null)throw Error("Invalid source-separated background reference");
   nonIdentifying([b.subjectLabel,b.objectLabel,b.citationLabel??"",b.contextNote]);
  }
 }
 if(c.registry!==null)parseRegistrySnapshot(c.registry);
 return c;
}
export type Digest=(text:string)=>Promise<string>;
export async function verifyResearchCoverageCatalogue(value:unknown,digest:Digest){
 if(coverageCanonical(value).length>1_000_000)throw Error("Coverage catalogue exceeds budget");const c=parseResearchCoverageCatalogue(value),{version,...body}=c;
 if(await digest(coverageCanonical(body))!==version)throw Error("Coverage catalogue integrity failure");
 if(c.registry)await verifyRegistrySnapshot(c.registry,digest);return c;
}
export function coverageReadiness(pack:CoveragePack){
 return {packId:pack.id,status:"blocked_pending_human_review",releaseEligible:false,scientificReview:"unreviewed",graphPromotable:false,
  sourcePointers:pack.background.filter(b=>b.pmid!==null).length,directSupportingPassages:0,approvedClaims:0,
  gates:["first_pack_independent_scientific_acceptance","protocol_and_indication_mapping_review","disease_specific_source_identity_and_rights","verified_passages_and_study_context","independent_scientific_review","governed_graph_scope_and_permissions","reproducible_brief_and_independent_review","product_contract_acceptance"].map(id=>({id,state:"pending",reviewer:null,decisionId:null}))};
}
/** Describes availability of cohort/design variables; numeric measurements or patient identifiers are not accepted. */
export type ResearchDesignProfile={schemaVersion:"hsi-research-design-profile-1";dataClass:"research_design_metadata";species:"human"|"mouse"|"unknown";sampleContext:"matched"|"different"|"unknown";timepoint:"specified"|"unknown";variables:{variableId:string;availability:"available"|"missing"|"ambiguous";unit:string|null;methodSpecified:boolean}[]};
export function assessResearchDesign(pack:CoveragePack,value:unknown){
 exact(value,["schemaVersion","dataClass","species","sampleContext","timepoint","variables"]);const p=value as ResearchDesignProfile;
 if(p.schemaVersion!=="hsi-research-design-profile-1"||p.dataClass!=="research_design_metadata"||!["human","mouse","unknown"].includes(p.species)||!["matched","different","unknown"].includes(p.sampleContext)||!["specified","unknown"].includes(p.timepoint)||!Array.isArray(p.variables)||p.variables.length>12||!unique(p.variables.map(v=>v.variableId)))throw Error("Research-design metadata only; no patient records or values");
 for(const v of p.variables){exact(v,["variableId","availability","unit","methodSpecified"]);if(!pack.variables.some(d=>d.id===v.variableId)||!["available","missing","ambiguous"].includes(v.availability)||typeof v.methodSpecified!=="boolean"||!researchUnit(v.unit))throw Error("Unknown or invalid design variable")}
 const assessments=pack.variables.map(d=>{
  const v=p.variables.find(v=>v.variableId===d.id);let state:CriterionState="unknown",reason="Availability not recorded";
  if(v?.availability==="ambiguous"){state="ambiguous";reason="Research collection metadata need clarification"}
  else if(v?.availability==="available"){
   if(d.kind==="lab"&&d.unit===null){state="requires_investigator_review";reason="Laboratory unit and assay mapping are not specified for this protocol"}
   else if(d.unit!==v.unit){state="ambiguous";reason="Unit does not match this research variable definition; no conversion is inferred"}
   else if(!v.methodSpecified||p.timepoint!=="specified"){state="requires_investigator_review";reason="Collection method or timepoint is not specified"}
   else {state="satisfied";reason="Design metadata are complete; no biological or clinical interpretation is established"}
  }
  return {variableId:d.id,state,reason};
 });
 if(assessments.some(a=>!CRITERION_STATES.includes(a.state)))throw Error("Unknown criterion state");
 return {schemaVersion:"hsi-research-design-assessment-1",packId:pack.id,assessmentScope:"metadata_completeness_only",assessments,contextStatus:p.species!=="human"||p.sampleContext!=="matched"?"requires_investigator_review":"specified_human_sample",recordedVariables:assessments.filter(a=>a.state==="satisfied").length,totalVariables:pack.variables.length,clinicalAdvice:false,patientEligibilityAssessed:false,releaseEligible:false};
}
function dateOnly(value:string){return /^\d{4}-\d\d-\d\d$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value}
function instant(value:unknown):value is string{return typeof value==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value)&&Number.isFinite(Date.parse(value))&&(new Date(value).toISOString()===value||new Date(value).toISOString().replace(".000Z","Z")===value)&&dateOnly(value.slice(0,10))}
export function parseRegistrySnapshot(value:unknown):RegistrySnapshot{
 exact(value,["schemaVersion","version","origin","scope","containsPhi","retrievedAt","records"]);const s=value as RegistrySnapshot;
 if(s.schemaVersion!=="hsi-public-registry-snapshot-1"||!sha.test(s.version)||s.origin!=="operator_supplied_unverified"||s.scope!=="public_registry_metadata"||s.containsPhi!==false||!instant(s.retrievedAt)||!Array.isArray(s.records)||s.records.length>50||!unique(s.records.map(r=>r.nctId)))throw Error("Invalid bounded public registry snapshot");
 for(const r of s.records){exact(r,["nctId","title","conditions","status","lastUpdateDate","url"]);validateHsiOntologyIdentifier("NCT",r.nctId);
  if(!text(r.title,1000)||!strings(r.conditions,20)||!r.conditions.length||!["RECRUITING","NOT_YET_RECRUITING","ACTIVE_NOT_RECRUITING","ENROLLING_BY_INVITATION","COMPLETED","TERMINATED","WITHDRAWN","SUSPENDED","UNKNOWN"].includes(r.status)||!dateOnly(r.lastUpdateDate)||Date.parse(r.lastUpdateDate)>Date.parse(s.retrievedAt)||r.url!=="https://clinicaltrials.gov/study/"+r.nctId)throw Error("Invalid public registry record");
  nonIdentifying([r.title,...r.conditions]);
 }
 return s;
}
export async function verifyRegistrySnapshot(value:unknown,digest:Digest){const s=parseRegistrySnapshot(value),{version,...body}=s;if(await digest(coverageCanonical(body))!==version)throw Error("Registry snapshot integrity failure");return s}
const term=(s:string)=>s.normalize("NFKC").replaceAll("’","'").trim().replace(/\s+/g," ").toLowerCase();
export async function assessRegistryTopicRelevance(pack:CoveragePack,snapshot:RegistrySnapshot|null,asOf:string,digest:Digest){
 if(!instant(asOf))throw Error("Explicit UTC assessment instant required");
 if(snapshot===null)return {status:"not_imported",asOf,snapshotVersion:null,results:[],liveRegistryQueried:false,patientEligibilityAssessed:false,confirmedEligible:false};
 const s=await verifyRegistrySnapshot(snapshot,digest);if(Date.parse(s.retrievedAt)>Date.parse(asOf))throw Error("Future registry retrieval cannot be assessed");
 const stale=Date.parse(asOf)-Date.parse(s.retrievedAt)>30*86400000;
 return {status:"supplied_snapshot_only",asOf,snapshotVersion:s.version,results:s.records.map(r=>({nctId:r.nctId,title:r.title,url:r.url,reportedStatus:r.status,conditionTermOverlap:r.conditions.some(c=>pack.registryConditionTerms.some(t=>term(t)===term(c))),snapshotStale:stale,recordUpdateOld:Date.parse(asOf)-Date.parse(r.lastUpdateDate)>30*86400000,criterionState:"requires_investigator_review" as const,confirmedEligible:false,eligibilityAssessed:false})),liveRegistryQueried:false,patientEligibilityAssessed:false,confirmedEligible:false};
}
export async function exportCoverageProtocol(catalogue:ResearchCoverageCatalogue,packId:string,digest:Digest){
 const c=await verifyResearchCoverageCatalogue(catalogue,digest),p=c.packs.find(p=>p.id===packId);if(!p)throw Error("Unknown research protocol");
 const body={schemaVersion:"hsi-draft-coverage-export-1",catalogueVersion:c.version,inputHashes:c.inputs,protocol:p,readiness:coverageReadiness(p),scope:"research_protocol_only",containsPhi:false,clinicalAdvice:false,graphPublicationApproved:false,notForScientificClaim:true};
 const content=JSON.stringify(JSON.parse(coverageCanonical(body)),null,2)+"\n";return {content,sha256:await digest(content)};
}

/** Explicit operator metadata import; hashing never asserts retrieval authenticity, rights or investigator approval. */
export async function prepareRegistrySnapshot(value:unknown,digest:Digest):Promise<RegistrySnapshot>{
 exact(value,["schemaVersion","containsPhi","retrievedAt","records"]);const input=value as {schemaVersion:string;containsPhi:boolean;retrievedAt:string;records:RegistryRecord[]};
 if(input.schemaVersion!=="hsi-public-registry-input-1"||input.containsPhi!==false)throw Error("Public non-identifying registry metadata only");
 const body={schemaVersion:"hsi-public-registry-snapshot-1" as const,origin:"operator_supplied_unverified" as const,scope:"public_registry_metadata" as const,containsPhi:false as const,retrievedAt:input.retrievedAt,records:structuredClone(input.records)};
 const result={...body,version:await digest(coverageCanonical(body))};return parseRegistrySnapshot(result);
}
