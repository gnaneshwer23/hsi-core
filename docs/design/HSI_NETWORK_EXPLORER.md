# HSI network exploration

Obsidian-inspired navigation implemented in the shared investigation graph, 13 November 2026. This is an interaction release over the existing verified candidate snapshot, not new source ingestion or scientific acceptance.

## Design

The research network is the primary entry point on the home graph, Science graph and research graph. A filter rail sits beside a deep-teal canvas; the existing assertion inspector retains the source, context and explicit missingness. Colours: instrument #0F2428, slate #103138, paper #F1F5F4, boundary #B8CBC7, text #101D2A, focus teal #216B70. Existing Host Grotesk typography stays consistent. Filters encode the actual snapshot fields rather than invented confidence scores.

## Delivered

- Global graph and one/two-hop local graph, node selection, drag, pan, zoom, fit and label controls.
- Search by name, alias or snapshot ID; matching concepts retain adjacent endpoints so a text search does not erase every connection.
- Entity type, domain, predicate, study-model and finding-direction filters, gap and orphan visibility. Model lives in the question/filter controls and applies to every projection.
- Facets apply before local expansion. Research gaps, negative findings and study membership retain their original meanings. Parallel assertion records are not collapsed.
- Back/forward concept exploration (40 entries, memory only), incoming/outgoing connections, keyboard-accessible relationship list and source inspection.
- URL-backed filters and selected concept; snapshot-pinned handoffs, reload and exported inspection. No token/unrelated query forwarding. Back/forward exploration history itself is not persisted.
- Empty or invalid filters do not substitute another graph or imply scientific absence. An inspected concept outside filters is labelled explicitly; filters never silently switch its identity.
- Existing evidence-path, neighbourhood and shared-connection lenses remain available. Network exports include only inspected/comparison assertions, not an uninspected default path.

## Boundaries

All represented relationships remain candidates/unreviewed. Layout proximity, local expansion and shared connectivity are navigation, not mechanism validation. A public source pointer is not clearance, exact passage grounding, retraction clearance or scientific approval. No external graph service, provider call, migration, production write or graph promotion is enabled. The RA/SSc source corpus and educational map remain explicitly separate datasets. This work does not create missing ontology mappings or expand the scientific corpus.

## Verification

Projection tests cover parallel records, endpoint integrity, filters-before-expansion, negative/gap separation and safe snapshot handoffs. Browser tests cover history, local/global navigation, filters, empty/invalid states, reload, Science/research handoff, original evidence/export, keyboard controls, accessibility and 390/1440px layouts. Full CI results belong to the exact PR commit; fixture/browser success does not satisfy real staging or scientific acceptance.
