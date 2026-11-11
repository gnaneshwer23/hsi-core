# P1.12.4 — Governed evidence API boundary (not deployed)

This draft adds `src/server/governedEvidenceApi.ts`: a server-only, disabled-by-default HTTP handler for `POST /api/research/evidence/submit` and `POST /api/research/evidence/review`. It is **not mounted** in `site/api` or the existing `vercelResearch` dispatcher.

Controls: explicit enable gate; strict same-origin POST check; JSON/content-length and body validation; content-addressed snapshot digest check; session token resolved by an injected trusted server authenticator; no client-supplied tenant, identity or role; delegation to existing `AuthenticatedEvidenceService` for independent review and transactional audit persistence. Generic error responses avoid disclosing sensitive records.

Before mounting, complete:
1. Canonical server-side organisation membership lookup and real provider-authenticated session integration from P1.12.2.
2. Dedicated non-owner LOGIN role with verified grants and RLS; P1.12.3's current NOLOGIN staging role is insufficient.
3. Readiness/feature flag configuration, request-size streaming cap, abuse/rate controls, error classification and a CSRF strategy consistent with existing Vercel middleware.
4. Staging-only live integration tests: independent reviewer, tenant isolation, idempotency, concurrent decisions, audit events, rollback, malformed payload and source provenance. Digest verification alone does not establish scientific trust.
5. Security review and approval before enabling the route. Do not treat `accepted` review status as automatic publication into the approved knowledge graph.

No database migration, staging write, production change, public route or deployment in this PR.
