# Milestone 17 — Autonomous Biomedical Discovery, Scientific Knowledge Evolution & Research Programme Intelligence

**Brief:** HSI Milestone 17 — governed **scientific programme intelligence** contracts that organise research programmes, workstreams, programme milestones, and research decisions — composing existing orchestrator, KG, hypothesis/experiment, therapeutic/clinical/RWE/simulation, collaboration, and review services — **without** inventing a separate AI-agent platform, dozens of disconnected agents, auto-approval of plans/claims, fabricated discoveries, Gate C auto-approve, MoU invention, PHI/CDS, or claiming live autonomous closed-loop discovery.  
**Status:** Phase 0 gap audit + **PR1 Scientific Programme Contracts** ([#131](https://github.com/gnaneshwer23/hsi-core/pull/131) in-flight) + **PR2 Research Objective and Workstream Planning** (stacked on #131 — open for review, do not auto-merge) — **not** autonomous discovery complete, **not** programme intelligence complete, **not** M17 complete.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `c993261513ae4b626ecb92de6576985199a746dd` (post-#130 tip; M17 stack rebased after concurrent M16 PR1 merge)  
**Tip commit:** `c993261 M16 PR1 Human Systems Data Contracts (#130)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Dependency:** Compose IDs/refs already on `main` (M1–M15 eng substrate including M15 PR7 [#123](https://github.com/gnaneshwer23/hsi-core/pull/123) / PR8 [#128](https://github.com/gnaneshwer23/hsi-core/pull/128) and M16 PR1 [#130](https://github.com/gnaneshwer23/hsi-core/pull/130)). Remaining M16 [#124](https://github.com/gnaneshwer23/hsi-core/pull/124)/[#126](https://github.com/gnaneshwer23/hsi-core/pull/126)/[#127](https://github.com/gnaneshwer23/hsi-core/pull/127)/[#129](https://github.com/gnaneshwer23/hsi-core/pull/129) stay **in-flight** — optional later composition; **do not rewrite** those branches. **PR2 stacks on PR1 (#131)** — merge PR1 first or keep stacked. If further concurrent merges land mid-flight, rebase onto latest `main`.

**Cross-links (do not contradict):**

- [`MILESTONE16_HUMAN_SYSTEMS_INTELLIGENCE_MATRIX.md`](./MILESTONE16_HUMAN_SYSTEMS_INTELLIGENCE_MATRIX.md) — M16 in-flight stack  
- [`MILESTONE15_HUMAN_DISEASE_INTELLIGENCE_MATRIX.md`](./MILESTONE15_HUMAN_DISEASE_INTELLIGENCE_MATRIX.md)  
- [`MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md`](./MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md)  
- [`MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md`](./MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md)  
- [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md)  
- [`MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md`](./MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md)  
- [`MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md`](./MILESTONE9_COLLABORATION_FEDERATION_MATRIX.md)  
- [`MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md`](./MILESTONE6_INVESTIGATION_ORCHESTRATION_MATRIX.md)  
- [`MILESTONES_M1_M13_STATUS_ROLLUP.md`](./MILESTONES_M1_M13_STATUS_ROLLUP.md) — M11 **Skipped**/`Missing`  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)  
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)  
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)  
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../strategy/HSI_RESEARCH_DISCOVERY_WORKFLOW.md`](../strategy/HSI_RESEARCH_DISCOVERY_WORKFLOW.md)  
- [`../engineering/STEP-5-RESEARCH-WORKBENCH.md`](../engineering/STEP-5-RESEARCH-WORKBENCH.md) — site workstreams ≠ M17 research-workstream contracts  

**Out of PR1:** Research objective / workstream planning engines (PR2), autonomous execution runtime (later), knowledge-evolution writers (later), programme intelligence analytics (later), workbench UI, Neon migration, auto-approval of plans/claims, fabricated discoveries / synthetic scientific evidence as acceptance, inventing a separate agent platform.

**Out of PR2:** Continuous evidence investigation / authorised autonomous bounds (PR3), knowledge-evolution writers, programme intelligence analytics, workbench UI, Neon migration, auto-approval of plans/claims, agent self-approval, fabricated discoveries, inventing a separate agent platform.

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `Verified operational` | Implemented and exercised on a current library/product path with honest gates |
| `Implemented but unverified` | Shape shipped; scientific / live / privacy correctness not verified |
| `Partial` | Meaningful path exists; required depth, live wiring, or honesty gates incomplete |
| `Fixture-only` | Works only with static fixtures / seeded packs |
| `Missing` | No meaningful implementation for this M17 requirement |
| `Blocked` | Cannot complete without human/config gate, authorised dataset, or unfinished prior milestone |
| `in-flight` | Open PR not yet on `main` — document honestly |
| `Skipped` | Milestone deliberately not built (e.g. M11) — do not claim |

Honesty freeze: research programme intelligence only · **not a separate AI agent platform** · agents investigate/propose · researchers approve · independent reviewers verify · **agents must not approve their own findings** · no auto-approval of plans/claims · no fabricated discoveries · no PHI/CDS · no Gate C auto-approve · no invented MoU · fixtures ≠ live · CI ≠ scientific validity · M11 multiscale engine **not claimed** · Neon red-wave only · ARCH-001/002/003 preserved.

---

## Architecture principles (binding for M17)

| Principle | Implication for scientific programme intelligence |
|-----------|---------------------------------------------------|
| **ARCH-001** Independent Intelligence, Connected Ecosystem | Programme / workstream / milestone / decision contracts stay HSI-owned; compose existing orchestrator / KG / registries / services by ID — failure-isolated, not a monolith agent OS |
| **ARCH-002** Living Health KG ownership | Programme plans and agent proposals never auto-promote into curated KG; review/decision envelopes stay non-graph-promotable until human Gate C path exists |
| **ARCH-003** Authenticated research API | Trusted session / grants only; never trust client-claimed “authorised autonomous run”, fabricated discovery claims, or PHI payloads |

---

## 1. Architecture dependency report (Phase 0 — M1–M16)

| Area | On audited `main` | Status | M17 readiness |
|------|-------------------|--------|---------------|
| **Orchestrator** (M6) | `investigationOrchestrationContracts` / capability envelopes (#96) | `Partial` · planner/router `Missing` | Reuse investigation ids / researcher_approval / scientific_review checkpoints |
| **Durable execution** (M10 governed compute) | `governedComputationalExecutionContracts` (#104) | `Partial` | Optional execution-authorisation refs later; not auto-run in PR1 |
| **Evidence retrieval / ledger** (M1 + N7) | Europe PMC / OT / UniProt / CT.gov · hypothesis/experiment ledger | `Partial` · live `Blocked` (#5) | Public evidence refs OK; no invented discoveries |
| **KG / ontology** (ARCH-002 · M15 CSOL) | Domain graph · `crossScaleOntologyModelLinkageContracts` (#119) | `Partial` / `Fixture-only` | Compose ontology / disease context ids — no duplicate registries |
| **Contradiction / gap** (M2) | Structured comparison + contradiction (#90 / #92) | `Partial` | Later programme gap investigation |
| **Hypothesis registry** (M3) | Hypothesis registry (#91) | `Partial` · observation `Blocked` | Optional `hypothesisIds` composition |
| **Experiment lifecycle** (M10) | Lifecycle / design / protocol / compute (#101–#105) | `Partial` · lab `Missing` | Optional experiment/protocol refs later |
| **Therapeutic** (M12) | `therapeuticDiscoveryDataContracts` (#107) | `Partial` (PR1) | Optional `hsi-tx-prog-*` refs |
| **Trial / translational** (M13) | `translationalDevelopmentContracts` (#109) | `Partial` (PR1) | Optional `hsi-td-prog-*` / trial-concept refs |
| **RWE / clinical** (M14) | RWE / interop / LCE / cohort (#111–#115) | `Partial` | Optional study/cohort ids; no PHI |
| **Simulation** (M15 MSI · PR8 · M11) | MSI (#123) · precision scenario (#128) · M11 **Skipped** | MSI / PR8 `Fixture-only` · M11 `Skipped` | Optional simulation / scenario refs; **do not claim live multiscale** |
| **Collaboration / review** (M9 · protocol approval) | Org/tenant + collaborative (#99/#100) · protocol intelligence (#103) | `Partial` · federation `Missing` | Org ACL + human-only review patterns |
| **Auth / tenant** (M9 · ARCH-003) | `researchOrganisationTenantSecurity` | `Partial` | Optional `orgId` |
| **Neon** | red-wave stores | `Partial` · staging `Blocked` (#5) | **No new migration in PR1** |
| **Workbench** | Research Decision Workbench modules | `Partial` | **Out of PR1 UI** |
| **Monitoring** (M8) | Incremental evidence monitoring (#98) | `Partial` | Later programme monitoring |
| **Benchmarks** (M7) | Benchmark registry (#97) | `Partial` · science `Blocked` | Orthogonal; CI ≠ validity |
| **M16 human systems** | #130 merged · #124/#126/#127/#129 `in-flight` | PR1 **merged** on audited tip; later M16 PRs optional | Optional later composition after remaining merges |
| **M15 PR8 precision scenario** | #128 | **merged** on audited tip | Available for later composition; not required for PR1/PR2 |
| Human #2 / #4 / #5 | PARKED | `Blocked` | Blocks live scientific E2E |

**Verdict:** Eng substrate on `main` is sufficient for M17 **PR1 Scientific Programme Contracts** and stacked **PR2 Research Objective and Workstream Planning** (objectives · planning envelopes · history · human approval gates + thin memory store). Scientific path for real autonomous discovery / programme validation remains **Blocked** until authorised execution bounds, independent review, and non-fabricated evidence paths exist — **do not fabricate discoveries or use synthetic scientific evidence as acceptance**.

---

## 2. Reuse vs extension plan

| Capability | Reuse (existing) | Extend in M17 | Do not invent |
|------------|------------------|---------------|---------------|
| Investigation orchestration | M6 investigation ids, checkpoints | Programme → investigation scope links | Separate agent OS / planner rewrite |
| Hypothesis / experiment | M3 / M10 ids | Workstream / milestone binds later | New hypothesis registry |
| Therapeutic / translational | `hsi-tx-prog-*`, `hsi-td-prog-*` | Optional programme composition refs | Duplicate therapeutic programme types |
| Disease / RWE / simulation | HDI / RWE / MSI ids | Optional later objective links | Twin / live multiscale claims |
| Org / review / audit | M9 org · protocol human-only accept · research claim review pattern | Research decision human + independent-reviewer gates | Agent self-approval |
| Scientific identity | OT / UniProt / PMID / DOI / NCT patterns | Compose via identity refs | Proprietary invented identity systems |
| Site “workstreams” (Step 5) | UI deterministic benches | — | Collapsing site workstreams into M17 contracts |

**PR1 entity model (new prefix `hsi-sp-*`):**

| Entity | Id pattern | Role |
|--------|------------|------|
| Research programme | `hsi-sp-prog-*` | Governed multi-workstream research framing |
| Research workstream | `hsi-sp-ws-*` | Bounded investigative lane under a programme |
| Programme milestone | `hsi-sp-ms-*` | Reviewable checkpoint (not auto-complete) |
| Research decision | `hsi-sp-dec-*` | Human / independent-reviewer decision envelope |

---

## 3. Runtime and governance gap analysis

| Gap | Status | Implication |
|-----|--------|-------------|
| Explicit autonomous-execution authorisation envelope | `Missing` (later PR) | PR1 records bounds as declared fields only — no runner |
| Resource / quota enforcement | `Missing` | Declared resource class only |
| Data-permission verification at run time | `Partial` (M14 interop / M9 grants) · live `Blocked` | Fail-closed when authorised dataset blocked |
| Independent scientific review workflow | `Partial` (protocol / claim review patterns) | PR1 requires human accept/reject; independent reviewer ≠ authoring agent |
| Durable programme persistence (Neon) | `Missing` / deferred | Thin memory store only in PR1 |
| Closed-loop discovery runtime | `Missing` | Explicit non-goal until authorised |
| Agent platform / multi-agent bus | **Refused** | Reuse orchestrator envelopes |
| Federation of programme execution | `Missing` · partnerships `Blocked` | Do not claim |
| Workbench programme cockpit | `Partial` / out of PR1 | UI later |

---

## 4. Scientific validation blockers

| Blocker | Status | Notes |
|---------|--------|-------|
| Fabricated discoveries as acceptance | **Forbidden** | Engineering fixtures ≠ scientific validation |
| Synthetic evidence as proof | **Forbidden** when authorised path blocked | Same honesty as M14/M15 |
| Agent self-approval of findings | **Forbidden** | Fail-closed transitions |
| Auto-approval of plans / claims | **Forbidden** | Human researcher required |
| Live autonomous closed-loop discovery | **Blocked** / `Missing` | Not claimed |
| Human queue #2 / #4 / #5 | PARKED / `Blocked` | Live E2E / SME gold / passages |
| Authorised research dataset | `Blocked` / `Missing` | Required before scientific programme claims |
| M11 live multiscale | `Skipped` | Do not claim |

---

## 5. Proposed PR sequence

| PR | Title | Depends on | Deliverable |
|----|-------|------------|-------------|
| **PR1** | Scientific Programme Contracts | `main` (post-#123) | Programme · workstream · milestone · decision + thin store + tests + pack |
| **PR2** | Research Objective and Workstream Planning | PR1 | Objectives, planning envelopes, workstream planning honesty — still no auto-approve |
| **PR3** | Authorised Autonomous Investigation Bounds | PR2 | Explicit authorisation / resource / data-permission envelopes (no free runner) |
| **PR4** | Programme Milestone & Decision Governance deepen | PR1–PR3 | Independent-reviewer assignment, decision audit trails |
| **PR5** | Knowledge Evolution Proposals (non-promotable) | PR4 · ARCH-002 | Proposal envelopes only — Gate C human-only |
| **PR6** | Orchestrator / registry composition deepen | PR5 · M6/M10/M12/M13 | Bind investigations / experiments / therapeutic ids |
| **PR7** | Programme Intelligence Surfaces (analytics envelopes) | PR6 | Aggregate programme status — not discovery claims |
| **PR8** | Workbench programme cockpit (thin) | PR7 | UI surfacing only |
| **PR9** | Scientific / authorised-run validation | Authorised dataset + review | **Blocked** until real evidence path |

---

## Data protection assessment

| Control | Status | Notes |
|---------|--------|-------|
| Separate AI agent platform | **Refused** | Reuse orchestrator / existing services |
| Agent self-approval | **Refused** | Human + independent reviewer gates |
| Auto-approve plans/claims | **Refused** | Fail-closed |
| PHI / CDS | **Refused** (`cdsPhiBoundary`) | Boundary intact |
| Fabricated discoveries | **Forbidden** | Fixtures = engineering only |
| Gate C / MoU | **Refused** | No inventing |
| Neon clinical / programme PHI tables | **Not introduced** | Contracts-first; red-wave only if/when authorised |
| Graph auto-promotion of plans | **Refused** | `graphPromotable: false` |

---

## Substrate inspection (file-level)

| Area | Files | Working status | M17 relevance |
|------|-------|----------------|---------------|
| CDS / PHI boundary | `cdsPhiBoundary.ts` · `docs/CDS_PHI_BOUNDARY.md` | `Verified operational` | Reuse; never weaken |
| M6 orchestration | `evidence/investigationOrchestrationContracts.ts` | `Partial` | Investigation / checkpoint composition |
| M9 org / collab | `researchOrganisationTenantSecurity.ts` · `collaborativeInvestigationContracts.ts` | `Partial` | Optional orgId |
| M10 protocol approval | `protocolIntelligenceScientificApprovalContracts.ts` | `Partial` | Human-only approval pattern |
| M12 therapeutic | `therapeuticDiscoveryDataContracts.ts` | `Partial` | Optional `hsi-tx-prog-*` |
| M13 translational | `translationalDevelopmentContracts.ts` | `Partial` | Optional `hsi-td-prog-*` |
| M14 RWE | `realWorldEvidenceContracts.ts` | `Partial` | Optional study refs |
| M15 HDI / MSI | `humanDiseaseIntelligenceContracts.ts` · `multiscaleSimulationIntegrationContracts.ts` | `Partial` / `Fixture-only` | Optional disease / sim refs |
| Research contracts | `researchContracts.ts` | `Partial` | Review/decision stage patterns |
| Workbench | research workbench modules | `Partial` | **Out of PR1 UI** |
| Neon | red-wave | `Partial` · staging `Blocked` | **No migration in PR1** |

**Persistence decision (PR1):** Validated contracts + thin in-memory store. **No Neon migration.** Durable programme tables deferred until authorised write path + governance exist on red-wave.

---

## Milestone 17 capability matrix (phases)

| Phase | Capability | Existing | Status | Missing | Files |
|-------|------------|----------|--------|---------|-------|
| **0** Audit + reuse/governance/validation + PR sequence | This document + M1–M16 deps | — | `Verified operational` (audit) | Keep updated on merges | this file |
| **1** Scientific programme contracts | M6/M9/M12/M13/M14/M15 ids · review honesty | **PR1 in-flight** ([#131](https://github.com/gnaneshwer23/hsi-core/pull/131)) — research programme · workstream · milestone · decision + thin store + 7 focused tests + evaluation pack · `Fixture-only` / scientific path `Blocked` | Live autonomous execution · auto-approve · fabricated discoveries | `src/scientificProgrammeIntelligenceContracts.ts` · `test/scientificProgrammeIntelligenceContracts.test.ts` · `scripts/scientific-programme-intelligence-contracts.ts` · `evaluation/scientific-programme-intelligence/` |
| **2** Research objective / workstream planning | PR1 envelopes | **PR2 in-flight** (stacked on [#131](https://github.com/gnaneshwer23/hsi-core/pull/131)) — scientific objective · programme plan · research questions · dependencies · evidence gaps · capability availability · proposed workstreams · requirement estimates · planning history · human-only approve/revise/register + thin store + 7 focused tests + evaluation pack · `Fixture-only` / scientific path `Blocked` | Continuous evidence investigation · auto-approve · agent self-approval | `src/researchObjectiveWorkstreamPlanningContracts.ts` · `test/researchObjectiveWorkstreamPlanningContracts.test.ts` · `scripts/research-objective-workstream-planning-contracts.ts` · `evaluation/research-objective-workstream-planning/` |
| **3** Authorised autonomous bounds / continuous evidence investigation | PR2 · M10 compute | `Missing` | Explicit authz / resources / data permissions · continuous evidence investigation | later PR3 |
| **4** Decision governance deepen | PR1 decisions | `Partial` (PR1) | Independent-reviewer assignment deepen | later PR4 |
| **5** Knowledge evolution proposals | ARCH-002 · Gate C | `Missing` | Non-promotable proposals only | later PR5 |
| **6** Orchestrator / registry composition | M6/M10/M12/M13 | `Partial` | Deeper binds | later PR6 |
| **7** Programme intelligence analytics | — | `Missing` | Status envelopes ≠ discovery claims | later PR7 |
| **8** Workbench | Existing workbench | `Partial` | Thin UI | later PR8 |
| **9** Scientific validation | Fixtures · human queue | `Fixture-only` · dataset **Blocked** | Real authorised path required | later PR9 |

---

## Layer distinctions (binding for PR1+)

| Layer | Meaning | Must not collapse into |
|-------|---------|------------------------|
| **Research programme** | Governed multi-workstream research framing with explicit bounds | Separate AI agent platform / autonomous closed-loop product |
| **Research workstream** | Bounded investigative lane under a programme | Unscoped free agent / site UI workstream |
| **Programme milestone** | Reviewable checkpoint with exit criteria | Auto-completed discovery claim |
| **Research decision** | Human / independent-reviewer decision envelope | Agent self-approval or Gate C auto-approve |
| **Agent proposal** | Draft / investigate output | Approved finding or KG fact |
| **Authorisation bound** | Declared execution / data / resource limits | Live unrestricted runner |
| **Scientific objective** (PR2) | Human-defined programme objective | Research question / hypothesis / approved plan |
| **Research question** (PR2) | Biological question under a plan | Hypothesis / experiment / decision |
| **Evidence gap** (PR2) | Declared required-evidence shortfall | Experiment or research decision |
| **Programme plan** (PR2) | Planning envelope with propose-only workstreams | Auto-approved execution or discovery claim |
| **Planning history** (PR2) | Complete immutable-style event trail | Silent overwrite of prior scope/priorities |

---

## PR1 deliverable (Scientific Programme Contracts)

**Scientific Programme Contracts**

- Versioned **research programme** with purpose, scope, authorisation class, resource class, data-permission class, closed lifecycle; optional links to investigation / hypothesis / org / therapeutic / translational programmes; agents may draft, humans activate/accept/reject.  
- **Research workstream** scoped to a programme with objective summary, permitted actions ordinal, optional investigation bind; not an unbound agent.  
- **Programme milestone** with exit criteria, evidence-required flag, non-auto-complete honesty; human completion/acceptance only.  
- **Research decision** with decision kind, rationale, subject refs; accepting/rejecting decisions require **human** actor; **independent reviewer** must differ from authoring agent when verification is recorded; agents cannot approve their own findings.  
- Honesty: not a separate agent platform; no auto-approval of plans/claims; no fabricated discoveries; no PHI/CDS; non-graph-promotable; Gate C / MoU denied; Neon red-wave; migration deferred.  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR1:** Objective/planning engines (PR2), workbench UI, Neon migration, auto-merge, fabricated discoveries as acceptance.

---

## PR2 deliverable (Research Objective and Workstream Planning)

**Research Objective and Workstream Planning** — stacked on PR1 (#131); **#131 must merge first** (or keep this branch stacked on `eng/m17-scientific-programme-contracts`).

- Human-defined **scientific objective** bound to a PR1 programme id (`hsi-sp-obj-*`).  
- Versioned **programme plan** (`hsi-sp-plan-*`) covering the planning workflow: scope · existing programme knowledge refs · biological research questions · question dependencies · evidence gaps · investigation capability availability · proposed workstreams · computational/data requirement estimates.  
- Binding layer distinctions: scientific objective · research question · hypothesis · evidence gap · investigation · experiment · research decision — must not collapse.  
- **Auto-generated plans are never treated as approved** (`autoGeneratedNotApproved: true` retained through approval/registration).  
- Human-only approve / reject / revise scope-or-priorities / register; **agents cannot self-approve**.  
- Complete **planning history** (`hsi-sp-hist-*`) preserved across workflow steps and revisions.  
- Optional bind of approved proposed workstreams to PR1 `hsi-sp-ws-*` ids at registration — does not invent a runner.  
- Honesty: not a separate agent platform; no PHI/CDS; non-graph-promotable; Gate C / MoU denied; Neon red-wave; migration deferred; continuous evidence investigation **not** claimed (PR3).  
- Thin in-memory store + offline evaluation pack + focused tests.

**Out of PR2:** Continuous evidence investigation / authorised autonomous bounds (PR3), workbench UI, Neon migration, auto-merge, fabricated discoveries as acceptance.

---

## PR1 status rows (update when PR opens / merges)

| Item | Status | Notes |
|------|--------|-------|
| Phase 0 matrix authored | `Verified operational` (this file) | Audited tip `c993261` (rebased after #130) |
| Contracts module | **PR1 in-flight** | `src/scientificProgrammeIntelligenceContracts.ts` |
| Focused tests | **PR1 in-flight** | `test/scientificProgrammeIntelligenceContracts.test.ts` (7) |
| Evaluation pack / script | **PR1 in-flight** | `evaluation/scientific-programme-intelligence/` · `scripts/scientific-programme-intelligence-contracts.ts` |
| package.json prepare/check | **PR1 in-flight** | `spi:scientific-programme:prepare` / `:check` |
| PR against `main` | **in-flight** ([#131](https://github.com/gnaneshwer23/hsi-core/pull/131) — do not merge) | Open for human review; rebased onto `c993261` |
| Neon migration | Deferred | Explicit non-goal |
| Workbench UI | Out of PR1 | — |
| Auto-approval of plans/claims | Refused | Fail-closed |
| Fabricated discoveries | Refused | Fixtures only |

---

## PR2 status rows (update when PR opens / merges)

| Item | Status | Notes |
|------|--------|-------|
| Contracts module | **PR2 in-flight** | `src/researchObjectiveWorkstreamPlanningContracts.ts` |
| Focused tests | **PR2 in-flight** | `test/researchObjectiveWorkstreamPlanningContracts.test.ts` (7) |
| Evaluation pack / script | **PR2 in-flight** | `evaluation/research-objective-workstream-planning/` · `scripts/research-objective-workstream-planning-contracts.ts` |
| package.json prepare/check | **PR2 in-flight** | `spi:research-objective-planning:prepare` / `:check` |
| PR against `main` (stacked on #131) | **in-flight** (open — do not merge) | Base `#131` / `eng/m17-scientific-programme-contracts` |
| Auto-generated plan approval | Refused | `autoGeneratedNotApproved` retained |
| Agent self-approval | Refused | Fail-closed |
| Scope/priority revision + history | Required | Human revise; history preserved |
| Continuous evidence investigation | Out of PR2 | PR3 |
| Neon migration | Deferred | Explicit non-goal |
| Workbench UI | Out of PR2 | — |

---

## Concurrent merge note

Phase 0 initially audited `d1fe2e4` (#123). Mid-flight, M15 PR8 [#128](https://github.com/gnaneshwer23/hsi-core/pull/128) merged → tip `449d714`; M17 PR1 rebased. Subsequently M16 PR1 [#130](https://github.com/gnaneshwer23/hsi-core/pull/130) merged → tip `c993261`; M17 PR1/#131 and stacked PR2 rebased onto that tip. Remaining M16 stack (#124/#126/#127/#129) stayed open and was **not** rewritten. If further merges land before M17 PR1/PR2 merge, rebase again and refresh the audited SHA.
