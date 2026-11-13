# Scientific Discovery Atlas: recorded research context increment

Base: 6775348c9df1832ab1838dd48dd4b6ae60f8485d. Status: implementation in progress; local only.

The supplied orchestration specification is a target architecture, not evidence of deployed capabilities. This increment extends the existing graph, not a replacement graph or thirteen model services. No model-specific subagents are launched.

## Implementation truth / reuse

| Area | Evidence | Current truth / remaining work |
|---|---|---|
| Public candidate graph | `src/knowledgeGraph/domainGraph.ts`, `site/src/lib/claimGraphClient.ts`, research API catch-all | Version/hash-verified read-only candidate snapshot; no reviewed graph promotion |
| Navigation | `networkExplorer.ts`, `ResearchNetworkExplorer.tsx`, `GraphVisual.tsx` | Search, domains/types/predicates, polarity, local/global depth, history, accessible list, pan/zoom/drag and export exist |
| Experimental context | `DomainEdge`, `compareDomainEvidence` | Model/design/tissue/population/assay/time/intervention/outcome present, often missing; current network filters omit disease/tissue/assay |
| Ontologies | `hsiOntologyRegistry.ts`, `biomedicalEntityResolution.ts` | Namespace syntax and conservative reviewed mapping contracts exist; public candidate nodes have local identifiers, not a verified disease ontology hierarchy |
| Investigation continuity | `investigationProjection.ts`, `investigationGraphContext.ts`, context service/store | URL/export continuity plus separately governed persisted context contracts; authenticated staging acceptance remains unverified |
| Agents and reliability | `hsiAgentOrchestrator.ts`, server review/execution services | Reuse governed contracts; public graph is not a live agent conversation or independent scientific verification |
| Database | `hsiNeonGraphReadRepository.ts`, migration/activation gates | Separate authenticated read service; no new DB scope, migration or write activation in this increment |

## Task ATLAS-CONTEXT-01

Owner: current agent. Worktree `/private/tmp/hsi-atlas-context`; branch `feat/atlas-context-navigation`.

Add data-derived condition selection (up to two recorded conditions), tissue, assay and relationship-evidence facets to the existing network projection. These are exact recorded annotations, not inferred diagnoses, ontology expansion or evidence-quality scores. Compare-condition mode shows the union of separately attributed records and never pools effects. Explicit missing context must be selectable.

Inputs: existing pinned DomainBundle and URL filters. Outputs: original node/edge records and visible context coverage counts. Preserve condition, tissue, assay and evidence filters through versioned handoff/export. Unknown facet values fail closed. No new source ingestion, invented MONDO mappings, credentials, model calls, reviewer identities or scientific approval states.

Acceptance: tests prove RA/SSc records stay attributed; mixed model/context records never become causal support; unknown and missing fields are explicit; selected context survives handoff and strips unrelated identity/token fields; browser verifies filters, counts, reset, keyboard and narrow layout. Existing network/graph regression tests and site/API build must pass.

## Dependency-aware follow-on tasks

1. Independently reviewed disease ontology pack and licence records → disease-family expansion; do not infer MONDO IDs from names.
2. Current context increment + authorised isolation acceptance → persisted researcher context acceptance.
3. Source clearance and approved provider execution + persisted scoped context → context-aware investigator/verifier interaction.
4. Independent expert assessments + locked benchmark protocol → scientific mechanism/conflict/gap acceptance; retain final 120-case benchmark objective.
5. Pilot evidence → optional planner, voice and broader automation.

Human scientific review remains authoritative. The supplied AI-first approval proposal does not replace that boundary. Missing ingestion/search coverage is not novelty; candidate associations are not causal mechanisms. No production activation or deployment is part of this increment.

## Review result

ATLAS-CONTEXT-01: locally verified engineering increment. All 2,017 repository tests passed (one optional live test skipped), including 15 targeted graph/projection tests with 233 assertions. Root/test typechecks and site/API build passed. Browser verified RA (18 relationships), RA+SSc (28), explicit missing tissue (23), reload and Science handoff, plus mobile filter expansion/collapse without horizontal overflow. Added two browser regression tests; the automated Playwright suite and a fresh automated accessibility scan were not run for this increment. No scientific validation is claimed.

The new facets constrain the **network view**. Path views retain their existing question controls; this limitation is visible in the interface. Context changes clear stale inspected edges/comparisons and choose a concept from eligible records where possible. Existing source records and scientific gates are unchanged.

## Programme register / scope crosswalk

| Supplied task | Current increment / remaining dependency |
|---|---|
| 00 audit | Bounded implementation/reuse audit above; not a new exhaustive audit of deployments, credentials or every repository subsystem |
| 01 disease context | Recorded disease and study-context filtering implemented. Reviewed ontology hierarchy, synonym pack, licence decisions and expanded associations remain required |
| 02 graph foundation | Existing versioned typed candidate graph reused. No new reviewed states, promotion rights or DB schema |
| 03 explorer | Existing graph enhanced with two-condition view, context facets, missingness counts and mobile filter disclosure. No new clustering algorithm |
| 04 conversations | No live conversation added. Provider/source approval and authorised context execution remain dependencies |
| 05 evidence pipeline | No connectors activated, sources ingested or rights receipts invented |
| 06 mechanisms | Existing path inspection retained; no causal or cross-disease scientific acceptance claim |
| 07 gaps | Existing gap records remain unverified; missing coverage never proves novelty |
| 08 review | Existing independent human authority retained; no AI self-approval or new scientific sign-off |
| 09 voice | Deferred; no separate reasoning system or microphone permissions |
| 10 evaluation | Existing 120-case acceptance objective unchanged; no expert labels invented |
| 11 runtime | No migration, account creation, role grants, provider activation or write enablement |
| 12 workspace | Recorded context preserved through existing graph/Science URL and export handoff; real-account persistence not demonstrated |
| 13 website | PR #313 already released. This increment does not change or redeploy marketing pages |

Local review branch only. No remote push, PR merge or deployment for this increment. The production release remains the separately verified #313 revision.


## Simplification following user review

The active design supersedes the earlier expanded sidebar: search plus one condition selector are visible by default. Start from a one-hop neighbourhood; search expands only the matching recorded network. A single refinement disclosure holds condition comparison, tissue and candidate/gap selection. Assay/type/domain/predicate/polarity controls are retained only for compatible saved URLs and deterministic contracts, not shown as a new control wall. Reset clears these inherited filters.

Graph controls show zoom and fit. Space remains draggable; a focused graph supports arrow-key panning. Exports and evidence-coverage detail use disclosures. Existing unreviewed status, actual source inspection, missingness and exact snapshot continuity remain. This improves navigation and reduces clutter; it is not evidence of improved scientific accuracy.

## Homepage evidence journey (local increment)

The homepage now exposes the shared version-verified graph as one continuous public journey: explore connections, inspect the original assertion/source/experimental context, export a pinned inspection draft, and reopen the same version/selection in the research workspace. Recorded-condition filtering resets stale drafts. Evidence Intelligence retains source reading without a duplicate graph.

The export uses the existing inspection schema and original records. Clearance verification, scientific approval, graph promotion and live provider execution remain false. This public journey does not perform live investigation, independent review or authenticated persistence.

Manual browser acceptance covered desktop/mobile layout, condition reset, evidence inspection and a real Markdown download retaining mouse context and explicit missing fields. Type checks and site build pass. Browser regression specifications were updated and added; the automated browser suite has not been run for this increment. No production activation is included.
