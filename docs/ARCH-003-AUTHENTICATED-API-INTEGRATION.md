# ARCH-003 authenticated research API — staging integration

## Implemented
- `src/server/interrogativeApi.ts`: cookie-authenticated handler; GET /api/research/interrogative/:id; POST /api/research/interrogative/:id/submit-review; POST /api/research/interrogative/:id/decision.
- `GET /api/research/account`: verifies the server session, reports active researcher/reviewer grants and lists up to 50 accessible investigation references. A verified identity with no grants receives an empty list; missing or unusable sessions return 401; service failures return 503.
- `src/server/runInterrogativeApi.ts`: standalone Bun service bound to loopback behind a trusted HTTPS reverse proxy.
- `src/db/authenticatedInterrogativeStore.ts`: verified session, owner-scoped reads and release-bound immutable draft saves.
- `src/db/authenticatedScientificReviewStore.ts`: transactional review submission and human decision persistence.
- `db/migrations/008_hsi_interrogative_review_audit.sql`: append-only decision table with one final decision per investigation.

## Deployment prerequisites
- This service is **not** a Vercel static site API route. Deploy a trusted Bun backend and proxy same-origin `/api/research/account` and `/api/research/interrogative/*` requests to it. The account path must not fall through to the Vite HTML page.
- Set HSI_DATABASE_URL and HSI_PUBLIC_ORIGIN (HTTPS) only in the server runtime; optionally HSI_NEON_PROJECT_ID and HSI_API_PORT.
- Start with `bun run research:api`. The listener binds to `127.0.0.1`; deploy its trusted reverse proxy on the same host/network boundary. Server configuration is documented in `.env.example` and has no fallback to `DATABASE_URL`.
- The trusted reverse proxy must set x-forwarded-proto=https and x-forwarded-host to the configured public host, forward secure HttpOnly Better Auth cookies, and never expose the loopback listener.
- Configure production-equivalent authentication, CSRF, TLS, network policies, logging redaction and secrets management before exposing any endpoint.
- Migration 008 must be reviewed and explicitly approved for staging before application. Do not apply to production.
- Researcher and reviewer grants are provisioned by approved identity administrators, never by the API.
- Current review workflow records a single final decision per investigation. Request-revision produces a draft state but does not yet implement versioned resubmission; this requires a separate revision chain before real reviewer workflows.
- Source provenance and actual SSc evidence remain unavailable. No synthetic fixture counts as scientific validation.

## Release status
Integration code is not a live validated scientific workflow. Require green CI, staging migration, authenticated end-to-end tests and independent human scientific validation before a release decision.

## Account-to-workbench acceptance checks

1. Keep the auth provider, trusted API database and test site on the same confirmed HSI staging environment. Never use the production connection as a staging fallback.
2. Deploy the Bun entrypoint with server-only configuration and the two same-origin proxy routes above. No database credential belongs in a `VITE_*` variable or the static frontend.
3. Verify the full session path. A cookie set on an external Neon Auth hostname is not automatically sent to the HSI website's same-origin API. The trusted session/proxy integration must supply a usable secure HttpOnly backend cookie and verify the provider's cookie format. This implementation looks up a session token in Neon; do not assume a signed or differently named provider cookie can be used unchanged. Do not copy tokens into browser storage, URL queries or account JSON as a workaround.
4. Verify the test identity's immutable Neon Auth user ID and email-verification state in the selected staging branch. An approved identity administrator must provision only `researcher` in `hsi_research_access` with the actual grantor identity, grant time and no revocation. Do not derive authority from the displayed email, register an admin role through signup, or add scientific reviewer authority for the author.
5. In `/research/account`, use **Refresh access**. Only a backend-confirmed grant shows the workspace. Missing backend authentication, unavailable routing and pending approval have separate messages. A successful account check does not create an investigation or approve evidence.
6. Open a persisted, release-bound own investigation from the list. Another researcher's draft must remain inaccessible even through a manually entered ID. A separately authorised SSc reviewer can see other authors' awaiting-review investigations and receives an independent-review link; own records never receive that link.
7. Revoke the staging grant and repeat the check and direct record request; both must deny research access. Exercise expired sessions, HTML routing fallbacks, missing grants and network timeouts.

No migrations, account grants or production changes are performed by the account endpoint. The frontend displays backend-confirmed access, not an editable browser permission. Empty workspaces require a legitimate persisted investigation and published release; never create a fixture and label it real scientific evidence to fill the screen.
