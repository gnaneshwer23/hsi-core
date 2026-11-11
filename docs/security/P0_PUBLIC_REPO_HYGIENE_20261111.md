# P0 public repository hygiene — 2026-11-11

**Status: IN PROGRESS — not a completed repository-wide or history scan.**

## Redaction performed in this PR
- `docs/engineering/P1_12_5_STAGING_ACCEPTANCE_EVIDENCE_20261111.md`: staging project and branch identifiers replaced with placeholders.
- `docs/engineering/RESEARCH_BETA_STAGING_CONNECTION_EXECUTION_20261111.md`: staging project and branch identifiers replaced with placeholders.
- `docs/engineering/RESEARCH_BETA_AUTHENTICATED_STAGING_ACCEPTANCE.md`: reconciled old null-password role blocker with the newer dedicated direct-login evidence; explicitly retained unverified app and cross-tenant E2E gates.
- `docs/security/NEON_PASSWORD_ROTATION_2026-11-09.md`: production project, branch and endpoint identifiers replaced with placeholders. Production Vercel secret rotation remains **unverified**.

## Security interpretation
Project IDs, branch IDs and endpoint prefixes are infrastructure metadata, **not passwords**. Their publication may aid reconnaissance but does not itself prove credential compromise. Redacting the current tree does not erase Git history.

## Mandatory follow-up before P0 sign-off
1. Search **all tracked files and every Git ref/history** for live Neon project/branch/endpoint identifiers, database URLs, access tokens and other secrets; record only filenames/commit IDs and redacted match categories, never secret values.
2. Use a dedicated full-history secret scanner (for example Gitleaks or TruffleHog) in a trusted environment; review false positives and document coverage. **Not executed by this PR.**
3. Determine whether any true credentials were committed. If so, rotate/revoke those credentials before deciding on history rewriting; coordinate history changes with repository collaborators.
4. Inspect Vercel production environment variable **metadata** and confirm the 2026-11-09 production database password rotation was propagated; do not reveal values.
5. Update the capability register and regenerate `docs/STATUS.md` using `bun run status:write` rather than manually editing generated status.
6. Keep P1.12 unmounted and research beta **NO-GO** until the canonical edge schema, stored contradiction acceptance, named independent scientific reviewer and later end-to-end gates are satisfied.

## Science priority
Pilot: systemic sclerosis Tfh–IL-21–B-cell evidence. Canonical edge/context rules and stored Ricard-versus-Ly contradiction acceptance precede further API activation or new product domains.
