# ARCH-002 Phase 3.4 — Governed Graph Persistence and Access-Scoped Query
Date: 2026-11-04
Status: Backend contract and proposed migration committed; not deployed.

## Reused foundations
Phase 3.1 canonical node/relationship validator; 3.2 ontology identity; 3.3 evidence dossier; graphRelease publication authority; authenticatedInterrogativeStore session patterns; Neon guard and existing HSI substrate. Existing graph explorer remains untouched.

## Delivered
- src/hsiGovernedGraphQuery.ts: trusted-server read boundary, explicit principal/role and verified clinical purpose, strict limits and IDs, graph integrity validation and post-query leakage checks.
- test/hsiGovernedGraphQuery.test.ts: unauthenticated denial, researcher access, clinical denial, purpose requirement, repository leakage, query limits.
- db/migrations/011_hsi_lhkg_governed_graph.sql: unapplied proposed versioned immutable biomedical graph tables, limited to three non-patient layers. No unrestricted patient identifiers.
- Graph data is never automatically approved or published.

## Not yet delivered — required for full Phase 3.4 sign-off
1. Trusted Neon repository adapter, transactionally consistent version selection and relationship-to-node resolution.
2. Actual session authentication and server-side authorisation with least-privilege database roles and RLS.
3. Evidence and current reviewer authority checks on persistence, including revocations and graph-release allowlists.
4. Review of SQL migration, safe isolated-branch execution and rollback strategy; avoid dropping immutable scientific records.
5. Independent-worker integration tests, pagination, query cost controls, security and access-boundary tests.
6. Restricted patient context must live in separately governed clinical storage; no general biomedical graph PHI.
7. Full HTTP API routing and runtime validation are not implemented.

## Safety
This milestone does not change production, staging or the existing science graph. The SQL migration is a proposal, not proof of operational persistence. Role information must be derived from authenticated server session, never client input.
