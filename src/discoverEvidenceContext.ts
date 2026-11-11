/** B-03.2: deterministic, review-required context candidate discovery.
 * A match is an exact phrase, not evidence of a causal relationship or study finding.
 */
import type {EvidenceExcerpt} from "./contextualEvidenceExtraction";
import {annotateEvidenceContext,type CandidateContextAnnotation,type ContextField} from "./evidenceContextAnnotations";
export type CuratedContextPhrase={field:ContextField;phrase:string};
/** Explicitly curated phrases only; no automatic synonym expansion. */
export const SSC_CONTEXT_PHRASES:readonly CuratedContextPhrase[]=[
 {field:"disease",phrase:"systemic sclerosis"},
 {field:"disease",phrase:"scleroderma"},
 {field:"tissue",phrase:"skin"},
 {field:"tissue",phrase:"lung"},
 {field:"method",phrase:"flow cytometry"},
 {field:"method",phrase:"single-cell RNA sequencing"},
 {field:"intervention",phrase:"IL-21 blockade"}
];
const escapeRegex=(s:string)=>s.replace(/[.*+?^$\{\}()|[\]\\]/g,"\\$&");
export function discoverContextCandidates(
 excerpt:EvidenceExcerpt,phrases:readonly CuratedContextPhrase[]=SSC_CONTEXT_PHRASES
):CandidateContextAnnotation[]{
 const found:CandidateContextAnnotation[]=[];
 const seen=new Set<string>();
 for(const entry of phrases){
  if(!entry.phrase.trim()||entry.phrase.length>300)throw Error("Invalid curated context phrase");
  const regex=new RegExp("(?<![\\p{L}\\p{N}])"+escapeRegex(entry.phrase)+"(?![\\p{L}\\p{N}])","giu");
  for(const match of excerpt.exactText.matchAll(regex)){
   const start=match.index??0,end=start+match[0].length;
   const key=[entry.field,start,end].join(":");
   if(seen.has(key))continue;
   seen.add(key);
   found.push(annotateEvidenceContext(excerpt,entry.field,match[0],start,end));
  }
 }
 return found.sort((a,b)=>a.start-b.start||a.field.localeCompare(b.field));
}
