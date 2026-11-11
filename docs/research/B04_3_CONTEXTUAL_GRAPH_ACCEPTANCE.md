# B-04.3 — Context-conditioned candidate graph integration (draft)

## Position in the HSI architecture
Stacked on B-04.2 public source adapters, reuses B-04.1 universal investigation/evidence-state contracts. Does not replace the existing `knowledgeGraph/claimGraph.ts` or `domainGraph.ts`, and cannot write to the trusted Living Health Knowledge Graph.

## Real-source workflow
1. Use B-04.2 Open Targets adapter with **verified** EFO identifiers for RA, SLE, SSc. Never assume example IDs in tests are actual disease mappings.
2. Fetch disease-target aggregate associations as public metadata. Preserve source identifier, API version, retrieval timestamp, disease context, target ID and association score.
3. Build a read-only candidate graph: disease → target associations, and publication metadata nodes from Europe PMC.
4. Compare shared targets across diseases; explicitly label results **shared association candidates**, not established mechanisms.
5. Attach tissue/cell/pathway nodes only when provided with documented context, with no inferred biological edges. A future passage-backed verification adapter must support scientific relationships.
6. Investigate mechanisms using primary publications and reviewer-approved source excerpts in subsequent milestones; capture tissue, cell, method, species, cohort, uncertainty, and contradictory results.
7. Keep candidate and approved graph views separate. Only independent review plus an authorized server-side publishing service may promote a relationship.

## Acceptance
- [ ] B-04.2 dependency merged and adapter contract stable
- [ ] Typecheck, Bun tests, complete GitHub CI pass
- [ ] Live Open Targets schema and disease identifier mappings verified
- [ ] Real public retrieval for three disease contexts, with source provenance and no invented mechanisms
- [ ] Cross-disease shared target candidates clearly distinguished from causal/mechanistic claims
- [ ] Rejection tests for duplicate records, invalid scores, restricted sources, unsupported passage claims
- [ ] No patient-level records, Neon migrations, runtime roles, PHI or trusted graph writes
- [ ] Human scientific review and source rights remain blocking gates for approved biological relationships

## Explicit limitations
No live API calls or real disease-target results are embedded in this PR. Test IDs are synthetic. Europe PMC publication metadata does not itself establish a target–cell–tissue–pathway relationship. Source licensing must be independently verified before reuse of passages. A-01 remains blocked pending independent security acceptance.
