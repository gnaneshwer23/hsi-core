# N1 source verification status

**Phase:** N1 — Verify and ingest sources (gut–immune–T2D bibliographic candidates)  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 8 November 2026 (DOI identity correction)

This is an engineering status receipt. It is **not** scientific approval, claim entailment, Gate C clearance or a rights licence.

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Offline adapter + queue + identity fail-closed tests | **CLEARED** | Reproducible via fixtures under `research/domain-graph/n1/`. |
| Live Europe PMC metadata reachability (this environment) | **CLEARED (metadata only)** | Live probe: 12/12 `metadata_matched_unreviewed`; `liveAcceptance=cleared_for_metadata_only`. |
| Exact passage / full-text reuse rights | **BLOCKED** | No permitted-use basis recorded; receipts keep `passageTextImported=false` and `rightsStatus=unverified_metadata_only`. |
| DOI↔title identity for all 12 expansion candidates | **CLEARED** | Human-corrected 2026-11-08: `N1-C-02` → `10.1038/ni.3713`, `N1-C-03` → `10.1038/nature18646` (Crossref + Europe PMC title match). Offline + live: 0 identity mismatches. |
| Claim entailment / graph publication / Gate C | **BLOCKED** | Explicitly out of scope for the import adapter. |
| Live N1 *scientific* acceptance | **BLOCKED** | Metadata identity clearance does not clear rights or review. |

## Already present before this increment

- 12 DOI bibliographic candidates in `research/domain-graph/expansion.v1.json` with `identityStatus=bibliographic_candidate_not_retrieved`.
- Domain graph snapshot and inspector warnings for unreverified candidates.
- SSc-scoped Europe PMC helper (`src/evidence/europePmcSscDiscovery.ts`) — not reused as authority for this general biomedical queue.

## Delivered

- Queue materialisation: `research/domain-graph/n1/candidates.v1.json` + `src/evidence/n1CandidateQueue.ts`
- General bibliographic adapter: `src/evidence/europePmcBibliographicLookup.ts`
- Identity / receipt pipeline: `src/evidence/n1SourceVerification.ts`
- Offline fixtures: `research/domain-graph/n1/fixtures/*.europepmc.json` (captured provider JSON; not invented paper text)
- Offline receipt: `research/domain-graph/n1/receipts/import.offline.receipt.json`
- Live receipt: `research/domain-graph/n1/receipts/import.live.receipt.json`
- Runner: `bun run n1:verify` (fixtures) · `bun run n1:verify:live` (provider probe) · `bun run n1:check`
- Tests: `test/n1SourceVerification.test.ts`

## Human DOI correction (2026-11-08)

| Queue ID | Previous (wrong) DOI | Corrected DOI | Requested title | Provider title (verified) |
| --- | --- | --- | --- | --- |
| N1-C-02 | `10.1038/nature21492` (cancer diagnosis note) | `10.1038/ni.3713` | Gut microbial metabolites limit… type 1 diabetes | Same (Nature Immunology; PMID 28346408) |
| N1-C-03 | `10.1038/nature16961` (AlphaGo paper) | `10.1038/nature18646` | Human gut microbes impact host serum metabolome… | Same (Nature; PMID 27409811) |

Verification: Crossref works API + Europe PMC DOI search (live). Expansion sources + claim `sourceId`s updated; domain-graph rebuilt; N1 fixtures/receipts regenerated; N3 default identity-block set cleared; N3/N4 scaffolds regenerated. **No** passage import, rights clearance, claim entailment, Gate C, or scientific approval.

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
