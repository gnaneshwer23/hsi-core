# Phase 3 — Living Health Knowledge Graph: integration and acceptance backlog
Date: 2026-11-04
Status: Repository-level architecture audit and implementation backlog; **not live graph validation**.

## Existing modules to reuse
| Capability | Existing implementation | Remaining integration gap |
| --- | --- | --- |
| Canonical governed graph | `src/livingHealthKnowledgeGraph.ts` | Connect approved persisted releases to user-facing explorer; maintain patient-data isolation |
| Identifier resolution | `src/hsiOntologyRegistry.ts` | Review mappings against trusted authority and versioned source catalogues; avoid automated equivalence |
| Evidence + time | `src/hsiEvidenceTemporalDossier.ts` | Authoritative evidence store, contextual uncertainty, source rights and bitemporal query semantics |
| Multi-domain draft adaptation | `src/hsiCrossDomainGraph.ts` | Approved source connectors and evidence-linked review before any release |
| Governed read | `src/hsiGovernedGraphQuery.ts`, `src/db/hsiNeonGraphReadRepository.ts` | Verify scope enforcement and release-version consistency against staging |
| Science UI | `site/src/pages/ScienceGraph.tsx` | Replace editorial-only graph with explicitly selected approved release read model when validated |
| Scientific review | `src/db/authenticatedScientificReviewStore.ts` | Do not equate investigation approval with graph-claim publication |
| Existing ISI | Immunecity graph, atlas and curated relationship IDs | Adapter-based reuse; no duplicate ontology or graph ownership |

## Implementation order

### 3A — Integration contracts and graph boundaries
- [ ] Document exact mappings between existing ISI nodes/relationships and HSI canonical identifiers.
- [ ] Preserve source identifiers, mapping review state, version, and provenance; ambiguous identities remain unresolved.
- [ ] Enforce no patient identifiers or clinical facts in public biomedical graph payloads.
- [ ] Bind graph views to immutable release identity and manifest hash; reject stale or mismatched releases.

### 3B — Source-backed SSc graph
- [ ] Ingest permitted publication metadata and verified extraction records for SSc Tfh–IL-21–B-cell biology.
- [ ] Store each claim as a contextual assertion: population, tissue, cell state, assay, species, intervention and time as applicable.
- [ ] Preserve Ricard/Ly cohort and gating differences; do not label disagreements causal contradictions without reviewer confirmation.
- [ ] Keep abstract-only findings explicitly labelled; no automatic publication of candidate claims.
- [ ] Require human-reviewed claim-level provenance before approved graph release.

### 3C — Evidence and temporal relationships
- [ ] Distinguish source publication time, retrieval time, observed validity interval and review/approval time.
- [ ] Represent contradictory and negative evidence without overwriting prior claims.
- [ ] Support source version, retraction status, licence status and uncertainty.
- [ ] Revalidate published graph claims on source correction, retraction and review revocation.

### 3D — Governed graph read and explorer
- [ ] Server-side query scoping and release selection; never trust browser-supplied access flags.
- [ ] Search by label, exact ontology ID, tissue, cell, pathway, disease and evidence status.
- [ ] Show multi-hop paths with direction, typed predicate, evidence dossier, context, limitations and reviewer status.
- [ ] Provide distinct visual treatment for approved evidence, unreviewed associations, inference and hypotheses.
- [ ] Keep a safe public read-only mode and separately authenticated researcher mode.

### 3E — Verification and release gate
- [ ] Unit/integration tests: identity collisions, dangling edges, unsupported causal claims, missing review, source rights, temporal reversals, invalid manifest and restricted node leakage.
- [ ] Staging tests: persisted graph read, authenticated access, source-to-claim-to-edge trace, audit and rollback.
- [ ] Scientific review: accountable immunologist signs off SSc assertions before public promotion.
- [ ] UX checks: mobile graph navigation, accessible keyboard inspection, meaningful empty/error states.
- [ ] Document exact CI SHA, database branch, dataset version and reviewer sign-off.

## Non-goals for this phase
No clinical patient ingestion, autonomous causal inference, live trial eligibility, migration to Neo4j without a measured need, or automatic promotion from agent output to scientific fact.

## Acceptance definition
Phase 3 is complete only when a real, approved, versioned SSc graph release can be queried through a governed API, explored in the HSI UI, and traced claim-by-claim to licensed source evidence and independent human review. Until then, label the graph a research work-in-progress.
