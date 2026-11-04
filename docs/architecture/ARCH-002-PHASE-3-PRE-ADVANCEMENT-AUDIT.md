# HSI Phase 3.1–3.9 — Independent Pre-Advancement Code Audit
Date: 2026-11-04
Target: gnaneshwer23/hsi-core main at 78c72c8
Decision: BLOCK advancement to next phase until P0/P1 closure and operational acceptance.
Evidence: GitHub repository source inspection and Actions run 41860397197 (success). No live database, browser, clinical system, or external ISI integration was exercised.

## Verified positives
- Latest main CI run passed; canonical graph validators reject dangling edges, patient/public mixing, and nonreviewed public assertions.
- Read-only research coordinator rejects unauthenticated/nonresearch roles, restricted research rows and inconsistent dossier snapshots.
- Phase 3.9 research panel is incorporated into existing ScienceGraph page without claiming that an authenticated service is available.
- SQL migration 011 and 012 remain unapplied. No production changes performed.

## Confirmed code-level findings
### P0 — Authentication and storage access not operational
- src/hsiResearchWorkbenchIntegration.ts accepts a typed actor supplied by its caller; there is no trusted authenticated HTTP route binding this to a verified server session.
- src/db/hsiNeonGraphReadRepository.ts checks principalId but does not use it in a database policy or query; an application-provided string is not an access-control boundary.
- migration 011 does not enable RLS on graph tables. migration 012 enables FORCE RLS with no permissive policy, preventing ordinary dossier reads. Both are unapplied.
Action: implement trusted server session resolution, least-privilege database roles, RLS, deny-by-default access, and tests of unauthorised and revoked sessions.

### P1 — Version and consistency bugs
- Graph SQL ORDER BY id,version and DISTINCT ON (id) ORDER BY id,version DESC sort semantic versions lexicographically; e.g. 2.0.0 can be selected over 10.0.0. Multiple relationship versions can be returned.
- Dossier reader ORDER BY relationship_id,relationship_version DESC LIMIT 100 can return multiple dossier versions for a single edge and silently omit other edges. No exact relationship-version predicate is enforced.
- Graph and dossier reads use independent SQL connections, with no shared transaction/snapshot. assertHsiResearchSnapshot validates consistency after reads but does not guarantee atomicity.
- Relationship endpoint version pinning is not stored in canonical edge records; node versions may drift independently.
Action: version-aware deterministic selection and exact edge/dossier version join in one read-only transaction or consistent snapshot, with test cases for 2.0.0 vs 10.0.0, duplicate versions, updates between reads and missing dossiers.

### P1 — Evidence and scientific review acceptance incomplete
- src/hsiResearchGraphWorkbench.ts displays reviewState and evidenceAssessment from stored payloads, not independently verified current reviewer authority, licence or retraction status.
- Approved scientific assertions are not proven current solely by persisted review snapshots. Graph release must recheck authoritative review and source status.
- Existing ISI editorial data are not reconciled with canonical ontology identifiers, and no real SSc/RA import is validated.
Action: authoritative review/retraction/rights lookup, scientific curator sign-off, canonical identity reconciliation and source version verification.

### P1 — User interface not an end-to-end research workbench
- site/src/pages/ScienceGraph.tsx renders GovernedResearchPanel without an endpoint prop; panel therefore always shows 'service is not connected' and never issues an authenticated fetch.
- There is no verified /api/research/graph-workbench handler.
- The editorial graph node ID may not equal a canonical HSI node ID; no mapping exists.
Action: trusted route, canonical node mapping, response validation, authorised browser E2E, keyboard/mobile/accessibility checks and network failure states.

### P1 — Research data and clinical boundaries
- Phase 3.7 direct-care grant is an injected object, not a verified clinical authorisation service.
- Patient data isolation must be enforced at physical storage, service and audit layers; contract-level checks are not sufficient.
Action: leave clinical bridge disabled until privacy, identity, clinical safety and purpose-based access are verified.

### P2 — Resilience and query quality
- SQL graph repository has no stable cursor/pagination and does not filter retired/rejected revisions.
- The panel can show stale results after focusNodeId changes while a request is in flight, and its response validation only checks shallow fields.
- Query limits and runtime costs require representative data/performance tests.
Action: cancellation, strict runtime schema validation, pagination and load tests.

## Required release gates
1. Green CI after all fixes (currently green at audited SHA, not evidence of live readiness).
2. Disposable Neon branch: migrations 011/012, least-privilege RLS, atomic version-pinned graph+dossier reads, rollback and negative access tests. Requires user approval.
3. Trusted server endpoint: verified session, scope, audit logs, rate limits, revocation and failure cases.
4. Real ISI source parity: canonical IDs, provenance, SSc first, RA comparison, rights/retraction checks, independent scientific review.
5. Browser E2E: login -> search canonical entity -> graph -> inspect dossier -> contradiction -> uncertainty -> no access after logout; accessibility and mobile.
6. Clinical bridge remains disabled pending dedicated clinical authorisation and safety case.
7. Recorded engineering, scientific, security/privacy, clinical (if applicable) and product acceptance.

## Final gate decision
Automated checks: PASS.
Code-level security/version/data integrity: OPEN FINDINGS.
Authenticated end-to-end researcher journey: NOT VERIFIED.
Clinical integration: NOT VERIFIED.
Production readiness: FAIL / BLOCKED.
Do not represent Phase 3 as defect-free or move to Phase 4 until P0/P1 issues are remediated and verified.
