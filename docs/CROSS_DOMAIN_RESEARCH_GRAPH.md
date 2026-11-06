# Cross-domain research graph

The main `/research/knowledge-graph` entry now opens connected gut–immune–metabolic and neuroimmune research investigations. The original exact-passage RA/SSc corpus is retained at `?dataset=source-corpus`; its old pinned version links still work. Research navigation distinguishes the educational **Topic map** from the **Knowledge graph**.

This is a working research candidate graph. It is not an approved scientific release, a validated causal model, a live patient service or a completed literature search.

## What the graph contains

The current snapshot has 153 concepts, 131 relationships and 75 source records. Of the relationships, 95 are source candidates and 36 mark unresolved connections. Nine of those gaps have structured research questions, missing-evidence requirements and proposed next studies. There are zero independently approved relationships.

Sources comprise 63 existing repository records and 12 new bibliographic candidates. The new DOI pointers cover mouse butyrate experiments, mouse autoimmune diabetes, human microbiome associations, medication confounding, dietary intervention, imidazole propionate, adipose macrophages, NLRP3 and metabolic inflammation. Their titles, model annotations and candidate paraphrases await online verification and independent review. They have no invented supporting quotations, retrieval dates, licence clearances, sample sizes or confidence scores.

The additional source pointers are in `research/domain-graph/expansion.v1.json`. Existing inputs and their SHA-256 hashes are attached to the versioned bundle. The old RA/SSc exact-passage records are preserved. An exact alias match or a bibliographic identifier does not establish ontology equivalence, scientific support or approval.

## ISI reference and corrections

Read-only reference: `immunecity` checkout `efba003`. The implementation follows the reference's separation of curation, evidence state and recorded quality; relationship-level provenance; tissue-aware neighbourhoods; source inspection; and trial-comparability limitations. HSI reuses its own existing ISI-linked evidence pack rather than sharing a product database. No ISI application or database was modified.

Seven older diabetes-adjacent links cited papers supporting related RA or general immune axes rather than the exact diabetes assertion. Those records are now research gaps, excluded from source-only paths. Missing-citation placeholders are likewise not counted as supporting evidence.

Model classification is conservative:

- Human-derived microbiota tested in mice remains **mouse** evidence.
- Human cell lines and ex-vivo human cells do not enter the **Human participants** filter.
- Mixed-model papers retain a separate label; they are not pooled into human participant evidence.
- A phrase such as “not human evidence” cannot create a human model label.
- Unextracted species/model context remains unknown. An unknown model is not inferred from a therapeutic disclaimer.
- Colonic and peripheral Foxp3-positive Treg cells, Tr1-like cells, tissue-specific macrophages, individual metabolites and metabolite classes remain distinct.
- T1D islet autoimmunity, beta-cell injury and disease stage remain separate from T2D insulin resistance.

The corrected mapping adapter is `explicit_repository_and_editorial_candidate_mapping_v2`. Earlier unpublished adapter snapshots remain immutable for lineage inspection, but the interactive client refuses the retired v1 adapter. No historical candidate snapshot is retrospectively given scientific approval.

## Connected product flow

1. Select a gut/T2D, gut/T1D, Treg/Th17 or neuroimmune investigation, or browse all represented domains.
2. Search concepts and filter by domain, model, disease context or source basis. The default canvas shows the selected two-hop neighbourhood; switch to all matching concepts for a broader map.
3. Select a node or arrow and inspect the candidate assertion, original source locator, model, study setting, missing context and limitations. Gap lines are visually distinct and cannot complete a source-only mechanism.
4. Open **Research outcomes** for a research synthesis, directed candidate paths, context comparison, missing evidence, falsification criteria and proposed experiments. These summaries are editorial templates, not live LLM inference.
5. Compare two findings without conflating different compounds, species, tissues, assays or outcomes. Comparisons do not declare a confirmed contradiction, pooled effect or superior treatment.
6. Export a JSON or Markdown research brief, source-review preparation, comparison or versioned snapshot. Free-text search is omitted from brief exports and pinned links; explicit selected record IDs preserve the selected evidence set.
7. Share a pinned graph view with its snapshot, investigation, public concept selection and filters. View state does not grant source access or reviewer authority.

The graph's arrows are directional source candidates, not causal guarantees. All source-only paths are bounded to six steps, eight results and 2,500 expansions. Unresolved and study-context links do not substitute for a biological mechanism. Cross-study, species and negative-finding limitations remain attached.

## Cohorts and trial research

**Cohorts & trials** uses the supplied 200 synthetic validation profiles across 20 conditions. There is no real patient intake or enrolment pool. Profiles and their observed latest HbA1c are mapped reproducibly from the supplied files. Condition, age, latest HbA1c and recorded medication filters combine with AND semantics. Medication means exposure recorded at any supplied visit, not current or contemporaneous treatment. Missing HbA1c is counted separately when a threshold is requested.

The public registry adapter accepts downloaded ClinicalTrials.gov API v2 study JSON, bounded to 50 records and 1 MB. It extracts NCT identity, title, conditions, reported status, update date, recorded age bounds and the original eligibility text. Raw uploaded records are not retained or sent to an LLM or server. Private-record and credential-shaped inputs are rejected; the adapter is not a de-identification service.

Study output is only condition-topic and recorded-age overlap against the validation cohort. Exact controlled condition aliases distinguish T1D and T2D; generic “Diabetes” is not treated as an exact match. Full criteria, sex/healthy-volunteer criteria, disease stage, medication, biomarker thresholds, geography, recruitment availability and investigator assessment remain unassessed. Uploaded records remain operator-supplied and unverified; reported recruitment status is not a live status check. Empty, missing-age, age-conflict and no-condition-overlap states are explicit. `confirmedEligible` and `patientEligibilityAssessed` always remain false.

The TN10 registration is an ISI reference pointer, not a fabricated current recruitment result. There is no default registry snapshot or invented matching-trial count.

## Future discovery and build phases

| Phase | Concrete next outcome | Evidence required before claiming success |
| --- | --- | --- |
| Connected investigation | Implemented graph, context comparison, gaps, research proposals, validation cohorts and public-record import | Software tests, reproducible snapshots and clear source limits |
| Verified living evidence | PubMed/Europe PMC metadata and permitted passages, corrections/retractions, timestamped trial records | Reachable source APIs, identity matching, rights receipts, method/context extraction and independent review |
| Context-aware retrieval and reasoning | Hybrid keyword/vector/graph retrieval and claim-level grounded drafts | Independently labelled retrieval relevance, contradiction versus context-difference labels, entailment and unsupported-claim evaluation |
| Multimodal validation | Approved metabolomics, tissue-aware immune profiles, spatial/single-cell observations and metabolic outcomes | Prospective protocol, confounder/batch controls, held-out cohorts and external replication |
| Experimental discovery | Prioritised metabolite–cell hypotheses for organoid, co-culture or microphysiological perturbation | Dose/viability controls, matched models and independent wet-lab replication; model findings do not establish human efficacy |
| Partner-owned cohort research | Separately governed aggregate/federated queries | Approved purpose, consent, access controls, privacy threat modelling and small-cell suppression; no shared patient database or live PHI in HSI |

AI can help retrieve overlooked studies, identify opposing findings, propose context explanations and prioritise falsifiable experiments. It cannot convert an attractive graph path into established biology. These future capabilities are described with evaluation criteria; they are not represented as running services.

Live Europe PMC access returned a proxy HTTP 403 in this environment. No blocked source was silently replaced with fabricated metadata or text. Completing the verified-evidence phase requires access to the relevant public scientific APIs, then source verification and scientific review. The current graph does not claim a complete online search.

## Build and validation

```sh
bun --no-env-file run domain-graph:build
bun --no-env-file run domain-graph:check
bun --no-env-file test test
bun --no-env-file run build
# From site/:
bun --no-env-file run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium bun --no-env-file x playwright test \
  domain-knowledge-graph.spec.ts claim-knowledge-graph.spec.ts
```

The site build checks both graph adapters before compilation. Bounded same-origin downloads, exact schema checks and the pinned content hash are verified before display. Existing HSI-only database, independent review, no-PHI/no-CDS and publication gates remain unchanged. Scientific accuracy and prospective clinical acceptance are not established by the software checks.

See `operations/qa/2026-11-06/domain-graph-results.json` for recorded validation.
