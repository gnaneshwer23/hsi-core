/**
 * Phase 9.4: cross-immunology scientific validation benchmark specification.
 * Cases are expert-review prompts, NOT claims or fabricated publication evidence.
 */
export type ImmunologyDomain="autoimmunity"|"cancer_immunology"|"infection";
export type ScientificBenchmarkCase={
  id:string;domain:ImmunologyDomain;question:string;
  context:{disease:string;cellType:string;tissue:string;species:string;experimentalSystem:string};
  concepts:readonly string[];
  requiredChecks:readonly ("source_provenance"|"context_separation"|"uncertainty"|"review_gate"|"falsifiability")[];
  scientificGoldStandard:"pending_independent_expert_review";
};
export const CROSS_IMMUNOLOGY_BENCHMARK:readonly ScientificBenchmarkCase[]=[
  {id:"immune-autoimmunity-tfh-il21",domain:"autoimmunity",
    question:"Under what evidence-supported contexts do Tfh, IL-21 and B-cell interactions differ across systemic sclerosis, rheumatoid arthritis and lupus?",
    context:{disease:"cross-disease: SSc/RA/SLE",cellType:"Tfh and B cells",tissue:"disease-specific lymphoid and affected tissues",species:"Homo sapiens",experimentalSystem:"human observational and ex vivo studies"},
    concepts:["Tfh","IL21","B cell","autoantibody"],
    requiredChecks:["source_provenance","context_separation","uncertainty","review_gate","falsifiability"],
    scientificGoldStandard:"pending_independent_expert_review"},
  {id:"immune-oncology-cd8-exhaustion",domain:"cancer_immunology",
    question:"How does the evidence for exhausted CD8 T-cell states vary across tumour microenvironments and treatment contexts?",
    context:{disease:"solid tumours",cellType:"CD8 T cells",tissue:"tumour microenvironment",species:"Homo sapiens",experimentalSystem:"human tumour tissue and single-cell studies"},
    concepts:["CD8 T cell","PDCD1","TOX","exhaustion"],
    requiredChecks:["source_provenance","context_separation","uncertainty","review_gate","falsifiability"],
    scientificGoldStandard:"pending_independent_expert_review"},
  {id:"immune-infection-interferon-memory",domain:"infection",
    question:"How do type I interferon response timing and immune memory relate across viral infection settings?",
    context:{disease:"viral infection",cellType:"innate and memory lymphocytes",tissue:"respiratory and systemic immune compartments",species:"Homo sapiens",experimentalSystem:"longitudinal human infection and vaccination studies"},
    concepts:["type I interferon","IFNAR","antiviral immunity","immune memory"],
    requiredChecks:["source_provenance","context_separation","uncertainty","review_gate","falsifiability"],
    scientificGoldStandard:"pending_independent_expert_review"},
] as const;

export type BenchmarkAssessment={
  caseId:string;
  sourceProvenanceVerified:boolean;
  biologicalContextSeparated:boolean;
  uncertaintyDisclosed:boolean;
  reviewGateEnforced:boolean;
  hypothesisFalsifiable:boolean;
  independentReviewerId?:string;
  independentReviewerDecision?:"accepted"|"rejected"|"needs_revision";
  reviewerNotes?:string;
};
export function assessCrossImmunologyBenchmark(
  assessments:readonly BenchmarkAssessment[],
):{coverage:number;readyForExpertReview:boolean;scientificallyValidated:boolean;
  missingCaseIds:readonly string[];failedCaseIds:readonly string[]}{
  const ids=new Set<string>();
  const failedCaseIds:string[]=[];
  for(const a of assessments){
    if(!CROSS_IMMUNOLOGY_BENCHMARK.some(c=>c.id===a.caseId))
      throw new Error("Unknown immunology benchmark case");
    if(ids.has(a.caseId))throw new Error("Duplicate benchmark assessment");
    ids.add(a.caseId);
    if(!a.sourceProvenanceVerified||!a.biologicalContextSeparated||
      !a.uncertaintyDisclosed||!a.reviewGateEnforced||!a.hypothesisFalsifiable)
      failedCaseIds.push(a.caseId);
  }
  const missingCaseIds=CROSS_IMMUNOLOGY_BENCHMARK.filter(c=>!ids.has(c.id)).map(c=>c.id);
  const readyForExpertReview=missingCaseIds.length===0&&failedCaseIds.length===0;
  const scientificallyValidated=readyForExpertReview&&assessments.every(a=>
    !!a.independentReviewerId?.trim()&&a.independentReviewerDecision==="accepted"&&
    !!a.reviewerNotes?.trim());
  return {coverage:assessments.length,readyForExpertReview,scientificallyValidated,
    missingCaseIds,failedCaseIds};
}
