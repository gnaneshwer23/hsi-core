# HSI landing experience backlog (initial hypotheses; not validated defects)

| Priority | Hypothesis / check | Owner | Acceptance |
|---|---|---|---|
| P0 Audit | Verify whether production, main and latest landing PRs match; prevent stale screenshots and duplicate redesign | Orchestrator + QA | SHA/date captured and differences documented |
| P0 Truth | Verify CTA labels, registration/research access permissions, demo-only labels, and graph status against actual behavior | Scientific copy + QA | Every primary CTA has expected destination and accurate status in E2E |
| P1 Narrative | Observe whether first-time postdocs understand question → context/evidence → disagreement/gap → brief from the hero/proof/demo without reading walls of text | UX + Experience | Usability protocol, findings and specific iteration |
| P1 Visual | Audit hierarchy/spacing on 320/390/768/1440 and image/diagram visibility; preserve DESIGN.md tokens | UX + Frontend | Screenshot comparison, no overflow, no regressions |
| P1 Performance | Baseline bundle, images, CLS/LCP, interaction responsiveness and reduced motion prior to any optimisation | Frontend + QA | Actual measured before/after, no invented scores |
| P2 SEO | Audit page-specific title/meta, canonical/sitemap, accessible labels and structured navigation | Copy + QA | SEO and axe tests pass |
| P2 Evidence | Confirm graph/digest provenance and all sample/illustrative image labels | Experience + QA | All public proof is clearly source/status labelled |

Priorities are for discovery, not automatic authorisation for redesign. Reconcile recent landing-page PRs before selecting work.
