# HSI graph correction — implementation findings

Reviewed 12 November 2026 against website candidate `f9abfbf736b7de45db67b53ededd70d4533569e1`. This is a source audit, not acceptance of a redesigned graph. No graph infrastructure, data, deployment or scientific permissions were changed.

## Finding

The three experiences do not yet deliver the planned investigation-first graph. Passing website tests demonstrated implemented interactions and disclosures, not that the graph product met its vision. The website work preserved the existing graph instead of correcting that product gap.

| Surface | Actual implementation | Gap against the plan |
|---|---|---|
| Homepage / Science illustration | `ResearchPublic.tsx:452` draws a fixed six-domain SVG. Clicking a domain changes descriptive text and an illustrative spoke. `Home.tsx` separately uses an illustrative SSc mechanism. | These are conceptual illustrations, not a projection of a versioned investigation. They do not let a visitor inspect a real candidate edge, its study context or its source record. |
| Public explorer `/science/graph` | `ScienceGraph.tsx` imports `SCIENCE_GRAPH`; `knowledgeGraph.ts` builds it from `biologyCatalogue.ts`. Ten editorial concepts and eighteen topic links. `biologyCatalogue.ts:47` assigns `RELATED_TOPIC`, empty edge evidence, draft status. | Useful educational navigation, but too coarse to be the flagship biological research graph. Organ/topic links do not show cells, pathways, experimental findings and competing context as one investigation. |
| Research `/research/knowledge-graph` | `ClaimKnowledgeGraph.tsx:15` separates the domain graph from the source corpus. `DomainKnowledgeGraph.tsx` offers question templates, filters, a two-hop graph, source/context inspection, bounded directed paths, comparisons and exports. | More substantial than a decorative network, but fragmented across surfaces. Search is lexical; exploration begins in one of four template questions. Source-corpus inspection is another mode, not one continuous selected-path evidence journey. Snapshot candidates are not reviewed knowledge. |

The current domain snapshot contains **153 concepts, 131 relationships, 75 source records, nine gap questions and zero independently approved relationships**. Version: `e06d43438e382a6d1f52c932420bd189014d8449b09c2d3113b5a34fde076d03`. Its four question templates concern gut/type-2 diabetes, gut/type-1 diabetes, SCFA/Treg/Th17 and neuroimmune/metabolic inflammation. This is not immunology-wide or a completed scientifically reviewed graph.

## Planned contract to restore

`docs/strategy/HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`, Deliverable 9: investigation over spectacle; progressive expansion; search, select, expand, evidence filters, citations, comparison and related investigations. Node and edge cards retain identifiers, context, evidence, uncertainty and review state. Q3–Q10 specify mechanism, conflict and gap questions. Clinical Q1/Q2 and patient data remain outside this research correction.

`docs/design/HSI_KNOWLEDGE_GRAPH_FLAGSHIP.md`: educational topics, research candidates/gaps and governed approved knowledge are separate honesty layers. The public topic map cannot silently become a scientific mechanism graph.

## What the supplied reference contributes

[obra/knowledge-graph](https://github.com/obra/knowledge-graph) indexes Obsidian notes locally and exposes semantic/keyword search, bounded neighbourhoods, paths, shared neighbours, communities and structural rankings. Its [graph implementation](https://github.com/obra/knowledge-graph/blob/main/src/lib/graph.ts) provides useful interaction primitives. It is a CLI/MCP and indexing reference, not an existing biomedical graph visualization to drop into the website.

Useful patterns to adapt:

- Find an entity, inspect its local neighbourhood, select a destination and trace a bounded connection.
- Show shared connections between two selected concepts.
- Preserve the originating text/context while traversing.
- Use local or approved search infrastructure instead of adding a model to every graph operation.

Do not copy its semantics into HSI:

- Notes and wiki links are untyped compared with biomedical claims. A wiki link is not scientific evidence.
- `findPaths` traverses an undirected projection and takes the first matching edge context. HSI must preserve direction, distinct parallel assertions, negation, source versions and model/species changes for every step.
- Community membership, PageRank and betweenness are structural properties, not scientific confidence, evidence strength or causal mediation.
- A local note index does not supply HSI source rights, corrections/retractions, tenant isolation or independent review.

No dependency was installed and no code was copied from the reference.

## Dependency-aware correction slices

1. **One investigation state and shared graph projection.** A version-pinned question, selected entities, filters, selected edge/path and source-release reference must survive handoff from homepage to Science to research. Educational navigation remains explicitly available as a secondary mode. Reject incompatible snapshot bindings rather than selecting similarly named entities silently.
2. **Research workspace.** Question/search rail; restrained graph or accessible relationship list; adjacent source/context inspector. Progressive one-/two-hop expansion and selected paths replace a full-network dump. Compare two findings without pooling them; show directed steps, counterevidence and gaps. Keep the existing source corpus, controls and exports accessible under the same selection model.
3. **Homepage and Science.** Reuse a bounded projection of that experience; give every displayed candidate edge an inspect action and a real handoff. Keep illustrative biology clearly marked. A fixed six-spoke drawing must not stand in for the flagship graph.
4. **Search and analysis only after the contract.** Add rights-appropriate alias/full-text retrieval first, evaluate semantic search separately, and expose shared connections. Structural community/bridge tools are optional exploratory aids. No graph database replacement is justified by the current problem.

## Acceptance before declaring the correction complete

- A visitor follows one represented question across all three surfaces; selected concepts, edge and snapshot remain the same after navigation/reload.
- Each displayed path step retains direction, exact assertion ID, source record, context, missingness, review status and any negative finding. Parallel evidence is never collapsed to the first source.
- A researcher can inspect support and opposition, compare study systems and see a missing-context/unsupported-path outcome without a causal conclusion being invented.
- Empty search, missing snapshot, filtered-out evidence and unavailable passage are distinguishable; no silent fallback to illustrative data.
- Graph and keyboard/list modes use the same selection state, including narrow screens and reduced motion. Screenshots and task-based review assess the graph experience itself, alongside regression tests.
- No new approved edges, clearance, reviewer identity or live capabilities are fabricated. A/B, production writes and scientific release gates stay unchanged.

This audit identifies the correction; implementation and visual acceptance are still outstanding. The existing website PR checks must not be presented as that acceptance.
