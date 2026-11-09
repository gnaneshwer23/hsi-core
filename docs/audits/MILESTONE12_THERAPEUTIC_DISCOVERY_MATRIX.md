# Milestone 12 — Therapeutic Target Discovery, Drug Repurposing & Preclinical Decision Intelligence

**Brief:** HSI Milestone 12 — therapeutic programme / target candidate / compound-or-intervention / target–intervention assessment contracts without claiming efficacy, safety, clinical suitability, treatment recommendations, Gate C auto-approve, MoU, or PHI/CDS.  
**Status:** Phase 0 gap audit + PR1 (Therapeutic Discovery Data Contracts, [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) **merged** → `7485bd4`) — **not** drug discovery complete, **not** repurposing validated, **not** preclinical decision intelligence claimed.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `ebabd52c994fa1656d95bda096cd67e1ab90be6c` (post-#104 M10 stack on main)  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md`](./MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md) — M10 PR1–PR4 on `main` (#101/#105/#103/#104)  
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md) — org/tenant + collaborative contracts on `main`  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md) — precision contracts; HCA/GEO `not_connected`  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md) — translational programme / failure taxonomy  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) — hypothesis registry  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  

**Out of PR1:** ChEMBL live pulls, repurposing ranking engine, workbench UI, fabricated target scores, clinical / treatment recommendations, Neon therapeutic migrations, claiming drug efficacy/safety/clinical suitability from associations.

**M11 note:** No M11 Biological Model Registry PR was opened on this branch of work; treat multiscale simulation registry as `Missing` for M12 dependency purposes. Do not block M12 on M11.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M12 requirement |
| `Blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · **association ≠ causation / efficacy / safety / clinical suitability** · biological plausibility ≠ predictive validity · fixtures ≠ live · CI ≠ scientific validity · **no treatment recommendations** · no fabricated target scores · ChEMBL/Reactome stub ids ≠ live pharmacology · HSI decides which hypotheses deserve investigation — **does not manufacture certainty** · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M12)

| Principle | Implication for therapeutic discovery |
|-----------|--------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Therapeutic contracts stay HSI-owned; OT / UniProt / ChEMBL / RDKit / TDC adapters are optional, failure-isolated connections — not a monolith drug engine |
| **ARCH-002** Living Health KG ownership | Target / intervention assessments never auto-promote to curated KG; review candidates stay non-graph-promotable until human review |
| **ARCH-003** Authenticated research API | Trusted session / grants only for prioritisation / acceptance; never trust client-claimed “efficacious” or “recommended” |

---

## Phase 0 — M1–M11 dependency status

| Milestone | On audited `main` | Status | Therapeutic-discovery readiness |
|-----------|-------------------|--------|----------------------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`) | `Partial` · live journey `Blocked` (#5) · passages `Blocked` (#2) | Public identity refs OK; OT score ≠ target validation |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction (#92) | `Partial` | Competing-explanation inputs later for target discrimination |
| **M3** Hypothesis / experiment | Registry (#91); N7 ledger eng | `Partial` · real observation `Blocked` | **Reuse** hypothesis ids on programmes / targets |
| **M4** Translational / failure | Contracts (#93) + failure taxonomy (#94) | `Partial` | **Reuse** translational programme contract ids; ChEMBL stub-only |
| **M5** Precision translational | Precision contracts (#95); HCA/GEO `not_connected` | `Partial` | No patient-level eligibility / treatment paths |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96) | `Partial` | Optional `investigationId` scope |
| **M7** Scientific evaluation | Benchmark registry (#97); scored evaluators `Missing` | `Partial` · science `Blocked` | Orthogonal; CI ≠ therapeutic validity |
| **M8** Living / incremental monitoring | Incremental monitoring (#98) | `Partial` | Monitoring ≠ target discovery |
| **M9** Collaboration / federation | Org/tenant (#99) + collaborative (#100) | `Partial` · federation `Missing` | Optional `orgId` scope |
| **M10** Experimental discovery | Lifecycle (#101) · design (#105) · protocol (#103) · compute (#104) | `Partial` | Downstream experiment bind later — not PR1 |
| **M11** Multiscale simulation | No M11 PR opened in this delivery | `Missing` | Do not claim simulation→therapeutic validation |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live E2E therapeutic validation claims |

**Verdict:** Eng substrate is sufficient for M12 **PR1 Therapeutic Discovery Data Contracts** (programme / target / intervention-kind discrimination / target–intervention assessment + thin memory store + honesty gates). Do **not** mark therapeutic discovery, drug repurposing, or preclinical decision intelligence complete from CI green. M1–M10 remain **Partial** (eng) / **not scientifically validated**; M11 `Missing`.

---

## Substrate inspection (file-level)

| Area | Files | Working status | M12 relevance |
|------|-------|----------------|---------------|
| Open Targets associations | `src/evidence/openTargetsLookup.ts` | `Partial` | Disease→target identity; **score ≠ efficacy / validation** |
| UniProt metadata | `src/evidence/uniprotMetadataLookup.ts` | `Partial` | Protein identity for target candidates |
| Europe PMC | bibliographic + dynamic retrieval | `Partial` | Literature locators only |
| Ontology prefixes | `src/hsiOntologyRegistry.ts` | `Partial` | ChEMBL / Reactome **prefix stubs**; live fetch `Missing` |
| Translational contracts (M4) | `translationalEvidenceContracts.ts` · failure taxonomy | `Partial` | Programme layer reuse; ChEMBL stub helpers |
| Precision / omics (M5) | `precisionEvidenceContracts.ts` | `Partial` · HCA/GEO `not_connected` | No patient therapeutics |
| Hypothesis registry (M3) | `hypothesisRegistry.ts` | `Implemented but unverified` (science) | Link hypothesis ids |
| Investigation (M6) | `investigationOrchestrationContracts.ts` | `Partial` | Optional investigation scope |
| Org / collab (M9) | `researchOrganisationTenantSecurity.ts` · collaborative contracts | `Partial` | Optional orgId |
| Experimental lifecycle (M10) | lifecycle / design / protocol / governed compute contracts | `Partial` | Later bind assessments → experiments |
| Pharmacology adapters | RDKit / TDC / REINVENT4 / OpenMM adapter spikes | `Fixture-only` / proposals | **Out of PR1** live chem / ADMET |
| Knowledge graph | living health KG · domain graph | `Partial` | Assessments non-graph-promotable |
| Workbench | research workbench / connected workbench | `Partial` | **Out of PR1 UI** |
| Multiscale / biological model registry (M11) | — | `Missing` | No simulation validation claims |
| Neon | red-wave project; existing grants | `Partial` · staging `Blocked` (#5) | Contracts-first; **no new migration in PR1** |

**Persistence decision (PR1):** Prefer **validated contracts + thin in-memory store** projecting onto existing hypothesis / investigation / org / translational programme ids. **No new Neon migration** in PR1. A backwards-compatible therapeutic-discovery table migration is deferred until a trusted write path needs durable rows on red-wave.

---

## Milestone 12 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + dependency + architecture plan | This document | — | `Verified operational` (audit) | Keep updated as PRs land | this file |
| **1** Therapeutic discovery data contracts | M3/M4/M6/M9 ids · OT/UniProt/ChEMBL stubs | **Partial** on `main` ([#107](https://github.com/gnaneshwer23/hsi-core/pull/107) → `7485bd4`) — 7 focused tests + evaluation pack | Programme · target · intervention-kind · assessment with honesty | `src/therapeuticDiscoveryDataContracts.ts` · `test/therapeuticDiscoveryDataContracts.test.ts` · `scripts/therapeutic-discovery-data-contracts.ts` · `evaluation/therapeutic-discovery-data/` |
| **2** Pharmacology and compound data integration | RDKit/TDC stubs · ChEMBL prefix | `Fixture-only` / stub | Bounded public chem metadata without live ChEMBL unless authorised | future PR2 |
| **3** Target prioritisation / discrimination | M2 contradiction · M10 design | `Partial` substrate | Ordinal investigation priority without invented scores | later |
| **4** Repurposing candidate envelopes | Approved-medicine kind in PR1 | `Missing` as engine | Catalogue + assessment only — never treatment recommend | later |
| **5** Preclinical decision intelligence bind | M4 failure taxonomy · M10 protocol | `Partial` | Human-gated decision records — not auto certainty | later |
| **6+** Workbench surfacing | Research Decision Workbench | `Partial` | Thin surfacing — not a new product | later |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Therapeutic programme** | Scoped research programme / indication context | Efficacy claim or treatment plan |
| **Target candidate** | Gene/protein/pathway candidate for investigation | Validated target or priority score |
| **Compound / intervention** | Molecular compound **or** modality **or** experimental intervention **or** approved medicine | Treatment recommendation |
| **Target–intervention assessment** | Honest associative / mechanistic investigation envelope | Efficacy / safety / clinical suitability |

---

## PR1 deliverable (Therapeutic Discovery Data Contracts)

**Therapeutic Discovery Data Contracts**

- Versioned **therapeutic programme** contracts with closed lifecycle; optional links to M3 hypothesis ids, M6 investigation id, M9 org id, M4 translational programme contract id.  
- **Target candidate** contracts with biological-plausibility notes that explicitly deny predictive validity; `inventedPriorityScore` always null.  
- **Compound or intervention** contracts with closed `interventionKind`: `molecular_compound` · `modality` · `experimental_intervention` · `approved_medicine` (required fields differ by kind; approved medicine ≠ recommendation).  
- **Target–intervention assessment** contracts with conclusion kinds that never claim efficacy/safety/clinical suitability; require remaining uncertainties + info-before-further-work; human-only accept/reject.  
- ChEMBL / Reactome identity refs as **stub/prefix only** — no live ChEMBL pull.  
- Honesty: association ≠ causation/efficacy/safety/clinical suitability; no fabricated scores; no treatment recommendations; no repurposing engine; no workbench UI; agents draft / researchers decide; does not manufacture certainty; Gate C / MoU / PHI/CDS denied; Neon red-wave only; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** ChEMBL live pulls, repurposing engine, workbench UI, fabricated target scores, clinical recommendations, Neon migrations.

---

## Integration plan (post-PR1)

1. **PR2 — Pharmacology and Compound Data Integration:** bounded public compound metadata (RDKit / authorised chem sources) without inventing ADMET efficacy or live ChEMBL unless separately authorised.  
2. **PR3 — Target prioritisation / discrimination:** ordinal investigation priority using M2/M10 signals — never LLM-as-score.  
3. **PR4 — Repurposing candidate envelopes:** approved-medicine catalogue + assessment honesty — never treatment recommendation.  
4. **PR5 — Preclinical decision bind:** human-gated decision records linking M4 failure taxonomy + M10 experiment contracts.  
5. Optional M11 biological-model links only after M11 registry exists — never claim simulation validates therapeutics from contracts alone.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M12 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded therapeutic entailment |
| #4 SME gold | PARKED | Scored therapeutic usefulness |
| #5 Live journey | PARKED | Real programme→target→assessment E2E |
| ChEMBL / partner pharmacology agreements | Not supplied | Live compound enrichment |
| M11 biological model registry | Missing | Simulation-backed therapeutic claims |

---

## Anti-patterns (binding)

- Treating Open Targets / association scores as target validation, efficacy, or safety.  
- Inventing numeric priority / efficacy / safety scores.  
- Collapsing molecular compound / modality / experimental intervention / approved medicine.  
- Issuing treatment recommendations or clinical suitability claims.  
- Auto-promoting assessments into curated KG.  
- Claiming ChEMBL live integration from stub identifiers.  
- Gate C auto-approve, invented MoU, PHI/CDS, autumn-snow Neon.

---

## Reusable libraries (contracts-first)

| Need | Prefer | Avoid in PR1 |
|------|--------|--------------|
| Identity stubs | `hsiOntologyRegistry` · M4 chembl/reactome stub helpers · OT/UniProt lookups | Live ChEMBL / Reactome fetch |
| Programme context | M4 translational contracts | Invented proprietary programmes |
| Hypothesis / investigation / org | M3 / M6 / M9 ids | Duplicate ledgers |
| Chem fixtures | RDKit public SMILES fixtures (reference only) | REINVENT generative clinic paths |
| Persistence | In-memory store + projection lines | New Neon migration |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) | M12 PR1 Therapeutic Discovery Data Contracts | `eng/m12-therapeutic-discovery-data-contracts` | **Merged** → `7485bd4` |
| #104 | M10 PR4 Governed Computational Execution | merged → `ebabd52` | Orthogonal substrate now on main |
| #102 | M10 PR2 (original stacked) | closed without merge | **Abandoned** after base-branch delete; content restored via [#105](https://github.com/gnaneshwer23/hsi-core/pull/105) |
| #105 | M10 PR2 Experiment Design and Prioritisation | merged | Restored PR2 |
| #103 | M10 PR3 Protocol Intelligence | merged | |
| #101 | M10 PR1 Experimental Lifecycle | merged | |
