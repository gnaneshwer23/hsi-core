# R1 — Biomedical evidence source packets (eng scaffold)

**Roadmap phase R1** from *HSI End-to-End Architecture and Roadmap*: licensed ingestion, provenance, ontology, context metadata — exit: **reviewable source packets with version/rights**.

**Verdict:** Engineering scaffold **CLEARED** · Scientific acceptance **BLOCKED** · Rights acceptance **BLOCKED**.

Honesty: provider OA/CC ≠ corpus reuse · `humanCleared=0` · `passageImported=0` · `licenceEvidenceUri=null` · empty ontology/context ≠ verified/SME gold · no Gate C auto-approve · no MoU invent · no live CDS/PHI · HSI Neon = red-wave only · **human #2 N1 rights explicitly parked**.

## Binding pointers

| Item | Value |
|------|--------|
| N1 rights inventory | `research/domain-graph/n1/rights-inventory.v1.json` · `bun run n1:check` |
| N1 attestation residual (#2) | [`N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md`](./N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md) |
| R1 packet inventory | `research/domain-graph/r1/source-packets.v1.json` |
| Harness | `bun run r1:prepare` · `bun run r1:check` |
| Gold Suite (R2; eng deepen, not filled) | [`R2_GOLD_EVALUATION_SUITE_CHECKLIST.md`](./R2_GOLD_EVALUATION_SUITE_CHECKLIST.md) · `bun run r2:check` |
| Dataset lifecycle | Roadmap §2 — scaffold documented; SME gold = R2 |

## A. What engineering already automated

- [x] Versioned source-packet contract (`hsi-r1-biomedical-source-packets-1`)
- [x] Twelve reviewable packet slots bound to N1 queue ids / DOI provenance
- [x] Pins `n1ReceiptHash` + `n1RightsInventoryHash`
- [x] Rights-pending quarantine honesty (`rights_pending_quarantine`)
- [x] Empty ontology + species/tissue/context slots (no invented SME gold)
- [x] Roadmap §2 lifecycle stages listed with `smeGoldFilled=false`
- [x] Gold-eval binding slots reserved unbound (`versioned_licensed_packets`)
- [x] `bun run r1:prepare` / `r1:check` + unit tests

## B. Humans must supply (parked — not inventable by code)

### B1 — #2 N1 rights (PARKED for this phase)

- [ ] Per-source `licenceEvidenceUri` + permitted uses on attestation worksheet
- [ ] Only then flip rights off quarantine / allow passage import
- [ ] Keep `humanCleared=0` / `passageImported=0` until real attestation

### B2 — Ontology / context (feeds R2; do not invent)

- [ ] Ontology verification IDs for packet entities
- [ ] Species / tissue / study context via SME path (#4)
- [ ] R2: adjudicated gold binding of **rights-cleared** packet hashes

### B3 — Explicit refusals

- [ ] Do **not** invent `licenceEvidenceUri` or passage text from chat
- [ ] Do **not** claim scientificAcceptance CLEARED from this scaffold
- [ ] Do **not** fill SME gold / freeze held-out splits in R1
- [ ] Do **not** Gate C auto-approve, invent MoU, or use autumn-snow for HSI

## C. Residual parked (user constraint)

| Residual | Status |
|----------|--------|
| #2 N1 rights | **PARKED** — eng wires inventory only |
| #3 cite HITL | Parked |
| #4 SMEs | Parked (R2) |
| #5 staging | Parked |
| #8 MoU | Parked — never invent |

## Verify (offline)

```sh
bun run r1:prepare
bun run r1:check
bun run n1:check
bun --no-env-file test test/r1BiomedicalSourcePackets.test.ts
```

Expected: `engineeringScaffold=CLEARED`, `scientificAcceptance=BLOCKED`, `rightsAcceptance=BLOCKED`, `humanCleared=0`, `passageImported=0`.
