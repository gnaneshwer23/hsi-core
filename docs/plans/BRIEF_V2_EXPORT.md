# Brief v2 export (Track C6 soft-land)

Markdown, JSON and print export for domain-graph research briefs with graph release id, review-state counts, conflict classes, run ids and limitations.

## Surfaces

| Path | Role |
| --- | --- |
| `src/knowledgeGraph/briefV2.ts` | `exportBriefV2` / Markdown / print HTML |
| `/research/knowledge-graph?experience=advanced` | Export & pin menu + Research outcomes actions |
| `site/e2e/brief-v2-export.spec.ts` | Honesty cover |

## Rules

- Schema `hsi-domain-research-brief-2`; `scientificApproval` and `graphPromotable` stay `false`.
- `reviewStates.reviewedEdgeCount` is `0` until dual-reviewer release (Track C3).
- Conflict class is engineering `context_comparison_required` only — never a confirmed contradiction.
- `runIds` default empty; caller may supply ids without inventing a saved-record receipt.
- Soft-land is reproducible from the sealed graph snapshot + filters, not from Neon investigation rows.

## Not in this soft-land

- Saved-record round-trip (`reproducibleFromSavedRecord` remains `false`)
- Adjudicated conflict classes from reviewed edges (Track C5)
- Graph promotion or review-status mutation
