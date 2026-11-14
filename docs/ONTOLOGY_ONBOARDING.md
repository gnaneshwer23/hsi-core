# Ontology data: using it on a new machine

The five imported ontologies (Mondo, Uberon, Cell Ontology, GO, ECO) are **not stored in the repository**. The committed pieces are the manifest, the licence audit, the candidate mappings and the code. The term tables live in the gitignored `.ontology-cache/` and are rebuilt from the pinned releases.

## What is committed
- `research/ontology/import-manifest.v1.json`: pinned release URL, sha256, byte size, term count and data version for each ontology. HPO is listed as skipped.
- `research/ontology/candidate-mappings.v1.json`: unreviewed label matches for the graph concepts.
- `research/ontology/ontology-sources.v1.json` and `docs/ONTOLOGY_LICENCE_AUDIT.md`: the licence audit and decision.
- `docs/ONTOLOGY_ATTRIBUTION.md`: licence and release to show if any term is displayed publicly.

## Rebuild the cache
```bash
bun scripts/import-ontologies.ts             # dry run: lists what would be downloaded
bun scripts/import-ontologies.ts --execute   # downloads about 275 MB, verifies each file against the pinned sha256, extracts terms
bun scripts/map-concepts-to-ontologies.ts    # regenerates the candidate mappings from the cache
```
The import refuses a file whose hash differs from the manifest, and a file with fewer than 100 terms under the expected prefix. If a source URL changes or disappears, the manifest must be updated by a reviewed change; the script does not fall back to a `latest` URL.

## Check that regenerated mappings match what is committed
After `map-concepts-to-ontologies.ts`, `git diff research/ontology/candidate-mappings.v1.json` should be empty. A difference means the graph's concepts changed or the cache differs from the manifest; do not commit it without reading why. Curator recommendations stored in a browser are verified against the committed candidate file when the review page loads.

## What not to do
- Do not commit `.ontology-cache/` (it is gitignored).
- Do not import HPO without the decision recorded in the audit.
- Do not treat a candidate mapping as approved: exact mappings need independent human review (`hsiOntologyRegistry`).
- Storing terms or mappings in a database needs migration 031 to be rehearsed and approved; it is held.
