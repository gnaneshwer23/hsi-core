# Delivery Phase H — research pilot hardening

5 November 2026. **Operational engineering is implemented and locally exercised. A production research pilot has not been accepted or launched.** This is Human Super Intelligence; no clinical/PHI plane is introduced.

## Runtime changes

The Vercel research/auth adapter now applies `researchRequestControls.ts`. It creates a server-owned request UUID, returns `X-Request-ID`, `Server-Timing`, `no-store`, `nosniff` and a restrictive API referrer policy. It never trusts an incoming request ID as its correlation key. Telemetry contains only a fixed event schema: generated ID, coarse route group, GET/POST/other method, status, elapsed milliseconds, admission outcome and limiter scope. Questions, URLs/query strings, cookies, passwords, OTPs, tokens, database URLs, user IDs, IPs, headers and exception messages are not included. Logging failure does not change a committed decision response; multiple provider cookies remain intact.

Failures and admission denials are logged by default. `HSI_OPERATIONAL_LOGGING=true` also records successful requests. Platform/access logs and upstream provider logs are outside this allowlist: the operator must independently configure their redaction, access, retention, sampling and incident access. Do not put research questions or personal data in URLs. No external telemetry account or retention policy was provisioned.

Process admission uses six fixed bucket keys, not unbounded caller/IP/session identities. Defaults per 60-second window are health 120, auth 120, diagnostics 30, research reads 360, research writes 60, other 60; at most eight handlers are active in an isolate. Denials return 429 or 503 with bounded `Retry-After`. URL length is bounded to 8,192 characters and request headers to 24,576 encoded bytes before service work.

**These are process-local controls, not global serverless, account, tenant or IP quotas.** Vercel functions/instances may have separate counters, and restarts reset them. There is no claim of distributed brute-force protection, provider-side abuse prevention or a deployed WAF. A trusted server-owned shared admission adapter can be injected; it receives only route category and abort signal, is bounded to one second, and fails closed on malformed, denied, failed or stalled responses. There is no write-operation timeout that falsely implies an unacknowledged transaction rolled back. Existing immutable IDs/idempotent retries remain essential.

`HSI_PILOT_REQUIRE_SHARED_LIMITER=true` fails closed if no shared adapter is installed. **The deployed adapter currently has no shared store integration. Do not set this flag expecting it to create one.** A reviewed adapter/perimeter design, provider account protections and live distributed-load evidence remain pilot prerequisites. The standalone server refuses startup in required-shared mode until such an adapter is implemented; its existing trusted loopback HTTPS proxy guard remains mandatory.

`HSI_RESEARCH_MAINTENANCE=true` blocks protected research access before provider/database resolution; Vercel health reports maintenance/503. Same-origin auth and sign-out remain available. The standalone research adapter has the same research maintenance response. No environment variable was changed in Vercel or Neon by this work. Existing staging-only write and independent authorization/source safeguards remain in force; maintenance is not a role or scientific approval mechanism.

## Bounded request bodies

Auth JSON is now byte-bounded while streaming, rather than checked only after `request.text()`. Auth is limited to 20,000 bytes; research creation, capture, submission, revision and decision retain their existing action-specific bounds. A full-read deadline defaults to five seconds, with cancellation and 408 on expiry. Lying Content-Length, multibyte payloads and stalled streams are covered by tests. Request body failures do not reach providers or persistence. The declared length remains an early hint, not the authority.

## Public-artifact recovery drill

`researchRecovery.ts` backs up and restores exactly six allowlisted **public repository** JSON artifacts: the RA source release/graph, working-evidence catalogue and coverage catalogue, including their public mirrors. The bundle pins Git revision, paths, sizes and SHA-256 content; it excludes `.env`, arbitrary paths, code execution, signing keys, user investigations, account/session tables and product databases. Restoration validates the entire bundle and independent hash before creating a **new** destination. Existing directories and symlinks are refused; no canonical file is overwritten.

The local drill restores into a disposable `/tmp` directory, compares every byte, revalidates release/corpus/coverage semantics, checks mirrored equality and removes the temporary tree. It verifies two RA sources/eight passages/zero approved claims. A content hash detects change; it is not a signature, a licence grant or a deployment authorization.

**This does not demonstrate Neon backups, point-in-time recovery, schema restore, grants/RLS, session invalidation, disaster recovery, database rollback or a recovery SLA.** Git and compatible code are recovered separately. Real database backups can contain account data and must remain in approved protected storage, not this public bundle or a Git commit. The manual staging and deployment procedures are in the [pilot runbook](RESEARCH_PILOT_RUNBOOK.md).

## Repeatable readiness report

```bash
bun --no-env-file run pilot:check --out /tmp/hsi-pilot-readiness.json
```

The output file must be new. The command reads the pending operator evidence inventory, checks lockfile identities, performs the disposable public-artifact recovery drill and validates configuration **syntax/target guards only**. It does not connect to Neon/auth, migrate schemas, enable writes, provision roles, deploy a site, call a model, restore a database or grant approval. Output exposes only configuration booleans, never variable values or private endpoints.

`operations/pilot/evidence.pending.json` has 13 gates with no invented owners or receipts. A separately supplied `--evidence FILE` may contain bounded `ops:` and opaque `record:` references plus evidence digests, but operator-reported evidence remains **unverified**. JSON fields cannot assert `passed` or `pilotReady=true`. The result always reports `pilotReady=false` and requires independent authority, scope, freshness and sign-off verification outside this importer. Local evidence is recorded separately from unrun human/live acceptance gates. A green CI run or a health response cannot approve a pilot.

## Dependencies, accessibility and performance

Root and site installs remain frozen-lockfile builds. CI now runs root/site `bun audit --json` and the local pilot report/recovery check. At this run, both dependency audits returned an empty advisory object. This is a point-in-time registry result for these two lockfiles, not a source-code security assessment, licence clearance, penetration test, product-repository audit or guarantee of future safety. No dependency versions or signing keys were invented. Registry availability/audit findings must fail CI for accountable review rather than be silently ignored.

Five research page/queue wrappers no longer nest extra main landmarks inside the shared layout. Classes, content and visual design are retained. Targeted browser checks exercise a single main landmark, actual skip-link focus, keyboard controls, 320px layout and reduced-motion mode. A ten-second local coverage-render budget catches gross regressions; it is **not** a production p95 or an agreed SLO. Broader assistive-technology, contrast, screen-reader and human research-team testing remain pending. Existing large frontend bundle warnings remain; no performance-ready claim is made from a localhost measurement.

## What remains before accepting the pilot

- Resolve the paused HSI auth/database alignment; use separately provisioned researcher/reviewer accounts and demonstrate ownership, role, revoked-session and independent-review denial cases on the approved non-production environment.
- Verify the actual HSI-only schema/migrations, restore procedures and branch/write guards. HSI migrations `014`/`015`, product-local `0029`/`056` and their grants are not activated by this phase.
- Supply cleared, independently reviewed source evidence and signed data terms. The current working corpus still has zero eligible claims; Phase G protocols remain drafts and E model activation remains gated.
- Deploy and exercise shared/perimeter admission, monitoring/redaction/retention, rollback and database restore. Name real release, auth/database, scientific, privacy and incident owners with evidence references.
- Have an actual research team complete the accepted create → inspect → export → independent review → revision journey. Record the deployed revision, release/schema/hash bindings, test receipts and accountable acceptance.

No production migrations, role grants, settings changes, database restores or human approvals were performed. This phase completes reviewable engineering work; **live pilot acceptance remains blocked**.

## Verification record

Local verification passed: **717 core tests** (including **16 operational controls/recovery/readiness checks**), **81 browser checks** (including two new keyboard/landmark/mobile/local-budget checks), core build, frontend type check, site/API build, evidence and coverage artifact checks. The standalone/auth/research write guards and existing ownership/source/independent-review tests remain green.

The public recovery drill reproduced and revalidated six allowlisted files with two RA sources/eight passages/zero claims and matching public mirrors. It refused tampered/private/traversal paths, changed pins and existing restore targets. Tests also cover process quotas/concurrency release, shared-admission failures/stalls, safe telemetry, logging failure, preserved auth cookies, encoded header/body bounds, body deadlines, maintenance and refusal of self-approved pilot JSON.

Root/site advisory queries returned `{}` using Bun 1.3.11 at this run. CI now repeats advisory checks; this does not establish source-code security or live operational acceptance. The committed [local engineering/recovery report](../operations/pilot/local-engineering.receipt.json) and [lock-bound advisory receipt](../operations/pilot/dependency-audit.receipt.json) pin implementation revision `c9f4492d73bd8001c2dcfa6244b8a5574848fc21`. Both are scoped observations; they do not authenticate human ownership or certify a live pilot.

The readiness inventory remains blocked/unassigned. No live identity/DB restore, shared deployment admission, rollback, monitoring ownership, source/scientific terms or real-team acceptance was certified. No production deployment was independently verified.
