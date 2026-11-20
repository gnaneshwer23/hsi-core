# Workspace comparability honesty

**Date:** 20 November 2026 (Europe/London)  
**Programme:** HSI 1.0 Integration First — acceptance checklist #3 (engineering surface)  
**Stacked on:** evidence reliability honesty → continuous Stage 2 trail  
**Honesty:** `potentialContradictionIsNotProvenContradiction=true` · `scientificApproval=false`

## Intent

On `/research/workspace` Why-differ / brief comparison, make **Insufficient comparability ≠ Potential contradiction** explicit, and keep Potential contradiction labelled as candidate-only — without inventing proven conflict or scientific approval.

## Surfaces

| Surface | Behaviour |
| --- | --- |
| USP A panel | Always-visible `COMPARABILITY_HONESTY_LINE` (`data-testid="ws-comparability-honesty"`) |
| Brief markdown | Same line in structured comparison section |
| Continuous e2e | Fixture includes both `context_dependent` and `insufficient_comparability` pairs |

Constant: `COMPARABILITY_HONESTY_LINE` in `src/investigation/liveBriefComparison.ts`.

## Non-goals

- Changing comparison engine classification rules  
- SME gold adjudication  
- Claiming journey complete or production writes  
