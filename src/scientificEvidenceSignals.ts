/**
 * Source-traceable, disease-agnostic abstract evidence triage.
 * Rules classify reporting language only: they do not verify study claims.
 */
export type EvidenceSignal={
 id:string;pmid:string;sentence:string;start:number;end:number;
 signal:"study_design"|"methods"|"reported_result"|"limitations";
 context:{species:string[];studyDesign:string[];methods:string[];outcomes:string[]};
 reviewStatus:"candidate_unreviewed";interpretation:"author_text_not_independently_verified";
};
const RULES:{signal:EvidenceSignal["signal"];pattern:RegExp}[]=[
 {signal:"limitations",pattern:/\b(limitations?|caution|small sample|underpowered|cannot conclude|further studies|not significant)\b/i},
 {signal:"reported_result",pattern:/\b(found|observed|associated|increased|decreased|reduced|improved|higher|lower|significant|correlat(?:ed|ion)|results? (?:show|suggest|indicate))\b/i},
 {signal:"methods",pattern:/\b(measured|assessed|sequenc(?:ed|ing)|flow cytometry|rna-seq|pcr|elisa|immunohistochemistry|randomi[sz]ed|analysed|analyzed)\b/i},
 {signal:"study_design",pattern:/\b(cohort|case.control|cross.sectional|randomi[sz]ed|trial|meta.analysis|systematic review|retrospective|prospective|in vitro|in vivo)\b/i},
];
const CONTEXT={
 species:/\b(humans?|patients?|mice|mouse|murine|rats?|zebrafish|nonhuman primates?)\b/gi,
 studyDesign:/\b(cohort|case.control|cross.sectional|randomi[sz]ed|trial|meta.analysis|systematic review|retrospective|prospective|in vitro|in vivo)\b/gi,
 methods:/\b(flow cytometry|rna-seq|pcr|elisa|immunohistochemistry|sequencing|mass spectrometry|single.cell|western blot)\b/gi,
 outcomes:/\b(survival|mortality|response|expression|fibrosis|inflammation|progression|remission|risk|efficacy)\b/gi,
};
function matches(text:string,regex:RegExp){return [...new Set(Array.from(text.matchAll(regex),m=>m[0].toLowerCase()))];}
export function extractAbstractEvidenceSignals(pmid:string,abstractText:string|null):EvidenceSignal[]{
 if(!/^\d{1,12}$/.test(pmid))throw new Error("Invalid PubMed identifier");
 if(!abstractText)return [];
 // Match text with offsets into the original abstract; no sentence is generated or paraphrased.
 const fragments=[...abstractText.matchAll(/[^.!?\n]+(?:[.!?]+|$)/g)];
 return fragments.flatMap((match,i)=>{
  const raw=match[0];const sentence=raw.trim();const start=(match.index??0)+raw.indexOf(sentence);
  if(!sentence||sentence.length<15)return [];
  const rule=RULES.find(r=>r.pattern.test(sentence));
  if(!rule)return [];
  return [{id:pmid+"-s"+i,pmid,sentence,start,end:start+sentence.length,signal:rule.signal,
   context:{species:matches(sentence,CONTEXT.species),studyDesign:matches(sentence,CONTEXT.studyDesign),methods:matches(sentence,CONTEXT.methods),outcomes:matches(sentence,CONTEXT.outcomes)},
   reviewStatus:"candidate_unreviewed" as const,interpretation:"author_text_not_independently_verified" as const}];
 });
}
