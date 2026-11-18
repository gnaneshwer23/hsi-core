# D-01 edge review queue (Track C2 soft-land)

Local curator recommendations on D-01 `source_candidate` edges from the sealed context sheet.

## Surface

| Path | Role |
| --- | --- |
| `/research/d01-edge-review` | Device-local accept / reject / revise / insufficient queue |
| `src/knowledgeGraph/d01EdgeReview.ts` | Validate, digest-chain, export |
| `research/domain-graph/context-completions.v1.json` | Candidate list (same sheet as A2.4) |

## Rules

- Decisions are **recommendations**, not approvals.
- `scientificClaimAllowed`, `graphPromotion`, and `autoPromotion` stay `false` on every record.
- Nothing writes the published graph.
- Reviewer labels are self-declared and unverified.
- Export is for the formal dual-review process; it does not release edges.

## Not in this soft-land

- Server persistence / Neon writes
- Dual-reviewer authority checks
- Graph release styling (Track C4)
- Applying context-sheet proposals (Track C1 still needs filled proposals)
