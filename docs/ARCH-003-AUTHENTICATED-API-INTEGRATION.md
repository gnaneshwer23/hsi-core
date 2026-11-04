# ARCH-003 authenticated research API — staging integration

## Implemented
- `src/server/interrogativeApi.ts`: cookie-authenticated handler; GET /api/research/interrogative/:id; POST /api/research/interrogative/:id/submit-review; POST /api/research/interrogative/:id/decision.
- `src/server/runInterrogativeApi.ts`: standalone Bun service bound to loopback behind a trusted HTTPS reverse proxy.
- `src/db/authenticatedInterrogativeStore.ts`: verified session, owner-scoped reads and release-bound immutable draft saves.
- `src/db/authenticatedScientificReviewStore.ts`: transactional review submission and human decision persistence.
- `db/migrations/008_hsi_interrogative_review_audit.sql`: append-only decision table with one final decision per investigation.

## Deployment prerequisites
- This service is **not** a Vercel static site API route. Deploy a trusted Bun backend and proxy same-origin /api/research/interrogative/* requests to it.
- Set HSI_DATABASE_URL and HSI_PUBLIC_ORIGIN (HTTPS) only in the server runtime; optionally HSI_NEON_PROJECT_ID and HSI_API_PORT.
- The trusted reverse proxy must set x-forwarded-proto=https and x-forwarded-host to the configured public host, forward secure HttpOnly Better Auth cookies, and never expose the loopback listener.
- Configure production-equivalent authentication, CSRF, TLS, network policies, logging redaction and secrets management before exposing any endpoint.
- Migration 008 must be reviewed and explicitly approved for staging before application. Do not apply to production.
- Researcher and reviewer grants are provisioned by approved identity administrators, never by the API.
- Current review workflow records a single final decision per investigation. Request-revision produces a draft state but does not yet implement versioned resubmission; this requires a separate revision chain before real reviewer workflows.
- Source provenance and actual SSc evidence remain unavailable. No synthetic fixture counts as scientific validation.

## Release status
Integration code is not a live validated scientific workflow. Require green CI, staging migration, authenticated end-to-end tests and independent human scientific validation before a release decision.
