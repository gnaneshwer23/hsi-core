/**
 * Human Systems Intelligence (HSI) Phase 0 substrate.
 * Shared evidence grades + edge schema for Aksh Health + Immune Super Intelligence.
 */
export {
  HSI_CURATION_LABELS,
  HSI_CURATION_REVIEWS,
  HSI_GRADE_INFO,
  HSI_GRADES,
  HSI_TEACHING_STATUSES,
  hsiGradeFromCuration,
  hsiGradeFromTeaching,
  isHsiCurationReview,
  isHsiGrade,
  isHsiTeachingStatus,
  type HsiCurationReview,
  type HsiGrade,
  type HsiTeachingStatus,
} from "./grades";

export {
  HSI_DOMAINS,
  HSI_EDGE_TYPES,
  isHsiDomain,
  isHsiEdgeType,
  type HsiActionStub,
  type HsiClaim,
  type HsiDomain,
  type HsiEdge,
  type HsiEdgeType,
  type HsiMarker,
  type HsiPatientObservationStub,
  type HsiProvenance,
  type HsiTranslationCard,
} from "./schema";

export {
  gradeForSeed,
  isCdsSurfacable,
  isDiscoverySurfacable,
  summarizeGradeCounts,
  validateHsiEdge,
  validateProvenancePmid,
  validateTranslationCard,
  type HsiValidationIssue,
  type HsiValidationResult,
} from "./validate";

export {
  HSI_ALLOWED_AGENT_SURFACES_V0,
  HSI_SAFETY_RELEASE_CRITERIA_V0,
  criterionIds,
  type HsiReleaseCriterion,
} from "./releaseCriteria";

export {
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_MARKERS,
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
  hasEvidenceLocator,
  listBridgeCandidates,
} from "./seed/t2dImmunoMetabolic";

export {
  hsiEvidenceHandoff,
  type HsiEvidenceHandoff,
  type HsiEvidenceLinkStatus,
  type HsiGateCHandoffStatus,
} from "./evidenceHandoff";

export {
  linkClaimToMarker,
  loincCoverageSummary,
  markerByNodeId,
  markersWithLoinc,
  seedClaimLoincMap,
  type HsiClaimMarkerLink,
} from "./markers";

export {
  buildIsiExportBundle,
  serializeIsiExport,
  type IsiHsiExportBundle,
} from "./exportIsi";

export {
  buildSchemaGapReport,
  serializeGapReport,
  type HsiMappingGap,
  type HsiSchemaGapReport,
} from "./gapReport";

export {
  ISI_REL_SUGGESTIONS,
  claimsWithIsiMappings,
  listIsiRelSuggestions,
  suggestionForClaim,
  suggestionForEdge,
  summarizeIsiRelMappings,
  type IsiRelMatchKind,
  type IsiRelMappingSummary,
  type IsiRelSuggestion,
  type IsiRelSuggestionStatus,
} from "./mappings/isiRelSuggestions";

export {
  AKSH_CLINIC_BY_ID,
  AKSH_CLINIC_CONCEPTS,
  PROVISIONAL_AKSH_TO_DURABLE,
  akshClinicConcept,
  isDurableAkshClinicId,
  isProvisionalAkshId,
  listAkshClinicConcepts,
  migrateAkshNodeId,
  type AkshClinicConcept,
  type AkshClinicKind,
} from "./mappings/akshClinicIds";

export {
  AKSH_NODE_SUGGESTIONS,
  akshMapImpliesCds,
  akshNodeIdMap,
  akshSuggestionForClaim,
  akshSuggestionForEdge,
  assertSeedEdgesNotCdsSurfacable,
  claimsWithAkshMappings,
  listAkshNodeSuggestions,
  summarizeAkshNodeMappings,
  type AkshNodeMatchKind,
  type AkshNodeMappingSummary,
  type AkshNodeSuggestion,
  type AkshNodeSuggestionStatus,
} from "./mappings/akshNodeSuggestions";

export { claimsWithProductMappings } from "./mappings/productMappings";
