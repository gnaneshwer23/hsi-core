# HSI ontology and entity coverage

**Status:** living inventory — not a claim of complete biology coverage  
**Related:** `docs/architecture/HSI_CROSS_DOMAIN_BIOLOGY_ARCHITECTURE.md`, domain graph under `src/data/domain-graph/`

---

## 1. Entity kinds HSI must eventually support

| Kind | Target ontology / vocab | Current substrate |
|------|-------------------------|-------------------|
| Cell types | CL | Domain-graph nodes + SSc/RA packs (partial) |
| Tissues / organs | UBERON | Sparse (e.g. gut, brain labels) |
| Genes | HGNC / NCBI Gene | Limited identifiers in packs |
| Proteins | UniProt | Sparse |
| Metabolites | ChEBI / HMDB | Gut–metabolic demo nodes |
| Microbes | NCBI Taxonomy / GTDB | Gut pack entities |
| Pathways | GO / Reactome / WikiPathways | Partial pathway labels |
| Physiological functions | GO BP / HPO (where clinical) | Sparse |
| Diseases | MONDO / DOID / MeSH | SSc, RA, T2D/T1D conditions in educational graph |
| Drugs / interventions | DrugBank / ChEBI / RxNorm | Trial/drug nodes sparse |
| Phenotypes | HPO | Not systematically mapped |
| Publications | PMID / DOI / PMC | Evidence tables + literature connectors |
| Experiments / assays | OBI (aspirational) | Not first-class |

---

## 2. Domain graph snapshot (educational, public)

From committed domain-graph data (counts may drift; re-measure on change):

| Axis | Approximate coverage |
|------|----------------------|
| Domains | 12 (immune, gut, neuroimmune, metabolic, oncology-adjacent, etc.) |
| Conditions | 7 including multi-system examples |
| Investigation questions | 4 curated (gut–T2D, T1D, immune, brain–immune) |
| Nodes | ~153 educational |

**Honesty:** This is a curated teaching/exploration graph, not the full LHKG production release surface.

---

## 3. Cross-domain relationship types (target)

| Relation family | Example | Provenance requirement |
|-----------------|---------|------------------------|
| modulates | metabolite → microglial activation | citation + context |
| secretes / produces | cell → cytokine | cell ontology + assay context |
| expressed_in | gene → tissue | expression evidence grade |
| associated_with | microbe → phenotype | association vs causal tag |
| pathway_member | protein → pathway | pathway source id |
| treats / targets | drug → disease/target | trial vs approved distinction |
| contradicts | claim A ⊣ claim B | both claims + review state |

Every edge: source id, epistemic type, review state, optional disease/tissue context.

---

## 4. Missing ontology mappings (priority)

1. Stable external IDs on domain-graph nodes (MONDO/CL/UBERON/ChEBI).  
2. Disease-independent cytokine/signalling subgraph for scenario F.  
3. Cancer immunology cell-state vocabulary for scenario E.  
4. Neuroinflammation microbe–metabolite–glia bridges for B/C.  
5. Explicit approved vs unreviewed partition in public exports.

---

## 5. Connector gaps

| Connector | Need | Status |
|-----------|------|--------|
| Literature (PMID/DOI) | cross-domain retrieval | Partial / pack-scoped |
| Ontology resolver | string → CURIE | Incomplete |
| Omics indexes | gene/protein lists | Not product-live |
| Microbiome datasets | metabolites / taxa | Demo-level |
| Trial registries | NCT linkage | Conceptual |
| ISI Discovery consume | immune pack JSON | Wiring playbook; not universal |

---

## 6. Governance

- Unreviewed graph material must not present as established evidence.  
- Computational edges labelled as inference.  
- No patient PHI entities in public graph.  
- Expansion is ontology-driven: add kinds/relations before UI “coverage” badges.
