# HSI landing pages — UX audit

**Date:** 2026-11-10  
**Scope:** Public marketing and landing surfaces. Audit only. No redesign, no feature build, no fix PR.  
**Workspace:** `hsi-core` `site/` (routes, nav, footer, page copy).  
**Live host that answered:** https://www.humansuperintelligence.tech  
**Host named in the task:** https://www.human-super-intelligence.co.uk — DNS does not resolve (`nodename nor servname`).  
**IA reference:** [`docs/design/HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md`](../design/HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md)  
**Capability register consulted:** `docs/capability-status.json` (as of 2026-11-09). Research writes on the live host: `writesEnabled=false`. Auth diagnostics: provider reachable. Database connection was not tested. No patient data was requested.

## Evidence quality

| Check | What was actually done |
|-------|------------------------|
| Route inventory | Read `site/src/App.tsx`, `site/src/lib/primaryNav.ts`, `site/src/components/Nav.tsx`, `site/src/components/Footer.tsx` |
| HTTP smoke | `GET` of marketing routes on `.tech` returned **200**, including redirects `/products` → `/modules` and `/for-aksh` → `/modules/aksh-health` |
| Browser | Headed check of `/`, `/research/investigate`, `/contact`, `/pricing` on `.tech` (2026-11-10). Desktop metrics 1440×900 confirmed primary nav `display:flex` and a loaded hero image. The screenshot tool cropped the left of that wide viewport, so desktop layout comments rely on the accessibility tree and DOM measurements, not a full-bleed screenshot. |
| Code vs live | Contact and pricing copy on the live site match this workspace. The **homepage hero does not.** Live primary CTA is “Start an investigation”. This workspace’s `HomeHero` says “Explore the Platform” and uses different systemic-sclerosis wording. `/research/investigate` is live and is **absent from this workspace** (`App.tsx` has no such route; repo search finds no “Demo environment” / “RESEARCH DEMONSTRATION” strings). |
| Not done | Full click-through of every science/research tool, mobile 320–414 overflow pass, Lighthouse, signed-in account flows, visual QA of every module page. Those items stay open. |

Honesty boundary for this document: findings describe what the pages say and where links go. They do not add scientific claims, Gate C auto-approve, live CDS, or PHI behaviour.

---

## Executive summary

The public information architecture in the header is coherent: Platform, Research, Modules, Science, How it works, plus More (Solutions, Technology, Evidence & safety, Access options, Illustrative walkthrough, Research access) and a single header CTA to `/contact`. Footer modules match the four products. Marketing pages that use `MarketingPage` share a hero, numbered sections, a closing CTA, and a “Continue the journey” strip. Honesty labels on Clinical (in development), Trials (planned), evidence boundaries, and “no auto-approve” are present in source and on the pages that were opened.

The journey breaks at the two actions the homepage asks for first.

1. **Start an investigation** (live homepage only) opens `/research/investigate`, a page titled as a research demonstration (“Demo environment”, “Curated examples only”). Capability status marks the authenticated research workspace `not_currently_available`, and the live research health check reports writes disabled. This workspace cannot even route that URL, so the next deploy of this tree would drop the live primary action unless that page is merged first.
2. **Request access** (header, footer, and most closing bands) opens `/contact`. The page title and hero say “Request Research Access” and “Begin an investigation” after access is confirmed. The form is explicitly browser-only: “This page does not write an access request to HSI servers.” There is no price, and there is no team-pilot offer, while `/pricing` is indexed as “Research Access & Team Pilots”.

Secondary breaks: `/science` sends people to `/science/body`, which is `noindex` under the generic title “Research Tools & Account Access”, and “Open Biology Zoom” from any organ other than pancreas, heart, or intestine silently opens the pancreas zoom. Homepage “Open Discovery” and the status page still point at internal engineering routes the IA says to keep out of marketing chrome. Platform and Technology send the clinical story to `/modules` rather than `/modules/clinical`.

No classic spelling errors turned up in the marketing copy that was read. The problems are promise, destination, and index metadata.

---

## Route inventory

### Primary header (`PRIMARY_NAV_LINKS`)

| Order | Path | Label | In `PUBLIC_MARKETING_PATHS` |
|------:|------|-------|------------------------------|
| 0 | `/` | Home (logo; also mobile drawer) | yes |
| 1 | `/platform` | Platform | yes |
| 2 | `/research` | Research | yes |
| 3 | `/modules` | Modules | yes |
| 4 | `/science` | Science | yes |
| 5 | `/how-it-works` | How it works | yes |

Header CTA: `{ to: "/contact", label: "Request access" }`. Longer “Request Research Access” is used in heroes and closing bands (`ctaPolicy.ts`). Guest Sign in is omitted from the header. Account appears only when a session exists. That matches the IA non-goal.

### More menu (`SECONDARY_NAV_LINKS`) and footer Information

| Path | More label | Footer |
|------|------------|--------|
| `/solutions` | Solutions | **Missing** from footer (More only) |
| `/technology` | Technology | Information |
| `/evidence-safety` | Evidence & safety | Information **and** bottom “Research information” (duplicate) |
| `/pricing` | Access options | Information |
| `/demo` | Illustrative walkthrough | Information |
| `/contact` | Research access | Information, brand column, and bottom bar |

Footer Explore repeats the five primary links. Footer Modules: `/modules`, `/modules/aksh-health`, `/modules/clinical`, `/modules/isi`, `/modules/trials`.

### Module and redirect routes

| Path | Behaviour |
|------|-----------|
| `/modules/aksh-health` | Aksh story; external https://www.akshhealth.com/ |
| `/modules/clinical` | HSI Clinical, labelled in development |
| `/modules/isi` | ISI story; external https://www.immune-super-intelligence.co.uk/ |
| `/modules/trials` | HSI Trials, labelled planned |
| `/products` | Redirect → `/modules` (live 200 on `/modules`) |
| `/for-aksh`, `/for-isi`, `/for-trials`, `/akeno`, `/aksh-agents` | Redirects to the module paths above |

### Supporting public routes (not primary nav)

| Path | Role | Linked from marketing chrome? |
|------|------|-------------------------------|
| `/status` | Maturity source of truth | Roadmap only, not header/footer |
| `/community` | Local discussion rehearsal | Research dashboard only |
| `/science/body` | Educational body explorer | Science hero and homepage Metabolism chip |
| `/science/graph` | Knowledge graph | Science page, homepage Neurobiology chip |
| `/research/knowledge-graph` | Claim graph | Homepage Microbiome chip |
| `/research/investigate` | **Live only.** Demonstration investigation | Live homepage primary CTA. **Not in this workspace router** |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/research/account` | Account | Contact and Research heroes, not the primary header |

### Other `App.tsx` routes (tools and engineering — out of landing scope, listed so they are not mistaken for marketing)

`/research/dashboard`, `/research/governance`, `/research/scientific-workbench`, `/research/validation`, `/research/coverage`, `/research/evidence-readiness`, `/research/scientific-review`, `/research/capabilities`, `/research/decision-workbench`, `/research/mechanism-workflow`, `/science/literature`, `/science/study-comparison`, `/science/review-preparation`, `/science/paths`, `/science/contradictions`, `/science/clinical-trials`, `/science/research-agents`, `/science/zoom`, `/science/connections`, `/science/disease`, `/discovery-engine`, `/explore`, `/discovery`, `/curator`, `/systems`, `/evidence`, `/sources`, `/clinical-timeline`, `/trials-criteria`, `/gateway`, `/roadmap`, `/alignment`, `/docs`, and `*` → not found.

IA non-goal: do not promote `/gateway`, `/curator`, `/systems` from primary marketing chrome. Header and footer comply. `/status` and the homepage ecosystem card do not (see findings).

### IA cross-check

| IA expectation | Observed |
|----------------|----------|
| Primary journey `/` → `/platform` → `/research` → `/modules` → `/science` → `/how-it-works` | Header order matches. Live homepage primary button does **not** go to `/platform`; this workspace’s hero does. |
| Homepage CTAs: Explore platform → `/platform`; Request access → `/contact` | Request access matches. Live “Start an investigation” does not. Workspace “Explore the Platform” does. |
| Secondary pages have a real hero, section rhythm, closing CTA, related-page strip | Contact, pricing, and the `ExperienceCTA` pages do (`MarketingCTA` + `MarketingJourney`). `/status` still uses the older `PageHero` and does not follow the premium chapter system. `/pricing` has no hero artwork. |
| `/pricing` is access options, not commercial tiers | On-page copy matches. Document `<title>` and meta description say “Team Pilots”. |
| `/demo` labelled illustrative walkthrough | Nav and footer use that label. The page itself is a synthetic cohort walkthrough (patient / clinician / research steps). |
| `/community` explicit “not published” | Copy in `Community()` says public posting is not enabled. The route is undiscoverable from header and footer. |
| `/science/body` is the science primary outbound | Linked. SEO map has **no** entry, so production HTML is `noindex` with the fallback title. |
| Clinical module is `/modules/clinical` | Footer and the clinical page exist. Platform “clinical” experience `link` and Technology “Longitudinal clinical intelligence” `route` are `/modules`. Experience content “Clinical intelligence” points at `/modules/aksh-health`. |
| Sign-in stays out of primary chrome until auth is product-ready | Header complies. `/research` hero still offers “Research sign in”. Capability `PUB-RESEARCH-ACCESS` is `research_preview`. Workspace capability is `not_currently_available`. |
| Canonical origin | `site/src/lib/seo/siteSeo.ts` and the IA doc both use `https://www.humansuperintelligence.tech`. The `.co.uk` host in the task does not resolve. |

---

## Page-by-page findings

Dimensions: **interactions**, **typos**, **images**, **text/honesty**, **connections/IA**, **interactiveness**. “Live” means seen in the browser on 2026-11-10. “Source” means this workspace.

### `/` Home

| Dimension | Finding |
|-----------|---------|
| Interactions | Live hero: domain chips (Immunity, Microbiome, Neurobiology, Metabolism, Therapeutics), **Start an investigation** → `/research/investigate`, **Request Research Access** → `/contact`. Closing band also has **Contact for Collaboration** → `/contact` (same destination as Request Research Access). Workspace hero instead uses **Explore the Platform** → `/platform`. |
| Typos | None in the live hero or the workspace `Home.tsx` / `HomeHero.tsx` copy that was read. |
| Images | Live hero WebP loaded (`hero-desktop-panorama-1024.webp` at 1440px, natural size present, client box about 573×466). Mobile portrait also loaded at a 729px-wide viewport. Alt text in source is specific and scientific. The visible crop is a pale ivory illustration; it did not 404. Diagrams elsewhere are SVG concepts (`HeroArtwork`), labelled as schematics in source. |
| Text/honesty | Live scope line: “Systemic sclerosis is our first scientific investigation — not a product boundary.” Workspace scope line: “Systemic sclerosis is one scientific validation case — not a product boundary.” “First scientific investigation” plus a button labelled “Start an investigation” reads as an open research product. The destination says “Demo environment” and “Curated examples only. Nothing here is clinical validation.” Limits section (“What HSI does not do”) and ecosystem maturity chips are present in source and in the live accessibility tree (“Four products. One governed ecosystem.”, “Open Discovery”). |
| Connections/IA | Immunity → `/modules/isi` with research-context query. Microbiome → `/research/knowledge-graph`. Neurobiology → `/science/graph?q=neuro`. Metabolism → `/science/body` with `domain=clinical` (metabolism labelled as the clinical domain). Therapeutics → `/modules/trials` (planned product). ISI secondary CTA in `productMaturity.ts` is **Open Discovery** → `/discovery`, an internal workspace the IA keeps off marketing chrome. |
| Interactiveness | Nine-step investigation buttons, biology network, and intelligence-flow stages are real controls in source (`aria-pressed`, honest `partially_implemented` notes on the flow). Primary nav is `display:none` below 1151px, so a tablet-width window (measured 729px) shows only logo, Request access, and a hamburger. At 1440px the five links and More are in the accessibility tree. |

### `/research/investigate` (live only)

| Dimension | Finding |
|-----------|---------|
| Interactions | Lazy-loaded. First snapshot was “Loading investigation…”, then a 10-step demonstration (Start → Evidence → Relationships → Comparison → … → Save and export) and a question chooser. |
| Text/honesty | Eyebrow “RESEARCH DEMONSTRATION”, badge “Demo environment”, body “Curated examples only.” One question is the demonstration; a second “uses the same evidence and records why a metabolic answer is not assembled.” SSc is described as a separate reference question. This is an honest demo **after** a homepage verb that says the user is starting an investigation. |
| Connections | Not represented in this workspace, so IA journey maps and tests here cannot see it. A deploy of the current router would 404 the live homepage’s primary button. |
| Interactiveness | Step control and question picker are interactive once loaded. It is not the governed investigation workspace (`writesEnabled=false`). |

### `/platform`

| Dimension | Finding |
|-----------|---------|
| Interactions | Source: product radiogroup (keyboard arrows), capability selector, method-lens selector. Hero actions: in-page architecture anchor, `/how-it-works`, `/contact`. |
| Typos | None in the hero and capability copy read. |
| Images | `HeroArtwork kind="platform"` plus `SharedSoftwareArt` / `PlatformConnectionMap`. Captions say shared technology and product-owned records. Conceptual, not a product screenshot. |
| Text/honesty | Lead states ambition is not universal coverage or a live write-spine. Clinical card: “In development” and “not a live hospital integration.” Trials: “Planned”, no live matching or enrolment. Capability boundaries say retrieval is not a search of all literature and review is not a clinical decision. |
| Connections/IA | Clinical experience `link` is `/modules`, so “HSI Clinical” on this page does not open `/modules/clinical`. Aksh, ISI, and Trials deep-link correctly. Journey strip includes Science, How it works, Modules, Technology, Contact. |
| Interactiveness | Strongest interactive marketing page in source (three exclusive selectors with keyboard support on the product group). |

### `/research`

| Dimension | Finding |
|-----------|---------|
| Interactions | Hero: Research access → `/contact`, **Research sign in** → `/sign-in`. Workflow link → `/how-it-works`. `ResearchJourney` steps include **Ask a research question** → `/research/dashboard` and **Take the work with you** → `/research/dashboard?view=briefs`. |
| Text/honesty | SSc is correctly framed in source as a validation case, not the product boundary. “Research sign in” and the dashboard step imply a workspace the capability register marks unavailable, with writes disabled on the live host. |
| Images | `HeroArtwork kind="research"` (dossier / brief diagram). |
| Connections/IA | Journey strip matches the IA (How it works, Evidence & safety, Science, Platform, Contact). |
| Interactiveness | Journey tabs are real buttons. Their first and last “Explore this step” links leave the marketing story for an access-controlled tool. |

### `/modules` (also `/products` redirect)

| Dimension | Finding |
|-----------|---------|
| Interactions | Source: product selector and journey tabs across Aksh, ISI, Clinical, Trials, driven by `ECOSYSTEM_PRODUCTS` chips (Available / In development / Planned). |
| Text/honesty | Boundaries in `Products.tsx` match the chips: Clinical “no live hospital”; Trials “no live matching, confirmed eligibility or automatic enrolment”; Aksh care records stay in Aksh; ISI “not clinical decision support.” SEO description says the four modules are “not a claim of clinical validation or commercial care.” |
| Images | `HeroArtwork kind="products"` labels Clinical “In development” and Trials “Planned” inside the diagram. |
| Connections/IA | Journey strip: Platform, Solutions, Science, Contact. |
| Interactiveness | Selector is interactive. This is the right overview; several other pages still skip the clinical URL (see backlog). |

### `/science`

| Dimension | Finding |
|-----------|---------|
| Interactions | Primary: **Explore the human body** → `/science/body`. Secondary: `/research`. Rows link to `/science/body`, `/science/graph`, `/research`, `/how-it-works`, `/evidence-safety`, `/platform`. |
| Text/honesty | “Educational biology and draft relationships are starting points for investigation, not approved scientific findings.” Appropriate. |
| Images | `HeroArtwork kind="science"` caption in the artwork module: “Schematic · not microscopy.” |
| Connections/IA | Matches the IA primary outbound. The destination `/science/body` is the weak link (next row). |
| Interactiveness | Link page. Domain exploration happens on the next screens. |

### `/science/body`

| Dimension | Finding |
|-----------|---------|
| Interactions | System select, organ search, anatomy markers, organ list, related-topic chips, pancreas depth buttons. “Open Biology Zoom” builds `?organ=` only for `pancreas`, `heart`, or `intestine`; **every other organ navigates to `?organ=pancreas`.** |
| Typos | “Science 2.0” appears as public kicker copy (“Next in Science 2.0”, “SCIENCE 2.0 / CONNECTED LEARNING”). That is internal programme language on a public page. |
| Images | `AnatomyModel` with an on-page note: “Procedural spatial model · 2D fallback” and “positions are illustrative, not anatomically precise.” |
| Text/honesty | Hero disclaimer: education, no patient data, no clinical assessment. Detail line: “Scientific approval pending” and “relationships are not independently evidence-graded.” Pancreas pathway: “draft content awaiting scientific review.” |
| Connections/IA | Linked as the main science CTA, but production HTML title is the fallback **“Research Tools & Account Access”** and `robots` is **`noindex, follow`** because `/science/body` is missing from `SEO_PAGES` and `NOINDEX_PAGES` (`getSeoMetadata` fallback). Canonical is still the `.tech` body URL. |
| Interactiveness | High, and one of those interactions mis-routes. |

### `/how-it-works`

| Dimension | Finding |
|-----------|---------|
| Interactions | Hero: `/contact` and `/research`. Shared `ResearchJourney` (same dashboard deep-link as Research). Secondary links to `/evidence-safety` and `/platform`. |
| Text/honesty | “Public walkthroughs stay illustrative until writes are staging-verified.” Association is not causation. Matches the IA tone. |
| Images | `HeroArtwork kind="workflow"`. |
| Connections/IA | Journey strip includes `/demo` as “Illustrative walkthrough”, which matches the IA label, then `/contact`. |
| Interactiveness | Step tabs are interactive; two of six steps exit into the governed dashboard. |

### `/solutions`

| Dimension | Finding |
|-----------|---------|
| Interactions | Four audience buttons (Translational research, Biotech & discovery, Product teams, Personal health) swap a panel and a real outbound link: `/research`, `/evidence-safety`, `/platform`, `/modules/aksh-health`. |
| Text/honesty | Personal health panel sends care decisions to Aksh’s own setting. No invented outcomes. |
| Images | `HeroArtwork kind="solutions"`. |
| Connections/IA | Matches the IA outbound set. **Not in the footer**, only under More. Easy to miss. |
| Interactiveness | Good single-page switcher (`aria-pressed`, `aria-live`). |

### `/technology`

| Dimension | Finding |
|-----------|---------|
| Interactions | Source selectors for data sources, six NEXUS functions, applications, and governance. In-page anchors `#nexus`, `#data-to-discovery-status`, `#sources`. |
| Typos | None in the sections read. Internal id `akeno` is not the visible label (label is “Authorised care systems”). |
| Images | `HeroArtwork kind="technology"` plus an inline NEXUS orbit SVG. Caption: “Conceptual architecture · Agent proposals remain separate from approved evidence.” |
| Text/honesty | Footnotes say the diagram is not a claim that every source is integrated and not a verified deployment of six engines. Tension: the longitudinal application says “Reconstruct a permissioned timeline of encounters…”, while `productMaturity` must-not for HSI Clinical includes “Not reconstructed patient histories.” The word “reconstruct” on a public architecture page is stronger than the product boundary. |
| Connections/IA | Clinical application `route` is `/modules`, not `/modules/clinical`. Aksh → `/modules/aksh-health`, ISI → `/modules/isi`, trials → `/modules/trials`, evidence → `/science`. Journey strip matches the IA. |
| Interactiveness | Highest density of controls on a marketing URL. Honesty footnotes are below the diagram, so the visual can outrun the caveat. |

### `/evidence-safety`

| Dimension | Finding |
|-----------|---------|
| Interactions | Static principle rows plus `EvidenceLegend` chips. Legend filters out the `synthetic` state before display and labels the explainer “NOT A SCIENTIFIC CLAIM”, with confidence “Not calibrated.” |
| Text/honesty | Explicit: no diagnosis, no prescribing, no trial-eligibility confirmation, a graph edge is not causality, a review does not authorise publication or clinical use. Strongest honesty page. |
| Images | `HeroArtwork kind="evidence"`. |
| Connections/IA | Outbound `/how-it-works`; journey strip includes Research, Science, Contact. Footer links this URL twice. |
| Interactiveness | Evidence-state chips are a real control. |

### `/pricing` (nav: Access options)

| Dimension | Finding |
|-----------|---------|
| Interactions | Three links only: Explore science → `/science`, Research access → `/contact`, Explore the platform → `/platform`. No form, no price, no plan picker. Live accessibility tree matches that. |
| Typos | None in the body. |
| Images | **No hero visual** (`ExperienceHero` has no `visual`). The page looks unfinished next to the other marketing heroes. |
| Text/honesty | Body is an access menu and says registration does not grant source access or reviewer authority. **Title and meta description on the live HTML: “Research Access & Team Pilots”** and “a scoped team pilot.” The status register lists “Partner-signed pilot lock (no invented MoU)” under Planned. The indexed title invents a commercial offer the page does not contain. |
| Connections/IA | Path and nav label match the IA. The HTML title does not. |
| Interactiveness | Link list. Low, which is fine if the title stops saying “pilots.” |

### `/contact`

| Dimension | Finding |
|-----------|---------|
| Interactions | Live and source: Create an account → `/sign-up`, Sign in → `/sign-in`, required “Research question” field, optional email “stored only in this browser”, **Save browser draft**, continue-to-account links, Check research account, Evidence & safety. |
| Typos | None in the live headings. |
| Images | `HeroArtwork kind="access"`. |
| Text/honesty | Live note: server-side access-request storage is not available; grants are administrator-provisioned; “This page does not write an access request to HSI servers.” The `<title>` is “Request Research Access”. Step 3 says “Begin an investigation” once access is confirmed and “open the research workspace.” That workspace is `not_currently_available` and live writes are off. The required field looks like a submitted request. |
| Connections/IA | Journey strip matches the IA (Evidence & safety, Research, Platform, How it works). This is the target of every primary CTA, so the mismatch is site-wide. |
| Interactiveness | The draft control works as a browser draft. It does not complete the action the buttons around the site name. |

### `/modules/aksh-health`, `/modules/clinical`, `/modules/isi`, `/modules/trials`

| Page | Interactions | Images | Text/honesty | Connections |
|------|----------------|--------|--------------|-------------|
| Aksh | External “Visit Aksh Health”; `/modules` | `kind="aksh"` | Separate product, scoped diabetes and metabolic health, no PHI retrieval, no live CDS on this site | Platform, Evidence & safety, journey strip |
| Clinical | `/modules`, `/evidence-safety`, `/platform`, `/how-it-works` | **Reuses `kind="platform"`** — same diagram as the platform hero, so the clinical page has no clinical-specific image | “In development. No live hospital connection, bedside decision support or record write-back.” | Journey strip is correct. Inbound from platform/technology is not. |
| ISI | External ISI URL; `/research`, `/platform`, `/evidence-safety`, `/modules` | `kind="immune"` | Separate interface and database; graph relationship is not causality or patient advice | Matches IA |
| Trials | `/contact`, `/evidence-safety` | `kind="trials"` | “HSI Trials is a planned product. Live matching and enrolment are not currently offered.” Investigator confirmation required | Matches IA |

No typos found in these four files.

### `/demo`

| Dimension | Finding |
|-----------|---------|
| Interactions | Seven steps (Patient, Clinician, Research, Review, Graph, Trials, Discovery) over `generateSyntheticCohort()`, FHIR bundle, prescreen, and similar-patient helpers. |
| Text/honesty | Nav label is “Illustrative walkthrough”, which matches the IA. The implementation is a synthetic patient cohort (default rheumatoid arthritis / T2D fixture). IA asks marketing bodies to avoid “demo/synthetic” wording; this page is the walkthrough itself, so the synthetic nature should stay visible in the first screen, not only in the code. |
| Images | No `HeroArtwork`. Custom demo CSS. |
| Connections | Linked from How it works journey and footer. Not a primary destination. |
| Interactiveness | High. Must stay labelled illustrative. It is not a clinical record. |

### `/status`

| Dimension | Finding |
|-----------|---------|
| Interactions | Maturity columns from `STATUS_COLUMNS`. “THIN DEMOS” section links to `/clinical-timeline`, `/trials-criteria`, `/gateway` with buttons labelled **Open demo**. |
| Text/honesty | Column copy is the honesty source of truth and includes “never confirmed eligible” and “no invented MoU.” The visual system is the older `PageHero` / `section-grid-light` chrome, and “Open demo” fights the marketing label “illustrative.” |
| Connections/IA | Not in header or footer, which matches “secondary; not primary nav.” Homepage still sends ISI traffic toward `/discovery`, and this page advertises engineering routes. Status copy still mentions marketing landing `/for-trials`, which now redirects. |
| Interactiveness | Link cards. Useful as an internal honesty board; rough as a public landing page. |

### `/community`

| Dimension | Finding |
|-----------|---------|
| Interactions | Topic buttons, local comment form, export. `addLocalResearchComment` only. Success text: nothing is published or saved to a server. Validation: 12–1,000 characters, optional public source URL, no clinical records. |
| Text/honesty | “Public posting and private research groups are not enabled.” “No invented participants, activity counts or approved community findings.” This is an honest rehearsal. |
| Connections/IA | No header, footer, or journey-strip link. Reachable from the research dashboard and by URL. |
| Interactiveness | Real local widget. Easy to think it is a community if the user never reads the hero. |

### Account routes (landing-adjacent)

`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/research/account` exist and are noindex in `siteSeo.ts`. Contact promotes them. Capability status: auth provider reachable; creating an account does not grant research or reviewer permission (copy on sign-up SEO and on `/pricing`). Not fully exercised signed-in in this audit.

---

## P0 / P1 / P2 backlog

Severity is user-facing confusion or a false capability, not engineering effort. No item below is a licence to build it without sign-off.

### P0

| ID | Finding | Evidence |
|----|---------|----------|
| P0-1 | The host given as production, `www.human-super-intelligence.co.uk`, does not resolve. The live site and the canonical origin are `www.humansuperintelligence.tech`. | DNS `URLError` on every path; `SITE_ORIGIN` in `siteSeo.ts`; live pages 200 on `.tech`. |
| P0-2 | Live homepage primary action “Start an investigation” opens a demonstration (`/research/investigate`, “Demo environment”, curated examples) while research writes are disabled and the workspace capability is `not_currently_available`. This workspace’s hero no longer uses that label or route, so production and source disagree, and a deploy of this tree drops the live URL. | Browser on `/` and `/research/investigate`; `HomeHero.tsx`; `App.tsx`; `GET /api/research/health`. |
| P0-3 | Site-wide “Request access” / “Request Research Access” ends on a browser-draft form that states it does not write a request, while the title, hero, and step 3 tell the user they are requesting access and will then begin an investigation. | Browser `/contact`; `ExperiencePages.tsx` `Contact`; header `PRIMARY_NAV_CTA`. |

### P1

| ID | Finding | Evidence |
|----|---------|----------|
| P1-1 | `/pricing` is indexed as “Research Access & Team Pilots” and the meta description offers “a scoped team pilot.” The page has no pilot, price, or application. Nav label is “Access options.” | Live `<title>`; `SEO_PAGES['/pricing']`; live headings. |
| P1-2 | `/science/body` is the main Science CTA and is shipped `noindex` with the generic title “Research Tools & Account Access.” | Live HTML `robots` and `<title>`; `getSeoMetadata` fallback; `Science()` hero link. |
| P1-3 | “Open Biology Zoom” from any organ other than pancreas, heart, or intestine opens the pancreas zoom. | `ScienceBody.tsx` organ allow-list fallback. |
| P1-4 | Research and How it works journey step “Ask a research question” goes to `/research/dashboard`, and “Research sign in” is on the research hero, while the governed workspace is not currently available. | `features/experience/content.ts`; `ResearchLanding`; capability `PUB-RESEARCH-WORKSPACE`. |
| P1-5 | Clinical deep links are split: footer and `/modules/clinical` are correct; platform clinical card and technology longitudinal application go to `/modules`; experience-content “Clinical intelligence” goes to `/modules/aksh-health`. | `Platform.tsx` `productCopy.clinical.link`; `Technology.tsx` applications; `content.ts`. |
| P1-6 | Homepage ecosystem secondary CTA “Open Discovery” → `/discovery`. `/status` “Open demo” links `/clinical-timeline`, `/trials-criteria`, `/gateway`. Those are engineering or fixture routes on a public landing path. | `productMaturity.ts` `ECOSYSTEM_PRODUCTS` ISI `secondaryCta`; `DEMO_LINKS`; live homepage link “Open Discovery.” |
| P1-7 | Technology copy “Reconstruct a permissioned timeline” conflicts with the Clinical must-not “Not reconstructed patient histories.” | `Technology.tsx` applications; `productMaturity.ts` clinical `mustNot`. |

### P2

| ID | Finding | Evidence |
|----|---------|----------|
| P2-1 | Two homepage closing links (“Request Research Access” and “Contact for Collaboration”) share `/contact`. | `HomeAccess.tsx`; live CTA list. |
| P2-2 | Primary nav collapses below 1151px, so many laptop and tablet widths lose Platform / Research / Modules / Science / How it works until the hamburger is opened. | `Nav.tsx` `matchMedia('(min-width:1151px)')`; measured `navDisplay: none` at 729px and `flex` at 1440px. |
| P2-3 | Footer omits Solutions; Evidence & safety is listed twice (Information and the bottom bar). Community and Status are not in the footer. | `Footer.tsx`. |
| P2-4 | `/modules/clinical` reuses platform hero artwork. `/pricing` has no hero artwork. `/status` uses the older page chrome (“THIN DEMOS”). | `ClinicalModule.tsx`; `Pricing()`; `Status.tsx`. |
| P2-5 | Metabolism hero chip passes `domain=clinical`. Public body explorer uses “Science 2.0” as a kicker. | `HomeHero.tsx`; `ScienceBody.tsx`. |
| P2-6 | Live SSc line says “our first scientific investigation”; workspace says “one scientific validation case.” Whichever deploy wins should keep the validation-case wording. | Live hero text vs `HomeHero.tsx`. |
| P2-7 | `/demo` is correctly named in the nav and is still a synthetic cohort (patient, clinician, FHIR, prescreen). First screen needs to keep that obvious. | `DemoWalkthrough.tsx`. |
| P2-8 | `/community` is an honest local rehearsal and is almost unlinked. | `Community()`; dashboard link only. |

### Explicit non-findings

- No Gate C auto-approve, live CDS, or PHI capture was found on the marketing pages that were read. Contact warns against personal health information in the optional context line.
- Redirects `/products` and `/for-aksh` resolve on the live host.
- Header does not show a guest Sign in control.
- Evidence & safety and the module pages state the research-versus-care boundary in plain language.
- Hero and biology images that were requested returned with non-zero natural dimensions. This audit did not find a broken marketing image on `/`.

---

## Recommended next build order

After user sign-off only. Do not treat this list as approval to implement.

1. **Decide the public origin.** Either serve `www.human-super-intelligence.co.uk` or stop citing it as production. Keep canonicals on the host that actually answers.
2. **One homepage primary action, one meaning.** If the button starts an investigation, the destination must be a real, permissioned investigation and the route must exist in the repo that will deploy. If the destination is a curated demonstration, the button should say so, and the workspace hero (“Explore the Platform”) and the live hero must be the same before the next release. Keep systemic sclerosis as a validation case.
3. **Make “Request access” true.** Either the contact page submits nothing and every CTA says that (browser draft, then admin grant), or a real request exists. Remove “begin an investigation” until the workspace capability is available and writes are enabled. Do not invent a pilot, an MoU, or automatic approval.
4. **Retitle `/pricing`.** Index it as access options. Drop “Team Pilots” from the title and description until a real pilot offer exists.
5. **Fix the science entry.** Give `/science/body` an intentional title and an index decision. Make Biology Zoom follow the organ the user selected, or hide the zoom link when that organ has no zoom.
6. **Point clinical at `/modules/clinical`** from platform, technology, and the experience-content clinical card. Remove homepage “Open Discovery” and public “Open demo” links to `/discovery`, `/gateway`, `/clinical-timeline`, and `/trials-criteria`, or move them behind `/status` with the existing in-development labels.
7. **Soften the technology “reconstruct” line** so it matches the clinical must-not, and keep the NEXUS diagram caption adjacent to the diagram.
8. **Chrome cleanup (after the truth fixes):** footer Solutions link, single Evidence & safety link, pricing and clinical artwork, status page on the same chapter system, nav breakpoint so the five destinations remain visible on typical laptop widths, and one contact phrase in the homepage close.

Suggested verification after any of the above is signed off and built: repeat the live HTTP list, open `/`, `/contact`, `/pricing`, `/science`, `/science/body`, `/platform` in a browser, and confirm the primary button, the contact note, the pricing `<title>`, and the body zoom organ all describe the same thing the user just did.
