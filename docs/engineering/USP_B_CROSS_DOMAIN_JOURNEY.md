# USP B — Cross-domain scientific investigation (live workspace trail)

**Date:** 19 November 2026  
**Surface:** `/research/workspace`  
**Doctrine:** Business vision execution audit — journey over dashboards.

## User problem

Researchers need to follow **candidate mechanisms across biological domains** (immune ↔ microbiome ↔ neuro ↔ metabolic), with honest labels for reviewed vs candidate vs gap vs AI hypothesis — not a blended causal story.

## USP advanced

**USP B** — Cross-domain scientific investigation.

## Reused

- Published domain graph (`loadDomainGraph` / `graph.v1.json`)
- `departmentCoverage` / `crossDepartmentPaths` from `src/knowledgeGraph/departments.ts`
- Live investigation run labels, run gaps, demoted AI hypotheses, decision brief
- USP A workspace shell (Ask strip + brief panel)

## Implemented (this increment)

- Five-step USP B trail: Ask → Domains → Pathways → Gaps & hypotheses → Brief
- Cross-domain panel on `/research/workspace`: department coverage rail, start/target selectors, candidate pathway list with hop-level evidence status
- Label matching from live-run subjects/objects onto published graph nodes (no invented entities)
- Pure helpers + honesty asserts: `src/investigation/uspBCrossDomainTrail.ts`

## Still mocked / partial / blocked

- Genomics & human-physiology departments remain `no_graph_coverage` in the public snapshot
- Many starts (including IL-21 → neuroscience) correctly report `no_path_within_bound` — coverage gap, not biological absence
- All published edges remain unreviewed candidates; no scientific gold
- Production writes remain off; browser save only
- Org sharing (journey step 12) not in scope

## Tests

- `bun test test/uspBCrossDomainTrail.test.ts`
- Playwright `site/e2e/live-investigation.spec.ts` (USP B trail + cross-domain panel)

## Gates

No PHI · no Gate C auto-approve · no invented edges · association ≠ causation · candidate paths ≠ validated mechanisms · AI hypotheses stay demoted.

## Success outcome

A researcher can run (or reopen) a live investigation and complete Ask → domain coverage → candidate cross-department pathways (or an honest miss) → gaps/hypotheses → brief on one page without leaving `/research/workspace`.
