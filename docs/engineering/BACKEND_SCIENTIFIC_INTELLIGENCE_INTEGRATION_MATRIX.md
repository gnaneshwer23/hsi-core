# Backend Scientific Intelligence — Integration Matrix (Phase 1)

**Status:** Baseline audit only — **not** production readiness, **not** scientific validity.  
**Date:** 2026-11-08  
**Audited `main` SHA:** `4452e14b7a40d8ebfec978d9cc9b63d1d7b23719`  
**Tip commit:** `4452e14 Step 04: agent intelligence and gap verification (#70)`  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  
**Companions:** [`HSI_CAPABILITY_REGISTER_2026-11-08.md`](./HSI_CAPABILITY_REGISTER_2026-11-08.md) · [`../product/HSI_DEFINITIVE_PRODUCT_SPEC.md`](../product/HSI_DEFINITIVE_PRODUCT_SPEC.md) · [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) · [`HUMAN_QUEUE_RESIDUALS.md`](./HUMAN_QUEUE_RESIDUALS.md)

## 1. Baseline verification

| Check | Result |
|-------|--------|
| `origin/main` tip | `4452e14b7a40d8ebfec978d9cc9b63d1d7b23719` |
| GitHub PR [#70](https://github.com/gnaneshwer23/hsi-core/pull/70) | **MERGED** 2026-11-08T18:38:16Z — merge commit **is** current `main` HEAD |
| Commits on `main` after #70 merge | **None** |
| PR [#68](https://github.com/gnaneshwer23/hsi-core/pull/68) (step-02 UI) | **MERGED** (ancestor of tip: `9b41ebb`) — not open |
| Open PRs that may affect baseline (do **not** auto-merge) | [#71](https://github.com/gnaneshwer23/hsi-core/pull/71) landing redesign; [#61](https://github.com/gnaneshwer23/hsi-core/pull/61) RA dossiers; [#60](https://github.com/gnaneshwer23/hsi-core/pull/60) SSc–RA comparison; [#34](https://github.com/gnaneshwer23/hsi-core/pull/34) body explorer; [#15](https://github.com/gnaneshwer23/hsi-core/pull/15) Stage B SSc |

**Honesty freeze (unchanged):** no Gate C auto-approve · no invented MoU / `legalBinding` · no live CDS/PHI · no patient eligibility inference · fixtures ≠ live scientific evidence · CI green ≠ scientific validity · Aksh / ISI optional integrations only.

A file existing is **not** proof a capability is connected. Status vocabulary for this matrix:

| Status | Meaning |
|--------|---------|
| **Connected** | Wired into an authenticated or harness-exercised product path with inspected execution evidence |
| **Partial** | Core code path exists; journey incomplete, rights-gated, or honesty-limited |
| **Fixture-only** | Deterministic fixtures / synthetic labels; must not be presented as live science |
| **Blocked** | Waiting on human queue, rights, ops secret, or policy |
| **Missing** | Specified in brief / product outcome but no wired implementation |

Deployment labels: **Local** | **Staging** | **Production** | **Unknown**. Production write enablement is not claimed (`writesEnabledClaimed=false` / staging-gated writes).

---

## 2. Distinct states that must NOT be conflated

These axes are **orthogonal**. Phase 1 acceptance tests encode non-conflation; later phases must preserve them.

### 2.1 Source identity

| State | Meaning |
|-------|---------|
| `verified` | Provider returned a record whose external id matches the query (PMID/DOI/NCT/MONDO) |
| `unresolved` | Query accepted; identity not yet confirmed against a provider record |
| `invalid` | Query rejected before provider call (malformed PMID/DOI/NCT) |

### 2.2 Content access

| State | Meaning |
|-------|---------|
| `metadata` | Bibliographic / registry / association metadata only |
| `abstract` | Abstract text permitted under disclosed licence signals (not yet a clearance) |
| `licensed_full_text` | Full text stored only after verified reuse rights (`humanCleared` / licence evidence) |

**Current substrate default:** metadata-only. Passage import remains fail-closed (`humanCleared=false`, `passageImported=false`, human queue #2 PARKED).

### 2.3 Claim support

| State | Meaning |
|-------|---------|
| `supported` | Authorised review bound supporting evidence to the claim |
| `partial` | Some overlapping evidence; support incomplete or contextual only |
| `unsupported` | Evidence examined; does not support the claim |
| `not_assessed` | Retrieval/metadata present without support adjudication |

**Living-evidence candidates force `claimSupport: false` / not assessed.** Open Targets Europe PMC–derived literature ≠ independent corroboration of an HSI claim.

### 2.4 Scientific review

| State | Meaning (investigation / claim planes) |
|-------|----------------------------------------|
| `draft` | Editable researcher artifact; not releasable |
| `pending` / `awaiting_scientific_review` | Submitted; locked for independent reviewer |
| `approved` / `approve_with_limitations` / `reviewed` | Human reviewer decision recorded |
| `rejected` | Human reject |

Service-layer Gate C patterns (`validateScientificReview`, `recordAuthenticatedScientificReview`) never auto-approve. Browser/agent identity is never trusted as reviewer principal.

### 2.5 Search-record failure outcomes (must stay distinct)

Successful empty results are **not** provider failure.

| Outcome class | Example substrate encoding | Must not become |
|---------------|----------------------------|-----------------|
| Successful empty | Europe PMC `ok: true` + `records: []` | “Provider down” |
| Truncated / page-limited | `pageSize` bound lookups | Silent completeness claim |
| Partial | Some pins ok, some fail in expansion snapshot | Full landscape claim |
| Provider unavailable | `outcome: "provider_unavailable"` (401/403) | **“No evidence found”** |
| Invalid query | `assertValidPmid` / DOI / NCT throws or fail outcome | Empty evidence set |
| Permission / licence | rights signals present; clearance absent | Passage import / claim support |

Dedup concepts (design constraint for later PRs):

| Concept | Meaning |
|---------|---------|
| **Record identity** | One provider record (e.g. PMID, NCT) |
| **Study identity** | Logical study that may have multiple records / versions |
| **Independent evidence** | Separate study/source lineage — Open Targets association literature derived from Europe PMC is **not** independent corroboration of the same finding |

### 2.6 Graph path (release-aware)

```text
candidate store → verification → authenticated review → approved release → release-aware retrieval
```

Draft findings may surface **only** when explicitly labelled draft / candidate / fixture. Auto-promotion of inferred relationships into approved graph is forbidden (`graphPromotable: false` on living-evidence candidates).

---

## 3. File-level integration matrix

### 3.1 Evidence ingestion and living metadata

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Metadata-only Europe PMC ingest by PMID | `src/evidenceIngestion.ts` · `parseEuropePmcMetadata` · `fetchEuropePmcMetadata` · `SSC_INITIAL_PMIDS` | CLI / harness → `fetchEuropePmcMetadata` → parse → metadata record (`licence_status: "metadata_only"`) · no claim approval | **Partial** | `test/evidenceIngestion.test.ts`; inspected code refuses full-text storage | Local / Unknown | Keep; extend query-shaped retrieval without rebuilding adapter | Network; no Neon write in this module |
| Bibliographic lookup with failure taxonomy | `src/evidence/europePmcBibliographicLookup.ts` · `lookupEuropePmcByPmid` · `lookupEuropePmcByDoi` · `searchEuropePmcByQuery` · `parseEuropePmcBibliographicPayload` · `BibliographicLookupFail.outcome` | Caller → HTTP Europe PMC → parse → `ok`+records (+ hitCount/truncation) **or** typed fail (`provider_unavailable`, `provider_http_error`, `invalid_response`, `oversized_response`, `timeout_or_network`) | **Connected** (library) | Fail outcomes + unpinned search path; living-evidence + `dynamicEvidenceRetrieval` tests | Local harness; optional `living-evidence:live` | Preserve fail ≠ empty | Provider availability |
| Open Targets disease→target metadata | `src/evidence/openTargetsLookup.ts` · `lookupOpenTargetsDiseaseAssociations` · `parseOpenTargetsDiseasePayload` (bounded pageSize) | Caller → OT GraphQL → associations metadata · `graphPromotable: false` · `scientificApproval: false` · `sourceIdentity: verified` on ok | **Connected** (library / pin + dynamic disease ids) | `test/livingEvidenceExpansion.test.ts`; `test/dynamicEvidenceRetrieval.test.ts`; fail outcomes include `provider_unavailable`, `disease_not_found` | Local / Unknown | Keep; do not treat as independent lit corroboration | OT API |
| ClinicalTrials.gov identity lookup | `src/evidence/clinicalTrialsGovLookup.ts` · `lookupClinicalTrialsGovByNctId` · O-04 compose `translationalEvidenceAttach.ts` | Caller → CT.gov v2 → identity/metadata · PHI-shaped payload rejected · landscape attach separates registry vs outcomes | **Partial** → **Connected** (library + outcome bind) | Living-evidence NCT pin; `projectTranslationalForOutcome` / researchOutcome trials planes | Local | Keep registration≠efficacy; missing results≠failure | Optional live provider; red-wave unchanged |
| Living evidence expansion (pinned set) | `src/evidence/livingEvidenceExpansion.ts` · `runLivingEvidenceExpansionFromFixtures` · `projectLivingEvidenceForOutcome` · pins `LIVING_EVIDENCE_*` | Harness → fixtures or live probe → snapshot + receipt → `researchOutcome` livingEvidence bind | **Partial** / **Fixture-only** offline | `test/livingEvidenceExpansion.test.ts`; `bun run living-evidence:*`; Audit step 03 | Local | Broaden beyond pins only after rights + dynamic query design | Human queue #2 for passages; pins today |
| SSC literature discovery search | `src/evidence/europePmcSscDiscovery.ts` · `searchSscLiterature` | Discovery API / scripts → Europe PMC search → `LiteraturePage` | **Partial** | `test/europePmcSscDiscovery.test.ts`; `sscDiscoveryApi` | Local / Staging Unknown | Prefer composing with bibliographic fail taxonomy | Must not collapse provider fail → empty hit list |
| Source registry / provenance import | `src/sourceRegistry.ts` · `importSourceMetadata` · schema module | Pack build → registry → edge provenance | **Partial** | `test/sourceRegistry.test.ts` | Local | Keep identity ≠ claim-support fields explicit | Curator packs |
| N1 source verification / candidate queue | `src/evidence/n1SourceVerification.ts` · `n1CandidateQueue.ts` · `n1PassageRightsInventory.ts` | Ops worksheets → status receipts · rights inventory | **Blocked** (rights) | Audits N1; human queue #2 PARKED | Local worksheets | No invent `licenceEvidenceUri` | Human rights clearance |
| R1 biomedical source packets | `src/evidence/r1BiomedicalSourcePackets.ts` | Eng deepen harness → packet honesty | **Fixture-only** / eng | `test/r1BiomedicalSourcePackets.test.ts` | Local | Keep quarantine honesty | #2/#4 humans |

### 3.2 Graph services and release path

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Living Health Knowledge Graph contracts | `src/livingHealthKnowledgeGraph.ts` · ontology `src/hsiOntologyRegistry.ts` | Packs / adapters → LHKG nodes/edges | **Partial** | Capability register F-02; domain/claim graph builders | Local packs | Extend curation — no parallel graph | Curator depth |
| Fail-closed release assessment | `src/graphRelease.ts` · `assessReleaseClaim` · `createCandidateManifest` · `computeReleaseManifestHash` | Claim + sources + reviews → eligible only if approved + rights + support polarity | **Connected** (service) | `test/graphRelease.test.ts`; release integrity tests | Local; release IDs env-bound on staging | Keep fail-closed; never auto-promote living candidates | Authorised reviews + licence status |
| Authoritative release store | `src/db/authoritativeReleaseStore.ts` · migrations `011`/`014` graph context | Authenticated read → Neon release rows → governed query | **Partial** | Migration audits; governed graph tests | Staging Unknown; Production Unknown | Verify live E2E before any readiness claim | red-wave URL; reviewer authority |
| Governed / release-aware graph read | `src/governedGraphRead.ts` · `src/hsiGovernedGraphQuery.ts` · `src/db/hsiNeonGraphReadRepository.ts` · `src/server/sscGraphReadService.ts` | `GET /api/research/graph/ssc` → session → Neon / release projection | **Connected** (API path exists) | Workbench + API tests; R3 mapping | Staging Unknown | Preserve release filter; draft labelled only | Auth + `HSI_SSC_RESEARCH_RELEASE_ID` |
| Science graph adapter (ISI/HSI) | `src/hsiScienceGraphAdapter.ts` · `src/adapters/isiGraphReleaseAdapter.ts` · `isiPinnedRelease.ts` | Optional ISI consume → HSI release view | **Partial** | Adapter tests; ISI optional | Unknown | Keep optional — not prerequisite | Partner/ISI wiring human-gated |
| Graph relationship candidates from OT | `livingEvidenceExpansion` · `LivingEvidenceGraphRelationshipCandidate` | Expansion → candidates with `graphPromotable: false` · `needsHumanReview: true` | **Partial** | Snapshot honesty asserts | Local | Human promote path later — no auto-approve | Scientific review |
| Claim / domain knowledge graphs (site) | `src/knowledgeGraph/claimGraph.ts` · `domainGraph.ts` · site explorers | Static/build JSON → UI | **Partial** | site e2e claim/domain specs | Production marketing Unknown | Do not treat explorer as approved release | Content packs |

### 3.3 Agent orchestration and gap intelligence

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Agent intelligence contracts + orchestrator | `src/hsiAgentIntelligenceContracts.ts` · `src/hsiAgentOrchestrator.ts` · durable checkpoint / fenced artifact modules | In-process plan → executors → checkpoints (no LLM swarm) | **Partial** | `test/hsiAgentOrchestrator.test.ts`; ARCH-009 docs | Local | Reuse claim_verifier; no new agent catalogue | Migrations 009/010 |
| Bounded agent execution with durable traces | `src/evidence/boundedAgentExecution.ts` · composes orchestrator + checkpoints/fences + PR2–7 retrieval/persist/candidates/oppose/gapVerification/researchBriefIntegration | Question → plan → retrieve → mechanism → oppose → gaps → hypotheses → integrated research brief · durable stage artifacts | **Partial** (library; journey still gated) | `test/boundedAgentExecution.test.ts`; `test/researchBriefIntegration.test.ts` | Local | Keep cancel/retry/idempotency; untrusted retrieved text | Live journey #5; SME #4 |
| Gap verification classifier | `src/evidence/gapVerification.ts` · bind in `src/researchOutcome.ts` · UI `ResearchOutcomePanel` §03 · opposing search receipt | Outcome / bounded agent → classify gaps (coverage ≠ novelty) → panel | **Connected** (eng classes + PR 6 taxonomy) | `test/gapVerification.test.ts`; PR #70/#77 | Local | Keep abstention; await SME gold; never auto-verify | Human queue #4 |
| Opposing-evidence search (bounded) | `src/evidence/opposingEvidenceSearch.ts` · wired in bounded agent oppose stage | Question → oppose-oriented dynamic retrieval → search scope/date/limitations receipt | **Partial** (metadata; Europe PMC + OT only) | `test/opposingEvidenceSearch.test.ts` | Local | Provider fail ≠ no evidence; incomplete ≠ consensus | Passage rights #2; SME #4 |
| claim_verifier adapter | `src/hsiArch003AgentAdapters.ts` · `createGapVerificationExecutor` | Orchestrator role → gapVerification | **Connected** (adapter) | `test/hsiArch003AgentAdapters.test.ts` | Local | No parallel verifier | — |
| Interrogative engines (question / evidence / falsification) | `interrogativeQuestionEngine.ts` · `interrogativeEvidenceEngine.ts` · `interrogativeFalsificationEngine.ts` | Investigation draft → engines → saved corpus | **Partial** / often **Fixture-only** | Multiple interrogative tests | Local / Staging | Fresh retrieval still rights-gated | #2/#5 |
| Grounded brief (N4) | `src/evidence/groundedBrief.ts` | Brief compiler from recorded evidence | **Partial** | `test/groundedBrief.test.ts` | Local | Source-linked brief in vertical slice — compose, don’t rebuild | Review gate |

### 3.4 Review workflows, auth, privacy

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Service-layer scientific review validation | `src/scientificReview.ts` · `validateScientificReview` | Trusted principal → validate → `ReviewRecord` (no publish) | **Connected** (service) | `test/scientificReview.test.ts` | N/A library | Preserve auth + COI + rationale gates | Reviewer role |
| Interrogative scientific review | `src/interrogativeScientificReview.ts` · `validateHsiScientificReview` | Decision DTO → validation against investigation | **Connected** | Review tests | Library | Keep | — |
| Authenticated review persistence | `src/db/authenticatedScientificReviewStore.ts` · `submitInterrogativeForReview` · `recordAuthenticatedScientificReview` | API POST submit-review / decision → Neon Auth actor → reviewerAuthority → transactional decision | **Connected** (code path) · live journey **Blocked** (#5) | Store module + migration 008; R3 honesty | Staging gated writes | Never agent-supplied reviewer identity | `HSI_RESEARCH_WRITES_ENABLED` + staging branch; human #5 |
| Reviewer authority | `src/db/reviewerAuthority.ts` · migration `005` | Decision → current SSc authority check | **Connected** | Auth tests / staging prep audits | Staging Unknown | Keep | Provisioned roles in red-wave |
| Neon Auth gateway + research handler | `src/server/neonAuthGateway.ts` · `src/server/vercelResearch.ts` · `handleVercelResearch` · `site/api/auth/*` · `site/api/research/*` | Browser → Vercel Bun → provider session → DB session token → interrogative API | **Connected** (eng) | `test/vercelResearch.test.ts`; deployment config tests | Staging / Production config Unknown | Preserve origin/auth/write gates | Secrets: `HSI_DATABASE_URL` red-wave only, auth URLs |
| CDS/PHI boundary | `src/cdsPhiBoundary.ts` · `docs/CDS_PHI_BOUNDARY.md` | Reject helpers on ingest/consume honesty | **Connected** | Module invariants; honesty regressions | All | Keep refuse-PHI / notCds | Policy |
| Scientific review store (legacy/service) | `src/db/scientificReviewStore.ts` · history modules | Queue/history APIs | **Partial** | API path allowlist in `vercelResearch` | Staging Unknown | Do not bypass interrogative lock | Auth |

### 3.5 Research APIs, workbench, frontend

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Interrogative CRUD / outcome / brief / package | `src/server/interrogativeApi.ts` · stores under `src/db/*` | Authenticated `/api/research/interrogative/{id}/…` | **Connected** (fixture path) | R3 + interrogative API tests | Staging Unknown | Extend retrieve stage for dynamic evidence | #5 live session |
| Connected research journey mapping | `src/researchConnectedWorkbench.ts` · `src/evidence/r3ConnectedResearchWorkbench.ts` | Ask→Retrieve→Investigate→Verify→Review→Export API map + UI decision-workbench | **Partial** / **Fixture-only** honesty | `test/r3ConnectedResearchWorkbench.test.ts`; step-02 merge | Local / Staging | Vertical slice uses **unpinned** question next | Human #5 |
| Research outcome 01–06 panel | `src/researchOutcome.ts` · `site/src/components/ResearchOutcomePanel.tsx` · `researchOutcomeClient.ts` | Outcome API → client → sections 01–06 | **Connected** (UI eng) | Step 02/03/04 audits | Staging Unknown | Keep honesty labels for trials/gaps | — |
| Synthetic workspace fixture | `src/researchWorkspaceTestFixture.ts` · seed script | Fixture investigation id → APIs | **Fixture-only** | Banner + hashes; must stay labelled | Local | Never present as live evidence | — |
| Mechanism / decision workbenches | site pages + `InvestigationProgress` | Shared chrome → same APIs | **Partial** | site e2e investigation specs | Unknown | Nav consolidate — no rebuild | — |
| Gold / scientific evaluation harness | `src/goldEvaluationSuite.ts` · R2 · `scientificEvaluation.ts` · N3 worksheets · **PR 8** `independentEvaluationSuites.ts` (deterministic / live-gated / scientific slots) | Offline harness · `labelledRows=0` · `smeSlotsFilled=0` · live `HSI_LIVE_INTEGRATION_EVAL` gated | **Blocked** (science) / eng **Partial** (PR 8 scaffold) | R2 tests; N3 status; `test/independentEvaluationSuites.test.ts`; [`BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md`](./BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md) | Local | Do not invent SME labels or fake live success | Human #4 / #5 |
| Evidence + experiment ledgers | `src/evidence/evidenceLedger.ts` · `experimentLedger.ts` · migrations 016/017 · Neon stores | Ledger write gate → red-wave | **Partial** | Ledger tests; Audit #6 | Staging Unknown | Continuous re-verify later | Write gate |

### 3.6 DB migrations (substrate)

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| HSI substrate + ownership + review guardrails | `migrations/001`–`003` | `bun run db:migrate` → red-wave only | **Connected** (schema) | `docs/HSI_NEON_MIGRATIONS.md`; neonGuard | Local / Staging Unknown | No autumn-snow | Human ops for prod |
| Investigations + reviewer authority + access | `004`–`006` | Research grants | **Connected** (schema) | Migration docs | Staging Unknown | — | Role provisioning |
| Interrogative contracts + review audit | `007`–`008` | Review lock + decisions | **Connected** (schema) | authenticatedScientificReviewStore | Staging Unknown | — | — |
| Agent checkpoints + fenced artifacts | `009`–`010` | Durable agent runs | **Partial** | Agent recovery tests | Local | — | — |
| LHKG governed graph + dossiers + hardening | `011`–`013` (+ `012_isi_research_review`) | Graph read/security | **Partial** | ARCH-002 audits | Staging Unknown | — | Ops verify |
| Investigation graph context + delivery | `014`–`015` | Graph-context + delivery APIs | **Connected** (schema/API) | delivery / graph-context tests | Staging Unknown | — | — |
| Evidence + experiment ledgers | `016`–`017` | Ledger persistence | **Partial** | Audit #6 | Staging Unknown | — | Write gate |

### 3.7 Missing / blocked relative to Backend Scientific Intelligence brief

| Capability | Implementation | Execution path | Status | Evidence | Deployment | Change | Dependency |
|------------|----------------|----------------|--------|----------|------------|--------|------------|
| Dynamic retrieval from researcher question **without** pre-pinned PMIDs/DOIs | `src/evidence/dynamicEvidenceRetrieval.ts` · extends `searchEuropePmcByQuery` / `lookupOpenTargetsDiseaseAssociations` | Question → entity clarify → live metadata search → search record | **Partial** (retrieve + fail taxonomy; persist via PR 3) | `test/dynamicEvidenceRetrieval.test.ts` | Local | Keep | Fail taxonomy; rate limits; rights |
| Persist permitted metadata for arbitrary search hits into candidate store with full state axes | `src/evidence/dynamicEvidencePersistence.ts` · `src/db/dynamicEvidenceCandidateStore.ts` · migration `018` · extends `hsi_evidence_sources` | Retrieve → plan (draft axes) → memory/Neon store · identity links · preserved search record | **Partial** (library + staging-gated Neon; live journey write still gated) | `test/dynamicEvidencePersistence.test.ts` | Local / Staging Unknown | Keep; no auto graph promote | Write gate; red-wave only |
| Contextual candidate claims + opposing findings for new questions | `src/evidence/contextualCandidateRelationships.ts` · extends living-evidence OT candidates + dynamic persistence plan · biological context axes · finding polarity · limitation classes | Persist plan / OT records / declared context → labelled draft candidate pack (`graphPromotable: false`) · oppose status includes completed_bounded / provider_unavailable | **Partial** (library) | `test/contextualCandidateRelationships.test.ts` | Local | Keep; no auto graph promote; axes orthogonal | Passages #2 for deeper oppose |
| Release-aware retrieval (draft vs approved separation) | `src/evidence/releaseAwareRetrieval.ts` · `projectReleaseAwareProductSurface` in `researchBriefIntegration.ts` · outcome / brief bind | Published release → approved channel; draft candidates only when `includeDraftCandidates` + surfaceLabel; product surface keeps channels separate | **Partial** (library + thin product surface) | `test/contextualCandidateRelationships.test.ts`; `test/researchBriefIntegration.test.ts` | Local | Keep fail-closed; never render drafts as approved | Full workbench journey #5 |
| Hypothesis comparison + source-linked brief for unpinned questions | `boundedAgentExecution` + `researchBriefIntegration` · composes PR2–6 artifacts + optional O-04/release-aware (groundedBrief remains N4 path) | Bounded run / outcome → integrated brief (`scientificValidityClaimed: false`; limitations + next actions) | **Partial** (product bind; no efficacy inference) | `test/researchBriefIntegration.test.ts`; `test/boundedAgentExecution.test.ts` | Local | Keep review intact; candidates unapproved | Passage rights #2; SME #4 |
| O-04 translational landscape on investigation | `src/evidence/translationalEvidenceAttach.ts` · `researchOutcome` trials planes · ResearchOutcomePanel §04 | CT.gov v2 study (+ optional OT targets) → separated registry/status, intervention↔target, registry results, published locators, missing evidence | **Partial** (library + outcome/UI bind; default still `not_queried` until snapshot supplied) | `test/translationalEvidenceAttach.test.ts` | Local | Keep registration≠efficacy; missing≠failure; no eligibility | Live attach journey optional |
| Production readiness / scientific validity claims | — | — | **Blocked** | Human queue #2/#3/#4/#5/#8 PARKED | — | Human clearances only | Never invent |

---

## 4. Proposed PR sequence (1–8)

| PR | Focus | Gate |
|----|-------|------|
| **1 (this)** | Baseline audit, file-level matrix, Phase 1 acceptance scaffolding | Matrix + tests merge-ready for human review; no science claims |
| **2** | Dynamic retrieval (unpinned question → entity clarify → live metadata search) extending Europe PMC / OT adapters · `dynamicEvidenceRetrieval.ts` | Provider fail ≠ empty; source identity ≠ claim support; metadata-only; Neon persist deferred to PR 3 |
| **3** | Persist permitted metadata → candidate store; explicit draft labelling · identity links (record/study/independence) | No auto graph promote; red-wave only; OT≠independent EPMC corroboration |
| **4** | Contextual candidate claims + opposing findings + limitation classification + library release-aware draft/approved gates (`contextualCandidateRelationships` · `releaseAwareRetrieval`) | Oppose incomplete ≠ consensus; review gate intact; drafts labelled only |
| **5** | Bounded agent execution with durable traces (plan → retrieve → mechanism → oppose → gaps → hypotheses → brief) wiring orchestrator + PR2–4 | Cancel/retry/idempotency; untrusted text; brief honesty; no efficacy/eligibility inference |
| **6** | Opposing-evidence search + gap assessment taxonomy (coverage ≠ novelty; expert review requires scope/date; semantic support required) | Incomplete coverage ≠ verified novelty; provider fail ≠ no evidence; no Gate C auto-approve |
| **7** | Translational O-04 + research-brief product bind + release-aware UI/API surfaces | Fail-closed `assessReleaseClaim`; compose PR 4–6 libraries |
| **8** | Independent evaluation (deterministic regression · gated live walkthrough hooks · scientific SME slots) + limitations report | Three suites stay separate; no invented SME gold; live gated; scientific acceptance BLOCKED until humans |

Aksh / ISI remain optional side wires — never prerequisites for PRs 2–8.

---

## 5. First vertical-slice acceptance criteria (next work — document only)

Target journey (implement in PR 2+, not this PR):

```text
New researcher question
  → clarify entities
  → retrieve live evidence
  → persist permitted metadata
  → contextual candidate claims
  → opposing findings
  → classify limitations
  → hypothesis comparison
  → source-linked brief
  → human review intact
```

**Test question must NOT rely on already-pinned source identifiers** (`LIVING_EVIDENCE_PMID_PINS` / SSC initial PMIDs are insufficient as the sole path).

Acceptance (engineering, not science):

1. Unpinned natural-language (or structured entity) input produces typed search attempts.
2. Provider unavailable / invalid query / permission outcomes are surfaced distinctly from successful empty.
3. Persisted rows are metadata (or abstract only if rights allow) with `claimSupport=not_assessed` until review.
4. Candidates remain `graphPromotable=false` until authenticated human review + release assessment.
5. Fixture / synthetic paths stay banners-labelled and never flip Gate C / MoU / CDS-PHI / eligibility.
6. Open Targets associations citing Europe PMC do not count as independent corroboration without separate study identity.

---

## 6. Anti-patterns (audit conclusions)

- Do not rebuild platform or parallel adapters — extend `europePmcBibliographicLookup`, `openTargetsLookup`, living-evidence, interrogative APIs, `graphRelease`, review stores.
- Do not auto-promote inferred relationships into approved graph.
- Do not import restricted full text without verified reuse rights.
- Do not infer patient eligibility, clinical efficacy, or causal benefit.
- Do not treat CI green as scientific validity.
- Do not claim production readiness without live E2E verification.
- Auth, provenance, scientific review (`curationReview` / investigation review state / `hsiGrade`-class honesty where present), and privacy boundaries stay intact.

---

## 7. Top-line status rollup

| Status | Capabilities (short) |
|--------|----------------------|
| **Connected** | Bibliographic fail taxonomy; OT/CT.gov lookup libraries; gapVerification + claim_verifier adapter; scientific review validators; Neon Auth→interrogative API shell; release assessment fail-closed; outcome 01–06 UI bind |
| **Partial** | Living-evidence (pinned); governed graph read; agent orchestrator + bounded durable traces; grounded brief; ledgers; discovery search; workbench journey |
| **Fixture-only** | Research workspace test fixture; R1/R3 synthetic honesty paths; offline living-evidence replay |
| **Blocked** | Passage rights (#2); SME gold (#4); live researcher journey completion (#5); scientific acceptance; MoU/partner locks |
| **Missing** | Live authenticated journey completion (#5) |
| **Partial (PR 8)** | Independent evaluation suites scaffold (deterministic CI contracts · live gated-not-run · empty SME scorecard) — see limitations report; not scientific validity |
| **Partial (new)** | Dynamic candidate persist + identity links (PR 3); contextual candidates + release-aware gates (PR 4); bounded agent durable traces (PR 5); opposing-evidence search + gap taxonomy (PR 6); O-04 translational attach + research-brief / release-aware product bind (PR 7) — not production-ready |

## 8. Verify (Phase 1)

```sh
bun --no-env-file test test/backendScientificIntelligencePhase1Acceptance.test.ts
```

Optional related honesty:

```sh
bun --no-env-file test test/livingEvidenceExpansion.test.ts test/gapVerification.test.ts test/scientificReview.test.ts test/syntheticE2eHonestyRegression.test.ts
```
