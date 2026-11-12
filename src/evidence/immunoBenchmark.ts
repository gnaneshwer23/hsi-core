/** HSI-BENCH-IMMUNO acceptance profile of the existing independent evaluation registry.
 * Public allocations are authoring slots, never scientific cases or gold labels.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {M7_BENCHMARK_CATEGORY_IDS} from "./scientificBenchmarkRegistry";
import type {ScientificBenchmarkCase} from "./scientificBenchmarkRegistry";
import type {ContextConflictClass} from "./contextConflictAudit";
import type {PassageLinkedContext} from "./passageLinkedContext";
import {validatePassageLinkedContext} from "./passageLinkedContext";
export const IMMUNO_PATH="evaluation/independent-evaluation/immuno-v1" as const;
export const IMMUNO_DIMENSIONS=["retrieval","mechanism_accuracy","context_preservation","conflict_classification","explanation","uncertainty","gap_quality","brief_usefulness"] as const;
export type ImmunoDimension=(typeof IMMUNO_DIMENSIONS)[number];
export const IMMUNO_ALLOCATIONS=[
 ["core","innate_adaptive_cells",15],["core","activation_tolerance_memory",15],["core","cytokines_resolution",10],["core","mechanism_context",10],
 ["disease","ssc",6],["disease","ra",5],["disease","sle",5],["disease","ibd",3],["disease","ms",3],["disease","asthma",3],["disease","atopic_dermatitis",3],["disease","atherosclerosis",2],
 ["cross_domain","gut_immune",5],["cross_domain","neuroimmune",5],["cross_domain","metabolic_immune",5],["cross_domain","immune_fibrosis",5],
 ["governance","rights_retraction",4],["governance","absent_evidence",3],["governance","instruction_injection",3],["governance","provenance_fabrication",3],["governance","clinical_phi_boundary",4],["governance","attempted_promotion",3],
] as const;
export type ImmunoLayer=(typeof IMMUNO_ALLOCATIONS)[number][0];
export type ImmunoDomain=(typeof IMMUNO_ALLOCATIONS)[number][1];
export const benchmarkDigest=(value:unknown)=>createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
const hashPattern=/^[a-f0-9]{64}$/;
const nonempty=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0&&v.length<=4000;
function strings(a:unknown):a is string[]{return Array.isArray(a)&&a.length>0&&a.every(nonempty)&&new Set(a).size===a.length}
export function buildImmunoProtocol(){
 const body={schemaVersion:"hsi-bench-immuno-protocol-1",benchmark:"HSI-BENCH-IMMUNO",version:"1.0",canonicalPath:IMMUNO_PATH,
  aliases:["R2","M7","evaluation/scientific_benchmark_v1","evaluation/independent-evaluation"],
  allocationStatus:"authoring_slots_only",scientificAcceptance:"BLOCKED",adjudicatedCaseCount:0,finalCaseCount:120,
  developmentSet:"separately_authored_not_counted_in_120",goldLocation:"external_access_controlled_vault_only",numericFloors:null,
  configurations:["deterministic_current_baseline","single_verifier","dual_verifier"],dimensions:IMMUNO_DIMENSIONS,
  slots:IMMUNO_ALLOCATIONS.flatMap(([layer,domain,count])=>Array.from({length:count},(_,n)=>({slotId:`IMMUNO-${domain}-${String(n+1).padStart(2,"0")}`,layer,domain,status:"awaiting_authoring_and_two_experts"}))),
  safetyGate:"zero_critical_safety_isolation_promotion_failures",sourceGate:"all_source_actions_permitted_all_material_claims_traceable",
  scientificApproval:false,graphPromotable:false};
 return {...body,protocolHash:benchmarkDigest(body)};
}
/** Same registry identity/task fields, enriched with private source/context and split identity. */
export type ImmunoCase=Pick<ScientificBenchmarkCase,"caseId"|"partition"|"researchDomain"|"researchQuestion"|"taskType"|"categoryId">&{
 slotId:string|null;layer:ImmunoLayer;domain:ImmunoDomain;risk:"high"|"standard";
 biologicalClaim:string;estimand:string;permittedAnswerBoundaries:string[];
 studyFamilies:string[];claimFamilies:string[];questionFamilies:string[];
 aliases:{namespace:"R2"|"M7"|"independent_evaluation";id:string}[];
 evidence:PassageLinkedContext[];
 /** Authorized scanner resolves this only in the vault, never a public asset/model prompt. */
 gold:{vaultRef:string;sha256:string};
};
export type PrivateGold={commitmentNonce:string;conflict:ContextConflictClass;answerability:"answer"|"abstain";rationale:string;
 expectedBehavior:string[];provenanceCriteria:string[];safetyCriteria:string[];
 /** Cases such as absent evidence still need a recorded search/clearance decision. */
 evidenceDispositionReceipt:string;
 assessments:[{receiptId:string;reviewerRef:string;expertise:string[];conflictsDeclared:true;labelHash:string},{receiptId:string;reviewerRef:string;expertise:string[];conflictsDeclared:true;labelHash:string}];
 adjudication:{receiptId:string;reviewerRef:string;decision:"resolved"|"agreed";rationale:string};
};
export const CONFLICT_CLASSES:readonly ContextConflictClass[]=["consistent","potential_conflict","context_dependent","methodological_difference","insufficient_evidence"];
export function validateImmunoCase(c:ImmunoCase){
 if(!M7_BENCHMARK_CATEGORY_IDS.includes(c.categoryId)||!["retrieval","extraction","entity_resolution","mechanism","contradiction","opposing_retrieval","hypothesis","experiment","translational_failure","precision","e2e_investigation","abstention"].includes(c.taskType)||![c.caseId,c.researchQuestion,c.biologicalClaim,c.estimand,c.researchDomain,c.gold?.vaultRef].every(nonempty)||!["development","held_out"].includes(c.partition)||!["high","standard"].includes(c.risk)||!hashPattern.test(c.gold.sha256)||!strings(c.permittedAnswerBoundaries)||![c.studyFamilies,c.claimFamilies,c.questionFamilies].every(strings)||!Array.isArray(c.aliases)||new Set(c.aliases.map(a=>a.namespace+":"+a.id)).size!==c.aliases.length||c.aliases.some(a=>!["R2","M7","independent_evaluation"].includes(a.namespace)||!nonempty(a.id)))throw Error("Incomplete canonical benchmark case");
 if(!IMMUNO_ALLOCATIONS.some(([layer,domain])=>layer===c.layer&&domain===c.domain)||!Array.isArray(c.evidence)||c.evidence.length>16)throw Error("Invalid immunology case allocation/evidence");
 if(c.partition==="held_out"&&!buildImmunoProtocol().slots.some(s=>s.slotId===c.slotId&&s.layer===c.layer&&s.domain===c.domain)||c.partition==="development"&&c.slotId!==null)throw Error("Development and final allocation must remain separate");
 c.evidence.forEach(validatePassageLinkedContext);
}
export function validatePrivateGold(g:PrivateGold){
 if(!g||!hashPattern.test(g.commitmentNonce)||!CONFLICT_CLASSES.includes(g.conflict)||!["answer","abstain"].includes(g.answerability)||![g.rationale,g.evidenceDispositionReceipt,g.adjudication?.rationale,g.adjudication?.receiptId,g.adjudication?.reviewerRef].every(nonempty)||![g.expectedBehavior,g.provenanceCriteria,g.safetyCriteria].every(strings)||!Array.isArray(g.assessments)||g.assessments.length!==2||!g.assessments.every(a=>[a.receiptId,a.reviewerRef].every(nonempty)&&strings(a.expertise)&&a.conflictsDeclared===true&&hashPattern.test(a.labelHash))||new Set([...g.assessments.map(a=>a.receiptId),g.adjudication.receiptId]).size!==3||g.assessments[0]!.reviewerRef===g.assessments[1]!.reviewerRef||g.assessments.some(a=>a.reviewerRef===g.adjudication.reviewerRef)||!["agreed","resolved"].includes(g.adjudication.decision))throw Error("Two independent expert assessments and independent adjudication required");
}
const normalize=(s:string)=>s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
export function nearDuplicateQuestion(a:string,b:string){const x=new Set(normalize(a).split(" ")),y=new Set(normalize(b).split(" "));const intersection=[...x].filter(v=>y.has(v)).length;return normalize(a)===normalize(b)||Math.min(x.size,y.size)>=5&&intersection/(x.size+y.size-intersection)>=0.8}
export function assertImmunoSplits(cases:readonly ImmunoCase[]){
 if(new Set(cases.map(c=>c.caseId)).size!==cases.length)throw Error("Duplicate canonical case ID");
 const aliases=new Set<string>();for(const c of cases){validateImmunoCase(c);for(const a of c.aliases){const key=a.namespace+":"+a.id;if(aliases.has(key))throw Error("Alias maps to multiple canonical cases");aliases.add(key)}}
 for(let a=0;a<cases.length;a++)for(let b=a+1;b<cases.length;b++){const x=cases[a]!,y=cases[b]!;
  if(x.partition!==y.partition&&(["studyFamilies","claimFamilies","questionFamilies"] as const).some(k=>x[k].some(v=>y[k].includes(v)))||x.partition!==y.partition&&nearDuplicateQuestion(x.researchQuestion,y.researchQuestion))throw Error("Cross-partition study/claim/question-family contamination");
 }
}
export function contaminationFindings(holdout:readonly ImmunoCase[],exposures:readonly {surface:"public_asset"|"retrieval_index"|"agent_prompt"|"example"|"tuning";id:string;text:string}[],goldFingerprints:readonly {caseId:string;phrase:string}[]){
 const findings:{caseId:string;surface:string;exposureId:string;kind:"question"|"gold"}[]=[];
 for(const g of goldFingerprints)if(!holdout.some(c=>c.caseId===g.caseId)||normalize(g.phrase).length<32)throw Error("Substantial vault-derived gold fingerprints required");
 for(const e of exposures){for(const c of holdout)if(normalize(e.text).includes(normalize(c.researchQuestion)))findings.push({caseId:c.caseId,surface:e.surface,exposureId:e.id,kind:"question"});for(const g of goldFingerprints)if(normalize(e.text).includes(normalize(g.phrase)))findings.push({caseId:g.caseId,surface:e.surface,exposureId:e.id,kind:"gold"});}
 return findings;
}
export type BenchmarkAuthority={
 /** Independently verifies active identity, expertise, conflicts, blind assessment and receipt binding to case + gold. */
 expertReview:(c:Readonly<ImmunoCase>,g:Readonly<PrivateGold>)=>Promise<boolean>;
 /** Verify current actions/retraction/version for every passage, or absence/denial disposition for governance cases. */
 sourceUse:(c:Readonly<ImmunoCase>,g:Readonly<PrivateGold>)=>Promise<boolean>;
};
/** Lock does not run providers or authorize evaluation. Durable signing/storage remain external authority responsibilities. */
export async function prepareImmunoFreeze(input:{cases:readonly ImmunoCase[];protocolHash:string;rubricHash:string;thresholdPolicyHash:string;disputeRuleHash:string;contaminationReceiptHash:string},deps:BenchmarkAuthority&{loadGold:(c:Readonly<ImmunoCase>)=>Promise<PrivateGold>;approveProtocol:(binding:Readonly<Record<string,string>>)=>Promise<boolean>}){
 input=structuredClone(input);assertImmunoSplits(input.cases);
 const final=input.cases.filter(c=>c.partition==="held_out"),dev=input.cases.filter(c=>c.partition==="development");
 if(final.length!==120||!dev.length||new Set(final.map(c=>c.slotId)).size!==120)throw Error("Exactly 120 allocated final cases plus a separate development set required");
 if(input.protocolHash!==buildImmunoProtocol().protocolHash||![input.rubricHash,input.thresholdPolicyHash,input.disputeRuleHash,input.contaminationReceiptHash].every(h=>hashPattern.test(h)))throw Error("Protocol/rubric/threshold/dispute/contamination locks required");
 const inventoryHash=benchmarkDigest(input.cases.map(c=>({caseId:c.caseId,caseHash:benchmarkDigest(c)})).sort((a,b)=>a.caseId.localeCompare(b.caseId)));
 const binding={protocolHash:input.protocolHash,inventoryHash,rubricHash:input.rubricHash,thresholdPolicyHash:input.thresholdPolicyHash,disputeRuleHash:input.disputeRuleHash,contaminationReceiptHash:input.contaminationReceiptHash};
 if(await deps.approveProtocol(Object.freeze({...binding}))!==true)throw Error("Named independent scientific approval required before freeze");
 // Validate the entire batch before granting a freeze candidate. This service dispatches no model calls.
 for(const c of input.cases){const gold=structuredClone(await deps.loadGold(structuredClone(c)));validatePrivateGold(gold);if(benchmarkDigest(gold)!==c.gold.sha256||await deps.expertReview(structuredClone(c),structuredClone(gold))!==true||await deps.sourceUse(structuredClone(c),structuredClone(gold))!==true)throw Error("Untrusted expert/gold/source clearance receipt");}
 const body={schemaVersion:"hsi-immuno-freeze-candidate-1",...binding,caseCommitments:input.cases.map(c=>({caseId:c.caseId,partition:c.partition,caseHash:benchmarkDigest(c),goldHash:c.gold.sha256})),finalCaseCount:120,developmentCaseCount:dev.length,scientificApproval:false,graphPromotable:false};
 return {...body,freezeHash:benchmarkDigest(body)};
}
/** Structured leakage tripwire, supplemented by a vault-derived fingerprint scan of every exposure inventory. */
export function assertNoStructuredBenchmarkGold(value:unknown):void{
 if(!value||typeof value!=="object")return;
 for(const [key,v] of Object.entries(value)){
  if(["goldRationale","privateGold","acceptableAnswer","adjudicatedLabel"].includes(key)&&v!==null&&v!==""&&!(Array.isArray(v)&&!v.length))throw Error("Non-null private gold in public artifact");
  if(key==="expertReferenceAssessment"&&v&&typeof v==="object"&&"payload" in v&&v.payload!==null)throw Error("Non-null expert reference in public artifact");
  assertNoStructuredBenchmarkGold(v);
 }
}

/** Explicit legacy intake: preserve question and alias, require new reviewed family/source/gold enrichment.
 * No legacy null labels, reviewer slots or old scorecard values become gold automatically.
 */
export function adaptLegacyImmunoCase(legacy:
 {namespace:"R2";row:import("../researchReadiness").QuestionDesignBank["cases"][number]}|
 {namespace:"M7";row:ScientificBenchmarkCase}|
 {namespace:"independent_evaluation";row:import("./independentEvaluationSuites").WalkthroughQuestion},
 enrichment:Omit<ImmunoCase,"researchQuestion"|"aliases">&{aliases?:ImmunoCase["aliases"]}):ImmunoCase{
 const identity=legacy.namespace==="R2"?{id:legacy.row.id,question:legacy.row.question}:legacy.namespace==="M7"?{id:legacy.row.caseId,question:legacy.row.researchQuestion}:{id:legacy.row.questionId,question:legacy.row.question};
 const result:ImmunoCase={...structuredClone(enrichment),researchQuestion:identity.question,aliases:[...(enrichment.aliases??[]),{namespace:legacy.namespace,id:identity.id}]};validateImmunoCase(result);return result;
}
