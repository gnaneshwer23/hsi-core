# Reference-inspired HSI research dashboard

6 November 2026. Route: `/research/dashboard`.

The supplied clinical-dashboard references informed the compact toolbar, soft cards, large introduction/anatomy area, four summary tiles, recent-record table, donut chart and context side rail. HSI retains its ivory/teal palette and research boundary. The social-media framing, named doctors/patients, clinical alerts, diagnosis counts, appointments, growth percentages and treatment success rates were not copied or invented.

## Connected behavior

- The compact toolbar opens investigations, validation profiles, the knowledge graph, independent review and the existing research-account page.
- New investigation opens the existing create/list/reopen workspace on the same page. If creation is not confirmed by the backend, the entry is labelled Open workspace instead.
- `InvestigationWorkspace` exposes an optional read-only UI snapshot callback. Its API transport, trusted parser, save/idempotency logic and backend permission checks remain unchanged. The dashboard derives loaded-investigation counts, recent rows and awaiting-review counts from that same response; it makes no duplicate private-data request.
- Private summary counts are unavailable (`—`) while loading, denied or errored. Zero is shown only after an authorised empty response. Counts describe the loaded list, not the entire platform or an independently authorised reviewer queue.
- Public validation counts and profile/domain lists load through the existing pinned SHA-256/bounded fixture client. No unverified counts are substituted after a failed load.
- The condition and text filters operate on the verified 200-profile catalogue. Five-row pagination and direct profile links use canonical fixture IDs.
- Selecting a profile updates the labelled synthetic HbA1c/hs-CRP observations, sparkline and context card. Profile and condition assets are checked before display. An explicit ID guard prevents old profile values appearing under a new selection while its request is pending.
- The donut shows actual counts by represented domain; it describes fixture composition, not epidemiological prevalence.
- Context bars show distinct recorded visits and row counts for labs, immune, microbiome, lifestyle and wearables. They are not clinical progress, data-quality or treatment-effect scores.
- The original SVG anatomy is illustrative research context, not an anatomical model or patient rendering. Its caption and observation cards preserve scope.
- Refresh validation data re-verifies public fixture data without remounting the research form or discarding its typed question. Timeouts, catalogue integrity failures and profile failures have explicit recovery states.
- Research brief navigation, source inspection, trial research and discussion-draft links reuse existing tool destinations. No new clinical, trial-enrolment or notification service is introduced.

## Design and accessibility

The dashboard has its own contextual navigation, so the generic research-navigation row is omitted on this route. The site header/footer remain shared. The two-column overview and side rail stack on small screens; the profile table scrolls within its card. Key actions have visible keyboard focus and touch-sized targets. Low-contrast text in the reference was adapted to darker readable colours. Counts, chart legends, selected state, labels and record coverage are exposed as text/accessible SVG or meter descriptions.

## Verification and release limits

Pure tests check source-derived distributions, filtering and record/visit coverage. Browser checks exercise authorised and denied workspace responses, true counts, profile switching/deep links, search/pagination, tamper refusal/recovery and 320px layout. Existing research creation/reopen, idempotency and authorization regressions remain in the suite.

Verification result: 775 core tests and all 119 browser tests passed. Repository build, site TypeScript, client production build and the SEO prerender stage passed. Desktop composition and the narrow-screen error state were visually inspected. The existing frontend bundle-size warning remains.

No database migration, production role grant, scientific approval or auth-provider change is part of this dashboard increment. Live workspace usability still depends on the existing deployment's correct account/database/role configuration. The fixture overview can function independently while those gates remain pending.
