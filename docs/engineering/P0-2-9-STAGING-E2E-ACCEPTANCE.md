# P0.2.9 — Staging E2E and security acceptance (interim)

**Decision: NO-GO.** Database procedure and integrity checks passed, authenticated researcher/reviewer E2E remains untested.

## Environment
Project `red-wave-06625195`, isolated branch `br-shiny-cherry-zagwwdi8`, database `neondb`. Production unchanged. No runtime activation.

## Executed results
| Test | Outcome |
|---|---|
| Migration 029, 10 statements in isolated staging transaction | PASS |
| Restricted read function owner = hsi_contradiction_function_owner | PASS |
| Read function EXECUTE ACL includes hsi_contradiction_runtime only, plus owner | PASS |
| Direct read from neondb_owner (not granted EXECUTE) | DENIED, expected |
| Insert inconsistent snapshot ({}), staging owner connection | DENIED by snapshot integrity trigger, expected |

## Important limits
- Direct owner denial is NOT a test of runtime principal identity, tenant scope, or forged-token handling inside the new read procedure.
- No LOGIN principal has been provisioned for the NOLOGIN runtime role. No actual researcher or reviewer accounts have been created or tested.
- No cross-tenant positive/negative tests, session revocation, duplicate review, concurrent review, HTTP E2E or independent sign-off.
- Snapshot trigger verifies top-level consistency and left/right IDs, but **does not prove external source authenticity, evidence completeness, scientific correctness or reviewer authority**.
- Restricted create procedure still accepts caller-provided scientific content; canonical scientific validation and provenance verification need further work.
- Existing research access and reviewer authority are not sufficient proof of tenant-scoped read authorization until tested under real session identity.
- No GO decision, no held migration release and no production persistence activation.

## Required E2E matrix
Two verified researcher accounts, two independent scientific reviewers, two tenants. Test authorized create/read/review, cross-tenant read/write/review denial, expired/forged/revoked sessions, revoked membership, disease scope mismatch, self-review, duplicate/concurrent review, append-only denial, and source integrity. Capture sanitized receipts without session tokens.
