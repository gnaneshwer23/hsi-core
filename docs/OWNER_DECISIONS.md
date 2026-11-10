# Owner decisions

Closed items from the 2026-11-09 hygiene pass, plus what remains human-only.

| Decision | Status | Where |
| --- | --- | --- |
| **LICENSE** | **Closed — Apache-2.0** | Root [`LICENSE`](../LICENSE); `package.json` `license` field |
| **GitHub repository description** | **Closed** | One-HSI wording + homepage `https://www.humansuperintelligence.tech/` |
| **Branch protection on `main`** | **Closed** | Require PR; required checks `verify` + `site-deployment`; no force-push/delete; strict up-to-date — [`docs/engineering/BRANCH_PROTECTION_MAIN.md`](./engineering/BRANCH_PROTECTION_MAIN.md) |
| **Neon identifier rotation** | **Closed — accept ID risk** | IDs in history only; no credential leak found — [`docs/security/NEON_HISTORY_ID_DECISION.md`](./security/NEON_HISTORY_ID_DECISION.md). Passwords/endpoints **not** rotated in this pass |
| **Real endpoint configuration** | Still private-env only | `HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_HOST_ALLOWLIST`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN` |
| **RLS migration 020 and HITL migration 021** | Released for apply; not asserted as applied | 020 is reader-only `hsi_lhkg_reader` policies. 021 is in the tree (`021_hsi_hitl_questions_outbox.sql`): question outbox, local-only channel, patient delivery rejected. Neither is held. The 021 file says that commit did not apply it to a live database. Apply with `bun run db:migrate` on the HSI Neon project only. 022 and 023 are separate and remain held. |
| **Expert reviewers, source licences, DPIA, clinical safety** | **OPEN (human)** | [`docs/security/OPEN_HUMAN_GOVERNANCE.md`](./security/OPEN_HUMAN_GOVERNANCE.md) |

Third-party research pack source licences remain a separate human matrix — this Apache-2.0 grant covers the repository substrate, not every upstream dataset.
