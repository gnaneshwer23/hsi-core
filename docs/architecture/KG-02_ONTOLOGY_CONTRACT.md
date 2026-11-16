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
