# LEA-04A: Living Intelligence Graph, audit and architecture alignment

**Status:** proposal for approval. No application code was changed for this document.
**Date:** 26 November 2026
**Scope:** the existing graph, the `hsi-core` ontology, graph, memory, agent and permission contracts, and a plan to build the Living Intelligence Graph on top of them.

## 0. Read this first

1. **Repository.** The brief names `living-evidence-atlas` (frontend) and `hsi-core` (backend). All frontend graph work to date lives inside `hsi-core/site`, and this audit covers that code. I did not inspect the separate `living-evidence-atlas` repository. If it holds graph code that matters, tell me and I will audit it as an addendum. This plan assumes we keep working in `hsi-core`.
2. **The real graph is smaller and thinner than the brief assumes.** Details in section 2. In short: 157 concepts, 95 source-candidate relationships, all unreviewed and uncalibrated, with study context mostly missing.
3. **The six equal domains cannot be supported from real data today.** The published graph uses a different domain taxonomy, and two of the six have no coverage.
4. **The permission-aware graph is blocked on owner decisions.** ADR-012, ADR-013 and ADR-014 are Proposed, not accepted, and the graph-workspace migrations are held.
5. **Most of the backend the brief asks for already exists** as contracts. The work is mostly to connect, not to invent.

## 1. What exists in the frontend

### Routes
| Route | What it is |
|---|---|
| `/knowledge-graph` | Public landing page with the live graph, filters and a snapshot-verified caption |
| `/research/knowledge-graph` | App-shell explorer (`ClaimKnowledgeGraph`, `DomainKnowledgeGraph`): filters, department tabs, path finding, quality metrics, JSON export |
| `/science/graph` | Older `ScienceGraph` page (646 lines) |
| `/workspace/immersive` | The 12-entity gut–immune–brain preview built in LEA-03 (3D and 2D) |
| `/departments/*` | Redirects into the explorer with a department filter |

### Components
| Component | Role | Notes |
|---|---|---|
| `components/graph/ObsidianGraph.tsx` (251 lines) | Canvas 2D force-directed renderer | Live force simulation, drag, pan and zoom, hover to isolate a neighbourhood, labels that appear with zoom, grouping by domain, kind or evidence model, dashed lines for negated findings, gap overlay, highlighted paths, multi-pick, export. **Capped at 500 nodes.** |
| `features/science/GraphVisual.tsx`, `SscGraphVisual.tsx` | SVG graph renderers | Accessible, keyboard-operable nodes |
| `components/home/LiveGraphHero.tsx`, `GraphFilters.tsx`, `useGraphSnapshot.ts` | Landing graph with search and filters | Loads the published snapshot once per page |
| `landing-v2/components/atlas/*` | Illustrative biological atlas (6 domains, 19 entities) | Hand-written, hedged |
| `landing-v2/immersive/*` | LEA-03 workspace | R3F canvas, 2D map, layers, scales, scripted companion |
| `components/PassportEvidenceTable`, `EvidenceContextPassport`, `ContextBreakdown` | Evidence passport and context comparison | Already shows same-context versus across-context |
| `features/science/{multiscaleTraversal,mechanismTrace,contradictionEngine,evidenceDossier,discoveryInvestigation}.ts` | Small science helpers (12 to 32 lines each) | Thin |

### Dependencies
`three` 0.187 and `@react-three/fiber` 9 only. **No** Sigma.js, Graphology, D3, Cytoscape or layout library is installed. The shared three.js chunk is about 240 KB gzipped; the 3D canvas added 1.8 KB on top of it.

## 2. What exists in `hsi-core`

### The published graph (`research/domain-graph/graph.v1.json`, digest-pinned, served by `/api/research/graph-snapshot`)
- 157 concepts, 131 edges (**95 source-candidate relationships**, 36 recorded research gaps), 75 sources, 9 gaps, 4 questions.
- Versioned by SHA-256. Clients verify the digest. A failing fetch shows "Snapshot unavailable" and no substitute graph.
- **Every one of the 95 relationships is `reviewStatus: unreviewed`, `confidence: not_calibrated`, `scientificClaimAllowed: false`.** There are no approved assertions anywhere.
- Context completeness across the 95 relationships: tissue 5, population 10, assay 7, timepoint 6, intervention 10, outcome 34. Evidence model is `unspecified` for 40 and `mouse` for 20; human in vivo for 17.
- Sources: all 75 have a DOI, 63 a PMID. 73 of 75 have rights `unverified`; 63 are `repository_locator_not_reverified`. Only **8 of 25 recorded passages carry text**.
- Species, cell type, disease state, dose, duration, validity interval, access scope, per-assertion version history and canonical identifiers are **not fields** on the current edge.

### Domain taxonomy mismatch
Edge domain tags are `immune` 87, `gut` 28, `metabolic` 16, `brain` 16, `lifestyle` 2, `trials` 1. They do not map one-to-one onto the six HSI domains:

| HSI domain | Real coverage in the published graph |
|---|---|
| Immunology & Inflammation | Strong (`immune`: 87 relationships) |
| Microbiome & Metabolism | Moderate (`gut` 28, `metabolic` 16) |
| Neuroscience | Moderate (`brain` 16, all of them also tagged `immune`; none tagged `gut`) |
| Disease Mechanisms | Partial (20 disease concepts; no domain tag) |
| Organ & Tissue Biology | Minimal (2 tissue concepts) |
| Genomics & Multi-omics | **None** |

### The immunology–microbiome slice
29 relationships touch both an immune concept and a gut concept, across 35 concepts and 26 sources; 20 relationships carry both domain tags; 9 recorded gaps, six of them spanning gut, immune and metabolic. This is a real, non-synthetic slice big enough for one exceptional workspace.

### Context framework (reusable as is)
`src/knowledgeGraph/contextConflict.ts` classifies disagreement into `no_disagreement`, `same_context_disagreement`, `context_separated_disagreement` and `disagreement_context_unknown`. That maps exactly onto the brief's "same context, across contexts, context not stated". It never says which side is right and never calls a conflict resolved. `claimGraph.ts` adds `ClaimComparison` with `confirmedContradiction: false`.

### Ontology and identifiers
Two registries exist and **do not agree**:
- `src/hsiOntologyRegistry.ts`: HGNC, UniProt, GO, Reactome, ChEMBL, MONDO, UBERON, CL, ECO, LOINC, NCT, PMID.
- `src/knowledgeGraph/ontologyMapping.ts`: HGNC, UniProt, MONDO, HP, CL, UBERON, ChEBI, ChEMBL, Reactome, GO.

A mapping is a claim with a SKOS-style relation, evidence and a review status; nothing assumes equivalence. `research/ontology/candidate-mappings.v1.json` records release versions (MONDO v2026-11-03, UBERON v2026-11-05, CL v2026-06-08, GO 2026-08-05, ECO v2026-07-10). **Of 153 concepts, 26 have a candidate mapping, none are ambiguous, 127 are unmapped, and none is reviewed.** The importer (`src/ontology/ontologyImport.ts`) and curator decision log (`mappingReview.ts`, append-only with a digest) already exist.

### Memory
A large `scientificMemory*` family (about 30 modules): PubMed, Europe PMC and Crossref ingestion and identity, source provenance, publication versioning and adjudication, freshness, ranking, an embedding provider and worker, and `scientificMemoryGraphRetrieval.ts`, a **read-only** graph channel with no writes or approval. I found **no pgvector migration**; embeddings exist in code, but I could not confirm where vectors are stored.

### Agents (NEXUS)
ADR-009 is **Accepted**: nine research reasoning roles behind a shared versioned contract and a permissioned tool registry. `graphAgents.ts` binds a graph selection to a validated context and runs three deterministic capabilities (PARALLAX comparability, VANTAGE question versus coverage gap, HELIX candidate mechanism chains). Every response is a candidate: `scientificApproval` and `graphPromotable` are false, and an agent can only propose a change that independent review must apply. `nexusJobs.ts` is a file journal by design, because the job-table migrations are held.

### Storage and permissions
- Governed graph tables exist: `hsi_lhkg_nodes`, `hsi_lhkg_relationships`, `hsi_lhkg_dossiers` (migrations 011, 012, 020 RLS), plus the contradiction ledger with tenant isolation (024 to 029) and `hsi_graph_investigations`, `hsi_ontology_releases`, `hsi_ontology_terms` (031, **held**).
- **ADR-012 (one investigation store), ADR-013 (identity binding) and ADR-014 (scope registry) are all "Proposed, needs owner sign-off".**
- No node-level or edge-level access control exists on the published graph; it is a public data class. A server-enforced, permission-aware graph (including counts, search suggestions, traversal and exports) does not exist yet.

## 3. Capability assessment against the brief

| Requirement | Status | Basis |
|---|---|---|
| Shared graph engine, 2D | **Partial** | `ObsidianGraph` is solid to 500 nodes; no Sigma or Graphology |
| Immersive 3D | **Partial** | LEA-03 canvas proves the approach on 12 entities; no real-data adapter |
| Accessible table alternative | **Missing** | SVG fallback exists; no tabular view |
| Bounded server-side neighbourhood | **Missing** | The snapshot ships the whole 157-node graph (fine at this size) |
| Pathway tracing | **Implemented** | `findClaimPaths`, hop limit |
| Entity search | **Partial** | Client-side over the snapshot |
| Filters: domain, model, condition | **Implemented** | `filterClaimGraph`, `DomainFilters` |
| Filters: species, tissue, review, date | **Partial** | Data mostly absent (see section 2) |
| Contextual assertions | **Partial** | Many context fields exist; species, cell type, disease state, dose, duration, validity, access scope absent |
| Evidence inspection | **Partial** | DOI and PMID present; passages mostly empty; rights unverified |
| Retraction or correction status | **Partial** | `correctionProvenance.ts` and Crossref ingestion exist; not wired to the graph UI |
| Contradiction classification | **Implemented** | Backend contract and passport UI |
| Side-by-side comparison | **Partial** | Passport table exists; not in the graph |
| Historical graph replay | **Partial** | Graph versions are digest-pinned with a parent pointer; no per-assertion history |
| Scientific memory integration | **Partial** | Read-only retrieval exists; investigation store not consolidated (ADR-012) |
| NEXUS interaction | **Partial** | `graphAgents` deterministic; no model-backed interpretation enabled, and the code says so |
| Candidate versus approved distinction | **Blocked on data** | No approved assertion exists |
| Server-side access enforcement | **Blocked on owner decisions** | ADR-013 and ADR-014 |
| Canonical identifiers | **Partial** | 26 of 153 concepts have candidates; none reviewed |
| Saved views | **Missing** | Would use the investigation store (ADR-012) |
| Export | **Partial** | JSON export exists; no permission-aware export |
| Collaboration graph | **Blocked** | Needs membership (ADR-014) |

## 4. Compatibility and migration plan

**Reuse unchanged:** the published-snapshot loader and digest verification, `contextConflict`, `claimGraph` path and filter functions, `ontologyMapping` and `mappingReview`, `graphAgents`, the LEA-03 R3F canvas and 2D map, `ObsidianGraph` as the 2D renderer, and the `scientificMemoryGraphRetrieval` read-only channel.

**Extend additively (no replacement):**
- A view-model layer `GraphAssertionView` derived from `DomainEdge` that exposes the brief's context fields as explicit `{ value | "not_stated" }`, never inferred. Missing context stays visible.
- A single domain-mapping table from the published tags (`immune`, `gut`, `brain`, `metabolic`, ...) to the six HSI domains, with its own version and a stated coverage level per domain.
- Unify the two ontology registries behind one list with a recorded release per namespace.

**Add only with approval:** assertion schema fields in the backend, a bounded-neighbourhood endpoint, per-assertion history and validity intervals, node and edge access scopes.

**Do not add:** Neo4j or any second graph store. The graph is 157 nodes today and PostgreSQL already holds the governed tables.

**Library decision (to confirm at LEA-04C, with measurement):** do not add Sigma.js and Graphology now. At 157 nodes the existing canvas renderer is sufficient, and adding about 100 KB gzipped for a 500-node ceiling we are far from is not justified. Revisit when a measured dataset exceeds roughly 2,000 nodes. Do not add D3 for the graph; use SVG for specialised diagrams as now. Run layout in a Web Worker only if a measured frame cost requires it.

## 5. Proposed component structure

```
src/graphWorkspace/                  shared, pure, unit-tested (no React)
  assertionView.ts                   DomainEdge -> GraphAssertionView ("not_stated" explicit)
  domainMap.ts                       published tags -> six domains, with coverage level
  modes.ts                           mode registry (data, below)
  filters.ts                         filter model and application
  views.ts                           saved-view schema (local until ADR-012)
  access.ts                          client-side display guard; server remains authoritative
site/src/graph/
  GraphWorkspace.tsx                 shell: toolbar, left filters, canvas, right inspector, bottom panels, dock
  engine/                            one graph model, layout, selection, focus, expansion
  canvas2d/                          wraps ObsidianGraph
  canvas3d/                          extends LEA-03 Canvas3D
  table/                             accessible tabular alternative
  inspector/                         overview, identifiers, claims, context, evidence, conflicts, review, memory, gaps
  compare/                           side-by-side context comparison
  memory/                            timeline and replay
  dock/                              NEXUS companion
```

### One engine, twelve modes
A mode is **data**, not code: `{ id, nodeKinds, edgeFilter, encodings, filters, inspectorSections, actions, dataReadiness }`.

| Mode | Built from | Data readiness |
|---|---|---|
| Biological Atlas | concepts by domain and kind | Ready |
| Mechanism | candidate relationships, association only | Ready |
| Evidence | relationships by evidence model and context completeness | Ready |
| Contradiction | `contextConflict` classes | Ready |
| Research Gap | recorded gaps and questions | Ready |
| Hypothesis | questions with prediction and falsifier | Ready (4 questions) |
| Experimental | question experiments and controls | Partial |
| Temporal | graph version chain | Partial (version level only) |
| Scientific Memory | memory graph channel | Partial (read-only, no store) |
| Multi-omics | none | **No coverage** |
| Translational | trial concepts (4) | Minimal |
| Collaboration | membership | **Blocked** (ADR-014) |

## 6. Ontology mapping plan

| Requested | Registry | Candidate mappings | Action |
|---|---|---|---|
| Gene Ontology | yes | yes | Reuse |
| Reactome | yes | none | Reuse; import release |
| UniProt | yes | none | Reuse; import |
| Ensembl | **no** | none | Add namespace (owner decision) |
| NCBI Gene | **no** | none | Add namespace |
| ChEBI | mapping only | none | Add to registry |
| Cell Ontology | yes | yes | Reuse |
| UBERON | yes | yes | Reuse |
| MONDO | yes | yes | Reuse |
| Human Phenotype Ontology | mapping only | none | Add to registry |
| NCBI Taxonomy | **no** | none | Add; needed for the species field |
| Experimental Factor Ontology | **no** | none | Add; needed for experimental context |
| PROV-O | **no** | none | Represent provenance with the existing digest and parent chain first; adopt PROV-O vocabulary at export |
| Also present: ECO, HGNC, ChEMBL, LOINC, NCT, PMID | yes | ECO yes | Keep |

Rules carried forward: ontology releases are recorded; an ambiguous mapping stays `ambiguous`; identifier conflicts are shown, never silently merged. Only 26 of 153 concepts have any candidate, so most nodes will honestly display "no canonical identifier".

## 7. API mapping (existing first)

| Capability | Existing | Gap |
|---|---|---|
| Entity search | client over snapshot | server search once the graph grows |
| Entity inspection | snapshot node and edges | assertion detail fields |
| Bounded neighbourhood | none | new endpoint with depth and size limits |
| Typed relationships | snapshot | none |
| Pathway traversal | `findClaimPaths` | server variant later |
| Claim and evidence retrieval | `/api/research/evidence/*`, dossiers (`hsi_lhkg_dossiers`) | passage rights |
| Context comparison | `contextBreakdown`, `contextConflict`, passport | graph integration |
| Contradiction inspection | contradiction ledger, `/api/research/scientific-review/*` | held migrations |
| Historical versions | `version`, `parentVersion`, `?version=` | per-assertion history |
| Scientific memory | `/api/research/memory`, memory graph channel | store consolidation (ADR-012) |
| Saved views | `/api/research/graph-workspace/*` (fail-closed, migrations 031 to 033 held) | apply held migrations |
| Candidate assertion submission | `/api/research/evidence/submit`, `graphAgents` proposals | promotion path |
| Scientific review | `/api/research/scientific-review/queue`, `history` | none |

## 8. Backend dependencies and owner decisions

Blocking the permission-aware and collaborative parts (LEA-04K and parts of 04G, 04J):
1. Accept or amend **ADR-013** (identity binding) and **ADR-014** (scope registry).
2. Accept **ADR-012** (one investigation store) so saved views, memory and replay have a home.
3. Authorise applying held migrations (031 to 033, and 022 to 030 as needed) **to the HSI Neon project only**, under the existing isolation rules.
4. Decide the assertion-schema extension (species, cell type, disease state, dose, duration, validity interval, access scope, per-assertion version history).
5. Decide which ontologies to import beyond the five already imported (Reactome, UniProt, ChEBI, HPO, NCBI Taxonomy, EFO, Ensembl, NCBI Gene).
6. Decide source usage rights: 73 of 75 sources are `unverified`, so exact passages can be shown for almost none until rights are resolved.
7. Confirm where embeddings are stored, since I found no vector migration.

Not blocking: everything in LEA-04B to 04F and 04I (display, filters, context comparison, personalisation) can be built on the published snapshot.

## 9. Scientific reliability risks the design must handle

- **No approved knowledge exists.** The candidate versus approved distinction will show only "candidate, unreviewed" until a review path produces approved assertions. The UI must not imply otherwise.
- **Context is mostly missing.** For most relationships the honest display is "not stated". The graph will look sparse in context; that is the truth.
- **Domain coverage is uneven.** Genomics & Multi-omics has none and Organ & Tissue almost none. The workspace must say so, not draw an empty domain as if it were studied.
- **Association is not causation.** Predicates such as `upregulates` and `suppresses_peripheral_inflammation` are the source's wording. Mechanism views must show them as reported, with the existing association-only guard.
- **Personalisation must not hide conflicts.** It may choose the opening mode and emphasis only; a conflict filter can never be defaulted off.
- **Restricted data.** Until ADR-013 and ADR-014 land, the graph is public-class only; no restricted node may be sent to a client.

## 10. Phased plan

| Phase | Deliverable | Exit criteria | Depends on |
|---|---|---|---|
| **04B** | `src/graphWorkspace` model, assertion view, domain map, mode registry, adapters over the published snapshot, tests | Unit tests pass; every missing field reads `not_stated`; domain coverage reported | none |
| **04C** | Workspace shell, filters, search, 2D graph (existing renderer), accessible table | Keyboard and axe pass; selection drives the panels; works at 320 to 1440px | 04B |
| **04D** | 3D view and multiscale navigation on real data | 3D lazy, within budget; 2D and table equivalent | 04C |
| **04E** | Entity inspector and evidence intelligence | DOI and PMID shown; passages only where rights allow; limits stated | 04C |
| **04F** | Contradiction and side-by-side comparison | Four classes shown; differing variables highlighted; never resolved | 04C |
| **04G** | Memory timeline and replay | Version-pinned replay; superseded marked; read-only until ADR-012 | 04E, owner decisions |
| **04H** | Gap, hypothesis, experiment modes | Candidate experiments labelled, never protocols | 04F |
| **04I** | Personalisation | Role changes the opening mode only; conflicts always reachable | 04C |
| **04J** | NEXUS dock | Uses `graphAgents`; every answer a candidate; model-backed interpretation stays off unless an approved backend exists | 04E, 04F |
| **04K** | Backend integration | Server-enforced access, bounded neighbourhood, held migrations applied | **Owner decisions** |
| **04L** | Validation | Security, scientific reliability, accessibility, performance, cross-browser | all |

### The first build, after approval
**One cross-domain immunology–microbiome workspace on the real published slice** (29 relationships, 35 concepts, 26 sources, 9 gaps), not the 12-entity illustration. It would include: the shared model and mode registry (04B), the shell with the three-panel layout, 2D graph and table (04C), the inspector showing what is and is not stated (04E), and the contradiction and context comparison where the data supports it (04F). Scope: four to five PRs. The 3D view follows once 2D, the table and the inspector are right.

## 11. Decisions I need from you

1. **Approve the plan**, or tell me what to change.
2. **Repository:** confirm we keep working in `hsi-core`, or say whether `living-evidence-atlas` should be audited too.
3. **First slice on the real published graph** (smaller, honest, partly sparse) rather than extending the synthetic atlas. This is my recommendation.
4. **Domains:** are you content for the workspace to state plainly that Genomics & Multi-omics has no coverage yet, rather than showing a synthetic domain?
5. **Libraries:** agree to defer Sigma.js and Graphology until a measured need.
6. Which of the owner decisions in section 8 you want to take now, since they gate 04K.
