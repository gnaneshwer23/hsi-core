# Milestone 10 — Autonomous Experimental Design, Laboratory Integration & Closed-Loop Discovery

**Brief:** HSI Milestone 10 — extend M3 hypothesis/experiment ledger, M6 investigation orchestration, and M9 org/collaboration hooks into **experimental lifecycle contracts** (proposal → versioned protocol → execution → results layers) without inventing wet-lab observations, lab instrument control, closed-loop discovery completion, Gate C auto-approve, MoU, or PHI/CDS.  
**Status:** Phase 0 gap audit + PR1 (Experimental Lifecycle Contracts, [#101](https://github.com/gnaneshwer23/hsi-core/pull/101) in-flight) + PR2 (Experiment Design and Prioritisation, [#102](https://github.com/gnaneshwer23/hsi-core/pull/102) in-flight) + PR3 (Protocol Intelligence and Scientific Approval, [#103](https://github.com/gnaneshwer23/hsi-core/pull/103) in-flight) — **not** closed-loop discovery complete, **not** laboratory integration live, **not** autonomous experiment execution claimed.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `2388387071fcc798b15f86f9540b8d040afc3f75` (PR1 later rebased onto #100 → `6eb37fe`)  
**Tip commit:** `2388387 Add M9 Phase 0 matrix and research organisation tenant security. (#99)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md) — M9 Phase 0 + PR1 on `main` (#99); PR2 collaborative investigations **merged** (#100 → `6eb37fe`)  
- [`MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md`](./MILESTONE8_LIVING_SCIENTIFIC_INTELLIGENCE_MATRIX.md) — M8 Phase 0 + PR1 on `main` (#98)  
- [`MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md`](./MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md) — M7 Phase 0 + PR1 registry on `main` (#97)  
- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md) — M6 Phase 0 + PR1 on `main` (#96)  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md)  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md)  
- [`../engineering/N7_EXPERIMENT_LEDGER_STATUS.md`](../engineering/N7_EXPERIMENT_LEDGER_STATUS.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  

**Out of PR1:** Experiment design / prioritisation engine, lab adapters / instrument control, computational pipeline execution, Research Decision Workbench UI for closed-loop, Neon experiment-lifecycle migrations, fabricating observations/results, claiming closed-loop discovery complete, Gate C auto-approve, MoU invention, PHI/CDS.

**Out of PR2:** Protocol intelligence / scientific approval workflow (PR3), lab adapters / instrument control, computational pipeline execution, workbench UI, Neon migrations, inventing information-gain probabilities or unjustified power/sample-size claims, fabricating results, AI self-approval / auto-execution, Gate C auto-approve, MoU invention, PHI/CDS.

**Out of PR3:** Computational execution pipelines (PR4), lab adapters / instrument control, result fabrication, workbench UI, Neon migrations, closed-loop claim, inventing unjustified power/n, AI self-approval, automatic instrument instructions, Gate C auto-approve, MoU invention, PHI/CDS.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M10 requirement |
| `Blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live / wet-lab · CI ≠ scientific validity · **agents propose; researchers approve** · **no AI self-approval of experiments** · proposal ≠ approved plan ≠ executed procedure ≠ raw observation ≠ derived result ≠ interpretation · real observation acceptance remains BLOCKED without authorised data · Neon red-wave only · do not claim laboratory connectors or federation live without verified wiring · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M10)

| Principle | Implication for experimental discovery |
|-----------|----------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Experiment contracts stay HSI-owned; lab / LIMS / instrument adapters are optional, failure-isolated connections — not a monolith |
| **ARCH-002** Living Health KG ownership | Experimental results never auto-promote to curated KG; review candidates stay non-graph-promotable until human review |
| **ARCH-003** Authenticated research API | Trusted session / grants only for approvals and execution records; never trust client-claimed “approved” or fabricated observations |

---

## Phase 0 — M1–M9 dependency status (post-#99)

| Milestone | On audited `main` | Status | Experimental-discovery readiness |
|-----------|-------------------|--------|----------------------------------|
| **M1** Biomedical evidence | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`); living-evidence expand; CT.gov lookup | `Partial` · live journey `Blocked` (#5) · passages `Blocked` (#2) | Public refs OK for proposal evidence links; no wet-lab claims |
| **M2** Contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `Partial` | Contradiction → falsifier inputs for proposals later |
| **M3** Hypothesis / experiment | Registry contracts (#91); N7 experiment ledger eng | `Partial` · real observation `Blocked` | **Primary reuse** — hypothesis ids + N7 prediction/protocol/outcome lineage |
| **M4** Translational / failure | Contracts (#93) + failure taxonomy (#94) | `Partial` | Programme context refs only in PR1 |
| **M5** Precision translational | Precision contracts (#95); HCA/GEO `not_connected` | `Partial` | No patient-level experimental eligibility |
| **M6** Investigation orchestration | Capability registry + investigation contracts (#96); planner/router `Missing` | `Partial` | Investigation id hooks for proposal / execution scope |
| **M7** Scientific evaluation | Phase 0 + benchmark registry (#97); scored evaluators `Missing` | `Partial` · science `Blocked` | Benchmarks orthogonal; experiment CI ≠ scientific validity |
| **M8** Living / incremental monitoring | Phase 0 + incremental monitoring (#98); change-detection `Missing` | `Partial` | Monitoring ≠ experiment execution |
| **M9** Collaboration / federation | Phase 0 + org/tenant security (#99); collaborative contracts **in-flight** (#100) | `Partial` · federation `Missing` · partnerships `Blocked` | Org/tenant may scope proposals later; **federation not live** |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live E2E experimental validation and scored gold |

**Verdict:** Eng substrate is sufficient for M10 **PR1 Experimental Lifecycle Contracts** (proposal / versioned protocol / execution / results-layer distinctions + thin memory store + honesty gates). Do **not** mark autonomous experimental design, laboratory integration, or closed-loop discovery complete from CI green. M1–M9 remain **Partial** (eng) / **not scientifically validated**.

**#99 merge:** Squash-merged to `main` at `2388387071fcc798b15f86f9540b8d040afc3f75` (CI green: verify + site-deployment + Vercel). **#100** (M9 PR2 Collaborative Investigation Contracts) left open — CI still running / mergeable=CONFLICTING after #99; do not block M10. Unrelated opens (#71/#61/#60/#34/#15) skipped.

---

## Substrate inspection (file-level)

| Area | Files | Working status | M10 relevance |
|------|-------|----------------|---------------|
| Experiment ledger (N7) | `src/evidence/experimentLedger.ts` · `src/db/experimentLedgerStore.ts` · `017` · `docs/engineering/N7_EXPERIMENT_LEDGER_STATUS.md` | `Partial` eng · real observation `Blocked` · `Fixture-only` outcomes | **Reuse** prediction freeze / protocol bind / outcome classes — do not fork; M10 layers sit *above* N7 |
| Hypothesis registry (M3) | `src/evidence/hypothesisRegistry.ts` | `Implemented but unverified` (science) · eng `Partial` | Proposal → hypothesis id links; review ≠ experimental validation |
| Investigation orchestration (M6) | `src/evidence/investigationOrchestrationContracts.ts` | `Partial` | Optional `investigationId` scope |
| Research decisions / workbench | `src/researchWorkbench.ts` · `src/researchConnectedWorkbench.ts` · site ScientificResearchWorkbench | `Partial` | Later thin surfacing — **out of PR1 UI** |
| Evidence provenance | `src/evidence/evidenceLedger.ts` · dynamic persistence `018` | `Partial` | Evidence refs on proposals only |
| Knowledge graph | living health KG · ontology registry · domain graph | `Partial` | Results stay non-graph-promotable |
| Scientific review | reviewer authority `005` · interrogative review states | `Partial` | Researcher approval gates; AI cannot self-approve |
| Computational analysis | specialised model adapter proposals (Discovery JSON) · no live pipeline runner as product | `Partial` / adapter proposals `Fixture-only` | **Out of PR1** — do not execute pipelines |
| Dataset ingestion | research evidence corpus · dynamic retrieval | `Partial` · live `Blocked` (#5) | No invented lab datasets |
| Durable execution | `hsiAgentDurableCheckpoint.ts` · Neon `009` | `Partial` · staging `Blocked` (#5) | Execution *record* refs only in PR1 — not Temporal/lab runners |
| Org / federation (M9) | `src/researchOrganisationTenantSecurity.ts` (#99); collaborative contracts (#100 in-flight) | Org contracts `Partial` · federation `Missing` · partnerships `Blocked` | Optional org scope later; **do not claim federation live** |
| Lab interfaces / instruments | — | `Missing` | **No verified connectors** — adapters deferred |
| Benchmarks (M7) | `src/evidence/scientificBenchmarkRegistry.ts` | `Partial` | Orthogonal eval; not experiment execution |

**Persistence decision (PR1):** Prefer **validated contracts + thin in-memory store** projecting onto existing hypothesis / investigation / N7 experiment ids. **No new Neon migration** in PR1 — contracts-first like M9 PR1. A backwards-compatible experiment-lifecycle table migration is deferred until a trusted write path needs durable rows on red-wave.

---

## Milestone 10 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + dependency + integration plan | This document | — | `Verified operational` (audit) | Keep updated as PRs land | this file |
| **1** Experimental lifecycle contracts | N7 ledger · M3 hypothesis · M6 investigation | `Missing` → **PR1 in-flight** ([#101](https://github.com/gnaneshwer23/hsi-core/pull/101) / `eng/m10-experimental-lifecycle-contracts`) — 9 focused tests + evaluation pack | Proposal · versioned protocol · execution · results layers with honesty | `src/experimentalLifecycleContracts.ts` · `test/experimentalLifecycleContracts.test.ts` · `scripts/experimental-lifecycle-contracts.ts` · `evaluation/experimental-lifecycle/` |
| **2** Experiment design and prioritisation | Hypothesis registry · gap/oppose · investigation objectives · PR1 proposals | `Missing` → **PR2 in-flight** ([#102](https://github.com/gnaneshwer23/hsi-core/pull/102) / `eng/m10-experiment-design-prioritisation`; **depends on #101**) — 7 focused tests + evaluation pack | Rank/discriminate approaches without LLM probability, invented info-gain, or auto-approve | `src/experimentDesignPrioritisationContracts.ts` · `test/experimentDesignPrioritisationContracts.test.ts` · `scripts/experiment-design-prioritisation-contracts.ts` · `evaluation/experiment-design-prioritisation/` |
| **3** Protocol intelligence and scientific approval | PR1 versioned protocol · PR2 design specs · M3 hypothesis | `Missing` → **PR3 in-flight** ([#103](https://github.com/gnaneshwer23/hsi-core/pull/103) / `eng/m10-protocol-intelligence-scientific-approval`; **depends on #101 + #102**) — 8 focused tests + evaluation pack | Protocol drafting from approved specs; methods/controls/metadata/SAP/QC/safety-ethics; versioning; reviewer comments; approve/reject; change control — no AI self-approval, no auto instrument instructions | `src/protocolIntelligenceScientificApprovalContracts.ts` · `test/protocolIntelligenceScientificApprovalContracts.test.ts` · `scripts/protocol-intelligence-scientific-approval-contracts.ts` · `evaluation/protocol-intelligence-scientific-approval/` |
| **4** Governed computational execution | Adapter proposals · durable checkpoints · PR3 approved protocols | `Partial` / `Missing` as lifecycle consumer | Record planned compute runs — do not invent outputs | later (PR4) |
| **5** Lab adapter contracts (read-only first) | — | `Missing` | Verified connector stubs only when real interfaces exist | later |
| **6** Closed-loop feedback (human-gated) | N7 outcomes · review candidates · KG | `Missing` | Route authorised results → hypothesis update **with human approval** | later |
| **7+** Workbench / instrument ops UI | Research Decision Workbench | `Partial` (existing) | Thin surfacing — not a new product | later |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Proposal** | Agent- or researcher-authored experiment idea awaiting human approval | Approved plan / execution / results |
| **Approved plan** | Researcher-approved proposal bound to a versioned protocol | Execution or observation |
| **Executed procedure** | Record that a protocol version was (or is being) run — may be fixture / planned / blocked | Raw observation content |
| **Raw observation** | Authorised or fixture-declared measured artifacts | Derived result / interpretation |
| **Derived result** | Processed / analysed summary from declared observations | Interpretation / graph fact |
| **Interpretation** | Human- or review-gated meaning; never auto graph-promote | Curated KG claim |

---

## PR1 deliverable (Experimental Lifecycle Contracts)

**Experimental Lifecycle Contracts**

- Experiment **proposal** contracts with closed lifecycle and fail-closed transitions.  
- Versioned **protocol** contracts (immutable version lineage; deviations recorded).  
- **Execution** records referencing a protocol version — no invented lab runs.  
- **Results** envelopes that separate raw observations / derived results / interpretations.  
- Links to existing hypothesis registry ids, investigation ids, and N7 experiment ledger ids.  
- Honesty: agents propose; researchers approve; AI cannot self-approve; no fabricated observations; fixtures declare honesty; graphPromotable stays false; Gate C / MoU / PHI/CDS denied; Neon red-wave only; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** design/prioritisation engine, lab adapters, pipeline execution, workbench UI, Neon migrations, closed-loop claims.

---

## PR2 deliverable (this increment)

**Experiment Design and Prioritisation** — stacked on PR1 (#101); **#101 must merge first** (or keep this branch stacked on `eng/m10-experimental-lifecycle-contracts`).

- Design packages bound to M3 hypothesis ids (optional M6 investigation id; optional PR1 proposal links on approaches).  
- Per-hypothesis design intelligence: falsifiable predictions, competing explanations, discriminating questions, category-tagged candidate approaches (public dataset reanalysis, single-cell/spatial omics, proteomic/metabolomic, computational pathway, in vitro mechanistic, ex vivo, approved observational cohort, independent replication, biomarker validation).  
- Approach fields: experimental model, controls, **negative controls**, measurements, confounders, methodological limitations, feasibility (ordinal), discrimination strength (ordinal), support/challenge interpretations, **null-result interpretation**, remaining uncertainties, info required before execution, reproducibility notes.  
- Transparent prioritisation: `discrimination_then_feasibility_ordinal` comparison rows — what each experiment tests; which competing explanations it distinguishes; support/challenge/null interpretations; remaining uncertainties; pre-execution info.  
- Honesty: no invented information-gain probabilities; no unjustified power/sample-size claims; no optimise-solely-for-predicted-positives; no fabricated results; no pipeline/lab/workbench claims; prioritisation ≠ execution approval (PR1 researcher gate); AI cannot self-approve; Gate C / MoU / PHI/CDS denied; Neon red-wave only; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR2:** Protocol intelligence / scientific approval (PR3), lab adapters, pipeline execution, workbench UI, Neon migrations, closed-loop claims.

---

## PR3 deliverable (this increment)

**Protocol Intelligence and Scientific Approval** — stacked on PR2 (#102) / PR1 (#101); **#101 then #102 must merge first** (or keep this branch stacked on `eng/m10-experiment-design-prioritisation`).

- Protocol drafting from approved experiment specifications (PR1 proposal and/or PR2 design package + approach).  
- Method and control documentation (including negative controls and procedural limitations).  
- Required metadata definitions with honest missing-value reasons.  
- Statistical analysis plan with closed justification kinds — **no unjustified power/n inventions**.  
- Quality-control requirements with acceptance criteria.  
- Safety and ethics review requirements as external governance **records** (do not invent MoU / Gate C auto-approve).  
- Protocol versioning with parent lineage + change-control history.  
- Reviewer comments; researcher approval and rejection.  
- Approval rules: authorised human researchers only; AI cannot approve its own experimental protocol; **do not** automatically issue executable instrument instructions.  
- Honesty: no pipelines/lab adapters/workbench/Neon migration/closed-loop; PHI/CDS denied; Neon red-wave only.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR3:** Computational execution pipelines (PR4), lab adapters, result fabrication, workbench UI, Neon migrations, closed-loop claims.

---

## Integration plan (post-PR1)

1. **PR2 — Experiment Design and Prioritisation:** consume hypothesis + falsifier/competing-explanation signals; propose category-tagged approaches with controls/measurements/confounders/limitations/feasibility; rank by discrimination-then-feasibility ordinal without LLM-as-probability, invented info-gain, or auto-approve. **Stacks on #101** — merge PR1 first or keep stacked.  
2. **PR3 — Protocol Intelligence and Scientific Approval (this increment):** deepen versioned protocol quality / scientific approval without AI self-approval or auto instrument instructions. **Stacks on #102** — merge #101 → #102 first or keep stacked.  
3. **PR4 — Governed Computational Execution (next):** bind approved protocols to planned compute runs without inventing outputs.  
4. Keep N7 as the prediction→outcome ledger; M10 lifecycle references N7 ids rather than duplicating outcome classes.  
5. Lab adapters only after a verified connector exists — never claim instrument control from contracts alone.  
6. Closed-loop feedback requires authorised observations + human review before hypothesis/KG updates.  
7. Optional org/tenant scoping via #100 collaborative contracts — fail-closed cross-tenant denial retained.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M10 |
|------|--------|----------------|
| #2 Rights | PARKED | Passage-grounded experimental entailment |
| #4 SME gold | PARKED | Scored experiment usefulness |
| #5 Live journey | PARKED | Real investigation→hypothesis→experiment E2E |
| N7 real observation | BLOCKED | Non-fixture experimental validation |
| Lab / partner agreements | Not supplied | Live laboratory integration |
| M9 #100 merge | **Merged** → `6eb37fe` | Collaborative scoping contracts available; federation still not live |

---

## PR tracking

| PR | Title | Branch | State |
|----|-------|--------|-------|
| [#103](https://github.com/gnaneshwer23/hsi-core/pull/103) | M10 PR3 Protocol Intelligence and Scientific Approval | `eng/m10-protocol-intelligence-scientific-approval` | **PR3 in-flight** — stacked on #102; depends on #101+#102; do **not** merge in this delivery |
| [#102](https://github.com/gnaneshwer23/hsi-core/pull/102) | M10 PR2 Experiment Design and Prioritisation | `eng/m10-experiment-design-prioritisation` | **PR2 in-flight** — stacked on #101; **must merge before PR3** |
| [#101](https://github.com/gnaneshwer23/hsi-core/pull/101) | M10 PR1 Experimental Lifecycle Contracts | `eng/m10-experimental-lifecycle-contracts` | **PR1 in-flight** — **must merge before PR2** (or keep stack) |
| #100 | M9 Collaborative Investigation Contracts | `eng/m9-collaborative-investigation-contracts` | **Merged** → `6eb37fe` |
| #99 | M9 Research Organisations and Tenant Security | `eng/m9-research-org-tenant-security` | **Merged** → `2388387` |
