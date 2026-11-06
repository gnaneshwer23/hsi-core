# Public website navigation and artwork audit — 6 November 2026

The redesigned public website now has page-specific artwork and no links from its public pages, including selector states, to the previous engineering overview pages. Research tools remain available at their existing workspace routes; this change does not delete operational tools or change their permissions.

## Corrections

- Replaced the footer's legacy `/status` and `/docs` links with evidence and research-access information. Product scope is available in the redesigned Products collection.
- Corrected the Technology application selector's nonexistent `/trials` destination to `/for-trials`.
- Replaced the Platform maturity link with `/products#product-collection`.
- Added fragment scrolling for React Router navigation, with space for the sticky header. Cross-page section links now reach their destination.
- Included password recovery and reset pages in the account navigation styling policy.

## Artwork

The original anatomy image is reserved for the homepage. Twelve other pages use original responsive SVG concept illustrations, with accessible names, unique gradient IDs and explanatory captions. They depict concepts rather than patient observations, scientific results or screenshots of live integrations.

| Page | Visual subject |
| --- | --- |
| Platform | Layered sources, biological context and review architecture |
| Technology | Entity network and source-linked path |
| Products | Separate product orbits around shared methods |
| Research | Question dossier and research brief |
| Science | Tissue-to-cell magnification |
| How it works | Continuous investigation path |
| Solutions | Mechanism, evidence and translation lenses |
| Evidence & safety | Original source, study context, uncertainty and review |
| Research access | Separate identity verification and permission boundaries |
| Aksh Health | Person-centred observation context |
| ISI Research | Conceptual immune cell and signalling context |
| HSI Trials | Study criteria and investigator assessment |

Access options remains a text-led page. No third-party image service or artwork download is needed.

## Verification scope

The production build, TypeScript checks and Chromium tests run locally against the compiled site. The navigation audit covers all 14 public pages, 77 button/tab/radio controls, 731 link instances, selector-dependent links, cross-page fragments, header/footer clicks and product popup behaviour. Disabled previous/next controls are checked as workflow boundaries. Internal destinations are checked against the actual route registry and rendered headings, rather than treating the SPA's HTTP 200 fallback as proof of a working page.

Responsive artwork checks cover 320, 768 and 1440 pixels. The existing header tests cover widths through 1920 pixels. Automated accessibility, metadata, prerender hydration and JavaScript-disabled content checks are also included. Screenshots were visually inspected for the platform, science, immune, research and mobile product heroes.

These checks do not establish live Vercel deployment status, external product uptime, successful email delivery or authenticated backend acceptance. Product links are intercepted in the popup test to verify navigation without relying on another service. Scientific review, source permissions and clinical boundaries are unchanged.

Commands:

```sh
cd site
bun --no-env-file x tsc --noEmit -p tsconfig.json
bun --no-env-file run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium bun --no-env-file x playwright test \
  public-navigation-audit.spec.ts site-chrome.spec.ts editorial-landing.spec.ts \
  product-experience.spec.ts products-visual.spec.ts production-qa.spec.ts seo.spec.ts
```

See `operations/qa/2026-11-06/public-page-audit.json` for the recorded result.
