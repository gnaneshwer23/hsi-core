# Knowledge Graph: Gap Discovery Foundation

This change adds a **read-only gap index** over the existing cross-domain candidate graph (`DomainBundle`). It does **not** create a second knowledge graph, modify the published graph snapshot, change Gate C, or write to Neon.

## Scope
- Index existing `DomainGap` entries against directly connected source-candidate edges.
- Surface source IDs, context missingness, model differences and negative findings.
- Deterministically sort gaps for research triage; score is **not** scientific confidence, novelty or clinical importance.
- Preserve unreviewed and non-clinical status. No patient records or PHI.

## Next increments
1. Integrate the index into the existing Graph Explorer and research investigation workspace, using real loaded `DomainBundle` data.
2. Add evidence verification and provenance checks before expanding source-candidate edges.
3. Add an ontology crosswalk for genes, proteins, pathways, cell types, tissues, metabolites, diseases, drugs and trials using stable external identifiers.
4. Introduce contextual claims as separate objects (subject, predicate, object, model, tissue, assay, population, intervention, time, negation, provenance, review state).
5. Add bounded multi-hop research gap search, hypothesis ledger and cross-domain evidence evaluation.
6. Connect the governed clinical bridge using **synthetic, aggregate-only** outputs; no patient-level data enters this graph.

## Verification
```bash
bun test test/gapIndex.test.ts
bun run typecheck
bun run check
```

The above commands are required before merging; this PR does not claim they were run remotely.

## Non-goals
No live CDS, patient eligibility decision, auto-approval of graph claims, real PHI, migration activation or new product branding.
