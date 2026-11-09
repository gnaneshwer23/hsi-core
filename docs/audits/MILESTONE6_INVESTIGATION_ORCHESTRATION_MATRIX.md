# Milestone 6 — Autonomous Scientific Investigation & Discovery Orchestration

**Brief:** HSI Milestone 6 — integrate M1–M5 capabilities under one investigation contract + orchestrated execution (extend existing substrate; no new agent framework / parallel KG / separate platform)  
**Status:** Phase 0 gap audit + PR1 (Capability Registry and Investigation Contracts) — **not** production readiness, **not** scientific validity, **not** M6 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `4d7e83a0a8ce0dcc419d2d45f3e32094ee37064d`  
**Tip commit:** `4d7e83a Add M5 Phase 0 matrix and precision evidence contracts. (#95)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) — M2 `partial` (#90 / #92)  
- [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) — M3 PR1 registry on `main` (#91); multi-hypothesis eval **not** started  
- [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md) — M4 Phase 0–2 on `main` (#93 / #94); Phases 3–8 open  
- [`MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md`](./MILESTONE5_PRECISION_TRANSLATIONAL_MATRIX.md) — M5 Phase 0 + PR1 on `main` (#95); Phases 2–9 open  
- [`MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md`](./MILESTONE7_SCIENTIFIC_EVALUATION_MATRIX.md) — M7 Phase 0 + PR1 registry (orthogonal evaluation infrastructure; do not contradict)  
- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md)  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md)  
- [`../engineering/HSI_CAPABILITY_REGISTER_2026-11-08.md`](../engineering/HSI_CAPABILITY_REGISTER_2026-11-08.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../strategy/HSI_AGENT_ORCHESTRATION_STRATEGY.md`](../strategy/HSI_AGENT_ORCHESTRATION_STRATEGY.md)  

**Out of PR1:** Scientific Research Planner / task graph (PR2), capability router, full investigation workspace UI, Gate C auto-approve, MoU, PHI/CDS, invented SSc E2E success, new agent framework, parallel KG.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised in a current library/product path |
| `partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures / seeded packs |
| `blocked` | Cannot complete without human/config gate or unfinished prior milestone |
| `missing` | No meaningful implementation for this M6 requirement |
| `unverified` | Shape or stub exists; scientific / live correctness not verified |
| `in-flight` | Open PR not yet on `main` — document honestly |

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live · CI ≠ scientific validity · planner output ≠ scientific plan approval · orchestration resume ≠ automatic scientific approval · never invent live SSc E2E success · auth/review/provenance intact · Neon red-wave only.

---

## Phase 0 — verify M1–M5 status (honest, post-#95)

| Milestone | On audited `main` | Status | Notes for M6 |
|-----------|-------------------|--------|--------------|
| **M1** retrieval / OT / UniProt / provenance | Europe PMC + OT + UniProt metadata + dynamic persistence (`018`) | `partial` · live journey `blocked` (#5) · passages `blocked` (#2) | Orchestration may bind retrieval stage ids; live literature still rights-gated |
| **M2** contextual / contradiction | Structured comparison (#90) + contradiction investigation (#92) | `partial` | Opposing / contradiction stages already in bounded agent path |
| **M3** hypothesis / experiment | Registry contracts (#91); multi-hypothesis eval **not** started | `partial` | Investigation contract may reference hypothesis ids; eval stays later |
| **M4** translational / failure | Contracts (#93) + failure-mode taxonomy (#94); Phases 3–8 open | `partial` | Thin brief bind only; not translational-complete |
| **M5** precision translational | Phase 0 + precision contracts (#95); Phases 2–9 open | `partial` | Phenotype / molecular / subgroup / biomarker shapes only |
| Human #2 / #4 / #5 | PARKED | `blocked` | Blocks live orchestration E2E success and scored gold claims |

**Verdict:** Eng substrate is sufficient for M6 **PR1 capability registry + investigation contracts**. Do **not** mark M1–M6 scientifically complete from CI green. M1–M5 remain **partial** after #90–#95.

**#95 merge:** Squash-merged to `main` at `4d7e83a0a8ce0dcc419d2d45f3e32094ee37064d` (CI green: verify + site-deployment + Vercel). Unrelated opens (e.g. #71) skipped.

---

## Substrate inspection (existing orchestration / investigation)

| Area | Files | Working status | M6 relevance |
|------|-------|----------------|--------------|
| Agent orchestrator | `hsiAgentOrchestrator.ts` | `partial` (in-process, no LLM) | Reuse — do not invent parallel framework |
| Durable checkpoints | `hsiAgentDurableCheckpoint.ts` · Neon `009` | `partial` · staging `blocked` (#5) | Resumability already exists — contract references these |
| Fenced artifacts | `hsiFencedArtifact.ts` · Neon `010` | `partial` | Stage outputs stay fenced |
| Bounded agent execution | `boundedAgentExecution.ts` | `partial` | Stage path investigation-plan → research-brief |
| Research workbench | `researchWorkbench.ts` · Neon `004` | `partial` | Deterministic release analysis; status `evidence_found` / `insufficient_evidence` |
| Interrogative workspace | `interrogativeWorkspace.ts` · Neon `007` | `partial` | States `draft` / `awaiting_scientific_review` / `reviewed` / `rejected` |
| Research brief bind | `researchBriefIntegration.ts` | `partial` | Thin M6 contract summary bind in PR1 |
| Hypothesis registry | `hypothesisRegistry.ts` | `partial` (#91) | Optional entity / objective refs |
| Precision / translational packs | M4/M5 modules | `partial` | Capability registry entries only in PR1 |
| Planner / task graph | — | `missing` | **PR2** |
| Capability router | — | `missing` | Later M6 PR |
| Full investigation workspace | site InvestigationWorkspace | `partial` (existing product) | Do not rebuild; later thin surfacing |

**Persistence decision (PR1):** Prefer **contract projection** over a new Neon table. Existing interrogative payload / research-run JSON / checkpoint rows remain authoritative for durable state. M6 investigation contracts are validated in-process and may be embedded as JSON projections. A backwards-compatible migration is deferred until a product write path needs first-class columns.

---

## Capability registry (M1–M5 + orchestrator)

Registry field schema used below: **id · purpose · input/output contracts · deps · adapters · constraints · evidence/review requirements · operational status**.

| id | purpose | input → output contracts | deps | adapters | constraints | evidence / review | operational status |
|----|---------|--------------------------|------|----------|-------------|-------------------|--------------------|
| `m1.dynamic_retrieval` | Researcher-query → bibliographic / OT / UniProt metadata | `ResearcherQueryInput` → `DynamicSearchRecord[]` + persistence plan | Europe PMC · OT · UniProt · cache | `dynamicEvidenceRetrieval.ts` · `018` | Passages rights-gated (#2); fixtures ≠ live | Review before graph promote; provenance hashes | `partial` · live `blocked` (#5) |
| `m1.provenance_persist` | Durable dynamic evidence plan | plan → ledger rows | Neon red-wave | `dynamicEvidencePersistence.ts` | Staging writes gated | Content hash / claim ids | `partial` |
| `m2.structured_comparison` | Compare evidence items with contradiction honesty | comparison inputs → structured assessment | M1 locators | `structuredEvidenceComparison.ts` | Contradiction ≠ scientific verdict | Candidate requires scientific review | `partial` (#90/#92) |
| `m2.opposing_search` | Seek opposing literature signals | query → opposing report | M1 retrieval | `opposingEvidenceSearch.ts` | Empty oppose ≠ consensus | Bound into brief with limitations | `partial` |
| `m2.gap_verification` | Engineering gap classes | claims → gap assessment | opposing / retrieval | `gapVerification.ts` | Not SME-ranked (#4) | Engineering labels only | `partial` |
| `m3.hypothesis_registry` | Hypothesis lifecycle + evidence refs | propose/transition → registry records | N2/N7 ledgers | `hypothesisRegistry.ts` | No LLM probability; review ≠ validation | Human review gates | `partial` (#91) |
| `m3.multi_hypothesis_eval` | Comparative hypothesis evaluation | — | M3 registry | — | Not started | — | `missing` |
| `m4.translational_contracts` | Programme / preclinical / human / clinical envelopes | OT/CT.gov/EPMC → contract pack | O-04 attach | `translationalEvidenceContracts.ts` | Registration ≠ efficacy | Unknowns preserved | `partial` (#93) |
| `m4.failure_taxonomy` | Translational failure **investigation labels** | trials + contradiction → labels | M2 + M4 contracts | `translationalFailureTaxonomy.ts` | Labels ≠ causal conclusions | Review before any failure claim | `partial` (#94) |
| `m5.precision_contracts` | Phenotype / molecular / subgroup / biomarker shapes | OT/UniProt/EPMC/CT.gov → pack | M4 hooks | `precisionEvidenceContracts.ts` | No invented performance / measurements; HCA/GEO `not_connected` | Review gates; no patient advice | `partial` (#95) |
| `orch.agent_orchestrator` | Deterministic in-process task DAG | tasks + executors → orchestration result | agent manifests | `hsiAgentOrchestrator.ts` | No LLM/network/DB in core loop | No scientific approval | `partial` |
| `orch.checkpoints` | Durable resumable stage state | start/finish/recover → checkpoint | Neon `009` (staging) | `hsiAgentDurableCheckpoint.ts` | Explicit recovery; max 3 attempts | Operator principal on recovery | `partial` · staging `blocked` (#5) |
| `orch.fenced_artifacts` | Stage output fencing | fence + payload → artifact ref | checkpoints | `hsiFencedArtifact.ts` · `010` | Running fence required | Content hash | `partial` |
| `orch.bounded_agent_execution` | Fixed stage pipeline with traces | investigationId + query → execution result | orch.* + M1–M2 + brief | `boundedAgentExecution.ts` | Bounded stages only; not a swarm | Candidates unapproved | `partial` |
| `orch.research_workbench` | Deterministic published-release investigate | question + snapshot → `ResearchInvestigation` | published release | `researchWorkbench.ts` · `004` | No LLM; hypotheses empty | Evidence needs reviewDecisionId | `partial` |
| `orch.interrogative_workspace` | Authenticated saved investigations | draft → review states | Neon Auth · `007` | workspace services | Auth roles required | Scientific review human-gated | `partial` · live `blocked` (#5) |
| `m6.investigation_contract` | Shared investigation identity + state machine | draft contract → validated lifecycle | orch.* projections | `investigationOrchestrationContracts.ts` (**PR1**) | No planner/router yet | Review checkpoints recorded, not auto-passed | **PR1 in-flight** |
| `m6.scientific_planner` | Research planner + task graph | — | M6 contract | — | Deferred | — | `missing` → **PR2** |
| `m6.capability_router` | Route stages to M1–M5 capabilities | — | registry | — | Deferred | — | `missing` |

---

## Milestone 6 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + capability registry | This document | — | `connected` (audit) | Keep updated as PRs land | this file |
| **1** Investigation contracts + thin orch bind | Orchestrator · checkpoints · bounded agent · workbench · interrogative | `partial` → **PR1 in-flight** | Shared contract + states + resumable refs; no new migration | `investigationOrchestrationContracts.ts` |
| **2** Scientific Research Planner + task graph | — | `missing` | Planner that emits bounded task graphs from contracts | future PR2 |
| **3** Capability router | Registry rows above | `missing` | Route tasks to M1–M5 adapters without new agents | future |
| **4** Workspace / progress deepen | InvestigationWorkspace / Progress | `partial` | Surfacing only — no rebuild | site |
| **5–7** Live eval / SSc | Fixtures + human queue | `fixture-only` · `blocked` | Checklist only — **no invented live success** | human-queue |

---

## PR1 deliverable (this increment)

**Capability Registry and Investigation Contracts**

- Shared investigation contract: investigation ID, researcher/auth scope, question, domain, entities, objectives, constraints, sources, budgets, freshness, review checkpoints, status, plan version, timestamps.  
- Investigation states: `draft` → `planning` → `awaiting_researcher_approval` → `running` → `awaiting_external_dependency` → `awaiting_scientific_review` → `paused` → `completed_with_limitations` → `completed` → `failed` → `cancelled` (fail-closed transitions).  
- Resumable at contract level via references to existing durable checkpoints / fenced artifacts (no parallel checkpoint store).  
- Thin projection helpers onto interrogative workspace states, research-workbench run status, and bounded-agent investigation id — **do not rebuild**.  
- Neon red-wave; auth/review/provenance intact; no Gate C / MoU / PHI; fixtures ≠ live; no invented SSc E2E success.  
- **No new migration** in PR1 (backwards-compatible projection only).

**Out of PR1:** PR2 planner/task graph, capability router, full workspace rebuild, live E2E claims.

---

## Human blockers (unchanged)

| Item | Status | Blocks for M6 |
|------|--------|---------------|
| #2 Passage / abstract rights | PARKED | Passage-backed stage entailment |
| #4 SME gold | PARKED | Scored orchestration usefulness |
| #5 Live Ask→export journey | PARKED | Real-evidence M6 E2E success claim |
| Checkpoint Neon staging | Gated | Durable resume in production path |

---

## Anti-patterns (binding)

- Do not invent a new agent framework, parallel KG, or separate orchestration platform.  
- Do not claim M1–M5 complete.  
- Do not auto-approve Gate C, invent MoU, or wire PHI/CDS.  
- Do not treat fixtures or CI green as scientific validity or M6 completion.  
- Do not invent SSc live E2E success.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.  
- Do not silently rewrite completed checkpoints; recovery stays explicit and human-authorised.
