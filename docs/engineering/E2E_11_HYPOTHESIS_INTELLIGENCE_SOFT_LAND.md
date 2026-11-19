# PR-E2E-11 — Hypothesis intelligence soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** experimental validation, scientific approval, graph promotion, HSI 1.0 must-ship, or invented wet-lab outcomes.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-11** (P3, labelled later).  
Typed catalog: [`src/operations/e2e11HypothesisIntelligence.ts`](../../src/operations/e2e11HypothesisIntelligence.ts).  
Pending worksheet: [`operations/staging/e2e-11-hypothesis-intelligence.pending.json`](../../operations/staging/e2e-11-hypothesis-intelligence.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Priority / band | **P3 · labelled later** |
| `mustShipForHsi10` | Always `false` |
| Experimental validation | Always `false` |
| Review approval = validation | **Forbidden** |
| Ledger `unvalidated` | Always `true` |
| Numeric LLM confidence | **Forbidden** (`not_assessed` only) |
| Optional planner default | Disabled; deterministic falsification fields |

## What this soft-land adds

1. Typed inventory of seven hypothesis / falsification surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims validation or 1.0 must-ship.  
3. Hypothesis honesty assessor for product / ops copy.  
4. Pending JSON worksheet with NOT_STARTED / UNASSIGNED owner refs.

## Reuse (do not rebuild)

- `src/evidence/hypothesisRegistry.ts`  
- `src/investigation/hypothesisLedger.ts`  
- `src/evidence/falsifiableExperimentProposals.ts`  
- `src/interrogativeFalsificationEngine.ts`  
- `src/researchOutcome.ts`  
- Collaboration stubs + optional planner comparison (off by default)

## Owner next steps (not this PR)

1. Finish HSI 1.0 E2E journeys A–F acceptance before centring product on hypothesis intelligence.  
2. Keep collaboration discussion / experiment-proposal stubs until a later band.  
3. Keep planner off unless a preregistered equal-evidence comparison receipt exists.  
4. Do not treat soft-land green as experimental validation or scientific approval.

## Explicit non-goals

- Inventing wet-lab outcomes or numeric model confidence  
- Promoting unvalidated hypotheses into the curated graph  
- Gate C auto-approve or MoU invention  
- Marketing hypothesis intelligence as a 1.0 must-ship feature  
