# Phase 9 — Four-department integration acceptance matrix

**Status: coverage requirements defined, not implementation or scientific sign-off.**

The four first-class scientific departments are **Immunology, Microbiome, Neurobiology, Metabolism**. Existing entry routes are listed in `src/evidence/scientificDepartmentCoverage.ts`. Their presence does not prove that corresponding knowledge graphs, source adapters or UI journeys are complete.

## Acceptance criteria (apply to each department)
1. Discoverable specialist research entry point and independently navigable investigation workflow.
2. Typed ontology entities, cross-ontology identifiers, entity resolution and versioned mappings.
3. Real source ingestion with immutable source locators, data-use rights and provenance.
4. Explicit species, tissue, cell type, disease, temporal and experimental context.
5. Distinct established evidence, association, computational inference and unvalidated hypothesis states.
6. Human-review boundary, scoped access, audit trails and no silent promotion.
7. Search, graph navigation, contradiction investigation, source inspection and export.
8. Measured evidence quality and blinded expert review with predefined metrics.

## Cross-department requirements
- Shared graph identities must link biological entities without treating co-occurrence as mechanism.
- Cross-department traversal must preserve source context and show missing or contradictory evidence.
- Initial scenarios: gut–immune–brain–metabolic axis, immunometabolism, microbial metabolite–microglia interactions.
- SSc is an immunology benchmark only; it must not constrain the four-department platform.

## Phase 9 remaining release blockers
- Resolve and verify PR #195 CI fix, then validate this branch CI.
- Consolidate stacked PRs #183–#195 with no duplicated Reactome commits.
- Run real Reactome and UniProt provider verification, including error paths.
- Prove authenticated end-to-end researcher workflow and controlled graph access.
- Obtain independent scientific evaluation across all four departments.
- Document per-department coverage gaps and make an explicit release decision.

**Decision: NO-GO** until engineering, scientific, security and governance gates pass.
