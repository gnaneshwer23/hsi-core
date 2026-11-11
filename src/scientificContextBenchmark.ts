/** B-03.4 independently adjudicated benchmark gate.
 * Rejects demonstration, unlicensed and unreviewed data as scientific evidence.
 */
import {evaluateContextCandidates,type GoldContextSpan,type ContextEvaluation} from "./evidenceContextEvaluation";
import {discoverContextCandidates} from "./discoverEvidenceContext";
import type {EvidenceExcerpt} from "./contextualEvidenceExtraction";
export type BenchmarkCase={
 id:string;pmid:string;sourceUrl:string;licenceId:string;
 corpus:"real_publication"|"synthetic_fixture";
 excerpt:EvidenceExcerpt;gold:readonly GoldContextSpan[];
 adjudication:{reviewerA:string;reviewerB:string;adjudicator:string;completedAt:string;status:"approved"|"pending"};
};
export type BenchmarkReport={status:"evaluated";cases:number;passages:number;annotations:number;metrics:ContextEvaluation;meetsContextF1Target:boolean};
export function runScientificContextBenchmark(cases:readonly BenchmarkCase[]):BenchmarkReport{
 if(!cases.length)throw Error("B-03.4 requires an independently reviewed corpus");
 const ids=new Set<string>(),allGold:GoldContextSpan[]=[],allCandidates:ReturnType<typeof discoverContextCandidates>=[];
 for(const item of cases){
  if(!item.id||ids.has(item.id))throw Error("Duplicate or missing benchmark case ID");
  ids.add(item.id);
  if(item.corpus!=="real_publication"||!/^\d{1,9}$/.test(item.pmid)||!/^https:\/\//.test(item.sourceUrl)||!item.licenceId.trim())
   throw Error("B-03.4 requires identifiable, licensed real publications");
  const review=item.adjudication;
  if(review.status!=="approved"||!review.completedAt||!review.reviewerA||!review.reviewerB||!review.adjudicator||
     new Set([review.reviewerA,review.reviewerB,review.adjudicator]).size!==3)
   throw Error("B-03.4 requires independent dual review and adjudication");
  if(item.excerpt.interpretation!=="unassessed"||item.excerpt.reviewStatus!=="unreviewed"||
     !item.excerpt.passageSha256||!/^([a-f0-9]{64})$/i.test(item.excerpt.passageSha256)||
     !item.excerpt.locator||!item.excerpt.exactText.trim())
   throw Error("B-03.4 requires traceable source excerpt with digest");
  for(const span of item.gold){
   if(span.sourceId!==item.excerpt.sourceId||span.passageId!==item.excerpt.passageId||
      span.sourceVersion!==item.excerpt.sourceVersion||span.end>item.excerpt.exactText.length||
      item.excerpt.exactText.slice(span.start,span.end)!==span.exactText)
    throw Error("B-03.4 gold span does not match source excerpt");
  }
  allGold.push(...item.gold);
  allCandidates.push(...discoverContextCandidates(item.excerpt));
 }
 const metrics=evaluateContextCandidates(allCandidates,allGold);
 return {status:"evaluated",cases:cases.length,passages:cases.length,annotations:allGold.length,
  metrics,meetsContextF1Target:metrics.f1>=0.85};
}
