/**
 * P0.1.2: fail-closed adapters for three legacy evidence shapes.
 * These adapters NEVER approve or promote claims. Unknown biological context
 * is represented explicitly; source locators must not be invented.
 */
import {CANONICAL_EDGE_SCHEMA_VERSION, REQUIRED_CONTEXT, validateCanonicalEdge,
  type CanonicalEvidenceEdge, type CanonicalContext, type ContextKey, type ContextValue} from "./canonicalContextualEdge";
/** Structural legacy contract kept within the backend rootDir. */
export type LegacyScientificEdge = {
  id:string; subjectId:string; predicate:string; objectId:string;
  evidenceIds:string[]; context:{disease?:string;tissue?:string;species?:string;assay?:string;experimentalSetting?:string};
  reviewStatus:string;
};
export type LegacyEvidenceRecord = {id:string;context?:{disease?:string}};
import type {ContextualCandidateRelationship} from "./contextualCandidateRelationships";
import type {MechanismEvidenceLead} from "./contextualMechanismComparison";

type Field = {value?: string | null; locator?: string};
export type SourceProof = {sourceId: string; sourceUrl: string; sourceLocator: string; evidenceRecordIds: string[]; submitterId: string};
export type AdapterOverrides = Partial<Record<ContextKey, Field>>;
const missing = (): ContextValue => ({value:null,status:"not_reported"});
const field = (value?: string | null, locator?: string): ContextValue =>
  value?.trim() && locator?.trim() ? {value:value.trim(),status:"reported",sourceLocator:locator.trim()} : missing();
function context(fields: AdapterOverrides): CanonicalContext {
  return Object.fromEntries(REQUIRED_CONTEXT.map(key => [key,field(fields[key]?.value,fields[key]?.locator)])) as CanonicalContext;
}
function draft(input: {id:string;subjectId:string;predicate:string;objectId:string;
  direction:CanonicalEvidenceEdge["direction"];fields:AdapterOverrides;proof:SourceProof;limitations:string[]}): CanonicalEvidenceEdge {
  const edge: CanonicalEvidenceEdge = {
    schemaVersion:CANONICAL_EDGE_SCHEMA_VERSION,id:input.id,subjectId:input.subjectId,
    predicate:input.predicate,objectId:input.objectId,direction:input.direction,
    context:context(input.fields),
    provenance:{sourceId:input.proof.sourceId,sourceUrl:input.proof.sourceUrl,
      sourceLocator:input.proof.sourceLocator,evidenceRecordIds:input.proof.evidenceRecordIds,
      extractionMethod:"assisted"},
    submitterId:input.proof.submitterId,synthetic:false,review:{state:"draft"},
    limitations:[...input.limitations,"legacy_adapter_unverified","no_auto_approval"],
  };
  const errors = validateCanonicalEdge(edge);
  if(errors.length) throw new Error("Canonical adapter rejected source: "+errors.join(","));
  return edge;
}
/** Typed graph evidence requires an actual source record; review state is deliberately reset to draft. */
export function fromTypedGraphEdge(edge: LegacyScientificEdge, source: LegacyEvidenceRecord, proof: SourceProof,
  overrides: AdapterOverrides = {}): CanonicalEvidenceEdge {
  if (!edge.evidenceIds.includes(source.id)) throw new Error("Evidence source not linked to edge");
  const legacy = edge.context;
  const locator = source.context ? proof.sourceLocator : undefined;
  return draft({id:edge.id,subjectId:edge.subjectId,predicate:edge.predicate,objectId:edge.objectId,
    direction:"inconclusive",proof,
    fields:{disease:{value:legacy.disease,locator},tissue:{value:legacy.tissue,locator},
      species:{value:legacy.species,locator},assay:{value:legacy.assay,locator},
      experimentalSystem:{value:legacy.experimentalSetting,locator},...overrides},
    limitations:["typed_graph_direction_not_explicit","legacy_review_state_not_inherited"]});
}
/** Metadata-only candidate: no mechanism direction can be asserted. */
export function fromContextualCandidate(candidate: ContextualCandidateRelationship, proof: SourceProof,
  overrides: AdapterOverrides = {}): CanonicalEvidenceEdge {
  if (!candidate.evidenceSourceIds.includes(proof.sourceId)) throw new Error("Candidate source not linked");
  return draft({id:candidate.id,subjectId:candidate.subject.value,predicate:candidate.predicate,
    objectId:candidate.object.value,direction:"inconclusive",proof,fields:overrides,
    limitations:["candidate_metadata_only","candidate_polarity_not_verified"]});
}
/** Mechanism lead is unverified; preserve its declared direction, but not inferred assay/gate. */
export function fromMechanismLead(lead: MechanismEvidenceLead, proof: SourceProof,
  overrides: AdapterOverrides = {}): CanonicalEvidenceEdge {
  if (lead.sourceReference !== proof.sourceId) throw new Error("Mechanism lead source mismatch");
  const loc=proof.sourceLocator;
  return draft({id:lead.id,subjectId:lead.proteinAccession,predicate:"MECHANISM_DIRECTION",
    objectId:lead.pathwayStableId,direction:lead.direction,proof,
    fields:{disease:{value:lead.context.disease,locator:loc},tissue:{value:lead.context.tissue,locator:loc},
      cellPopulation:{value:lead.context.cellType,locator:loc},species:{value:lead.context.species,locator:loc},
      experimentalSystem:{value:lead.context.experimentalSystem,locator:loc},
      endpoint:{value:lead.context.endpoint,locator:loc},...overrides},
    limitations:["mechanism_lead_unverified","gate_denominator_assay_timepoint_require_source_extraction"]});
}
