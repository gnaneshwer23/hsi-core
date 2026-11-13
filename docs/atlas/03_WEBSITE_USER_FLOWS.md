# Website and researcher flows

Implements A01–A06 and public portion of A10 in the [requirement matrix](01_PRODUCT_REQUIREMENTS.md). Reuse `/` and `/research/knowledge-graph`; no duplicate graph on Evidence Intelligence.

## Public homepage

1. Start with connected biology, not a disease default. Search a represented entity, recorded disease annotation, publication title/DOI/PMID/source identifier; or choose a scientific department.
2. Department change keeps selected node/edge, condition/query and pinned snapshot. The view widens to the department; it does not replace the selected investigation with a new example.
3. If selected context is outside the view, say so. Zero tagged connections is coverage pending, not evidence that biology or the literature has no relationship. No visible eligible edge means no draft export for that view.
4. Select a real connection, inspect its assertion, source, species/model and missing experimental context. All candidates remain unreviewed.
5. Download an inspection draft with original assertion/source/context and exact snapshot. Reopen via the versioned workspace link carrying `netDepartment` and the same selected IDs. This download is not an account save, verification or review decision.

## Workspace

The same department registry appears in the existing left network sidebar. Search/conditions and refinements stay data-derived. One/two/three-hop control is under refinement. Changing department preserves URL-selected node/edge; the right inspector can retain an outside-view selection with a coverage warning. Reset is explicit and clears facets, not scientific records. Path/neighbourhood/shared-neighbour lenses have their existing question controls; department facets constrain the network lens only. UI must state this boundary.

## Governed target journey (not live acceptance)

Authenticated researcher → server-resolved permitted context → approved cleared retrieval → investigator/context extraction → comparator/gaps → independent verifier → immutable saved version → independent scoped human review → brief. Graph publication needs its separate gate. Existing saved context is SSc-primary with RA comparison; no universal persistence claim until generalisation and real-account tests pass.

## Acceptance links

[site/e2e/atlas-departments.spec.ts](../../site/e2e/atlas-departments.spec.ts): all six entries, selected-context retention, empty coverage, pinned handoff. [homepage-discovery.spec.ts](../../site/e2e/homepage-discovery.spec.ts): original evidence/context and actual download. [test/atlasDepartments.test.ts](../../test/atlasDepartments.test.ts): arbitrary data-derived condition and source lookup. [test/stagingIsolationRunner.test.ts](../../test/stagingIsolationRunner.test.ts) covers runner refusals; real accounts/DB acceptance remain Next-B, not fulfilled by fixture tests.
