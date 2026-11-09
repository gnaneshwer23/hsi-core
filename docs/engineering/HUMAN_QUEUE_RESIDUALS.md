# HUMAN QUEUE residuals (post Audit #1–#10)

**Date:** 2026-11-08  
**Verdict:** Ranked eng track **COMPLETE THROUGH #10**. Remaining production-readiness progress is **HUMAN QUEUE only**.

**Pack:** `operations/human-queue/human-queue.v1.json` · `bun run human-queue:check`  
**Receipt:** [`AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md`](./AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md)  
**Canvas:** workspace `canvases/hsi-production-readiness-audit.canvas.tsx` § HUMAN QUEUE  
**Backend SI eng sequence:** PRs **1–8** complete on `main` (~`bcee2cb`) — see [`BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](./BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md). Further progress is **human-gated**, not more architecture layers.

This document consolidates eng-safe residual deepen work. It does **not** clear science, HITL, opsAcceptance, or founder MoU. Queue items remain **PARKED** / `ENG_CLEARED_HUMAN_BLOCKED` until humans act — this brief does **not** unpark them.

## Current next steps after eng 1–8 (#2 · #4 · #5)

Focus residuals the founder called out after Backend Scientific Intelligence PRs 1–8. (#3 ISI cite HITL and #8 MoU remain parked elsewhere; do not invent either.)

**Suggested order (from audit ranking + N3/R2 deps):** **#2 rights (human principal now) → #4 SME gold → #5 live walkthrough.** Eng-assist for #2 is merged; **do not start #4/#5 implementation** until the human fills [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md). Staging Auth alignment for #5 may start in parallel as ops work, but do not claim scientific journey / passage depth complete until #2 (and scored gold until #4).

### #2 — Passage / abstract reuse rights

| | |
|--|--|
| **Unblocks** | Licensed full-text / passage import; deeper semantic entailment; R1 packet gold binding; rights-eligible pilot passages for N3/R2 |
| **Active human action** | Fill-ready principal checklist: [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md) — open publisher terms for each of 12 `N1-C-*` rows, prefer **metadata-only** when ambiguous, stamp `licenceEvidenceUri` · `permittedUses` · `principal` · `recordedAt` · `rationale` on `research/domain-graph/n1/attestation-worksheet.v1.json`; set `passageImportAuthorized` only when import is actually allowed. Keep `passageImported=0` until a separate import step |
| **Eng prepared** | `rights-inventory.v1.json` · empty attestation worksheet · Crossref offline fixtures + [`licence-lookup-assist.v1.json`](../../research/domain-graph/n1/licence-lookup-assist.v1.json) · [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md) · [`N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md`](./N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md) · [`N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md`](./N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md) · R1 quarantine packets · `bun run n1:check` / `n1:attestation:check` / `human-queue:check` refuse invented clearance · matrix default metadata-only / fail-closed import |
| **Eng must NOT** | Invent `licenceEvidenceUri` / `principal` on the attestation worksheet from Europe PMC OA/CC labels or Crossref observations; set `humanCleared>0` / `passageImported>0` / `rightsCleared=true` without human attestation; promote uncleared passages; edit inventory attestation fields from chat; claim CLEARED from eng-assist |
| **Verify after humans** | `bun run n1:check` · `bun run n1:attestation:check` · `bun run r1:check` · `bun run human-queue:check` · `bun --no-env-file test test/n1PassageRightsInventory.test.ts test/n1LicenceLookupAssist.test.ts test/humanQueueResidualPrep.test.ts` — counters move only when worksheet attestations are real |

**Status:** **IN PROGRESS · awaiting human principal** (eng-assist done) · `rightsCleared=false` · `humanCleared=0` · `passageImported=0` · **not CLEARED** until principal attests via [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md) (2 Crossref candidate URIs + 1 CC-under-TDM observation recorded for humans; 12/12 still need principal)

### #4 — SME dual labels + adjudication (N3 + R2 / N6)

| | |
|--|--|
| **Unblocks** | Scientific scorecard scores; usefulness ratings; frozen held-out gold; N6 pilot go; scientific acceptance path (still ≠ production readiness alone) |
| **Human action** | Founder / programme lead recruits Annotator A, Annotator B, Adjudicator into empty roster slots; SMEs label calibration (20–50) on gut–immune–T2D programme with `annotatorId` / rationale; adjudicate disagreements; operator sets `frozen_human_labels` + freeze date only after adjudication. R2 path: dual SME labels on 50 draft cases + adjudication before freeze / baseline metrics ([`R2_GOLD_EVALUATION_SUITE_CHECKLIST.md`](./R2_GOLD_EVALUATION_SUITE_CHECKLIST.md)). Clear #2 before minting scored pilot passages |
| **Eng prepared** | N3 freeze-prep + 24 unlabelled items · empty `sme-label-worksheet.v1.json` · anonymous SME roster slots (`smeSlotsFilled=0`) · R2 empty SME A/B + adjudication worksheets · PR 8 independent eval scientific slots empty · [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](./N3_CALIBRATION_FREEZE_CHECKLIST.md) · `bun run n3:*` / `r2:*` / `eval:independent:*` |
| **Eng must NOT** | Invent SME identities, `expectedOutcome`, adjudications, usefulness scores, or scientificAccuracy; treat draft bank as gold; freeze held-out without rights-cleared packets + labels; claim `scientificAcceptance=CLEARED` from placeholders |
| **Verify after humans** | `bun run n3:freeze-prep` · `bun run n3:check` · `bun run r2:check` · `bun run gold:check` · `bun run eval:independent:check` · `bun run human-queue:check` — expect slots/labels only after real SME work (`smeGoldFilled` / freeze flags stay false until then) |

**Status:** **PARKED** · `labelledRows=0` · `smeSlotsFilled=0` · R2 `smeGoldFilled=false`

### #5 — Live authenticated Ask→Retrieve→…→Export (+ staging two-account)

| | |
|--|--|
| **Unblocks** | Timestamped live integration success; `opsAcceptance` off BLOCKED; `researcherJourneyCompleteClaimed` path on real Auth APIs (staging only) |
| **Human action** | Ops / founder: align Vercel Preview to red-wave staging (`hsi-staging-branch` / `ep-hsi-staging-…`); create **two** verified neon_auth principals (researcher + independent reviewer); grant staging roles; flip `HSI_RESEARCH_WRITES_ENABLED` **only** on staging; run live two-account journey (create → submit → independent decision + denials); private ops receipt (no secrets/PHI). Optional gated eval: `HSI_LIVE_INTEGRATION_EVAL=1 bun run eval:independent:live` (honest fail if outcomes missing — never silent success). Auth A www user-confirm ≠ full #5 |
| **Eng prepared** | Write-gate + `neonGuard` · staging auth-prep packet · empty `ops-acceptance-worksheet.v1.json` · R3 API-mapped six-stage journey + UI probes · PR 8 live hooks default `skipped_gate` · [`STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md`](./STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md) · [`R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md`](./R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md) |
| **Eng must NOT** | Invent neon_auth principals/grants; enable production `writesEnabled`; claim journey complete from eng probes; fake live eval success when gated off; autumn-snow for HSI |
| **Verify after humans** | Offline: `bun run staging:auth-prep:check` · `bun run r3:check` · `bun run human-queue:check`. Live: health shows staging `writesEnabled=true` and production still `false`; private ops worksheet stamped; `researcherJourneyCompleteClaimed` only after real Ask→export session |

**Status:** **PARKED** · `opsAcceptance=BLOCKED` · `researcherJourneyCompleteClaimed=false` · `liveSuccessClaimed=false`

## Queue (all ENG CLEARED / HUMAN BLOCKED)

| # | Residual | Neon | Metrics (must stay until humans act) | Checklist | Empty worksheet |
|---|----------|------|--------------------------------------|-----------|-----------------|
| 2 | N1 rights attestation | red-wave | `humanCleared=0` · `passageImported=0` · R1 packets stay `rights_pending_quarantine` ([`R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md`](./R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md)) | **Active:** [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md) · scaffold: [`N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md`](./N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md) | `research/domain-graph/n1/attestation-worksheet.v1.json` |
| 3 | ISI cite HITL | autumn-snow | `supports=0` · `publicCiteApproved=0` | immunecity `GATE_C_CURATOR_PATH.md` + `CITE_HITL_CURATOR_RUNBOOK.md` | immunecity `cite-hitl-residual-worksheet.json` |
| 4 | N3 SME labels (+ R2 gold worksheets empty) | red-wave | `labelledRows=0` · `smeSlotsFilled=0` · R2 `smeGoldFilled=false` / `independentlyLabelledCases=0` ([`R2_GOLD_EVALUATION_SUITE_CHECKLIST.md`](./R2_GOLD_EVALUATION_SUITE_CHECKLIST.md)) | [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](./N3_CALIBRATION_FREEZE_CHECKLIST.md) | `research/domain-graph/n3/sme-label-worksheet.v1.json` · `evaluation/gold-evaluation-suite/r2/worksheets/` |
| 5 | Staging two-account (+ R3 live Ask→export) | red-wave | `opsAcceptance=BLOCKED` · Auth A www confirmed ≠ full #5 · R3 `researcherJourneyCompleteClaimed=false` ([`R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md`](./R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md)) | [`STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md`](./STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md) | `operations/staging/ops-acceptance-worksheet.v1.json` |
| 8 | Founder MoU | none | `mouSlotsFilled=0` · `legalBinding=false` · `lockedPilot=false` | [`PARTNER_LOCK_CHECKLIST.md`](./PARTNER_LOCK_CHECKLIST.md) | `operations/partner/mou-attestation-worksheet.v1.json` |

## STOP list (binding)

1. Do **not** invent MoU text / `legalBinding=true` / signed partners  
2. Do **not** invent `claim_support` or Approve on cites  
3. Do **not** invent SME scientific labels / usefulness scores  
4. Do **not** invent licence clearance or passage imports  
5. Do **not** Gate C auto-approve / live CDS-PHI  
6. Do **not** set production `writesEnabled=true`  

## Verify

```sh
bun run human-queue:prep
bun run human-queue:check
bun --no-env-file test test/humanQueueResidualPrep.test.ts
# Cite residual (product repo):
cd ../immunecity && bun run hsi:cite-hitl:check
```

Expected: `humanAcceptance=BLOCKED`, all residual counters at zero / BLOCKED as above.
