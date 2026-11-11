/** B-03 foundation: evidence excerpts, NOT interpreted scientific claims.
 * Only public, explicitly passage-use-permitted text is eligible.
 * No model inference, ontology promotion, clinical use or graph writes.
 */
import type {ResearchPassage,ResearchSource} from "./researchContracts";

export type EvidenceContext = {
  species: "human"|"mouse"|"other"|"unknown";
  tissue: string|null;
  disease: string|null;
  cohort: string|null;
  method: string|null;
  intervention: string|null;
  comparator: string|null;
  outcome: string|null;
  limitations: readonly string[];
};
export type EvidenceExcerpt = {
  sourceId:string; passageId:string; sourceVersion:string;
  locator:string; passageSha256:string|null;
  start:number; end:number; exactText:string;
  interpretation:"unassessed"; reviewStatus:"unreviewed";
  context:EvidenceContext;
};
const UNKNOWN_CONTEXT:EvidenceContext = {
  species:"unknown",tissue:null,disease:null,cohort:null,method:null,
  intervention:null,comparator:null,outcome:null,limitations:[]
};
/** Select an exact source span for subsequent human/model review.
 * Offsets are JS UTF-16 string offsets, matching String.slice.
 * This function deliberately does not assert association, causality, or negation.
 */
export function selectPublicEvidenceExcerpt(
  source:ResearchSource,passage:ResearchPassage,start:number,end:number
):EvidenceExcerpt {
  if(source.kind!=="publication"||source.dataClass!=="public_real"||
     passage.dataClass!=="public_real"||!source.licence.passageUsePermitted)
    throw new Error("B-03 requires public publication text with explicit passage-use permission");
  if(source.id!==passage.sourceId||!passage.sourceVersion||
     !source.provenance.version||passage.sourceVersion!==source.provenance.version)
    throw new Error("B-03 source and passage provenance mismatch");
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||
     start<0||end<=start||end>passage.text.length)
    throw new Error("B-03 invalid excerpt offsets");
  const exactText=passage.text.slice(start,end);
  if(!exactText.trim())throw new Error("B-03 empty evidence excerpt");
  if(!passage.locator.trim()||!passage.id.trim())
    throw new Error("B-03 missing evidence locator");
  return {sourceId:source.id,passageId:passage.id,sourceVersion:passage.sourceVersion,
    locator:passage.locator,passageSha256:passage.sha256,start,end,exactText,
    interpretation:"unassessed",reviewStatus:"unreviewed",
    context:{...UNKNOWN_CONTEXT,limitations:[]}};
}
