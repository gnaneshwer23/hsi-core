# HSI production-readiness audit receipt

**Audited tip:** `482db110c0efa0b4d3a9166b4f97cd8bcd53b38c` (`482db11`) · `origin/main`  
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
| Substrate / evidence | 3 / 5 | Eng CLEARED / sci BLOCKED | N1–N8 modules + scripts; migrations 001–017 in-repo; 016/017 stub-not-applied; N1 rights BLOCKED (DOI identity cleared post-audit — see follow-through) |
| Science gates | 1 / 5 | Scaffold only | N3 empty labels; N6 empty score packets; N4 `groundedClaimAccepted` forced false; no SME freeze |
| Site / marketing | 3 / 5 | Demo deployable | Vite site + Playwright; honesty banners; not a verified live research product |
| Deploy / CI | 3 / 5 | CI green path ≠ launch | `research-foundation.yml` + site:build/e2e; bun pin mismatch noted; PRODUCTION_QA launch blocked |
| Security / honesty | 4 / 5 | Strong invariants | `neonGuard` refuses autumn-snow; `cdsPhiBoundary`; honesty regressions; `.env.example` only |
| Product integrations | 2 / 5 | Contracts ≠ live product | ISI consume + Gate C human queue; cite Approve still 0; Trials Path B fixtures only |

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
- Live auth / two-account review / Neon restore drills
- ISI cite Approve (0 supports / 0 publicCiteApproved at audit)
- Live CDS / PHI / eligibility / Gate C auto-approve (**out of scope**)

## Next build phases (ranked at audit)

| # | Phase | Go / no-go |
| --- | --- | --- |
| 1 | Human-correct N1-C-02/C-03 DOIs + rebuild domain-graph queue | **GO (human edit)** — executed 2026-11-08 (this follow-through) |
| 2 | Record per-source passage reuse rights; keep metadata-only until cleared | **ENG DONE 2026-11-08** / NO-GO sci until human rights |
| 3 | ISI pending HITL: claim_support → Approve on cites (immunecity) | GO out-of-repo HITL |
| 4 | Recruit SMEs; freeze N3 calibration labels (20–50) then pilot plan | GO only with real reviewers |
| 5 | Unpause staging: two-account auth, research writes, live investigation accept | GO when ops prerequisite lifted |
| 6 | Apply 016/017 on red-wave after offline parity + founder approve | GO eng / gated migrate |
| 7 | N6 blinded usefulness study after N3 freeze + agreed thresholds | NO-GO until #4 |
| 8 | Real named partner lock (replace hypothetical fixture) | Founder decision — never invent MoU |
| 9 | Optional: live public-registry snapshot refresh for N5 research | Conditional GO; keep `confirmedEligible=false` |
| 10 | N7/N8 real data or licensed models | NO-GO near-term |

## Explicit non-goals (next 90 days)

**Hard bans:** live CDS / PHI / PHI→LLM / EHR write-back; Gate C auto-approve or model-driven `hsiGrade` flips; invented MoU / fake `partnerSigned` production lock; HSI substrate on autumn-snow / Akeno / DeliverX Neon; confirmed patient eligibility or enrolment claims.

**Defer:** silent SSc commercial pivot as science gold; absorb full synthetic JSONL/SQLite into git; HTTP `/v1/synthetic/*` server; agent runtime / multi-GB weight vendoring in hsi-core; treating community / challenges / analytics / legal policies as “done”.

## Follow-through logged in this commit series

- **Phase #1 done:** N1-C-02 → `10.1038/ni.3713`, N1-C-03 → `10.1038/nature18646` (Crossref + Europe PMC verified). Offline + live N1: **0** identity mismatches; 12/12 metadata matched unreviewed. Rights + scientific acceptance remain **BLOCKED**. Neon red-wave only; no graph promotion of unverified science.
- **Phase #2 eng done (science still NO-GO):** Per-source passage reuse inventory at `research/domain-graph/n1/rights-inventory.v1.json` (`src/evidence/n1PassageRightsInventory.ts`). Records Europe PMC OA/licence signals for all 12 candidates; `humanCleared=0`, `passageImported=0`, metadata-only. Provider OA/CC labels ≠ corpus reuse permission. Scientific acceptance + human `licenceEvidenceUri` attestation remain **BLOCKED**.

## Verify (post-correction)

```sh
bun run n1:verify
bun run n1:verify:live
bun run n1:check
bun run n3:check
bun run n4:check
bun --no-env-file test test/n1SourceVerification.test.ts test/scientificBenchmark.test.ts test/groundedBrief.test.ts
```
