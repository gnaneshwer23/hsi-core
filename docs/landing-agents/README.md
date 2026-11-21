# HSI public website agent team

Scope: public landing pages and public navigation in the existing `hsi-core` application. This is a **Cursor development-team workflow**, not the HSI biomedical runtime and not seven new public-facing scientific agents.

## Existing baseline (repository audit, 21 November 2026)
- Governing rules: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `docs/strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`.
- Public home: `site/src/pages/HomeLanding.tsx`; primary navigation: `site/src/components/Nav.tsx` and `site/src/lib/primaryNav.ts`.
- Shared public visual system: `site/src/styles/premium-public.css` plus other public CSS. Reuse rather than introduce a competing system.
- Existing proof: `InvestigationFlowDiagram`, `RelationshipDiagram`, `LiveGraphHero`, verified snapshot status, `DemoLandingPreviewPanel`, six scientific domain links, screenshots, research-home CTAs.
- Existing Cursor rules under `.cursor/rules/`; existing root `AGENTS.md` remains authoritative.
- Existing public tests: `site/e2e/landing-pages.spec.ts`, `stage2-integrated-qa.spec.ts`, `seo.spec.ts`, `approved-website.spec.ts`, `demo-universe-landing.spec.ts`.
- 21 Nov QA packet records a passing site build/landing checks and pending owner visual acceptance + public-launch GO/NO-GO. It does not establish general scientific platform readiness.
- Older UX audit documented link/context drift; older integration QA documented browser-only request semantics. Confirm current source and deployment before reopening past issues.

## What is working; what to improve
1. **Preserve** existing graph-led, evidence-and-context-led storytelling. Tune hierarchy, space, typographic rhythm and human comprehension based on screen captures, not generic competitor replication.
2. **Review** each CTA against actual route, session and access semantics. Research access is not automatically granted by creating an account. Do not market unavailable actions.
3. **Check** public route and content continuity across /, /how-it-works, /knowledge-graph, /researchers, /trust, /about, /contact and indexed audience pages. Find actual routes in `site/src/App.tsx` before editing.
4. **Verify** the displayed snapshot and demo labels. Candidate, unreviewed, synthetic and restricted must be accurate and visible.
5. **Retest** on 320/390/768/1440 px with keyboard, reduced motion, axe WCAG 2.2 AA, metadata/SEO, layout shifts and contrast. Older packets are evidence for their date only.
6. **Measure** actual load/size and interactions before optimising; do not fabricate conversion results, user feedback or performance scores.
7. **Prevent scope drift**: no scientific backend re-architecture, database writes, auth changes, clinical/PHI connectors or public presentation of internal named agents.

## Team handoff
Orchestrator -> Research/Positioning + Scientific Copy -> UX + Experience -> Frontend -> QA -> Orchestrator -> human approval.
Parallel discovery is allowed; code changes in one landing-page slice at a time. Agent work should remain visible in markdown deliverables and small PRs.

## Deliverables
- `docs/landing-agents/audit.md`: evidence with route/viewport/file, severity and current date.
- `docs/landing-agents/backlog.md`: ranked backlog with owner, measurable acceptance criterion and dependencies.
- `docs/landing-agents/copy-matrix.md`: proposed claims, evidence/status, destination and approved text.
- `docs/landing-agents/visual-review.md`: before/after screenshots, critique and owner decision.
- Small scoped implementation PRs, with QA results attached; never self-merge.
See `.cursor/agents/` for role definitions and `docs/landing-agents/CURSOR_START.md` for execution.
