# Live investigation Brief v2 soft-land

**Status:** Engineering soft-land. Live workspace can export a Brief v2 envelope.  
**Not claimed:** Graph release id, reviewed edges, confirmed contradictions, Neon saved-record reproducibility, or scientific approval.

Binding rows: Track C6 (live path) and pack WB-05 fields on a live run.  
Plan note: [`docs/plans/LIVE_BRIEF_V2_EXPORT.md`](../plans/LIVE_BRIEF_V2_EXPORT.md).  
Typed export: [`src/investigation/liveBriefV2.ts`](../../src/investigation/liveBriefV2.ts).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Graph version / release id | Always `null` with an explicit note |
| Review states | Counts only; `reviewedEdgeCount = 0` |
| Run ids | `briefHash` only — not Neon |
| Conflict classes | Polarity co-occurrence marker; never confirmed contradiction |
| Limitations | Base honesty + run gaps (capped) |
| PHI / CDS | `containsPhi: false`, `clinicalAdvice: false` |
| Approval / promotion | Always false |

## This PR

- `exportLiveBriefV2` / `renderLiveBriefV2Markdown`
- Workspace buttons: Export Brief v2 (JSON) and Export Brief v2 (Markdown)
- Unit + Playwright honesty cover

## Not in this soft-land

- Replacing the on-screen v1 brief body
- Printing HTML for live runs
- Inventing reviewed edge status from model agreement
