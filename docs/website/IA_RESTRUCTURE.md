# Information architecture: audit and restructure proposal

Measured on the live build at 1440 px. These are structural observations, not user-research findings (no sessions have run; see `USABILITY_TEST_PLAN.md`).

## What the audit found
| Surface | Observation | Effect |
|---|---|---|
| Researcher home | About 3,900 px tall with 10 content sections. "Next moves" sat about 1,580 px down, below the graph | The one section that says what to do next was below the fold |
| Sidebar | 20 links in 7 groups, including four governed or synthetic modules (cohort, trial pre-screening, evaluation set, candidate targets) | A new researcher sees the whole platform at once, with no sense of order |
| Home content | Research interests, Continue researching, Recommended research, Research library and Ask a question all follow the graph | Setup, reading and asking are mixed with the main job |
| Landing | Hero, differences, open questions, loop, product, limits, close: seven blocks | Sound order. The remaining risk is the hero being too dense, which only testing can show |
| Onboarding | Four required steps, no skip | Intentional (the profile drives the dashboard). Drop-off is unmeasured |

## Done in this change
- Researcher home: "Next moves" and "Where you are in the loop" now sit directly under the four number tiles, above the graph. Action first, evidence second.
- Landing: hero rebuilt as a console, claim record added, lower sections rebuilt (see PR #435).

## Proposed next, in order of value
1. **Split the home into "Today" and "My setup".** Today keeps: question, search, tiles, next moves, the graph. Move interests, library and ask-a-question under a "My setup" area reached from the sidebar. Cuts the page by roughly a third.
2. **Order the sidebar by the research loop, not by module.** Group as Ask, Explore, Decide. Fold "Patients and trials" and "Evaluation set" under one collapsed "Governed modules (synthetic data)" group so they are visible but not in the first scan. Needs an update to the navigation e2e specs.
3. **Measure onboarding before changing it.** Record step reached and completion locally in the browser record (no server, no identifiers) and read it in the first test sessions. Then decide whether any field can move after the first dashboard view.
4. **Landing hero density.** Test task 1 in the usability plan first. If participants cannot state the purpose, shorten the lead to one sentence and move the status line below the graph.

## Not recommended
- Making onboarding skippable. It breaks the personalised dashboard and the owner decision was to keep every step required.
- Adding demo content to fill space. Demo tabs stay behind `?demo=1`.
