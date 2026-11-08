# Cursor integration plan → HSI mapping

**Reference:** `/Users/gnaneshwerjadav/Downloads/CURSOR_INTEGRATION_AND_AI_PLAN.md` (also under `hsi-synthetic-v3/`).  
**Machine map:** `evaluation/gold-evaluation-suite/v1/cursor-plan-contract-map.v1.json` · `src/adapters/cursorSyntheticV3ContractMap.ts`

## Binding

- Treat the plan as a **fixture reference**, not a replacement for HSI services.
- HSI Neon stays **red-wave / ep-restless-dew only** — never autumn-snow.
- No invented MoU / `legalBinding=true` / Gate C auto-approve / live CDS·PHI·EHR / auto graph promotion.
- Full v3 JSONL/SQLite pack is **not** absorbed into git (explicit non-goal).

## Already present in hsi-core

| Plan idea | HSI surface |
| --- | --- |
| Typed observation / claim / hypothesis | `src/researchContracts.ts` |
| Synthetic timeline + isolation | `clinicalSyntheticTimeline`, validation v0.1 |
| Evidence support/oppose + context mismatch | N4 grounded brief + synthetic e2e N4 adapter |
| Trial candidate-for-review only | clinical research scaffold + N5 (confirmedEligible=false) |
| Independent review / no auto training promote | investigation delivery + scientific review APIs |
| Deterministic baselines before models | Phase E `scientificEvaluation` + gold suite baselines |
| 50-question design bank (draft) | `evaluation/research-readiness/` |

## Added in this recovery branch

| Artefact | Role |
| --- | --- |
| `cursorSyntheticV3ContractMap` | Explicit capability→HSI mapping with honesty gates |
| Gold Evaluation Suite v1 | Ten capability slots extending research-readiness / Phase E |
| Research mechanism workflow | One RA/SSc path bound to real `/api/research/*` + synthetic fixture |
| `/research/mechanism-workflow` | UI that probes backend responses (not hard-coded demos) |

## Deferred (intentionally)

- Parallel `POST /v2/synthetic/*` HTTP server
- Absorbing full 360-patient JSONL into the repo
- Distributed permission withdrawal / backup recall
- Any generative model activation or predictive biological validity claim
