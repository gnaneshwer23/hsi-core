# HSI research pilot operating runbook

This procedure is for accountable operators, on approved HSI targets. It does not grant authority to change production. No person, organisation, agreement or acceptance is invented here. See [Phase H scope and limitations](PHASE_H_RESEARCH_PILOT_OPERATIONS.md).

## Assign ownership before live work

| Responsibility | Accountable owner | Evidence |
| --- | --- | --- |
| Release, deployment, maintenance and rollback | Unassigned | Real owner and approved deployment record required |
| HSI database, backups, restores, RLS and auth alignment | Unassigned | Approved HSI target/restore record required |
| Independent source/scientific review | Unassigned | Rights and independent scientific decisions required |
| Monitoring, abuse controls and incident response | Unassigned | Live shared admission, alert and response drill required |
| Research data terms, retention and permitted use | Unassigned | Signed/approved terms and actual storage policy required |
| Research-team pilot acceptance | Unassigned | Real team, separate identities and recorded full journey required |

The owner references in the evidence inventory are opaque operational record pointers, not identity verification. Do not put passwords, OTPs, session tokens, database URLs, private storage URLs or full user records in public receipts, CI artifacts or chat. Store sensitive operational evidence in approved access-controlled systems and reference its immutable digest.

## Before a staged pilot rehearsal

1. Record candidate Git/deployment IDs and a separately verified last-known-good deployment. A previous Git commit is not automatically a known-good deployment.
2. Confirm source/release/manifest hashes and methods; independent rights/scientific acceptance must cover the exact included material. Draft candidates, context locators and workflow acceptance do not approve science.
3. Resolve auth/provider/database visibility against the intended HSI branch. Use HSI `red-wave-06625195` only for HSI services; no product/shared patient database. Keep the documented host, branch, write and scope checks restrictive. A new restore target may need an explicitly reviewed test-target binding; never broadly permit arbitrary Neon hosts to make a smoke pass.
4. Verify schema and trusted grants on the approved staging target. Never run HSI migrations on ISI/Aksh databases. Do not automatically migrate production or grant reviewer permissions at signup.
5. Keep research writes off until approved staged writes are needed. Confirm a production host cannot enable writes by copying staging environment flags. Verify required shared admission before enabling its fail-closed flag. Test quota rejection and dependency outage across multiple deployed instances, not only a single local process.
6. Establish alert destinations, privacy-safe logs, retention/access owners and response expectations. Exercise request-ID correlation without logging request bodies, user identity, cookies, credentials or complete URLs. Check platform and provider logs separately.

## Identity, ownership and scientific review rehearsal

Use two real, separately provisioned test accounts; credentials stay with their owners. Verify ungranted, expired, banned/revoked and wrong-branch sessions fail. A client-supplied user ID/role must not alter access. Another researcher must not read or revise the first researcher’s draft. A reviewer must have an active independent scope grant and cannot review their own investigation.

Record create/save/reopen, graph/source access, fixed-package export, independent decision, requested revision and defined resubmission against the same pinned release. Verify lost-acknowledgement retries are idempotent and source-access revocation fails closed. Acceptance is evidence-brief scoped; it does not publish graph relationships, validate every hypothesis, approve trial eligibility or grant clinical use.

## HSI database backup/restore rehearsal — not yet performed

1. Confirm actual backup/PITR capability, retention, region, encryption and access with the database owner. Agree recovery objectives with the real team; do not invent an SLA.
2. Select an approved backup/point and create a **separate, approved non-production HSI recovery target**. Record project/branch/database/schema versions privately. Do not restore over production or an active shared staging database during this rehearsal.
3. Recover compatible code and schema from verified revisions. Validate migrations and source records; do not delete append-only decisions, context snapshots, grant/audit history or revision links to make counts agree.
4. Compare record counts, primary/foreign keys, release/package/content hashes and audit lineage through approved tooling. Keep raw rows and user/session data out of public reports.
5. Review provider sessions, session invalidation and grants with the trusted auth/database owner. A restored provider identity must not silently gain roles. Re-run the two-account/cross-owner/reviewer-independence checks, including stale/revoked sessions and source permissions.
6. Keep writes disabled until the recovery target passes all agreed checks and the owner records acceptance. Remove the disposable recovery target only through the approved cleanup procedure. Record actual elapsed/recovery-point measurements and any unmet objectives.

`pilot:check` proves none of these database steps. Its temporary restore is public-artifact recovery only.

## Deployment rollback rehearsal — not yet performed

1. Record the incident, candidate/current deployment, exact code/schema/artifact compatibility and independently verified fallback deployment. If no verified fallback exists, enter maintenance and investigate; do not label an arbitrary old deployment good.
2. Use the approved Vercel/operator workflow to enable research maintenance or disable writes as appropriate. Auth/sign-out should remain available. Environment changes require deployment/redeployment and verification; a saved setting alone is not proof that the running functions changed.
3. Prefer a verified compatible deployment rollback or a forward fix. Do not force-push, reset published history, drop tables, delete decisions or infer a transaction rolled back because a client timed out.
4. Check old/new API, schema, package/decision versions, source hashes, independently pinned product contracts and cookie/origin compatibility. If incompatible, remain in maintenance until an approved forward recovery is ready.
5. Test health semantics, request IDs, auth, permission denials, read/export parity, controlled staged writes/idempotent retries and shared admission. Verify multiple instances and actual public origin. Configuration health does not test credentials/database/science.
6. Have the release/database/scientific owners review the evidence appropriate to their scopes before ending maintenance. Record real deployment IDs, UTC times, outcomes and unresolved impact. Do not claim this local code delivery performed the rehearsal.

## Incident triage

| Signal | Immediate bounded action | Owner |
| --- | --- | --- |
| Rate/shared-admission denial | Check perimeter/provider abuse and dependency health; never fail open to make requests succeed | Incident/release owner |
| Auth/database visibility mismatch | Keep access denied; verify intended branch, session and RLS through trusted tools | Auth/database owner |
| Permission or source-scope regression | Enter research maintenance; preserve append-only evidence/audit history; assess affected scope | Release + data/scientific owners |
| Unknown write acknowledgement | Inspect the saved request/version and retry idempotently; do not blindly create a new decision | Release/database owner |
| Tampered/unsupported source artifact | Keep it unavailable and preserve prior snapshot; review independent pin/signature policy | Source/release owner |
| Dependency advisory | Assess affected code and patch/rollback with tests; do not silently waive the CI result | Security/release owner |

This runbook does not send notifications or configure on-call tooling. Assign real owners and test the response path.

## Acceptance record

Retain exact deployed/code/schema/release hashes, UTC scope, separately authenticated responsible owners, actual test/restore/rollback evidence and signed data/scientific terms. Reference protected evidence by immutable opaque ID/digest in `operations/pilot/evidence.pending.json` or a separate supplied evidence file. Imported records remain `operator_reported_unverified`; independent approval/authority verification is a separate live process. No local JSON field activates the pilot.
