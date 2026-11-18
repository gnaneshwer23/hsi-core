# D-01 context completion sheet (A2.4 / KG-05 prep)

Importable curator sheet for **tissue**, **population**, and **design** on D-01 `source_candidate` edges.

## Artifacts

| Path | Role |
| --- | --- |
| `research/domain-graph/context-completions.v1.json` | Sealed sheet (`mappedAgainst` = published graph version) |
| `research/domain-graph/context-completions.v1.csv` | Same rows for spreadsheet edit |
| `src/knowledgeGraph/contextCompletionSheet.ts` | Export / parse / CSV merge / apply |
| `scripts/context-completion-sheet.ts` | CLI |
| `/research/context-completion` | Read-only fill-progress UI (never applies or promotes) |

## Commands

```bash
bun run context-sheet:export      # regenerate JSON + CSV from graph.v1.json
bun run context-sheet:validate    # digest + version + edge id checks
bun run context-sheet:merge-csv -- path/to/edits.csv
bun run context-sheet:apply       # opt-in overlay; refuses if no proposals
```

Open `/research/context-completion` for sealed-sheet fill counts. The page does not write the graph.

## Rules

- Proposed `null` leaves the published value unchanged.
- Use the literal `not_reported` when the source does not state the field.
- Apply never sets `reviewStatus`, never raises `confidence`, and never sets `scientificClaimAllowed`.
- `autoPromotion` and `scientificApproval` on the sheet are always `false`.
- Filling the sheet does not review or promote edges (Track C starts after curators fill values).
