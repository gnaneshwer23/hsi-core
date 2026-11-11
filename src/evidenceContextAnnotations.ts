/** B-03.2: provenance-bound candidate context annotations.
 * These are reviewer-facing suggestions, never approved scientific claims.
 */
import type {EvidenceExcerpt,EvidenceContext} from "./contextualEvidenceExtraction";
export type ContextField=Exclude<keyof EvidenceContext,"limitations">;
export type CandidateContextAnnotation={
  sourceId:string;passageId:string;sourceVersion:string;field:ContextField;
  value:string;start:number;end:number;exactText:string;
  status:"candidate";method:"exact_span"; 
};
const FIELDS:readonly ContextField[]=["species","tissue","disease","cohort","method","intervention","comparator","outcome"];
export function annotateEvidenceContext(
  excerpt:EvidenceExcerpt,field:ContextField,value:string,start:number,end:number
):CandidateContextAnnotation {
  if(!FIELDS.includes(field))throw Error("Unsupported context field");
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<=start||end>excerpt.exactText.length)
    throw Error("Invalid context annotation offsets");
  const exactText=excerpt.exactText.slice(start,end);
  if(!value.trim()||value.length>300||!exactText.trim()||value.trim().toLocaleLowerCase()!==exactText.trim().toLocaleLowerCase())
    throw Error("Context value must match exact evidence span");
  if(field==="species"&&!["human","mouse","other"].includes(value.trim().toLowerCase()))
    throw Error("Species annotation must use a curated species value");
  if(excerpt.interpretation!=="unassessed"||excerpt.reviewStatus!=="unreviewed")
    throw Error("Candidate annotation requires unassessed evidence");
  return {sourceId:excerpt.sourceId,passageId:excerpt.passageId,sourceVersion:excerpt.sourceVersion,
    field,value:value.trim(),start,end,exactText,status:"candidate",method:"exact_span"};
}
