> **Superseded.** Current capability status is generated in [../STATUS.md](../STATUS.md) from `operations/capability-register/capability-register.v1.json`. This document is historical and is not the status source of truth.

# HSI Capability Register — 2026-11-08

**Execution step:** 04 Agent intelligence and gap verification (deterministic classification + claim_verifier adapter)  
**Master spec:** [`../product/HSI_DEFINITIVE_PRODUCT_SPEC.md`](../product/HSI_DEFINITIVE_PRODUCT_SPEC.md)  
**Machine-readable:** [`../../operations/capability-register/capability-register.v1.json`](../../operations/capability-register/capability-register.v1.json)  
**Tip audited:** step 01–03 on `main` (`94650ae`, `#69`); step 04 on `eng/step-04-agent-gap-verification`

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `implemented` | Code/contracts exist and are exercised by tests or harnesses |
| `connected` | Wired into an authenticated product path / API journey (still may lack science) |
| `scientifically_validated` | Independent expert acceptance of scientific quality — **none claimed here** |
| `blocked` | Waiting on human queue, rights, ops, or policy |
| `planned` | Specified but not built as a working service |
| `synthetic_only` | Fixture / demo path only; must never be presented as clinical or gold science |

A row may list a primary status plus honesty tags. **Documents ≠ scientific validation.**

## Binding honesty (unchanged)

- Human queue **#2/#3/#4/#5/#8 PARKED** — [`HUMAN_QUEUE_RESIDUALS.md`](./HUMAN_QUEUE_RESIDUALS.md)
- No MoU invent · no Gate C auto-approve · no CDS-PHI · HSI Neon = **red-wave only**
- `researcherJourneyCompleteClaimed=false` · `writesEnabledClaimed=false` · R3 science **BLOCKED**

---

## A. Spec §6 foundations

| ID | Capability | Status | Evidence (paths) | Gap vs scientist outcome | Next eng action |
|----|------------|--------|------------------|--------------------------|-----------------|
| F-01 | Immune-cell spine + relationship vocabulary | `implemented` | `src/immuneCellSpine.ts`, publish packs, tests | Coverage thin beyond RA/SSc starters; not full disease atlas | Curate broader cell/tissue/disease binds — no rebuild |
| F-02 | Living graph + evidence/claim contracts | `implemented` · `connected` | `src/livingHealthKnowledgeGraph.ts`, `src/researchContracts.ts`, `src/graphRelease.ts`, `src/evidence/livingEvidenceExpansion.ts`, outcome panel | Living-evidence metadata expansion bound when PMIDs overlap pins; atlas depth still thin; candidates not graph-promoted | Keep fail-closed passages; broaden pins after rights |
| F-03 | Source provenance, versions, review records | `implemented` · `connected` | ledger stores + outcome reverse-trace UI | Reverse trace first-class in outcome 01–06; not every science page | Keep claim→passage→source exposure |
| F-04 | RA / SSc evidence packages | `implemented` · not `scientifically_validated` | `research/ra-anti-tnf/`, `research/ssc-tfh-il21/`, R1 packets | Rights/passages pending (#2); SME gold empty (#4) | Bounded integration tests only until humans clear |
| F-05 | Saved investigation + research outcome APIs | `connected` | interrogative APIs + outcome DTO powering 01–06 panel | Composes **saved** evidence; no new scientific generation | Preserve APIs — do not replace |
| F-06 | Research dashboard + multiple workbenches | `implemented` · `connected` | dashboard hero demotes synthetic profiles; primary CTAs → decision-workbench + mechanism-workflow | Specialist pages remain as secondary views | Keep specialist views; no rebuild |
| F-07 | Synthetic patient validation records | `synthetic_only` | `src/syntheticValidationDataset.ts`, `/research/validation`, dashboard profiles | Risk of looking like real cohorts if labelling slips | Keep separate; never promote into evidence package |
| F-08 | Trial / therapeutic scaffolding | `implemented` · mostly `planned` for live landscape | `src/trialsCriteriaMvp.ts`, `src/clinicalResearchScaffold.ts`, `src/evidence/n5RegistryLiveRefresh.ts`, `/science/clinical-trials` | No full versioned development landscape in investigation 04 | Extend registry snapshots into same investigation object |
| F-09 | Scientific evaluation harness | `implemented` · `blocked` for science | `src/goldEvaluationSuite.ts`, R2 suite, `src/modelEvalHarness.ts`, N3/N6 worksheets | `labelledRows=0`, `smeGoldFilled=false` | Complete harness wiring; **do not invent labels** |
| F-10 | AI orchestration + agent contracts | `implemented` (contracts/orchestrator) · gap adapter connected | `src/hsiAgentIntelligenceContracts.ts`, `src/hsiAgentOrchestrator.ts`, `createGapVerificationExecutor` on `claim_verifier`, local `researchOrchestrator.ts` | Live literature/LLM tools still unused; no new agent catalogue | Keep claim_verifier adapter; no swarm invent |

---

## B. Investigation outputs 01–06

| ID | Output | Status | Evidence | Gap | Next eng action |
|----|--------|--------|----------|-----|-----------------|
| O-01 | Scientific landscape | `connected` | Outcome section 01 + livingEvidence bibliographic / OT candidates when bound | Not a curated landscape for arbitrary questions; metadata ≠ synthesis | Keep honesty; broaden domain pins |
| O-02 | Evidence comparison | `connected` | Outcome section 02 + reverse trace; oppose note honesty | Cross-species depth still limited; empty oppose ≠ consensus | Richer oppose search when rights clear |
| O-03 | Gap intelligence | `implemented` · `connected` (classified) | `src/evidence/gapVerification.ts`, outcome `gapVerification`, panel §03 | Engineering classes only; SME gold empty (#4); not scientist-ranked | Keep abstention; await #4 for scientific labels |
| O-04 | Translational intelligence | `planned` / scaffold | Trials criteria MVP, N5 refresh, science clinical-trials page | Not attached to investigation outcome (`trials: not_queried` honesty) | Attach versioned registry snapshot to same question (step 05) |
| O-05 | Research action plan | `connected` (partial) | Outcome `nextResearchSteps`, falsification engine | Tasks from saved record; not evaluated experiment designs | Keep fields; fill only from recorded planner — no invention |
| O-06 | Evidence package | `connected` | `…/review-package`, outcome JSON/Markdown export, hashes | Live researcher completion blocked on #5 | Keep export path; probe via R3; no redesign |

---

## C. Nexus agent capabilities (§5 table)

Map logical names → real code. Roles in `HSI_AGENT_ROLES` are **policy contracts**, not product “investigators.”

| Logical agent | Code map | Status | Gap / next |
|---------------|----------|--------|------------|
| Research Orchestrator | `hsiAgentOrchestrator` (in-process, no LLM); ISI Ask gateway (product); local `researchOrchestrator.ts` | `implemented` contracts · `connected` only for deterministic local / API composition | Wire one Ask entry → investigation stages (step 02/04) |
| Evidence Investigator | Interrogative evidence engine, grounded brief N4, literature tool ID unused live | `connected` (saved corpus) | Fresh retrieval still rights/human gated |
| Immune Cell Investigator | `immuneCellSpine`, ISI engine cells (product) | `implemented` vocabulary | Expand curation; no new agent name |
| Mechanism Investigator | `immuneMechanismInvestigation`, mechanism workflow, graph reasoner role | `connected` on RA/SSc fixture path | Broaden packs after rights |
| Microbiome / Neuroimmune | `gutImmunePack`, `neuroImmunePack`, systems axes | `implemented` packs · thin science | Treat as packs, not agents |
| Clinical Evidence Investigator | Synthetic validation; Aksh clinical agents catalog only in-repo | `synthetic_only` / `blocked` for real cohorts | Step 06 only with authorised data |
| Contradiction Investigator | Contract role + local contradictionEngine | `implemented` detection helpers · not full service | First-class oppose search audit |
| Research Gap Investigator | `gapVerification` + claim_verifier adapter (reuse; not a new agent name) | `implemented` engineering classification · `blocked` scientific labels | Expert-labelled cases (#4) still required |
| Therapeutic / Trial Investigator | trials MVP, N5, ATLAS catalog (Aksh) | `planned` product depth | Step 05 |
| Research Planning Agent | Falsification / question engines, outcome next steps | `connected` (recorded) | No invented protocols |
| Evidence Verifier | Claim/passage hashes, outcome compiler, Gate C patterns (ISI) | `connected` integrity · `blocked` scientific approval | Human #2/#3/#4 |

---

## D. Evidence forward / backward

| Direction | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Forward: source → claim → graph → investigation | `connected` (release-bound + metadata expand) | Research bundles, graph release, livingEvidenceExpansion (Europe PMC / Open Targets / CT.gov identity), R3 retrieve/investigate | Passage-linked fresh claims still rights-blocked (#2); relationship candidates need human review |
| Backward: recommendation → claim → passage → source | `connected` | Outcome reverse-trace UI in sections 02/03/05/06; review-package hashes | Not every specialist science page |
| Continuous re-verify / version | `planned` / ledger scaffold | Evidence ledger N2, temporal dossier | Step 07; no silent overwrite |

---

## E. R3 unified journey (step 02)

| Stage | API | UI | Status |
|-------|-----|----|--------|
| Ask | `GET /api/research/interrogative/{id}` | decision-workbench | `connected` (fixture) |
| Retrieve | `…/graph-context` | same | `connected` |
| Investigate | `GET /api/research/graph/ssc` | mechanism-workflow / graph | `connected` |
| Verify | `…/outcome` | delivery / outcome | `connected` |
| Review | `POST …/submit-review` | reviewer surfaces | `connected` eng · `blocked` live #5 |
| Export | `…/review-package` | export | `connected` eng · `blocked` live #5 |

**Verdict (step 02):** Continuous 01–06 outcome UI + shared `InvestigationProgress` + demoted synthetic hero. Live Ask→export still **PARKED** on human #5 (`researcherJourneyCompleteClaimed=false`). Specialist workbench pages remain as secondary views — not rebuilds.

---

## F. Disconnected / duplicated (do not rebuild)

| Finding | Disposition |
|---------|-------------|
| Dashboard vs scientific-workbench vs decision-workbench vs mechanism-workflow | **Reconnect/nav consolidate** — same APIs; keep pages as specialist views |
| `researchOrchestrator.ts` (browser deterministic) vs `hsiAgentOrchestrator.ts` (ARCH-009) | Keep both labelled; do not invent third swarm |
| Aksh agent catalog in hsi-core vs Aksh runtime | Catalog only here — never clone CONDUCTOR |
| Science Research Agents page vs Nexus logical table | Educational/UI — audit vs services, no new catalogue |
| gapReport (schema mapping) vs “scientific gap” | Different concepts — do not rename into false science |

---

## G. Step 02 — Unified research journey (shipped eng)

**Done:**

1. Outcome panel sections mapped **01–06** over existing outcome DTO / interrogative APIs (no new pages).
2. Synthetic validation demoted from dashboard hero; secondary fixture panel retained with honesty labels.
3. Shared `InvestigationProgress` chrome on decision-workbench + mechanism-workflow.
4. Reverse trace (claim → passage → source) exposed in outcome sections where APIs already supply bindings.
5. Live Ask→export (#5) remains **PARKED** — no production write enablement, no MoU/Gate C/SME gold/CDS-PHI.

**Residual (after step 02):** translational trials still `not_queried` (step 05); verified scientific gaps (step 04); living evidence expansion (step 03 — see §I); live researcher session completion (#5).

**Out of scope (unchanged):** new architecture, new agent catalogue, public landing redesign, Gate C/MoU/CDS, autumn-snow for HSI.

---

## I. Step 03 — Living evidence and graph expansion (shipped eng)

**Done:**

1. Europe PMC PMID lookup + Open Targets disease→target adapter + CT.gov identity reuse.
2. Versioned living-evidence expansion snapshot with provenance, response identities, rate-limit disclosure, licensing *signals* (not clearance), entity resolution via ontology registry, graph relationship *candidates* (`graphPromotable=false`).
3. Passage import fail-closed (`humanCleared=false`, `passageImported=false`, `licenceEvidenceUri=null`).
4. Research outcome `livingEvidence` section + outcome panel section 01 surfacing bound bibliographic / OT / registry-identity metadata; `external_search` stage updates when bound; trials remain `not_queried` (step 05).
5. Harness: `bun run living-evidence:expand` · `living-evidence:check` · optional `living-evidence:live`.

**Residual:** human #2 rights before passage import; expert-promoted graph edges; step 04 gap verification (see §J); step 05 O-04 trials attach; live #5 session completion.

**Out of scope (unchanged):** Gate C/MoU/CDS-PHI, inventing clearances, autumn-snow.

---

## J. Step 04 — Agent intelligence and gap verification (shipped eng)

**Done:**

1. Deterministic `gapVerification` classifier: missing local data vs genuine unresolved vs passage-rights-blocked vs oppose-search-incomplete vs abstain.
2. Binds living-evidence outcome projection + local claim/source traces; every item reverse-traceable; `smeGoldFilled=false`.
3. Research outcome + panel §03 surface classifications with explicit unavailable capabilities.
4. Reuses ARCH-009 `claim_verifier` via `createGapVerificationExecutor` — no new agent catalogue entry.
5. Harness: `bun run gap-verification:expand` · `:check`.

**Residual:** expert-labelled cases (#4 PARKED); passage entailment (#2); live LLM/literature tools; step 05 trials attach; live #5 session.

**Out of scope (unchanged):** inventing SME gold / MoU / Gate C / CDS-PHI / autumn-snow.

---

## H. Acceptance

### Step 01

| Criterion | Result |
|-----------|--------|
| One verified capability inventory | **Yes** — this document + JSON |
| Disconnected/duplicated flagged | **Yes** — §F |
| No unnecessary rebuilds | **Yes** — preserve APIs, packs, contracts |
| Scientifically validated claimed | **No** — none |
| Human queue disturbed | **No** — remains PARKED |

### Step 02

| Criterion | Result |
|-----------|--------|
| One continuous investigation UI (01–06) | **Yes** — decision-workbench outcome panel |
| No disconnected tool-hopping required for fixture path | **Yes** — shared progress + existing APIs |
| Synthetic profiles demoted | **Yes** — secondary labelling |
| Live Ask→export / #5 | **Parked** — not claimed complete |
| Scientifically validated claimed | **No** — none |

### Step 03

| Criterion | Result |
|-----------|--------|
| Metadata ingest from permitted public providers | **Yes** — Europe PMC / Open Targets / CT.gov fixtures + live harness |
| Provenance, timestamps, source IDs, licensing signals | **Yes** — snapshot + receipt hashes |
| Passage import fail-closed until humanCleared | **Yes** — forced false; #2 PARKED |
| Entity resolution + relationship candidates (not promoted) | **Yes** — ontology resolve + OT candidates |
| Outcome sections show retrieved evidence / disclose gaps | **Yes** — `livingEvidence` on outcome + panel 01 |
| Scientifically validated claimed | **No** — none |
| Human queue disturbed | **No** — remains PARKED |

### Step 04

| Criterion | Result |
|-----------|--------|
| Gap recommendations classified vs bound evidence | **Yes** — `gapVerification` on outcome + panel 03 |
| Distinguish missing local data vs unresolved questions | **Yes** — deterministic kinds + abstain |
| Traceable reverse bindings | **Yes** — claim / PMID / OT disease ids on each item |
| Expert-labelled / scientifically validated | **No** — #4 PARKED; honesty flags false |
| New agent catalogue invented | **No** — claim_verifier adapter only |
| Human queue disturbed | **No** — remains PARKED |

**Verify:** read this register; `jq . operations/capability-register/capability-register.v1.json`; `bun run gap-verification:check`; `bun run living-evidence:check`; optional `bun run r3:check`.
