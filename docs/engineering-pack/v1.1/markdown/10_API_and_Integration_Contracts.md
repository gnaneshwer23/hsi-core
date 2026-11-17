---
title: "10. API and Integration Contracts"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **One versioned research API under `/api/v1/`** for everything new. Existing routes stay working and are mapped onto it, then retired.
- **OpenAPI 3.1 is the contract.** A single `openapi.yaml` in the repo; request and response types generated from it or checked against it in tests.
- **Identity is never taken from the client.** Every endpoint resolves the principal from a verified Neon Auth session and checks scope and ownership on the server and in the database.
- **Long work is asynchronous.** Starting a run returns `202` with a run ID. Nothing long runs inside a request.
- **One error envelope:** `{ "code": "STABLE_CODE", "error": "Human message", "requestId": "…" }`. The codebase already uses this shape (`gatewayJson`).

# 2. Where we are

38 route files under `site/api/`:

| Group | Routes | Status |
| --- | --- | --- |
| Auth | `/api/auth/[...path]`, `sign-in/email`, `sign-up/email`, `email-otp/verify-email`, `request-password-reset`, `reset-password`, `send-verification-email` | Built (Neon Auth) |
| Ask and live run | `/api/ask`, `/api/research/live-investigation` | Partial: in-request, curated scenarios |
| Investigations (interrogative) | `/api/research/interrogative/[id]` and `brief`, `context-audit`, `context-audit-review`, `decision`, `graph-context`, `outcome`, `outcome-receipt`, `review-package`, `revision`, `submit-review` | Partial: writes disabled in production |
| Investigations list | `/api/research/investigations` | Partial |
| Graph and discovery | `/api/research/graph/ssc`, `/api/research/discovery/ssc` | Partial: SSc-only routes |
| Evidence helpers | `cooccurrence`, `methods-compare`, `radar`, `target-evidence` | Partial |
| Review | `/api/research/scientific-review/queue`, `history` | Partial |
| Operations | `/api/health`, `/api/csp-report`, `/api/research/session-diagnostics` | Built |
| Legacy | `/api/scientific-pubmed`, `scientific-abstract`, `scientific-investigation-trace` | Legacy (repaired in #303); retire |

# 3. Target endpoint catalogue (v1)

| Method and path | Purpose | Auth | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/me` | Principal, scopes, roles | Session | |
| `POST /api/v1/investigations` | Create investigation | Researcher | Body: question, scope, entities; idempotency key |
| `GET /api/v1/investigations` | List own investigations | Researcher | Cursor pagination |
| `GET /api/v1/investigations/{id}` | Investigation with outputs | Owner | |
| `POST /api/v1/investigations/{id}/runs` | Start a run | Owner | Returns `202 {runId}`; budget checked first |
| `GET /api/v1/runs/{id}` | Run status and stage events | Owner | Poll every 2 to 5 s; later server-sent events |
| `POST /api/v1/runs/{id}/cancel` | Cancel | Owner | |
| `GET /api/v1/investigations/{id}/brief?format=md\|json` | Export brief | Owner | Includes release and run IDs |
| `GET /api/v1/graph/releases/latest` | Current public release metadata | Public | Snapshot JSON stays a static file |
| `GET /api/v1/graph/edges/{id}/evidence` | Evidence by context for an edge | Public for released edges | |
| `GET /api/v1/claims/{id}` | Candidate with passage and verdicts | Owner or reviewer in scope | |
| `GET /api/v1/review/queue?scope=` | Review queue | Reviewer | |
| `POST /api/v1/review/decisions` | Record a decision | Reviewer | Rejects self-review; immutable |
| `GET/POST /api/v1/hypotheses` | Ledger | Researcher | Text immutable after create |
| `PATCH /api/v1/hypotheses/{id}/outcome` | Record outcome | Owner or reviewer | |
| `GET/PUT /api/v1/gaps/{id}/tracking` | Gap status | Researcher | |
| `GET/PUT /api/v1/topics` | Followed entities | Researcher | |
| `POST /api/v1/access-requests` | Request access | Public | Rate-limited; spam check; sends owner notification |
| `GET /api/health` | Health | Public | No infrastructure details |

## Common contract rules

- JSON only; `Content-Type` checked; body size limits (the existing `boundedRequestBody.ts`).
- Write endpoints require an `Idempotency-Key` header.
- Same-origin check for browser calls (`HSI_PUBLIC_ORIGIN`).
- `Cache-Control: no-store` on any user data.
- Rate limits per principal and per route group, backed by a shared store (doc 12).

## Error codes (starter set)

`UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION_FAILED` 400, `IDEMPOTENCY_CONFLICT` 409, `RATE_LIMITED` 429, `BUDGET_EXHAUSTED` 429, `WRITES_DISABLED` 503, `PROVIDER_UNAVAILABLE` 502, `OVER_CAPACITY` 503.

# 4. External integrations

| Provider | Used for | Contract notes |
| --- | --- | --- |
| Europe PMC REST | Search, metadata, open-access full text (JATS) | Licence field drives rights; contact email; backoff on 429 |
| OpenAlex | Search, citation metadata | Polite pool with `HSI_OPENALEX_CONTACT` |
| PubMed E-utilities | PMID resolution | API key optional; respect rate limits |
| Open Targets Platform (GraphQL) | Target–disease associations | Associations are "listed by provider", not context-specific evidence |
| UniProt, Reactome | Protein and pathway identity | Identity only |
| ClinicalTrials.gov API | Registry snapshots | Store snapshot date and digest |
| Crossref | Retraction and correction status | Daily check (ING-05) |
| Model providers (Anthropic, OpenAI) | Extraction, verification | Pinned model IDs; spend caps; no patient data ever |
| Neon Auth | Identity | Server-side session verification only |

Every adapter has contract tests with recorded responses, a timeout, a payload size cap and a malformed-response test.

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| API-01 | `openapi.yaml` for v1 | Lints clean; contract tests fail when code drifts |
| API-02 | Investigations and runs endpoints | As catalogued; 202 + polling; idempotent create |
| API-03 | Generic routes replace `/graph/ssc` and `/discovery/ssc` (HSI-P1-C) | Old routes alias the new ones; unknown scope returns 404 |
| API-04 | Hypotheses, gaps, topics endpoints | Replace `localStorage` (WB-01) |
| API-05 | Review endpoints | Self-review rejected; decisions immutable |
| API-06 | Access request endpoint (PRD-08) | Delivered notification within 5 minutes; abuse tests |
| API-07 | Retire legacy `scientific-*` routes | No callers; 410 Gone after one release |

# 6. Future options

- A public, key-based read API for the reviewed graph.
- An MCP server with tools such as `search_graph`, `evidence_by_context`, `explain_conflict`, `draft_brief`.
- Webhooks for followed topics.

# 7. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-90 | Polling or server-sent events for run progress | Polling first; SSE once the worker host is decided |
| D-91 | Public API licence and quota | After the first reviewed release; free for academic use with attribution |
