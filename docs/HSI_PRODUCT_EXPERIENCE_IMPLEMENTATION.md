# HSI product experience implementation and QA handoff

Date: 5 November 2026. Product name: **Human Super Intelligence**.

This increment applies the supplied Product Experience Blueprint to the public website and connects it to the existing research tools. It does not declare the entire blueprint operational in production. Scientific release, live access and clinical boundaries remain as recorded in the [build status](BUILD_STATUS_AND_NEXT.md).

## Public experience

Shared ivory (`#f3eee8`), teal (`#17645f`) and coral (`#ff6845`) styling, with restrained domain accents, replaces the inconsistent dark/public page chrome. Local SVG illustrations avoid remote stock-image dependencies. The navigation exposes five primary destinations and a request-access action; secondary destinations remain in the footer/mobile menu. Authenticated navigation derives only the account link from the provider session; backend permissions remain independent.

| Destination | Experience |
| --- | --- |
| `/` | Outcome-led introduction, interactive context map, research journey, verified on-demand fixture example, modules, evidence-state explorer and audiences |
| `/platform` | Existing interactive shared-architecture presentation, themed to match the public shell |
| `/technology` | Clear page title and shared presentation, preserving the detailed technology/source/governance interactions |
| `/products` | Existing ecosystem tabs with shared styling and separate product ownership |
| `/solutions` | Audience-specific explanations and working destinations |
| `/research` | Research entry points, current scope and verified example |
| `/evidence-safety` | Evidence-state definitions, confidence/review separation, actual hash-verified source-catalogue overview and boundaries |
| `/community` | Editorial research prompts and an explicitly local discussion rehearsal |
| `/pricing` | Access and pilot paths; no invented subscription prices or checkout |
| `/contact` | Existing account paths and an optional downloadable pilot-preparation brief |
| `/how-it-works` | Interactive six-step explanation and researcher/reviewer/validation/discussion journeys |
| `/science` | Existing science explorer plus connected research/evidence actions |
| `/for-aksh`, `/for-isi`, `/for-trials` | Cohesive product introductions with separate data ownership and accurate research/planned-product scope |

Exact Vercel SPA rewrites cover new public and workspace paths without intercepting research JSON assets or API routes. Route titles/descriptions, one main landmark, route focus, mobile navigation, keyboard controls and reduced-motion styling are included.

## Blueprint coverage and limits

| Blueprint section | Implemented or reused | Remaining gate or limitation |
| --- | --- | --- |
| 1. Product map | Connected public and contextual research navigation | No fictitious paid product tier |
| 2. Landing pages | Hero, local interactive map, problem/solution/journey/modules, evidence states, audiences and CTA | Map illustrates domains; does not assert causality |
| 3. Dashboard | `/research/dashboard` reuses backend create/list/reopen; account checks and tool entry points | Live auth/role/database acceptance remains pending; no fabricated recent activity |
| 4. Workbench | Existing saved-investigation workflow and verified outcome, plus expandable recorded progress/method summary | Does not simulate running agents, completion time or calibrated confidence |
| 5. Graph | Existing public graph, evidence dossiers and release-bound saved graphs; added zoom, directional pan, type/domain filters, bookmarkable node/depth, SVG/PNG/JSON export | Exports remain educational drafts. Bookmark is a public view, not a private saved graph workspace |
| 6. Patient explorer | Existing fixture lab, labs/trends/immune/microbiome/lifestyle/medication contexts; new direct tab links | Synthetic software validation only; no live patient ingestion or clinical interpretation |
| 7. Evidence library | Existing bounded source/passages catalogue plus verified public overview | Rights/context/scientific review still pending; integrity is not scientific validity |
| 8. Decision tree | Existing saved question/branch/answer workbench, linked from journey and workspace | No invented clinical cutoffs or treatment decisions |
| 9. Trial intelligence | Existing registry research context and synthetic topic/criterion previews; product entry opens the actual fixture trial tab | No confirmed eligibility, enrolment or patient-to-registry matching |
| 10. Hypotheses | Existing outcome candidates and fixture hypothesis/review rehearsal | AI drafts/synthetic records never become supported scientific claims |
| 11. Community | Local source-linked comments, same-topic replies, local flags and validated JSON export | In-memory only; reload clears it. No identity/reputation, posting, private groups, notifications or moderator service |
| 12. Governance | `/research/governance` embeds the actual independently authorised reviewer queue | No fake platform metrics/costs. Operational grants and independent two-account live acceptance remain pending |
| 13. Brief | Existing current-access/hash-verified JSON/Markdown; added native Print / Save PDF for complete saved outcomes and fixture briefs | Browser-generated PDF; no new stored/public share-link service |
| 14. User flows | Connected public → account/dashboard → investigation/evidence/graph/review/brief destinations | Clinical professional can inspect research scope only; live CDS remains excluded |
| 15–17. Design/mobile/accessibility | Shared tokens/cards/states, responsive layouts, visible keyboard focus, reduced motion, accessible SVG/control labels | Automated and visual QA are scoped checks, not a WCAG certification |
| 18. Build priority | Reuses existing features and verified adapters rather than disconnected mock screens | Distributed services and deployment prerequisites remain separate acceptance work |
| 19–20. Credibility and outcome | Source inspection, visible uncertainty, exact method/state metadata, human-review separation | No invented study identifiers, cohort statistics, approval, confidence, partners or community activity |

The source blueprint contains sample biomedical mechanisms, confidence labels, trial criteria and activity examples. These were treated as design examples, not accepted scientific facts. Shared technology does not create a shared patient database across Aksh, ISI and HSI.

## QA walkthrough

1. Start at `/`. Select each domain and journey step using keyboard and pointer. Load the verified example, change its marker and open its exact profile/provenance.
2. Use `/solutions` to switch audiences. Follow product/research links and confirm the visible scope matches the destination.
3. Visit `/evidence-safety`; inspect the actual catalogue overview, change the evidence-state explainer and open source/passages. Confidence remains uncalibrated and scientific rights remain pending.
4. In an authorised test deployment, open `/research/dashboard`, create and reopen an investigation, inspect recorded progress, answer a branch, examine source evidence/contradictions and generate/export the outcome. Try without authority: fail closed with a useful account/access action.
5. Open `/science/graph`, select a node, change depth/type/domain, zoom/pan/reset, reload a bookmarked node/depth URL and download all three formats. Visible/exported scope remains draft.
6. Open `/for-trials` → synthetic trial context. Confirm topic overlap cannot confirm eligibility. Open Review & brief and Print / Save PDF; labels and uncertainty remain in the full print document.
7. With a separate authorised reviewer, inspect `/research/governance`, submit the existing independent decision workflow and verify author/reviewer independence. A missing reviewer grant must not produce data or fake queue statistics.
8. At `/community`, add a permitted public source reference, reply, flag and export; confirm nothing is posted, no moderator is notified and reload clears comments. PHI-like text and unsupported URL domains are rejected by bounded local validation. This heuristic is not de-identification; do not enter patient data.
9. At `/pricing` → pilot brief → `/contact`, prepare/download a nonidentifying workflow brief. Confirm `submitted:false` and `permissionsGranted:false`; no lead was sent. Account creation uses the existing authentication provider flow.
10. Repeat navigation at 320px and desktop, Escape/keyboard focus, and reduced motion. Check title/landmarks, readable controls, direct route reloads, API errors and asset verification failures.

## Validation

Run from the repository with Bun available; browser checks use Chromium. No database credentials are needed for fixture/harness validation.

```sh
# Repository contracts and security/governance regressions
bun test --no-env-file ./test
bun --no-env-file run build
bun --no-env-file x tsc --noEmit -p site/tsconfig.json
bun --no-env-file run --cwd site build
# Connected browser journeys and prior regression suite
bun --no-env-file run --cwd site test:e2e
```

Tests include local-discussion authority/URL/thread/export guards, responsive public routes, keyboard navigation, source-catalogue and fixture verification, backend empty/denied states, graph export/downloads, reduced motion and inert native-print rendering. The existing browser harness also exercises persisted investigation, source, review, revision, authorization and verified-download behavior.

Verification result: 770 core tests and 104 browser tests passed; repository build, site TypeScript, API checks, generated-data integrity checks and the site production build passed. The final page-polish/accessibility subset is also rerun before commit. Tests use local fixtures/harnesses; they do not establish live deployment or database acceptance.

Known limits: the existing main frontend bundle still triggers a chunk-size warning. Live auth/database/roles, migrations 014/015, operational rollback/restore, real SME-labelled scientific acceptance and source rights remain earlier release gates. This change does not run migrations or change provider/production database configuration. Contact delivery and durable authenticated community services are not enabled by a frontend redesign.
