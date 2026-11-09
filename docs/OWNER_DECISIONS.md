# Owner decisions

Closed items from the 2026-11-09 hygiene pass, plus what remains human-only.

| Decision | Status | Where |
| --- | --- | --- |
| **LICENSE** | **Closed — Apache-2.0** | Root [`LICENSE`](../LICENSE); `package.json` `license` field |
| **GitHub repository description** | **Closed** | One-HSI wording + homepage `https://www.humansuperintelligence.tech/` |
| **Branch protection on `main`** | **Closed** | Require PR; required checks `verify` + `site-deployment`; no force-push/delete; strict up-to-date — [`docs/engineering/BRANCH_PROTECTION_MAIN.md`](./engineering/BRANCH_PROTECTION_MAIN.md) |
| **Neon identifier rotation** | **Closed — accept ID risk** | IDs in history only; no credential leak found — [`docs/security/NEON_HISTORY_ID_DECISION.md`](./security/NEON_HISTORY_ID_DECISION.md). Passwords/endpoints **not** rotated in this pass |
| **Real endpoint configuration** | Still private-env only | `HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_HOST_ALLOWLIST`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN` |
| **RLS migration 020** | Hold released for apply | Reader-only `hsi_lhkg_reader` policies accepted; apply when red-wave credentials available (`bun run db:migrate`). **No migration 021** in tree (019 = renumbered ISI review; 020 = RLS) |
| **Expert reviewers, source licences, DPIA, clinical safety** | **OPEN (human)** | [`docs/security/OPEN_HUMAN_GOVERNANCE.md`](./security/OPEN_HUMAN_GOVERNANCE.md) |

Third-party research pack source licences remain a separate human matrix — this Apache-2.0 grant covers the repository substrate, not every upstream dataset.
