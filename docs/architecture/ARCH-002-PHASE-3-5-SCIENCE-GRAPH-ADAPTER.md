# ARCH-002 Phase 3.5 — Existing Scientific Graph Integration
Date: 2026-11-04
Status: Read-only adapter committed; CI and operational integration pending.

## Existing assets reused
site/src/features/science/typedGraphSchema.ts (typed v2 schema, review and predicate checks)
site/src/features/science/typedGraphData.ts (editorial catalogue projection)
site/src/features/science/knowledgeGraph.ts (educational graph explorer)
src/livingHealthKnowledgeGraph.ts (canonical HSI graph contract)
src/graphRelease.ts (authoritative publication assessment, not replaced)

## Delivered
src/hsiScienceGraphAdapter.ts validates the source graph and converts its entities and relationships to the canonical four-layer contract as governed research drafts. It retains typed predicates, biological context and source evidence references, but does not promote source review state, evidence status, causal certainty, public visibility or ontology mapping identity. Scientific claims must pass independent HSI reviewer and release checks.

## Pending
- End-to-end read-only import of the real catalogue and measured graph coverage, including unsupported node types.
- ISI cross-repository adapter and source-version provenance; no ISI database credentials copied into HSI.
- Versioned ontology mapping curation, not automatic exact identity.
- Authoritative evidence dossier linking and review/release handoff.
- Staging integration, CI verification, query performance, user-facing graph explorer alignment.
- Phase 3.4 database verification remains deferred by user.

No database migration, patient data ingestion or production deployment was performed.
