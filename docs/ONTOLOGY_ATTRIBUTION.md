# Ontology attribution

Releases imported on 2026-11-14 under the approval recorded in [`research/ontology/import-manifest.v1.json`](../research/ontology/import-manifest.v1.json). Hashes and term counts are in that manifest. Terms are kept in the gitignored `.ontology-cache/` only; nothing is stored in a database.

| Ontology | Licence | Release | Source |
|---|---|---|---|
| Mondo Disease Ontology | CC BY 4.0 | v2026-11-03 | https://github.com/monarch-initiative/mondo |
| Uberon | CC BY 3.0 | v2026-11-05 | https://github.com/obophenotype/uberon |
| Cell Ontology | CC BY 4.0 | v2026-06-08 | https://github.com/obophenotype/cell-ontology |
| Gene Ontology | CC BY 4.0 | 2026-08-05 archive (file data-version 2026-07-26) | https://release.geneontology.org/2026-08-05/ |
| Evidence and Conclusion Ontology | CC0 1.0 | v2026-07-10 | https://github.com/evidenceontology/evidenceontology |

Not imported: HPO (its licence forbids altering content or logical relationships; skipped by decision), SNOMED CT, WHO ICD, LOINC, RxNorm (see the [licence audit](ONTOLOGY_LICENCE_AUDIT.md)).

## What is kept
Identifier, label, exact synonyms, same-ontology `is_a` parents and an obsolete flag. Definitions, cross-references and logical axioms are dropped. The data is not altered; if it is shown publicly, show the ontology name, licence and release above.

## Candidate mappings
[`research/ontology/candidate-mappings.v1.json`](../research/ontology/candidate-mappings.v1.json) lists exact label or exact-synonym matches between graph concepts and ontology terms. All are `unreviewed`; none is an approved exact mapping and no graph node was changed.

## Reproduce
```bash
bun scripts/import-ontologies.ts --execute
bun scripts/map-concepts-to-ontologies.ts
```
The first command downloads about 275 MB and verifies each file against the pinned hash.
