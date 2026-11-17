---
title: "03. Biomedical Knowledge Graph and Ontology"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **An edge is a claim in a context, not a fact.** Every relationship carries subject, predicate, object, source, study context, direction (including negative findings) and review state.
- **Context is mandatory to record, optional to know.** Unknown values are stored as `not_reported`, never left blank and never guessed.
- **Predicates come from a controlled vocabulary aligned to the Biolink Model.** `associated_with` is a last resort; it is 29 of 95 candidate edges today and that must fall.
- **Identifiers come from public ontologies.** MONDO, CL, UBERON, HGNC and UniProt, GO, ChEBI, NCBITaxon, Reactome. HPO stays skipped by owner decision.
- **Promotion is a human act.** Candidate → under review → reviewed (accepted, rejected, revised) → released. Superseded edges are kept, never deleted.

# 2. Vision

A living graph of immune-mediated disease biology in which a researcher can ask "does X drive Y?" and see, for each species, tissue and patient group, what was reported, what was negative, what is missing and who reviewed it. "Living" means new evidence and retractions update the graph through review, with every past release reproducible.

# 3. Where we are

| Item | Status | Evidence |
| --- | --- | --- |
| Published snapshot | Built | `site/public/research/domain-graph/graph.v1.json`, digest-verified, 40+ immutable versions |
| Concepts | Partial | 153 nodes: 114 generic "biological concept", 20 diseases, 5 cell states, plus a few metabolites, cytokines and phenotypes |
| Relationships | Partial | 95 source-candidate edges and 36 research-gap edges; **0 reviewed** |
| Context fields | Partial | Of 95 candidates: 45 no study system, 90 no tissue, 85 no population; 2 negative findings recorded |
| Sources | Partial | 75; 73 have unverified rights, 2 have an import receipt only |
| Diseases covered | Partial | 20 diseases including RA, SLE, MS, T1D, T2D, obesity, Crohn's disease and ulcerative colitis |
| Immune-cell spine | Built | `src/immuneCellSpine.ts`; thin beyond the RA starter set |
| Evidence by context | Built | `src/knowledgeGraph/contextBreakdown.ts`; never produces a score |
| Conflict classification (KG-03 slice 1) | Built | Same context, across contexts, context not stated |
| Gap index (KG-01) | Built | Gap markers and gap detail in the explorer |
| Ontology contract (KG-02) | Partial | Contract, verifier and proposed entity types for the 114 generic concepts; 26 of 153 concepts have an unreviewed mapping candidate; nothing applied |
| Governed graph tables | Partial | Migrations 011, 012, 013, 020: `hsi_lhkg_nodes`, `hsi_lhkg_relationships`, `hsi_lhkg_dossiers`, RLS policies |
| Department projections | Built | `src/knowledgeGraph/departments.ts`; genomics and human physiology have no tagged coverage |

# 4. Data model

## 4.1 Node types

Example identifiers are illustrative; resolve every ID against the pinned ontology release at import.

| Type | Identifier source | Example |
| --- | --- | --- |
| Disease | MONDO | Type 2 diabetes mellitus |
| Cell type and cell state | CL, plus an HSI state qualifier | Regulatory T cell |
| Gene or protein | HGNC, UniProt | TNF |
| Pathway or process | Reactome, GO | JAK-STAT signalling |
| Tissue or anatomy | UBERON | Colonic mucosa |
| Small molecule or metabolite | ChEBI | Butyrate |
| Organism | NCBITaxon | Mus musculus |
| Intervention | ChEMBL or DrugBank ID where licensed; else HSI ID | Tocilizumab |
| Phenotype | HSI ID (HPO skipped by decision) | Skin thickening |
| Hypothesis, gap, question | HSI ID | Gap-0007 |

Every node keeps `id`, `name`, `type`, `aliases`, `ontology_ids[]` (each with release version) and `domains[]`.

## 4.2 Edge (assertion) schema

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Stable across releases |
| `subject_id`, `object_id` | node IDs | Required |
| `predicate` | controlled term | From the HSI predicate list mapped to Biolink |
| `direction` | enum | `increases`, `decreases`, `no_effect`, `association_only`, `unresolved` |
| `negated` | boolean | True when the source reports no effect or failed replication |
| `source_id` | source ID | Required for `source_candidate` edges |
| `passage_id` | passage ID or null | Null means metadata-only; reason stored on the source |
| `model` | enum | `human_in_vivo`, `human_ex_vivo`, `human_cell_line`, `mouse`, `rodent`, `other_animal`, `in_silico`, `mixed`, `not_reported` |
| `tissue` | UBERON ID or `not_reported` | Never empty string |
| `population` | text or `not_reported` | For example "ACPA-positive established RA" |
| `design` | enum | Trial, cohort, case-control, cross-sectional, animal model, in vitro, review, `not_reported` |
| `assay`, `timepoint`, `intervention`, `outcome` | text or `not_reported` | |
| `conditions[]` | node IDs | Disease context |
| `limitations` | text | From the source or the extractor |
| `kind` | enum | `source_candidate`, `research_gap`, `hypothesis` |
| `review_state` | enum | See 4.3 |
| `scientific_claim_allowed` | boolean | False until reviewed and accepted |

The existing `confidence` field must never be displayed as a single score (PRD-04). Keep it internal or remove it.

## 4.3 Lifecycle

```text
extracted_candidate -> queued_for_review -> under_review
      -> accepted | rejected | revised (new edge, old one superseded)
accepted -> released (in a graph release) -> superseded | retracted_source
```

Rules: an edge enters a release only when accepted by at least two reviewers, or one reviewer plus an adjudicator after disagreement. A retracted source moves every dependent edge to `retracted_source` and opens a re-review task.

## 4.4 Predicate vocabulary (v1)

Start with 15 to 20 predicates, each mapped to a Biolink predicate, with domain and range types. Examples: `increases_expression_of`, `decreases_activity_of`, `produces`, `differentiates_into`, `infiltrates`, `is_biomarker_for`, `contributes_to`, `treats` (only with trial evidence), `associated_with` (fallback, flagged for review).

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| KG-01 | Add the first slice's missing entities as nodes | Every metabolite, cell type, cytokine, tissue and disease in the D-01 slice (for example butyrate and other short-chain fatty acids, regulatory T cells, adipose tissue, liver, TNF, MS) exists with ontology IDs |
| KG-02 | Apply ontology mappings after review | Review sheet completed for all 153 concepts; accepted mappings applied in a new release; unmapped concepts listed |
| KG-03 | Finish conflict classification | Slice 2 and 3: per-edge classification visible in the explorer and in briefs |
| KG-04 | Controlled predicate list | List agreed and enforced at import; `associated_with` below 15% of new edges |
| KG-05 | Context completion tooling | Reviewer form forces a value or `not_reported` for model, tissue, population and design |
| KG-06 | Persist the graph in Postgres as the source of truth | Snapshot JSON is generated from tables; snapshot digest unchanged when tables unchanged |
| KG-07 | Release process | `graph:release` command creates an immutable release with a changelog of accepted, rejected and superseded edges |
| KG-08 | First reviewed slice (PRD-03) | 40 to 60 cross-domain edges reviewed and released; context completeness 100% |
| KG-10 | Cross-disease comparison view (PRD-13) | For one mechanism, evidence by context and trial outcomes side by side across diseases; failed translations flagged |
| KG-09 | Retraction propagation | Retracted source flags all dependent edges within one refresh cycle; re-review task created |

# 6. Future options

- A personal candidate layer: each researcher's own candidate edges grow around their topics, separate from the reviewed graph.
- Quantitative effect sizes where sources report them, shown per stratum.
- Export in Biolink-compatible KGX format for interoperability with other knowledge graphs.

# 7. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-20 | Two-reviewer rule or one reviewer plus spot audit for the first slice | Two reviewers for the first 60 edges, to measure agreement; relax only if agreement is high |
| D-21 | Licence for the published graph | CC BY 4.0 for reviewed edges; source text excluded |
| D-22 | Ontology release pinning | Pin each ontology release per graph release; upgrade quarterly |
