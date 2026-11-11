# P1.12.1 — Existing integration points and safe first adapter

## Repository audit (merged main, 2026-11-11)
- `site/api/auth/[...path].ts` and `site/api/research/[...path].ts` delegate to `src/server/vercelResearch.ts`.
- `src/server/vercelResearch.ts` checks origin, HSI Neon branch pins, write gating, provider-verified sessions and DB session resolution before invoking `handleInterrogativeApi`.
- `src/db/neonAuthResearchActor.ts` verifies Better Auth session tokens in `neon_auth.session` against expiry, email verification and research grants, returning a `TrustedResearchActor` **without tenant membership**.
- `src/db/hsiResearchGatewayAdapter.ts` composes existing research investigations; `src/db/reviewerAuthority.ts` handles scientific reviewer grants.
- `src/evidence/authenticatedEvidenceService.ts` accepts an injected `TrustedSessionGateway`; `src/evidence/neonEvidenceDatabase.ts` accepts an injected `PostgresPool`, not a live connection.
- `site/api/research/scientific-review/queue.ts` is an existing route for interrogative reviews, **not** the new evidence snapshot review queue.

## First change
`src/server/hsiEvidenceSessionGateway.ts` provides a fail-closed bridge from a trusted server-verified session and a **server-resolved** organisation membership to the P1.8 evidence service contract. This adapter does not issue tokens, accept browser claims, provision organisations, open database connections or expose routes. Mocked unit tests cover missing/invalid sessions, missing membership and unsafe tenant scopes.

## Remaining implementation
1. Confirm canonical organisation membership schema and how the existing Better Auth session is verified server-side. Do not infer tenant membership from user-supplied JSON.
2. Wire the existing verified-provider cookie flow to this adapter without exposing raw tokens in logs or public APIs.
3. Add a restricted non-owner Neon Postgres pool and enforce dedicated role + transaction scope. Do not use the staging-only owner SET ROLE workaround in production.
4. Add explicit, gated evidence submit/review endpoints and real synthetic E2E staging tests.
5. Preserve `HSI_RESEARCH_WRITES_ENABLED` staging pin and production write-deny defaults.

Production database and deployment unchanged.
