# Workspace provisional hypothesis honesty

**Date:** 20 November 2026 (Europe/London)  
**Programme:** HSI 1.0 Integration First — acceptance checklist #4 (engineering surface)  
**Stacked on:** comparability honesty → evidence reliability → continuous trail  
**Honesty:** `scientificApproval=false` · `hypothesesAreProvisional=true` · `experimentsAreProvisional=true`

## Intent

Label hypotheses and experiment proposals as **provisional and unvalidated** on the continuous Ask → … → Save path — without claiming findings, recommendations, or scientific approval.

## Surfaces

| Surface | Label |
| --- | --- |
| Hyp block tagline | `Provisional · unvalidated hypothesis` |
| Hyp experiment `<dt>` | `Experiment (provisional, unvalidated)` |
| Testable next questions | `Proposed experiment (provisional, unvalidated)` |
| Brief limitations / markdown | `PROVISIONAL_HYPOTHESIS_HONESTY_LINE` + provisional experiment field |

Constants: `src/investigation/provisionalHypothesisHonesty.ts`.

## Non-goals

- Changing hypothesis generation / challenger models  
- SME gold adjudication  
- Claiming checklist #4 scientifically verified from CI alone  
