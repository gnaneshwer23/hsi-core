# ADR-009 — Unified HSI Agent Intelligence Architecture (Phase 1)
Status: PROPOSED — contracts and audit only; no runtime activation
Date: 2026-11-04
Scope: HSI core, ISI, Aksh Health, HSI Clinical, HSI Trials

## Decision
Standardise nine research reasoning roles through a shared versioned contract and permissioned tool registry. The existing ARCH-003 question/evidence/falsification engines remain authoritative implementations where applicable. Human review is an external authenticated service, not an AI agent. Clinical orchestration stays in Aksh CONDUCTOR and must not be duplicated in hsi-core. HSI core must not ingest identifiable clinical records into public research tools.

## Source-grounded repository audit
Reviewed hsi-core files: src/interrogativeContracts.ts, src/interrogativeQuestionEngine.ts, src/interrogativeEvidenceEngine.ts, src/interrogativeFalsificationEngine.ts, src/db/authenticatedInterrogativeStore.ts, src/server/interrogativeApi.ts, src/akshAgents.ts, site/src/features/science/researchOrchestrator.ts, docs/strategy/HSI_EXISTING_AGENT_AUDIT.md and HSI_AGENT_ORCHESTRATION_STRATEGY.md. External Aksh/ISI runtime assertions below derive from existing repository audits, not a fresh execution of those repos.

| Standard role | Current observed asset | Classification | Phase 2 action |
|---|---|---|---|
| Question Planner | Deterministic SSc question engine | Implemented bounded planner; no LLM | Adapter |
| Entity Resolver | Typed local graph, ontology plans | Partial; no verified unified resolver | Implement tool adapter |
| Evidence Retriever | Published release evidence interrogation | Partial; no live literature retrieval in ARCH-003 | Permissioned retrieval adapter |
| Graph Reasoner | Explicit curated binding and release interrogation | Partial; not a general path search | Constrained graph tool |
| Interrogator | Question tree, discriminating/falsifying templates | Partial deterministic | Reuse ARCH-003 |
| Contradiction Analyst | Falsification signals and local UI contradiction engine | Partial deterministic | Reuse, add source-level validation |
| Hypothesis Generator | SSc candidate mechanism templates; local UI blocks autonomous inference | Partial templates | Draft-only adapter |
| Claim Verifier | Release eligibility and review checks | Partial deterministic | Independent assertion-level verifier |
| Safety & Policy Gate | Governance validators, deny-by-default auth | Partial distributed rules | Deterministic central policy service |

Other audited assets: Aksh register has 14 entries, but hsi-core holds a catalog, not an executable Aksh clinical runtime; its historical audit calls Aksh simulation/in-validation. ISI research adapter is not evidence of a deployed multi-agent swarm. The site researchOrchestrator is explicitly deterministic_local_analysis, with no live retrieval, persistence or approvals.

## Canonical contract strategy
- Preserve existing InterrogativeInvestigation and its release fingerprint; add an explicit versioned agent-run envelope and adapters. Never silently reinterpret old fields.
- Separate data class, epistemic kind, evidence assessment, review status and graph publication status. A supported claim is not automatically approved.
- Preserve source passage provenance, licence, context, version, evidence polarity and contradictions.
- Every run must have investigationId, role, manifest version, prompt/model version, tool allowlist, bounded budgets, immutable trace references and failure state.
- Tools are deny-by-default; clinical patient.context.get is unavailable to research agents. Graph publication and review signing are unavailable to all AI agents.
- An agent may propose a hypothesis; only a verified human can approve scientific claims. Approval of a brief does not approve its underlying claims or publish a graph release.
- A graph path is an association chain unless independently supported causal evidence exists; never invent numeric confidence scores.

## Dependencies
1. Phase 1: role manifests, schema validation, tool policy and compatibility tests (no agent execution).
2. Phase 2: server-side orchestration with immutable run traces, retries and cancellation; reuse ARCH-003 engines.
3. Phase 3: registered evidence/graph tools with rights checks and release-version pinning.
4. Phase 4: verification and review integration, immutable decision versioning and audit.
5. Phase 5: independently reviewed SSc benchmark and cross-product adapters.

## Blocking risks
- Current evidenceKind mapping defaults unknown epistemic types to established_evidence; change to fail-closed before scientific use.
- Review decision table enforces one decision per investigation; revision/resubmission requires a versioned investigation chain.
- Existing investigation fingerprint and canonical JSONB persistence hashes differ; explicit versioned hash semantics are required.
- Research workbench API is not yet deployed or validated with real accounts.
- Staging currently lacks real research users, reviewer grants, published releases and investigations; no live scientific claims can be made.
- Existing source-level Aksh/ISI runtime evidence is historical; re-audit external repos before integration.

## Acceptance criteria for Phase 1
- Nine roles have explicit schemas and denied-by-default tool manifests.
- Contracts reject patient data in research context and disallow autonomous approval/publication.
- Existing ARCH-003 contracts remain compatible and unchanged.
- No simulated agent run is presented as live.
- Tests and CI pass. No database migrations or production deployment.
