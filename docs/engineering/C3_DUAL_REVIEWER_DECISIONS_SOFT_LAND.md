# Track C3 — Dual-reviewer decisions soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** dual-reviewed edges, reviewer identities, graph promotion, scientific approval, or version bump.

Binding plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — **C3**.  
Typed catalog: [`src/operations/c3DualReviewerDecisions.ts`](../../src/operations/c3DualReviewerDecisions.ts).  
Pending worksheet: [`operations/staging/c3-dual-reviewer-decisions.pending.json`](../../operations/staging/c3-dual-reviewer-decisions.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| C2 local recommendations | Reused; `reviewerVerified=false` |
| C2 = dual release | **Forbidden** |
| `dualReviewedEdgeCount` | Always `0` in committed artifacts |
| Target band 40–60 | Human authoring goal; not an engineering fill claim |
| Invented reviewer identities / decisions | **Forbidden** |
| Reviewed presentation lane | Reserved empty until dual records exist (C4) |
| Graph version bump for review | **Blocked** until dual records exist |

## What this soft-land adds

1. Typed inventory of seven dual-review surfaces (C2 reuse → human dual → release gates).  
2. Mode assessor (`check` / `fixture`) that never claims dual complete or version bump.  
3. Dual-release honesty assessor for product / ops copy.  
4. Pending JSON worksheet with UNASSIGNED reviewer refs.

## Reuse (do not rebuild)

- `src/knowledgeGraph/d01EdgeReview.ts` (C2 recommendations + digest chain)  
- `src/knowledgeGraph/edgeReviewPresentation.ts` (reviewed lane reserved)  
- C1 context-import soft-land (proposals still curator-owned)

## Owner next steps (not this PR)

1. Recruit two independent reviewers (Track B3).  
2. Record immutable dual decisions on D-01 edges toward 40–60.  
3. Deny self-review; keep C2 exports as unverified inputs only.  
4. Only then allow C4 reviewed styling + version bump.

## Explicit non-goals

- Inventing reviewer identities or dual decision records in git  
- Treating C2 local recommendations as release authority  
- Painting the reviewed lane from unreviewed candidates  
- Bumping graph version for invented reviews  
