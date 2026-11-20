# Workspace continuous Stage 2 trail

**Date:** 20 November 2026 (Europe/London)  
**Plan:** [`HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md`](./HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md) §4  
**Honesty:** `researcherJourneyCompleteClaimed=false` · `writesEnabledClaimed=false` · `scientificallyValidatedClaimed=false`

## Intent

Make `/research/workspace` the default continuous investigation path for the eight unified trail steps without inventing science, free-text model spend, or production writes.

## Open contracts

Pure map: `src/investigation/workspaceTrailNavigation.ts` → applied in `InvestigationWorkspace.tsx` `onUnifiedTrailSelect`.

| Step | Behaviour |
| --- | --- |
| Ask | Scroll `#ws-ask-strip` |
| Evidence | Scroll `#ws-ev-h` |
| Passport | Select first claim if none · scroll `#ws-vf-h` |
| Why differ | Open `#ws-usp-panels` · select first comparison pair (`cmpKey`) · scroll `#ws-disagree-h` |
| Cross-domain | Open `#ws-usp-panels` · scroll `#ws-cross-h` |
| Gaps | Open `#ws-gaps-testable` · scroll `#ws-gp-h` |
| Brief | Open brief · scroll `#ws-brief-panel` |
| Save | Scroll `#ws-conn-h` |

## Ask → scenario bridge

- Home SearchHero / Deep Investigate links use `liveInvestigationHref({ scenarioId })` when `matchScenario(q)` hits.
- Workspace reads `?scenario=<curatedId>` (and profile match) and POSTs that **scenarioId only** via `useLiveRun.start`.
- Unknown scenario values are ignored; default remains `il21-autoimmune`.
- Free-text questions are never sent as the live POST body.

## Still blocked

Live passage rights · SME gold · staging durable writes · steps 12–13 · journey-complete product claim.
