/** LEA-04E: the candidate ontology mappings and concept-type proposals, loaded only when the inspector needs them. */
import mappings from "../../../research/ontology/candidate-mappings.v1.json";
import types from "../../../research/ontology/concept-types.v1.json";
import type {CandidateMappingsFile} from "../../../src/ontology/mappingReview";
import type {ConceptTypeProposalsFile} from "../../../src/graphWorkspace/evidence";

export const MAPPINGS=mappings as unknown as CandidateMappingsFile;
export const TYPES=types as unknown as ConceptTypeProposalsFile;
