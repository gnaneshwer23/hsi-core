# P1 — one investigation graph across the public and research surfaces

13 November 2026. Engineering correction to the graph audit; scientific acceptance and live backend activation remain separate.

## What changes

Home and Science domain sections now offer the same on-demand investigation component instead of a fixed hub-and-spoke graph. The data is the existing version-verified domain snapshot, not invented demo relationships. The default `/science/graph` and `/research/knowledge-graph` entries open this shared experience.

Start with one of the recorded question templates or a lexical concept/alias/identifier search. Select starting and destination concepts; inspect outgoing source-candidate paths, bounded at six steps, eight paths and 2,500 expansions. A path retains every assertion ID, direction, parallel finding, negative result, source and original recorded context. Gaps and study-membership links do not complete source paths.

Neighbourhoods expand by one or two hops. Shared connections preserve incoming/outgoing directions and individual findings, but are explicitly structural overlap rather than demonstrated mediation. No PageRank, community detection or inferred confidence is substituted for scientific evidence.

Path diagrams have parallel full-text step buttons. The inspector shows original assertion, study model/design, missing context, source identity/rights/retrieval status, locator and review limitations. External source text is not fetched. Two source candidates can be compared without pooling different entities, manufacturing missing context or confirming a contradiction. Dose and units missing from this snapshot are explicitly absent.

## State and continuity

The handoff between public preview, Science and research pins `domainVersion`, question, endpoints, selected node/edge/path, model/depth/view and comparison. Invalid versions, mismatched selections and forged paths fail closed instead of resolving names against a different graph. Handoff/export excludes unrelated URL parameters and free search text.

JSON inspection export carries the same pinned view and original selected assertions/sources. It retains `sourceClearanceVerified:false`, `scientificApproval:false`, `graphPromotable:false` and `liveProviderExecution:false`. It is a local download, not an account save, approved brief or new scientific run. Question-template gap records are explicitly distinguished from newly discovered gaps if the user changes endpoints.

## Preserved specialist surfaces

- `/science/graph?dataset=educational` retains the small educational topic map and its original tests. Existing organ bookmarks such as `?node=pancreas` remain educational only when no domain snapshot pin is supplied; an invalid research snapshot cannot silently fall back to that map.
- `/research/knowledge-graph?experience=advanced` retains domain filters, outcomes, synthetic validation cohorts, registry imports and exports. Its question and pin navigation preserve the advanced mode.
- `/research/knowledge-graph?dataset=source-corpus` and source-corpus version pins retain the RA/SSc claim graph. This is explicitly a separate dataset; it is not claimed as evidence for a selected domain path.
- Existing auth, protected saved-workspace routes, migration holds and provider/write controls are unchanged.

## Verification

Unit regressions cover directed parallel assertions, negative findings, gap/study-membership exclusion, model-filter endpoint integrity, bounded expansion, shared-direction preservation, immutable inputs and pinned handoff allowlisting. Browser tests cover actual Home→Science→research→reload continuity, exact source assertions, context/missingness/export, comparison, empty-search/path states, tampered snapshots and selections, keyboard inspection, responsive layout and automated accessibility across all three views.

Legacy regression suites still exercise their full original functionality through explicit educational/advanced entry points. The new suite exercises the primary default experience. Passing tests are engineering evidence; scientist review of source mappings/context and human task/design acceptance remain outstanding.

The root check exercises publication generation, which can produce a new public snapshot hash. CI restores the committed publication inputs and removes only untracked generated domain-version files in its disposable checkout before building/testing the site. A remaining tracked diff fails the job. Thus browser handoff tests and screenshots use the same committed snapshot identity as the Vercel site build, rather than silently certifying regenerated scratch data.

## Reference and remaining boundaries

[obra/knowledge-graph](https://github.com/obra/knowledge-graph) informed the search→neighbourhood→path→shared-connection interaction pattern. No code or dependencies were copied. HSI retains its typed directed scientific assertions, existing loaders and snapshot store rather than replacing them with untyped note links or an undirected graph index.

This change does not expand the curated corpus, establish rights/retraction clearance, create approved graph knowledge, add semantic retrieval, persist private investigations or implement live agent execution. Next-A/B approvals, the independently adjudicated benchmark, scoped scientific review and operational release evidence remain required for their respective acceptance claims.
