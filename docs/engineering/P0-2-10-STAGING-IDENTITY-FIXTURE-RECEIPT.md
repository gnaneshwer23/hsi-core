# P0.2.10 — Actual staging identity fixture execution receipt

**NO-GO: authenticated two-tenant E2E has not passed.**

## Target
Neon project `red-wave-06625195`; isolated branch `br-shiny-cherry-zagwwdi8`. No production changes.

## Provisioned (2026-11-11)
Created through Neon Auth API (not manual session inserts):
- `hsi-p0210-researcher-a@example.com` — tenant `tenant-p0210-a`, researcher.
- `hsi-p0210-reviewer-a@example.com` — tenant `tenant-p0210-a`, scientific reviewer with SSc authority.
- `hsi-p0210-researcher-b@example.com` — tenant `tenant-p0210-b`, researcher.
- `hsi-p0210-reviewer-b@example.com` — tenant `tenant-p0210-b`, scientific reviewer with SSc authority.

Verified staging counts: 4 tenant memberships, 4 research access grants, 2 reviewer authority grants, 0 verified fixture users.

## Discovered schema mismatch
`hsi_research_access.access_role` accepts only `researcher` or `research_admin`; a `scientific_reviewer` insert failed and its transaction rolled back. Corrected fixture gives reviewers researcher access plus independently scoped scientific reviewer authority and tenant reviewer membership. Second transaction succeeded.

## Blockers and security constraints
- All four test Neon Auth users have `emailVerified=false`; no genuine valid sessions or token-based E2E were created. Do not forge `neon_auth.session` rows or manually mark unverified accounts as verified.
- Restricted runtime role `hsi_contradiction_runtime` is NOLOGIN. A separately credentialed, non-privileged LOGIN must be provisioned without inherited blanket table SELECT/INSERT privileges. Avoid Neon default admin roles and blanket read_only/read_write role grants.
- Existing app store `src/db/transactionalContradictionStore.ts` still queries protected tables directly rather than invoking the restricted stored procedures.
- No positive create/read/review E2E, cross-tenant denial, revoked token, concurrent review, or HTTP E2E has been performed.
- No external security sign-off. No persistence activation. Migrations 024–029 remain held in automated deployment.

## Acceptance
Complete verified test-user sign-in through supported Neon Auth flow, restricted runtime connection, procedure-based app adapter and all positive/negative two-tenant E2E. Collect sanitized results; no real tokens in GitHub, logs or test fixtures.

**Release: NO-GO.**
