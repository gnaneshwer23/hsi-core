# P0-C persistence, isolation and human authority — 12 November 2026

**Decision: NOT ACCEPTED.** Actual HSI-only catalogue inspection, isolated SQL rehearsal and read-only snapshot-restore validation were performed. Two real researchers in separate isolation scopes, independent reviewer/security signer, authenticated HTTP/pool tests and signed release evidence remain unavailable. Do not turn component results or merged PRs into production readiness.

Baseline main `0b264c0` includes P0-B. See `operations/staging/p0c-engineering-observation.v1.json` for sanitized observations and exact migration-file digests. Private project/branch/endpoint identifiers and credentials are intentionally excluded. Real resource pins remain private; no environment credential files were changed.

## Actual read-only source inspection

The existing HSI project and default production branch were verified through the connected Neon account. Owner-connection catalogue/ledger SELECTs returned:

- 18 ledger rows ending at `017_hsi_experiment_ledger`; the extra legacy `012_isi_research_review` alias explains the row count. No 018–030 ledger entries were present.
- No dedicated `hsi_*` runtime roles in the production role catalogue. Managed Neon roles are not interchangeable application runtime credentials.
- The inspected older interrogative workspace/context/revision/run/review tables belong to `neondb_owner`; their RLS enabled/forced flags are false. This is a release blocker, not proof that an authenticated cross-user HTTP leak has been demonstrated.
- The earlier isolated contradiction staging branch has forced RLS and two safe-flagged NOLOGIN roles. Its main ledger still ends at 017 despite manual schema rehearsals, so ledger rows alone do not describe all objects there. It has no demonstrated dedicated application LOGIN/pool acceptance.
- The inspection connection was the connector's `neondb_owner`, which has BYPASSRLS. It is not evidence of the application's configured runtime identity or effective restrictions.

A final read-only production health request returned `configuration_validated`, `writesEnabled:false`, `databaseConnectionTested:false`. The production branch remained default/primary/ready after the rehearsal. Health does not establish a successful database login or scientific approval.

## Disposable rehearsal and recovery evidence

A fresh child branch of the verified HSI production branch was created with a 0.25-CU cap, five-minute idle suspension and automatic expiry at **20:19:55 UTC on 12 November 2026**. Migration holds 022–030 remain unchanged. No community migration/route was exercised. No real users, sessions, memberships or reviewer grants were fabricated or changed.

The branch contains only a dedicated synthetic rehearsal-marker/probe schema in addition to its inherited baseline. Reviewed SQL definitions were executed inside explicit exception subtransactions, inspected, then deliberately rolled back; the final catalogue confirmed the new scope objects/roles were absent. No normal migration ledger was advanced.

| Scope | Actual result | Acceptance limit |
|---|---|---|
| Older interrogative workspace | Four workspace/submission/decision/context tables inspected; not all have forced RLS | No schema or auth activation; no real pooled HTTP isolation tested |
| Scientific records, 022 | Table creation compiled; enabled + forced RLS observed; transactional rollback verified | No runtime policy/grant or usable application connection provisioned |
| Contradiction ledger, ordered 024–029 | Definitions compiled in order; three tables forced RLS; runtime direct SELECT/INSERT denied; nonexistent synthetic session denied through restricted read procedure as runtime role; table/role rollback verified | Role was NOLOGIN under temporary SET ROLE within the rolled-back test. This is not a real authenticated LOGIN/pool or two-account HTTP test |
| Live evidence, 030 | DDL compiled; a temporary synthetic runtime SELECT grant plus forged owner-ID setting exposed the synthetic other-owner row; table/role/data changes rolled back | The draft owner-ID GUC policy is NOT acceptable. Existing live adapter already refuses it; the separately proposed verified-session policy remains held pending independent review. No live route activated |

The first contradiction fake-session probe ran as migration owner after function ownership transfer and was denied EXECUTE. That entire attempt rolled back. The successful retry used the intended restricted runtime role with temporary role membership; that membership was also rolled back. Do not present the owner-denied attempt as proof of session verification.

Neon rejected snapshot creation on the child branch (`not allowed to snapshot non-root branch`). A read-only root snapshot was therefore created as the recovery source. It was restored with `finalize:false` into a new validation branch and inspected through a separate **read-only** compute. Its 18-entry migration ledger and public-table column/type/nullability/RLS fingerprint matched the source (`525ce18aa8ee4337b26cb4bc937f36f923da525186cdfcde2f9d4cb7be1c12f2`). The rehearsal schema was absent from both source and restore.

This validates readable recovery of that catalogue/ledger slice. It does not validate all row contents, constraints/indexes/functions/ACLs, application cutover, pooled sessions, credential revocation after restore, or accepted RPO/RTO. No restore finalization or production compute reassignment occurred. The unfinalized restore is for validation only; finalizing it would be a separate destructive/cutover operation and is not authorized by this handoff. Snapshot and rehearsal/restore branches have the same short expiry. No deletion/reset/finalization tools were invoked.

## Code defects fixed

1. **Unsigned checklist cannot authorize activation.** `src/db/contradictionActivationGate.ts` now reports checklist structural completeness separately and always keeps unsigned `ready:false`. A caller's passed flag, verifier name and HTTPS URL are not independent security evidence. Existing runtime paths do not consume this legacy helper; this prevents misleading readiness from its public contract.
2. **Exact live owner policy.** `src/db/liveEvidencePolicyGate.ts`, `a01PreviewPreflight.ts` and `neonLiveEvidenceStore.ts` require one exact verified-owner equality, correct policy/role/command and both read/write predicates. An expression containing the expected function followed by `OR true`, extra permissive policies or PUBLIC role cannot pass on a substring match.
3. **Actual runtime login and reachable privileges.** The live adapter checks current and session login identity, LOGIN/NOINHERIT/non-owner/non-superuser/non-BYPASSRLS/no role/database creation, no auth-table reads, no schema CREATE, no DELETE/TRUNCATE and no reachable privileged role/function-owner membership. Owner credentials hidden behind SET ROLE are refused. No role is created or granted by this code.
4. **Signed scope-specific acceptance.** `src/db/persistenceSecurityAcceptance.ts` verifies a pinned Ed25519 independent security signer, non-submitter signer/reviewer, distinct researcher principals and isolation-scope hashes, exact staging target/configuration/commit/scope binding, freshness/revocation and all 17 required evidence checks. Protected artifacts are loaded by digest, bounded and hash-checked; authenticated HTTP requirements cannot be substituted with SQL-only/fixture records. Production/community scope cannot be authorized. Verification is staging evidence acceptance only and always leaves production activation and scientific approval false. No actual signed packet/authority is invented, and no route/write switch is wired to auto-activate from this helper.
5. **Reproducible safe preparation.** `src/db/migrationRehearsal.ts` splits actual PostgreSQL scripts while preserving quoted/dollar bodies and nested comments, maps the four independent migration scopes, excludes community and validates an exact expiring non-production child pin before preparing a rehearsal. It never connects, removes holds or executes SQL itself.

Tests include independent signer/participant/scope checks, wrong target/commit, fixture/SQL-as-HTTP denial, digest corruption, missing artifacts, bounded unresponsive evidence storage, forged policy disjunctions, privilege escalation, SQL splitting and retained holds. Cryptographic test fixtures are not real security sign-offs or real-account evidence.

## Remaining exit matrix

| Required exit | Current state / owner action |
|---|---|
| Two real researchers in distinct scopes plus independent reviewer | **Pending.** Approved staging URL, identity/secret-manager references and named reviewer/security signer were requested. No account creation, password resets, synthetic auth-session insertion, invitations or broad disease grants were performed |
| Actual restricted pooled application connection | **Pending.** Provision a dedicated non-owner/non-superuser/non-BYPASSRLS LOGIN with no dangerous role membership; inspect current/session identity and all effective RLS/procedure/ACL paths under that real connection |
| Cross-owner/tenant reads, enumeration, edits, export | **Pending real authenticated HTTP execution.** SQL metadata and a synthetic fake token do not count |
| Forged settings/sessions, self-review, revoked grants and wrong-scope review | Partial SQL negative evidence only; full real-account HTTP denial matrix remains **pending**. Do not infer immunology-wide reviewer authorization from SSc/RA grants |
| Exactly one immutable submission/decision under concurrency/retry | Existing code/fixtures are not live evidence; actual pooled concurrent HTTP tests and unknown-acknowledgement/idempotency checks **pending** |
| Logout/session revocation and connection reuse | **Pending.** Test expired/revoked sessions, role/membership revocation and interleaved accounts on real pooled connections |
| Ordered migration/rollback and restore | Selected DDL/subtransaction rollback and read-only restored catalogue/ledger validation observed. Post-commit schema/data rollback, realistic application restore, role/session handling, accepted recovery timing and independent sign-off remain **pending** |
| Signed security evidence and production release | **None issued.** Complete each scope's protected evidence packet at its exact reviewed candidate/configuration, have the independent owner sign it, verify freshness/revocation and preserve separate explicit release approval. Do not remove 022–030 holds as a batch |

Production remains read-only at the observed endpoint. No production SQL writes, environment changes, grants, migration-ledger updates, restore cutover or merges were performed by the assistant. The newly created snapshot/branch/compute resources are isolated rehearsal/recovery metadata, not production activation.
