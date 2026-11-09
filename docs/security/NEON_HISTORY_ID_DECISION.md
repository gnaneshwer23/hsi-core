# Neon history identifier decision

**Date:** 2026-11-09  
**Scope:** HSI Neon only (`human super intelligence` / red-wave). Never ISI autumn-snow / Akeno / DeliverX.

## Finding

- Working-tree gitleaks (8.24.2): **723** hits, all rule `generic-api-key`, almost entirely research fixture JSON. No private-key, credential, or database-URL rule fired. See [`GITLEAKS_REPORT.md`](./GITLEAKS_REPORT.md).
- Current tree uses placeholders for Neon project/host ids (`hsi-neon-project`, `ep-hsi-production`, `ep-hsi-staging`). Test and example URLs use fake passwords (`never-used`, `PASSWORD`, `secret` fixtures).
- Historical Neon **project / branch / host identifiers** remain in git history. History was not rewritten.

## Decision: **accept residual ID risk — do not rotate endpoints solely for history IDs**

| Question | Answer |
| --- | --- |
| Rotate Neon project / endpoint IDs because they appear in git history? | **No** (IDs alone; no credential material found by secrets scan) |
| Rotate Neon role passwords? | **Not in this pass** — no password/URL secret rule fired; no live credentials available in this workspace to rotate via neonctl |
| Residual risk | Someone with history access can learn historical host/project naming. That does not grant DB access without credentials. |
| Required ongoing control | Keep real `DATABASE_URL` / passwords only in gitignored `.env.local`, Vercel env, or neonctl OAuth. Never commit secrets. |

## Actions taken

- Documented this decision (this file).
- Confirmed current tree has no live Neon passwords/URLs committed (placeholders / test fixtures only).
- **Passwords / endpoints were not rotated** in Neon console (no credential leak demonstrated; neonctl / `.env.local` unavailable in this agent environment).

## Revisit if

- Any historical commit is found to contain a real Neon password, API key, or full connection string; or
- Neon support / threat model requires endpoint rename after a separate incident.

Then: rotate red-wave role passwords via neonctl OAuth (never paste into chat), update private env pins, and optionally recreate endpoints if Neon tooling makes that low-breakage.
