# HSI claim-centric knowledge graph

Implemented entry point: `/research/knowledge-graph`. Open it from the research navigation, dashboard tools or the existing `/science/graph` topic explorer. The educational topic map remains separate from the source-linked working graph.

## What is built

The first working snapshot contains **15 entities, 34 exact local mentions, 7 source claims, 16 relationships and 5 source records**. It uses the existing rheumatoid arthritis and systemic sclerosis corpus. Eight passages contain imported text; five have source locators only. No missing quote, ontology ID, reviewer, licence approval or confidence score was invented.

The graph is a **working research snapshot**, not an approved biological release. All relationships are `draft` / `not_curated`, confidence is `not_calibrated`, and `graphPromotable` is false. Source-linked does not mean scientifically verified. Context-comparison candidates are not adjudicated contradictions.

| Layer | Implementation |
| --- | --- |
| Source records and passages | Existing validated `research/evidence-corpus`; source versions, locators, passage hashes, rights status and context are preserved |
| Entities | Controlled types, stable internal IDs, aliases, domains, definition-source IDs and explicit unreviewed external-ID mapping semantics |
| Mentions | Separate records with exact text and UTF-16 offsets into the stored normalised passage, never offsets invented for a PDF or missing text |
| Claims | Existing source assertions remain unchanged; a mention never becomes a scientific claim by itself |
| Edges | Stable claim-linked bindings; original predicate, associative/experimental/contextual classification, negation and review state |
| Extraction provenance | Named deterministic adapter and version; exact dictionary mention detection and explicit candidate binding; model/prompt are null |
| Versions | Canonical SHA-256 snapshot, parent reference, retained immutable archives and a pinned browser URL; hashes establish integrity, not truth or publisher identity |
| Traversal | Simple paths with outgoing-only or explicit exploratory traversal, bounded depth/results/expansion and per-step evidence warnings |
| Review | Readiness blockers and downloadable review preparation; existing authenticated investigation/review workflow remains the authority |
| Backend connection | Explicit read-only SSc discovery call to the existing trusted endpoint; permission denial stays visible and does not hide or replace the public working snapshot |

`src/knowledgeGraph/claimGraph.ts` is the browser-safe contract/query layer. `buildClaimGraph.ts` is the deterministic offline adapter. The contract is also exported through the package's `./claim-graph` entry point. No graph database or new server is required to inspect these content-addressed files.

## Connected user experience

1. Search a name, alias or internal/external identifier. Exact dictionary resolution is distinguished from ambiguous or missing matches. Ambiguous cell-state names remain unresolved; no entity merge occurs.
2. Choose a concept. Search text clears so the whole network can be explored. Filter by type, domain, disease, tissue, species, evidence or review state, or switch to the selected neighbourhood.
3. Select a relationship in the visual canvas or equivalent keyboard-accessible list. Directional arrows preserve the assertion orientation; negative findings use a red dashed line; dotted lines identify study-context metadata.
4. Inspect source → passage → claim → edge lineage, context, limitations, source rights, source version, exact available passage and release blockers. Locator-only evidence is explicitly identified.
5. Select a target and inspect a bounded path using the currently filtered graph. Incoming traversal, context changes, negative findings, study metadata and unavailable text remain visible. Paths never grant a causal conclusion or create a grounded medical answer.
6. Compare the RA cohort versus meta-analysis candidate and the SSc counts/proportions/subset candidate. These are questions for scientific review, not automatically established contradictions.
7. Save a public concept view locally or bookmark the pinned version. Saved views retain version, concept, filters, depth, target and traversal direction; free-text search is not stored. Browser storage is optional. Camera position and manual node arrangement are transient, not persisted bookmarks.
8. Export the canonical evidence graph, selected path or review-preparation packet as JSON. SVG includes version/provenance metadata; visual exports identify the working version. A review packet is labelled `not_submitted` and cannot provision a role, record approval or publish a graph.
9. Inspect the snapshot/corpus hashes and deterministic method. Open a pinned archived version or return to current. Viewing an older graph does not mutate any database, release or audit history.

The existing public educational graph still supports its previous filters, gestures and downloads. The shared renderer now accepts a neutral canvas projection, preserving the new graph's original entity kinds and relationship classifications rather than recasting experiments as associations.

## Ingestion and history

```sh
bun --no-env-file run graph:build
bun --no-env-file run graph:check
```

The builder reads approved repository working inputs, validates source-candidate bindings against the corpus assertions, verifies corpus/passage hashes and writes identical artifacts to:

- `research/claim-graph/graph.v1.json`
- `research/claim-graph/versions/<sha256>.json`
- `site/public/research/claim-graph/...`

The compiled frontend pins the current expected version through a generated index. When inputs change, a new snapshot references the previous working version. Existing version files cannot be overwritten with different content. Build/check mode verifies ancestor hashes, rejects cyclic/missing lineage and refuses stale outputs. Node, edge and mention identities do not depend on source-array ordering.

A snapshot's `method` identifies the adapter version. Change that version when extraction semantics change. Review actual diffs before committing a new current snapshot. No historical source or published decision should be deleted to make a candidate pass.

The website build checks these artifacts before compiling. The browser fetches only a bounded same-origin, hash-addressed snapshot, then validates both graph and corpus before displaying claims. Invalid versions, oversized/malformed responses, altered scope flags and hash mismatches fail closed. Abort/retry does not display an unverified partial graph.

## Scientific boundaries

The source document's sample `v42`, reviewer identities, decimal confidence values, trial identifiers and illustrative biology triples were not imported as evidence. Patient-specific graphs, clinical recommendations and live PHI are excluded by HSI repository policy.

The source corpus's imported rights receipts are not independent legal clearance. SSc locator-only records cannot become exact quotations or verified entity mentions. Species is conservatively derived from the recorded study model; full model, tissue, population, assay, timepoint, intervention and outcome remain attached to each claim. A path across studies is not a proven mechanism in an individual.

The working adapter refuses causal/clinical promotion, arbitrary numeric confidence and approved statuses. The separate existing `graphRelease`, authenticated review stores and HSI-only database boundaries remain authoritative for a future released graph. Do not route local review exports around them. Do not silently turn synthetic validation records into scientific evidence.

## What still needs real integration or acceptance

| Capability | Status |
| --- | --- |
| Source-backed working graph, provenance inspection, local exact mentions, filters, paths, version replay and exports | Implemented and locally tested |
| Trusted SSc backend route | UI connected; local denial tested; real Neon/provider permissions and database contents unverified |
| Durable claim curation and graph promotion | Existing trusted mechanisms remain separate; this working UI does not implement a new approval/publication path |
| Continuous PubMed/Europe PMC, trial-registry or licensed-data ingestion | Not added; current inputs are the existing repository corpus |
| General relation extraction and claim-support model | Not added; bindings are explicit, source-bound candidates, not a running LLM extractor or verifier |
| Hybrid vector/GraphRAG answer generation | Not added; bounded graph traversal and lexical resolution are available, with no semantic-search or generated-answer claim |
| Neo4j/AGE/pgvector | Not installed or required for this initial bounded corpus; existing HSI PostgreSQL graph/evidence/review stores remain separate |
| Expert-labelled benchmark (110 cases from the suggestion) | Not fabricated; requires qualified independent labels and measured precision/recall/grounding results |
| Human-review coverage, calibrated confidence, p95 under 500ms | Not claimed; local software correctness tests are not scientific evaluation or production latency evidence |
| New diseases and licensed sources | Require explicit adapters, canonical mapping and source/rights review; do not extrapolate these RA/SSc bindings |
| Production release | Still blocked by the prior QA launch gates, including live auth/database acceptance, legal/security/operations, manual accessibility and mobile performance |

No production database was migrated, no scientific approval was recorded and no existing product database was shared. This branch builds on the already-pushed QA branch; it does not merge into the production-deploying `main` branch.
