# P0.6 staging gate: plan, runner and what the owner must supply (22 November 2026)

Code: `src/ops/stagingGate.ts` (plan, runner, verdicts, evidence), `src/ops/stagingGateRehearsal.ts` (in-process rehearsal and fault injection), `scripts/staging-gate-p06.ts` (CLI). Tests: `test/stagingGateP06.test.ts`.

**Status: BLOCKED.** No staging accounts, isolated database branch or worker host exist, so the gate has never run against an environment. What exists is the gate itself, proven against an in-process rehearsal (below). Rehearsal evidence is labelled `rehearsal` and is never staging evidence.

## What it adds to the existing probe runner

`db/stagingIsolationRunner.ts` sends independent single requests and compares body digests. P0.6 is a story, so this gate is stateful: A creates a run, then B, C and an anonymous caller try to read, export and start runs on it, a session is revoked mid-run, retries are fired (including concurrently), and the store and audit trail are inspected from outside the API. Every denial is compared with the answer for a run that does not exist (an indistinguishable 404, not just a status code) and is only counted if its control, the same operation working for the owner, passed in the same run.

## The checks

| Check | What it establishes | Mandate item |
| --- | --- | --- |
| `a_creates` | Researcher A starts a run on their own investigation | Researcher A creates an investigation |
| `a_reopens_before` | Researcher A can read the run's status | Researcher A can reopen it |
| `b_cannot_read` | Researcher B cannot read it, and the refusal is indistinguishable from an unknown run | Researcher B cannot read it |
| `b_cannot_export` | Researcher B cannot export the brief, and the refusal is indistinguishable from an unknown run | Researcher B cannot export it |
| `b_cannot_modify` | Researcher B cannot start a run on A's investigation, and the refusal is indistinguishable from an unknown investigation | Researcher B cannot modify it |
| `b_wrote_nothing` | B's attempts left no job behind (counted in the store) | Researcher B cannot modify it |
| `c_cross_org_denied` | A researcher from another organisation is denied read, export and start, identically to an unknown run | Cross-organisation access is denied |
| `anonymous_denied` | A request with no session is refused everywhere (401) | (additional hardening) |
| `cross_origin_post_refused` | A start request from another origin is refused and creates nothing | (additional hardening) |
| `revoked_session_denied` | A revoked session is refused at its next request, while A's other session still works | Revoked sessions cannot access it |
| `retry_idempotent` | Retried and concurrent identical starts return the same run and create it once | Retried requests cannot duplicate writes |
| `retry_no_duplicate_rows` | The store holds exactly one job for the investigation after the retries | Retried requests cannot duplicate writes |
| `audit_preserves_ownership` | Every audit record for the run carries A's tenant and principal references and no one else's | Audit events preserve ownership |
| `health_is_coarse` | Another researcher's health view shows status and reasons only, no counts, ids or activity | (additional hardening) |
| `a_reopens_after` | After every attempt above, A can still read the run and (once complete) export a verified brief | Researcher A can reopen it |
| `unauthorised_graph_or_evidence_access` | Unauthorised graph and evidence access is denied | Unauthorised graph or evidence access is denied |

The mandate list also includes **Unauthorised graph or evidence access is denied**. The `unauthorised_graph_or_evidence_access` check is reported `not_covered`: graph and evidence endpoints need their own scenario against the research API with real accounts. Evidence therefore always carries `mandateComplete: false` and names the uncovered items.

## Actors

`researcher_a` and `researcher_a_second_session` (the same researcher, two sessions, one of which is revoked mid-run), `researcher_b` (a different researcher, ideally in the SAME organisation as A, to show per-researcher isolation), `researcher_c_other_org` (a researcher in another organisation) and `anonymous` (no session).

## Verdicts

- `BLOCKED`: a prerequisite is missing. **Nothing is sent.** Exit code 3. The expected state until the owner supplies the items below.
- `FAILED`: an isolation check failed. Treat as a defect. Exit code 1.
- `INCONCLUSIVE`: nothing failed, but a required check could not be established (no inspector, no revocation hook, the run did not complete, or a control failed). Exit code 2. "Not established" is never counted as passed.
- `PASSED_PENDING_SIGNOFF`: every check in this profile passed with its controls. Exit code 0. It is evidence for a named independent security signer. It is never acceptance: `accepted` is always false and `securitySignoffRequired` always true.

## Running it

```text
bun scripts/staging-gate-p06.ts --plan
bun scripts/staging-gate-p06.ts --preflight          # lists what is missing; sends nothing
bun scripts/staging-gate-p06.ts --rehearse           # proves the gate; mode "rehearsal"
bun scripts/staging-gate-p06.ts --rehearse --fault leak_read   # proves it fails when isolation is broken
bun scripts/staging-gate-p06.ts --staging --out evidence.json  # only when every prerequisite below exists
```

## What the owner must supply (any missing one makes the run BLOCKED)

1. **An approved staging origin** (https), distinct from every production origin, plus the list of production origins to check against.
2. **An isolated database branch** and the deployed commit: `HSI_GATE_TARGET_HASH` (a hash identifying the branch, never a connection string) and `HSI_GATE_COMMIT_SHA`. Production is never a target. Migrations stay held; this gate lifts nothing.
3. **A worker host** running the authenticated NEXUS worker against that environment, and a mounted API (`src/server/nexusFixtureApi.ts` is not wired to any deployment yet).
4. **Accounts**: A (with a second session), B (same organisation, different researcher), C (different organisation), all with research access, and an investigation owned by A created through the real product flow (`HSI_GATE_INVESTIGATION_A`) plus an id that exists nowhere (`HSI_GATE_INVESTIGATION_UNKNOWN`).
5. **A hooks module kept OUTSIDE this repository** (`HSI_GATE_HOOKS_MODULE`, an absolute path) that exports `hooks`:
   - `session(actor)` returns the complete `Cookie` header value for that actor from your real session provider, or `null` for `anonymous`. The CLI never stores or prints it, and the runner refuses to emit evidence containing any value it returned.
   - `revoke(actor)` revokes that actor's session on the server, as a sign-out or an administrator would.
   - `advance()` (optional) lets the system progress between steps; `HSI_GATE_WAIT_MS` sets how long to wait for the run to complete so export and audit can be established.
   - `inspector` (optional but needed for three checks): `countJobs(investigationId)` from the store itself, `auditRefs(jobId)` the tenant and principal references in the audit log, and `refsOf(actor)` the references the system derives for each account.
6. `HSI_GATE_ALLOW_MUTATIONS=1`: the run creates jobs in the target and the gate refuses to run without that explicit setting.

## Evidence

`hsi-staging-gate-p06-1`: the verdict, per-check outcomes with a one-line reason, and one observation per request (step, actor, method, a path template with ids replaced, status, a digest of the response body and its top-level key names). It holds no cookie, token, request body or response body. `verifyGateEvidence` re-derives the content hash and requires the verdict to follow from the checks, so a failed check cannot sit under a pass and a relabelled mode or flag is refused.

## Proving the gate is sensitive (rehearsal faults)

A pass is meaningful only if the gate fails when isolation is broken. `--rehearse --fault <name>` runs the real authority, grants, worker, gateway and handler in memory with one deliberate defect injected at the HTTP or hook layer (never by editing product code), and the tests require the named checks to fail:

| Fault | Defect | Check that must fail |
| --- | --- | --- |
| `leak_read` | B's read of A's run is served as A | `b_cannot_read` |
| `leak_export` | B's export of A's brief is served as A | `b_cannot_export` |
| `distinguishable_denial` | B and C get 403 instead of the unknown-run 404 | `b_cannot_read`, `b_cannot_export`, `b_cannot_modify`, `c_cross_org_denied` |
| `distinguishable_body` | B and C get a 404 whose body differs from the unknown-run 404 | `b_cannot_read`, `b_cannot_export`, `b_cannot_modify`, `c_cross_org_denied` |
| `retry_reports_created` | a retry returns the same run but claims it was created again | `retry_idempotent` |
| `missing_origin_accepted` | a start request with no Origin header is accepted | `cross_origin_post_refused` |
| `refs_not_distinct` | the references derived for B and C equal A's, so the audit trail cannot tell them apart | `audit_preserves_ownership` |
| `anonymous_403` | a request with no session gets 403 instead of 401 | `anonymous_denied` |
| `owner_export_broken` | the owner's own export fails | `a_reopens_after` |
| `revocation_ignored` | revoking a session has no effect | `revoked_session_denied` |
| `retry_not_idempotent` | a retry is treated as a new run | `retry_idempotent` |
| `duplicate_rows` | a retry also writes a second job | `retry_no_duplicate_rows` |
| `audit_wrong_owner` | the audit trail names another researcher | `audit_preserves_ownership` |
| `cross_origin_accepted` | the origin check is bypassed | `cross_origin_post_refused` |
| `anonymous_allowed` | a request with no session is treated as A | `anonymous_denied` |
| `health_leaks_counts` | the health view exposes queue counts | `health_is_coarse` |

## Not provided

No environment, account, database or host. No graph or evidence scenario. No signing: a named independent signer decides acceptance from the evidence, outside this repository. The gate does not lift a migration hold, enable production writes or contact production.
