# Phase 5 — RA proof-point smoke report

**Date:** 2026-11-03  
**Verdict:** Engineering proof-point **PASS** (disposable DB + corpus verify).  
**Not** scientific validation, licence clearance, Gate C approval, or clinical fitness.

## Tips exercised

| Repo | SHA (at report time) |
| --- | --- |
| hsi-core | see commit that adds this report |
| immunecity | tip with `scripts/phase5-ra-proof-smoke.ts` |
| aksh-health-redesign | tip with `packages/platform-uk/scripts/phase5-ra-proof-smoke.ts` |

## Automated results

| Check | HSI | ISI | Aksh |
| --- | --- | --- | --- |
| `ra:verify-research-path` / corpus verify | PASS | PASS | PASS |
| Pending `ra-anti-tnf-evidence` → `evidence_not_ready` (422) | PASS | PASS | PASS |
| Start `ra-anti-tnf-research` with ≥2 passages | PASS | PASS | PASS |
| Reload / get matches start snapshot | PASS | PASS | PASS |
| Cross-owner get/review denied | n/a (memory) | PASS | PASS |
| Review does not promote claims | PASS | PASS | PASS |
| Export JSON/Markdown | PASS | PASS | PASS |
| Product backend RLS/CAS/audit/quotas suite | n/a | PASS | PASS |

Commands:

```sh
# HSI
bun run ra:verify-research-path

# ISI (after setup-investigation-test-db.ts --reset)
HSI_TEST_DB_URL='postgres://hsi_app_test:…@127.0.0.1:5432/hsi_step3_test' \
  bun scripts/phase5-ra-proof-smoke.ts

# Aksh platform-uk (same disposable DB pattern)
HSI_TEST_DB_URL='postgres://hsi_app_test:…@127.0.0.1:5432/hsi_step3_test' \
  bun scripts/phase5-ra-proof-smoke.ts
```

## Live browser (manual — remaining)

| Product | Status |
| --- | --- |
| ISI `/internal-research` | Migration `0029` live on autumn-snow. Sign in as existing **admin**. |
| Aksh `/internal-research` | Migration `056` live on tiny-river **local-dev**. **Blocked** until `provision-hsi-research.ts <USER_ID> reviewer`. |

Scientific Inspector deep-link on ISI relationships was not re-driven in this automated pass (graph anchors on the research working set are SYN-* mirrors; core graph Inspector remains on `isi-core-graph`).

## Honesty preserved

- Serology-response passages do not become anti-TNF efficacy claims (`claims.length === 0`).
- Workflow `accept_for_research` ≠ Gate C / scientific approval.
- Rights-verified corpus stays unavailable until licence URI import (Phase 2).
