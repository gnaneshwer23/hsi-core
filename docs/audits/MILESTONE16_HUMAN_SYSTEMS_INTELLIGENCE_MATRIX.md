# Milestone 16 — Human Systems Intelligence, Cross-Disease Mechanisms & Multimorbidity Discovery

**Brief:** HSI Milestone 16 — governed **human systems** research-intelligence contracts for cross-disease investigation, cross-disease mechanism relationships, organ-system relationships, multimorbidity research context, and research-scoped systems simulation — composing M15 HDI / CSOL / (optional) PCRM ids and earlier ontology / provenance / RWE hooks — **without** diagnosis, treatment selection, clinical decision-making, whole-body simulation claims, auto-transfer of mechanisms across diseases, duplicate entity registries, PHI/CDS, Gate C auto-approve, MoU invention, or claiming a live M11 multiscale engine.  
**Status:** Phase 0 gap audit + **PR1 Human Systems Data Contracts** ([#124](https://github.com/gnaneshwer23/hsi-core/pull/124) in-flight) + **PR2 Cross-Disease Mechanism Intelligence** ([#126](https://github.com/gnaneshwer23/hsi-core/pull/126) stacked on #124) + **PR3 Cross-Scale Biological Relationships** ([#127](https://github.com/gnaneshwer23/hsi-core/pull/127) stacked on #126) + **PR4 Immune–Metabolic–Microbiome Intelligence** ([#129](https://github.com/gnaneshwer23/hsi-core/pull/129) stacked on #127) — **not** multimorbidity discovery complete, **not** whole-body simulation authorised, **not** M16 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `873ca494edf6280742309b0fc309142878f4fc43` (post-#122 tip)  
**Tip commit:** `873ca49 Add M15 patient-contextualised research model contracts (#122)`  
**HSI Neon:** red-wave only (`human super intelligence` / `hsi-neon-project` / `ep-hsi-production…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** Prefer composing via IDs/refs already on `main` (M15 PR1–PR6 [#116](https://github.com/gnaneshwer23/hsi-core/pull/116)–[#122](https://github.com/gnaneshwer23/hsi-core/pull/122); M14 [#111](https://github.com/gnaneshwer23/hsi-core/pull/111)/[#113](https://github.com/gnaneshwer23/hsi-core/pull/113)/[#114](https://github.com/gnaneshwer23/hsi-core/pull/114)/[#115](https://github.com/gnaneshwer23/hsi-core/pull/115)) and M16 PR1–PR3 envelopes. **Stack PR4 on #127** while open. **Do not stack** on unmerged M15 PR7 ([#123](https://github.com/gnaneshwer23/hsi-core/pull/123)) or PR8 ([#125](https://github.com/gnaneshwer23/hsi-core/pull/125)).

**Cross-links (do not contradict):**

- [`MILESTONE15_HUMAN_DISEASE_INTELLIGENCE_MATRIX.md`](./MILESTONE15_HUMAN_DISEASE_INTELLIGENCE_MATRIX.md) — HDI / CBC / LDSM / CSOL / PCDM / PCRM / MSI track  
- [`MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md`](./MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md)  
- [`MILESTONES_M1_M13_STATUS_ROLLUP.md`](./MILESTONES_M1_M13_STATUS_ROLLUP.md) — M1–M13 eng status (M11 **Skipped**/`Missing`)  
- [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md)  
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md) — org/tenant; federation **not live**  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  

**Out of PR1:** Cross-disease mechanism intelligence engines (PR2), multimorbidity discovery analytics (later), organ-system coupling engines, workbench UI, Neon migration, invented mechanisms/statistics, whole-body simulation claims, auto-transfer of mechanisms across diseases, diagnosis / treatment selection / CDS.

**Out of PR2:** Cross-scale biological relationships (PR3), multimorbidity discovery analytics, organ-system coupling engines, live mechanism transfer, workbench UI, Neon migration, invented mechanisms/statistics, whole-body simulation claims, diagnosis / treatment selection / CDS.

**Out of PR3:** Immune–metabolic–microbiome intelligence (PR4), multimorbidity discovery analytics, organ-system coupling engines, workbench UI, Neon migration, invented mechanisms/statistics, auto-merge.

**Out of PR4:** Multimorbidity discovery analytics (PR5), organ-system coupling engines, workbench UI, Neon migration, invented mechanisms/statistics, auto-merge.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live / privacy correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M16 requirement |
| `Blocked` | Cannot complete without human/config gate, authorised dataset, or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |
| `Skipped` | Milestone deliberately not built (e.g. M11) — do not claim |

Honesty freeze: research intelligence only · **not diagnosis / treatment selection / clinical decision-making** · **shared gene ≠ shared causal mechanism** · **co-occurrence ≠ causation** · **pathway enrichment ≠ activation** · no duplicate entity registries · no whole-body simulation claim · no auto-transfer of mechanisms across diseases · no PHI/CDS · no Gate C auto-approve · no invented MoU · fixtures ≠ live · CI ≠ scientific validity · M11 multiscale engine **not claimed** · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M16)

| Principle | Implication for human systems intelligence |
|-----------|--------------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Cross-disease / multimorbidity / systems-simulation contracts stay HSI-owned; optional M15/M14 id links are failure-isolated — not a monolith clinical OS |
| **ARCH-002** Living Health KG ownership | No duplicate entity registries; reuse `hsiOntologyRegistry` / CSOL / provenance patterns; restricted patient facts never auto-promote; inferred cross-disease links stay non-graph-promotable by default |
| **ARCH-003** Authenticated research API | Trusted session / grants only; never trust client-claimed “shared mechanism proven”, fabricated multimorbidity stats, or PHI payloads |

---

## Phase 0 — M1–M15 dependency status (post-#122)

| Milestone | On audited `main` | Status | M16 readiness |
|-----------|-------------------|--------|---------------|
| **M1** Biomedical evidence / KG | Europe PMC / OT / UniProt / CT.gov / dynamic persistence | `Partial` · live `Blocked` (#5) | Public literature refs OK; no invented shared-mechanism stats |
| **M2** Contextual / contradiction / provenance | #90 / #92 | `Partial` | Later contradiction on cross-disease claims (PR2+) |
| **M3** Hypothesis / experiment | #91 · N7 | `Partial` · observation `Blocked` | Optional hypothesis bind later |
| **M4** Translational / failure | #93 / #94 | `Partial` | Translational risk context later |
| **M5** Precision / biomarker / omics honesty | #95 · HCA/GEO `not_connected` | `Partial` | Biomarker honesty; pathway enrichment ≠ activation |
| **M6** Investigation orchestration | #96 | `Partial` | Optional investigation scope ids |
| **M7** Scientific evaluation / review | #97 | `Partial` · science `Blocked` | Orthogonal; CI ≠ validity |
| **M8** Living / monitoring | #98 | `Partial` | Continuous systems monitoring later |
| **M9** Collaboration / federation | #99 / #100 | `Partial` · federation **Missing** · partnerships **Blocked** | Org ACL hooks; **federation not live** |
| **M10** Experimental discovery | #101 / #105 / #103 / #104 | `Partial` · lab **Missing** | Experiment bind later — not invented wet-lab transfer |
| **M11** Multiscale simulation | — | `Skipped` / `Missing` | **Do not claim live multiscale / whole-body engine** |
| **M12** Therapeutic discovery | #107 | `Partial` (PR1) | Optional therapeutic programme/target refs |
| **M13** Translational development | #109 | `Partial` (PR1) | Optional trial-concept / biomarker refs |
| **M14** RWE / clinical outcomes / cohort | #111 / #113 / #114 / #115 | `Partial` (PR1–PR4 on `main`) | Optional RWE/LCE/cohort ids for multimorbidity framing |
| **M15** Human disease intelligence | #116–#120, #122 merged · **#123 PR7 in-flight** · PR8 may be local/in-flight | `Partial` (PR1–PR6 on `main`) · PR7 `in-flight` · PR8 `Missing`/local | **Compose HDI ctx / CSOL / optional PCRM ids already on main**; do **not** require #123 types for PR1 |
| Disease / phenotype | HDI disease context · CBC · PCDM phenotype strata | `Partial` / `Fixture-only` | Reuse disease context ids — no second disease registry |
| Cell / tissue / organ | CSOL scales · LDSM organ trends · immune/gut packs | `Partial` / `Fixture-only` | Organ-system relationship envelopes; no duplicate ontology |
| Mechanism | Immune mechanism investigation · CSOL coupling · CBC established_mechanism layer | `Partial` | Cross-disease mechanism **relationship** classifications in PR1; intelligence engines in PR2 |
| Immune / gut–immune–metabolic | gutImmunePack · immune packs | `Partial` / `Fixture-only` | Optional axis labels; no invented transfer |
| Workbench | research workbench modules | `Partial` | **Out of PR1 UI** |
| Neon | red-wave; existing stores | `Partial` · staging `Blocked` (#5) | **No new migration in PR1** |
| Authorised clinical/research dataset | — | **Blocked** / **Missing** | Scientific path blocked until supplied |

**Verdict:** Eng substrate is sufficient for M16 **PR1 Human Systems Data Contracts** (cross-disease investigation · cross-disease mechanism relationship · organ-system relationship · multimorbidity research context · research-scoped systems simulation + thin memory store + honesty gates), composing IDs already on `main`. Scientific path for real multimorbidity / shared-mechanism validation remains **Blocked** until an authorised research dataset with verified data-use permissions exists — **do not invent mechanisms or statistics**. M15 [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) (PR7) is open and **orthogonal** to PR1 — no branch rewrite / no stack required.

---

## Data protection assessment

| Control | Status | Notes |
|---------|--------|-------|
| Diagnosis / treatment selection / clinical decision-making | **Refused** | Research intelligence only |
| Duplicate entity registries | **Refused** | Reuse ontology / HDI / CSOL / provenance ids |
| PHI / CDS | **Refused** (`cdsPhiBoundary`) | Boundary intact |
| Shared gene → shared causal mechanism auto-claim | **Refused** | Relationship classification honesty |
| Co-occurrence → causation auto-claim | **Refused** | Multimorbidity honesty |
| Pathway enrichment → activation auto-claim | **Refused** | Mechanism relationship honesty |
| Whole-body simulation claim | **Refused** | Systems simulation research-scoped only |
| Auto-transfer of mechanisms across diseases | **Refused** | Explicit classification + limitations required |
| M11 live multiscale engine | **Not claimed** | M11 skipped/missing |
| Neon clinical PHI tables | **Not introduced** | PR1 contracts-first; red-wave only if/when authorised |

---

## Scientific readiness assessment

| Claim class | PR1 stance |
|-------------|------------|
| Cross-disease investigation envelope | Allowed as governed research framing across ≥2 disease contexts |
| Cross-disease mechanism **relationship** with explicit classification | Allowed when classifications preserve gene≠mechanism, enrichment≠activation, co-occurrence≠causation |
| Organ-system relationship envelope | Allowed as declared research relationship — not validated whole-body coupling |
| Multimorbidity research context | Allowed as co-occurrence / comorbidity **research framing** — not causal disease network truth |
| Systems simulation (research-scoped) | Allowed with explicit validation scope; `wholeBodySimulationClaimed: false` |
| Invented shared-mechanism statistics | **Forbidden** |
| Diagnosis / treatment selection | **Forbidden** |
| Auto-transfer of mechanisms across diseases | **Forbidden** |
| Authorised live multimorbidity analysis | **Blocked** — no verified authorised dataset wired |

---

## Substrate inspection (file-level)

| Area | Files | Working status | M16 relevance |
|------|-------|----------------|---------------|
| CDS / PHI boundary | `cdsPhiBoundary.ts` · `docs/CDS_PHI_BOUNDARY.md` | `Verified operational` (refuse gates) | Reuse; never weaken |
| Ontology registry | `hsiOntologyRegistry.ts` | `Partial` | **Reuse** — no duplicate entity registry |
| Correction / provenance | `correctionProvenance.ts` · CSOL provenance kinds | `Partial` | Optional provenance refs |
| M15 PR1 HDI | `humanDiseaseIntelligenceContracts.ts` | **Merged** (#116) · `Fixture-only` | Required disease-context id composition (`hsi-hdi-ctx-*`) |
| M15 PR2 CBC | `clinicalBiologicalContextContracts.ts` | **Merged** (#117) | Optional integrated-context ids |
| M15 PR3 LDSM | `longitudinalDiseaseStateModellingContracts.ts` | **Merged** (#118) | Optional organ-trend / trajectory refs |
| M15 PR4 CSOL | `crossScaleOntologyModelLinkageContracts.ts` | **Merged** (#119) | Organ / organ_system scale honesty; coupling pattern |
| M15 PR5 PCDM | `populationCohortDiseaseModelsContracts.ts` | **Merged** (#120) | Optional phenotype / organ-outcome refs |
| M15 PR6 PCRM | `patientContextualisedResearchModelsContracts.ts` | **Merged** (#122) | Optional digital-patient / estimate refs |
| M15 PR7 MSI | (open [#123](https://github.com/gnaneshwer23/hsi-core/pull/123)) | `in-flight` | **Do not require** for PR1; compose later via ids if merged |
| M14 RWE / LCE / cohort | RWE / LCE / RCB contracts | `Partial` | Optional multimorbidity population framing ids |
| Immune / gut–metabolic | `gutImmunePack.ts` · immune packs | `Partial` / `Fixture-only` | Optional axis labels |
| M11 multiscale | — | `Skipped` / `Missing` | Systems sim must declare engine absent / not whole-body |
| Research Decision Workbench | research workbench modules | `Partial` | **Out of PR1 UI** |
| Neon | red-wave | `Partial` | **No new migration in PR1** |

**Persistence decision (PR1):** Validated contracts + thin in-memory store. **No Neon migration.** Durable systems/multimorbidity tables deferred until authorised write path + DPIA/governance exist on red-wave.

---

## Milestone 16 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + scientific readiness | This document + M1–M15 deps | — | `Verified operational` (audit) | Keep updated | this file |
| **1** Human systems data contracts | M15 HDI/CSOL ids · ontology registry · CDS boundary · M14 optional ids | **PR1 in-flight** ([#124](https://github.com/gnaneshwer23/hsi-core/pull/124)) — 7 focused tests + evaluation pack · cross-disease investigation · cross-disease mechanism relationship (classifications) · organ-system relationship · multimorbidity research context · research-scoped systems simulation + thin store · `Fixture-only` / scientific path `Blocked` | Live mechanism transfer · whole-body sim · invented stats · workbench UI | `src/humanSystemsIntelligenceContracts.ts` · `test/humanSystemsIntelligenceContracts.test.ts` · `scripts/human-systems-intelligence-contracts.ts` · `evaluation/human-systems-intelligence/` |
| **2** Cross-disease mechanism intelligence | PR1 investigation / CMR envelopes · HDI disease contexts | **PR2 in-flight** ([#126](https://github.com/gnaneshwer23/hsi-core/pull/126) stacked on [#124](https://github.com/gnaneshwer23/hsi-core/pull/124)) — 7 focused tests + evaluation pack · 10-step comparative workflow · mechanism classifications · thin store · `Fixture-only` / scientific path `Blocked` | Live mechanism transfer · invented stats · workbench UI | `src/crossDiseaseMechanismIntelligenceContracts.ts` · `test/crossDiseaseMechanismIntelligenceContracts.test.ts` · `scripts/cross-disease-mechanism-intelligence-contracts.ts` · `evaluation/cross-disease-mechanism-intelligence/` |
| **3** Cross-scale biological relationships | PR1 organ-system · PR2 comparative profiles · CSOL | **PR3 in-flight** ([#127](https://github.com/gnaneshwer23/hsi-core/pull/127) stacked on [#126](https://github.com/gnaneshwer23/hsi-core/pull/126)) — 7 focused tests + evaluation pack · physiology scales · entity mapping · mechanism provenance · context/directionality/temporal/uncertainty/alternatives · thin store · `Fixture-only` / scientific path `Blocked` | Whole-body physiology claim · molecular→organ outcome without intermediates · all-edges-causal collapse · workbench UI | `src/crossScaleBiologicalRelationshipsContracts.ts` · `test/crossScaleBiologicalRelationshipsContracts.test.ts` · `scripts/cross-scale-biological-relationships-contracts.ts` · `evaluation/cross-scale-biological-relationships/` |
| **4** Immune–metabolic–microbiome intelligence | gutImmunePack · PR3 scales · immune packs | **PR4 in-flight** ([#129](https://github.com/gnaneshwer23/hsi-core/pull/129) stacked on [#127](https://github.com/gnaneshwer23/hsi-core/pull/127)) — 7 focused tests + evaluation pack · pathway comparison · metabolite–host · microbial function↔host pathway · inflammation–metabolic phenotype · disease-context · contradiction analysis · thin store · `Fixture-only` / scientific path `Blocked` | Complete unsupported gut–immune–metabolic chains · composition→causality · animal→human auto-translation · workbench UI | `src/immuneMetabolicMicrobiomeIntelligenceContracts.ts` · `test/immuneMetabolicMicrobiomeIntelligenceContracts.test.ts` · `scripts/immune-metabolic-microbiome-intelligence-contracts.ts` · `evaluation/immune-metabolic-microbiome-intelligence/` |
| **5** Multimorbidity discovery analytics | PR1 multimorbidity context | `Missing` | Co-occurrence analytics with causation honesty | later PR5 |
| **6** Organ-system coupling intelligence | PR1 organ-system relationships · CSOL · PR3 | `Missing` | Coupling analysis without whole-body claim | later |
| **7** Systems simulation runner (research) | PR1 systems simulation · M11 **Skipped** | `Missing` | Fixture/harness runner only; no whole-body | later |
| **8** Workbench surfaces | research workbench | `Partial` | UI deferred | later |
| **9** Authorised-dataset scientific validation | — | `Blocked` | No invented mechanisms/stats as validation | later |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Cross-disease investigation** | Governed research framing across ≥2 disease contexts | Clinical care pathway / diagnosis engine |
| **Cross-disease mechanism relationship** | Declared relationship with explicit classification | Proven shared causal mechanism / auto-transfer |
| **Shared gene association** | Gene overlap association | Shared causal mechanism |
| **Pathway enrichment association** | Enrichment signal association | Pathway activation / causal activation |
| **Co-occurrence association** | Observed / declared co-occurrence | Causation / treatment directive |
| **Organ-system relationship** | Declared organ-system research relationship | Validated whole-body physiological model |
| **Multimorbidity research context** | Multi-disease research framing | Causal multimorbidity network truth / diagnosis |
| **Systems simulation (research-scoped)** | Bounded research simulation envelope with validation scope | Whole-body simulation / clinical decision engine |

---

## PR1 deliverable (Human Systems Data Contracts)

**Human Systems Data Contracts**

- Versioned **cross-disease investigation** composing ≥2 `hsi-hdi-ctx-*` disease contexts; scientific question; closed review lifecycle; refuse single-disease-only investigations masquerading as cross-disease.  
- **Cross-disease mechanism relationship** with closed **relationship classifications** (shared gene association · pathway enrichment · cell/phenotype association · co-occurrence · putative shared-mechanism hypothesis · antagonistic hypothesis · disease-specific · uncertain · unsupported) and binding honesty flags: `sharedGeneIsNotSharedCausalMechanism`, `pathwayEnrichmentIsNotActivation`, `coOccurrenceIsNotCausation`, `autoTransferAcrossDiseases: false`.  
- **Organ-system relationship** with declared organ-system pair + relationship kind; optional CSOL / ontology refs; `wholeBodyPhysiologyClaimed: false`.  
- **Multimorbidity research context** framing multiple disease foci with co-occurrence honesty; optional M14 RWE/LCE/cohort ids; not causal network truth.  
- **Systems simulation** — research-scoped; explicit **validation scope**; `wholeBodySimulationClaimed: false`; `liveMultiscaleEngineOperational: false`; `m11SimulationClaimed: false`; blocked when claiming scientific validation without authorised dataset.  
- Honesty: research intelligence only; no diagnosis/treatment selection/CDS; no duplicate registries; Neon red-wave; migration deferred; fixtures ≠ scientific validation.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** PR2 Cross-Disease Mechanism Intelligence, workbench UI, Neon migration, invented mechanisms/stats, auto-merge.

---

## PR2 deliverable (Cross-Disease Mechanism Intelligence)

**Cross-Disease Mechanism Intelligence**

- Define **diseases being compared** (≥2 `hsi-hdi-ctx-*`) composing PR1 `hsi-hsys-inv-*` investigation ids; refuse single-disease comparisons and auto-transfer.  
- **Resolve disease identifiers** with closed resolution statuses; fail-closed when dataset blocked.  
- **Retrieve approved mechanisms** with preserved species / tissue / cell state / disease stage / experimental context; optional PR1 `hsi-hsys-cmr-*` composition.  
- **Identify shared genes/proteins/pathways** under closed mechanism-intelligence classifications (`shared_molecular_association` · `shared_pathway_involvement` · `shared_functional_mechanism` · `disease_specific` · `context_dependent` · `computational_similarity` · `unvalidated_mechanistic_hypothesis`).  
- **Compare cell/tissue contexts** without collapsing context-dependent differences.  
- **Retrieve supporting** and **opposing** evidence as distinct polarities; refuse invented statistics.  
- **Evaluate directionality** without claiming proven causation / causal mechanism.  
- **Identify disease-specific differences** (`disease_specific` / `context_dependent`) — not auto-transferred across diseases.  
- Produce **reviewable comparative mechanism profile** with closed lifecycle and human acceptance gate.  
- Binding honesty: shared gene ≠ shared causal mechanism; pathway enrichment ≠ activation; no auto-transfer; experimental context preserved; fixtures ≠ scientific validation.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI.

**Out of PR2:** PR3 Cross-Scale Biological Relationships, multimorbidity discovery analytics, workbench UI, Neon migration, invented mechanisms/stats, auto-merge.

---

## PR3 deliverable (Cross-Scale Biological Relationships)

**Cross-Scale Biological Relationships**

- Extend Human Biology / Physiology Graph contracts across closed scales: molecular · cellular · tissue · organ · organ_system · clinical_phenotype · disease_outcome.  
- **Cross-scale entity mapping** with evidence modes (`direct_mechanistic_evidence` · `indirect_inference` · `association_only` · `unsupported`) and edge kinds that do **not** auto-become causal links.  
- **Mechanism provenance** composing optional CSOL / CDMI refs; refuse upgrading indirect/association mappings to direct without validated path.  
- **Context-dependent relationship modelling**, **directionality**, **temporal relationships**, **biological uncertainty**, and **alternative explanation detection**.  
- Binding honesty: direct ≠ indirect; molecular association ≠ organ/disease outcome; organ/disease-outcome inference requires validated intermediates; graph edge ≠ causal link; `wholeBodyPhysiologyClaimed: false`.  
- Compose M15 CSOL (`hsi-csol-*`), M16 PR1 HSI (`hsi-hsys-*`), M16 PR2 CDMI (`hsi-cdmi-*`) via id refs — no duplicate ontology registry.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no PHI/CDS.

**Out of PR3:** PR4 Immune–Metabolic–Microbiome Intelligence, multimorbidity discovery analytics, organ-system coupling engines, workbench UI, Neon migration, invented mechanisms/stats, auto-merge.

---

## PR4 deliverable (Immune–Metabolic–Microbiome Intelligence)

**Immune–Metabolic–Microbiome Intelligence**

- Extend Gut–Immune–Metabolic Graph contracts across closed axis bands: immune · metabolic · microbiome · inflammation_phenotype · host_pathway.  
- **Immune vs metabolic pathway comparison** with closed comparison outcomes; composition correlation ≠ causality.  
- **Metabolite–host interaction** with translation statuses; animal evidence ≠ automatic human translation.  
- **Microbial function ↔ host pathway mapping** distinguishing taxonomic association from functional evidence; refuse complete gut–immune–metabolic chains from unsupported links.  
- **Inflammation–metabolic phenotype relationships**, **disease-context comparisons** (≥2 `hsi-hdi-ctx-*`), and **evidence contradiction analysis** preserving closed evidence distinctions (taxonomic · functional · metabolite measurement · host molecular response · experimental causal · human observational).  
- Compose optional gutImmunePack schema label, M16 PR3 CSBR (`hsi-csbr-*`), M16 PR1 HSI (`hsi-hsys-*`), M16 PR2 CDMI (`hsi-cdmi-*`) via id refs — no duplicate ontology registry.  
- Thin in-memory store + offline evaluation pack + focused tests. No Neon migration; no workbench UI; no PHI/CDS.

**Out of PR4:** PR5 Multimorbidity Cohort Research / discovery analytics, organ-system coupling engines, workbench UI, Neon migration, invented mechanisms/stats, auto-merge.

---

## File-level integration plan (PR1)

| Deliverable | New / reuse | Integration |
|-------------|-------------|-------------|
| Contracts module | **New** `src/humanSystemsIntelligenceContracts.ts` | Draft/validate/transition + memory store + pack + persistence lines |
| Focused tests | **New** `test/humanSystemsIntelligenceContracts.test.ts` | Honesty gates for classifications, multimorbidity, systems sim |
| Offline pack script | **New** `scripts/human-systems-intelligence-contracts.ts` | Write `evaluation/human-systems-intelligence/` |
| package.json scripts | **Update** | `hsi:human-systems:prepare` / `hsi:human-systems:check` |
| HDI disease contexts | **Reuse** id pattern `hsi-hdi-ctx-*` | Composition only — no fork of HDI types |
| CSOL / ontology | **Reuse** optional `hsi-csol-*` / ontology namespace refs | No duplicate registry |
| M14 RWE/LCE/cohort | **Reuse** optional id refs | Multimorbidity population framing |
| M15 PR7 MSI (#123) | **Avoid dependency** | Optional later composition after merge |
| Neon | **None** | Migration deferred |

---

## Dataset availability blocker

| Item | Status |
|------|--------|
| Authorised clinical/research dataset with verified data-use permission | **Not supplied** → scientific path **Blocked** |
| Live cross-disease mechanism validation | **Missing** |
| Live whole-body / multiscale simulation engine (M11) | **Skipped** / **Missing** |
| M15 PR7 multiscale simulation integration | **in-flight** [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) — not required for PR1 |

**Rule:** If no suitable authorised dataset is available, report the blocker — do **not** invent shared-mechanism statistics or present fixture multimorbidity as scientific validation. Eng PR1 may still land contracts as fixture/engineering substrate.

---

## Human blockers (unchanged + M16-specific)

| Item | Status | Blocks for M16 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded shared-mechanism entailment |
| #4 SME gold | PARKED | Scored cross-disease usefulness |
| #5 Live journey | PARKED | Real authorised-dataset E2E |
| Authorised research dataset + DPIA / legal basis | Not supplied | Scientific completion of M16 |
| M11 multiscale engine | Skipped/Missing | Live systems / whole-body simulation claims |
| Federation / partner MoU | Not invented | Live multi-site multimorbidity research |

---

## Anti-patterns (binding)

- Diagnosis, treatment selection, or clinical decision-making from systems envelopes.  
- Claiming shared gene association as shared causal mechanism.  
- Claiming pathway enrichment as pathway activation.  
- Claiming co-occurrence as causation.  
- Auto-transferring mechanisms across diseases without explicit classification + limitations.  
- Creating a duplicate disease / gene / organ entity registry.  
- Claiming whole-body simulation or a live M11 multiscale engine.  
- Inventing multimorbidity statistics or shared-mechanism effect sizes.  
- Stacking M16 PR1 on unmerged M15 PR7/PR8 when main already has required ids.  
- Gate C auto-approve, invented MoU, autumn-snow Neon, PHI→LLM.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1 |
|------|--------|--------------|
| PHI/CDS refuse | `cdsPhiBoundary` · `clinicalResearchScaffold` | Live CDS engines |
| Disease context ids | `humanDiseaseIntelligenceContracts` (`hsi-hdi-ctx-*`) | Forking HDI into a second disease registry |
| Cross-scale / organ honesty | `crossScaleOntologyModelLinkageContracts` · `hsiOntologyRegistry` | Duplicate ontology; molecular→organ auto-causal |
| Optional PCRM / PCDM / CBC / LDSM | M15 contract id refs | Requiring #123 MSI types |
| M14 RWE / LCE / cohort | RWE / LCE / RCB id refs | Live EHR queries |
| Persistence | In-memory store + projection lines | New Neon clinical migration |

---

## Layer distinctions (binding for PR4)

| Distinction | Meaning | Must not collapse into |
|-------------|---------|------------------------|
| **Microbial taxonomic association** | Taxon presence / abundance association | Microbial functional evidence / causal host pathway |
| **Microbial functional evidence** | Declared functional capacity / activity | Complete gut–immune–metabolic causal chain |
| **Metabolite measurement** | Measured metabolite signal | Causal host response / treatment directive |
| **Host molecular response** | Declared host molecular association | Proven experimental causation |
| **Experimental causal evidence** | Declared experimental effect (often animal/in vitro) | Automatic human translation |
| **Human observational association** | Human observational co-occurrence | Causation / composition causality |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#129](https://github.com/gnaneshwer23/hsi-core/pull/129) | M16 PR4 Immune–Metabolic–Microbiome Intelligence | `eng/m16-immune-metabolic-microbiome-intelligence` | **PR4 in-flight** — stacked on [#127](https://github.com/gnaneshwer23/hsi-core/pull/127); 7 focused tests + evaluation pack; not stacked on [#123](https://github.com/gnaneshwer23/hsi-core/pull/123)/[#125](https://github.com/gnaneshwer23/hsi-core/pull/125); open for review; **do not auto-merge** |
| [#127](https://github.com/gnaneshwer23/hsi-core/pull/127) | M16 PR3 Cross-Scale Biological Relationships | `eng/m16-cross-scale-biological-relationships` | **PR3 in-flight** — stacked on [#126](https://github.com/gnaneshwer23/hsi-core/pull/126); 7 focused tests + evaluation pack; not stacked on [#123](https://github.com/gnaneshwer23/hsi-core/pull/123)/[#125](https://github.com/gnaneshwer23/hsi-core/pull/125); open for review; **do not auto-merge** |
| [#126](https://github.com/gnaneshwer23/hsi-core/pull/126) | M16 PR2 Cross-Disease Mechanism Intelligence | `eng/m16-cross-disease-mechanism-intelligence` | **PR2 in-flight** — stacked on [#124](https://github.com/gnaneshwer23/hsi-core/pull/124); 7 focused tests + evaluation pack; not stacked on [#123](https://github.com/gnaneshwer23/hsi-core/pull/123); open for review; **do not auto-merge** |
| [#124](https://github.com/gnaneshwer23/hsi-core/pull/124) | M16 PR1 Human Systems Data Contracts | `eng/m16-human-systems-data-contracts` | **PR1 in-flight** — targets `origin/main` @ `873ca49`; 7 focused tests + evaluation pack; not stacked on [#123](https://github.com/gnaneshwer23/hsi-core/pull/123); open for review; **do not auto-merge** |
| [#125](https://github.com/gnaneshwer23/hsi-core/pull/125) | M15 PR8 Precision Scenario and Missing-Information Intelligence | `eng/m15-precision-scenario-missing-info` | **Open / orthogonal** — avoid rewriting; M16 PR1–PR4 do not depend on it |
| [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) | M15 PR7 Multiscale Simulation Integration | `eng/m15-multiscale-simulation-integration` | **Open / orthogonal** — avoid rewriting; M16 PR1–PR4 do not depend on it |
| [#122](https://github.com/gnaneshwer23/hsi-core/pull/122) | M15 PR6 Patient-Contextualised Research Models | merged → `873ca49` | Substrate |
| [#120](https://github.com/gnaneshwer23/hsi-core/pull/120) | M15 PR5 Population and Cohort Disease Models | merged → `ebc96c8` | Substrate |
| [#119](https://github.com/gnaneshwer23/hsi-core/pull/119) | M15 PR4 Cross-Scale Ontology and Model Linkage | merged → `fae37c6` | Substrate |
| [#118](https://github.com/gnaneshwer23/hsi-core/pull/118) | M15 PR3 Longitudinal Disease State Modelling | merged → `ecf8326` | Substrate |
| [#117](https://github.com/gnaneshwer23/hsi-core/pull/117) | M15 PR2 Clinical and Biological Context Integration | merged → `15b8f8f` | Substrate |
| [#116](https://github.com/gnaneshwer23/hsi-core/pull/116) | M15 PR1 Integrated Disease Intelligence Contracts | merged → `8fb6aac` | Substrate |

**Merge order:** M16 PR1 against `main` (independent of M15 #123/#125) → PR2 (stacked on #124) → PR3 (stacked on #126) → **PR4 Immune–Metabolic–Microbiome Intelligence** ([#129](https://github.com/gnaneshwer23/hsi-core/pull/129), stacked on #127) → next **PR5 Multimorbidity Cohort Research**.

**Suggested next:** PR5 Multimorbidity Cohort Research.

**M15 left open:** [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) PR7 and [#125](https://github.com/gnaneshwer23/hsi-core/pull/125) PR8 (orthogonal). Unrelated open PRs #71 / #61 / #60 / #34 / #15 left untouched.
