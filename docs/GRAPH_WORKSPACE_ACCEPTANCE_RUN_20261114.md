# Graph workspace: real-account acceptance run (migrations 031 to 033)

**Status: executed once on 14 November 2026 on a second disposable Neon branch; 47 of 47 checks passed; NOT accepted.** Acceptance needs an independent security signer, who has not been named. Nothing here changes the hold on 031 to 033, activates anything, or touches the production branch. The branch was deleted afterwards and confirmed gone. This record holds no project, branch, host, account or token values.

## Authority and target
- Owner instruction in chat on 14 Nov 2026: create a fresh disposable branch, run the acceptance, record the results, delete the branch. Production activation was offered and not chosen.
- Target: a child of the production branch in the HSI project only; non-default, non-primary; expiry set within 24 hours. Every database and Neon Auth call named that branch. The runner refuses to start unless all four connections share the one disposable endpoint, the Neon Auth base URL matches it, and the branch id is confirmed in the environment.
- Role passwords were set on the disposable branch only, from locally generated random values kept in a mode-600 file outside the repository, and deleted with the branch. The project owner connection string passed through the assistant session once; it died with the branch.

## What ran
Roles, then 031, 032 and 033 as `hsi_graph_function_owner` (non-superuser, no `BYPASSRLS`), then `scripts/verify-graph-workspace-neon.ts`. The runner:
1. signed up three pseudonymous accounts through the branch's own Neon Auth endpoint and obtained real sessions by signing in (email verification flag set by the project owner as test setup; two accounts granted research access, one not);
2. drove `src/db/graphWorkspaceStore.ts` as `hsi_graph_runtime_login` over TLS (certificate verified by the client) through the pooler;
3. mutated Neon Auth rows on the branch only, restoring each afterwards.

## Results (47 PASS, 0 FAIL)
| Area | Shown |
|---|---|
| Real sessions | Three sessions issued by Neon Auth worked as principals. |
| Isolation | Each researcher saw only their own investigations and recommendations; the same investigation id could be used by both without touching the other's chain. |
| Hostile sessions | Forged, short, expired, unverified, banned, impersonated sessions, an account without a grant, and a revoked grant were all refused; access returned once each was restored. |
| Direct access | The runtime login could not read or insert into any of the four tables or call the principal helper; setting a custom principal opened nothing. |
| Integrity | A broken revision chain, a record claiming scientific approval, a double-encoded record, a backdated decision, and a function-owner update were refused. A record edited underneath the application was refused on read (digest mismatch); the append-only trigger stopped a project-owner update. |
| Import role | Could add one release and its terms; could not read investigations, update, delete, or call the researcher procedures. |
| Concurrency | Six concurrent saves of the same revision stored exactly one row; six concurrent saves of the next revision left a two-row intact chain. |

## Not covered, and caveats
- **Independent review:** none. The author of the migrations also wrote and ran this runner. A pass here is evidence for a reviewer, not acceptance.
- **TLS:** the client enforced TLS with certificate verification, but the pooler hides the server-side ssl flag from the session, so the database could not confirm it. The pooler was in the path; a direct non-pooled connection was not tested.
- **Neon Auth behaviour in production:** session rotation, revocation propagation, rate limits and the email-verification flow were not exercised. Email verification was set by the project owner as test setup.
- **Load:** six concurrent clients on one account; no performance or scale claim.
- **Check strength:** the checks were not mutation-tested in this run (the SQL checks were, in the earlier rehearsal). A check that cannot fail would not be caught here.
- **Data copied from the parent:** the branch held a copy of production authentication records. Only a user count was read; no rows were read or recorded.
- **Wiring:** the adapter is still imported by no runtime code, the migrations are still on the hold list, and there is no activation approval.

## What would change the status
An independent security signer reviews 031 to 033, the role design, the two result records and this runner, and signs. Then, separately, the owner decides on removing the hold and on activation. Neither has happened.
