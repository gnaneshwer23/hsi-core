# HUMAN QUEUE residuals (post Audit #1–#10)

**Date:** 2026-11-08  
**Verdict:** Ranked eng track **COMPLETE THROUGH #10**. Remaining production-readiness progress is **HUMAN QUEUE only**.

**Pack:** `operations/human-queue/human-queue.v1.json` · `bun run human-queue:check`  
**Receipt:** [`AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md`](./AUDIT_HUMAN_QUEUE_RESIDUALS_2026-11-08.md)  
**Canvas:** workspace `canvases/hsi-production-readiness-audit.canvas.tsx` § HUMAN QUEUE

This document consolidates eng-safe residual deepen work. It does **not** clear science, HITL, opsAcceptance, or founder MoU.

## Queue (all ENG CLEARED / HUMAN BLOCKED)

| # | Residual | Neon | Metrics (must stay until humans act) | Checklist | Empty worksheet |
|---|----------|------|--------------------------------------|-----------|-----------------|
| 2 | N1 rights attestation | red-wave | `humanCleared=0` · `passageImported=0` · R1 packets stay `rights_pending_quarantine` ([`R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md`](./R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md)) | [`N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md`](./N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md) | `research/domain-graph/n1/attestation-worksheet.v1.json` |
| 3 | ISI cite HITL | autumn-snow | `supports=0` · `publicCiteApproved=0` | immunecity `GATE_C_CURATOR_PATH.md` + `CITE_HITL_CURATOR_RUNBOOK.md` | immunecity `cite-hitl-residual-worksheet.json` |
| 4 | N3 SME labels (+ R2 gold worksheets empty) | red-wave | `labelledRows=0` · `smeSlotsFilled=0` · R2 `smeGoldFilled=false` / `independentlyLabelledCases=0` ([`R2_GOLD_EVALUATION_SUITE_CHECKLIST.md`](./R2_GOLD_EVALUATION_SUITE_CHECKLIST.md)) | [`N3_CALIBRATION_FREEZE_CHECKLIST.md`](./N3_CALIBRATION_FREEZE_CHECKLIST.md) | `research/domain-graph/n3/sme-label-worksheet.v1.json` · `evaluation/gold-evaluation-suite/r2/worksheets/` |
| 5 | Staging two-account | red-wave | `opsAcceptance=BLOCKED` · Auth A www confirmed ≠ full #5 | [`STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md`](./STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md) | `operations/staging/ops-acceptance-worksheet.v1.json` |
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
