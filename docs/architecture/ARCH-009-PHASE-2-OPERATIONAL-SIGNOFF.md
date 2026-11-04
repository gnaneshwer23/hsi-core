# ARCH-009 Phase 2 — Operational Sign-off Assessment
Date: 2026-11-04
Decision: CONDITIONAL / NOT SIGNED OFF FOR LIVE AGENT WORKLOADS

## Evidence verified
- GitHub full CI passed for prior Phase 2 implementation (run 41850755211).
- HSI staging branch br-rough-snow-zagxbvjp has migrations 009 and 010 tables installed.
- Prior rollback-contained staging SQL tests proved CAS version rejection, duplicate artifact-key rejection, immutable recovery decision trigger, and rejection of stale artifact inserts.
- Additional unit tests exercise timeout AbortSignal propagation and pre-dispatch cancellation.
- Production branch remains unchanged.

## Critical limitations
1. No real independent-process E2E with two database connections was completed. The repository does not contain an approved disposable test branch with safe artifact cleanup; immutable artifacts intentionally prohibit deletion. A proposed harness with unsafe cleanup was reverted before execution.
2. No crash/restart recovery using an authenticated research administrator was executed. Existing recovery service has a server-authenticated research_admin gate and audit transaction, but is not E2E verified.
3. Tool-side effects require idempotency and cancellation in each external adapter; AbortSignal alone cannot forcibly stop remote operations.
4. The checkpointed executor requires a fresh checkpoint claim; a recovered RUNNING checkpoint is not yet consumed by a resume-specific executor. Thus restart-safe resume is incomplete.
5. The artifact sink commits its own transaction and the checkpoint completion is separate; reconciliation after a crash between them is not implemented.
6. Fingerprint versioning and scientific-review revision rounds remain unresolved.
7. No patient-identifiable data or autonomous scientific approval may be introduced.

## Release decision
- Repository development and staging schema: ACCEPTED for continued testing.
- Operational runtime for real research agents: NOT APPROVED.
- Clinical, patient-level, production and public deployment: NOT APPROVED.

## Required next actions
- Disposable Neon staging-derived test branch for true multi-process E2E; preserve immutable audit semantics and discard branch afterward with explicit approval.
- Explicit recovered-attempt executor and crash-window reconciliation.
- Trusted backend test credentials with research_admin grant for authenticated recovery E2E.
- Integration tests for external tool cancellation, idempotency and no late side effects.
- Full CI pass on this sign-off revision.
