# Governance and operations: implementation fixes and acceptance evidence

12 November 2026. Base: main `8b97f07d0c2d33a90bd83082061a913309c22323`, which includes merged #276. This follow-up addresses audit item 7 without granting scientific authority, applying migrations, changing production settings or claiming a live pilot is accepted.

## What the audit still establishes

The repository already contains independent review, hash-bound packages, checkpoint/CAS and fenced-artifact/recovery components, request correlation/redaction, process admission, an optional shared-admission contract and a fail-closed pilot inventory. Reuse them. Their existence is not proof of deployed provider execution, distributed quota enforcement, scientific review, a working alert route or a completed incident/restore rehearsal.

The raw orchestrator still does not persist a trace by itself. Host-supplied checkpoint and artifact stores are separate components and require authenticated runtime wiring, least-privilege access and actual acceptance. The local browser suite uses a preview server; mocked workspace routes remain fixture tests, not Neon/login acceptance. The `site-deployment` job identifier is retained because branch protection refers to it; its steps now explicitly describe building, not deploying.

## Reproduced errors and changes

Eleven initial regression cases failed against the base implementation. The changes cover:

1. **Swallowed policy errors.** An executor could catch a denied tool or exhausted budget and return completed. A policy violation now aborts the task and rejects the orchestration attempt even if caught by executor code. A checkpoint wrapper cannot commit that output as completed; the regression exercises the existing CAS wrapper.
2. **Mutable policy/dependency input.** Caller-owned manifests could be expanded during execution, and a dependent executor could alter prior recorded results. Snapshot validated tasks/release/executor configuration, copy dependency/result records, and close the callback after an attempt settles. Late callbacks cannot alter the returned trace.
3. **Misleading tool receipts.** New receipts use `authorized` and `toolCallEvidence:"authorization_checks_only"`. They do not report external tool completion. Legacy `success` remains readable as old metadata, not verified execution; it is rejected in a new authorization-only envelope. Bounded-stage traces carry the same meaning.
4. **Cancellation.** Caller abort now settles even when an executor ignores its signal. This cannot kill an external process, roll back an external side effect or establish that a timed-out transaction did not commit. Existing checkpoint/fencing and idempotency requirements remain essential.
5. **Trace validation.** Reject unknown schema/status, duplicate invocation IDs, impossible/absent terminal timestamps and inconsistent evidence meaning. A validated envelope is a structural check, not an authenticated persisted execution receipt.
6. **Reviewer scope.** Authority verification now requires an explicit `ssc` or `ra` scope. Existing SSc paths pass `ssc`; release-bound checks map only SSc/RA and no longer default an unknown disease to RA. Missing, wildcard and unsupported scopes fail before opening a database connection. The generic ISI review store has no disease/subject membership in its current schema: it now fails closed unless a trusted server resolver binds the exact release/subject/kind to an accepted scope. No resolver, immunology-wide role or new disease grant is provisioned by this PR.
7. **Live reviewer lookup defect.** The inspected Neon Auth user ID is UUID while reviewer/access principal IDs are text. The existing `u.id=a.principal_id` join failed with SQLSTATE 42883. Change it to `u.id::text=a.principal_id` at the authority lookup, transactional decision and source-rights authority joins, matching the established identity representation. The corrected reviewer SELECT was executed read-only for a deliberately nonexistent principal and denied it without a type error. This is a schema/denial smoke check, not positive authority or session acceptance.
8. **Admission work ordering and cleanup.** Reject oversized URL/headers before the shared adapter/provider path; close the shared-admission abort signal on every outcome. Counters remain process-local unless an actual shared adapter is supplied.
9. **CI coverage and evidence.** Remove the repository-hygiene workflow's path filters so ordinary source PRs and main pushes run the scan. Inspection of the first green job showed the action itself scanned only one PR commit despite its job name. Add a separate explicit `--log-opts=--all` invocation over fetched history, using the action-installed pinned scanner version. Verify the actual command/log, not the job label. Pin the status job's Bun version. Preserve required job IDs, label site/browser checks accurately, and retain the existing pilot engineering report as a CI artifact for 14 days. Artifact availability does not authenticate human acceptance or provide permanent operational evidence storage.

## Read-only HSI database snapshot

Only catalog/aggregate SELECTs were used. No investigation content, account identifiers, session tokens, passwords or private host/branch pins were included in this report.

| Production component | Observation | Meaning |
|---|---|---|
| Agent checkpoint table | Present; 0 rows | Migration/component exists; no checkpoint records were observed in this snapshot |
| Fenced agent artifact table | 0 rows | No persisted agent artifact records were observed |
| Agent recovery decisions | 0 rows | No recovery-decision records were observed |
| Versioned brief review decisions | 0 rows | No versioned independent brief-review decisions were observed |
| Reviewer authority inventory | Aggregate query returned no scope/role groups | No authority-grant rows were observed; no reviewer was provisioned by this work |

The connector used an owner connection for these observations. They do not establish the application's actual runtime role, test pooled isolation, prove a data leak, determine whether evidence exists in some other system or certify any reviewer. Counts are a point-in-time inventory, not a lifetime claim. Earlier migration/RLS findings remain in the P0 handoff; no activation holds were removed.

## Acceptance requirements using the existing pilot gates

All live/scientific cases below remain **not accepted**. Owners remain unassigned until accountable humans provide authenticated records. Store sensitive details in an approved system, with opaque evidence ID/digest, exact deployed/code/schema/source hashes, UTC execution time, scope, expiry/revocation policy and independent verifier. A PR description or self-reported JSON `passed` flag cannot substitute for this evidence.

| Existing gate | Required live evidence and measurable exit |
|---|---|
| `revoked_session_and_reviewer_independence` | Real researcher A, researcher B and an independent reviewer. Deny self-review, revoked/banned/unverified sessions and wrong-scope review. Prove an SSc grant does not approve an RA case or an arbitrary immunology claim. Bind approval to exact package/source/version and declared scientific scope. Brief acceptance must not publish graph relationships. |
| `approved_sources_and_scientific_claims` | Named qualified scientific owner verifies the exact claims/materials and limitations. Document domain competence and conflicts; source rights/retraction and scientific acceptance remain separate. Immunology-wide approval requires separately accepted coverage, not a single disease role. |
| `two_identity_and_cross_owner_acceptance` | Actual authenticated HTTP save/reopen/review/revision/export using distinct isolation scopes. Cross-owner and cross-tenant access must be denied through real pooled connections, including retries and stale sessions. Local route fixtures do not count. |
| `deployment_and_shared_admission` | Pin the actual deployment and shared adapter/configuration. Exercise quota contention across multiple instances and users/tenants with server-derived identity. Prove consistent bounded denial, fail-closed dependency outage, cancellation, retry/idempotency and provider token/cost caps. No shared store is provisioned by this PR. |
| `monitoring_retention_and_incident_ownership` | Connect an actual protected trace/metric sink and alert destination. Prove correlation across request, stage, source/release, actual dispatch/provider request ID, output/checkpoint and independent decision. Retain model/prompt/configuration IDs and permitted source/clearance hashes. Demonstrate redaction, access control, retention, queue/error/abstention/spend monitoring and alert acknowledgement by the real incident owner. |
| `database_backup_restore_and_isolation` | Approved disposable HSI target, actual restore and invariant/isolation checks. Record measured recovery point/time and restored grant/session handling. Public JSON-artifact recovery is not a database restore. |
| `deployment_rollback_rehearsal` | Pin independently accepted fallback deployment and schema/artifact compatibility. Record controlled outage, actual alert delivery/acknowledgement, mitigation, rollback/forward recovery, restored behavior and post-incident review. Test unknown write acknowledgements with idempotent retries; do not assume rollback. |
| `pilot_data_terms_and_team_acceptance` | Real research team completes the agreed scope and reviewers sign the exact evidence packet. All prior live/scientific dependencies must be independently accepted before release. |

## Safe incident rehearsal sequence

On an explicitly approved non-production HSI environment, the accountable operator should: pin candidate and fallback versions; trigger a bounded provider/shared-limiter failure; verify the correct 429/503 and safe correlation records; verify an alert actually reaches its destination; record human acknowledgement and mitigation times; recover without duplicate decisions; verify source/role isolation; and have the independent owners accept the protected evidence. Run backup/restore and deployment rollback as their own controlled rehearsals. This document does not send alerts, assign an on-call person, change settings or certify any of those steps.

## Remaining release conditions

- Activate the existing durable stores only after scope/identity/fencing/isolation acceptance; add actual tool-dispatch/completion receipts at the trusted tool boundary rather than reinterpret permission checks as executions.
- Connect distributed quota/provider budget and observability services with approved configuration. No synthetic dashboard or local logger proves a working production sink.
- After validating the new history-scan job, the security owner must decide whether to make it a required protected-branch check. This PR changes workflow coverage, not branch-protection administration or historical Git data. Investigate/rotate any real secret finding; do not add an allowlist merely to get a green result.
- Keep the existing pilot importer fail-closed (`pilotReady:false`, unverified operator records). Retain durable, independently authenticated operational/scientific sign-offs outside short-lived CI artifacts.
- No automated evidence in this increment grants scientific approval, graph promotion, live CDS/PHI access or production activation.
