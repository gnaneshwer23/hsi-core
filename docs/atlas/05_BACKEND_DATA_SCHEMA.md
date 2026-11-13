# Backend and data contract reconciliation

Requirements A01/A02/A03/A05/A07/A09/A10. Use existing versioned contracts rather than introducing thirteen disconnected schema names.

| Requested concept | Existing authority / reconciliation | Missing work |
|---|---|---|
| BiologicalEntity | `HsiGraphNode` in [livingHealthKnowledgeGraph.ts](../../src/livingHealthKnowledgeGraph.ts); public `DomainNode` uses stable local IDs | Reviewed ontology identifiers and collisions for public candidates |
| DiseaseContext | Recorded `DomainEdge.conditions`; `atlasDiseaseContexts` catalogue explicitly `not_mapped` | Reviewed MONDO/DO/EFO/HPO hierarchy pack; never infer IDs from strings |
| ScientificRelationship | `HsiGraphRelationship` and public `DomainEdge` | Reviewed adapter between candidate and governed graph; preserve association vs causal semantics |
| EvidenceRecord | `DomainSource`, [researchContracts.ts](../../src/researchContracts.ts), corpus/source-clearance receipts | Current retrieval/version/rights/retraction receipts before egress or promotion |
| ExperimentalContext | `DomainEdge` model/design/tissue/population/assay/time/intervention/outcome; passage-linked context contracts | Cleared dose/unit/estimand and missingness acceptance |
| GraphSnapshot | `DomainBundle` / canonical graph release contracts | Historical deployed snapshots and accepted scoped DB query pagination |
| Investigation | [investigationGraphContext.ts](../../src/investigationGraphContext.ts), [interrogativeWorkspace.ts](../../src/interrogativeWorkspace.ts), delivery/store contracts | Generalise SSc-primary release binding through independently accepted scopes |
| AgentTask / AgentFinding | `HsiAgentTask`, run envelope/result and audited evidence-unit contracts | Server-bound selected-context invocation and persisted actual execution receipt |
| ScientificVerification | [scientificReliabilityGate.ts](../../src/researchV2/scientificReliabilityGate.ts), [dualModelChallenge.ts](../../src/researchV2/dualModelChallenge.ts), outcome verification receipt | Approved live providers and scientific acceptance; agreement alone is insufficient |
| ResearchHypothesis | Existing domain question prediction/falsifier/experiment, [helixMechanism.ts](../../src/helixMechanism.ts) | Independently reviewed usefulness, no approval through generation |
| ReviewDecision | [investigationDelivery.ts](../../src/investigationDelivery.ts), review authority services and [reviewPacket.ts](../../src/reviewPacket.ts) | Real scoped reviewer grants/acceptance and separate graph publication decision |

## Logical layers

A: biological entities and typed relationships. B: source/evidence/experimental context. C: immutable investigations, comparisons, drafts and hypotheses. D: clearance, verification, independent decisions, version/audit/retraction. These are logical responsibilities across existing contracts; no new physical database, graph service or migration is necessary for department navigation.

[atlasDepartments.ts](../../src/knowledgeGraph/atlasDepartments.ts) is a version-controlled navigation catalogue, not an ontology or rights authority. Department projections return original object references and IDs. `netDepartment` is a view parameter allowlisted by `investigationHandoff`; snapshot `domainVersion` remains the data identity. Candidate status, source version and false promotion flags are not rewritten. Literal publication lookup searches metadata; no restricted passages are indexed by this slice.

## Migration boundary

Inspect HSI-only migration ledger and runtime roles via approved read-only staging access first. Existing [db/migrations/014_hsi_investigation_graph_context.sql](../../db/migrations/014_hsi_investigation_graph_context.sql), 020 RLS, 022 scientific records, 023 community, 024–029 contradiction scopes and 030 live evidence are separate acceptance scopes. Do not lift them as a batch. No migration, new identity, RLS change or production DB operation occurs here.

Acceptance: [atlasDepartments.test.ts](../../test/atlasDepartments.test.ts), [domainGraph.test.ts](../../test/domainGraph.test.ts), [hsiOntologyRegistry.test.ts](../../test/hsiOntologyRegistry.test.ts), [livingHealthKnowledgeGraph.test.ts](../../test/livingHealthKnowledgeGraph.test.ts), [investigationGraphContext.test.ts](../../test/investigationGraphContext.test.ts), [stagingIsolationRunner.test.ts](../../test/stagingIsolationRunner.test.ts). Live pooled isolation, rollback and restore require separate evidence and approval.
