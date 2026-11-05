# HSI graph explorer — ISI/Obsidian interaction refresh

5 November 2026. Entry: `/science/graph`.

## Reference audit

Inspected ISI's actual local source (`immunecity/src/components/immune/GraphView.tsx` and `src/routes/graph.tsx`): force-directed graph, concept search/type filters, evidence filtering, zoom/drag, edge inspection and adjacent concept details. The previous HSI page presented a circular layout below a long SSc research section; it did not offer the same graph-first exploration.

This change implements the interaction pattern in HSI, using HSI's existing public dataset and evidence contracts. It does not copy ISI's graph assertions, authentication, database or simulation results into HSI. All original sources and separate release boundaries remain intact.

## New experience

- Search/filter rail, central dark graph canvas, and adjacent concept/evidence inspector.
- Deterministic bounded force layout, with stable domain seeding, edge attraction and node repulsion. Position/proximity never asserts biological causality.
- Colour legend generated from represented node types; labels highlight the selected/hovered neighbourhood, with an all-labels control.
- Real pointer node dragging; dragging the canvas pans. Wheel zoom and keyboard-operable zoom/pan/reset alternatives.
- Global graph and local neighbourhood views; one-to-three-hop depth applies to local mode.
- Search by represented name, identifier or definition; type, domain, review and relationship evidence filters.
- Query, selected concept, scope, depth and filters live in the URL; bookmarks, reload and browser navigation restore those settings.
- Linked concepts navigate through a deduplicated neighbour list. Clicking or keyboard-selecting a graph connection opens its actual typed evidence dossier.
- Filtered-out selection is explicitly identified; empty filters explain dataset scope and offer recovery. Only links with both endpoints visible are rendered; evidence filtering cannot invent unsupported nodes or sources.
- SVG/PNG/JSON downloads preserve the visible draft scope; JSON also records force-layout positions. Reset restores the computed layout.
- The source-linked SSc research map remains in a separate expandable dataset panel, reachable from the graph guide. Its evidence/mappings/review gates are preserved.
- Responsive stacked layout on small screens, visible keyboard focus and a static force solution that does not depend on continuous animation.

## Data and scientific scope

The current public overview contains **10 represented concepts and 18 draft topic connections**. It is smaller than ISI's graph. No additional immune entities, evidence, scientific approval or causal direction has been invented to simulate a larger network. Node filters and evidence statuses reflect actual stored values only. The source-linked SSc draft remains distinct from this educational overview and from authenticated released investigation graphs.

## Verification

Core tests verify filter endpoint integrity, unsupported-evidence empty results, deterministic bounded layout and absence of source mutation. Browser checks exercise URL/filter persistence, global/local depth, connected-concept navigation, actual pointer movement and scroll zoom, keyboard edge evidence inspection, exports, 320px width and SSc panel navigation. Existing graph/evidence/public-journey regressions remain part of verification.

Verification result: 772 core tests passed, plus 19 focused graph/public-journey browser tests. The final layout unit checks, site TypeScript, repository build and site production build passed. Final desktop rendering was visually inspected. The existing frontend bundle-size warning remains.

No migration, new graph/database service, scientific release or production role change is part of this update. Existing deployment/live-access acceptance remains separate.
