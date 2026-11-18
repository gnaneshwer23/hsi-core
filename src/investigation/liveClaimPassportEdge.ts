/**
 * Map a live-investigation candidate onto a DomainEdge so the existing
 * Evidence Context Passport UI can render without inventing context.
 * Abstract-level runs leave most fields not_stated / not_extracted.
 */
import type {DomainEdge,DomainModel} from "../knowledgeGraph/domainGraph";
import type {Candidate} from "./liveRun";

export type LiveClaimPassportInput={
  candidate:Pick<Candidate,"id"|"subject"|"object"|"sentence"|"contexts"|"species"|"sourceId"|"state"|"verification"|"direction"|"retraction">;
  /** Display labels for candidate.contexts keys (e.g. Systemic sclerosis). */
  contextLabels:readonly string[];
};

function studySystem(species:string|null):DomainModel{
  if(species==="human")return "human_in_vivo";
  if(species==="mouse")return "mouse";
  return "unspecified";
}

/**
 * Build a passport-compatible edge from a live claim.
 * Never fills tissue/dose/etc. — those stay missing until passage-linked curation.
 */
export function liveClaimToPassportEdge(input:LiveClaimPassportInput):DomainEdge{
  const {candidate:c,contextLabels}=input;
  const labels=contextLabels.map(s=>s.trim()).filter(Boolean);
  const retractionNote=c.retraction==="flagged"
    ?" Provider flags this record as retracted — do not treat as supporting evidence."
    :"";
  return{
    id:`live-claim:${c.id}`,
    subjectId:c.subject,
    objectId:c.object,
    predicate:"associated_with",
    kind:"source_candidate",
    sourceId:c.sourceId,
    assertion:`${c.subject} ~ ${c.object}: “${c.sentence}”`,
    domains:["immunology"],
    conditions:labels,
    model:studySystem(c.species),
    design:"Abstract-level live retrieval; study design not extracted from full text.",
    tissue:null,
    population:null,
    assay:null,
    timepoint:null,
    intervention:null,
    outcome:null,
    limitations:
      `Live investigation candidate (${c.state}). Verification=${c.verification}; direction=${c.direction}. `+
      "Abstract-only evidence; licence/reuse not assessed; not graph-promotable; human review required."+
      retractionNote,
    contextStatus:"editorial_annotation_pending_source_verification",
    negated:c.direction==="negative",
    scopeWarnings:[
      "Passage-linked fields (dose, cell type, sample size, estimand, …) are not extracted on this live path.",
      "Disease contexts are scenario/retrieval labels, not verified experimental ontology mappings.",
    ],
    reviewStatus:"unreviewed",
    confidence:"not_calibrated",
    scientificClaimAllowed:false,
  };
}
