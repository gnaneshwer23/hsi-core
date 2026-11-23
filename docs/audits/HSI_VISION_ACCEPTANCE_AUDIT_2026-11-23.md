# HSI end-to-end vision acceptance audit — 2026-11-23

Base: `main` at `1802d9f9` (PR #651 merged). Open at time of writing: PR #652 (negation backstop). Scope: audit against the end-to-end vision brief, offline only. No live provider, live model, deployment, migration or database write was made. Every status below is a **verified-by-this-audit** statement; anything not exercised says so.

## 1. Reconciliation with canonical documents

| Brief says | Repository says | Resolution |
|---|---|---|
| Five-class conflict taxonomy (compatible, contextual difference, candidate contradiction, insufficient, unresolved disagreement) | Canonical taxonomy exists: `consistent`, `potential_conflict`, `context_dependent`, `methodological_difference`, `insufficient_evidence` (`src/evidence/contextConflictAudit.ts`) | Use the repository taxonomy. Mapping: compatible→consistent, contextual difference→context_dependent, candidate contradiction→potential_conflict. The repository adds `methodological_difference`; it has no `unresolved_disagreement` (disagreement that survives review is a review state, not an audit class). Not changed. |
| 120-case immunology benchmark (50/30/20/20) | `HSI-BENCH-IMMUNO`: exactly 120 canonical slots, protocol hash `99bf96a0…`; 0 authored, 0 adjudicated | Matches. Target only. |
| Eight-dimension rubric | Eight dimensions scored 0–5 in `docs/P1_B_IMMUNO_BENCHMARK_ACCEPTANCE.md`, explicitly "proposed rubric anchors, to be reviewed and hash-locked" | Not frozen; thresholds and floors unapproved. Do not report aggregate scores as acceptance. |
| 13 responsibilities | Not 13 processes: tool pipelines across modules (`docs/strategy/HSI_AGENT_AND_CAPABILITY_CATALOGUE.md`, `HSI_RESTRUCTURED_VISION.md`) | Mapped in §3. No agent added. |

Capability register (`docs/STATUS.md`, 49 rows): 18 implemented, 29 partial, 2 stub. **Deployment and scientific columns are `not_assessed` / `not_verified` / `not_accepted` for every row that touches the investigation path.** This audit does not change that.

## 2. Acceptance scenarios

Level key: **F** = fixture-tested (recorded model output, synthetic passages); **M** = module test only; **B** = blocked; none of these is live or scientific acceptance.

| # | Scenario | Result | Evidence |
|---|---|---|---|
| 1 | Complete fixture-backed investigation | **F** pass, labelled synthetic | `scripts/run-investigation.ts --fixture research/runner-fixtures/*.json`; `scripts/rehearse-live.ts` 13/13. Both fixtures end `insufficient_evidence`: recorded extraction fills ~6 of 17 context fields. |
| 2 | Authorised live retrieval | **B** | Needs source-policy signer, KMS signing key, two approved verifier deployments, model keys (`docs/LIVE_RUN_RUNBOOK.md` §0). Not provided. |
| 3 | Metadata-only, no permitted passage | **M** pass | `sourceIntegrity`, `clearanceAuthority`, `evidenceIngestion` (57 pass). Audit blocks with `blockedReason` when `passageUsePermitted` is false. |
| 4 | Restricted/unverified rights | **M** pass | same suites |
| 5 | DOI/PMID/title mismatch | **M** pass | `liveProviderVerification`, `sscLiteratureVerification`, `evidenceLedger`, `scientificContradictionLedger` (21 pass); logic in `src/researchV2/publicationLinkage.ts` |
| 6 | Correction/retraction | **M** pass | retraction blocks release/access in the same suites and `clearanceAuthority` |
| 7 | Mouse offered as human participant evidence | **F** pass | Species differences → `context_dependent` (`agentAdversarial`). A species quote of "human" from a humanised-mouse passage is refused and the unit abstains (PR #654; `visionAcceptance` S7). The rule is conservative and also abstains on some legitimate sentences. |
| 8 | Opposing findings, comparable conditions | **F** pass | `agentAdversarial`: `potential_conflict`, never approved or promotable |
| 9 | Conflict explained by method/context | **F** pass | species, dose → `context_dependent`; assay/sample size → `methodological_difference` |
| 10 | Missing context → abstention | **F** pass | missing species → `insufficient_evidence`; no policy → every pair abstains |
| 11 | Exact quote does not entail claim | **F** pass | verifiers returning `insufficient` leave audit `needs_evidence`, no receipt (`visionAcceptance` S11) |
| 12 | Model agreement despite failed grounding | **F** pass | both verifiers "supports" with no span, or a span absent from the passage, are downgraded to `insufficient` (S12) |
| 13 | Timeout, rate limit, cancellation | **M** pass | `boundedAgentExecution`, `askLiveResearchControls`, `hsiAgentOrchestrationCancel`, `nexusTerminalStates` (44 pass); audit runner has deadline and abort. No real provider 429 observed. |
| 14 | Prompt injection inside a source | **F** pass | A compromised model cannot record a value absent from the passage; a passage carrying instruction-like text is excluded before extraction and recorded as a gap (PR #654; S14). The detector is a tripwire, not a guarantee. |
| 15 | Cross-user access | **M** pass | `gatewayTenantAuthority`, `jobDelegation`, `nexusWorkerGrants`, `collaborativeInvestigationContracts`, `contextAuditArchive` (68 pass) |
| 16 | Researcher self-approval | **M** pass | `authenticatedEvidenceReview`, `contradictionActivationGate` (18 pass incl. 16/17) |
| 17 | Artifact modified after review | **M** pass | `boundContextAuditOutcome`, audit-hash validation: an edited audit fails `validateContextConflictAudit` (S19) |
| 18 | AI → canonical graph without authority | **M** pass | `atlasProposals`, `atlasDepartments`, `graphRelease` (16 pass): proposals are draft, non-promotable, tamper-evident |
| 19 | Versioned export and provenance replay | **F** pass | same recorded run reproduces the same audit hash; one changed passage changes it; edited artifact fails validation (S19). Literature brief: `verifyLiteratureBrief`. Hash is tamper-evident, not authenticated. |
| 20 | Trial overlap shown as confirmed eligibility | **M** pass | `cohortTrialCriteriaResearch`, trial pre-screen suites (13 pass): categories never say eligible; "similarity never satisfies eligibility" |

Scenarios 1–2 and the whole table are about engineering behaviour. None establishes scientific validity.

## 3. The 13 responsibilities

Highest status **demonstrated by this audit**. LIVE TESTED, DEPLOYED and PRODUCTION ACCEPTED were not assessed and are not claimed for any row.

| Name | Implementation | Verified status | Notes |
|---|---|---|---|
| NEXUS | `src/hsiAgentOrchestrator.ts`, `nexusJobs.ts`, `nexusWorker.ts`, `nexusRunCommand.ts`, `investigationRunner.ts` | FIXTURE TESTED | Durable journal, authenticated worker, cancel, dead-letter. The live path uses a one-request orchestrator (`liveRun.ts`), not the journal. Fixture API is not wired to Vercel (no durable disk). |
| SCOUT | `src/liveSearch.ts`, `governedLiteratureRetrievalExecutor.ts` | FIXTURE TESTED | Never called a real provider in this audit. |
| AEGIS | `src/researchV2/sourceIntegrityService.ts` | FIXTURE TESTED | Blocked on signer and source policy (F-11). |
| LANTERN | `src/evidence/modelEvidenceExtraction.ts` | FIXTURE TESTED | Two defects found and fixed (#651, merged); negation backstop in #652. No live model run. |
| ATLAS | `src/knowledgeGraph/graphAgents.ts`, `domainGraph.ts` | FIXTURE TESTED | Read-only; 157 nodes, 131 edges; edge kinds are only `source_candidate` and `research_gap`. |
| HELIX | `src/evidence/contextualMechanismComparison.ts`, `graphAgents.ts` | IMPLEMENTED | Abstained on the real graph selection; register marks it disabled. |
| PARALLAX | `src/evidence/contextConflictAudit.ts`, `graphAgents.ts` | FIXTURE TESTED | Graph probe found no comparable pair, so contradiction logic was exercised only through planted fixtures. |
| VANTAGE | `graphAgents.ts`, `falsifiableExperimentProposals.ts`, `hypothesisRegistry.ts` | IMPLEMENTED (partial) | On the graph it returned 30 recorded gaps, not generated hypotheses; several restate textbook facts (HbA1c, metformin) as unresolved. Not re-run: falsifiable proposals. |
| VERITAS | `src/evidence/entailmentVerifier.ts`, `researchV2/modelEntailment.ts` | FIXTURE TESTED | Depends entirely on verifier models; see KNOWN LIMITS. Live only with keys. |
| ARBITER | `src/evidence/authenticatedEvidenceReview.ts`, review packet code | FIXTURE TESTED | No reviewers provisioned. |
| SENTINEL | `src/sentinel.ts` | FIXTURE TESTED | Scheduled source re-evaluation and freshness gate only. The brief's "failures, drift and monitoring signals" are not implemented. |
| CALIBER | `src/caliberHarness.ts`, `evidence/immunoBenchmarkScoring.ts` | FIXTURE TESTED | Scores audits; never invents gold; zero adjudicated cases, so no accuracy number exists. |
| WARDEN | `src/governedToolGateway.ts`, `gatewayCallerAuthority.ts` | FIXTURE TESTED | Adversarially tested; tenant scoping verified offline. |

## 4. Scientific evaluation

Nothing here is adjudicated. Fixture scores (e.g. conflict classifier 100% on 5 self-authored cases, kappa 0.57 below the 0.6 floor) test the harness only and are marked `publishable: false`.

- `conflict-benchmark --expert`: BLOCKED, no expert cases in the private vault.
- `n3-scientific-benchmark --eval`: harness cleared; 0 of 24 items labelled; held-out partition empty; `outcomeAccuracy: null`.
- `immuno-benchmark --check`: 120 slots, 0 authored, 0 adjudicated, `BLOCKED`.
- `evaluate-scientific-assistance`: `scientificValidityEstablished: false`.
- Leakage controls (study-family separation) exist in the protocol; they have no cases to act on.

## 5. Defects and limits found

Fixed: (a) context quote "human" matched inside "non-human"; (b) "n=12" matched inside "n=120" (#651, merged). In review: a negated sentence labelled "supporting" could pass verification if both verifiers were fooled (#652).

Fixed in PR #654 (each guard fails its tests when disabled): instruction-like passages are quarantined before extraction; an audit with incomplete verification carries an explicit gap; identical passage text across sources is flagged as one source family; "human" quoted from an animal-host sentence is refused.

Still pinned as KNOWN LIMIT tests:
1. Verifier disagreement changes only the verifier status and an audit gap, not the conflict class.
2. Differing but unresolvable optional context (e.g. timing) does not block `potential_conflict`; it is listed as limited.

The pasted "scientific agent kit" was not merged: it duplicates existing modules, its quote check and context comparison are weaker, its receipts are unsigned, and its 0–1 evaluation scale differs from the repository's 0–5 rubric.

## 6. Gap register

| Pri | Gap | Dependency | Exit criterion |
|---|---|---|---|
| P0 | No scientific accuracy measurement exists | Independent SMEs label cases in the private vault | 120 adjudicated cases, rubric hash-locked, thresholds approved by scientific lead and methodologist |
| P0 | Live path never exercised | Signer/KMS, source policy, two verifier deployments, model keys, named reviewer | One authorised live run completes `--execute`; receipts verify |
| P0 | No researcher-facing path *produces* a context-conflict audit. Only `src/liveRun.ts` (guarded CLI `--execute`) and `src/investigationRunner.ts` (fixture CLI) do. The API and workbench panel can *view and review* an archived audit (`/api/research/interrogative/:id/context-audit` and `/context-audit-review`, `ContextAuditReviewPanel`), which needs the held durable store. A separate curated-scenario endpoint (`POST /api/research/live-investigation`) exists and was not audited here. | Product decision + durable store (migrations 022–033 held) | Authenticated researcher submits, polls and opens an audit; cross-user isolation tested on staging |
| P0 | Staging gate P0.6 BLOCKED | Staging environment, isolated DB branch, session verifier | Gate returns PASSED_PENDING_SIGNOFF against a real environment |
| P1 | Deterministic backstop weaker than the verifier models for support/oppose (limits 1, 4) | None | Species host-animal recorded; disagreement downgrades class or is shown beside it |
| P1 | Extraction depth: ~6 of 17 fields filled in recorded runs, so most live pairs would abstain | Model deployment and prompt evaluation | Field fill rate and abstention rate measured on adjudicated cases |
| P1 | VANTAGE produces recorded gaps, not hypotheses with predicted observation and falsification criteria | Evaluated hypothesis executor | Proposals carry all brief §6 fields; reviewed by scientists |
| P1 | SENTINEL has no failure/drift monitoring | Alert delivery | Alerts for failed ticks, provider errors, calibration drift |
| P2 | Graph has only candidate and gap edges; no approved edges | Authorised reviewers, publication gate | Reviewed edges exist; paths remain non-causal |
| P2 | Duplicate-passage independence (limit 3) | None | Identical passage text counted once per source family |
