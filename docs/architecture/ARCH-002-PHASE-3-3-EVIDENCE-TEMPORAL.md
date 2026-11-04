# ARCH-002 Phase 3.3 — Evidence Provenance, Temporal Context and Scientific Semantics
Date: 2026-11-04
Status: Code committed; CI confirmation pending.

## Alignment
Extends Phase 3.1 canonical relationship contract and Phase 3.2 ontology identity resolver. Reuses src/graphRelease.ts SourceEvidence and ReviewDecisionSnapshot rather than introducing an independent publication authority. Consistent with docs/strategy/HSI_CLAIM_PROVENANCE_SCHEMA.md and ARCH-002 ownership.

## Delivered
- Versioned relationship evidence dossier with source version, retrieval timestamp, licence status, correction/retraction status, polarity and uncertainty.
- Biological context: species, tissue, cell state, assay, population, disease stage, intervention, dose and experimental model.
- Separate valid-time window, assertion time, source-as-of time and observation window.
- Distinct evidence assessment (unassessed/supported/contested/context_limited), epistemic classification and review state.
- Reviewed public assertions require matching latest authorised approval; revoked review does not count.
- Public release fails closed on contradictory evidence, unresolved source rights, retraction/correction, no licensed supporting source or nonpublishable epistemic type.
- Adapter to existing graphRelease SourceEvidence type; does not itself publish.
- Regression tests for provenance, contradictory evidence, retractions, licensing, temporal ordering and revoked reviews.

## Remaining gaps
- Authenticated review authority and current review snapshot must be loaded from the trusted database; this contract only validates supplied snapshots.
- Source licence metadata and retraction statuses need authoritative ingestion and refresh.
- Context comparability and contradiction adjudication require expert-reviewed methods.
- No actual publication or public API; no patient records, DB migration or production deployment.
- Phase 3.4 will add governed persistence and access-scoped retrieval.
