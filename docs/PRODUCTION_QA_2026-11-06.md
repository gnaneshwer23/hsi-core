# HSI production QA — 6 November 2026

**Decision: launch blocked.** This is an engineering review against the two supplied QA plans, not a production, clinical, accessibility or scientific certification. Human Super Intelligence remains a research product. A public marketing website being deployed does not establish that private research services are ready for general use.

Changes are isolated on `codex/production-qa-20261106`. Do not merge this branch into a production-deploying branch until the relevant release gates below have real evidence and accountable owners. No production migrations, grants, database changes, emails or provider-account changes were performed by this review.

## Scope and evidence

The supplied “HSI Production-Ready QA Plan” and “HSI Features, User Journeys, Accessibility & Launch Testing” are requirements. Their descriptions of desired features are not proof that those features exist. Their original SHA-256 values are recorded in [the local QA receipt](../operations/qa/2026-11-06/local-results.json).

The receipt records the tested source revision, commands and results. Browser tests run locally in Chromium. Research/API/browser fixtures are explicitly test data; they do not establish live identity, source rights, scientific accuracy or clinical trial eligibility. No production database or credentials were used.

## Local results

The tested executable candidate is `dbbca74` (recorded in full in the receipt). All 780 core tests and 155 Chromium browser tests passed. TypeScript checks and builds passed. Axe reported no automatic violations on 21 desktop and 6 mobile page scans; the configured recovery forms were additionally scanned. Incomplete checks remain for manual review. Both lockfile advisory checks reported no vulnerabilities. The separate Lighthouse lab run measured performance scores of 95–96 and LCP of 2.80–2.90 seconds; its source revision is recorded separately. The LCP target and field measurements remain open.

## Defects addressed

| Finding | Change | Verification |
| --- | --- | --- |
| No user password-recovery journey | Sign-in recovery link; request/reset pages; provider gateway routes and explicit Vercel entrypoints | Contract tests and isolated browser build with mocked provider |
| Recovery must not accept arbitrary callback URLs or grant roles | Gateway fixes reset callback to configured public origin; forwards only approved fields; exact origin and bounded input checks remain mandatory | Recovery gateway tests |
| Recovery could falsely report success or expose upstream details | Require provider `status: true` or `success: true`; safe error vocabulary; neutral request confirmation | Malformed success, expired-token and provider-detail tests |
| Recovery link contains a secret | Token held in component memory; query/fragment removed from visible address; no storage or metadata inclusion; no-referrer/no-store route policy | Browser token, reload and metadata tests; deployment headers still need live verification |
| Contrast failures after public visual redesign | Darken muted labels; remove text opacity that reduced contrast; distinguish light and dark component states | Automated WCAG A/AA scans across public pages and key tools |
| Decorative arrows render as missing glyphs on some platforms | Replace public action arrow glyphs with decorative SVG paths | Screenshot inspection and icon-rendering regression |
| Dashboard account control lacks a screen-reader name at narrower breakpoints | Explicit accessible account-link name | Axe dashboard scan |
| Oversized graph can throw during render | Show a bounded-view message above 500 nodes; preserve the text inspection route instead of crashing | Layout tests for 100/500 and refusal of 1000 test nodes; graph regression suite |
| Oversized artwork on mobile | Responsive 480/768px WebP variants, compressed with transparency preserved; original retained for larger displays; explicit dimensions | Mobile source-selection regression and repeated mobile Lighthouse measurement |
| External font stylesheet delays first render | Self-host the same pinned typefaces with font preload and original OFL notices; remove Google font requests | Browser font-source regression and repeated mobile Lighthouse measurement |
| HTTPS and browser capability policy incomplete | Add one-year HSTS, disable unused camera/microphone/geolocation capabilities; do not assert subdomain ownership or preload | Configuration review; deployed response verification pending |

Automated account-page scans use the unconfigured local deployment; configured recovery forms are additionally scanned in an isolated mocked build. These scans do not prove that live sign-in, signup or provider error states are accessible.

Password recovery remains **live-unverified**. The configured Neon deployment must actually support the requested Better Auth endpoints and email delivery. The provider remains responsible for one-time token validity, expiry, password policy, abuse controls and session invalidation. A mocked response cannot prove these controls. The initial request URL may be retained by hosting infrastructure; operators must verify URL/query redaction and log retention. Do not paste recovery links into support tickets or analytics.

## Journey and launch-gate matrix

“Local evidence” means the named automated tests or source checks have been exercised. It never means a live requirement is complete.

| Requirement from the plans | Current implementation / local evidence | Remaining acceptance |
| --- | --- | --- |
| Public pages, navigation, real calls to action | 14 public SEO pages, shared header/footer, mobile menu, keyboard sections; `editorial-landing`, `site-chrome`, `seo` browser suites | Founder/content review, actual deployment, links, headers and domain redirects |
| Product availability and claims | Marketing excludes test fixtures; trials described as planned; conceptual visuals identified; no invented customers or accuracy metrics | Independent factual/legal approval of final copy |
| Signup, login, email verification, logout | Provider gateway, OTP UI, strict session parsing, permission checks; auth/Vercel unit tests | Two actual accounts on approved HSI staging; delivery, resend quotas, expiry, logout/revocation and browser-cookie behavior |
| Password recovery | Newly connected request/reset flow; contract + mocked browser tests | Real email, expired/reused tokens, enumeration resistance, provider rate limits and old-session invalidation |
| Authentication ↔ database branch alignment | Session diagnostics and database-side authority checks exist; configuration check is not a connection test | Fix/verify the previously reported `database_user_not_visible` condition on approved staging; no bypass or production migration |
| Reviewer independence / role escalation | Server-owned scope checks, separate reviewer grants, self-review rejection and ownership tests | Trusted provisioning of two distinct identities; live cross-account and grant-revocation rehearsal |
| Research dashboard | Connected workspace states, genuine loaded counts, own-record handling; fixture profile counts remain labelled | Actual signed-in data, empty/error/loading states and source access on approved staging |
| Create/save/reopen an investigation | Pinned release, stable request ID on lost acknowledgement, pagination; workspace unit/browser tests | Durable deployed save/reload from another session; duplicate and outage rehearsal |
| Question → outcome | Bounded extractive baseline, source passages, graph context, contradictions, missing information and draft hypotheses | This is not a validated general LLM reasoning service; approved source corpus and independently evaluated methods required |
| Evidence and grounded claims | Release/package hashes, passage locators, context/evidence states, revoked-access and tamper refusals | Licence/URI decisions, scientific SME decisions and measured evaluation set performance |
| Knowledge graph | Search/filters, neighborhood, selection, pan/zoom, keyboard controls, bookmarks, JSON/SVG/PNG, text equivalent | Manual assistive-technology review, approved graph content and large-data interaction profiling |
| 100 / 500 / 1000 graph stress | Pure layout tests cover 100 and 500 fixture nodes; 1000 is explicitly refused | **1000-node rendering is not implemented.** No latency/INP claim at 500; task/thread performance still needs measurement |
| Timeline/labs/context | 200 labelled synthetic profiles across 20 conditions; deterministic validated adapters and connected records | Real research sources via authorised canonical adapters; no silent relabelling of fixtures |
| Trial research | Labelled criteria/registry-shaped research examples and uncertainty; no confirmed eligibility | Real registry integration, update policy, criteria provenance and investigator validation |
| Brief and exports | Verified JSON/Markdown/HTML, browser print/PDF, graph SVG/PNG; package hashes and frozen review input | Deployed downloads/print/privacy; external PDF document tagging and screen-reader review |
| Independent review and corrections | Owner/reviewer isolation, immutable package-bound decisions and revision lineage | Live SME review and revocation; review acceptance does **not** automatically publish graph facts |
| Community, challenges, private groups, notifications | Local discussion drafts only; not a live moderated community | Identity, durable storage, moderation, appeals, access isolation, notification preferences and abuse operations must be built before offering them |
| Patient/clinician EHR and clinical decisions | Excluded by repository policy: no live PHI, clinical decision support or EHR write-back | Not an HSI launch gate to “enable”; any clinical product needs its own separately authorised scope and governance |
| Accessibility | Axe WCAG A/AA scans, labels, keyboard skip/focus, mobile/reduced-motion tests | Manual screen reader, zoom/reflow, cognitive usability, contrast in every interactive state, touch, Windows/macOS/mobile assistive technology; axe incomplete checks remain manual |
| Cross-browser / real device | Chromium only in this environment | Firefox, Safari/WebKit, iOS Safari and Android devices; offline/interrupted sessions |
| Core Web Vitals | Lighthouse mobile performance 95–96, CLS 0; measured LCP 2.80–2.90 seconds still misses the 2.5-second target | Reduce shared CSS/JavaScript cost and remeasure; field p75 LCP/INP/CLS over an adequate sample; lab TBT is not INP; no uptime/SLA inferred |
| Security and privacy | Input bounds, exact origins, owner/source grants, cookie rewrite protections, no-store API responses, safe errors; unit coverage | Independent security assessment, secrets/access review, deployed cookie/header validation, CSP evaluation, distributed auth/recovery abuse tests and incident drill |
| Dependency audit | Lockfile-based advisory audit only | Continuous monitoring and review of provider/runtime/platform configuration; a clean advisory response is not security certification |
| Legal/privacy/terms/support | No final controller-approved privacy notice, terms, retention policy or operational support commitment | Actual legal entity/controller, contact, processing purposes, retention, processors, jurisdiction, rights process and reviewed published policies. Do not invent these facts |
| Analytics and consent | No live analytics provider or verified event sink | Consent-aware, privacy-reviewed events; never capture questions, patient context, email, OTP, password, session or recovery token in events/URLs |
| Integrations / freshness / fallbacks | Adapter and source-readiness boundaries; local timeout/refusal tests | Real API credentials/permissions, actual outage/retry/rate-limit behavior, update monitoring and source licences |
| Monitoring / rollback / restore | Phase H checks and operator runbook; local public-artifact recovery is available | Real on-call owner, alerts, immutable known-good deployment, approved isolated DB restore rehearsal and rollback drill |
| Production release | Existing readiness checker stays `blocked_pending_trusted_acceptance` | Exact tested candidate SHA, deployment ID, owners, real gate evidence and approval; then post-deploy smoke |

## Reproduce the local checks

From repository root with Bun and Node 24 installed:

```sh
bun install --frozen-lockfile
bun install --cwd site --frozen-lockfile
bun --no-env-file test ./test
bun --no-env-file run build
bun --no-env-file x tsc --noEmit -p site/tsconfig.json
bun --no-env-file run --cwd site build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium bun --no-env-file run --cwd site test:e2e
bun --no-env-file run pilot:check
```

Use an isolated environment with database variables unset. The test harness never needs live credentials. Configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for the actual local Chrome path, or install Playwright Chromium for the test suite. The password browser suite builds a separate temporary candidate with fake HTTPS auth settings and intercepts its provider requests; it does not change `site/dist` or use a real provider.

From `site/`, `bun run qa:accessibility` reruns the desktop/mobile axe checks. `bun run qa:lighthouse` starts a local preview on port 4179 and writes full lab reports to `/tmp/hsi-qa-performance` (override `HSI_QA_OUTPUT` for an approved local artifact directory). Do not aim these scripts at a signed-in production session. CI retains local browser fixtures/reports for seven days; no live account evidence belongs in those artifacts.

## Controlled release sequence

1. Assign the accountable owners already listed in [the research pilot runbook](RESEARCH_PILOT_RUNBOOK.md). Record the exact QA candidate revision and permitted HSI staging target. Keep production unchanged.
2. Resolve deployment/provider/database alignment and verify the necessary schema and scoped roles through trusted operations. Do not copy an Auth URL from one branch and a database URL from another. Do not point HSI at Aksh/ISI or grant reviewer status at signup.
3. Run the two-account journey on staging: signup → verification → sign-in → approved research access → create/save/reopen → evidence/graph → brief → independent reviewer → requested revision → resubmission. Also run anonymous, revoked, wrong-owner, ungranted and self-review denials. Record private evidence without tokens or health records.
4. Complete the live recovery and security tests, manual accessibility/device review, science/source acceptance, legal publications, consent/analytics requirements and monitoring/restore/rollback drills. Record defects by severity; unresolved critical/high issues block release.
5. Rebuild and retest the exact candidate after fixes. Obtain actual approval through the trusted process, merge only the approved candidate, verify deployment provenance, then repeat smoke tests on the deployed version. Revert/disable research writes if checks fail.
6. Observe error, abuse, accessibility and performance signals after release using the agreed incident process. A marketing-domain health response of `configuration_validated` never proves database access, credentials or research authority.

This review does not change evidence grades, approve source licences, activate live clinical workflows or authorise graph publication.
