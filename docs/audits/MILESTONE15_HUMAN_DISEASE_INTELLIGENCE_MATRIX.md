# Milestone 15 — Integrated Human Disease Intelligence, Digital Patient Models & Precision Research Simulation

**Brief:** HSI Milestone 15 — governed disease-research intelligence contracts for disease context, observed vs inferred disease state, access-scoped digital patient **research** models, and research-only simulation scenarios — composing M14 RWE / longitudinal / (optional) cohort ids — **without** a separate digital-twin product, autonomous diagnosis/prescribing/treatment, unrestricted identifiable patients in the scientific KG, PHI/CDS, Gate C auto-approve, MoU invention, or claiming a live multiscale engine (M11 skipped).  
**Status:** Phase 0 gap audit + PR1 (Integrated Disease Intelligence Contracts, [#116](https://github.com/gnaneshwer23/hsi-core/pull/116) merged) + PR2 (Clinical and Biological Context Integration, [#117](https://github.com/gnaneshwer23/hsi-core/pull/117) merged) + PR3 (Longitudinal Disease State Modelling, [#118](https://github.com/gnaneshwer23/hsi-core/pull/118) merged) + PR4 (Cross-Scale Ontology and Model Linkage, [#119](https://github.com/gnaneshwer23/hsi-core/pull/119) merged) + PR5 (Population and Cohort Disease Models, [#120](https://github.com/gnaneshwer23/hsi-core/pull/120) in-flight) + PR6 (Patient-Contextualised Research Models, [#121](https://github.com/gnaneshwer23/hsi-core/pull/121) stacked on #120) — **not** disease intelligence complete, **not** personalised treatment simulation authorised, **not** live digital patient validation, **not** M15 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `fae37c6a869da3a4e21ca0b426dc25985b29e47f` (post-#119 tip)  
**Tip commit:** `fae37c6 Add M15 cross-scale ontology and model linkage (#119)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** PR1–PR4 merged on `main` ([#116](https://github.com/gnaneshwer23/hsi-core/pull/116), [#117](https://github.com/gnaneshwer23/hsi-core/pull/117), [#118](https://github.com/gnaneshwer23/hsi-core/pull/118), [#119](https://github.com/gnaneshwer23/hsi-core/pull/119)); substrate includes M14 PR1–PR4 ([#111](https://github.com/gnaneshwer23/hsi-core/pull/111), [#113](https://github.com/gnaneshwer23/hsi-core/pull/113), [#114](https://github.com/gnaneshwer23/hsi-core/pull/114), [#115](https://github.com/gnaneshwer23/hsi-core/pull/115)). PR5 ([#120](https://github.com/gnaneshwer23/hsi-core/pull/120)) targets `main` post-#119; PR6 stacks on PR5 and composes HDI digital-patient + PCDM + M14 ids. Do not claim live EHR cohort queries, live prediction engines, complete biological replicas, treatment recommendations, or a live M11 multiscale engine.

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

**Out of PR1:** Clinical/biological context integration (PR2), longitudinal disease state modelling (PR3), cross-scale ontology / model linkage (PR4), digital patient construction engine (later), precision research simulation runner (later), workbench UI, Neon clinical migrations, live PHI ingestion, fabricated timelines, personalised treatment-effect claims, claiming M11 multiscale engine live.

**Out of PR2:** Live clinical/biology connectors, longitudinal disease state modelling (PR3), digital patient construction engine (later), workbench UI, Neon clinical migrations, PHI ingestion, promoting restricted patient observations into the public graph, collapsing population association into individual inference, claiming live twin / multiscale.

**Out of PR3:** Live longitudinal engines, invented continuous trajectories across clinically meaningful gaps, clinical care / diagnosis / prescribing, cross-scale ontology linkage (PR4), twin product, workbench UI, Neon clinical migrations, PHI ingestion, claiming live twin / multiscale.

**Out of PR4:** Live M11 multiscale / coupling engines, invented simulation parameters, population/cohort disease models (PR5), digital patient construction engine, workbench UI, Neon clinical migrations, PHI ingestion, twin product, claiming molecular pathway association as organ-level causal effect.

**Out of PR5:** Live prediction / clustering engines, treating prediction as causation, treating unsupervised clusters as validated subtypes, inferring clinical usefulness from predictive accuracy alone, patient-contextualised research models (PR6), twin product, workbench UI, Neon clinical migrations, PHI ingestion, CDS / Gate C.

**Out of PR6:** Live digital-patient construction engines, complete biological replica / twin claims, treatment recommendations, clinical care without separate validation/governance, multiscale simulation integration (PR7), workbench UI, Neon clinical migrations, PHI ingestion, CDS / Gate C / MoU invention.

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
| M15 PR3 longitudinal disease-state | `longitudinalDiseaseStateModellingContracts.ts` | **PR3 merged** (#118) · `Fixture-only` | Trajectory / baseline-FU / events / organ / exposure / biomarker / missing / transitions |
| M15 PR4 cross-scale ontology / model linkage | `crossScaleOntologyModelLinkageContracts.ts` | **PR4 merged** (#119) · `Fixture-only` | Scales · entity mapping · context · provenance · temporal · model linkage · uncertainty · versioned ontology |
| M15 PR5 population / cohort disease models | `populationCohortDiseaseModelsContracts.ts` | **PR5 in-flight** · `Fixture-only` | Outcome prediction · trajectory clustering · progression risk · phenotype strata · organ outcomes · biomarker association + methodology fields |
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
| **1** Integrated disease intelligence contracts | M14 RWE/LCE/cohort ids · CDS boundary · M9/M12/M13 hooks | **PR1 merged** ([#116](https://github.com/gnaneshwer23/hsi-core/pull/116) → `8fb6aac`) — 7 focused tests + evaluation pack · disease research context · observed state · inferred estimate · digital patient research model · research simulation scenario + thin store · `Fixture-only` / scientific path `Blocked` | Live digital patient validation · personalised Tx effects · workbench UI | `src/humanDiseaseIntelligenceContracts.ts` · `test/humanDiseaseIntelligenceContracts.test.ts` · `scripts/human-disease-intelligence-contracts.ts` · `evaluation/human-disease-intelligence/` |
| **2** Clinical and biological context integration | PR1 HDI ids · M14 longitudinal / interop · `hsiClinicalBiologyBridge` privacy pattern | **PR2 merged** ([#117](https://github.com/gnaneshwer23/hsi-core/pull/117) → `15b8f8f`) — 7 focused tests + evaluation pack · authorised research-context resolution · permitted clinical observation retrieval · public biology retrieval · concept mapping · temporal alignment · quality · missingness · supported relationships · unsupported/uncertain preservation · versioned integrated disease context + thin store · `Fixture-only` / scientific path `Blocked` | Live clinical/biology connectors · PHI promotion to public graph · population→individual collapse | `src/clinicalBiologicalContextContracts.ts` · `test/clinicalBiologicalContextContracts.test.ts` · `scripts/clinical-biological-context-contracts.ts` · `evaluation/clinical-biological-context/` |
| **3** Longitudinal disease state modelling | M14 LCE · PR1 HDI · PR2 CBC ids | **PR3 merged** ([#118](https://github.com/gnaneshwer23/hsi-core/pull/118) → `ecf8326`) — 7 focused tests + evaluation pack · trajectory reconstruction · baseline/follow-up · clinical event timelines · organ outcome trends · treatment exposure context · biomarker trajectories · missing-data analysis · disease-state transitions · temporal integrity (event/measurement/ingestion/prediction) + thin store · `Fixture-only` / scientific path `Blocked` | Live longitudinal engine · invented continuous fill across gaps · clinical care | `src/longitudinalDiseaseStateModellingContracts.ts` · `test/longitudinalDiseaseStateModellingContracts.test.ts` · `scripts/longitudinal-disease-state-modelling-contracts.ts` · `evaluation/longitudinal-disease-state/` |
| **4** Cross-scale ontology and model linkage | PR1–PR3 envelopes · M12/M13 refs · ontology registry pattern | **PR4 merged** ([#119](https://github.com/gnaneshwer23/hsi-core/pull/119) → `fae37c6`) — 7 focused tests + evaluation pack · scales (molecular→longitudinal outcome) · cross-scale entity mapping · biological context annotation · evidence provenance · temporal context · model linkage (validated coupling required) · relationship uncertainty · versioned ontology mappings · unsupported couplings recorded explicitly + thin store · `Fixture-only` / scientific path `Blocked` | Live M11 coupling engine · invented parameters · molecular→organ auto-causal claim | `src/crossScaleOntologyModelLinkageContracts.ts` · `test/crossScaleOntologyModelLinkageContracts.test.ts` · `scripts/cross-scale-ontology-model-linkage-contracts.ts` · `evaluation/cross-scale-ontology/` |
| **5** Population / cohort disease models | M14 cohort (#115) · PR1–PR4 envelopes | **PR5 in-flight** ([#120](https://github.com/gnaneshwer23/hsi-core/pull/120); targets `main` post-[#119](https://github.com/gnaneshwer23/hsi-core/pull/119)) — 6 focused tests + evaluation pack · longitudinal outcome prediction · disease trajectory clustering (exploratory unless validated) · progression risk · phenotype stratification · organ-specific outcome modelling · biomarker association · methodology fields (cohort/index/horizon/predictors/train-val/missing/confounders/calibration/discrimination/external validation/subgroup) + thin store · `Fixture-only` / scientific path `Blocked` | Live prediction engines · prediction-as-causation · unsupervised=validated subtype · accuracy=clinical usefulness | `src/populationCohortDiseaseModelsContracts.ts` · `test/populationCohortDiseaseModelsContracts.test.ts` · `scripts/population-cohort-disease-models-contracts.ts` · `evaluation/population-cohort-disease-models/` |
| **6** Patient-contextualised research models | PR1 HDI digital-patient · PR5 PCDM · M14 ids · M11 **Skipped** | **PR6 in-flight** ([#121](https://github.com/gnaneshwer23/hsi-core/pull/121); stacked on [#120](https://github.com/gnaneshwer23/hsi-core/pull/120)) — 7 focused tests + evaluation pack · authorised longitudinal input · versioned observation set · disease state estimation · model applicability check · missing-information assessment · uncertainty estimation · research-only interpretation · audit history · out-of-scope outside validated population/input domain + thin store · `Fixture-only` / scientific path `Blocked` | Live digital-patient construction · complete biological replica · treatment recommendations · clinical care without separate validation | `src/patientContextualisedResearchModelsContracts.ts` · `test/patientContextualisedResearchModelsContracts.test.ts` · `scripts/patient-contextualised-research-models-contracts.ts` · `evaluation/patient-contextualised-research-models/` |
| **7** Multiscale simulation integration / uncertainty envelopes | PR6 PCRM · M11 **Skipped** | `Missing` | Explicit assumptions; not individual truth; no live M11 claim | later PR7 Multiscale Simulation Integration |
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
| **Patient observation** (PR2) | Permitted longitudinal clinical observation envelope | Public-graph fact or individual mechanism claim |
| **Population association** (PR2) | Aggregate / cohort biological association | Individual inference for a subject |
| **Established mechanism** (PR2) | Declared public biomedical mechanism concept | Patient-specific diagnosis |
| **Computational inference** (PR2) | Declared model/algorithmic inference | Observed clinical fact |
| **Unvalidated hypothesis** (PR2) | Explicitly unsupported/uncertain mapping candidate | Supported relationship or invented evidence |
| **Disease trajectory reconstruction** (PR3) | Discrete longitudinal reconstruction with gap policy | Invented continuous fill / clinical care timeline |
| **Disease state transition** (PR3) | Research transition envelope (observed or inferred) | Diagnosis / treatment directive |
| **Treatment exposure context** (PR3) | Declared exposure framing for research | Proven treatment effect / prescribing |
| **Cross-scale entity mapping** (PR4) | Declared mapping across biological scales with coupling status | Auto organ-level causal effect from molecular association |
| **Validated coupling** (PR4) | Explicit coupling required before cross-scale model linkage | Unvalidated simulation component wiring / live M11 engine |
| **Unsupported coupling** (PR4) | Explicitly recorded unsupported/uncertain/blocked coupling | Discarded gap or invented validated support |
| **Versioned ontology mapping** (PR4) | Versioned cross-ontology mapping with review for exact | Unreviewed exact equivalence / invented identifiers |
| **Longitudinal outcome prediction** (PR5) | Research prediction envelope with methodology fields | Causal explanation / clinical usefulness from accuracy alone |
| **Disease trajectory clustering** (PR5) | Exploratory unless `validated_subtype_declared` | Unsupervised clusters as validated disease subtypes |
| **Disease progression risk** (PR5) | Aggregate progression-risk research envelope | Causal explanation / treatment directive |
| **Phenotype stratification** (PR5) | Aggregate phenotype strata with disclosure controls | Validated subtypes by default / individual collapse |
| **Organ-specific outcome modelling** (PR5) | Organ/system research outcome envelope | Organ-level causal explanation from association |
| **Biomarker association analysis** (PR5) | Association / prediction-association / exploratory correlation | Causation or clinical usefulness claim |
| **Modelling methodology declaration** (PR5) | Cohort/index/horizon/predictors/train-val/missing/confounders/calibration/discrimination/external/subgroup | Silent methodology gaps / invented performance |
| **Patient-contextualised research model** (PR6) | Bounded individual-context research representation | Complete biological replica / digital twin product / clinical care |
| **Authorised longitudinal input** (PR6) | Access-scoped longitudinal input envelope | Unauthorised PHI feed / identifiable ingestion |
| **Versioned observation set** (PR6) | Versioned observation refs for research | Invented continuous fill / clinical care record |
| **Disease state estimation** (PR6) | Explicitly inferred individual-context estimate | Observed fact / diagnosis / treatment recommendation |
| **Model applicability check** (PR6) | Applicable / partial / out-of-scope outside validated population or input domain | Silent applicability / forced in-scope claim |
| **Missing-information assessment** (PR6) | Declared gaps without inventing values | Invented measurements |
| **Uncertainty estimation** (PR6) | Declared uncertainty ordinal + sources | Certainty / individual clinical truth |
| **Research-only interpretation** (PR6) | Research interpretation under applicability + uncertainty | Treatment recommendation / clinical care authorisation |
| **Audit history** (PR6) | Append-only research audit envelope | Silent mutation of individual-context records |

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

## PR2 deliverable (Clinical and Biological Context Integration)

**Clinical and Biological Context Integration**

- Resolve **authorised research context** against PR1 `hsi-hdi-ctx-*` (optional M14 RWE/LCE ids); fail-closed when authorisation / dataset blocked.  
- Retrieve **permitted longitudinal clinical observations** (`patient_observation` layer); `graphPromotable: false`; restricted rows must not promote to public graph.  
- Retrieve **relevant biological knowledge** from public biomedical scope only; patient-context graph layer blocked; live graph query not claimed.  
- **Map clinical↔biology concepts** with explicit mappingOutcome (`supported` / `unsupported` / `uncertain`) and layer distinctions.  
- **Align temporal observations** with optional M14 interop temporal-alignment / LCE series ids; no fabricated timelines.  
- **Assess data quality** and **identify missing measurements** without inventing values.  
- **Record supported relationships**; **preserve** unsupported/uncertain mappings (not discarded, not invented as support).  
- Produce **versioned integrated disease context** with closed review lifecycle and human acceptance gate.  
- Fail-closed: population association ≠ individual inference; restricted patient observations ≠ public KG promotion.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI.

**Out of PR2:** Live connectors, PR3 Longitudinal Disease State Modelling, workbench UI, Neon migration, PHI ingestion, auto-merge.

---

## PR3 deliverable (Longitudinal Disease State Modelling)

**Longitudinal Disease State Modelling**

- Versioned **modelling spec** composing PR1 `hsi-hdi-ctx-*`, optional PR2 `hsi-cbc-idc-*`, and M14 LCE/RWE ids; closed review lifecycle; fail-closed when dataset blocked.  
- **Disease trajectory reconstruction** from discrete points; gap policy (`no_interpolation_across_gap` / declared model / uncertainty preserved); refuse invented continuous fill.  
- **Baseline and follow-up comparison** with distinct baseline/follow-up times; no invented deltas or proven treatment-effect claims.  
- **Clinical event timelines** distinguishing event / measurement / ingestion times; no fabricated timelines.  
- **Organ-specific outcome trends** with uncertainty ordinal and optional RWE outcome / LCE series refs.  
- **Treatment exposure context** — exposure framing only; `treatmentEffectClaimed: false`; no prescribing directive.  
- **Biomarker trajectories** with sparse-uncertainty preservation.  
- **Missing-data analysis** without inventing values.  
- **Disease state transition modelling** with explicit `epistemicStatus` observed vs inferred; refuse collapsing observed into estimate; not clinical care.  
- Temporal integrity: event / measurement / ingestion / prediction roles; refuse future-data leakage and prediction-before-measurement.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no twin/PHI/CDS.

**Out of PR3:** Live longitudinal engine, PR4 Cross-Scale Ontology and Model Linkage, workbench UI, Neon migration, PHI ingestion, auto-merge.

---

## PR4 deliverable (Cross-Scale Ontology and Model Linkage)

**Cross-Scale Ontology and Model Linkage**

- Versioned **cross-scale ontology spec** composing PR1 `hsi-hdi-ctx-*`, optional PR2 `hsi-cbc-idc-*`, optional PR3 `hsi-ldsm-spec-*`, and optional M12/M13 programme ids; closed review lifecycle; fail-closed when dataset blocked.  
- Biological **scales**: molecular · cellular · tissue · organ · organ-system · clinical phenotype · longitudinal outcome.  
- **Cross-scale entity mapping** with `mappingOutcome` + `couplingStatus`; `molecularPathwayAssociationImpliesOrganCausalEffect: false` always.  
- **Biological context annotation**, **evidence provenance**, and **temporal context** envelopes without invented evidence or fabricated timelines.  
- **Model linkage** across scales only when a **validated coupling** is recorded; refuse unvalidated cross-scale simulation-component wiring; `liveMultiscaleEngineOperational: false`; `inventedParameters: null`.  
- **Relationship uncertainty** with explicit unsupported-coupling recording.  
- **Versioned ontology mappings** (exact requires human `reviewDecisionId`).  
- **Unsupported / uncertain / blocked couplings** preserved explicitly — never invented as validated support.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no twin/PHI/CDS; no live M11 engine.

**Out of PR4:** Live M11 engine, invented parameters, PR5 Population and Cohort Disease Models, workbench UI, Neon migration, PHI ingestion, auto-merge.

---

## PR5 deliverable (Population and Cohort Disease Models)

**Population and Cohort Disease Models**

- Versioned **population/cohort modelling spec** composing PR1 `hsi-hdi-ctx-*`, required M14 `hsi-rcb-coh-*`, optional PR2 `hsi-cbc-idc-*` / PR3 `hsi-ldsm-spec-*` / PR4 `hsi-csol-spec-*` / RWE study ids; closed review lifecycle; fail-closed when dataset blocked.  
- Shared **methodology declaration**: cohort definition, index date, outcome horizon, predictor availability, train/validation separation, missing-data handling, confounder assessment, calibration, discrimination, external validation, subgroup performance.  
- **Longitudinal outcome prediction** (research) with `causalExplanationClaimed: false` and `clinicalUsefulnessClaimed: false`.  
- **Disease trajectory clustering** — exploratory unless `validated_subtype_declared`; unsupervised clusters must not claim validated subtypes.  
- **Disease progression risk** research envelope — prediction/risk framing only; not causation.  
- **Phenotype stratification** with aggregate honesty / small-cell disclosure; `validatedSubtypeClaimed: false` by default.  
- **Organ-specific outcome modelling** without organ-level causal explanation claims.  
- **Biomarker association analysis** with closed association kinds (`association_only` / `prediction_association` / `exploratory_correlation`).  
- Safeguards: prediction ≠ causation; unsupervised clusters ≠ validated subtypes; predictive accuracy ≠ clinical usefulness; aggregate honesty; no individual collapse.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no twin/PHI/CDS.

**Out of PR5:** Live prediction engines, PR6 Patient-Contextualised Research Models, workbench UI, Neon migration, PHI ingestion, auto-merge.

---

## PR6 deliverable (Patient-Contextualised Research Models)

**Patient-Contextualised Research Models**

- Versioned **patient-contextualised research spec** composing PR1 `hsi-hdi-ctx-*` + required `hsi-hdi-dpm-*`, optional PR5 `hsi-pcdm-spec-*`, optional PR2/PR3/PR4 and M14 RWE/LCE/cohort ids; closed review lifecycle; fail-closed when dataset blocked.  
- **Authorised longitudinal input** with closed authorisation statuses; fixture datasets cannot claim `authorised_declared`.  
- **Versioned observation set** with explicit version and observation refs; no invented continuous fill.  
- **Disease state estimation** with `epistemicStatus: inferred`; population association ≠ individual truth; never diagnosis/treatment recommendation.  
- **Model applicability check** with out-of-scope outcomes for outside validated population / input domain.  
- **Missing-information assessment** without inventing values (`inventedValues: null`).  
- **Uncertainty estimation** with ordinal + declared sources.  
- **Research-only interpretation** refused while applicability is out of scope; `clinicalCareAuthorised: false`; `completeBiologicalReplicaClaimed: false`.  
- **Audit history** envelopes for create/update/review/out-of-scope/block actions.  
- Safeguards: not a complete biological replica; not a twin product; not treatment recommendations; not clinical care without separate validation/governance; out-of-scope outside validated domain.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no PHI/CDS; no Gate C / MoU.

**Out of PR6:** Live digital-patient engines, twin/replica claims, treatment recommendations, PR7 Multiscale Simulation Integration, workbench UI, Neon migration, PHI ingestion, auto-merge.

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
- Treating prediction as causal explanation.  
- Treating unsupervised clusters as validated disease subtypes.  
- Inferring clinical usefulness from predictive accuracy alone.  
- Claiming a complete biological replica or digital twin product from patient-contextualised research envelopes.  
- Issuing treatment recommendations or clinical-care authorisation from research-only interpretation.  
- Forcing in-scope applicability when outside validated population or input domain.  
- Inventing missing observation values.  
- Gate C auto-approve, invented MoU, autumn-snow Neon, PHI→LLM.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1–PR6 |
|------|--------|------------------|
| PHI/CDS refuse | `cdsPhiBoundary` · `clinicalResearchScaffold` | Live CDS engines / twin SaaS |
| M14 RWE / LCE / cohort / interop ids | `realWorldEvidenceContracts` · `longitudinalClinicalEvidenceContracts` · `reproducibleCohortBuilderContracts` · `secureClinicalDataInteropContracts` (id refs) | Live EHR cohort / FHIR queries |
| PR1 HDI disease context / observations / digital patient | `humanDiseaseIntelligenceContracts` (id refs) | Collapsing observed/inferred; twin product |
| PR2 integrated clinical↔biology context | `clinicalBiologicalContextContracts` (id refs) | PHI promotion to public graph |
| PR3 longitudinal disease-state modelling | `longitudinalDiseaseStateModellingContracts` | Invented continuous trajectories / clinical care |
| PR4 cross-scale ontology / model linkage | `crossScaleOntologyModelLinkageContracts` · `hsiOntologyRegistry` (pattern) | Molecular→organ auto-causal; live M11; invented parameters |
| PR5 population / cohort disease models | `populationCohortDiseaseModelsContracts` | Prediction-as-causation; unsupervised=validated subtype; accuracy=clinical usefulness |
| PR6 patient-contextualised research models | `patientContextualisedResearchModelsContracts` | Complete biological replica; treatment recommendations; silent out-of-scope; invented missing values |
| Privacy bridge pattern | `hsiClinicalBiologyBridge` (reference) | Copying patient facts to KG |
| Org ACL | M9 tenant security ids | Federation claims |
| Trial / biomarker refs | M13 translational contracts | Invented protocols |
| Therapeutic refs | M12 discovery contracts | Efficacy claims |
| Persistence | In-memory store + projection lines | New Neon clinical migration |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#121](https://github.com/gnaneshwer23/hsi-core/pull/121) | M15 PR6 Patient-Contextualised Research Models | `eng/m15-patient-contextualised-research-models` | **PR6 in-flight** — stacked on [#120](https://github.com/gnaneshwer23/hsi-core/pull/120); 7 focused tests + evaluation pack; open for review; **do not auto-merge** |
| [#120](https://github.com/gnaneshwer23/hsi-core/pull/120) | M15 PR5 Population and Cohort Disease Models | `eng/m15-population-cohort-disease-models` | **PR5 in-flight** — targets `main` post-[#119](https://github.com/gnaneshwer23/hsi-core/pull/119); 6 focused tests + evaluation pack; open for review; **do not auto-merge** |
| [#119](https://github.com/gnaneshwer23/hsi-core/pull/119) | M15 PR4 Cross-Scale Ontology and Model Linkage | merged → `fae37c6` | Substrate |
| [#118](https://github.com/gnaneshwer23/hsi-core/pull/118) | M15 PR3 Longitudinal Disease State Modelling | merged → `ecf8326` | Substrate |
| [#117](https://github.com/gnaneshwer23/hsi-core/pull/117) | M15 PR2 Clinical and Biological Context Integration | merged → `15b8f8f` | Substrate |
| [#116](https://github.com/gnaneshwer23/hsi-core/pull/116) | M15 PR1 Integrated Disease Intelligence Contracts | merged → `8fb6aac` | Substrate |
| [#115](https://github.com/gnaneshwer23/hsi-core/pull/115) | M14 PR4 Reproducible Cohort Builder | merged → `02cf969` | Substrate |
| [#114](https://github.com/gnaneshwer23/hsi-core/pull/114) | M14 PR3 Longitudinal Clinical Evidence Model | merged → `64dae29` | Substrate |
| [#113](https://github.com/gnaneshwer23/hsi-core/pull/113) | M14 PR2 Secure Clinical Data Interoperability | merged → `33843eb` | Substrate |
| [#111](https://github.com/gnaneshwer23/hsi-core/pull/111) | M14 PR1 Clinical Evidence and RWE Contracts | merged → `19e0ff1` | Substrate |

**Merge order:** PR5 [#120](https://github.com/gnaneshwer23/hsi-core/pull/120) → this PR6 Patient-Contextualised Research Models → next PR7 Multiscale Simulation Integration.

**Suggested next:** PR7 Multiscale Simulation Integration.

**M14 left open after Step A:** none on the M14 eng track (PR4 [#115](https://github.com/gnaneshwer23/hsi-core/pull/115) squash-merged). Unrelated open PRs #71 / #61 / #60 / #34 / #15 left untouched.
