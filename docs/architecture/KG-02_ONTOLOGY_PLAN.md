# KG-02: cross-domain ontology (plan, not yet built)

Status: proposal for review. Nothing here is implemented. A feature counts as done only when mappings exist, are reviewed, and the explorer uses them.

## Where the graph is today
- 153 concepts in a versioned, digest-verified snapshot (`research/domain-graph/graph.v1.json`). Ids are snapshot-local (for example `concept:butyrate-ec227cb`); nothing maps them to HGNC, UniProt, MONDO, Cell Ontology, ChEBI, Reactome or GO.
- Kinds are coarse: 114 of 153 concepts are just "biological concept"; 20 are diseases; the rest are single instances (cytokine, metabolite, pathway and so on). Several concepts are not entities at all (for example "IL-21-dependent plasmablast differentiation" is a process, and "Rituximab B-cell depletion (experimental in SSc)" mixes a drug and a context).
- Aliases are free text. The graph states in the inspector that no ontology equivalence is inferred, which is correct and must stay true until a reviewed mapping exists.

## Principle
Never assume two identifiers are equivalent. A mapping is a claim with a relation type, evidence and a review status, and it is stored separately from the graph so it can be corrected without changing the graph version.

## Contract (to build first)
A mapping record: `conceptId`, `namespace` (HGNC, UniProt, MONDO, HP, CL, UBERON, CHEBI, CHEMBL, REACTOME, GO), `identifier`, `label`, `relation` (exact, close, broad, narrow, related, following SKOS), `evidence` (how it was matched: exact label, synonym, manual), `ontologyVersion` (pinned), `reviewStatus` (candidate, reviewed, rejected), `mappedBy`, `mappedAt`. Ambiguity is recorded (several candidates), never resolved silently. The file `research/ontology/mappings.v1.json` is versioned and digest-verified like the graph; a verifier in `src/knowledgeGraph/ontologyMapping.ts` rejects dangling concept ids, duplicate primary mappings, unpinned versions and any record claiming reviewed status without a reviewer.

## Slices
1. **Contract and verifier**, with tests and no mappings. Small, and unblocks the rest.
2. **Concept typing.** Classify the 114 "biological concept" nodes into real entity types (gene, protein, cell type, process, context and so on) so the right ontology is queried. Proposed by rule and listed for review, not auto-applied.
3. **Candidate generator.** Query the EBI Ontology Lookup Service and UniProt for each typed concept and write candidates only, with the ranking evidence. Confidence stays uncalibrated. Output goes to a review queue.
4. **Reviewed first batch.** A domain expert reviews the highest-degree concepts first (for example the IL-21 and systemic sclerosis neighbourhood, which the product already centres on). Only reviewed mappings are shown as canonical.
5. **Use in the product.** Show canonical ids and synonyms in the inspector, search by identifier, and filter by namespace. Entity resolution in investigations then uses reviewed mappings.

## Risks
- False equivalence (for example a gene and its protein, or a drug class and a member). Mitigated by relation types, review and showing "close" or "broad" as such.
- Compound and contextual concept names that map to no single entity. They stay unmapped with a stated reason.
- Ontology licensing and version drift. Pin versions, record licences, and re-run candidates on a version bump.
- Calibration and benchmark claims. No accuracy figure is claimed until an expert-adjudicated set exists.

## Decisions needed
1. First coverage: the immunology and systemic sclerosis neighbourhood, or all departments at low depth.
2. Who reviews mappings, and under what governance (this is an owner item, like the independent scientific review).
3. Approval to call external ontology services at build time, and which licences are acceptable.
4. Whether canonical ids should be allowed to change the graph's concept ids later (a versioned migration) or stay a separate layer (recommended for now).
