# Graph workspace rehearsal result, 14 November 2026

**Status: rehearsal executed on a disposable branch; NOT accepted.** No independent security signer has reviewed this, nothing was applied to the production branch, and nothing was wired into the application. Real project, branch and host identifiers are kept in the private environment, not in this file.

## Authority and target
- The owner approved the role design for rehearsal and, separately, creation of one disposable child branch (14 Nov 2026).
- The branch is a child of the production branch in the HSI project only: non-default, non-primary, expiring about 20 hours after creation. `assertDisposableRehearsalTarget` accepted it, and refused the production branch as a negative control.
- Every database call named the disposable branch explicitly. An attempt to read the production branch afterwards (to confirm it was untouched) was blocked by the tool's permission control and was **not** worked around. The assurance that production was untouched therefore rests on the explicit branch id on every call, not on a production read.
- Because a child of production copies production data, no row from real tables was read. Only schema metadata and aggregate counts were queried. Test users and sessions were synthetic, created inside transactions that were rolled back on purpose.

## What was run
1. Prerequisite checks (schema only): migration 006's `hsi_research_access` exists; Neon Auth has the `user` and `session` columns the procedures read, with the expected types; PostgreSQL 18.7; the project owner role is **not** a superuser but **has `BYPASSRLS`**, which confirms migrations must not run as it.
2. `db/roles/hsi_graph_roles.sql`: five roles created with the intended attributes (none superuser, `BYPASSRLS`, create-role or create-db).
3. Migrations 031, 032 and 033 applied as `hsi_graph_function_owner`. Tables owned by that role with forced row-level security; the six public procedures are SECURITY DEFINER, executable by the runtime role and not by PUBLIC; the principal helper is executable by nobody else.
4. A rolled-back check transaction against the real Neon Auth schema with synthetic sessions.

## Results (real Neon Auth schema, synthetic sessions)
First run: 39 of 41 passed. The two that did not pass were **wrong expectations, not defects**: I expected the function owner's UPDATE and DELETE to raise the append-only error, but with no UPDATE or DELETE policy they touch zero rows, so the row trigger never fires. A focused re-run asserted the right behaviour, 7 of 7 passed: function-owner UPDATE and DELETE touch zero rows; TRUNCATE is blocked; the project owner (which bypasses RLS) is stopped by the trigger on UPDATE, DELETE and TRUNCATE; the saved row survives.

| Area | Result |
|---|---|
| Import role | adds a release and terms; cannot read, update, delete, or call a procedure |
| Runtime role | cannot read any of the four tables, cannot insert reference data, cannot call the principal helper, and a forged owner setting opens nothing |
| Sessions | unknown, short, expired, unverified, banned, impersonated refused; no grant and revoked grant refused |
| Scoping | each researcher sees only their own investigations and recommendations; cross-owner read returns nothing |
| Integrity | broken chain, approval flag and double-encoded record refused; obsolete term and backdated decision refused |
| Identity | recommendation identity is recorded as server-verified |
| Lookup | exact-synonym lookup works; a too-short label is refused |
| Cleanup | after the rolled-back run: 0 synthetic users, sessions, grants, releases, terms, investigations or recommendations remain |

## Finding fixed
PUBLIC could EXECUTE the three trigger functions (a default). They cannot be used for anything, but 031 now revokes it, `db/verify/033_*` asserts it, and a mutation without the revoke fails the check.

## Not covered
- **Real accounts**: users and sessions were synthetic rows in the real Neon Auth tables, not real sign-ins through the application.
- **Pooled TLS connection as the runtime login**: the login roles have no passwords, so the adapter was not run over a real connection. The adapter was verified only against a local PostgreSQL 14.
- **Concurrency**: two simultaneous saves of the same revision were not tried.
- **Neon Auth behaviour under load, session rotation, or schema changes by the provider.**
- **Independent review**: no one other than the author has examined the evidence.

## Branch state and next steps
The disposable branch still exists and will delete itself at its expiry. Deleting it earlier, or keeping it for a real-account runner, is the owner's call. To go further: set passwords for the login roles in the console, name an independent security signer, then run a real-account runner (not built) with two pseudonymous test researchers. Removing 031 to 033 from the hold list, applying to the production branch, and wiring the adapter each remain separate, unapproved decisions.
