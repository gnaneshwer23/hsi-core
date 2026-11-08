# Audit R3 — Connected Research Workbench (eng deepen)

**Date:** 2026-11-08  
**Source:** *HSI End-to-End Architecture and Roadmap* phase **R3** (Connected Research Workbench)  
**HSI substrate Neon:** red-wave only  
**Honesty:** synthetic fixture ≠ scientific gold · `researcherJourneyCompleteClaimed=false` · `productionReadyClaimed=false` · `writesEnabledClaimed=false` · no hard-coded scientific output · inspectable passages from backend only · `autoApprove=false` · **not CDS** · no MoU · no autumn-snow for HSI · **do not claim R3 science CLEARED**

## Pre-check: user constraint

Human queue residuals stay **parked** for this phase — especially **#5 staging auth** (live exit) plus #2 rights, #3 cite HITL, #4 SMEs, #8 MoU. R3 delivers eng-safe deepen toward exit shape (API-mapped Ask→export · inspectable passage contract · UI probes) only.

## Verdict

| Plane | State |
|-------|--------|
| Engineering journey contract + API mapping + UI deepen | **ENG CLEARED** |
| Authenticated researcher completes Ask→export live | **PENDING_HUMAN** (#5) |
| Production writesEnabled | **NO_GO** (`writesEnabledClaimed=false`) |
| Scientific acceptance of journey outputs | **BLOCKED** |
| Invented passages / MoU / Gate C / CDS-PHI | **Forbidden** (unchanged) |

This receipt is **not** scientific clearance, production readiness, Gate C clearance, or partner lock.

## Delivered (engineering)

| Piece | Location |
|-------|----------|
| Browser-safe journey contract | `src/researchConnectedWorkbench.ts` |
| Manifest types + fail-closed parse | `src/evidence/r3ConnectedResearchWorkbench.ts` |
| On-disk journey manifest | `research/connected-workbench/r3/workbench-journey.v1.json` |
| Status pin | `research/connected-workbench/r3/STATUS.json` |
| Operator checklist | [`R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md`](./R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md) |
| UI deepen (real API probes + passage previews) | `site/src/pages/ResearchMechanismWorkflow.tsx` · `/research/mechanism-workflow` |
| Bound mechanism workflow (PR #62) | `src/researchMechanismWorkflow.ts` |
| Harness | `bun run r3:prepare` · `bun run r3:check` |
| Tests | `test/r3ConnectedResearchWorkbench.test.ts` |

## Journey mapping (this tip)

| Stage | API | Inspectable passages |
|-------|-----|----------------------|
| Ask | `GET /api/research/interrogative/{fixture}` | no (question/plan) |
| Retrieve | `GET …/graph-context` | yes (bundle.passages) |
| Investigate | `GET /api/research/graph/ssc` | graph edges / polarity |
| Verify | `GET …/outcome` | yes (outcome.passages) |
| Review | `POST …/submit-review` | independent reviewer; probe skips POST |
| Export | `GET …/review-package` | yes (package context passages) |

## Measured counts (this tip)

| Metric | Value |
|--------|------:|
| Engineering checks CLEARED | 8 / 8 |
| Human checks PENDING / NO_GO / BLOCKED | 4 / 4 |
| Stages API-bound | **6** |
| Inspectable passage stages | **3** |
| Hard-coded demo content | **0** |
| `researcherJourneyCompleteClaimed` | **false** |
| `scientificAcceptance` | **BLOCKED** |
| Recorded pilot decision unchanged | **true** |

## Exit shape (§ R3) — scaffolding only

Documented Ask→export on authenticated APIs with inspectable passages. **Current step:** `ask` (contract). Live researcher completion remains **false**.

## Explicit non-goals

- Claiming authenticated journey complete without #5 session
- Inventing passage text or hard-coded scientific answers
- Flipping production `writesEnabled`
- Filling SME gold / MoU / Gate C auto-approve
- Fixing human #2/#3/#4/#5/#8
- Live CDS / PHI
- Pointing HSI at autumn-snow

## Next

1. **Parked:** human #5 verified researcher walks Ask→export live.  
2. **Parked:** #4/#8 scientific / partner usefulness before acceptance.  
3. Do **not** merge scientific acceptance from this eng deepen.

## Verify

```sh
bun run r3:prepare
bun run r3:check
bun run gold:check
bun --no-env-file test test/r3ConnectedResearchWorkbench.test.ts
```
