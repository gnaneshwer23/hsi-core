# HSI production-readiness audit receipt

**Audited tip:** `482db110c0efa0b4d3a9166b4f97cd8bcd53b38c` (`482db11`) · `origin/main`  
**Follow-through tip:** `eng/recovery-evidence-validation-2026-11-08` — Engineering recovery: N8 artifact regen, Cursor-plan contract map, Gold Eval Suite v1 slots, research mechanism workflow UI; humans / science gates still BLOCKED; Auth A www user-confirmed (not writesEnabled / not Gate C)  
**Prior follow-through tip:** `8013d4cdc13946ddc2c71f958d51cd1c31db7b3d` (`8013d4c`) — Phases 1–10 eng stamps + HUMAN QUEUE deepen (#2/#3/#4/#5/#8 empty worksheets + consolidator); humans still BLOCKED; Auth A www user-confirmed (not writesEnabled / not Gate C)
**Prior HUMAN QUEUE feature tip:** `8013d4cdc13946ddc2c71f958d51cd1c31db7b3d` (`8013d4c`) — empty attestation worksheets + `human-queue:check`
**Prior #10 feature tip:** `a3e07169d33c11b25cf1f0ff651679700a436059` (`a3e0716`) — N7/N8 empty real-data / licence slots + checklist + STOP
**Prior #9 feature tip:** `feef64b1363370561dd4c3f0a12e99ed4be720ee` (`feef64b`) — N5 live CT.gov snapshot refresh + honesty harness
**Prior #8 feature tip:** `491d236eba77a527bc933b2987a5f22ff704e7f8` (`491d236`) — partner-lock empty MoU slots + checklist
**Prior #7 tip:** `0f6634bd1d1d66f56bc2d56fb134b6df6751c2e8` (`0f6634b`) — N6 pilot-prep + Neon ledger helpers
**Prior #6 tip:** `15871a413e68f119be282294924a18fcbfb9d183` (`15871a4`) — 016/017 already on red-wave

**Audit date:** 2026-11-08  
**Canvas source:** `canvases/hsi-production-readiness-audit.canvas.tsx` (workspace)  
**This document:** durable engineering receipt — **not** Gate C clearance, MoU, CDS/PHI, or scientific acceptance.

## Overall verdict

**Not production-ready** as a scientific product, live authenticated research SaaS, or clinical system.

hsi-core at the audited tip is a strong research-substrate + honesty-gated engineering foundation: N1–N8 offline CLEARED harnesses and synthetic e2e moves 1–5 exist. Production QA (2026-11-06) remains launch-blocked; partner lock stays a hypothetical fixture (`lockedPilot=false`); scientific acceptance ≠ engineering CLEARED; synthetic ≠ clinical ≠ eligible.

Default science programme remains **gut–immune–T2D** (Nov 6 plan). SSc stays preserved corpus / commercial proposal only — do not silently pivot science gold.

## Scorecard by plane (1–5)

| Plane | Score | State | One-line evidence |
| --- | --- | --- | --- |
| Substrate / evidence | 3 / 5 | Eng CLEARED / sci BLOCKED | N1–N8 modules + scripts; migrations 001–017 on red-wave (016/017 ledger-applied; Audit #6); Neon ledger helpers ENG CLEARED (Audit #7); N5 live registry refresh ENG CLEARED / sci BLOCKED (Audit #9; `confirmedEligible=false`); N1 rights BLOCKED (DOI identity cleared post-audit — see follow-through) |
| Science gates | 1 / 5 | Scaffold + freeze-prep | N3 freeze-prep ENG CLEARED (Audit #4); labels still empty; N6 pilot-prep ENG CLEARED / NO-GO (Audit #7); N7/N8 real-data prep ENG CLEARED / SCIENCE NO-GO (Audit #10; empty slots); N4 `groundedClaimAccepted` forced false |
| Site / marketing | 3 / 5 | Demo deployable | Vite site + Playwright; honesty banners; not a verified live research product |
| Deploy / CI | 3 / 5 | CI green path ≠ launch | Auth A residual user-confirmed on www (session + researcher grant + fixture); Audit #5 two-account / staging writes still residual; production `writesEnabled` not claimed; PRODUCTION_QA launch blocked |
| Security / honesty | 4 / 5 | Strong invariants | `neonGuard` refuses autumn-snow; `cdsPhiBoundary`; honesty regressions; `.env.example` only |
| Product integrations | 2 / 5 | Contracts ≠ live product | ISI consume + Gate C human queue; cite eng path CLEARED / Approve still 0 HITL; Trials Path B fixtures only |

## Closest to shippable (engineering)

- Offline N1–N8 check scripts + unit tests
- Synthetic e2e pin + N4/N5 adapters + honesty pack
- Stage 1 packs, Gate C checklist, neonGuard, publish outputs
- Public marketing / Discovery / curator surfaces (demo)
- CI verify job (tests + site build + Chromium e2e)

## Explicitly not production

- Partner lock / KPIs (`hypothetical_test_only`)
- N1 passage reuse rights (provider signals inventoried; human clearance still BLOCKED)
- N3 label freeze · N6 usefulness · N7 wet-lab · N8 live models
- Live auth full two-account review / Neon restore / production writes (Auth A: www session eligible + researcher grant + synthetic fixture **user-confirmed**; Audit #5 opsAcceptance still residual; `writesEnabled` / Gate C **not** claimed)
- ISI cite Approve (0 supports / 0 publicCiteApproved at audit)
- Live CDS / PHI / eligibility / Gate C auto-approve (**out of scope**)

## Next build phases (ranked at audit)

| # | Phase | Go / no-go |
| --- | --- | --- |
| 1 | Human-correct N1-C-02/C-03 DOIs + rebuild domain-graph queue | **GO (human edit)** — executed 2026-11-08 (this follow-through) |
| 2 | Record per-source passage reuse rights; keep metadata-only until cleared | **ENG DONE 2026-11-08** / NO-GO sci until human rights |
| 3 | ISI pending HITL: claim_support → Approve on cites (immunecity) | **ENG CLEARED 2026-11-08** / HITL BLOCKED (0 supports / 0 publicCiteApproved) |
| 4 | Recruit SMEs; freeze N3 calibration labels (20–50) then pilot plan | **ENG CLEARED 2026-11-08** / sci BLOCKED (0 labels / 0 SME slots filled) |
| 5 | Unpause staging: two-account auth, research writes, live investigation accept | **ENG CLEARED 2026-11-08** / OPS residual (Auth A www session+grant+fixture **user-confirmed**; two-account + staging writes still open; production writes **not** claimed) |
| 6 | Apply 016/017 on red-wave after offline parity + founder approve | **ENG CLEARED 2026-11-08** (already applied; idempotent skip) |
| 7 | N6 blinded usefulness study after N3 freeze + agreed thresholds | **ENG CLEARED 2026-11-08** / sci NO-GO (0 scores / 0 reviewer slots; waits #4) |
| 8 | Real named partner lock (replace hypothetical fixture) | **ENG CLEARED 2026-11-08** / FOUNDER BLOCKED (0 MoU slots filled; never invent MoU) |
| 9 | Optional: live public-registry snapshot refresh for N5 research | **ENG CLEARED 2026-11-08** / sci BLOCKED (`confirmedEligible=false`; liveStatusVerified=false) |
| 10 | N7/N8 real data or licensed models | **ENG CLEARED 2026-11-08** / SCIENCE NO-GO near-term (0 real-data slots; never invent live runs) |

## Explicit non-goals (next 90 days)

**Hard bans:** live CDS / PHI / PHI→LLM / EHR write-back; Gate C auto-approve or model-driven `hsiGrade` flips; invented MoU / fake `partnerSigned` production lock; HSI substrate on autumn-snow / Akeno / DeliverX Neon; confirmed patient eligibility or enrolment claims.

**Defer:** silent SSc commercial pivot as science gold; absorb full synthetic JSONL/SQLite into git; HTTP `/v1/synthetic/*` server; agent runtime / multi-GB weight vendoring in hsi-core; treating community / challenges / analytics / legal policies as “done”.

## Follow-through logged in this commit series

- **Phase #1 done:** N1-C-02 → `10.1038/ni.3713`, N1-C-03 → `10.1038/nature18646` (Crossref + Europe PMC verified). Offline + live N1: **0** identity mismatches; 12/12 metadata matched unreviewed. Rights + scientific acceptance remain **BLOCKED**. Neon red-wave only; no graph promotion of unverified science.
- **Phase #2 eng done (science still NO-GO):** Per-source passage reuse inventory at `research/domain-graph/n1/rights-inventory.v1.json` (`src/evidence/n1PassageRightsInventory.ts`). Records Europe PMC OA/licence signals for all 12 candidates; `humanCleared=0`, `passageImported=0`, metadata-only. Provider OA/CC labels ≠ corpus reuse permission. Scientific acceptance + human `licenceEvidenceUri` attestation remain **BLOCKED**.
- **Phase #3 eng done (cite HITL still BLOCKED):** immunecity Gate C cite path re-audited — seed → Check (13/13 verified) → inline Claim support → Approve UX + server invariants + `hsi:curator-status` dry-run. Pin remeasure still **0** `claim_support=supports` / **0** `publicCiteApproved`. No invent supports / no auto-approve / autumn-snow only. Receipt: immunecity `docs/engineering/AUDIT_3_ISI_CITE_HITL_2026-11-08.md`. Residual: Neon Auth reviewer S-P-O → Claim support → Approve on `/curation?hsi=cite`, then `--neon` remeasure.
- **Phase #4 eng done (science still NO-GO):** Short recheck found **no** safe cite-HITL eng leftovers (remeasure docs + worksheet already present; Approve/`supports` remain human-only). N3 calibration freeze-prep scaffolded — `src/evidence/n3CalibrationFreezePrep.ts`, `research/domain-graph/n3/freeze-prep.v1.json`, checklist, anonymous SME roster slots (`smeSlotsFilled=0`), `bun run n3:freeze-prep` wired into `n3:check`. Calibration items **24** unlabelled; `humanLabelFreeze=BLOCKED`; `scientificAcceptance=BLOCKED`. No invented labels or SME identities. Receipt: [`AUDIT_4_N3_CALIBRATION_FREEZE_2026-11-08.md`](./AUDIT_4_N3_CALIBRATION_FREEZE_2026-11-08.md).
- **Phase #5 eng done (ops still BLOCKED):** Staging two-account Auth + research-writes harness — `src/ops/stagingTwoAccountAuthPrep.ts`, `operations/staging/two-account-auth-prep.v1.json`, checklist, anonymous account roster slots (`accountSlotsFilled=0`), write-gate honesty samples (staging enable / production refuse / autumn-snow refuse), `bun run staging:auth-prep`. `opsAcceptance=BLOCKED`; `liveAuthVerified=false`; production writes stay disabled; Auth signup polish for founder Gmail deferred. No invented neon_auth principals or production grants. Receipt: [`AUDIT_5_STAGING_TWO_ACCOUNT_AUTH_2026-11-08.md`](./AUDIT_5_STAGING_TWO_ACCOUNT_AUTH_2026-11-08.md).
- **Phase #6 eng done (already on red-wave):** Migrations `016_hsi_evidence_ledger` + `017_hsi_experiment_ledger` verified present on `red-wave-06625195` / `ep-restless-dew…` (`hsi_schema_migrations` applied_at ≈2026-11-08 06:59Z). Offline `\d` parity matched in-repo SQL (tables, soft-link cols, indexes, honesty CHECKs). Idempotent `bun run db:migrate -- --from-neonctl` → `applied=[]`, 016/017 skipped. Empty ledgers (0/0 rows); no production writes enabled; no invented grants. Receipt: [`AUDIT_6_MIGRATIONS_016_017_2026-11-08.md`](./AUDIT_6_MIGRATIONS_016_017_2026-11-08.md).
- **Phase #7 eng done (science still NO-GO):** N6 usefulness pilot-prep scaffolded — `src/evidence/n6UsefulnessPilotPrep.ts`, `research/domain-graph/n6/pilot-prep.v1.json`, checklist, anonymous blinded-reviewer roster slots (`reviewerSlotsFilled=0`), `bun run n6:pilot-prep` wired into `n6:check`. Packets **12** unscored; `usefulnessPilotGoNoGo=NO_GO`; `n3HumanLabelFreezePrerequisite=BLOCKED`; `scientificAcceptance=BLOCKED`. Companion: fail-closed Neon R/W helpers for 016/017 (`evidenceLedgerStore` / `experimentLedgerStore` / `ledgerNeonWriteGate`) — staging writes only; production read-only; offline fixtures remain authority. No invented scores, reviewer identities, MoU, or Gate C. Receipt: [`AUDIT_7_N6_USEFULNESS_PILOT_2026-11-08.md`](./AUDIT_7_N6_USEFULNESS_PILOT_2026-11-08.md).
- **Auth A residual (user-confirmed 2026-11-08):** On www for `jadav.gnaneshwar@gmail.com` — research **session eligible**, **researcher grant** visible, **synthetic test fixture** visible. Does **not** claim production `writesEnabled`, Gate C, or full Audit #5 two-account opsAcceptance.
- **Phase #8 eng done (founder still BLOCKED):** Partner-lock prep scaffolded — `src/ops/partnerLockPrep.ts`, `operations/partner/partner-lock-prep.v1.json`, checklist, empty MoU slots (`mouSlotsFilled=0`), `bun run partner:lock-prep`. Active path remains hypothetical fixture (`legalBinding=false` → `lockedPilot=false`); `founderAcceptance=BLOCKED`. No invented MoU text, named orgs, or `legalBinding=true`. Receipt: [`AUDIT_8_PARTNER_LOCK_2026-11-08.md`](./AUDIT_8_PARTNER_LOCK_2026-11-08.md).
- **Phase #9 eng done (science still BLOCKED):** N5 live public-registry snapshot refresh — ClinicalTrials.gov API v2 lookup for pinned NCTs `NCT01030861` + `NCT02401880`, captured fixtures, live snapshot/receipt, `bun run n5:research:live` / `n5:research:live:check`. `liveRegistryQueried=true` on live path; `confirmedEligible=false`, `liveStatusVerified=false`, `scientificAcceptance=BLOCKED` always. Offline engineering fixtures remain `n5:check` authority. No invented eligibility / enrolment / Gate C / MoU. Receipt: [`AUDIT_9_N5_LIVE_REGISTRY_REFRESH_2026-11-08.md`](./AUDIT_9_N5_LIVE_REGISTRY_REFRESH_2026-11-08.md).
- **Phase #10 eng done (science still NO-GO):** N7/N8 real-data / licensed-model prep scaffolded — `src/evidence/n7n8RealDataPrep.ts`, `research/domain-graph/n7n8/real-data-prep.v1.json`, checklist, empty real-data / licence slots (`realDataSlotsFilled=0`), `bun run n7n8:real-data-prep`. `nearTermGoNoGo=NO_GO`; `realObservationClaimed=false`; `modelActivationAllowed=false`; `scientificAcceptance=BLOCKED`. Explicit STOP: further progress is human residuals (#2 rights, #3 cite HITL, #4 SMEs, #5 two-account, #8 MoU). No invented wet-lab, partner data, licences, MoU, or Gate C. Receipt: [`AUDIT_10_N7_N8_REAL_DATA_2026-11-08.md`](./AUDIT_10_N7_N8_REAL_DATA_2026-11-08.md).
- **HUMAN QUEUE deepen (eng CLEARED / humans still BLOCKED):** Consolidated residuals #2/#3/#4/#5/#8 — empty attestation worksheets, curator runbooks, `operations/human-queue/human-queue.v1.json`, `bun run human-queue:check`. Counters unchanged: N1 `humanCleared=0`/`passageImported=0`; cite 0/0; N3 labels 0; staging `opsAcceptance=BLOCKED`; MoU `mouSlotsFilled=0`. No invented MoU / supports / SME labels / licence clearance / Gate C / production writes. Receipt: [`AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md`](./AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md) · master [`HUMAN_QUEUE_RESIDUALS.md`](./HUMAN_QUEUE_RESIDUALS.md).

## Verify (post-correction)

```sh
bun run n1:verify
bun run n1:verify:live
bun run n1:check
bun run n3:freeze-prep
bun run n3:check
bun run n4:check
bun run staging:auth-prep
bun run staging:auth-prep:check
bun run n6:pilot-prep
bun run n6:check
bun run partner:lock-prep
bun run partner:lock-prep:check
bun run n5:research:live:check
bun run n5:check
bun run n7n8:real-data-prep
bun run n7n8:real-data-prep:check
bun run human-queue:prep
bun run human-queue:check
bun run db:migrate -- --from-neonctl
bun --no-env-file test test/n1SourceVerification.test.ts test/scientificBenchmark.test.ts test/n3CalibrationFreezePrep.test.ts test/groundedBrief.test.ts test/stagingTwoAccountAuthPrep.test.ts test/n6UsefulnessPilotPrep.test.ts test/ledgerNeonStores.test.ts test/partnerLockPrep.test.ts test/n5RegistryLiveRefresh.test.ts test/cohortTrialCriteriaResearch.test.ts test/n7n8RealDataPrep.test.ts test/humanQueueResidualPrep.test.ts test/vercelResearch.test.ts
```
