# Phase 3 — Living Health Knowledge Graph: Repository Audit and Controlled Milestones
Date: 2026-11-04
Status: Milestone 3.1 in implementation; CI must pass before acceptance.

## Canonical vision preserved
HSI owns its governed logical graph. Four logical layers: restricted Patient Context; Human Biology and Physiology; Gut–Immune–Metabolic; Biomedical Evidence and Trials. Four connected products remain Aksh Health, HSI Clinical, ISI and HSI Trials. Scientific agents propose; independent reviewers approve. No patient facts enter the public graph. No causal promotion of associations. No automatic publication.

## Reusable repository assets audited
- docs/architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md: adopted target-state graph ownership.
- docs/strategy/HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md: master planning source.
- site/src/features/science/typedGraphSchema.ts: typed scientific graph with predicate type rules and evidence/review checks; site-specific.
- site/src/features/science/knowledgeGraph.ts: editorial biology catalogue projection, marked reviewed:false.
- src/graphRelease.ts: source-rights, provenance and human-review gating for published releases.
- db/migrations/001_hsi_substrate.sql: HSI claims, edges and marker substrate; not a full canonical node store.
- Existing evidence ingestion, interrogative science and research gateway modules are reuse candidates, not automatically production-ready.
- ARCH-009 agent runtime remains separate from graph ownership.

## Gaps
1. Shared domain-neutral versioned node/edge schema across the four logical layers.
2. Cross-ontology identifiers with non-equivalence mapping types.
3. Governed graph persistence, versioned canonical entity identity and access-scoped retrieval.
4. Temporal and assay/population/species context, retraction/contradiction lifecycle.
5. Source-specific adapters for physiology, microbiome, trials and authorised clinical context.
6. Contract alignment with existing release and typed science graph; avoid parallel sources of truth.
7. Independent scientific reviewer workflow for canonical graph assertions.
8. Integration and evaluation across patient, biology, evidence and trials with privacy-preserving joins.

## Controlled delivery
- 3.1: Shared logical contract and validation; tests; no migration, no deployment.
- 3.2: Versioned ontology registry, identity resolution, explicit exact/broad/narrow/related mapping with collision tests.
- 3.3: Evidence-context and temporal assertion contracts, rights/retraction status, provenance and review links.
- 3.4: Governed canonical graph storage/read APIs and migration on disposable Neon branch first; release gates and ACL.
- 3.5: Scientific graph adapter from existing typedGraphSchema and evidence release; preserve editorial vs approved distinction.
- 3.6: Gut–immune–metabolic and trial adapters, context-aware cross-domain queries.
- 3.7: Restricted patient context policy interface and authorised joins only after safety/privacy validation.
- 3.8: Graph explorer integration, scientific QA, performance tests and researcher-supervised acceptance.

## Explicit boundaries
This first milestone does not migrate existing data, create clinical integrations, ingest patient information, approve evidence, publish graph claims or deploy production. Existing site graphs and release systems are not replaced. The canonical schema is a draft contract until integrated with review and access enforcement.
