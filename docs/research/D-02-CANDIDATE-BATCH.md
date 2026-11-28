# D-02 candidate batch: genomics, organ and tissue, translational

**Date:** 28 November 2026
**Seed file:** `research/domain-graph/expansion-d02.v1.json`
**Published graph:** `ba08b284`, child of `044eb4d6`

**Status:** every item is an unreviewed candidate. Confidence is not calibrated. Nothing in this batch is a clinical recommendation.

## Why

Before this batch, the published graph had **no** genomics or multi-omics relationships and **no** organ or tissue relationships. Its translational content was four concepts. As a result:

- The Multi-omics view could not open.
- The Translational view could not open.
- The Temporal view could not open.
- Two of the six department pages showed zero.

## What was added

- **Sources:** 14.
- **Candidate relationships:** 21.
- **Recorded gaps:** 3.
- **Concepts:** 22 new (genes, cell states, outcomes and interventions).

| Area | Sources (PMID) | What the candidates record |
| --- | --- | --- |
| Genomics | 20383147, 22286218, 16175503, 12833157 | Genetic susceptibility signals: <br>• SSc: CD247, IRF5 and STAT4. <br>• RA: HLA-DRB1 amino acids 11, 71 and 74, PTPN22, and PADI4. |
| Transcriptomics and single-cell | 18648520, 34282151, 31061532 | • Intrinsic gene-expression subsets of SSc skin. <br>• SFRP2-high progenitors as the origin of SSc dermal myofibroblasts. <br>• Expanded cell states in RA synovium: THY1+ HLA-DRA-high fibroblasts and Tph cells. |
| Organ and tissue | 20551155, 9751093 | • Causes of death in SSc: pulmonary fibrosis is the leading SSc-related cause. <br>• Proteinuria predicts mortality. <br>• High-dose corticosteroids are a risk factor for scleroderma renal crisis. |
| Translational | 31112379, 32866440, 36375479, 27469583, 34966900 | SSc trials: <br>• SENSCIS (nintedanib). <br>• focuSSced (tocilizumab). <br>• RECITAL (rituximab vs cyclophosphamide). <br>• SLS II (mycophenolate vs cyclophosphamide). <br>• ASSET open-label extension (abatacept). <br>Each trial's time point, intervention and population are recorded. |

**Negative results are recorded as negative** (`negated: true`), with the result wording kept in the assertion:

- nintedanib on skin score;
- tocilizumab on the primary skin endpoint;
- RECITAL's superiority test;
- SLS II's primary comparison.

## How each item was made

1. Each PMID, DOI and title was **matched against its PubMed record** on 28 November 2026.
2. Full text was **not** retrieved, no passage was imported and rights are **unverified**. So every source keeps `identityStatus: bibliographic_candidate_not_retrieved`.
3. Each assertion is an **editorial paraphrase of the abstract**, prefixed "Candidate summary:". Its limitations come from the abstract: population, design, primary versus secondary endpoint, and sensitivity analyses.
4. **Disease hubs are not re-tagged.** Relationships pointing at systemic sclerosis or rheumatoid arthritis carry only immune tags. The genomic, skin, lung, kidney or joint tag sits on the gene, cell state or intervention instead. Without this, every SSc relationship would have counted as "genomics" coverage.
5. The batch lives in its own seed file. The N1 verification batch, which is exactly 12 sources, is unchanged.

## Mapping changes it needed

- **Domain map 1.1.0:**
  - the tags `skin`, `lung`, `kidney` and `joint` map to Organ & Tissue Biology;
  - the tag `genomic` maps to Genomics & Multi-omics;
  - the concept type "molecular signature" maps to Genomics & Multi-omics.
- **Scale map 1.1.0:** a "molecular signature" is placed at the molecule level.
- **Departments:**
  - Genomics & Multi-omics uses the `genomic` tag (11 concepts).
  - Human Physiology uses `skin`, `lung`, `kidney` and `joint` (18 concepts).

## What is still missing

- **Proteomic, epigenomic and integrated multi-omics** sources.
- **Trial-registry links** (NCT numbers to ClinicalTrials.gov records), and trials outside SSc.
- **Ontology identifiers** for the 22 new concepts. The mapping run has not seen them, and the workspace says so ("not in mapping run").
- **Per-relationship validity intervals.** The Temporal view compares published versions only.
- **Retrieval, rights checks and independent review** of every D-02 source.
