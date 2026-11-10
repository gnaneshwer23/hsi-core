# Open-source integration decision — first increment (2026-11-10)

## Verified reuse and existing overlap
- **Open Targets**: HSI already has `src/evidence/openTargetsLookup.ts` with GraphQL association metadata and provenance. Extend, do not vendor or reimplement its Scala API.
- **Europe PMC**: HSI already has `src/evidence/europePmcBibliographicLookup.ts`. Continue metadata-first retrieval; publication full-text rights are independent.
- **ClinicalTrials.gov**: HSI already has `src/evidence/clinicalTrialsGovLookup.ts`; trial metadata is not eligibility.
- **Reactome**: this branch introduces `src/evidence/reactomePathwayLookup.ts` for bounded, identity-checked pathway metadata. It is deliberately NOT wired to governed graph persistence or approved scientific claims.
- **UniProt**: candidate next adapter; align accessions to existing ontology registry before integration.
- **LangGraph**: optional evaluation only. HSI already owns agent contracts and orchestrator; do not introduce another runtime before proving a gap in durability/recovery.

## Reactome acceptance boundaries
1. Only Reactome stable IDs and Pathway/TopLevelPathway records.
2. Strict provider identity check, bounded responses, timeout, dependency-injected fetch.
3. No automatic graph promotion, causal inference, source-rights clearance or scientific approval.
4. Offline mock tests: `bun test test/reactomePathwayLookup.test.ts`.
5. Live provider and CI checks remain **unverified** until executed.
6. Future wiring must use existing HSI ontology mappings, evidence ledger and human Gate C; do not connect to patient PHI.

## Recommended follow-through
1. Run the adapter tests and project-wide `bun run verify`; inspect CI.
2. Validate one real Reactome pathway response against the documented schema and terms.
3. Add a reviewed mapping of Reactome pathway IDs to existing HSI graph nodes.
4. Extend the same metadata-only pattern to UniProt; do not duplicate existing Open Targets / Europe PMC adapters.
5. Benchmark one contextual mechanism question before adding further agents.

## Sources
- https://reactome.org/ContentService/
- https://reactome.org/license
- https://github.com/opentargets/platform-api
- https://platform-docs.opentargets.org/data-access/graphql-api

This is a narrow first integration, not a completed multi-provider scientific intelligence platform.
