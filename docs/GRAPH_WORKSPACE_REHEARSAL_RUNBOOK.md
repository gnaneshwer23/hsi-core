# Graph workspace rehearsal runbook (migrations 031 to 033)

**Status: steps 1 to 6 executed on 14 November 2026 on a disposable branch; not accepted.** The result is in [GRAPH_WORKSPACE_REHEARSAL_RESULT_20261114.md](GRAPH_WORKSPACE_REHEARSAL_RESULT_20261114.md). The role design and the disposable branch were approved by the owner for rehearsal only. Step 7 (real-account acceptance) ran once the same day: see [GRAPH_WORKSPACE_ACCEPTANCE_RUN_20261114.md](GRAPH_WORKSPACE_ACCEPTANCE_RUN_20261114.md) (47 of 47, not accepted without an independent signer). Applying anything to the production branch is not approved and is outside this runbook.

## What is approved and what is not
| Item | State |
|---|---|
| Role design: `hsi_graph_function_owner`, `hsi_graph_runtime` (+ login), `hsi_ontology_import` (+ login) | Approved for rehearsal (owner, 14 Nov 2026) |
| Creating a disposable Neon child branch | Approved and used (14 Nov 2026) |
| Applying 031 to 033 to the production branch | Not approved |
| Removing 031 to 033 from `HELD_MIGRATION_IDS` | Not approved; only after an accepted rehearsal |
| Wiring `src/db/graphWorkspaceStore.ts` into any route | Not approved; a later change |

## Role design
- `db/roles/hsi_graph_roles.sql` creates five roles, idempotently, with **no passwords**. None is a superuser, none has `BYPASSRLS`, none can create roles or databases.
- The migrations run as `hsi_graph_function_owner`, never as `neondb_owner` or any superuser or `BYPASSRLS` role, so a missing policy fails visibly instead of being hidden.
- The web runtime connects as `hsi_graph_runtime_login`, a member of `hsi_graph_runtime`, which can only EXECUTE the six public procedures in 032. It has no table access and cannot call the helper that derives the principal.
- Ontology reference data is written only by `hsi_ontology_import_login` (033): INSERT on the two ontology tables, append-only, no other access.
- Passwords for the two login roles and the owner login are set out of band in the Neon console or API by the owner. They never appear in SQL, chat, logs or the repository.

## Before anything starts (owner checklist)
1. Approve creating one disposable child branch in the **HSI** Neon project only (never the ISI, Akeno or DeliverX projects).
2. Name an independent security signer for acceptance (not the author of these files).
3. Confirm Neon Auth is provisioned on the branch and that test researchers will use **pseudonymous test accounts**.
4. Set the pins in the private environment: `HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN`. Never commit them.

A child of the production branch is a copy-on-write copy of production data, including real authentication records. Treat it as production-sensitive: no dumps, no screenshots of rows, no sharing the connection string, and delete it at the end.

## Steps
1. **Create** a child branch of the production branch: non-default, non-primary, expiry within 24 hours. Record its id.
2. **Verify the target** with `assertDisposableRehearsalTarget` (`src/db/migrationRehearsal.ts`) using the pinned project and branch ids. Stop if it throws.
3. **Create roles** by running `db/roles/hsi_graph_roles.sql` as the project owner. Then the owner sets passwords for `hsi_graph_function_owner`, `hsi_graph_runtime_login` and `hsi_ontology_import_login` in the console. Capture the output of:
   `SELECT rolname,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolcanlogin FROM pg_roles WHERE rolname LIKE 'hsi\_%' ESCAPE '\' ORDER BY 1;`
4. **Check prerequisites on the branch**: that migration 006 is applied (`hsi_research_access` exists) and that Neon Auth has the columns the procedures read: `neon_auth."user"(id, "emailVerified", banned)` and `neon_auth.session(token, "userId", "expiresAt", "impersonatedBy")`. If any differs, **stop and report**; do not edit the procedures on the branch.
5. **Apply** `031`, `032`, `033` in order as `hsi_graph_function_owner` (connection string from the private environment, not echoed). Save the full output.
6. **Run the SQL checks that are safe on a real schema**: `db/verify/031_graph_workspace_storage_checks.sql` (self-contained, rolls back). Do **not** run `032_*`, `033_*` or the integration setup on Neon: they create a stand-in `neon_auth` schema and cluster roles and are for throwaway local databases only.
7. **Real-account acceptance** (runner: `scripts/verify-graph-workspace-neon.ts`; it refuses any target that is not the confirmed disposable endpoint). With two test researchers and one account without a grant, using real sessions, it must show:
   - each researcher sees only their own investigations and recommendations;
   - a forged, expired, impersonated, unverified, banned or revoked session is refused;
   - a researcher without an active grant is refused;
   - direct table access as the runtime role is refused, including after setting any custom setting;
   - a broken revision chain and an approval flag are refused by the database;
   - a record edited underneath the application is refused on read by the adapter;
   - the import role can add a release and terms and nothing else;
   - concurrent saves of the same revision: exactly one succeeds.
8. **Teardown**: delete the child branch, confirm it no longer exists, and confirm production was untouched.

## Stop conditions
Stop and report, without improvising, if: the target assertion throws; a prerequisite differs; any migration statement errors; any check fails for a reason other than the intended one; a role has an unexpected attribute; or any step would touch another branch or project.

## Evidence for the acceptance packet
Branch id, parent id, expiry and target-assertion result; role-attribute output; prerequisite query output; full migration output; check outputs; runner output with per-check pass or fail; teardown confirmation; the exact commit of this repository; the independent signer's decision with date. Keep row contents, tokens and connection strings out of the packet.

## What a pass would and would not show
It would show the procedures and roles behave as designed on Neon's PostgreSQL with real Neon Auth sessions. It would not show production readiness, scientific validity, performance under load, or that any other migration is safe. Activation is a separate, scoped decision after acceptance.
