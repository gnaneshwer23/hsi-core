# Review of migration 034 (investigation store)

**Date:** 28 November 2026
**Reviewed:** `db/migrations/034_hsi_investigation_store.sql` against ADR-012, ADR-013 and ADR-014. Also checked: the role file, the isolation suite and the API.
**Reviewer:** Claude, the same agent that wrote 034, working from a re-read of the code.

**This is not the independent Track B2 review.** That review must still be done by someone who did not write the migration. This pass found and fixed five problems first, so that review starts from a better baseline.

## Findings and fixes

| # | Severity | Finding | Fix |
| --- | --- | --- | --- |
| 1 | High | The rule "never run as a superuser or BYPASSRLS role" was only a comment. Applying 034 as `neondb_owner` would have made every SECURITY DEFINER procedure bypass row-level security without any warning. | A guard at the top of 034 refuses such roles. CI proves it by applying 034 as `postgres` and expecting the refusal. |
| 2 | High | Sharing outlived the owner. An owner removed from a scope kept their investigation readable to that scope. | Scope visibility now also requires the owner to be an active member. Removing the owner stops the sharing at once. |
| 3 | Medium | A scope admin could grant a membership to an id that does not exist, an unverified account, or someone without research access. | The grantee must be a verified, unbanned account with active research access. The API returns `GRANTEE_NOT_ELIGIBLE`. |
| 4 | Low | `entities` accepted any JSON values. | Now an array of up to 200 strings, each up to 200 characters. |
| 5 | Low | `hsi_inv_list` checked visibility row by row across the whole table. | It now filters first by owner or member scopes, which the indexes cover, then confirms visibility. |
| 6 | Low | `hsi_scope_create` ignored a future-dated research-admin grant. | It now requires `granted_at <= now()`, matching the session check. |

## Checked and left as they are

- **Identity.** The session token is checked against `neon_auth.session`, joined to the user, inside each procedure. Expired, impersonated, unverified and banned sessions are refused. No `current_setting`, no `set_config`, and no owner id from the caller.
- **Access path.**
  - RLS is forced on all five tables.
  - There are no table grants to the runtime role. It may execute 11 procedures and nothing else; the operator bootstrap and the internal helpers are not granted.
  - The definer policies apply only to the owning role.
- **Probing.** An unknown id and a not-yours id raise the same `P0002`.
- **Append-only.**
  - Events and outputs have UPDATE, DELETE and TRUNCATE blocked by triggers, for every role.
  - On investigations, only status, sharing and scope may change.
  - A membership can change only by being revoked, once.
- **Ordering.** Event and output numbering takes a row lock on the investigation, so concurrent writers cannot get the same number.
- **Approval.** `scientificApproval` and `scientificClaimAllowed` are refused at any depth, by check constraints on both events and outputs.
- **search_path.** Every definer function sets `pg_catalog, public` and uses schema-qualified names.

## Accepted risks, for the independent reviewer to confirm

- **A scope can be left with no admin.** If the last admin revokes themselves, only an operator can bootstrap a new one. This is deliberate, because there is no automatic recovery path that could be abused.
- **A shared investigation's question and events are readable by every member of the scope.** That is the purpose of sharing. Readers see `byOwner`, never another person's principal id.
- **Payload size caps** are 64 KB for an event and 256 KB for an output. Total storage per owner is not capped yet.

## Evidence

- Disposable PostgreSQL 16 suite: **61/61 pass** (was 54; 7 checks added for the findings above).
- CI job `investigation-store-isolation` runs the suite and the superuser-refusal check on every change to 034.
- Unit tests: `test/investigationStoreMigration.test.ts` and `test/investigationStoreApi.test.ts`.
