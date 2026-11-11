# P0.2.6 — Consolidated staging acceptance report (interim)

**Decision: NO-GO. No persistence activation.**

## Verified environment
- Neon project: red-wave-06625195
- Isolated branch: br-shiny-cherry-zagwwdi8 (hsi-p0-2-5-isolated-security-acceptance-20261111)
- Read-only inspection: neon_auth.session, hsi_research_access present; hsi_contradiction_records, hsi_contradiction_review_events, hsi_contradiction_tenant_memberships absent.
- No migrations 024–027 applied in this run. No production database changes.

## Changes proposed in this PR
- Review procedure no longer accepts caller-supplied disease scope. It reads the stored left-edge disease field; only explicit ssc/ra values are accepted. **Still requires comparison against right-edge context and independently validated disease mapping.**
- Domain-agnostic research investigation contract for immunity, microbiome, neurobiology and metabolism; source provenance and review status retained. Verified coverage requires reviewed evidence; no domain claimed verified by default.

## Critical blockers
1. Migration 027 SECURITY DEFINER owner and FORCE RLS permissions are not implemented/tested; EXECUTE grants intentionally absent.
2. Database evidence validation, two-edge disease agreement, read isolation and tenant-safe RLS remain incomplete.
3. No real two-identity/two-tenant authenticated E2E, concurrency, rollback, negative grants, revocation or HTTP receipts.
4. No independently verified scientific evidence for all four domain flagship cases.
5. PR #232 audit still open as last checked; reconcile before release.
6. Staging branch is a clone of production data; use only synthetic records, never expose or log real Neon Auth tokens.

## Required next acceptance run
- Create a new disposable staging clone if schema/data state changed; apply reviewed migrations in sequence with transaction logging.
- Provision dedicated least-privilege roles; prove direct table access denied and SECURITY DEFINER functions work only for verified principal and tenant.
- Use two verified independent test accounts, tenant A and tenant B; test submit, review, read, self-review denial, cross-tenant denial, revoked role, forged/expired session, duplicate/concurrent review, UPDATE/DELETE denial, and rollback.
- Generate evidence-linked SSc dossier; domain previews for microbiome/metabolism/neurobiology remain unverified until source-level extraction and review.
- Require security reviewer sign-off and explicit activation decision. **Do not remove migration holds or enable production.**
