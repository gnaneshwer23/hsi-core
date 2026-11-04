# HSI Phase 3 — Verified Neon Auth and Isolated Branch Readiness (2026-11-04)

## Verified directly (read-only)
- HSI Neon project: human super intelligence (red-wave-06625195), AWS eu-west-2, PostgreSQL 18.
- Default production branch: br-quiet-silence-zab1zvji. NOT modified.
- Existing staging branch: br-rough-snow-zagxbvjp. NOT modified.
- Existing disposable child branch: br-morning-fog-zaobvjs0 (hsi-arch009-disposable-e2e-20261104), ready, non-default. NOT modified.
- Disposable branch Managed Better Auth (better_auth) is configured, branch-specific Auth/JWKS URLs present, neon_auth.session and neon_auth.user exist.
- Existing hsi_research_access and hsi_reviewer_authority tables exist.
- hsi_lhkg_nodes, hsi_lhkg_relationships, hsi_lhkg_dossiers are absent on disposable branch: migrations 011 and 012 NOT applied.
- GitHub CI at commit 36cab488 passed.
- Repo site is Vite/React with site/vercel.json static SPA rewrites; there is no verified deployed /api/research/graph-workbench route.
- Existing src/db/neonAuthResearchActor.ts resolves research roles from verified Neon session rows. Reuse it; do not invent a second auth provider.

## Security notes
- Disposable branch Neon Auth configuration currently reports no trusted origins, allows localhost, and email/password sign-up is enabled without mandatory email verification. This is NOT sufficient as an HSI researcher permission grant; hsi_research_access must remain independently admin-provisioned.
- Do not treat user-supplied role or principal as trusted. Session must be verified server-side and mapped to current non-revoked research grants.
- The repo's standalone Bun API requires a trusted same-origin HTTPS reverse proxy; a Vite static Vercel deployment does not automatically run Bun routes.
- Neither Vercel environment variables nor deployed endpoint functionality have been independently inspected.

## Safe next steps (require explicit approval before branch migrations)
1. Review SQL migrations 011 and 012 for immutable trigger idempotency, numeric semantic version constraints, research RLS, DB role grants, migration rollback and auth compatibility.
2. Design one read-only repeatable-read transaction that joins version-pinned graph nodes, edges and dossiers; reject mismatched evidence and missing authority.
3. On explicit approval, apply reviewed migrations ONLY to disposable branch br-morning-fog-zaobvjs0, never production/staging, then run negative RLS and version tests.
4. Wire verified Neon Auth session resolver to a Bun research handler, with request origin, cookie, rate-limit, audit and role checks. No untrusted client-supplied role.
5. Confirm Vercel preview routing or a separately hosted Bun service before enabling GovernedResearchPanel; map ISI editorial node IDs to canonical IDs and label editorial evidence distinctly.
6. Test authenticated researcher, unapproved user, revoked researcher, logout, missing evidence, contradictory evidence, version mismatch, failure recovery and accessible browser navigation.

## Gate
Phase 3 not yet accepted; no database writes, migrations, branch creation, secrets access or production deployment were performed in this verification.
