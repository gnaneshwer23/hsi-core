# HSI Phase 3 — Integration and Production-Readiness Audit
Date: 2026-11-04
Repository: gnaneshwer23/hsi-core
Scope: Phase 3.1–3.8, CI and repository-level implementation evidence.
Decision: NOT READY for production, live clinical use, or full Phase 3 operational sign-off.

## Executive findings
1. Phase 3.1–3.3 provide canonical graph types, ontology mapping contracts and evidence dossiers. They are reusable foundations, not a populated graph service.
2. Phase 3.4 provides a proposed immutable biomedical schema and an authenticated-role query *interface*, but the SQL migration is unapplied, no Neon graph repository adapter is connected, no real server endpoint or DB RLS was verified, and clinical-purpose verification is not connected.
3. Phase 3.5 adds a conservative editorial science adapter. It does not ingest the separate ISI repository or certify editorial content as reviewed evidence. Source compatibility is structural and not a versioned shared package.
4. Phase 3.6 adds draft source contracts and in-memory bounded traversal. No live microbiome, metabolomics, immune-assay or trial-registry connectors are verified. Traversal is not a database access-control boundary.
5. Phase 3.7 adds a clinical-to-approved-biology bridge contract. Its HsiClinicalAccessDecision must be supplied by a trusted, independently verified authorisation service. No live FHIR access, patient-record access, or UK clinical safety approval has occurred.
6. Phase 3.8 adds a read-only scientific workbench projection with evidence warnings and QA counts. It is not yet connected to authenticated persistence, a UI or a real evidence dossier service. The initial Phase 3.8 CI run failed one test expecting a specific exception string; a follow-up correction was committed and must be verified.

## Audit matrix
| Milestone | Repository-level delivery | End-to-end status | Operational gate |
|---|---|---|---|
| 3.1 canonical contract | Implemented | Not integrated with persistent graph | Graph integrity and representative data |
| 3.2 ontology identity | Implemented | Registry mappings not independently verified | Reviewed mappings and collision tests on actual sources |
| 3.3 evidence provenance | Implemented | No live evidence/reviewer store integration | Licence, retraction, current review and contradiction checks |
| 3.4 governed persistence/API | Partial | Not operational | Disposable Neon migration, RLS, authenticated query E2E |
| 3.5 science adapter | Partial | No real ISI sync | Versioned ingestion, identity reconciliation, source parity |
| 3.6 microbiome/trials | Partial | Draft adapter only | Registry connector, provenance and source-rights verification |
| 3.7 clinical privacy | Contract only | No clinical authorisation integration | Clinical grant, audit, FHIR, DPIA, DCB0129/0160 |
| 3.8 workbench/QA | Partial | Projection only | UI, access control, dossier retrieval, scientific acceptance |

## High-priority risks
- P0: No verified trusted session-to-graph database authorisation or patient-specific clinical grant; do not expose graph or clinical bridge as public endpoints.
- P0: Public graph approval/review references in contracts do not independently prove current reviewer authority, source rights or release state.
- P0: Clinical data must remain segregated from research/public biomedical stores. Do not ingest identifiable patient data in the general graph.
- P1: Versioned source entities and graph relationship endpoints require canonical identity reconciliation and source version consistency.
- P1: Workbench counts and dossier statuses are advisory, not scientific release gates. Do not treat draft relationships as established evidence.
- P1: Migration 011 is unapplied; constraints are not a substitute for database RLS or transactional evidence/review verification.
- P1: Real external ISI, microbiome, omics and trials ingestion is not yet proven.
- P2: Query cost, pagination, accessibility, curator workflows and load tests remain unverified.

## Required acceptance sequence (no production deployment)
A. CI: verify the latest corrective commit passes full repository tests and TypeScript checks. Investigate any remaining failure rather than bypassing checks.
B. Security: design and test server-side session identity, least-privilege database roles, access-scoped query policies and current reviewer authority.
C. Persistence: user-led Phase 3.4 verification on a disposable Neon branch; migration review, sample graph import, rollback and query tests. No production DB writes.
D. Scientific data: import existing ISI editorial graph read-only, validate canonical ontology mappings, evidence rights/retraction status and current human review. Compare SSc first, RA next.
E. Cross-domain: verify microbiome–immune–metabolic and trial-registry evidence adapters with versioned fixtures and contradiction scenarios; never infer causality or patient eligibility.
F. Clinical: keep patient connections disabled until independent grant verification, clinical safety and privacy assessments, audit logging and clinical owner approval.
G. Experience: wire authenticated researcher workbench into existing UI with provenance, contradictory evidence, review-state and uncertainty panels. Test keyboard/mobile/accessibility.
H. Sign-off: scientific reviewer, privacy/security owner, clinical safety owner (where applicable), engineering/QA owner and product owner must record explicit acceptance. Production deploy remains a separate approval.

## Evidence and limitations
This is a repository/CI evidence-based audit, not a penetration test, clinical safety case, real database inspection, UI acceptance test or scientific validation study. No live integrations or production environment were tested. Earlier Phase 3.1–3.7 CI successes support unit-level confidence only. Phase 3.8's failing CI run was inspected; follow-up CI must be checked.

## Recommended next controlled milestone
Phase 3.9 — Integration Hardening and Evidence-Backed Acceptance: first CI green; then authenticated read-only graph adapter and deterministic scientific fixtures; then user-led disposable database verification; finally researcher UI and scientific review. No new product architecture or production deployment.
