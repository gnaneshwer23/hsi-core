# Backend Integration Matrix (refined brief)

**Status:** Gap audit against the refined Codex Backend Scientific Intelligence brief — **not** production readiness, **not** scientific validity.  
**Date:** 2026-11-08  
**Audited `main` SHA:** `c5c8c3299ce4879757cb0fd0633b80a281a09781`  
**Tip commit:** `c5c8c32 Document fill-ready N1 #2 human principal attestation checklist. (#82)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195`) — never autumn-snow / Akeno / DeliverX  

**Cross-link (do not contradict):** the engineering Phase-1 matrix with execution evidence lives at  
[`docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md)  
(audited tip then was `4452e14` / PR #70; PRs **#72–#82** landed afterward). This audit file uses the **refined brief** status vocabulary and path, and records post-#70 eng work honestly.

**Companions:** [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md) · [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) · [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)

---

## Status vocabulary (refined brief)

| Status | Meaning |
|--------|---------|
| `connected` | Implemented and exercised end to end in the current code path |
| `partially_connected` | Some path exists; a required integration, persistence, or provider feature is incomplete |
| `fixture_only` | Works only with static fixtures, seeded examples, or hardcoded IDs |
| `blocked` | Implementation exists but cannot run because of config, credentials, permissions, or human dependency |
| `missing` | No meaningful implementation exists for the refined brief requirement |
| `out_of_scope` | Deliberately excluded (PHI/CDS, Gate C auto-approve, MoU invention, patient eligibility, …) |

Engineering matrix synonyms map as: Connected → `connected`, Partial → `partially_connected`, Fixture-only → `fixture_only`, Blocked → `blocked`, Missing → `missing`.

---

## Baseline verification

| Check | Result |
|-------|--------|
| Audited `origin/main` tip | `c5c8c3299ce4879757cb0fd0633b80a281a09781` |
| PR [#70](https://github.com/gnaneshwer23/hsi-core/pull/70) | **MERGED** (ancestor) |
| Eng sequence [#72](https://github.com/gnaneshwer23/hsi-core/pull/72)–[#79](https://github.com/gnaneshwer23/hsi-core/pull/79) | **MERGED** (audit → dynamic retrieve → persist → contextual/release-aware → bounded agent → oppose/gap → translational/brief → independent eval) |
| Rights eng-assist + checklist [#81](https://github.com/gnaneshwer23/hsi-core/pull/81)/[#82](https://github.com/gnaneshwer23/hsi-core/pull/82) | **MERGED** — **rights still not CLEARED** (12/12 need human principal) |
| Human residuals #2 / #4 / #5 | **PARKED** — eng must not invent clearance, SME gold, or live journey success |

Honesty freeze: no Gate C auto-approve · no invented MoU / `legalBinding` · no live CDS/PHI · no patient eligibility · fixtures ≠ live evidence · CI green ≠ scientific validity · Open Targets score ≠ causation.

---

## File-level matrix (refined brief axes)

### Evidence retrieval (Phase 2)

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Data / human dependency | Proposed change | Risk | Verification |
|------------|----------------|----------------|--------|----------|------------|-------------------------|-----------------|------|--------------|
| Unpinned researcher query → Europe PMC / OT | `dynamicEvidenceRetrieval.ts` · `europePmcBibliographicLookup.ts` · `openTargetsLookup.ts` | Question → validate → clarify → provider search → search record | `partially_connected` | `test/dynamicEvidenceRetrieval.test.ts` | Local | Network; no Neon in retrieve | Keep; extend cursorMark + OT detail | Provider fail collapsed to empty | Existing + cursor tests |
| Europe PMC `cursorMark` pagination | Bibliographic adapter (+ SSC discovery already had cursor) | Search → `cursorMark=*` → `nextCursorMark` pages · cache key includes cursor + provider version | `partially_connected` → target `connected` (library) | This PR; SSC: `europePmcSscDiscovery.ts` | Local | Europe PMC REST | Wire true cursor into bibliographic + dynamic retrieve | Incomplete coverage claimed complete | Multi-page fixture tests |
| Cache key: query + filters + provider version + params | `createMemoryRetrievalCache` in dynamic retrieve | Cache key `epmc:{providerVersion}:q=…:ps=…:cursor=…` | `partially_connected` | Code inspection + cache test | Local | — | Preserve cursor in key | Stale page reuse | Cache hit test |
| Evidence-status separation fields | Persistence/candidates: `sourceIdentity` · `contentAccess` · `claimSupport` · draft `curationReview` | Retrieve → plan → candidate rows | `partially_connected` | `dynamicEvidencePersistence.ts` | Local / Staging Unknown | Write gate | Align naming with brief snake aliases in exports later | Axes conflation | Persistence honesty tests |
| Open Targets evidence-type / direct vs indirect / score ≠ causation | `openTargetsLookup` keeps `score` + `datatypeScores`; no direct/indirect flag; no underlying evidence-source rows | GraphQL disease→targets | `partially_connected` | OT parse tests | Local | OT GraphQL | Next PR: preserve association evidence types + directness honesty | Score read as causation | OT fixture + schema tests |
| Persist permitted metadata + dedup links | `dynamicEvidencePersistence.ts` · migration `018` · candidate store | Search record → candidates + identity links | `partially_connected` | Persistence tests | Staging Unknown | red-wave write gate | Keep; no auto promote | Duplicate silent drop | Dedup tests |

### Biological context / graph (Phase 3)

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Data / human dependency | Proposed change | Risk | Verification |
|------------|----------------|----------------|--------|----------|------------|-------------------------|-----------------|------|--------------|
| Contextual candidate relationships + axes | `contextualCandidateRelationships.ts` · living-evidence OT candidates | Persist plan → draft pack (`graphPromotable: false`) | `partially_connected` | Contextual tests | Local | #2 for deeper oppose | Preserve `curationReview` / `hsiGrade` / `teachingStatus` | Causal upgrade | Honesty asserts |
| Release-aware draft vs approved | `releaseAwareRetrieval.ts` · brief product surface | Approved channel vs labelled draft | `partially_connected` | Release-aware + brief tests | Local | #5 journey | Keep fail-closed | Draft as approved | Surface label tests |
| Rich relationship JSON (species/tissue/assay…) | Partial biological context axes; not full brief schema | Candidate pack | `partially_connected` | Contextual module | Local | Curator / SME | Extend fields without parallel graph | Invented biology | Schema tests |

### Agent execution / gaps / brief (Phases 4–6)

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Data / human dependency | Proposed change | Risk | Verification |
|------------|----------------|----------------|--------|----------|------------|-------------------------|-----------------|------|--------------|
| Bounded agent vertical stages | `boundedAgentExecution.ts` | Plan → retrieve → mechanism → oppose → gap → hypotheses → brief | `partially_connected` | Bounded agent tests | Local | #2/#4/#5 | Richer execution-record JSON next | Silent approval | Stage status tests |
| Opposing evidence + gap taxonomy | `opposingEvidenceSearch.ts` · `gapVerification.ts` | Oppose retrieve → gap classes | `partially_connected` | Oppose/gap tests | Local | SME #4 | Align gap JSON to brief shape | Coverage≠novelty collapse | Gap tests |
| Translational O-04 + research brief | `translationalEvidenceAttach.ts` · `researchBriefIntegration.ts` | CT.gov / OT → separated planes → brief | `partially_connected` | Translational + brief tests | Local | Optional live | Keep registration≠efficacy | Eligibility inference | Panel honesty |
| Investigation execution record (brief JSON) | Durable checkpoints / stage artifacts; not identical to refined brief envelope | Orchestrator + fences | `partially_connected` | Bounded agent | Local | — | Map to brief `steps`/`artifacts` shape | Trace gaps | Contract test |

### Evaluation (Phase 7)

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Data / human dependency | Proposed change | Risk | Verification |
|------------|----------------|----------------|--------|----------|------------|-------------------------|-----------------|------|--------------|
| Independent evaluation suites | `independentEvaluationSuites.ts` · `evaluation/independent-evaluation/` | Deterministic / live-gated / SME slots | `partially_connected` (eng) · scientific `blocked` | PR #79; STATUS.json | Local | #4 SME · #5 live | Alias path `evaluation/scientific_benchmark_v1/` next PR | Fake SME scores | `eval:independent:check` |
| `evaluation/scientific_benchmark_v1/` | **Missing** as named path; closest: independent-evaluation + gold suite | — | `missing` | Directory absent on audited tip | — | #4 | Scaffold pointing at independent suites; empty SME OK | Claiming benchmark validity | Manifest check |

### Review / privacy / out of scope

| Capability | Implementation | Status | Notes |
|------------|----------------|--------|-------|
| Scientific review validators + auth review store | `scientificReview.ts` · authenticated store | `connected` (service) · live journey `blocked` (#5) | Never agent-as-reviewer |
| CDS/PHI boundary | `cdsPhiBoundary.ts` | `connected` | Refuse live PHI |
| Passage rights clearance (#2) | N1 inventory + eng-assist | `blocked` | 12/12 need human principal |
| Gate C auto-approve / MoU / eligibility / efficacy from OT score | — | `out_of_scope` | Policy |

---

## Top gaps vs refined brief (audited tip)

1. **Europe PMC bibliographic path lacked true `cursorMark` pagination** (SSC discovery had it; dynamic retrieve did not) — addressed in the companion PR on this branch.
2. **Open Targets** still thin vs brief: no GraphQL validation layer beyond parse, no direct/indirect distinction, limited underlying evidence-source preservation (score preserved but must stay non-causal).
3. **`evaluation/scientific_benchmark_v1/`** path missing; independent-evaluation exists with empty SME slots.
4. **Investigation / gap / relationship JSON** shapes are richer in the brief than current durable artifacts (execution envelope, gap record, relationship context).
5. **Live authenticated vertical slice** (#5) and **rights (#2) / SME (#4)** remain human-blocked — eng cannot clear.

---

## Vertical-slice readiness (honest)

```text
Research question → evidence retrieval → biological context → mechanism analysis
→ opposing-evidence → gap assessment → hypothesis comparison → traceable research brief
```

| Stage | Status |
|-------|--------|
| Research question (unpinned) | `partially_connected` |
| Evidence retrieval | `partially_connected` (cursorMark hardening in companion PR) |
| Biological context | `partially_connected` |
| Mechanism analysis | `partially_connected` (bounded stage; not deep science) |
| Opposing-evidence | `partially_connected` |
| Gap assessment | `partially_connected` |
| Hypothesis comparison | `partially_connected` |
| Traceable research brief | `partially_connected` |
| Human review intact | `connected` (validators) · journey `blocked` (#5) |

**Highest-leverage eng slice chosen for companion PR:** Europe PMC `cursorMark` + cache/provider-version fields on the bibliographic → dynamic retrieval path — foundational to every later stage’s coverage honesty.

---

## Anti-patterns (unchanged)

- Do not rebuild adapters or parallel graphs.
- Do not invent rights clearance, Gate C auto-approve, MoU, PHI/CDS, or production readiness.
- Do not treat fixtures or CI green as scientific validity.
- Preserve `curationReview` / `hsiGrade` / `teachingStatus`; source identity ≠ claim support; provider fail ≠ empty evidence.
