# Track C1 — D-01 context import soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** curator-filled proposals, graph promotion, scientific approval, or dual-reviewer release.

Binding plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — **C1**.  
Sheet plan: [`docs/plans/D01_CONTEXT_COMPLETION_SHEET.md`](../plans/D01_CONTEXT_COMPLETION_SHEET.md).  
Typed catalog: [`src/operations/c1D01ContextImport.ts`](../../src/operations/c1D01ContextImport.ts).  
Pending worksheet: [`operations/staging/c1-d01-context-import.pending.json`](../../operations/staging/c1-d01-context-import.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Sealed sheet + apply CLI | Reused |
| Proposed fills on sealed sheet | Currently **0** — not invented |
| Empty proposals → apply | Graph **unchanged** (`applied:0`) |
| After apply | `reviewStatus=unreviewed`, `confidence=not_calibrated`, `scientificClaimAllowed=false` |
| `autoPromotion` / graph release | Always `false` |
| Dual-reviewer decisions | Track **C3** (not this PR) |

## What this soft-land adds

1. Typed inventory of seven import/apply surfaces.  
2. Mode assessor (`check` / `fixture`) that never invents fills or promotions.  
3. Apply honesty assessor for CLI / product copy.  
4. Pending JSON worksheet with UNASSIGNED curator refs.

## Reuse (do not rebuild)

- `src/knowledgeGraph/contextCompletionSheet.ts`  
- `scripts/context-completion-sheet.ts` (`export` / `validate` / `merge-csv` / `apply`)  
- `/research/context-completion` fill-progress UI  
- C2 edge-review candidate list over the same sealed sheet

## Owner next steps (not this PR)

1. Assign curators to fill proposed tissue / population / design (or `not_reported`).  
2. Merge filled CSV; re-validate digest against the published graph version.  
3. Opt-in `context-sheet:apply` only after proposals exist; confirm unreviewed honesty.  
4. Keep dual-reviewer release on Track C3.

## Explicit non-goals

- Inventing proposed context values in git  
- Promoting edges or raising `scientificClaimAllowed`  
- Claiming Track C3 dual-reviewer release from soft-land green  
- Treating empty-sheet validate as an applied import  
