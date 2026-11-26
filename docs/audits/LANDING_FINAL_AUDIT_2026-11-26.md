# Landing final audit, 26 November 2026

Scope: the 14 public pages, sign-in and sign-up, after steps 1 to 4 and the onboarding work (#740, #741, #742, #751, #752, #753 to #756).
Method: local production build, Playwright crawl, Lighthouse (simulated mobile, lab data only), the repository e2e suite.

## Result

| Area | Finding |
|---|---|
| Internal links | 20 distinct internal link targets across 16 pages, all resolve; none lands on the not-found page |
| SEO | One h1 per page; unique title and canonical on every page; description present; `lang="en-GB"`; noindex on sign-in and sign-up; no images without alt text |
| Accessibility | Lighthouse 100 on all four audited pages; axe (WCAG 2.2 AA) passes on every public page at 390px in the e2e suite |
| Best practices, SEO | Lighthouse 100 on all four audited pages |
| Performance (simulated mobile) | Home 98 (LCP 0.9 s); Trust 87 (LCP 4.1 s); Contradiction analysis 86 (LCP 4.3 s); Knowledge graph 76 (LCP 7.6 s). Home was 58 to 87 before the CSS split in #752 |
| Narrow screens | No horizontal overflow at 320, 360 or 390px on any landing, onboarding, preview or settings route |
| Error states | See below |

## Error states reviewed and fixed

- Graph snapshot failing, malformed or hanging: the page says the snapshot is unavailable or still being verified, shows no substitute graph, and never claims to be live. Covered by test.
- Access service down: the form keeps a browser draft and states that nothing was sent. The button was labelled "Start a pilot request" while only saving a draft; it now reads "Save my question".
- Browser storage blocked or holding corrupted data: onboarding, settings and previews keep working for the visit and fall back to an empty profile. Covered by test.
- Unknown onboarding or preview paths: the not-found page.
- **New:** a page that fails to load (connection lost, or a stale deploy) used to leave a blank screen. A route error boundary now shows "This page couldn't load", reassures that nothing was lost or sent, and offers Reload and Home. Covered by test in Chromium and Firefox; WebKit's offline emulation is not reliable, so that one assertion is skipped there.


## Open items (not defects in the landing pages)

1. Knowledge-graph LCP is 7.6 s in the simulated mobile profile because the page renders a large graph; consider a static poster until the graph hydrates.
2. Several meta descriptions exceed 160 characters (home is 297) and may be truncated in results.
3. The `/about` title omits the brand ("About HSI | Connected Human Biology").
4. Legacy tool pages still load one 308 KB (59 KB gzipped) stylesheet; per-page splitting is a larger change.
5. Access-request email delivery is not configured (draft-only); the form is honest about it. The owner must choose a delivery service and supply its credentials.
6. Backend persistence, identity verification, membership and access decisions are contracts only (see `docs/architecture/LEA-02C-ONBOARDING-INTEGRATION-CONTRACTS.md`); they need owner decisions before any build.
7. Lab data only. No field data (real-user monitoring) exists yet.
8. Researcher app-shell pages (for example `/research/home`, reached from `/community`) render their own `<main>` inside the layout's `<main>`, so two main landmarks nest. A trial fix in the layout (a plain wrapper for app pages) broke pages that have no main of their own and created duplicate banners, so it was reverted. The right fix is per page, with the layout and each page agreeing on one landmark. `e2e/product-experience.spec.ts` ("single main") fails locally on `/community` because of this yet passes in CI; why it differs is not yet understood.
