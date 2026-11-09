# Milestone 15 — Integrated Human Disease Intelligence, Digital Patient Models & Precision Research Simulation

**Brief:** HSI Milestone 15 — governed disease-research intelligence contracts for disease context, observed vs inferred disease state, access-scoped digital patient **research** models, and research-only simulation scenarios — composing M14 RWE / longitudinal / (optional) cohort ids — **without** a separate digital-twin product, autonomous diagnosis/prescribing/treatment, unrestricted identifiable patients in the scientific KG, PHI/CDS, Gate C auto-approve, MoU invention, or claiming a live multiscale engine (M11 skipped).  
**Status:** Phase 0 gap audit + PR1 (Integrated Disease Intelligence Contracts) — **not** disease intelligence complete, **not** personalised treatment simulation authorised, **not** live digital patient validation, **not** M15 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `02cf969ccc3ec7545637d53a010904061c0f7abd` (post-#114 + #115 tip)  
**Tip commit:** `02cf969 Add M14 reproducible cohort builder contracts (#115)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** PR1 stacks on merged M14 PR1–PR4 ([#111](https://github.com/gnaneshwer23/hsi-core/pull/111), [#113](https://github.com/gnaneshwer23/hsi-core/pull/113), [#114](https://github.com/gnaneshwer23/hsi-core/pull/114), [#115](https://github.com/gnaneshwer23/hsi-core/pull/115)). Optional `hsi-rcb-coh-*` composition links enabled; do not claim live EHR cohort queries.

**Cross-links (do not contradict):**

- [`MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md`](./MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md) — RWE / interop / longitudinal / cohort track  
- [`MILESTONES_M1_M13_STATUS_ROLLUP.md`](./MILESTONES_M1_M13_STATUS_ROLLUP.md) — M1–M13 eng status (M11 **Skipped**/`Missing`)  
- [`MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md`](./MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md)  
- [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md)  
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md) — org/tenant; federation **not live**  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../architecture/ARCH-002-PHASE-3-7-CLINICAL-PRIVACY.md`](../architecture/ARCH-002-PHASE-3-7-CLINICAL-PRIVACY.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  

**Out of PR1:** Clinical/biological context integration (PR2), pathway/mechanism disease models (PR3), digital patient construction engine (PR4), precision research simulation runner (PR5), workbench UI, Neon clinical migrations, live PHI ingestion, fabricated timelines, personalised treatment-effect claims, claiming M11 multiscale engine live.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live / privacy correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M15 requirement |
| `Blocked` | Cannot complete without human/config gate, authorised dataset, or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |
| `Skipped` | Milestone deliberately not built (e.g. M11) — do not claim |

Honesty freeze: research decision support only · **not a separate digital twin product** · observed ≠ inferred · population association ≠ individual truth · **no unrestricted identifiable patients in scientific KG** · pseudonymised data may still be personal data · no PHI/CDS / diagnosis / prescribing / treatment directives · simulation scenarios ≠ personalised treatment effects · synthetic/fixture patients ≠ validation when no authorised dataset · no Gate C auto-approve · no invented MoU · no fabricated timelines · fixtures ≠ live · CI ≠ scientific validity · M11 multiscale engine **not claimed** · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M15)

| Principle | Implication for disease intelligence |
|-----------|--------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Disease / digital-patient / simulation contracts stay HSI-owned; optional M14 RWE/longitudinal/cohort links are failure-isolated — not a monolith twin platform |
| **ARCH-002** Living Health KG ownership | Identifiable / restricted patient facts never auto-promote into curated KG; inferred disease states stay non-graph-promotable; patient_context layer stays out of public biomedical graph |
| **ARCH-003** Authenticated research API | Trusted session / grants only; never trust client-claimed “authorised dataset”, fabricated disease timelines, or PHI payloads |

---

## Phase 0 — M1–M14 dependency status (post-#115)

| Milestone | On audited `main` | Status | M15 readiness |
|-----------|-------------------|--------|---------------|
| **M1** Biomedical evidence | Europe PMC / OT / UniProt / CT.gov / dynamic persistence | `Partial` · live `Blocked` (#5) | Public disease literature refs OK |
| **M2** Contextual / contradiction | #90 / #92 | `Partial` | Later disease contradiction (PR2+) |
| **M3** Hypothesis / experiment | #91 · N7 | `Partial` · observation `Blocked` | Optional hypothesis bind later |
| **M4** Translational / failure | #93 / #94 | `Partial` | Translational risk context |
| **M5** Precision / biomarker | #95 · HCA/GEO `not_connected` | `Partial` | Biomarker honesty; no invented performance |
| **M6** Investigation orchestration | #96 | `Partial` | Optional investigation scope |
| **M7** Scientific evaluation | #97 | `Partial` · science `Blocked` | Orthogonal; CI ≠ validity |
| **M8** Living / monitoring | #98 | `Partial` | Continuous disease monitoring later |
| **M9** Collaboration / federation | #99 / #100 | `Partial` · federation **Missing** · partnerships **Blocked** | Org ACL hooks; **federation not live** |
| **M10** Experimental discovery | #101 / #105 / #103 / #104 | `Partial` · lab **Missing** | Experiment bind later — not patient fabrication |
| **M11** Multiscale simulation | — | `Skipped` / `Missing` | **Do not claim live multiscale / twin engine** |
| **M12** Therapeutic discovery | #107 | `Partial` (PR1) | Optional therapeutic programme/target refs |
| **M13** Translational development | #109 | `Partial` (PR1) | Optional trial-concept / biomarker refs |
| **M14** RWE / clinical outcomes | #111 / #113 / #114 / #115 | `Partial` (PR1–PR4 on `main`) · PR5+ `Missing` | Compose RWE study + LCE + cohort definition ids |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live scientific E2E |

**Verdict:** Eng substrate is sufficient for M15 **PR1 Integrated Disease Intelligence Contracts** (disease research context / observed state / inferred estimate / digital patient research model / research simulation scenario + thin memory store + honesty gates). Scientific path for real digital-patient or simulation validation remains **Blocked** until an authorised research dataset with verified data-use permissions exists — **do not fabricate timelines or use synthetic patients as validation**.

---

## Data protection assessment

| Control | Status | Notes |
|---------|--------|-------|
| Separate digital twin product | **Refused** | Research envelopes only — not a twin SaaS surface |
| Unrestricted identifiable patients in scientific KG | **Refused** | ARCH-002; `graphPromotable: false` |
| PHI / CDS / diagnosis / prescribing | **Refused** (`cdsPhiBoundary`) | Research intelligence only |
| Pseudonymised ≠ non-personal | **Declared** | Honesty flag `pseudonymisedMayStillBePersonalData: true` |
| Observed vs inferred separation | **Required** | Observation ≠ estimate; fail-closed if collapsed |
| Population association ≠ individual truth | **Declared** | Simulation / estimate honesty |
| Synthetic patients as scientific validation | **Forbidden** when authorised dataset blocked | Fixtures = engineering only |
| M11 live multiscale engine | **Not claimed** | M11 skipped/missing |
| M14 cohort builder | **PR4 merged** (#115) — fixture/contract only | Optional `hsi-rcb-coh-*` refs; no live EHR queries |
| Neon clinical PHI tables | **Not introduced** | PR1 contracts-first; red-wave only if/when authorised |

---

## Scientific validity assessment

| Claim class | PR1 stance |
|-------------|------------|
| Disease research context envelope | Allowed as governed research framing |
| Observed disease-state fact | Allowed with provenance + missingness; never as diagnosis |
| Inferred disease-state estimate | Allowed only when marked inferred; confidence ordinal; limitations required |
| Population / cohort association | Allowed as declared research association — not individual truth |
| Personalised treatment effect / prescribing | **Forbidden** |
| Fabricated disease timelines | **Forbidden** |
| Synthetic patient as validation (no authorised dataset) | **Forbidden** — scientifically blocked |
| Live multiscale / twin engine | **Forbidden** claim (`liveMultiscaleEngineOperational: false`) |
| Authorised live dataset analysis | **Blocked** — no verified authorised clinical/research dataset wired |

---

## Substrate inspection (file-level)

| Area | Files | Working status | M15 relevance |
|------|-------|----------------|---------------|
| CDS / PHI boundary | `cdsPhiBoundary.ts` · `docs/CDS_PHI_BOUNDARY.md` | `Verified operational` (refuse gates) | Reuse; never weaken |
| Clinical research scaffold | `clinicalResearchScaffold.ts` | `Partial` · synthetic only | Refuse live CDS/PHI |
| M14 RWE contracts | `realWorldEvidenceContracts.ts` | `Partial` (PR1) | Optional `hsi-rwe-study-*` / obs / exposure / outcome / analysis links |
| M14 secure clinical interop | `secureClinicalDataInteropContracts.ts` | `Partial` (PR2) | Optional data-source / temporal-alignment ids |
| M14 longitudinal clinical evidence | `longitudinalClinicalEvidenceContracts.ts` | `Partial` (PR3) | Optional `hsi-lce-spec-*` / series / result links |
| M14 reproducible cohort builder | `reproducibleCohortBuilderContracts.ts` | `Partial` (PR4) · live EHR `Missing` | Optional `hsi-rcb-coh-*` composition ids |
| M13 translational / trial concept | `translationalDevelopmentContracts.ts` | `Partial` (PR1) | Optional programme / trial-concept id links |
| M12 therapeutic IDs | `therapeuticDiscoveryDataContracts.ts` | `Partial` (PR1) | Optional therapeutic refs |
| M5 precision / biomarker | `precisionEvidenceContracts.ts` | `Partial` | Biomarker honesty later |
| Org / tenant ACL (M9) | `researchOrganisationTenantSecurity.ts` | `Partial` | Optional orgId / access class |
| M11 multiscale simulation | — | `Skipped` / `Missing` | Simulation scenario contracts must declare engine absent |
| Clinical↔biology bridge | `hsiClinicalBiologyBridge.ts` | `Implemented but unverified` · real FHIR `Missing` | Privacy pattern; no patient facts to KG |
| Research Decision Workbench | research workbench modules | `Partial` | **Out of PR1 UI** |
| Neon | red-wave; existing stores | `Partial` · staging `Blocked` (#5) | **No new migration in PR1** |
| Authorised clinical/research dataset | — | **Blocked** / **Missing** | Scientific path blocked until supplied |

**Persistence decision (PR1):** Validated contracts + thin in-memory store. **No Neon migration.** Durable clinical/patient tables deferred until authorised write path + DPIA/governance exist on red-wave.

---

## Milestone 15 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + data protection + validity | This document + M1–M14 deps | — | `Verified operational` (audit) | Keep updated | this file |
| **1** Integrated disease intelligence contracts | M14 RWE/LCE/cohort ids · CDS boundary · M9/M12/M13 hooks | **PR1 in-flight** ([#116](https://github.com/gnaneshwer23/hsi-core/pull/116)) — 7 focused tests + evaluation pack · disease research context · observed state · inferred estimate · digital patient research model · research simulation scenario + thin store · `Fixture-only` / scientific path `Blocked` | Live digital patient validation · personalised Tx effects · workbench UI | `src/humanDiseaseIntelligenceContracts.ts` · `test/humanDiseaseIntelligenceContracts.test.ts` · `scripts/human-disease-intelligence-contracts.ts` · `evaluation/human-disease-intelligence/` |
| **2** Clinical and biological context integration | M2 contradiction · M5 biomarker · M14 longitudinal | `Missing` | Integrated clinical↔biology disease context without PHI promotion | later PR2 |
| **3** Pathway / mechanism disease models | M12 / literature KG | `Missing` | Mechanism envelopes — not twin product | later PR3 |
| **4** Digital patient construction engine | PR1 model contracts | `Missing` | Construction from authorised data only | later PR4 |
| **5** Precision research simulation runner | PR1 scenarios · M11 **Skipped** | `Missing` | Research-only runner; no live multiscale claim | later PR5 |
| **6** Population / subgroup disease intelligence | M14 cohort (#115) | `Missing` | Aggregate honesty; small-cell disclosure | later PR6 |
| **7** Uncertainty / counterfactual research envelopes | — | `Missing` | Explicit assumptions; not individual truth | later PR7 |
| **8** Workbench surfaces | research workbench | `Partial` | UI deferred | later PR8 |
| **9** Authorised-dataset scientific validation | — | `Blocked` | No synthetic-as-validation | later PR9 |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Disease research context** | Governed framing of disease question, population, permitted uses | Digital twin product / clinical care system |
| **Disease state observation** | Declared **observed** fact with provenance | Diagnosis directive or inferred estimate |
| **Disease state estimate** | Explicitly **inferred** estimate with limitations | Observed fact or individual clinical truth |
| **Digital patient research model** | Pseudonymous, access-scoped research model | Identifiable patient record in scientific KG |
| **Simulation scenario** | Research-only scenario envelope | Personalised treatment effect / live multiscale engine |

---

## PR1 deliverable (Integrated Disease Intelligence Contracts)

**Integrated Disease Intelligence Contracts**

- Versioned **disease research context** with disease focus, scientific question, population framing, permitted research uses, dataset availability, access classification, closed review lifecycle.  
- **Disease state observation** with `epistemicStatus: observed`, measurement/concept, time, missingness, provenance; refuse identifier-shaped refs; never diagnosis/prescribing language.  
- **Disease state estimate** with `epistemicStatus: inferred`, method ordinal, confidence ordinal, limitations; refuse collapsing into observation; population association ≠ individual truth honesty.  
- **Digital patient research model** — pseudonymous subject ref only; access-scoped; permitted research uses enumerated; `identifiableOutsideScientificKg: true`; not a twin product.  
- **Simulation scenario** — research-only; links optional M14 RWE/LCE/(reserved) cohort ids; `notPersonalisedTreatmentEffect: true`; `liveMultiscaleEngineOperational: false`; blocked when no authorised dataset if claiming scientific validation.  
- Honesty: observed ≠ inferred; no PHI/CDS; no Gate C / MoU; Neon red-wave; migration deferred; synthetic fixtures ≠ scientific validation.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** PR2 clinical/biological context integration, workbench UI, Neon migration, fabricated timelines, auto-merge.

---

## Dataset availability blocker

| Item | Status |
|------|--------|
| Authorised clinical/research dataset with verified data-use permission | **Not supplied** → scientific path **Blocked** |
| Live digital patient construction from authorised data | **Missing** |
| Live multiscale / twin simulation engine (M11) | **Skipped** / **Missing** |
| M14 cohort builder on `main` | **Merged** (#115) — contracts only; live queries still Missing |

**Rule:** If no suitable authorised dataset is available, report the blocker — do **not** fabricate disease timelines or present synthetic digital patients as scientific validation. Eng PR1 may still land contracts as fixture/engineering substrate.

---

## Human blockers (unchanged + M15-specific)

| Item | Status | Blocks for M15 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded disease entailment |
| #4 SME gold | PARKED | Scored disease-intelligence usefulness |
| #5 Live journey | PARKED | Real authorised-dataset E2E |
| Authorised research dataset + DPIA / legal basis | Not supplied | Scientific completion of M15 |
| M11 multiscale engine | Skipped/Missing | Live simulation validation claims |
| Federation / partner MoU | Not invented | Live multi-site patient research models |

---

## Anti-patterns (binding)

- Shipping a separate digital twin product surface.  
- Autonomous diagnosis, prescribing, or treatment recommendations.  
- Collapsing observed facts with inferred estimates.  
- Presenting population associations as individual clinical truth.  
- Writing identifiable patient facts into the curated scientific KG.  
- Treating synthetic/fixture digital patients as scientific validation when no authorised dataset exists.  
- Claiming a live M11 multiscale / twin engine.  
- Fabricating disease timelines or personalised treatment effects.  
- Gate C auto-approve, invented MoU, autumn-snow Neon, PHI→LLM.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1 |
|------|--------|--------------|
| PHI/CDS refuse | `cdsPhiBoundary` · `clinicalResearchScaffold` | Live CDS engines / twin SaaS |
| M14 RWE / LCE / cohort ids | `realWorldEvidenceContracts` · `longitudinalClinicalEvidenceContracts` · `reproducibleCohortBuilderContracts` (id refs) | Live EHR cohort queries |
| Privacy bridge pattern | `hsiClinicalBiologyBridge` (reference) | Copying patient facts to KG |
| Org ACL | M9 tenant security ids | Federation claims |
| Trial / biomarker refs | M13 translational contracts | Invented protocols |
| Therapeutic refs | M12 discovery contracts | Efficacy claims |
| Persistence | In-memory store + projection lines | New Neon clinical migration |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#116](https://github.com/gnaneshwer23/hsi-core/pull/116) | M15 PR1 Integrated Disease Intelligence Contracts | `eng/m15-disease-intelligence-contracts` | **PR1 in-flight** — 7 focused tests + evaluation pack; open for review; **do not auto-merge** |
| [#115](https://github.com/gnaneshwer23/hsi-core/pull/115) | M14 PR4 Reproducible Cohort Builder | merged → `02cf969` | Substrate |
| [#114](https://github.com/gnaneshwer23/hsi-core/pull/114) | M14 PR3 Longitudinal Clinical Evidence Model | merged → `64dae29` | Substrate |
| [#113](https://github.com/gnaneshwer23/hsi-core/pull/113) | M14 PR2 Secure Clinical Data Interoperability | merged → `33843eb` | Substrate |
| [#111](https://github.com/gnaneshwer23/hsi-core/pull/111) | M14 PR1 Clinical Evidence and RWE Contracts | merged → `19e0ff1` | Substrate |

**Suggested next:** PR2 Clinical and Biological Context Integration.

**M14 left open after Step A:** none on the M14 eng track (PR4 [#115](https://github.com/gnaneshwer23/hsi-core/pull/115) squash-merged). Unrelated open PRs #71 / #61 / #60 / #34 / #15 left untouched.
