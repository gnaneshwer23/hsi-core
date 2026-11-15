# Autonomous investigation: Phase 0 repository audit

**Date:** 15 November 2026. **Basis:** `origin/main` at `c35fd9b` (PR #373), read statically. No provider was called, no database was touched, no model was run. Facts below are from code and docs; anything not read is listed under "Not verified".

**Short answer.** The repository already holds most of the *contracts* for the requested system (bounded orchestration, typed investigation records, source adapters, a dual-model verifier seam, a clearance/receipt chain, a candidate-only graph, briefs). It holds almost none of the *runtime*: no model-provider client, no OpenAlex adapter, no worker or scheduler, no enabled persistence. The shortest honest path to the brief's definition of done is therefore a **non-persistent, public-source, deterministic-plus-injected-model investigation**, not a rebuild.

## 1. Implementation truth matrix

Classes: **Op-prod** production operational · **Op-stg** operational in staging · **Not configured** · **Partial** · **Demo** · **Missing** · **Blocked** (external access or authority).

| Capability | Implemented | API connected | Persistent | Tested | Class | Missing |
|---|---|---|---|---|---|---|
| Orchestrator | `src/hsiAgentOrchestrator.ts` (deterministic DAG, permissions, abort); `src/evidence/boundedAgentExecution.ts` (7-stage path, checkpoints) | No (its header says no network, no LLM) | Checkpoint stores exist (`hsiNeonCheckpointStore.ts`); not enabled | Yes (unit) | Partial | Executors that call real tools; budget and cost ceilings; durable host |
| Evidence retrieval | Europe PMC search (`europePmcSscDiscovery.ts`, `researchV2/sourceAdapters.ts`); PubMed E-utilities (`scientificPubmedRetrieval.ts`); Open Targets GraphQL; UniProt; Reactome; ClinicalTrials.gov v2 lookup | Opt-in live check for UniProt and Reactome only (`liveProviderVerification.ts`); PubMed served by a public route (`site/api/scientific-pubmed.ts`); egress allow-list is `www.ebi.ac.uk`, `reactome.org` (`liveReadiness.ts`) | Fixtures only under `research/domain-graph/**/fixtures` | Yes (fixtures) | Partial | **OpenAlex (absent)**; one governed retrieval route; passage text (records are `passageUsePermitted:false`, `licenceId:null`); retraction/correction flags |
| Context extraction | Deterministic annotation and comparison (`contextAnnotationBenchmark.ts`, `canonicalContextualEdge.ts`, `knowledgeGraph/recordedResearchContext.ts`) | No model extraction | n/a | Yes | Partial | Model-assisted extraction of species/tissue/cell state/method/direction from retrieved text |
| Knowledge graph | `src/knowledgeGraph/*`, `hsiCrossDomainGraph.ts`; published digest-verified snapshot (153 concepts; relationships recorded as 131 in the 13 Nov audit and 95 source-candidate in `PRODUCT.md`, reconcile before quoting) | Read from a verified file | Snapshot in repo; Neon read repository exists | Yes + e2e | Op-prod (candidate, read-only) | Candidate layer that agents write to; stale/disputed states in the UI |
| Contradiction analysis | `scientificContradictionLedger.ts`, `researchV2/contextualGraph.ts`, comparison and missingness modules | No | Migrations 024–029 **held** | Yes | Partial / Blocked (hold) | Live inputs; activation |
| Scientific verification | `researchV2/scientificVerification.ts`, `passageVerification.ts`, `scientificEntailment.ts`, `modelEntailment.ts`, `dualModelChallenge.ts` | **No model runner exists**; both model seams take an injected function and carry `modelIndependenceVerified:false` | n/a | Yes (with stubs) | Not configured / Blocked (two approved model deployments) | Provider clients; passage access under cleared source rights |
| Research briefs | `knowledgeGraph/contextBrief.ts` (#373), package/outcome/export in `site/src`, synthetic brief | n/a | Saved-investigation contracts; storage held | Yes | Partial | Brief built from a *live* retrieval; version diff on reopen |
| Background execution | `src/nexusJobs.ts` (append-only file journal with leases); ARCH-009 durable-execution docs | No | File store only | Yes | Partial | Worker host, scheduler, rate limits. Vercel functions here have `maxDuration` 30 s |
| Scientific memory | `researchInvestigationStore.ts`, `investigationWorkspaceStore.ts`, `graphWorkspaceStore.ts`, `knowledgeGraph/investigationFileStore.ts` | Neon stores are guarded | Neon: migrations **022–033 held**; `/api/research/health` reported writes off on 13 Nov | Yes (disposable Neon runs 47/47, author-run only) | Blocked (security review, owner approval) | Independent security reviewer unnamed; activation not approved |

## 2. Current architecture map

Browser (React 19, Vite, prerendered public pages, research workspace) → same-origin Vercel handlers `site/api/auth/*`, `site/api/research/*` (gateway `src/server/vercelResearch.ts`, fail-closed: writes require exact staging pins) → Bun/TypeScript service modules in `src/` → Neon (HSI project only, migrations 022–033 held) and file stores. Public literature routes (`site/api/scientific-pubmed.ts`, `scientific-abstract.ts`, `scientific-investigation-trace.ts`) sit *outside* the research gateway; the 13 Nov audit rates that a P0 control-boundary difference. CI: `.github/workflows/{research-foundation,p0-repository-hygiene,production-probe}.yml`; 375 test files under `test/`.

## 3. Reusable inventory (do not rebuild)

- Agent contracts: `hsiAgentIntelligenceContracts.ts` (roles, tool allow-list), `hsiAgentOrchestrator.ts`, `hsiAgentDurableCheckpoint.ts`, `hsiAgentRecoveryReconciliation.ts`, `hsiFencedArtifact.ts`, `evidence/boundedAgentExecution.ts`.
- Typed investigation: `researchV2/universalInvestigation.ts` (`InvestigationV2`, `ContextualRelationshipV2`, evidence states `raw_evidence → extracted_candidate → researcher_proposal → reviewed → approved`).
- Verification chain: `passageVerification`, `scientificEntailment`, `modelEntailment`, `dualModelChallenge`, `scientificReliabilityGate`, `trustedEvaluationGrounding`.
- Provider safety: `researchV2/pinnedProviderTransport.ts` (DNS pinning, blocks private ranges), `providerReliability.ts`, `stagingProviderOperations.ts`, `sourceClearance*`.
- Graph: snapshot loader and digest check, `networkExplorer.ts`, `evidenceReadiness.ts`, `evidencePreparation.ts`, `graphAgents.ts`, `contextBrief.ts`.
- Governance: `cdsPhiBoundary.ts`, `migrationHolds.ts`, `neonGuard.ts`.
- UI: `InvestigationGraphExperience`, `GraphInvestigation`, `InvestigationEvidenceGraph`, `InvestigationProgress`, `InvestigationDelivery`, `ResearchOutcomePanel`, `SavedResearchInvestigations`.

## 4. API integration inventory

| Provider | In repo | Live path today | Gap against the brief |
|---|---|---|---|
| Europe PMC | Yes | Discovery module and public adapters | Full text where licensed; retraction flags |
| PubMed / NCBI E-utilities | Yes | Public route, 8 s timeout, no key | Key and rate policy; gateway governance |
| OpenAlex | **No** | None | New adapter (needs a project contact address for the polite pool; do not use a personal address) |
| Open Targets | Yes (two modules) | Fixtures and adapter | Association scoring into candidate edges |
| UniProt | Yes | Opt-in verification | Identity and cross-references into graph nodes |
| Reactome | Yes | Opt-in verification | Pathway edges |
| MONDO/EFO/HPO | Registry and import design; ontology tables in held migrations | None | Live normalisation |
| ClinicalTrials.gov v2 | Yes | Lookup module | UI wiring; eligibility text handling |
| OpenAI / Anthropic | **No client** | None | Provider layer, structured outputs, budgets |

## 5. Missing configuration and credentials

Nothing below exists in code or `.env.example`; I have set nothing and invented no values.

- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (server-side only, Vercel project env; never `VITE_*`). Two *different* provider or model deployments are required for provider-independent verification; with one key, label the check "independent execution", not "independent provider".
- A spend cap set at each provider console, plus `HSI_MODEL_BUDGET_USD_PER_RUN` and `HSI_MODEL_BUDGET_USD_PER_DAY` (new, to be defined with the provider layer).
- `NCBI_API_KEY` (optional, raises E-utilities rate limit); an OpenAlex contact address (project mailbox, your choice).
- Existing and unchanged: `HSI_RESEARCH_WRITES_ENABLED`, `HSI_NEON_*` pins, `HSI_SHARED_ADMISSION_URL`. Do not set the writes flag as part of this work.
- A worker host if scheduled monitoring is wanted (none exists; Vercel functions cap at 30 s here).

## 6. Security and persistence findings

1. **No model-provider code exists**, so "server-side credentials, budgets, retries" is new code, not a wiring task.
2. **Legacy public literature routes bypass the research gateway** (13 Nov audit P0, still present: `scientific-pubmed.ts` uses plain `fetch`). New retrieval must go through one governed route using `pinnedProviderTransport`, not extend the legacy ones.
3. **Persistence is blocked by policy, not by missing code.** 022–033 are held; 031–033 passed author-run disposable-branch tests only; the independent reviewer is unnamed. "Save and reopen" can only be browser-local or the existing file journal until that changes. Do not lift holds to enable a demo (the brief itself forbids it).
4. **Stored passages are not permitted by default** (`passageUsePermitted:false`, `licenceId:null`). Briefs may cite identifiers and abstracts only where the provider's terms allow; full-text excerpts need a cleared source.
5. **Prompt injection:** retrieved text is already treated as untrusted in the entailment instruction and quote checks. Keep that, and add length caps and schema-strict outputs in the provider layer.
6. **Verifier independence:** `dualModelChallenge` enforces distinct runner/model/verifier identities but cannot prove independence (`modelIndependenceVerified:false`). Keep that flag in any UI.
7. **Autonomy vs fail-closed:** the repository's contract keeps agent output at `extracted_candidate`/`researcher_proposal`. The brief's "candidate layer, no silent promotion" matches it; no change to promotion rules is needed or proposed.
8. **Boundary:** no PHI and no CDS in this repo. Clinical-trial eligibility text is displayed as public record text only; no eligibility determination.

## 7. Prioritised plan

**P1: first complete investigation (smallest slice, no persistence, no holds touched)**
1. Governed retrieval route: question → Europe PMC + PubMed (+ OpenAlex adapter, Open Targets, UniProt, Reactome, ClinicalTrials.gov) via the pinned transport; typed `PublicSourceRecord` with provenance (provider, id, DOI/PMID, date, retrieved-at, URL, licence status, status/error); failed searches kept visible.
2. Deterministic scoping and entity mapping against the published snapshot; candidate relationships emitted as `extracted_candidate` in a separate layer; supporting and opposing kept apart; empty opposing search shown as "not found in these sources", never consensus.
3. Model provider layer (`src/modelProviders/*`): OpenAI and Anthropic clients, structured outputs, timeouts, retries with backoff, token and USD budgets, health check, no secret logging. Injected into the existing `EntailmentModelRunner`; absent keys yield a visible "model step not configured" state.
4. Verifier pass using `dualModelChallenge`, abstain when insufficient.
5. Brief from `contextBrief.ts`, with execution metadata and a version id; export; **browser-local save/reopen** labelled as such.
6. UI: wire into `InvestigationGraphExperience` with a "Curated" vs "Live" switch; progress shows only events the run actually emitted.
7. Tests, build, real browser run of the SSc/IL-21 scenario A.

**P2:** durable execution (worker host, journal → store once holds lift), cancellation, cost ledger. **P3:** scientific memory once 031–033 are accepted. **P4/P5:** scenarios B and C as structured records, scheduled monitoring, polish. Not started until P1 works end to end.

## 8. Files expected to change in P1

New: `src/modelProviders/{openai,anthropic,budget,health}.ts`, `src/evidence/openAlexLookup.ts`, `src/investigation/liveRun.ts`, `site/api/research/live-investigation.ts` (name to confirm), `research/scenarios/il21-autoimmune.json`, tests. Edited: `src/researchV2/sourceAdapters.ts`, `src/hsiAgentIntelligenceContracts.ts` (tool ids), `site/src/components/InvestigationGraphExperience.tsx`, `site/vercel.json` (rewrite and function duration), `site/bundle-budget.json` if the entry grows.

## 9. Not verified

No deployed environment variable values; no live provider call; production behaviour since 13 Nov; whether PRs #15–#251 still overlap; whether the 131 vs 95 relationship figures differ by definition or by snapshot version.
