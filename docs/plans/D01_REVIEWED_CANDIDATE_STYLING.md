# Reviewed vs candidate graph styling (Track C4 / WB-04 soft-land)

Visual distinction for **reviewed** vs **candidate** relationships on the domain knowledge graph — without inventing reviews or promoting edges.

## Surface

| Path | Role |
| --- | --- |
| `/research/knowledge-graph` | Legend + honesty note + lane attributes |
| `src/knowledgeGraph/edgeReviewPresentation.ts` | Lane classifier, counts, strokes |
| `site/src/features/science/GraphVisual.tsx` | `reviewLane` stroke/width |

## Rules

- Published snapshot edges remain `reviewStatus=unreviewed` / `scientificClaimAllowed=false`.
- Reviewed styling is **reserved** (legend + stroke) until dual human review lands.
- Honesty note always reports the live reviewed count (0 today).
- No Neon writes, no graph version bump, no promotion path.

## Not in this soft-land

- Dual-reviewer decisions (C3)
- Graph release / version bump with accepted edges (full C4)
- Changing domain-graph schema to admit reviewed statuses
