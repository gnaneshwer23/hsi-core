# Research workspace synthetic test fixture

**Purpose:** Let a verified researcher exercise read-path UI on www without claiming scientific approval.

**Honesty:** SYNTHETIC/TEST FIXTURE ONLY — not scientific approval, Gate C auto-approve, MoU, `legalBinding`, or live CDS/PHI.

## What it seeds (red-wave only)

| Row | ID |
| --- | --- |
| Published release (empty claims; engineering fixture) | `hsi-release-test-fixture-ssc-ws-001` · v`0.0.1` |
| Draft investigation | `hsi-interrogative-test-fixture-ws-001` |

Default principal: `6c2342fd-c581-4a8a-b40e-1b7fa065e237` (must already have active `researcher` in `hsi_research_access`).

## Commands

```sh
bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl
bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl --branch staging
bun scripts/seed-research-workspace-test-fixture.ts --from-neonctl --rollback
bun --no-env-file test test/researchWorkspaceTestFixture.test.ts
```

## Ops constraints

- Production `writesEnabled` stays **false** on www.
- Do **not** set `HSI_SSC_RESEARCH_RELEASE_ID` to this test release on the live www deployment.
- Create-new via UI still requires staging Preview with founder-gated writes (`HSI_RESEARCH_WRITES_ENABLED=true`, staging branch id, and write-gate host `ep-hsi-staging`). As of 2026-11-08, Neon `hsi-staging-branch` connection strings still resolve to `ep-hsi-production…` — confirm/provision the sweet-hill endpoint before enabling writes.
- Rollback deletes the fixed investigation then the fixed release IDs only.

## Where to click (www)

1. Sign in → `/research/account` → **Refresh access**
2. Open the draft titled with `[TEST/SYNTHETIC FIXTURE …]`
3. Or `/research/scientific-workbench` / dashboard workspace → **Your saved investigations**
4. Detail: `/research/decision-workbench?investigation=hsi-interrogative-test-fixture-ws-001`
