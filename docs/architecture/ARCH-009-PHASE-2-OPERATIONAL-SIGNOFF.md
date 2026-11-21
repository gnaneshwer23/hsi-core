# ARCH-009 Phase 2 — Operational Sign-off Assessment
Date: 2026-11-04
Decision: CONDITIONAL / NOT SIGNED OFF FOR LIVE AGENT WORKLOADS

## Evidence verified
- GitHub full CI passed for prior Phase 2 implementation (run 41850755211).
- HSI staging branch hsi-staging-branch has migrations 009 and 010 tables installed.
- Prior rollback-contained staging SQL tests proved CAS version rejection, duplicate artifact-key rejection, immutable recovery decision trigger, and rejection of stale artifact inserts.
- Additional unit tests exercise timeout AbortSignal propagation and pre-dispatch cancellation.
- Production branch remains unchanged.

## Critical limitations
1. No real independent-process E2E with two database connections was completed. The repository does not contain an approved disposable test branch with safe artifact cleanup; immutable artifacts intentionally prohibit deletion. A proposed harness with unsafe cleanup was reverted before execution.
2. No crash/restart recovery using an authenticated research administrator was executed. Existing recovery service has a server-authenticated research_admin gate and audit transaction, but is not E2E verified.
3. Tool-side effects require idempotency and cancellation in each external adapter; AbortSignal alone cannot forcibly stop remote operations. **Engineering soft-land (U25/U27/U28/U29/U30/U31/U32, 21 Nov 2026):** fenced tool callers; orchestration wall-clock budget; structured `termination` taxonomy (`parent_signal` / `wall_clock_budget` / `task_timeout` / `policy_denied`) with `externalSideEffectsUndone: false`; recovery decision trail; external tool adapter cancel/idempotency audit catalog + late-side-effect refuse records. Live multi-process adapter E2E remains open. Orphan RUNNING stage continue requires `recoverStage`.
4. ~~The checkpointed executor requires a fresh checkpoint claim; a recovered RUNNING checkpoint is not yet consumed by a resume-specific executor.~~ **Engineering soft-land (U24, 21 Nov 2026):** `continueHsiCheckpointedExecution` resumes an explicitly recovered RUNNING fence. Live multi-process restart E2E and research_admin recovery credentials remain open.
5. ~~The artifact sink commits its own transaction and the checkpoint completion is separate; reconciliation after a crash between them is not implemented.~~ **Engineering soft-land (U24):** `applyHsiCommittedArtifactReconciliation` CAS-completes from a single fenced artifact without executor replay. Staging multi-process crash-window E2E remains owner-gated.
6. Fingerprint versioning and scientific-review revision rounds remain unresolved. **Engineering soft-land (U26, 21 Nov 2026):** explicit algorithm IDs + migration policy (no in-place rewrite / no cross-algorithm equality) and append-only revision-round contract with `implementedInDatabase: false`. Neon migration and live reviewer revision E2E remain owner-gated.
7. No patient-identifiable data or autonomous scientific approval may be introduced.

## Release decision
- Repository development and staging schema: ACCEPTED for continued testing.
- Engineering research-agent runtime build: **OWNER-APPROVED** (21 November 2026) — see U35 `hsiResearchAgentAuthorization` / `hsiResearchAgentRuntime`. Still **not** a claim of live multi-process staging E2E, Gate C, PHI, or unrestricted researcher GA.
- Clinical, patient-level, production and public deployment: NOT APPROVED.

## Required next actions
- Disposable Neon staging-derived test branch for true multi-process E2E; preserve immutable audit semantics and discard branch afterward with explicit approval (**U33** soft-lands exclusive ownership race in-process only).
- Explicit recovered-attempt executor and crash-window reconciliation (U24 soft-land present; **U34** crash/restart recovery paths soft-land in-process; live E2E still open).
- Trusted backend test credentials with research_admin grant for authenticated recovery E2E (U31 recovery decision contract soft-land present; live admin E2E still open).
- Integration tests for external tool cancellation, idempotency and no late side effects (U25/U27/U28 soft-land for bounded stages; **U32** adapter cancel/idempotency audit catalog + late-side-effect refuse records; live multi-process adapters still host-owned).
- Full CI pass on this sign-off revision.
