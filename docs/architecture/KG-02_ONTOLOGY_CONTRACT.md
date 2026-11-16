# KG-02 slice 1: ontology mapping contract and verifier

Implemented: the contract (`src/knowledgeGraph/ontologyMapping.ts`), a verifier, a check script (`bun run ontology:check`, part of `bun run check`) and tests. **No mapping data exists yet**, so no concept has a canonical identifier and the explorer is unchanged. The first batch is slice 3 and needs the owner's review.

## What the verifier enforces
- Exact file shape and schema version; no unknown keys.
- Every `conceptId` exists in the graph (dangling ids are rejected).
- Namespace is one of HGNC, UniProt, MONDO, HP, CL, UBERON, ChEBI, ChEMBL, Reactome, GO, and the identifier matches that namespace's syntax. Syntax is not proof the identifier exists or means what is claimed.
- Every namespace in use has a pinned ontology version, a retrieval date and a licence.
- Relation is one of exact, close, broad, narrow, related (SKOS-style). Evidence has a method and a note.
- Review status: a candidate carries no reviewer. A reviewed mapping names a reviewer with a role and an explicit `independent` true or false, so an interim owner review can never be mistaken for independent review. A rejected mapping carries a reason.
- Ambiguity is recorded as candidates: two reviewed exact mappings for the same concept and namespace are refused.
- Duplicate ids, and the same concept, namespace and identifier twice, are refused.
- A SHA-256 digest of the canonical content must match, so edits are detectable.

## What it does not do
It does not decide whether a mapping is scientifically right, call any external service, or change the graph. The graph's own statement that no ontology equivalence is inferred stays true until reviewed mappings exist and the product reads them.

## Next
Slice 2 types the 114 concepts that are only "biological concept". Slice 3 generates candidates from the EBI Ontology Lookup Service and UniProt for the immunology and systemic sclerosis neighbourhood, for owner review, labelled as non-independent until an external immunologist signs off.

## Slice 2 (this change)
`src/knowledgeGraph/conceptTyping.ts` proposes an entity type for the 114 concepts the graph only calls "biological concept", using sixteen ordered name rules (the first match decides; other matching types are recorded as alternatives; no match stays `unclassified`). The proposals are in `research/ontology/concept-types.v1.json` (regenerate with `bun run ontology:types`; structure is checked by `bun run ontology:check`) and a human review sheet is in `KG-02_CONCEPT_TYPE_REVIEW.md`. **They are not applied to the graph, not calibrated, and every one is "proposed" until the owner accepts, changes or rejects it.** At generation, 114 proposals: 25 need particular care (ambiguous or unmatched) and 1 is unclassified.

## Relationship to the existing ontology pipeline (read this first)
Before slice 1 the repo already had a governed pipeline: pinned, SHA-256-verified term tables for MONDO, UBERON, CL, GO and ECO (`scripts/import-ontologies.ts`, `research/ontology/import-manifest.v1.json`, `ontology-sources.v1.json`), a conservative matcher (`src/ontology/conceptMapping.ts`), the candidate file `research/ontology/candidate-mappings.v1.json`, and a curator decision workflow and review page (`src/ontology/mappingReview.ts`, `OntologyMappingReview`). Slice 1 was built without checking for it, so the contract in `ontologyMapping.ts` overlaps with it. **The existing pipeline is the record for candidate generation and review.** The slice 1 contract stays as a stricter schema for a future published mapping file (it adds pinned versions and licences per namespace, SKOS relations, and an explicit `independent` flag on reviewers) and is not a second review system.

## Slice 3 (this change): extend the existing matcher
- Concepts typed in slice 2 are searched only in the imported ontology that serves their proposed type (cell type in CL, anatomical structure in UBERON, disease and phenotype in MONDO, process and pathway in GO). Types with no imported ontology (cytokines, receptors, drugs, microbes, metabolites, antibodies, measurements, interventions, exposures, study contexts) are not searched and stay unmapped.
- Conservative spelling variants (a parenthetical removed, "cells" read as "cell") are used only when no exact match exists, and are labelled `variant_label` or `variant_synonym` in the candidate file and on the review page.
- Result: 23 to 26 candidates of 153; none lost. The three new ones are the T follicular helper cell term, the spleen, and the blood-brain barrier (the last only through a variant, which a reviewer may well reject because the concept's parenthetical adds context). The small gain is itself a finding: most of the 127 still unmapped are context-bound or compound names, or need ontologies that are not imported, not a weak matcher. Roughly 25 need UniProt/HGNC (cytokines and receptors), ChEBI/ChEMBL (drugs and metabolites) or NCBITaxon (microbes), which would each need the import approval extended.
- Nothing is an approved mapping. Every candidate is unreviewed.
