/**
 * Evidence-aware question triage for Scientific Discovery v2.
 * A question is NOT an executed investigation. Never attach a curated fixture
 * to a different question or represent inferred matches as scientific findings.
 */
export type ResearchQuestionTriage = {
  question: string;
  state: "needs_question" | "curated_demo" | "evidence_not_retrieved";
  domain: "systemic_sclerosis" | "gut_immune_neuro" | "metabolic" | "unclassified";
  concepts: string[];
  researchSubquestions: string[];
  evidenceStatus: string;
  nextAction: string;
  eligibleFixture: "gut-neuro" | "metabolic" | null;
};
const CURATED = {
  "gut-neuro": "How might gut microbial metabolites influence neuroinflammation?",
  metabolic: "How might metabolic inflammation relate to insulin resistance?",
} as const;
function has(q:string, pattern:RegExp){return pattern.test(q);}
export function triageResearchQuestion(input:string):ResearchQuestionTriage{
 const question=input.trim().replace(/\s+/g," ");
 const normal=question.toLowerCase();
 const base={question,concepts:[] as string[],researchSubquestions:[] as string[],eligibleFixture:null as "gut-neuro"|"metabolic"|null};
 if(!question)return {...base,state:"needs_question",domain:"unclassified",evidenceStatus:"No question submitted.",nextAction:"Enter a biological research question."};
 const fixture=(Object.entries(CURATED) as Array<["gut-neuro"|"metabolic",string]>).find(([,text])=>text.toLowerCase()===normal)?.[0]??null;
 const ssc=has(normal,/\b(systemic sclerosis|scleroderma|ssc)\b/);
 const gut=has(normal,/\b(gut|microbiom|microbial|butyrate|neuroinflamm|vagus)\w*/);
 const metabolic=has(normal,/\b(metabolic|insulin|diabet|glucose)\w*/);
 const domain=ssc?"systemic_sclerosis":gut?"gut_immune_neuro":metabolic?"metabolic":"unclassified";
 const concepts=[
  ...(ssc?["systemic sclerosis"]:[]),
  ...(has(normal,/\btfh\b|t follicular helper/)?["T follicular helper cells"]:[]),
  ...(has(normal,/\bil[ -]?21\b/)?["IL-21"]:[]),
  ...(has(normal,/\bb[ -]?cells?\b/)?["B cells"]:[]),
  ...(has(normal,/\bfibros\w*/)?["fibrosis"]:[]),
  ...(gut?["gut–immune context"]:[]),
  ...(metabolic?["metabolic context"]:[]),
 ];
 const researchSubquestions=ssc?[
  "Which patient phenotypes, tissues and disease stages are in scope?",
  "What evidence connects Tfh cells, IL-21 and B-cell states in systemic sclerosis?",
  "Which findings are associative, mechanistic or experimentally validated?",
  "Which competing explanations and measurable experiments would distinguish them?",
 ]:domain==="gut_immune_neuro"?[
  "Which tissue, species, assay and timepoint support each reported relationship?",
  "Which links between gut metabolites, immunity and neuroinflammation remain untested?",
 ]:domain==="metabolic"?[
  "Which human populations and metabolic phenotypes are being compared?",
  "Which immune mechanisms have direct experimental support?",
 ]:[
  "Which disease, tissue, population and biological mechanism should be investigated?",
  "Which sources and experimental systems are needed to evaluate this question?",
 ];
 if(fixture)return {question,state:"curated_demo",domain,concepts,researchSubquestions,evidenceStatus:"An existing curated demonstration is available. No new retrieval or live inference is performed.",nextAction:"Open the curated investigation and inspect provenance.",eligibleFixture:fixture};
 return {question,state:"evidence_not_retrieved",domain,concepts,researchSubquestions,evidenceStatus:"No question-specific evidence has been retrieved or verified. The existing demonstration must not be presented as an answer.",nextAction:"Approve the scope, then connect governed literature and knowledge-graph retrieval before generating findings.",eligibleFixture:null};
}
