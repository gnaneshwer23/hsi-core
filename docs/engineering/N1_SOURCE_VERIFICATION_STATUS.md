# N1 source verification status

**Phase:** N1 — Verify and ingest sources (gut–immune–T2D bibliographic candidates)  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** scientific approval, claim entailment, Gate C clearance or a rights licence.

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Offline adapter + queue + identity fail-closed tests | **CLEARED** | Reproducible via fixtures under `research/domain-graph/n1/`. |
| Live Europe PMC metadata reachability (this environment) | **CLEARED (metadata only)** | Probe returned HTTP 200 for DOI search; previously documented proxy HTTP 403 is no longer reproduced here. |
| Exact passage / full-text reuse rights | **BLOCKED** | No permitted-use basis recorded; receipts keep `passageTextImported=false` and `rightsStatus=unverified_metadata_only`. |
| DOI↔title identity for all 12 expansion candidates | **BLOCKED (2 mismatches)** | `N1-C-02` and `N1-C-03` request titles that conflict with Crossref/Europe PMC titles for the stored DOIs. Failed identity ≠ verified source. |
| Claim entailment / graph publication / Gate C | **BLOCKED** | Explicitly out of scope for the import adapter. |
| Live N1 *scientific* acceptance | **BLOCKED** | Metadata reachability does not clear rights, mismatches or review. |

## Already present before this increment

- 12 DOI bibliographic candidates in `research/domain-graph/expansion.v1.json` with `identityStatus=bibliographic_candidate_not_retrieved`.
- Domain graph snapshot (153 concepts / 131 relationships / 75 sources) and inspector warnings for unreverified candidates.
- SSc-scoped Europe PMC helper (`src/evidence/europePmcSscDiscovery.ts`) — not reused as authority for this general biomedical queue.

## Delivered in this increment

- Queue materialisation: `research/domain-graph/n1/candidates.v1.json` + `src/evidence/n1CandidateQueue.ts`
- General bibliographic adapter: `src/evidence/europePmcBibliographicLookup.ts`
- Identity / receipt pipeline: `src/evidence/n1SourceVerification.ts`
- Offline fixtures: `research/domain-graph/n1/fixtures/*.europepmc.json` (captured provider JSON; not invented paper text)
- Offline receipt: `research/domain-graph/n1/receipts/import.offline.receipt.json`
- Runner: `bun run n1:verify` (fixtures) · `bun run n1:verify:live` (provider probe) · `bun run n1:check`
- Tests: `test/n1SourceVerification.test.ts`

## Identity mismatches (do not auto-correct)

| Queue ID | Stored DOI | Requested title (expansion) | Provider title for that DOI |
| --- | --- | --- | --- |
| N1-C-02 | `10.1038/nature21492` | Gut microbial metabolites limit… type 1 diabetes | Medicine: The final frontier in cancer diagnosis |
| N1-C-03 | `10.1038/nature16961` | Human gut microbes impact host serum metabolome… | Mastering the game of Go with deep neural networks and tree search |

Title search (informational only; **not** applied to the graph) suggests different DOIs exist for the requested papers (`10.1038/ni.3713`, `10.1038/nature18646`). Correcting expansion DOIs requires an explicit human edit and a new domain-graph rebuild — N1 must not silently rewrite source identity.

## Honesty constraints retained

- Failed lookups and mismatches are explicit queue outcomes.
- Restricted / uncleared text stays metadata-only; no model-memory quotations.
- Animal / mixed / human context annotations remain review fields; import does not re-label species.
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use.

## Verify locally

```sh
bun --no-env-file test test/n1SourceVerification.test.ts
bun run n1:verify
bun run n1:check
# Optional live probe (writes research/domain-graph/n1/receipts/import.live.receipt.json):
bun run n1:verify:live
```
