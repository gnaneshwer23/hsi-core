# Landing site: end-to-end audit and production plan — 26 November 2026

Scope: the public marketing site (everything a first-time visitor can reach without signing in). The signed-in research app (`/research/*`, `/workspaces`, `/enterprise/*` dashboards, `/demo/universe`, `/status`) is a separate product surface and is not audited here; the landing site should only link to it through Sign in.

Method: a crawl of every URL in the sitemap plus the preview and app entry points, on the built site (chrome, title, h1, length, robots, marketing-speak scan), then a read of the header, footer, homepage and each page.

## What a visitor meets today

| Group | Pages | Chrome | Indexed |
|---|---|---|---|
| New design | `/`, `/platform/{memory,agents,contradiction-analysis,workbench,discovery-engine}`, `/data-sources`, `/trust`, `/how-it-works`, `/about`, `/contact`, sign-in/up | landing | yes (account pages no) |
| Old design | `/knowledge-graph`, `/intelligence`, `/research-gaps`, `/scientific-companion`, `/validation`, `/researchers`, `/enterprise`, `/biotech`, `/clinical`, `/laboratories`, `/research-community` | original site header and footer | yes |
| Preview (noindex) | `/landing-v2/science`, `/landing-v2/solutions`, `/landing-v2/platform/knowledge-graph`, `/landing-v2/platform/companion` | landing | no |

Eleven indexed pages are still in the old design, so a visitor crosses between two different sites (header, footer, type, colour) several times in one visit. Five more pages are unindexed duplicates or previews.

## Findings

**Blockers (a first-time visitor would notice)**
1. Two designs. Eleven public pages use the original chrome and look. The Resources menu and footer crossed between them.
2. The headline tells a first-time visitor nothing: "Understand biology. Resolve uncertainty. Advance discovery." Nothing on the first screen says what HSI is, who it is for, or what to do next beyond a dark 3D scene.
3. The homepage is about 2,100 words with thirteen numbered sections ("04 · …"), several repeating what other pages say (agents, investigation, contradiction, outputs, solutions, trust, data).
4. Navigation is heavy: four dropdown menus (Platform, Science, Solutions, Resources) plus Sign in, Explore HSI and a call to action; the footer repeats every menu, adds a mono-uppercase status line, and the logo carries a second tagline.
5. Overlapping pages with no clear owner: audience pages (six), `/intelligence` and agents, `/scientific-companion` and the companion preview, `/validation` and the trust page, `/research-gaps` and the knowledge graph, the contradiction audit tool and contradiction analysis.

**High**
6. Marketing-speak and abstractions: "The living intelligence of human biology", "Scientific intelligence must earn your trust", "Help shape the future of scientific intelligence", "next generation of scientific intelligence", "Presented equally. Connected deeply.", section labels written as slogans. Plain statements of what a page does are missing in places.
7. Mono-uppercase micro-labels everywhere ("RESEARCH PLATFORM IN DEVELOPMENT", "SCIENTIFIC INTELLIGENCE PLATFORM") make the pages feel decorative rather than clear.
8. Four preview pages are reachable (header menus) but noindex, so the main navigation leads to pages marked not for search engines.
9. Early-access delivery is not configured on production (`deliveryConfigured: false`): the contact request stays a browser draft. The page says so, but it is the main call to action.
10. The 3D hero is 242 KB gzipped (lazy) and is the first thing shown; it has a static fallback on phones and with reduced motion, but it is the largest asset on the site and carries no information.

**Medium**
11. Titles and descriptions for the rebuilt pages are good; the old pages have their own set. Several descriptions still use "Research preview" boilerplate.
12. CSS: 60+ stylesheets (about 900 KB raw) ship to support old pages and the app; CSS budget headroom is under 1 KB.
13. Dead code: unrouted pages and components from earlier designs.
14. Cross-browser (Firefox, Safari) and real-device checks have not been run; only Chromium and a 375 px viewport.
15. No custom 404 in the landing design for the main site (the 404 page uses the original chrome).

**Good, keep**
Honest labelling (Illustrative, In development, Planned), no invented metrics after the clean-up, axe-clean pages, prerendered HTML with canonical URLs and a sitemap, the access path on the contact page, the live published graph, skip links, reduced-motion handling.

## Target site

One design, one header, one footer, about twelve pages.

- **Header:** wordmark "Human Super Intelligence" only. Five links: Platform (menu: Agents, Contradiction analysis, Investigation record, Memory, Discovery), Solutions, Knowledge graph, Trust, About. Right side: Sign in and Request access. No other menus.
- **Footer:** four short columns (Platform, Solutions, Company, Legal) and one plain sentence: research tool in development; not clinical decision support; no patient data.
- **Pages:** Home; Platform (five pages above); Solutions (one page, one section per audience, replacing six pages); Knowledge graph (the live published graph and the recorded gaps, replacing `/knowledge-graph`, `/research-gaps`); Trust (absorbs `/validation`); How it works; About; Contact; Data sources; Sign in and account pages.
- **Retired with permanent redirects:** `/researchers`, `/enterprise`, `/biotech`, `/clinical`, `/laboratories`, `/research-community` to `/solutions` sections; `/intelligence` to `/platform/agents`; `/scientific-companion` to the Platform menu's companion page (folded into agents or kept as a section); `/validation` to `/trust#validation`; `/research-gaps` to `/knowledge-graph#gaps`; `/context-conflict-audit` to `/platform/contradiction-analysis`; the four `/landing-v2/...` previews removed.
- **Homepage:** plain first screen (what it is, who it is for, what to do), then a three-step explainer, the atlas, the live graph, short previews of the platform pages, who it is for, and a closing call to action. Target under 900 words, no numbered labels.
- **Copy rules:** say what the thing does in plain words; no slogans, no superlatives, no "intelligence layer", no mono-uppercase eyebrow labels; keep every honesty label.

## Plan (each step is its own reviewed PR)

1. Header, footer and navigation; Solutions page; redirects for the six audience pages; delete the old audience pages, their tests and unused styles.
2. Knowledge graph page rebuilt (live graph plus recorded gaps); redirects for `/research-gaps`, `/validation`, `/intelligence`, `/scientific-companion`, `/context-conflict-audit`; delete the remaining old public pages and the four previews.
3. Homepage rewrite and a plain-language copy pass over every page.
4. Production readiness: Lighthouse and Core Web Vitals, hero weight, cross-browser run (Firefox, WebKit), mobile review, custom 404, sitemap, structured data, social image, dead-code and unused-CSS removal, error states, and a final audit.

## Open items that need a decision outside this plan
- Configure access-request delivery (or give an email address or form service) so the main call to action reaches someone.
- Whether the signed-in app (`/research/*`) is restyled to match; it is outside this audit.
