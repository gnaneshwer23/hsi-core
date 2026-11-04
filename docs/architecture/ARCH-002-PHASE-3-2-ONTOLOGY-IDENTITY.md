# ARCH-002 Phase 3.2 — Ontology Registry and Identity Resolution
Date: 2026-11-04
Status: Implemented in code; CI pending.

## Reuse
Builds on src/livingHealthKnowledgeGraph.ts, site/src/features/science/typedGraphSchema.ts and ARCH-002 graph ownership. No replacement of existing ISI or Aksh identifier stores.

## Implemented
- Explicit namespace registry for HGNC, UniProt, GO, Reactome, MONDO, UBERON, CL, LOINC, ClinicalTrials.gov NCT and PubMed PMID.
- Identifier validation and versioned cross-ontology mapping contracts.
- Human-review reference required for an exact cross-ontology mapping.
- Resolver considers only explicit exact node identifiers and reviewed exact cross-ontology mappings.
- Broad, narrow and related mappings never merge entities.
- Duplicate canonical matches return ambiguous; no silent first-match.
- Restricted clinical nodes excluded by default.

## Important limitations
- Namespace entries are syntactic constraints, not a downloaded ontology catalogue or validated terminology licence.
- Mapping reviewDecisionId is a reference, not yet verified against authenticated scientific review storage.
- includeRestricted is a low-level flag, NOT an authorisation mechanism. No API should expose it without server-side identity, purpose and ACL enforcement.
- Exact mapping does not prove two biological entities are equivalent without semantic curation. No transitive merging or automatic persistence.
- Identifier coverage is a deliberately small starter registry; UniProt and LOINC syntax need authoritative source validation before external ingestion.
- This milestone adds no patient data, graph migration, production deployment or autonomous graph publication.

## Next milestone
3.3 evidence provenance, contextualised and temporal assertions, source rights/retraction and review decision links; then 3.4 governed persistence and access-scoped API.
