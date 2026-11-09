# HSI SEO audit and implementation — 6 November 2026

Scope: source/build/deployment configuration audit and implementation for `https://www.humansuperintelligence.tech`. This is not a live search-ranking report or a completed Search Console submission.

**Live discovery diagnosis (2026-11-09):** prerender/robots/sitemap/canonical/www apex redirect are healthy on production; Google `site:` still empty — owner Search Console verify + sitemap submit remain the blocker. See [`HSI_SEO.md`](./HSI_SEO.md). Do not point HSI discovery work at `immune-super-intelligence.co.uk`.

## Findings and fixes

| Finding | Implementation |
| --- | --- |
| Every page initially served the same empty SPA shell | The build renders the actual React content for 14 public pages into route-specific HTML, before JavaScript. Exact Vercel rewrites serve those files. |
| Titles/descriptions changed only on the client | A shared metadata registry generates HTML and updates client navigation; the conflicting Technology page effect was removed. |
| Missing canonical and sharing metadata | Self-canonical public URLs use the existing `www` origin. Open Graph and Twitter cards include an original 1200×630 HSI cover, dimensions and alt text. Query strings are excluded from canonicals. |
| No sitemap or crawler policy | The build generates `/sitemap.xml` from the public allowlist and `/robots.txt` referencing it. No fictional last-modified timestamps are added. |
| AI answer engines may treat marketing HTML as blocked | `robots.txt` now explicitly Allows GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended and Applebot-Extended (still Disallow `/api/` and `/_pages/`). Static `/llms.txt` summarises public pages and honesty boundaries for AI crawlers. Vercel Attack Challenge Mode confirmed off; SSO protection remains `all_except_custom_domains` so `www` stays public while preview `.vercel.app` URLs can stay team-gated. |
| No structured page context | JSON-LD describes HSI as an Organization, its WebSite/WebPages and breadcrumbs. It adds no medical accreditation, ratings, prices, review scores or unsupported SearchAction. |
| Account/demo/tool pages could inherit homepage metadata | Forty exact tool/account routes receive noindex shells with no saved user data or organization/page schema. API/JSON/internal generated paths have appropriate X-Robots-Tag rules. |
| Duplicate trailing-slash destinations | `trailingSlash:false` normalizes route variants; canonical URLs consistently use the public origin. Existing API dispatch and real asset/unknown-path handling remain separate. |
| Landing page downloaded all research tool code | Route splitting reduced the main JavaScript file from approximately 948 KB to 533 KB before compression (about 259 KB to 155 KB gzip). Public pages stay pre-rendered; tools load when opened. |

The homepage and public pages hydrate only when the embedded route matches the requested pathname and there is no query string. Query-driven screens and SPA fallbacks render afresh, preserving their actual initial state. Shared navigation and metadata still work after client routing. Public HTML contains the same components as the interactive application; there is no separate search-only copy or cloaking.

## Public search intent and page map

| Canonical path | Intended discovery topic |
| --- | --- |
| `/` | Human Super Intelligence; evidence-linked health research |
| `/platform` | Research intelligence platform |
| `/technology` | Knowledge graphs and research technology |
| `/products` | HSI health/immunology research ecosystem |
| `/solutions` | Translational research and discovery workflows |
| `/research` | Evidence-linked research workbench |
| `/evidence-safety` | Evidence provenance, uncertainty and human review |
| `/how-it-works` | Question-to-research-brief workflow |
| `/science` | Educational human biology and scientific evidence explorer |
| `/for-aksh` | Aksh Health and shared HSI technology |
| `/for-isi` | Immune Super Intelligence and immunology research |
| `/for-trials` | Planned HSI Trials product and current research previews |
| `/pricing` | Research access and scoped team pilots, without invented paid plans |
| `/contact` | Account/access process and collaboration preparation |

Noindex intentionally covers account routes, synthetic validation, saved/reviewer workspaces, local community drafts and exploratory tool pages. Their public explanatory hubs remain discoverable. Robots rules do not block all of `/research/`, because search engines must be able to read the public research page and the noindex directives on tool HTML. Noindex is a discovery policy, never an access-control mechanism.

## Build and asset details

- `site/src/lib/seo/siteSeo.ts`: canonical public metadata, indexability and safe JSON-LD generation.
- `site/src/lib/seo/applySeo.ts`: navigation-safe updates without stale or duplicate tags.
- `site/scripts/prerender-entry.tsx`: server rendering of the actual public React routes.
- `site/scripts/build-seo.ts`: exact-route HTML, sitemap and robots generation. It fails if a declared public page is missing its route or cannot produce an H1.
- `site/public/social/hsi-research.{svg,png}`: original HSI sharing artwork and editable source; no external photography or scientific result implied.
- `site/public/icon.svg`: HSI mark.
- Production HTML is emitted under `site/dist/_pages/` with exact public-route rewrites. Direct `_pages` URLs are noindex and canonicalize to the public routes. Build artifacts stay ignored.
- `VERCEL_ENV=preview` or `HSI_SEO_NOINDEX=true` suppresses indexing in generated HTML. The client preserves that override during navigation. Public canonical URLs always point at production.
- No new runtime package, database migration, auth configuration or scientific approval was added.

## Verification

Core checks cover unique public metadata, noindex tool states, canonical origin safety, JSON-LD script escaping and absence of fabricated claims. Deployment tests continue to check exact app routes, API isolation, real-asset preservation and the exact validation route.

Browser checks inspect generated HTML before JavaScript, a disabled-JavaScript page, server/client hydration, client canonical/social updates, sitemap inclusion/exclusion, noindex shells and PNG availability. Existing browser tests exercise interactive research tools after route splitting.

Verification result: **774 core tests and all 116 browser tests passed**. Repository build, site TypeScript, the client production build and public HTML generation passed. The original sharing cover was visually inspected. These are local/harness results, not a live indexing or Search Console result.

## Deployment and owner follow-up

1. After Vercel reports the new commit Ready, open **View page source** on `/`, `/platform` and `/research`. Each response should contain its own title, canonical, H1 and readable page content before scripts run.
2. Open `/robots.txt`, `/sitemap.xml` and `/social/hsi-research.png` on the canonical `www` domain. Check that Vercel serves the generated files, with no SPA fallback or unexpected noindex on production public pages.
3. Check `/sign-in` and a research tool response for noindex; confirm APIs/fixture JSON remain independently routed. Verify an unknown path still returns a genuine 404.
4. In Vercel Domains, confirm the existing primary domain and apex/www redirects are consistent with `www`. This pass does not change authentication origin or domain ownership.
5. In a verified Google Search Console property, submit `https://www.humansuperintelligence.tech/sitemap.xml`. Use URL Inspection for the homepage and research/platform hubs. Ownership verification and submission were not performed here; no verification token is invented. Optional HTML-tag verification: set Vercel `GOOGLE_SITE_VERIFICATION` (sanitized at build). Optional Bing notify: `bun run seo:indexnow` after the IndexNow key files are live.
6. Establish actual indexing, impressions, clicks, queries and Core Web Vitals baselines after deployment. The main bundle still exceeds the build's 500 KB warning threshold; route splitting is an improvement, not a measured Lighthouse or field-performance result.
7. For future scientific content, publish only named, qualified reviewer-approved, rights-cleared work with real citations and update history. Do not generate disease landing pages from synthetic records or describe draft graph links as established biology.

Search engines control crawling, indexing and rankings. These changes provide technically reviewable foundations; no ranking, rich result or indexing guarantee is claimed.
