# Live Brief v2 export (C6 soft-land on the live path)

Markdown / JSON envelope for live investigation briefs with graph-release honesty, review-state counts, conflict classes, run ids and limitations. Independent of domain-graph Brief v2 (`hsi-domain-research-brief-2`).

## Surfaces

| Path | Role |
| --- | --- |
| `src/investigation/liveBriefV2.ts` | `exportLiveBriefV2` / Markdown |
| `/research/workspace` | Export Brief v2 (JSON / Markdown) beside v1 exports |
| `test/liveBriefV2.test.ts` | Contract + honesty |
| `site/e2e/live-investigation.spec.ts` | Download honesty cover |

## Rules

- Schema `hsi-live-research-brief-2`; `scientificApproval`, `graphPromotable`, `clinicalAdvice`, `containsPhi` stay `false`.
- `graphReleaseId` is always `null` — live runs are not a published graph release.
- `runIds[0]` is the live `briefHash`; it is not a Neon investigation id.
- `reviewStates.reviewedEdgeCount` / `reviewed` stay `0`; every candidate is `unreviewed`.
- Conflict class is engineering-only (`supporting_vs_opposing_candidates` or `no_pairwise_conflict_emitted`); `confirmedContradiction` stays `false`.
- `reproducibleFromSavedRecord` stays `false` (device-local save is not a durable receipt).

## Not in this soft-land

- Domain-graph Brief v2 merge (Track C6 on `/research/knowledge-graph`)
- Dual-reviewer reviewed edges (Track C3)
- Adjudicated conflict classes from reviewed disagreements (Track C5)
- Neon investigation binding or saved-record round-trip

## CI note

Research foundation + P0 hygiene must run on the PR head before merge.
