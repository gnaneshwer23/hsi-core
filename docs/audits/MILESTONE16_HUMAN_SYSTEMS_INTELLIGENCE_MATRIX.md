# Milestone 16 — Human Systems Intelligence, Cross-Disease Mechanisms & Multimorbidity Discovery

**Brief:** HSI Milestone 16 — governed **human systems** research-intelligence contracts for cross-disease investigation, cross-disease mechanism relationships, organ-system relationships, multimorbidity research context, and research-scoped systems simulation — composing M15 HDI / CSOL / (optional) PCRM ids and earlier ontology / provenance / RWE hooks — **without** diagnosis, treatment selection, clinical decision-making, whole-body simulation claims, auto-transfer of mechanisms across diseases, duplicate entity registries, PHI/CDS, Gate C auto-approve, MoU invention, or claiming a live M11 multiscale engine.  
**Status:** Phase 0 gap audit + **PR1 Human Systems Data Contracts** (this branch) — **not** cross-disease mechanism intelligence complete, **not** multimorbidity discovery complete, **not** whole-body simulation authorised, **not** M16 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `873ca494edf6280742309b0fc309142878f4fc43` (post-#122 tip)  
**Tip commit:** `873ca49 Add M15 patient-contextualised research model contracts (#122)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** Prefer composing via IDs/refs already on `main` (M15 PR1–PR6 [#116](https://github.com/gnaneshwer23/hsi-core/pull/116)–[#122](https://github.com/gnaneshwer23/hsi-core/pull/122); M14 [#111](https://github.com/gnaneshwer23/hsi-core/pull/111)/[#113](https://github.com/gnaneshwer23/hsi-core/pull/113)/[#114](https://github.com/gnaneshwer23/hsi-core/pull/114)/[#115](https://github.com/gnaneshwer23/hsi-core/pull/115)). **Do not stack** on unmerged M15 PR7 ([#123](https://github.com/gnaneshwer23/hsi-core/pull/123)) or PR8 unless types are required — they are not required for PR1.

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
| **1** Human systems data contracts | M15 HDI/CSOL ids · ontology registry · CDS boundary · M14 optional ids | **PR1 in-flight** — cross-disease investigation · cross-disease mechanism relationship (classifications) · organ-system relationship · multimorbidity research context · research-scoped systems simulation + thin store · `Fixture-only` / scientific path `Blocked` | Live mechanism transfer · whole-body sim · invented stats · workbench UI | `src/humanSystemsIntelligenceContracts.ts` · `test/humanSystemsIntelligenceContracts.test.ts` · `scripts/human-systems-intelligence-contracts.ts` · `evaluation/human-systems-intelligence/` |
| **2** Cross-disease mechanism intelligence | PR1 relationship envelopes | `Missing` | Mechanism intelligence engines / comparison without auto-transfer | later PR2 Cross-Disease Mechanism Intelligence |
| **3** Multimorbidity discovery analytics | PR1 multimorbidity context | `Missing` | Co-occurrence analytics with causation honesty | later |
| **4** Organ-system coupling intelligence | PR1 organ-system relationships · CSOL | `Missing` | Coupling analysis without whole-body claim | later |
| **5** Systems simulation runner (research) | PR1 systems simulation · M11 **Skipped** | `Missing` | Fixture/harness runner only; no whole-body | later |
| **6** Workbench surfaces | research workbench | `Partial` | UI deferred | later |
| **7** Authorised-dataset scientific validation | — | `Blocked` | No invented mechanisms/stats as validation | later |

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

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| (this PR) | M16 PR1 Human Systems Data Contracts | `eng/m16-human-systems-data-contracts` | **PR1 in-flight** — targets `origin/main` @ `873ca49`; not stacked on [#123](https://github.com/gnaneshwer23/hsi-core/pull/123); open for review; **do not auto-merge** |
| [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) | M15 PR7 Multiscale Simulation Integration | `eng/m15-multiscale-simulation-integration` | **Open / orthogonal** — avoid rewriting; M16 PR1 does not depend on it |
| [#122](https://github.com/gnaneshwer23/hsi-core/pull/122) | M15 PR6 Patient-Contextualised Research Models | merged → `873ca49` | Substrate |
| [#120](https://github.com/gnaneshwer23/hsi-core/pull/120) | M15 PR5 Population and Cohort Disease Models | merged → `ebc96c8` | Substrate |
| [#119](https://github.com/gnaneshwer23/hsi-core/pull/119) | M15 PR4 Cross-Scale Ontology and Model Linkage | merged → `fae37c6` | Substrate |
| [#118](https://github.com/gnaneshwer23/hsi-core/pull/118) | M15 PR3 Longitudinal Disease State Modelling | merged → `ecf8326` | Substrate |
| [#117](https://github.com/gnaneshwer23/hsi-core/pull/117) | M15 PR2 Clinical and Biological Context Integration | merged → `15b8f8f` | Substrate |
| [#116](https://github.com/gnaneshwer23/hsi-core/pull/116) | M15 PR1 Integrated Disease Intelligence Contracts | merged → `8fb6aac` | Substrate |

**Merge order:** M16 PR1 against `main` (independent of M15 #123) → next **PR2 Cross-Disease Mechanism Intelligence**.

**Suggested next:** PR2 Cross-Disease Mechanism Intelligence.

**M15 left open:** [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) PR7 (orthogonal). Unrelated open PRs #71 / #61 / #60 / #34 / #15 left untouched. Local/unmerged M15 PR8 precision-scenario work (if any) left untouched — not rewritten.
