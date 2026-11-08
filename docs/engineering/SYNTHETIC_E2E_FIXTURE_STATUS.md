# Synthetic e2e fixture status

**Label:** `e2e-fixture` (distinct from `hsi-synthetic-validation-0.1`)  
**Pack version:** `hsi-fixture-1.0.0` · **seed:** `20261106`  
**Date:** 8 November 2026  
**Fixtures:** [`research/fixtures/hsi-synthetic-e2e/`](../../research/fixtures/hsi-synthetic-e2e/)

Engineering **contract pin** only. Vendor path + SHA-256 pins for small contracts/samples. Python CLI / `engine.py` stay **external** and are **not** product authority. No HTTP server in this increment.

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| In-repo fixture pointer + hash pin | **CLEARED (engineering)** | `MANIFEST.json` + vendored contracts/samples |
| Honesty fields on sample payloads | **CLEARED (engineering)** | `synthetic:true`, banner fields, `confidence.value=null` |
| Scientific acceptance | **BLOCKED** | Procedural fiction; not validation science |
| Live CDS / PHI / eligibility | **BLOCKED** | Screening notices deny confirmed eligibility |
| Gate C auto-approve / invented MoU | **BLOCKED** | Explicitly false in `STATUS.json` |
| HTTP synthetic adapter server | **BLOCKED (deferred)** | OpenAPI describes a *proposed* API — not implemented |
| Absorb full pack into git | **BLOCKED** | No JSONL / SQLite / learning sets |

## Delivered

- Vendored: `PACK_MANIFEST.json`, `api_contract.json`, `schema_contract.json`, `outputs/sample_request.json`, `outputs/sample_response*.json`
- Pointer + pins: `research/fixtures/hsi-synthetic-e2e/{MANIFEST,STATUS,README}.md|json`
- Check: `bun run fixture:synthetic-e2e:check`
- Test: `test/syntheticE2eFixture.test.ts`

## External pack

Full tree (do not modify from this repo): `/Users/gnaneshwerjadav/Downloads/hsi-synthetic-e2e/`  
Verify with digests in `MANIFEST.json` → `pin`.

## Verify locally

```sh
bun run fixture:synthetic-e2e:check
bun run fixture:synthetic-e2e:n5-adapter
bun --no-env-file test test/syntheticE2eFixture.test.ts
bun --no-env-file test test/syntheticE2eN5Adapter.test.ts
```

## Move 3 — N5-adjacent TS adapter slice

**Shipped:** thin adapter `src/evidence/syntheticE2eN5Adapter.ts` maps vendored sample `trial_screening` (1 patient × 1 protocol version × criteria) into Path B criterion states with forced honesty:

| Pack | Path B / N5 honesty |
| --- | --- |
| truth `true` | `satisfied` (screening contribution `candidate`) |
| truth `false` | `not_satisfied` (screening contribution `excluded`) |
| truth `unknown` | `unknown` (screening contribution `needs_review`) |
| status `candidate` / `excluded` / `needs_review` | aggregate correspondence only — never `patientEligible` / `confirmedEligible` |
| Forced flags | `dataClass=synthetic`, `containsPhi=false`, both eligibility flags `false` |

Check: `bun run fixture:synthetic-e2e:n5-adapter` · Tests: `test/syntheticE2eN5Adapter.test.ts`

Honesty banners from `synthetic_notice` + screening `notice` are retained. Scientific acceptance stays **BLOCKED**.

## Residual

Still out of scope: implement or stub the proposed `/v1/synthetic/*` HTTP surface, wire an external Python CLI runner, or absorb any large data/SQLite artifacts. Any later HTTP work must retain synthetic-only honesty and must not claim live eligibility, CDS, Gate C, or Neon cross-wiring.
