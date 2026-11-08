# HSI Capability Register — 2026-11-08

**Execution step:** 01 Repository reconciliation  
**Master spec:** [`../product/HSI_DEFINITIVE_PRODUCT_SPEC.md`](../product/HSI_DEFINITIVE_PRODUCT_SPEC.md)  
**Machine-readable:** [`../../operations/capability-register/capability-register.v1.json`](../../operations/capability-register/capability-register.v1.json)  
**Tip audited:** `main` at R1–R3 eng scaffolds + SEO (`f2682d6` lineage)

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
| F-02 | Living graph + evidence/claim contracts | `implemented` | `src/livingHealthKnowledgeGraph.ts`, `src/researchContracts.ts`, `src/graphRelease.ts` | Graph not always bound to a live question-specific investigation UI | Keep contracts; connect via journey (step 02) |
| F-03 | Source provenance, versions, review records | `implemented` / partially `connected` | `src/evidence/evidenceLedger.ts`, `src/db/evidenceLedgerStore.ts`, investigation delivery/review APIs | Reverse trace not first-class in all result UIs | Surface passage→claim→branch in outcome/workbench views |
| F-04 | RA / SSc evidence packages | `implemented` · not `scientifically_validated` | `research/ra-anti-tnf/`, `research/ssc-tfh-il21/`, R1 packets | Rights/passages pending (#2); SME gold empty (#4) | Bounded integration tests only until humans clear |
| F-05 | Saved investigation + research outcome APIs | `connected` | `src/server/interrogativeApi.ts`, `src/researchOutcome.ts`, `GET …/outcome`, delivery/export | Composes **saved** evidence; no new scientific generation | Power one continuous journey (step 02) — do not replace APIs |
| F-06 | Research dashboard + multiple workbenches | `implemented` · **duplicated UX** | `/research/dashboard`, `/research/scientific-workbench`, `/research/decision-workbench`, `/research/mechanism-workflow`, Capability Lab, science pages | Scientist must hop tools; R3 path exists but under-linked from dashboard | Consolidate navigation around decision-workbench + mechanism-workflow |
| F-07 | Synthetic patient validation records | `synthetic_only` | `src/syntheticValidationDataset.ts`, `/research/validation`, dashboard profiles | Risk of looking like real cohorts if labelling slips | Keep separate; never promote into evidence package |
| F-08 | Trial / therapeutic scaffolding | `implemented` · mostly `planned` for live landscape | `src/trialsCriteriaMvp.ts`, `src/clinicalResearchScaffold.ts`, `src/evidence/n5RegistryLiveRefresh.ts`, `/science/clinical-trials` | No full versioned development landscape in investigation 04 | Extend registry snapshots into same investigation object |
| F-09 | Scientific evaluation harness | `implemented` · `blocked` for science | `src/goldEvaluationSuite.ts`, R2 suite, `src/modelEvalHarness.ts`, N3/N6 worksheets | `labelledRows=0`, `smeGoldFilled=false` | Complete harness wiring; **do not invent labels** |
| F-10 | AI orchestration + agent contracts | `implemented` (contracts/orchestrator) · not end-to-end scientific | `src/hsiAgentIntelligenceContracts.ts`, `src/hsiAgentOrchestrator.ts`, durable checkpoint/recovery, `site/src/features/science/researchOrchestrator.ts` (local deterministic) | Tool IDs are allowlisted; live literature/LLM tools not product-connected | Audit+connect (step 04); reuse contracts |

---

## B. Investigation outputs 01–06

| ID | Output | Status | Evidence | Gap | Next eng action |
|----|--------|--------|----------|-----|-----------------|
| O-01 | Scientific landscape | `connected` (partial) | Interrogative plan + graph-context + mechanism dossier (`src/immuneMechanismInvestigation.ts`, workbench) | Not a curated landscape narrative for arbitrary questions; release-bound only | Compose landscape section from existing release + mechanism map in outcome |
| O-02 | Evidence comparison | `connected` (partial) | Support/oppose traces in interrogative contracts; science contradiction UI (`contradictionEngine`) | Cross-species/context comparison incomplete; empty oppose ≠ consensus | Bind oppose searches + context fields into outcome view |
| O-03 | Gap intelligence | `implemented` (coverage/gap reports) · not scientist-ranked | `src/gapReport.ts`, research coverage, local gap_investigator role | Gap objects often coverage/mapping gaps, not verified scientific gaps | Gap verification pipeline (step 04); keep abstention |
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
| Research Gap Investigator | gap reports + local role | `planned` as verified gaps | Expert-labelled cases required |
| Therapeutic / Trial Investigator | trials MVP, N5, ATLAS catalog (Aksh) | `planned` product depth | Step 05 |
| Research Planning Agent | Falsification / question engines, outcome next steps | `connected` (recorded) | No invented protocols |
| Evidence Verifier | Claim/passage hashes, outcome compiler, Gate C patterns (ISI) | `connected` integrity · `blocked` scientific approval | Human #2/#3/#4 |

---

## D. Evidence forward / backward

| Direction | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Forward: source → claim → graph → investigation | `connected` (release-bound) | Research bundles, graph release, interrogative branches, R3 retrieve/investigate | Fresh ingest + entity resolution incomplete (step 03) |
| Backward: recommendation → claim → passage → source | `connected` (partial) | Outcome passages/sources/hashes; review-package; mechanism dossier sources | Not consistently one-click from every UI surface |
| Continuous re-verify / version | `planned` / ledger scaffold | Evidence ledger N2, temporal dossier | Step 07; no silent overwrite |

---

## E. R3 unified journey (prep for step 02)

| Stage | API | UI | Status |
|-------|-----|----|--------|
| Ask | `GET /api/research/interrogative/{id}` | decision-workbench | `connected` (fixture) |
| Retrieve | `…/graph-context` | same | `connected` |
| Investigate | `GET /api/research/graph/ssc` | mechanism-workflow / graph | `connected` |
| Verify | `…/outcome` | delivery / outcome | `connected` |
| Review | `POST …/submit-review` | reviewer surfaces | `connected` eng · `blocked` live #5 |
| Export | `…/review-package` | export | `connected` eng · `blocked` live #5 |

**Verdict:** Engineering journey contract is present (`src/researchConnectedWorkbench.ts`, `/research/mechanism-workflow`). Scientist “one continuous journey” is **not** complete: dashboard still centres synthetic profiles; multiple workbenches remain; live Ask→export needs human #5.

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

## G. Step 02 — Unified research journey (implementation plan)

**Do now (small reconnects in this PR):**

1. Dashboard hero/secondary CTA and bottom tools link the **Connected path** (`/research/mechanism-workflow`) and decision workbench.
2. Decision workbench nav links Connected path + dashboard (journey continuity).
3. Mechanism-workflow page links dashboard as workspace home.
4. Register documents acceptance and remaining work.

**Do next (Cursor plan — no landing redesign):**

1. Single authenticated entry: start/resume investigation → decision-workbench stages already mapped by R3; deep-link mechanism steps to the same `investigationId`.
2. Outcome UI sections mapped 01–06 using existing `projectResearchOutcome` fields (landscape from mechanism map + answer; comparison from support/oppose; gaps from recorded gaps; trials stay `not_queried` until step 05; export already O-06).
3. Hide or demote synthetic validation profiles from the primary “research connected” hero so fixtures stay labelled secondary.
4. One progress chrome (reuse `InvestigationProgress`) shared across workbench + mechanism-workflow.
5. Stop when live #5 is required — do not fake session completion.

**Out of scope for 02:** new architecture, new agent catalogue, public landing redesign, Gate C/MoU/CDS, autumn-snow for HSI.

---

## H. Acceptance for step 01

| Criterion | Result |
|-----------|--------|
| One verified capability inventory | **Yes** — this document + JSON |
| Disconnected/duplicated flagged | **Yes** — §F |
| No unnecessary rebuilds | **Yes** — preserve APIs, packs, contracts |
| Scientifically validated claimed | **No** — none |
| Human queue disturbed | **No** — remains PARKED |

**Verify:** read this register; `jq . operations/capability-register/capability-register.v1.json`; optional `bun run r3:check`.
