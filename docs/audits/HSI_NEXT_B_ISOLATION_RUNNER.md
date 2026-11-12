# Next-B: isolated staging observation runner

## Confirmed operating decision

Live acceptance is BLOCKED. The user has not supplied an approved isolated staging URL, private configuration, two independent researcher accounts, reviewer, security signer or approval record. `operations/staging/next-b-acceptance.pending.json` records the references as UNASSIGNED/NOT_APPROVED. Do not invent accounts/URLs, substitute production identities, execute live probes, activate schemas or remove migration holds.

## Built in this increment

`createStagingIsolationRunner` provides a bounded, default-disabled HTTP observation runner for one exact scope/target/configuration/commit. It validates the entire plan before sending anything, confines requests to the exact approved HTTPS origin and research routes, refuses known production origins and redirects, requires explicit staging mutation permission, obtains sessions only through a trusted server callback, rechecks authorization for each probe and applies response/deadline bounds. No sessions, raw response bodies, request bodies or transport errors are returned. Responses must match both the expected status and exact canonical JSON digest; a denied status alone cannot pass. A mismatch/error stops execution without retry. Concurrent runs on the same runner are refused.

The transport is a trusted server dependency, not client input. Its real implementation must enforce redirects, DNS/egress and target pins; the runner is not a new approved network transport. The approved origin/production-origin list and authorization callback must derive from independently reviewed configuration, never request parameters or model output. Fixture mode is explicit metadata, not proof of actual execution. The runner never emits a signed security packet or marks acceptedForScope true. Its observations require protected underlying evidence and independent examination before the existing verifier may consume a separately signed packet.

## Separate scope acceptance

Maintain one packet and migration/rollback rehearsal per `interrogative_workspace`, `scientific_records`, `contradiction_ledger` and `live_evidence`. Bind current project/branch/route-schema/runtime-config hash and candidate SHA via the existing `persistenceTargetHash`. Do not infer the database ledger from repository holds. Community writes are deferred. The earlier temporary P0-C branches expired; their historical observations are not current acceptance.

For each scope, independently inspect the actual current ledger and runtime current/session identities, ownership, LOGIN/superuser/BYPASSRLS flags, inherited/reachable privileges, effective forced RLS, policies, procedures and ACLs. The recorded live-evidence owner-setting weakness remains a remediation prerequisite. None of these catalogue checks is established by an HTTP status.

## Required real-account plan before acceptance

1. Positive controls: each researcher creates/reads/exports its own disposable record using actual authenticated sessions in different isolation scopes; approved reviewer reads only assigned scope. Include expected exact response assertions and independent identity/scope evidence.
2. Interleave researcher A/B over the real pooled runtime; attempt cross-owner/tenant record reads, enumeration, edit and export. Check exact denial bodies and prove absence of other-scope contents with protected evidence; blanket 404s without working controls are insufficient.
3. Attempt forged owner/session settings and request identity fields, missing/invalid sessions, self-review, wrong-domain/scope review and revoked reviewer grants. Verify independent reviewer success separately. Do not give a disease reviewer universal authority.
4. Actually revoke/logout the disposable session and repeat on reused connections. A synthetic invalid-cookie response alone does not demonstrate effective logout.
5. Drive concurrent identical submissions/decisions through actual routes using the same idempotency request, then inspect durable rows/hashes for one immutable operation. The observation runner is sequential; use a separately reviewed concurrency driver and database assertions for this acceptance check. Runner mutual exclusion is not application concurrency evidence.
6. Rehearse ordered scope migrations and rollback/restore on a newly approved disposable HSI branch using the existing rehearsal helpers. Verify rows, functions, policies, roles, sessions and application cutover/recovery as required. No SQL or restore operations are performed by this runner.
7. Preserve protected evidence by digest and have the independent scoped security signer review and sign the existing acceptance packet. Fixture/SQL-only evidence cannot substitute for authenticated HTTP. Verify through `createPersistenceSecurityVerifier`. Staging scope acceptance still grants no production activation or scientific approval.

## Verification boundary

Deterministic tests cover disabled/production guards, malformed later probes causing zero dispatch, authorization/session failure, cross-scope response mismatch, explicit self-review/revoked-session denial contracts, interleaved actor handling, bounded stalled transport and runner mutual exclusion. Existing security-verifier, migration-rehearsal, policy, auth and service tests remain required. These are contract tests, not live isolation/rollback evidence. Completing this code increment does not complete Next-B acceptance.
