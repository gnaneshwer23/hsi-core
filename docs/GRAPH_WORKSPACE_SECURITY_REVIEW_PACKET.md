# Graph workspace: independent security review packet (migrations 031 to 033)

**Status: DRAFT for a reviewer who has not yet been named or engaged.** Nothing here is accepted. Migrations 031 to 033 stay on the hold list (`src/db/migrationHolds.ts`) and are applied nowhere except two deleted, disposable Neon branches. This packet is written by the author of the work, so it is a map for a reviewer, not a conclusion.

## 1. What you are being asked to do
Review the database security design for storing researcher-owned investigations and ontology-mapping recommendations, and say whether it is sound enough for the owner to consider activation. You are asked for a written finding, not a pen test of the website.

**In scope:** `db/roles/hsi_graph_roles.sql`, `db/migrations/031_hsi_graph_workspace_storage.sql`, `032_hsi_graph_workspace_procedures.sql`, `033_hsi_ontology_import_role.sql`, `src/db/graphWorkspaceStore.ts`, the checks in `db/verify/`, the two runners (`scripts/verify-graph-workspace-local.ts`, `scripts/verify-graph-workspace-neon.ts`), and the two result records listed below.
**Out of scope:** the public website, the research evidence pipeline, scientific validity of any graph content, performance, and any other migration.

## 2. What the system is (one paragraph)
Researchers sign in through Neon Auth (Better Auth). A server-side adapter passes the caller's session token to six `SECURITY DEFINER` PostgreSQL procedures. Each procedure validates the token against `neon_auth.session` and `neon_auth."user"` inside the same transaction, requires an active row in `hsi_research_access`, and only then reads or inserts rows owned by that principal. The application's database login (`hsi_graph_runtime_login`) can execute those six procedures and nothing else: no table access. All four tables have forced row-level security with no policy for the runtime role, are append-only (triggers), and carry digest chains. Records are candidate-only and carry `scientificApproval=false`; the database enforces that. There is no PHI and no clinical decision support in this repository.

## 3. Threat model the design targets
| Threat | Intended defence |
|---|---|
| A caller supplies someone else's identity | Identity is derived from a validated session token inside the procedure; the browser supplies no owner or principal. |
| Forged, expired, unverified, banned or impersonated session | Refused by `hsi_graph_principal`. |
| A user without a research grant | Refused by the grant check. |
| SQL access as the application login | No table privileges; forced RLS with no runtime policy. |
| Editing or deleting history | Append-only triggers; no UPDATE or DELETE policy; digest and chain recomputed on read by the adapter. |
| Claiming approval, or a record that cannot be reproduced | CHECK constraints (`scientificApproval`, schema version, graph version, object type); adapter recomputes digests. |
| Backdating a curator decision | Procedure bounds the decision time to the last 10 minutes and the next minute. |
| Ontology data tampering | Separate import role with INSERT only; tables append-only. |

## 4. Where I most want your scepticism
Ordered by how little I trust my own answer:
1. **Session validation in `hsi_graph_principal`.** Can any path reach a researcher's rows without a valid, current session? Consider token comparison, time-of-check versus time-of-use inside one transaction, session rotation or revocation lag in Neon Auth, and whether `impersonatedBy IS NULL` and `emailVerified` are the right and complete conditions for Better Auth's schema.
2. **`SECURITY DEFINER` hygiene.** `search_path` pinning (`pg_catalog, public` and, for the principal helper, `neon_auth`), schema-qualified references, `EXECUTE` grants (`REVOKE ... FROM PUBLIC` then a grant to the runtime group), and whether any definer function can be coerced into running attacker-chosen SQL or operators.
3. **Forced RLS plus definer policies.** The function owner gets explicit `SELECT` and `INSERT` policies (`TO current_user`). Is that the smallest correct design? Does anything depend on the owner being a non-superuser and non-`BYPASSRLS`, and is that enforced or only documented?
4. **Role and privilege model on Neon.** The migrations must run as `hsi_graph_function_owner`, not as the project owner (which has `BYPASSRLS`). Review `db/roles/hsi_graph_roles.sql` for anything that lets the runtime login, the import login or a Neon-created role escalate, including role membership, `SET ROLE`, and default privileges.
5. **Pooled connections.** The runtime login connects through Neon's PgBouncer pooler. Does the design rely on any session state (it should not)? Is anything leaked between clients?
6. **Information leakage in errors and timing.** Distinct errors for "invalid session" and "no research access" reveal that a token was valid. Is that acceptable? Do error messages expose schema or row data?
7. **Append-only completeness.** Triggers block UPDATE, DELETE and TRUNCATE; trigger functions have `PUBLIC` execute revoked. What about `ALTER TABLE ... DISABLE TRIGGER` by the table owner, `session_replication_role`, `COPY`, logical replication, and a Neon branch reset? These are owner-level actions the design assumes the owner will not take.
8. **Denial of service by a researcher.** Records are capped at 1 MiB; there is no per-user quota or rate limit in the database.

## 5. Evidence already produced (author-run, not independent)
- `docs/GRAPH_WORKSPACE_REHEARSAL_RESULT_20261114.md`: first Neon rehearsal on a disposable branch with synthetic sessions: 39 of 41, then 7 of 7 after correcting two wrong expectations; one real finding (`PUBLIC` could execute the trigger functions) fixed.
- `docs/GRAPH_WORKSPACE_ACCEPTANCE_RUN_20261114.md`: second disposable branch, real Neon Auth sessions, adapter as the runtime login: 47 of 47. Includes its own list of what it did not cover.
- Local PostgreSQL 14 run: 16 end-to-end checks through the adapter, and SQL checks mutation-tested (each check was shown to fail when its control was removed).

## 6. Known gaps (so you do not have to discover them)
- No independent review has happened; every result above was produced by the author of the code.
- Email verification and the research grant were set by the project owner as test setup; Neon Auth's own verification, rotation, revocation and rate-limit behaviour were not exercised.
- Server-side TLS could not be confirmed through the pooler; the client enforced certificate verification. No direct non-pooled run.
- Concurrency tested at six clients on one account only.
- The acceptance runner's checks have not been mutation-tested.
- The test branches were copies of production, so they contained production authentication rows. Only a user count was read.
- The adapter is imported by no runtime code; a test enforces that.

## 7. How to reproduce
Do not run anything against production. You can reproduce locally with a throwaway PostgreSQL: `db/verify/graph_workspace_integration_setup.sql` and `scripts/verify-graph-workspace-local.ts`. To reproduce on Neon you need your own disposable child branch in an HSI-owned project, which only the owner can provide; `scripts/verify-graph-workspace-neon.ts` refuses any target that is not the confirmed disposable endpoint. You will not be given credentials, connection strings or production rows.

## 8. What the owner will do with your finding
Nothing is activated on a finding alone. A pass lets the owner consider, as a separate decision, removing 031 to 033 from the hold list and a scoped activation. Any finding rated blocking stops that path until fixed and re-reviewed.

## 9. Finding format requested
For each issue: severity (blocking, should fix, note), the file and line, how it fails, and a proposed fix. End with one of: **accept**, **accept with conditions** (list them), or **do not accept**, plus what you did and did not review.

## 10. Sign-off block
| Field | Value |
|---|---|
| Reviewer name and organisation | _to be filled by the reviewer_ |
| Independence statement (no part in writing or running this work; no financial interest in the outcome) | _to be filled_ |
| Commit reviewed | _to be filled_ |
| Scope actually reviewed | _to be filled_ |
| Decision | accept / accept with conditions / do not accept |
| Conditions | _to be filled_ |
| Date | _to be filled_ |

This packet makes no claim of regulatory clearance, clinical safety or production readiness, and a reviewer's signature would not either.
