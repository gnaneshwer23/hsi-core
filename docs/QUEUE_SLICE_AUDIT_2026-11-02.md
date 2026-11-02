# Continuous queue audit — 2026-11-02

## SHIPPED this session

| # | Slice | Repo | How to try |
|---|--------|------|------------|
| 1 | **M1** Scientific brief (audited) | immune-city | `/ask` → mechanism Q → **Generate investigation brief** |
| 2 | **Cap 6** Human evidence | immune-city | Same brief → Cap 6 section |
| 3 | **Cap 10** Contradictions | immune-city | Same brief → Cap 10 section |
| 4 | **Cap 11** Research gaps | immune-city | Same brief → Cap 11 + search-scope note |
| 5 | **Public HSI site honesty** | hsi-core `site/` | `/products`, `/status`; nav demotes engineering |
| 6 | **Clinical synthetic timeline** | hsi-core | `buildClinicalTimelineView("syn-t2d-multi-provider-01")` |
| 7 | **Trials MVP** (5 states) | hsi-core | `assessTrialCriteria({ trialId, patient })` — never confirmed eligible |
| 8 | **Aksh↔HSI gateway** | hsi-core | `decideGatewayRequest` / `gatewayContract()` |

## Tests

```bash
# ISI
cd ~/Desktop/immune-city
bun test src/test/m1-investigation-brief.test.ts \
  src/test/cap6-human-evidence.test.ts \
  src/test/cap10-contradictions.test.ts \
  src/test/cap11-research-gaps.test.ts

# HSI
cd ~/Projects/hsi-core
bun test test/publicSiteHonesty.test.ts \
  test/clinicalSyntheticTimeline.test.ts \
  test/trialsCriteriaMvp.test.ts \
  test/akshHsiGateway.test.ts
```

## Constraints respected

- Neon isolation; no MoU invention; no kg.json replace; no live EMIS
- No git commit/push
- No next-forge bootstrap
- Reused Ask / Gate C / Aksh HITL + CDS-PHI boundary

## SHIPPED after queue 1–8 (site UI)

| Slice | Repo | How to try |
|--------|------|------------|
| Clinical synthetic timeline UI | hsi-core `site/` | `/clinical-timeline` (from `/status#demos`) |
| Trials five-state criteria UI | hsi-core `site/` | `/trials-criteria` — `confirmedEligible=false` |

```bash
bun test test/publicSiteHonesty.test.ts \
  test/clinicalSyntheticTimeline.test.ts \
  test/trialsCriteriaMvp.test.ts
bun run site:build
```

## ALSO STARTED

| Slice | Repo | Status |
|--------|------|--------|
| M1 G-Ask/G-Mech golden eval v0 | immune-city | Automated baselines shipped; SME review still `awaiting_sme` |

```bash
cd ~/Desktop/immune-city && bun test src/test/m1-golden-eval.test.ts
```

## ALSO SHIPPED (Cap 10 depth)

| Slice | Repo | How to try |
|--------|------|------------|
| **First-class CONTRADICTS** | immune-city | `/ask` → IL-17A/IBD or anti-TNF Crohn → brief Cap 10 Side A/B |

```bash
cd ~/Desktop/immune-city && bun test src/test/cap10-contradictions.test.ts
```

Gold pairs: `contradictionGoldPairs.ts` (draft Finding CONTRADICTS Finding; `TO_BE_CURATED`; majorityVote=false).

**Confirmed green 2026-11-02:** Cap 10 9/9 + M1 4/4 + Phase B 15/15 (28/28).

## ALSO SHIPPED (Cap 11 depth)

| Slice | Repo | How to try |
|--------|------|------------|
| **Cap 11 register UX depth** (`cap11-2`) | immune-city | `/ask` → brief → Cap 11 priority bands, Cap 10 cross-links, next steps, Atlas links |

```bash
cd ~/Desktop/immune-city && bun test src/test/cap11-research-gaps.test.ts
```

## ALSO SHIPPED (gateway UI)

| Slice | Repo | How to try |
|--------|------|------------|
| **Aksh↔HSI gateway stub UI** | hsi-core `site/` | `/gateway` (from `/status#demos`) |

```bash
cd ~/Projects/hsi-core && bun test test/publicSiteHonesty.test.ts test/akshHsiGateway.test.ts
```

## ALSO SHIPPED (demo depth — gateway + clinical + trials)

| Slice | Repo | How to try |
|--------|------|------------|
| **Gateway polish** | hsi-core `site/` | `/gateway` — allow/deny grid, PHI→research callout, syntheticOnly / no live PHI labels, `/status#demos` deep-link |
| **Clinical Cap 9 panel** | hsi-core `site/` | `/clinical-timeline` — fixture switcher, missing-info cards (kind chips), provenance `sourceSystem` chips |
| **Trials legend depth** | hsi-core `site/` | `/trials-criteria` — 5-state legend, never-confirmed-eligible callout, provenance chips, missing-attr panel |

```bash
cd ~/Projects/hsi-core
bun test test/publicSiteHonesty.test.ts \
  test/clinicalSyntheticTimeline.test.ts \
  test/trialsCriteriaMvp.test.ts \
  test/akshHsiGateway.test.ts
bun run site:build
```

**Confirmed green 2026-11-02:** Cap 10 9/9 + Cap 11 (incl. cap11-2) 5/5; HSI demo honesty suite 14/14 + `site:build`.

## ALSO SHIPPED (multi-trial + second clinical + G-Ask expand)

| Slice | Repo | How to try |
|--------|------|------------|
| **Multi-trial stub picker** | hsi-core `site/` | `/trials-criteria` — DEMO-NCT-SYNTH ↔ DEMO-NCT-RA-TNF; five states; `confirmedEligible=false` |
| **Clinical walkthrough fixture #3** | hsi-core | `/clinical-timeline` — `syn-asthma-multi-provider-03` (+ existing T2D + immuno); Cap 9 incl. `not_applicable` |
| **G-Ask/G-Mech v0.1 expand** | immune-city | `m1GoldenEval` — 8 cases; still `awaiting_sme` / `targetsConfirmedBy=null` |

```bash
cd ~/Projects/hsi-core
bun test test/publicSiteHonesty.test.ts \
  test/clinicalSyntheticTimeline.test.ts \
  test/trialsCriteriaMvp.test.ts \
  test/akshHsiGateway.test.ts
bun run site:build

cd ~/Desktop/immune-city
bun test src/test/m1-golden-eval.test.ts
```

## NEXT TO BUILD

### Engineering (remaining substrate)

Substrate demos for Clinical / Trials / Gateway + automated G-Ask/G-Mech baselines are in place. No further engineering slices are queued for these Cap 8/9 demo paths until human gates land. Optional later: FHIR mapping notes for synthetic fixtures (still syntheticOnly; no live EMIS).

### Human gates only

1. SME review pass on G-Ask/G-Mech v0.1 (set `targetsConfirmedBy` only with written sign-off) — founder interim may already exist; named external still open  
2. Ask-edu-gold-v0 founder interim or named SME (`awaiting_sme` until human edits)  
3. **Gate C cite path** — human Check → `claim_support` → Approve/Reject on ISI autumn-snow (`immune-city/docs/GATE_C_CURATOR_PATH.md`; dry-run `bun run hsi:curator-status`); no invent Approve  
4. Real partner lock (replace hypothetical fixture) when written confirm arrives — no invented MoU  
5. Partner corpus clearance / Gate C partner session when named partner lands  

