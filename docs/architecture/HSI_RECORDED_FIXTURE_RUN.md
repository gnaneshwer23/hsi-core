# Recorded-fixture run: API and workbench page (22 November 2026)

This is the thin path that shows the whole workflow working together in fixture mode: a researcher starts a run, an authenticated NEXUS worker executes it through the authenticated gateway, a literature brief is produced and saved, and the researcher sees it, verified, in the workbench.

## What is real and what is a fixture

Real, and exercised by the tests: the caller authority and delegation grants, the NEXUS journal, worker, cancel, dead-letter and health, the authenticated gateway with file-backed limits and idempotency, the retrieval executor, the brief builder and verifier, the HTTP handler, and the React page with its browser-side verification.

Fixture: the three providers' responses (`recordedLiteratureFetcher`, synthetic placeholders titled "[FIXTURE] ..."), the session and ownership directories in the tests, and the temp folders. Nothing was sent to a live provider, model or database.

## Routes (`src/server/nexusFixtureApi.ts`)

| Route | Behaviour |
| --- | --- |
| `POST /api/research/nexus/jobs` | Same-origin JSON only; body is exactly `investigationId` and `terms` (1 to 8, at most 160 characters, no control characters, no possible personal health information). Needs a verified session that owns the investigation and research writes enabled. Queues a job with a grant limited to the retrieval role. Resubmitting is a no-op. |
| `GET /api/research/nexus/jobs/:id` | Status, attempts, progress (stage code and counts), error code, whether a brief exists. Owner only. |
| `GET /api/research/nexus/jobs/:id/brief?format=json\|markdown` | The brief, verified before it is served; a stored brief that fails verification is not served (502). Owner only. |
| `GET /api/research/nexus/health` | `status` and reason codes only: no counts, ids or worker names, so one researcher cannot see another's activity. Verified session required. |

Identity is never taken from the body. The host supplies `sessionToken(request)`, `authenticate(token)` and `publicOrigin`; ownership comes from the signed grant through the caller authority. Not found and not yours are the same 404, with the same body. All responses are `no-store` and `nosniff`.

## The page (`/research/runs`)

Shows an honest unavailable state when the API is absent (404, an HTML fallback, or any non-health JSON), a sign-in state on 401, worker health, a validated start form, live status with progress, and the brief: the data-mode banner, honesty chips, the six-step evidence ladder with only "Retrieved" reached and the human-review steps marked as impossible in this brief, sources as inert text (a source link only for the approved hosts, in a new tab with `noopener noreferrer`), claims (or "no extraction has run"), provenance, limitations and a download of the verified JSON. The brief is shown only after the browser has re-verified it; a brief that fails verification, belongs to another investigation, or differs from the hash the server announced shows an error and no content.

## Deliberately not done

- **No Vercel wiring.** The handler is not mounted in `vercelResearch.ts` or any entry. A serverless function has no durable disk for the job queue; the research writes flag and the database migrations are held; PRs #622 and #624 touch those entries. In production the routes return 404 and the page says so. A worker host with a durable store and a real session verifier is the dependency.
- **No navigation link**; the route has a rewrite and is reachable by URL only.
- **No cancel route or button** (the cancel function exists server-side).
- **No live provider, no model, no extraction**: the brief has sources and no claims.
- **Moderate axe findings** about nested `<main>` landmarks, inherited from the app shell (as on Gap Register); no serious or critical findings.
