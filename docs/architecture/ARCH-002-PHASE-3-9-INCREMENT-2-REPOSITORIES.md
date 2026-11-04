# Phase 3.9 Increment 2 — Scientific Graph and Evidence Store Adapters
Date: 2026-11-04
Status: Code committed; operational integration and CI pending.

## Reused
- Phase 3.4 scoped query and proposed canonical graph tables.
- Phase 3.3 evidence temporal dossier contract.
- Phase 3.8 research workbench and Phase 3.9 authenticated coordinator.
- Existing ISI ScienceGraph page and DiscoveryGraphExplorer; neither is replaced.

## New implementation
- src/db/hsiNeonGraphReadRepository.ts: TLS/Neon-guarded, parameterised, read-only research-scope graph reader using the proposed Phase 3.4 schema.
- src/db/hsiNeonDossierReader.ts: TLS/Neon-guarded, read-only evidence dossier reader.
- db/migrations/012_hsi_lhkg_evidence_dossiers.sql: unapplied, deny-by-default dossier persistence proposal.

## Critical limitations / blockers
- Phase 3.4 migration 011 and dossier migration 012 have NOT been applied. No real graph or dossier rows were queried.
- Graph and dossier readers are not instantiated in a live authenticated HTTP handler; session-to-DB role mapping, RLS and row-level tenant isolation are NOT proven. The graph adapter's SQL scope predicate is not an adequate substitute for database RLS.
- The proposed dossier schema has FORCE RLS and no permissive policy; ordinary reads must fail closed until reviewed access policies are implemented.
- The graph reader currently chooses the highest lexicographic version string; it is not a validated semantic-version pinning policy. Dossier reader may return multiple versions of the same relationship; coordinator rejects duplicate IDs. Version-pinned joins must be implemented before operational acceptance.
- Clinical patient data remains completely excluded. No live ISI graph ingestion or external biomedical integration.
- The existing ISI ScienceGraph page still uses editorial catalogue data; no user-facing API wiring has been deployed. A read-only authenticated workbench UI must be integrated after trusted server access and verified dataset availability.
- No production deployment, migration, credentials or patient data processing occurred.

## Required next acceptance sequence
1. Verify GitHub CI green for latest SHA.
2. Correct version pinning, relationship endpoint version integrity, access role/RLS and dossier-to-relationship consistency.
3. User-led isolated Neon branch verification of migrations 011/012, representative SSc/RA evidence, query safety, reviewer revocation and failure cases.
4. Trusted server-side auth route and scoped dossier retrieval with audit and least-privilege DB access.
5. Connect the authenticated research workbench to the existing ISI ScienceGraph UI with clear evidence, uncertainty, review and source-rights labels; maintain editorial fallback only as explicitly unreviewed educational data.
6. Scientific curator acceptance and accessibility/performance tests.
