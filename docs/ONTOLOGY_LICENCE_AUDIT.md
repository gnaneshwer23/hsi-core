# Ontology licence and version audit

Audited 2026-11-14. **Audit only: nothing was downloaded into this repository or imported anywhere.** The machine-readable record is [`research/ontology/ontology-sources.v1.json`](../research/ontology/ontology-sources.v1.json), guarded by `test/ontologySourceAudit.test.ts`.

## How each fact was checked
Licences and release dates for the OBO ontologies come from the OBO Foundry registry and the HTTP headers of the OBO downloads. HPO, Reactome, UniProt, WHO and SNOMED were read from their own licence pages or search excerpts. Entries marked **not verified** were not read; do not assume their licence.

## Result

| Ontology | Licence | Latest release seen | Size | Verdict |
|---|---|---|---|---|
| Mondo (disease) | CC BY 4.0 | v2026-11-03 | 255 MB | Import first |
| Uberon (anatomy) | CC BY 3.0 | v2026-11-05 | 96 MB | Import first |
| Cell Ontology | CC BY 4.0 | v2026-06-08 | 66 MB | Import first |
| Gene Ontology | CC BY 4.0 | current (8 Aug 2026) | 130 MB | Import first, pin a dated release |
| Evidence and Conclusion Ontology | CC0 | not checked | n/a | Import first |
| NCBITaxon | CC0 | not checked | n/a | Later |
| ChEBI | CC BY 4.0 | file dated 5 Nov 2026 | 896 MB | Later, referenced subset only |
| HPO | Custom (cite, show version, **no alteration**) | v2026-09-01 | 77 MB | **Your decision** |
| UniProt, Reactome | CC BY 4.0 | n/a | n/a | Identifiers only (already used) |
| HGNC, ChEMBL, MeSH | Not verified | n/a | n/a | Verify before any use |
| SNOMED CT | Affiliate licence (UK via NHS TRUD) | n/a | n/a | Exclude from hsi-core |
| WHO ICD | CC BY-ND 3.0 IGO (no adaptation) | n/a | n/a | Exclude; use Mondo |
| LOINC, RxNorm | Own or UMLS licence | n/a | n/a | Out of scope (clinical) |

## Issues to know about
- **HPO** allows use but forbids altering content or its logical relationships. A subset, remapped hierarchy or merged graph may count as alteration. Choose: skip HPO, use it unmodified with attribution and version display, or ask the HPO team.
- **SNOMED CT and ICD** are not open. Their terms (licence required; no adaptation of codes) conflict with a research graph that remaps codes, and clinical coding belongs to the clinical products, not hsi-core. Mondo covers disease concepts.
- **GO "current"** is a moving pointer. Pin a dated release and record its hash.
- **Uberon is CC BY 3.0**, not 4.0; attribution wording differs.
- **The release dates above are what the sources showed today.** Cell Ontology's latest release is five months old.
- **The 153 current concept nodes carry no ontology identifiers.** Any mapping to ontology terms is a curation task; the registry already requires human review for exact mappings.

## Proposed approach if you approve
1. Approve a first set (Mondo, Uberon, Cell Ontology, GO, ECO) and say how to treat HPO.
2. Download pinned releases into a gitignored scratch folder, record release tag and sha256, and extract only identifier, label, synonyms, parents and version (no full copy in the repository).
3. Add ECO and any new prefixes to the namespace registry.
4. Propose label-based candidate mappings for the 153 concepts as unreviewed suggestions only; a curator confirms each.
5. Add an attribution page listing each ontology, licence and version.
6. Storing ontology terms in the database needs a migration, which needs separate approval.

## Not decided here
No import, mapping, or database write has been approved. This document does not change the graph.
