# Audit R1 — Biomedical evidence source packets (eng scaffold)

**Date:** 2026-11-08  
**Source:** *HSI End-to-End Architecture and Roadmap* phase **R1** (Biomedical evidence datasets)  
**HSI substrate Neon:** red-wave only  
**Honesty:** no invented `licenceEvidenceUri` · `humanCleared=0` · `passageImported=0` · no SME gold fill · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · **do not claim R1 science CLEARED**

## Pre-check: user constraint

Human queue residuals stay **parked** for this phase — especially **#2 N1 rights**, plus #3 cite HITL, #4 SMEs, #5 staging, #8 MoU. R1 delivers eng-safe **reviewable source-packet** inventory/schema/harness only.

## Verdict

| Plane | State |
|-------|--------|
| Engineering source-packet contract + inventory + harness | **ENG CLEARED** |
| Rights / licence attestation / passage import | **BLOCKED** (`humanCleared=0`, `passageImported=0`) |
| Ontology verification + context metadata (SME) | **PENDING_HUMAN** (empty slots; gold = R2) |
| Scientific acceptance / gold binding | **BLOCKED** / **NO_GO** for R2 fill |
| Invented clearances / MoU / Gate C / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** rights clearance, passage import authority, SME gold, Gate C clearance, or production partner lock.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Packet types + fail-closed parse | `src/evidence/r1BiomedicalSourcePackets.ts` |
| On-disk inventory | `research/domain-graph/r1/source-packets.v1.json` |
| Status pin | `research/domain-graph/r1/STATUS.json` |
| Operator checklist | [`R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md`](./R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md) |
| N1 rights binding | `research/domain-graph/n1/rights-inventory.v1.json` (unchanged counters) |
| Harness | `bun run r1:prepare` · `bun run r1:check` |
| Tests | `test/r1BiomedicalSourcePackets.test.ts` |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 7 / 7 |
| Human checks PENDING / NO_GO / BLOCKED | 6 / 6 |
| Packet slots reserved | **12** |
| Packet slots rights-cleared | **0** |
| `humanCleared` | **0** |
| `passageImported` | **0** |
| Ontology / context slots filled | **0** / **0** |
| `smeGoldFilled` | **false** |
| `scientificAcceptance` | **BLOCKED** |
| `rightsAcceptance` | **BLOCKED** |

## Dataset lifecycle (§2) — scaffolding only

Documented stages through controlled research pilot. **Current stage:** `ingestion_rights_qc`. SME gold / held-out freeze remain **false** (Roadmap **R2**).

## Explicit non-goals

- Fixing human #2 N1 rights or inventing `licenceEvidenceUri`
- Importing passage text
- Filling SME gold or freezing held-out splits
- Gate C / cite auto-approve
- Live CDS / PHI
- Invented MoU / `legalBinding=true`
- Pointing HSI at autumn-snow

## Next

1. **Parked:** human #2 N1 rights attestation (still required before any non-quarantine packet).  
2. **R2** eng deepen landed (`bun run r2:check`); SME gold fill still after rights + SME adjudication.  
3. Do **not** merge scientific acceptance from this eng scaffold.

## Verify

```sh
bun run r1:prepare
bun run r1:check
bun run n1:check
bun --no-env-file test test/r1BiomedicalSourcePackets.test.ts
```
