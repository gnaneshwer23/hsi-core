# Milestone 14 — Real-World Evidence, Clinical Outcomes & Post-Study Learning Intelligence

**Brief:** HSI Milestone 14 — governed RWE / clinical outcomes research contracts connecting authorised longitudinal health data concepts, observational analyses, safety-signal research envelopes, and post-study learning to M1–M13 — **without** an unrestricted central patient database, PHI/CDS, treatment directives, fabricating patient data, Gate C auto-approve, or MoU invention.  
**Status:** Phase 0 gap audit + PR1 (Clinical Evidence and RWE Contracts, [#111](https://github.com/gnaneshwer23/hsi-core/pull/111)) + PR2 (Secure Clinical Data Interoperability, [#113](https://github.com/gnaneshwer23/hsi-core/pull/113)) + PR3 (Longitudinal Clinical Evidence Model, [#114](https://github.com/gnaneshwer23/hsi-core/pull/114)) — **not** RWE complete, **not** observational causal claims authorised, **not** live clinical dataset analysis, **not** M14 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `33843eba6c2fa695bde1d292b7a2a64b2ba715ca` (post-#111 + #113 tip)  
**Tip commit:** `33843eb Add M14 secure clinical data interoperability contracts (#113)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** PR3 stacks on merged [#111](https://github.com/gnaneshwer23/hsi-core/pull/111) + [#113](https://github.com/gnaneshwer23/hsi-core/pull/113) on `main`.  

**Cross-links (do not contradict):**

- [`MILESTONES_M1_M13_STATUS_ROLLUP.md`](./MILESTONES_M1_M13_STATUS_ROLLUP.md) — M1–M13 eng status  
- [`MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md`](./MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md) — trial concepts / biomarker records on `main` (#109)  
- [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md) — therapeutic discovery PR1 (#107)  
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md) — org/tenant; federation **not live**  
- [`MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md`](./MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md)  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../architecture/ARCH-002-PHASE-3-7-CLINICAL-PRIVACY.md`](../architecture/ARCH-002-PHASE-3-7-CLINICAL-PRIVACY.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  

**Out of PR1:** Secure clinical data interoperability / FHIR–OMOP adapters (PR2), longitudinal analysis engine (PR3), cohort builder (PR4), observational causal engine (PR5), safety intelligence (PR6), biomarker/trial translation (PR7), post-study learning (PR8), workbench UI (PR9), SSc real-data validation (PR10), Neon clinical migrations, live PHI ingestion, fabricated patient counts/effects, treatment recommendations.

**Out of PR2:** Live FHIR/OMOP/EHR connectors, longitudinal analysis engine (PR3), cohort builder (PR4+), workbench UI, Neon clinical migrations, PHI ingestion, fabricated clinical results, claiming federation operational.

**Out of PR3:** Live longitudinal engines, cohort builder (PR4), observational causal engine (PR5+), workbench UI, Neon clinical migrations, PHI ingestion, fabricated trajectories/effects/survival curves, claiming authorised-dataset analysis.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live / privacy correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M14 requirement |
| `Blocked` | Cannot complete without human/config gate, authorised dataset, or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: research decision support only · **no unrestricted central patient database** · observational association ≠ proven treatment effect · estimand under assumptions ≠ causal proof · identifiable patient records **outside** curated scientific KG · pseudonymised data may still be personal data · no PHI/CDS / treatment directives · no Gate C auto-approve · no invented MoU · no fabricated patient counts / effects / survival curves · fixtures ≠ live · CI ≠ scientific validity · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M14)

| Principle | Implication for RWE |
|-----------|---------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | RWE contracts stay HSI-owned; clinical systems / FHIR / federation adapters are optional, failure-isolated — not a monolith or unrestricted patient lake |
| **ARCH-002** Living Health KG ownership | Identifiable / restricted clinical facts never auto-promote into curated KG; observational associations stay non-graph-promotable until human review; patient_context layer stays out of public biomedical graph |
| **ARCH-003** Authenticated research API | Trusted session / grants only; never trust client-claimed “authorised dataset”, fabricated counts, or PHI payloads |

---

## Phase 0 — M1–M13 dependency status (post-#109)

| Milestone | On audited `main` | Status | RWE readiness |
|-----------|-------------------|--------|---------------|
| **M1** Biomedical evidence | Europe PMC / OT / UniProt / CT.gov / dynamic persistence | `Partial` · live `Blocked` (#5) | Public literature/registry refs OK; not clinical outcomes |
| **M2** Contextual / contradiction | #90 / #92 | `Partial` | Later discrepancy investigation |
| **M3** Hypothesis / experiment | #91 · N7 | `Partial` · observation `Blocked` | Hypothesis ids for post-study learning later |
| **M4** Translational / failure | #93 / #94 | `Partial` | Translational risk context |
| **M5** Precision / biomarker | #95 · HCA/GEO `not_connected` | `Partial` | Biomarker honesty; no invented performance |
| **M6** Investigation orchestration | #96 | `Partial` | Optional investigation scope |
| **M7** Scientific evaluation | #97 | `Partial` · science `Blocked` | Orthogonal; CI ≠ validity |
| **M8** Living / monitoring | #98 | `Partial` | Continuous outcome monitoring later (PR10/Phase 10) |
| **M9** Collaboration / federation | #99 / #100 | `Partial` · federation **Missing** · partnerships **Blocked** | Org ACL hooks; **federation not live** |
| **M10** Experimental discovery | #101 / #105 / #103 / #104 | `Partial` · lab **Missing** | Experiment bind later — not clinical observation fabrication |
| **M11** Multiscale simulation | — | `Skipped` / `Missing` | Do not claim simulation = clinical outcomes |
| **M12** Therapeutic discovery | #107 | `Partial` (PR1) | Therapeutic programme/target/intervention refs |
| **M13** Translational development | #109 | `Partial` (PR1) | Trial concept / biomarker development refs |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live scientific E2E |

**Verdict:** Eng substrate is sufficient for M14 **PR1 Clinical Evidence and RWE Contracts** (study / longitudinal observation / exposure / outcome / analysis-result envelopes + thin memory store + honesty gates). Scientific path for real outcomes analysis remains **Blocked** until an authorised clinical/research dataset with verified data-use permissions exists — **do not fabricate**.

---

## Data protection assessment

| Control | Status | Notes |
|---------|--------|-------|
| Unrestricted central patient DB | **Refused** | Explicit non-goal; contracts forbid central identifiable store claims |
| PHI in HSI product path | **Refused** (`cdsPhiBoundary` · clinical scaffold) | Synthetic / fixture / pseudonymous refs only in PR1 |
| Identifiable facts → curated KG | **Refused** (ARCH-002 Phase 3.7) | `graphPromotable: false`; patient_context never public biomedical |
| Pseudonymised ≠ non-personal | **Declared** | Honesty flag `pseudonymisedMayStillBePersonalData: true` |
| Direct-care clinical bridge | `Implemented but unverified` / deferred ops | `hsiClinicalBiologyBridge.ts` — grant verification / real FHIR adapter deferred |
| Federation / partner clinical connectors | `Missing` · partnerships `Blocked` | M9 federation not live; PR2 contracts declare `federationNotOperationalUnlessVerified` |
| FHIR R4 / OMOP / terminology mapping contracts | **PR2 merged** (#113) — fixture/contract only | No live connector claim; authorised dataset still **Blocked** |
| Longitudinal analysis contracts | **PR3 in-flight** — fixture/contract only | Temporal fail-closed; no live engine; authorised dataset still **Blocked** |
| Neon clinical PHI tables | **Not introduced** | PR1/PR2 contracts-first; red-wave only if/when authorised |

---

## Scientific validity assessment

| Claim class | PR1 stance |
|-------------|------------|
| Observational association | Allowed as declared ordinal / estimate envelope with limitations |
| Proven treatment effect / causal identification | **Forbidden** unless assumptions explicitly unsupported → `causalIdentificationClaimed: false` |
| Safety signal | Research envelope only — not ADR proof; not autonomous treatment change |
| Fabricated n / effects / curves | **Forbidden** (`inventedPatientCount` / `inventedEffectEstimate` always null) |
| Authorised live dataset analysis | **Blocked** — no verified authorised SSc/clinical dataset wired |

---

## Substrate inspection (file-level)

| Area | Files | Working status | M14 relevance |
|------|-------|----------------|---------------|
| CDS / PHI boundary | `cdsPhiBoundary.ts` · `docs/CDS_PHI_BOUNDARY.md` | `Verified operational` (refuse gates) | Reuse; never weaken |
| Clinical research scaffold | `clinicalResearchScaffold.ts` | `Partial` · synthetic only | Refuse live CDS/PHI |
| Synthetic FHIR / timeline | `clinicalSyntheticFhirNotes.ts` · `clinicalSyntheticTimeline.ts` | `Fixture-only` | Pattern reference — not live ingestion |
| Clinical↔biology bridge | `hsiClinicalBiologyBridge.ts` · ARCH-002 Phase 3.7 | `Implemented but unverified` · real FHIR `Missing` | Privacy pattern; no patient facts to KG |
| CT.gov / trial criteria | `clinicalTrialsGovLookup.ts` · N5 cohort criteria | `Partial` | Trial translation later (PR7/8) |
| M13 translational / trial concept | `translationalDevelopmentContracts.ts` | `Partial` (PR1) | Optional programme / trial-concept id links |
| M12 therapeutic IDs | `therapeuticDiscoveryDataContracts.ts` | `Partial` (PR1) | Optional therapeutic refs |
| M5 precision / biomarker | `precisionEvidenceContracts.ts` | `Partial` | Biomarker honesty later |
| Org / tenant ACL (M9) | `researchOrganisationTenantSecurity.ts` | `Partial` | Optional orgId / access class |
| Federation connectors | — | `Missing` | live connectors remain unverified |
| FHIR R4 / OMOP adapters | strategy docs + **PR2 contracts** | `Fixture-only` / `Implemented but unverified` (no live adapter) | `src/secureClinicalDataInteropContracts.ts` |
| Statistical analysis engine | governed compute (M10) orthogonal | `Partial` / not RWE | Analysis *result* envelopes in PR1 — no invented estimates |
| Research Decision Workbench | research workbench modules | `Partial` | **Out of PR1 UI** |
| Neon | red-wave; existing stores | `Partial` · staging `Blocked` (#5) | **No new migration in PR1** |
| Authorised clinical dataset | — | **Blocked** / **Missing** | Scientific path blocked until supplied |

**Persistence decision (PR1):** Validated contracts + thin in-memory store. **No Neon migration.** Durable clinical tables deferred until authorised write path + DPIA/governance exist on red-wave.

---

## Milestone 14 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + data protection + validity | This document + M1–M13 rollup | — | `Verified operational` (audit) | Keep updated | this file |
| **1** Clinical evidence / RWE contracts | Clinical scaffold · M9/M12/M13 ids · CDS boundary | **PR1 merged** ([#111](https://github.com/gnaneshwer23/hsi-core/pull/111)) — 7 focused tests + evaluation pack · `Fixture-only` / scientific path `Blocked` | Live authorised dataset analysis | `src/realWorldEvidenceContracts.ts` · `test/realWorldEvidenceContracts.test.ts` · `scripts/real-world-evidence-contracts.ts` · `evaluation/real-world-evidence/` |
| **2** Secure clinical data interoperability | FHIR strategy · Phase 3.7 bridge · PR1 RWE ids | **PR2 merged** ([#113](https://github.com/gnaneshwer23/hsi-core/pull/113)) — 7 focused tests + evaluation pack · `Fixture-only` / connectors `Missing` | Live FHIR/OMOP connectors · PHI ingestion | `src/secureClinicalDataInteropContracts.ts` · `test/secureClinicalDataInteropContracts.test.ts` · `scripts/secure-clinical-data-interop-contracts.ts` · `evaluation/secure-clinical-data-interop/` |
| **3** Longitudinal clinical intelligence | PR1 observation time fields · PR2 temporal alignment ids | `Missing` → **PR3 in-flight** ([#114](https://github.com/gnaneshwer23/hsi-core/pull/114)) — analysis specs · observation series · temporal integrity · results + thin store + evaluation pack · `Fixture-only` | Live longitudinal engine · fabricated trajectories | `src/longitudinalClinicalEvidenceContracts.ts` · `test/longitudinalClinicalEvidenceContracts.test.ts` · `scripts/longitudinal-clinical-evidence-contracts.ts` · `evaluation/longitudinal-clinical-evidence/` |
| **4** Reproducible cohort builder | N5 criteria hooks | `Partial` hooks | Attrition + disclosure controls | later PR4 |
| **5** Observational / causal research | — | `Missing` | Target-trial emulation with assumption checks | later PR5 |
| **6** Outcomes / safety intelligence | — | `Missing` | Signals ≠ ADR proof | later PR6 |
| **7** Biomarker + trial translation | M5 / M13 | `Partial` | Interaction evidence discipline | later PR7 |
| **8** Post-study learning | M8 monitoring · KG | `Partial` | No auto causal KG edges | later PR8 |
| **9** Workbench | Existing workbench | `Partial` | Thin surfacing — not new product | later PR9 |
| **10** Scientific / privacy validation | Fixtures · human queue | `Fixture-only` · dataset **Blocked** | Real authorised dataset required | later PR10 |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Study record** | Governed research study envelope | Unrestricted patient database |
| **Longitudinal observation** | Pseudonymous / cohort-scoped event | Identifiable patient timeline in KG |
| **Treatment exposure** | Declared exposure envelope | Treatment recommendation |
| **Outcome** | Defined outcome measurement | Efficacy proof |
| **Analysis result** | Estimand + methods + uncertainty + limitations | Causal identification / proven treatment effect |

---

## PR1 deliverable (Clinical Evidence and RWE Contracts)

**Clinical Evidence and RWE Contracts**

- Versioned **study record** with design, data source, controller/owner, permitted purpose, population definition, observation period, protocol/analysis versions, closed review lifecycle.  
- **Longitudinal clinical observation** with pseudonymous subject **or** cohort reference only; event/observation times; missingness; access classification; provenance; never identifiable PHI fields.  
- **Treatment exposure** with intervention identity, start/end, optional dose notes, uncertainty, concomitant context — never treatment directives.  
- **Outcome** with definition, method, baseline/follow-up, missingness, competing events, validation ordinal.  
- **Analysis result** with research question, estimand, cohort version, method, estimates **only when declared non-invented**, uncertainty, sensitivity notes, limitations; `observationalAssociationIsNotProvenTreatmentEffect: true`; `causalIdentificationClaimed: false`.  
- Honesty: no unrestricted patient DB; no PHI/CDS; pseudonymised may still be personal data; non-graph-promotable; dataset availability `blocked_no_authorised_clinical_dataset` unless explicitly declared fixture; Gate C / MoU denied; Neon red-wave; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** Live FHIR/OMOP, workbench UI, Neon migration, fabricated n/effects, merging this PR automatically (open for human review).

---

## PR2 deliverable (Secure Clinical Data Interoperability)

**Secure Clinical Data Interoperability Contracts** (stacks on [#111](https://github.com/gnaneshwer23/hsi-core/pull/111))

- **Data-source registration** for HL7 FHIR R4, OMOP CDM, clinical terminologies, research dataset schemas, and trial outcome formats — `liveConnectorOperational: false`; connector statuses stay contract/fixture/unverified/blocked.  
- **Data-use permission checks** with legal basis, research authorisation refs, purpose limitation, minimisation, export restrictions; fail-closed when legal basis missing or authorised dataset blocked.  
- **Schema mapping**, **terminology mapping**, **unit normalisation**, **temporal alignment** contracts — transforms/lookups/alignment marked non-operational.  
- **Data quality validation** without fabricated clinical results; **source provenance**; **access enforcement** (permit/deny); **retention and deletion** handling.  
- **Governance records**: legal basis / research authorisation; controller/processor roles; purpose limitation; access permissions; data minimisation; export restrictions; retention; audit history; `pseudonymisedMayStillBePersonalData: true`.  
- Optional links to PR1 RWE study ids / M9 org ids. Honesty: no unrestricted patient DB; no PHI/CDS/EHR write-back; federation not operational unless verified; Neon red-wave; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused fail-closed tests.

**Out of PR2:** Live connectors, workbench UI, Neon migration, fabricated clinical results, auto-merge.

---

## Dataset availability blocker

| Item | Status |
|------|--------|
| Authorised SSc / clinical research dataset with verified data-use permission | **Not supplied** → scientific path **Blocked** |
| Live FHIR / EHR adapter | **Missing** |
| Partner federation clinical connector | **Missing** / partnerships **Blocked** |

**Rule:** If no suitable dataset is available, report the blocker — do **not** fabricate clinical data or claim inaccessible datasets were analysed. Eng PR1 may still land contracts as fixture/engineering substrate.

---

## Human blockers (unchanged + M14-specific)

| Item | Status | Blocks for M14 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded clinical entailment |
| #4 SME gold | PARKED | Scored RWE usefulness |
| #5 Live journey | PARKED | Real authorised-dataset E2E |
| Authorised clinical dataset + DPIA / legal basis | Not supplied | Scientific completion of M14 |
| Federation / partner MoU | Not invented | Live multi-site clinical data |

---

## Anti-patterns (binding)

- Building an unrestricted central patient database.  
- Presenting observational associations as proven treatment effects.  
- Writing identifiable patient facts into the curated scientific KG.  
- Treating pseudonymisation as automatic de-identification / risk removal.  
- Inventing patient counts, effect estimates, survival curves, or safety rates.  
- Autonomous treatment recommendations or CDS.  
- Gate C auto-approve, invented MoU, autumn-snow Neon, PHI→LLM.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1 |
|------|--------|--------------|
| PHI/CDS refuse | `cdsPhiBoundary` · `clinicalResearchScaffold` | Live CDS engines |
| Privacy bridge pattern | `hsiClinicalBiologyBridge` (reference) | Copying patient facts to KG |
| Org ACL | M9 tenant security ids | Federation claims |
| Trial / biomarker refs | M13 translational contracts | Invented protocols |
| Therapeutic refs | M12 discovery contracts | Efficacy claims |
| Persistence | In-memory store + projection lines | New Neon clinical migration |

---

## PR3 deliverable (Longitudinal Clinical Evidence Model)

**Longitudinal Clinical Evidence Model** (stacks on merged [#111](https://github.com/gnaneshwer23/hsi-core/pull/111) + [#113](https://github.com/gnaneshwer23/hsi-core/pull/113))

- Versioned **analysis specs** for disease trajectories, laboratory trends, treatment timelines, clinical events, patient-reported outcomes, functional outcomes, organ-specific measures, and follow-up completeness.
- **Temporal anchor sets** distinguishing event time, record creation, ingestion, treatment initiation, baseline, follow-up, and outcome ascertainment — roles must remain distinct.
- **Fail-closed temporal integrity**: refuse using follow-up / outcome ascertainment (or later timestamps) to define earlier exposure or eligibility; refuse collapsed identical timestamps across roles.
- **Observation series** with irregular/sparse intervals and missing-data handling declared explicitly; point-level event vs record-creation vs ingestion order enforced.
- **Analysis results** with limitations; `observationalTrajectoryIsNotProvenTreatmentEffect: true`; `causalIdentificationClaimed: false`; invented n / effects / survival curves / fabricated trajectories always null.
- Optional links to PR1 RWE study/observation/exposure/outcome/analysis ids and PR2 interop data-source / temporal-alignment ids.
- Honesty: no unrestricted patient DB; no PHI/CDS; no live longitudinal engine claim; Neon red-wave; migration deferred.
- Thin in-memory store + offline evaluation pack + focused fail-closed tests.

**Out of PR3:** Live engines, workbench UI, Neon migration, fabricated trajectories/effects, cohort builder (PR4), auto-merge.

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#114](https://github.com/gnaneshwer23/hsi-core/pull/114) | M14 PR3 Longitudinal Clinical Evidence Model | `eng/m14-longitudinal-clinical-evidence` | **PR3 in-flight** — open for review; **do not auto-merge** |
| [#113](https://github.com/gnaneshwer23/hsi-core/pull/113) | M14 PR2 Secure Clinical Data Interoperability | merged → `33843eb` | Substrate |
| [#111](https://github.com/gnaneshwer23/hsi-core/pull/111) | M14 PR1 Clinical Evidence and RWE Contracts | merged → `19e0ff1` | Substrate |
| [#109](https://github.com/gnaneshwer23/hsi-core/pull/109) | M13 PR1 + M1–M13 rollup | merged → `344f450` | Substrate |
| [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) | M12 PR1 | merged → `7485bd4` | Substrate |
| [#110](https://github.com/gnaneshwer23/hsi-core/pull/110) | docs: mark M13 PR1 merged in rollup | merged → `c132abf` | Rollup tip honesty |

**Suggested next:** PR4 Reproducible Cohort Builder.
