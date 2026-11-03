# From product integration to shared executable technology

## Target architecture

Aksh Health and Immune Super Intelligence keep their interfaces, authentication,
tenancy and databases. Working, reusable algorithms are extracted into HSI and
called by product-owned adapters. HSI is the canonical implementation, not a
directory of product links. No patient store, clinical action engine or automatic
evidence approval is introduced into HSI.

## First executable extraction

`src/sharedTechnology.ts` contains two real algorithms, exposed through the
`hsi-core/shared-technology` package subpath:

| Source | Shared HSI implementation | Product consumer |
| --- | --- | --- |
| ISI `src/lib/immune/neighbourhood.ts` | Generic bounded, directed/undirected, cycle-safe graph retrieval with draft filtering and hard limits | The original ISI neighbourhood function supplies its existing single KG and formats scientific metadata |
| Aksh `packages/platform-uk/lib/dashboard/sort-review-queue.ts` | Human-review queue prioritisation preserving urgent GUARDIAN, priority and recency ordering | The original Aksh dashboard function delegates ordering to HSI inside Aksh's own process |

These are executable product functions, not stub agents, new diagrams, model
claims or data exports. The graph adapter never creates a second KG; it supplies
lookups into the product's existing graph. Queue ordering is workflow assistance,
not a clinical decision. No clinical records or environment files are transferred.

The traversal additionally reports truncation when a valid further edge is
blocked by the cap; reaching a numerical limit alone does not imply a complete
neighbourhood. Scientific review and evidence presentation stay product-owned.

## Distribution and provenance

The first deployment uses exact source snapshots so both standalone repositories
can build without an unpublished npm package or sibling checkout in Vercel.
`bun scripts/sync-shared-technology.ts isi aksh` copies only the committed canonical
module and its Git revision/version/SHA-256 provenance to the two consumers.
Consumer integrity tests must reject drift. This is a transitional distribution
method; the canonical implementation is maintained only in HSI. Replace it with
a versioned private package release when the package registry is configured.

Source lineage: ISI's bounded BFS and Aksh's queue comparator were inspected in
their active `main` checkouts. ISI source is generalised through injected graph
lookups; Aksh's comparator ordering is retained. No clinical write, auth policy,
database schema or entity/claim approval behaviour is extracted or changed.

## Next build milestones, with acceptance criteria

1. **Shared foundations (this slice):** canonical algorithms execute through both
   existing product functions; integrity and regression checks pass.
2. **Research contracts and provider interfaces:** versioned research context,
   source/passages, graph relationships, provenance and audit events. Providers
   access each product's own storage under its existing permissions. Do not use
   a shared patient database or copy clinical records into HSI.
3. **Executable investigation service:** question → bounded retrieval → graph
   context → opposing evidence → researcher hypothesis → human-review queue →
   versioned dossier. Every stage records actual execution/failure, not a badge.
4. **Replace product-specific duplicate algorithms:** ISI and Aksh consumers use
   the shared release where semantics match. Keep clinical workflows in Aksh;
   HSI orchestrates research-safe capabilities, not autonomous care.
5. **Validate one end-to-end vertical:** RA/anti-TNF remains the first bounded
   research track. Test with fixtures, then source-licensed real evidence and
   independent expert assessment before expanding claims or disease scope.

This extraction does **not** complete milestones 2–5. It does not implement a
new AI agent runtime, live database integration, biomarker discovery, clinical
trial matching or a unified production platform. Database/auth integration and
clinical/scientific validation remain separate requirements. Marketing links and
source-bundle exchange remain supplementary, not evidence of shared execution.
