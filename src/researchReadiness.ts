/** Design-stage evaluation intake. Question coverage is not scientific validation. */
import {canonicalGraphContext} from "./investigationGraphContext";
import {ASSISTANCE_METHOD,PROMPT_VERSION,SOURCE_SELECTION_INSTRUCTIONS} from "./scientificEvaluation";
export const QUESTION_DESIGN_CATEGORIES=["mechanism_reasoning","biomarker_context","evidence_retrieval","contradiction_detection","trial_relevance","safety_boundaries","entity_resolution","uncertainty_communication"] as const;
type Category=typeof QUESTION_DESIGN_CATEGORIES[number];
type DesignCase={id:string;category:Category;indication:"rheumatoid_arthritis"|"systemic_sclerosis"|"research_boundary";question:string;required_context:string[];expected_evidence_ids:string[];source_packet_hash:null;partition:"unassigned";scientific_label_status:"awaiting_sme";acceptable_answer:null;expected_outcome:null;annotator:null;rationale:null};
export type QuestionDesignBank={schemaVersion:"hsi-question-design-bank-1";id:string;version:string;purpose:"sme_design_only";containsPhi:false;scientificGroundTruthEstablished:false;cases:DesignCase[]};
const exact=(x:unknown,keys:string[])=>{if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join()!==keys.sort().join())throw Error("Invalid question-design fields")};
const context=["species","tissue","disease_stage","cell_state","assay","dose","timepoint","cohort"];
export function parseQuestionDesignBank(value:unknown):QuestionDesignBank{
 exact(value,["schemaVersion","id","version","purpose","containsPhi","scientificGroundTruthEstablished","cases"]);const bank=value as QuestionDesignBank;
 if(bank.schemaVersion!=="hsi-question-design-bank-1"||bank.id!=="hsi-translational-immunology-question-design"||!/^\d+\.\d+\.\d+$/.test(bank.version)||bank.purpose!=="sme_design_only"||bank.containsPhi!==false||bank.scientificGroundTruthEstablished!==false||!Array.isArray(bank.cases)||bank.cases.length!==50)throw Error("A 50-case, unlabelled research design bank is required");
 const ids=new Set<string>(),questions=new Set<string>();
 for(const c of bank.cases){
  exact(c,["id","category","indication","question","required_context","expected_evidence_ids","source_packet_hash","partition","scientific_label_status","acceptable_answer","expected_outcome","annotator","rationale"]);
  if(!/^HSI-QD-\d{3}$/.test(c.id)||ids.has(c.id)||!QUESTION_DESIGN_CATEGORIES.includes(c.category)||!["rheumatoid_arthritis","systemic_sclerosis","research_boundary"].includes(c.indication)||typeof c.question!=="string"||!c.question.trim()||c.question.length>500||questions.has(c.question.toLowerCase().trim())||!Array.isArray(c.required_context)||[...c.required_context].sort().join()!==[...context].sort().join()||!Array.isArray(c.expected_evidence_ids)||c.expected_evidence_ids.length||c.source_packet_hash!==null||c.partition!=="unassigned"||c.scientific_label_status!=="awaiting_sme"||c.acceptable_answer!==null||c.expected_outcome!==null||c.annotator!==null||c.rationale!==null)throw Error("Invented labels, duplicate case or invalid question-design scope");
  ids.add(c.id);questions.add(c.question.toLowerCase().trim());
 }
 if(QUESTION_DESIGN_CATEGORIES.some(category=>!bank.cases.some(c=>c.category===category)))throw Error("Question-design category missing");
 return structuredClone(bank);
}
export async function prepareResearchReadiness(value:unknown,digest:(text:string)=>Promise<string>){
 const bank=parseQuestionDesignBank(value),bankHash=await digest(canonicalGraphContext(bank)),rows=await Promise.all(bank.cases.map(async c=>({caseId:c.id,caseHash:await digest(canonicalGraphContext(c)),sourcePacketHash:null,expectedEvidenceIds:[],acceptableAnswer:null,expectedOutcome:null,annotator:null,rationale:null})));
 const packets=["a","b"].map(slot=>({schemaVersion:"hsi-question-design-label-packet-1",bankHash,annotatorSlot:slot,status:"awaiting_sme",authorityVerified:false,rows:structuredClone(rows)}));
 return {
  packets,
  readiness:{schemaVersion:"hsi-research-readiness-1",bankHash,version:bank.version,totalCases:bank.cases.length,categoryCoverage:QUESTION_DESIGN_CATEGORIES.map(category=>({category,cases:bank.cases.filter(c=>c.category===category).length})),sourcePacketsBound:0,independentlyLabelledCases:0,heldOutPartitionFrozen:false,scientificMetrics:null,thresholdsApproved:false,scientificValidityEstablished:false,modelActivationAllowed:false,blockers:["Assign rights-cleared versioned source packets, including opposing evidence and context, to each case.","Obtain two independent SME annotations and adjudicate disagreement through accountable review.","Freeze separate development and held-out partitions and define leakage controls before candidate tuning.","Agree scientific metrics and release thresholds; measure baseline and candidate on identical frozen inputs.","Verify reviewer authority, source access, operational ownership and live two-account acceptance."]},
  registry:{schemaVersion:"hsi-research-method-registry-1",methods:[{id:"deterministic-extractive-baseline",version:ASSISTANCE_METHOD,promptVersion:PROMPT_VERSION,promptHash:await digest(SOURCE_SELECTION_INSTRUCTIONS),provider:null,modelVersion:null,temperature:null,externalModelCalled:false,allowedTools:[],activationScope:"existing_source_selection_only",evaluationReference:"evaluation/phase-e/engineering-cases.json",scientificAccuracy:null,latencyP95Ms:null,costPerInvestigationUsd:null}],candidateModel:{status:"not_configured",provider:null,modelVersion:null,promptVersion:null,pricingSnapshot:null,budgetOwner:null,costBudgetUsd:null,latencyBudgetMs:null,activationAllowed:false}}
 };
}
