# Gitleaks scan — 2026-11-09

Scanner: gitleaks 8.24.2. The working tree and the full git history were scanned. This note records counts and locations only. It does not repeat match text.

## Result

| Scan | Findings | Rules |
| --- | --- | --- |
| Working tree | 723 | `generic-api-key` only |
| Full history (`--all`) | 723 | `generic-api-key` only |

No private-key, credential, or database-URL rule fired. Entropy of the generic-api-key hits sat between 3.55 and 3.84.

| Location | Findings |
| --- | --- |
| `site/public/research` condition JSON | 720 |
| `research/fixtures/hsi-synthetic-e2e` | 1 |
| `research/domain-graph` | 2 |

Those files are public research fixtures. The hits match the generic-api-key pattern inside JSON, not a password or a cloud credential. They were left in place.

## Neon identifiers

Unique Neon project, branch and host identifiers were removed from the working tree and replaced with public placeholders (`hsi-neon-project`, `ep-hsi-production`, `ep-hsi-staging`, and the same kind of placeholder for other products). Gitleaks did not classify those identifiers as secrets. They are still present in git history, because history was not rewritten.

Real endpoints, if still in use, belong only in the private environment (`HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_HOST_ALLOWLIST`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN`). Whether to rotate or restrict them is an owner decision. See [OWNER_DECISIONS.md](../OWNER_DECISIONS.md).

Personal home-directory paths were removed from the working tree as well. They also remain in history.
