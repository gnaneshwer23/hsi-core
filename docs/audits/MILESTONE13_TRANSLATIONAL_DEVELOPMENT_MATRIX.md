# Milestone 13 — Translational Development Strategy, Clinical Trial Design & Biomarker-Guided Research Intelligence

**Brief:** HSI Milestone 13 — connect M1–M12 into governed translational development research decision support (programme → translational evidence assessment → biomarker development records → clinical trial concepts) without autonomous trial authorisation, Gate C auto-approve, MoU invention, PHI/CDS, patient eligibility from restricted records, fabricated trial outcomes, or invented sample sizes.  
**Status:** Phase 0 gap audit + PR1 (Translational Development Contracts) — **not** translational readiness complete, **not** trial design complete, **not** clinical/regulatory authorisation, **not** M13 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `7485bd4cc44d25cf499a4afe9165a91468851add`  
**Tip commit:** `7485bd4 Add M12 Phase 0 matrix and therapeutic discovery data contracts (#107)` (M10 through governed compute on main; SEO #106/#108 also on main)  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md) — M12 Phase 0 + PR1 **merged** ([#107](https://github.com/gnaneshwer23/hsi-core/pull/107) → `7485bd4`); M13 PR1 uses compatible ID refs (`id-pattern-compatible-107-merged`)
- [`MILESTONES_M1_M13_STATUS_ROLLUP.md`](./MILESTONES_M1_M13_STATUS_ROLLUP.md) — concise M1–M13 rollup
- [`MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md`](./MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md) — M10 PR1–PR4 on `main` (#101 / #105 / #103 / #104)
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md)
- [`MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md`](./MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md)
- [`MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md`](./MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md)
- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md)
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md)
- [`../engineering/N5_COHORT_TRIAL_CRITERIA_STATUS.md`](../engineering/N5_COHORT_TRIAL_CRITERIA_STATUS.md)
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of PR1:** Translational readiness engine (PR2), biomarker context-of-use intelligence deepen (PR3), population heterogeneity engine (PR4), CT.gov live trial-evidence integration deepen (PR5), trial concept / statistical design assistant (PR6), feasibility / development risk (PR7), strategy decision engine (PR8), workbench UI (PR9), SSc end-to-end scientific validation (PR10), sample-size inventions, trial execution, Gate C auto-approve, MoU invention, PHI/CDS, Neon migrations.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M13 requirement |
| `Blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: research decision support only · **not** autonomous clinical trial authorisation · a trial concept is **not** an approved protocol · exploratory biomarker ≠ qualified / clinically validated biomarker · workflow readiness states ≠ regulatory categories · no Gate C auto-approve · no invented MoU · no live CDS/PHI · no patient eligibility from restricted records · no fabricated trial outcomes · no invented sample sizes · fixtures ≠ live · CI ≠ scientific validity · agents draft; researchers / clinicians / statisticians / ethics review · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M13)

| Principle | Implication for translational development |
|-----------|-------------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Development contracts stay HSI-owned; CT.gov / biomarker / trial adapters are optional, failure-isolated connections — not a monolith or a new standalone product |
| **ARCH-002** Living Health KG ownership | Trial concepts, biomarker records, and readiness assessments never auto-promote to curated KG; review candidates stay non-graph-promotable until human review |
| **ARCH-003** Authenticated research API | Trusted session / grants only for approvals; never trust client-claimed “approved protocol”, fabricated outcomes, or patient eligibility from restricted records |

---

## Phase 0 — M1–M12 dependency status (post-#106 / M10 complete on main)

| Milestone | On audited `main` | Status | Translational-development readiness |
|-----------|-------------------|--------|-------------------------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`); living-evidence expand; CT.gov lookup | `Partial` · live journey `Blocked` (#5) · passages `Blocked` (#2) | Public refs OK for programme evidence links; no fabricated trial results |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `Partial` | Opposing-evidence inputs for later readiness (PR2) |
| **M3** Hypothesis / experiment | Registry contracts (#91); N7 experiment ledger eng | `Partial` · real observation `Blocked` | Therapeutic hypothesis id links |
| **M4** Translational / failure | Contracts (#93) + failure taxonomy (#94) | `Partial` | **Primary reuse** — failure / translational programme refs; deepen in PR7/PR9 |
| **M5** Precision translational | Precision contracts (#95); HCA/GEO `not_connected` | `Partial` | Biomarker layer honesty; performance never invented |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96); planner/router `Missing` | `Partial` | Optional investigation id scope |
| **M7** Scientific evaluation | Phase 0 + benchmark registry (#97); scored evaluators `Missing` | `Partial` · science `Blocked` | Orthogonal; CI ≠ scientific validity |
| **M8** Living / incremental monitoring | Phase 0 + incremental monitoring (#98); change-detection `Missing` | `Partial` | Monitoring ≠ trial execution |
| **M9** Collaboration / federation | Org/tenant (#99) + collaborative contracts (#100) | `Partial` · federation `Missing` · partnerships `Blocked` | Optional orgId; **federation not live** |
| **M10** Experimental discovery | Lifecycle (#101) · design (#105) · protocol (#103) · compute (#104) | `Partial` | Downstream experiment bind later — not PR1 trial execution |
| **M11** Multiscale simulation | No M11 PR opened | `Missing` | Do not claim simulation→clinical readiness |
| **M12** Therapeutic discovery | Phase 0 + data contracts | `Partial` (PR1 on `main` via [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) → `7485bd4`) · later PRs `Missing` | Compatible programme/target/intervention/assessment ID refs; typed import optional |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live E2E translational validation and scored gold |

**Verdict:** Eng substrate is sufficient for M13 **PR1 Translational Development Contracts** (development programme / translational evidence assessment / clinical trial concept / biomarker development record + thin memory store + honesty gates). Do **not** mark translational readiness, trial design intelligence, or clinical authorisation complete from CI green. M1–M10 remain **Partial** (eng) / **not scientifically validated**; M11 `Skipped`/`Missing`; M12 PR1 on `main`.

---

## Substrate inspection (file-level)

| Area | Files | Working status | M13 relevance |
|------|-------|----------------|---------------|
| Therapeutic discovery (M12) | `therapeuticDiscoveryDataContracts.ts` | `Partial` (PR1 on main) | Compatible `hsi-tx-prog-*` / `hsi-tx-tgt-*` / `hsi-tx-int-*` / `hsi-tx-assess-*` ID refs; typed import optional |
| Translational contracts (M4) | `translationalEvidenceContracts.ts` · failure taxonomy | `Partial` | Programme / failure context refs |
| Precision / biomarker (M5) | `precisionEvidenceContracts.ts` | `Partial` · HCA/GEO `not_connected` | Biomarker honesty; no invented performance |
| ClinicalTrials.gov | `clinicalTrialsGovLookup.ts` · `translationalEvidenceAttach.ts` | `Partial` | Registry locators later (PR5); not efficacy |
| Trial criteria (N5) | `cohortTrialCriteriaResearch.ts` · `trialsCriteriaMvp.ts` | `Partial` / MVP | Eligibility *considerations* only — not patient eligibility |
| Clinical scaffold | `clinicalResearchScaffold.ts` · synthetic timeline/FHIR notes | `Partial` · CDS refuse gate | Preserve refuse live CDS/PHI |
| Hypothesis registry (M3) | `hypothesisRegistry.ts` | `Implemented but unverified` (science) | Therapeutic hypothesis links |
| Investigation (M6) | `investigationOrchestrationContracts.ts` | `Partial` | Optional investigation scope |
| Experimental lifecycle (M10) | lifecycle / design / protocol / governed compute | `Partial` | Later bind — not trial execution in PR1 |
| Evidence graph / provenance | evidence ledger · claim/domain graph · dynamic persistence `018` | `Partial` | Source-linked refs; non-graph-promotable |
| Scientific review | reviewer authority · interrogative / ISI review stores | `Partial` | Human review gates |
| Benchmarks (M7) | `scientificBenchmarkRegistry.ts` | `Partial` | Orthogonal eval |
| Research Decision Workbench | `researchWorkbench.ts` · connected workbench · site | `Partial` | **Out of PR1 UI** (PR9) |
| Multiscale / M11 | — | `Missing` | No simulation validation claims |
| Neon | red-wave; existing grants / stores | `Partial` · staging `Blocked` (#5) | Contracts-first; **no new migration in PR1** |

**Persistence decision (PR1):** Prefer **validated contracts + thin in-memory store** projecting onto existing hypothesis / investigation / org / M12 therapeutic IDs (when present). **No new Neon migration** in PR1. A backwards-compatible translational-development table migration is deferred until a trusted write path needs durable rows on red-wave.

---

## Milestone 13 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + dependency + architecture plan | This document | — | `Verified operational` (audit) | Keep updated as PRs land | this file |
| **1** Translational development contracts | M3/M4/M5/M6/M9/M10 ids · M12 IDs on main · CT.gov/N5 stubs | `Missing` → **PR1 in-flight** (this branch) — focused tests + evaluation pack | Development programme · translational evidence assessment · clinical trial concept · biomarker development record | `src/translationalDevelopmentContracts.ts` · `test/translationalDevelopmentContracts.test.ts` · `scripts/translational-development-contracts.ts` · `evaluation/translational-development/` |
| **2** Translational readiness assessment | M4 failure · M10 · M12 · PR1 programme | `Missing` | Workflow readiness states (not regulatory) | future PR2 |
| **3** Biomarker context-of-use intelligence | M5 precision · PR1 biomarker record | `Partial` substrate | Predictive rule + validation status deepen | later PR3 |
| **4** Population / disease heterogeneity | M5 phenotype · subgroup | `Partial` | Exploratory ≠ validated clinical populations | later PR4 |
| **5** Clinical trial evidence integration | CT.gov · N5 criteria | `Partial` | Registry accuracy without efficacy inference | later PR5 |
| **6** Trial concept + statistical design | PR1 trial concept | `Missing` as assistant | No invented sample sizes; concept ≠ protocol | later PR6 |
| **7** Feasibility + development risk | M4 failure taxonomy | `Partial` hooks | No invented recruitment rates | later PR7 |
| **8** Development strategy decision engine | PR1–PR7 | `Missing` | Opaque AI rankings forbidden as sole basis | later PR8 |
| **9** Research workbench integration | Existing workbench | `Partial` | Thin surfacing — not a new product | later PR9 |
| **10** Scientific validation (SSc vertical) | Fixtures + human queue | `Fixture-only` · `Blocked` | Checklist only — **no invented live success** | later PR10 |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Development programme** | Scoped translational development research programme | Regulatory authorisation or treatment plan |
| **Translational evidence assessment** | Honest assessment of target / human / preclinical / pharmacology / engagement / safety / model relevance with uncertainties | Clinical readiness claim or efficacy proof |
| **Clinical trial concept** | Research design concept under review | Approved protocol, recruitment, or trial execution |
| **Biomarker development record** | Biomarker identity + context of use + validation *status* | Qualified / clinically validated patient-selection test without evidence |
| **Workflow readiness state** (PR2+) | HSI research workflow state | Regulatory approval category |

---

## PR1 deliverable (Translational Development Contracts)

**Translational Development Contracts**

- Versioned **development programme** contracts with closed lifecycle / development-stage enums (research workflow stages, not regulatory categories); optional links to M3 hypothesis ids, M6 investigation id, M9 org id, M4 translational programme contract id, and M12 therapeutic programme / target / intervention / assessment IDs (compatible patterns; import after #107 merges).  
- **Translational evidence assessment** contracts covering target validity, human biological relevance, preclinical / pharmacology / engagement / safety / model relevance ordinals, key uncertainties, missing studies, and human-only review transitions.  
- **Clinical trial concept** contracts with research question, intervention, population, comparator, objectives, candidate endpoints, biomarker strategy, eligibility *considerations*, statistical / feasibility *assumptions* (declared, never invented sample sizes), ethics/regulatory considerations; explicit `isNotApprovedProtocol: true`.  
- **Biomarker development record** contracts with biological identity, specimen/assay, context of use, analytical / clinical validity / utility status ordinals that **refuse equating exploratory with qualified or clinically validated**; confounders + limitations required.  
- Honesty: research decision support only; not autonomous trial authorisation; no fabricated outcomes; no PHI/CDS; no Gate C / MoU; agents draft / humans review; Neon red-wave only; migration deferred; non-graph-promotable.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** Readiness engine, workbench UI, sample-size inventions, trial execution, Neon migrations.

---

## Integration plan (post-PR1)

1. **PR2 — Translational Readiness Assessment:** workflow readiness states from assembled supporting/opposing evidence + gaps — never regulatory readiness.  
2. **PR3 — Biomarker Context-of-Use Intelligence:** deepen predictive rule and validation profiles on PR1 biomarker records.  
3. **PR4 — Population and Disease Heterogeneity:** phenotype / subgroup honesty without individual eligibility.  
4. **PR5 — Clinical Trial Evidence Integration:** CT.gov / publication provenance without efficacy inference from completion status.  
5. **PR6 — Trial Concept and Statistical Design:** comparative concepts + transparent assumptions; no invented effects/n.  
6. **PR7–PR10:** Feasibility/risk → strategy engine → workbench → SSc scientific validation (human-gated).

---

## Human blockers (unchanged)

| Item | Status | Blocks for M13 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded translational entailment |
| #4 SME gold | PARKED | Scored translational usefulness |
| #5 Live journey | PARKED | Real programme→assessment→concept E2E |
| Clinical / statistical / ethics review principals | Not auto-granted | Trial concept operational use |
| M12 #107 merge | **Merged** → `7485bd4` | Therapeutic discovery contracts on main; ID patterns compatible |
| M11 biological model registry | Missing / Skipped | Simulation-backed clinical readiness claims |

---

## Anti-patterns (binding)

- Equating exploratory biomarker with qualified or clinically validated biomarker.  
- Treating workflow readiness states as regulatory approval categories.  
- Presenting trial concepts as approved protocols or initiating studies.  
- Inventing sample sizes, treatment effects, recruitment rates, or unpublished trial results.  
- Inferring patient eligibility from population-level evidence or restricted records.  
- Inferring efficacy from completed CT.gov status.  
- Gate C auto-approve, invented MoU, PHI/CDS, autumn-snow Neon.  
- Claiming M12 therapeutic discovery complete beyond PR1 contracts.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1 |
|------|--------|--------------|
| Therapeutic IDs | Compatible M12 ID patterns on main; optional typed import of `therapeuticDiscoveryDataContracts` | Inventing alternate ID schemes |
| Translational / failure | M4 contracts + taxonomy | Invented failure facts |
| Biomarker honesty | M5 precision contracts | Invented performance metrics |
| Trial registry | CT.gov lookup / N5 criteria (later) | Efficacy inference / live recruitment |
| Hypothesis / investigation / org | M3 / M6 / M9 ids | Duplicate ledgers |
| Persistence | In-memory store + projection lines | New Neon migration |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| (this delivery) | M13 PR1 Translational Development Contracts + M1–M13 rollup | `eng/m13-pr1-and-milestones-rollup` | **PR1 in-flight** — merge when CI green |
| [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) | M12 PR1 Therapeutic Discovery Data Contracts | merged → `7485bd4` | Dependency satisfied |
| [#106](https://github.com/gnaneshwer23/hsi-core/pull/106) / [#108](https://github.com/gnaneshwer23/hsi-core/pull/108) | OpenSEO map + .tech Google discovery | merged | Orthogonal; GSC remains manual |
| [#104](https://github.com/gnaneshwer23/hsi-core/pull/104) | M10 PR4 Governed Computational Execution | merged → `ebabd52` | Substrate on main |
| [#105](https://github.com/gnaneshwer23/hsi-core/pull/105) / [#103](https://github.com/gnaneshwer23/hsi-core/pull/103) / [#101](https://github.com/gnaneshwer23/hsi-core/pull/101) | M10 PR2 / PR3 / PR1 | merged | Orthogonal substrate |

**Suggested next:** PR2 Translational Readiness Assessment.
