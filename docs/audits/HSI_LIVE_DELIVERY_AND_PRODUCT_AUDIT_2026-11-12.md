# HSI — live delivery and product audit

12 November 2026. Repository: `gnaneshwer23/hsi-core`. Read-only audit of production HTTP responses, Vercel deployment/alias records, current GitHub PR status and actual source. No merges, promotions, migrations, permission grants, authenticated tests or external model/source execution.

## Conclusion

The public domain is serving the old homepage because **only website PR #291 reached main**. The other four PRs were merged into their respective feature-branch bases, not into main. The full approved website candidate exists and passed engineering checks, but it is not the production artifact.

This explains the visible old content. Separately, the graph experience remains below the planned investigation product, and the backend/data improvements are largely implemented contracts, adapters and acceptance infrastructure whose live integrated operation is still gated or unverified. Deploying the website candidate will not turn those into an operational scientific platform.

## 1. P0 — website integration was not completed

| PR | Current GitHub status | Merge destination | Consequence |
|---|---|---|---|
| [#291](https://github.com/gnaneshwer23/hsi-core/pull/291) Foundation/navigation | Merged | `main` | Production contains new navigation and foundation only |
| [#292](https://github.com/gnaneshwer23/hsi-core/pull/292) Homepage | Merged | `feat/website-01-foundation` | New homepage did not reach main |
| [#293](https://github.com/gnaneshwer23/hsi-core/pull/293) Flagship research pages | Merged | `feat/website-02-homepage` | Complete audit/evidence/brief pages did not reach main |
| [#294](https://github.com/gnaneshwer23/hsi-core/pull/294) Supporting pages | Merged | `feat/website-03-research-pages` | Complete Platform/Science/etc. did not reach main |
| [#295](https://github.com/gnaneshwer23/hsi-core/pull/295) Final QA | Merged | `feat/website-04-supporting` | QA and integrated candidate remain off main |

The delivered stack required a final integration into main. Merely merging each original PR did not achieve it because the upper PR bases were still feature branches. The handoff should have explicitly included this final integration and exact-domain verification; the earlier summary did not close that delivery loop.

- Production main: `016536671a1fdf1db99c135a6b559727a60597b4`, the #291 merge.
- Full tested candidate: `f9abfbf736b7de45db67b53ededd70d4533569e1`.
- Vercel production deployment: `dpl_5BgUZGpNgKkj8r4as1JgDxLLQi53`, READY, target production, bound to the #291 main revision.
- The Vercel alias for `www.humansuperintelligence.tech` points to that deployment.
- Candidate-versus-main diff: **29 files; 1,947 insertions and 222 deletions**, including the homepage, complete page components, original hero assets, research demo, exports and QA.
- Candidate is not an ancestor of current main. This is a branch/delivery problem, not evidence that the new homepage was deleted or a reason to ask visitors to clear their browser caches.

### Served-page evidence

| Live page | Observed response / heading | Interpretation |
|---|---|---|
| `/` | 200; “Explore the connections behind human health and disease.” | Old homepage, not approved candidate heading “See why the evidence conflicts.” |
| `/science` | 200; “Understand the biology. Keep asking better questions.” | Retained earlier Science page |
| `/context-conflict-audit` | 200; “Confidence begins with what you can inspect.” | Foundation route still renders `EvidenceSafety` |
| `/trust` | 200; same EvidenceSafety heading | Foundation shares component rather than full Trust page |
| `/research-briefs` | 200; “Research decisions deserve an evidence trail.” | Foundation introduction, not full interactive brief page |

Source corroboration: `App.tsx` **at production SHA** routes Audit/Evidence Intelligence to `EvidenceSafety`, Applications to `Solutions`, Trust to `EvidenceSafety + PublicNotices`, and Briefs to inline introductory content. Candidate `App.tsx` instead routes to `PublicResearchPages.tsx` and `PublicFoundationPages.tsx`. Production `Home.tsx` still imports the older `components/editorial/*` layout.

## 2. P1 — new website design and scientific product are different deliveries

The candidate does contain materially different content, an original biological hero and complete ten-page public narrative. It is inaccurate to say those files were never built. However, this does not establish that the design meets the user's quality expectation.

Even the full candidate has limitations relevant to the “AI-generated” impression:

- Cross-domain graph illustration in `ResearchPublic.tsx:452` is a fixed six-domain SVG, not the same versioned investigation as the research graph.
- `publicAuditDemo.ts` is explicitly deterministic synthetic teaching logic, not the production scientific comparison pipeline.
- `EvidenceExplorer.tsx` contains original fictional records, not cleared live research evidence.
- `PublicResearchPages.tsx` exports an illustrative source-free, unreviewed brief.
- The website work deliberately preserved the existing knowledge-graph tools; it did not rebuild them into the unified question→path→source→comparison experience. That was an unresolved product gap, not completed graph acceptance.

The disclosures are correct, but disclosures and diagrams cannot substitute for a useful connected investigation. The graph correction must unite homepage preview, Science entry and research workspace around a versioned selection, inspectable edge, source/context and comparison. The educational topic map should remain separately identified.

Prior candidate verification was **1,830 core tests passed, one optional live skip, 214 browser tests passed without retries**, with screenshots. [Exact candidate CI](https://github.com/gnaneshwer23/hsi-core/actions/runs/43324880618). These results apply to that candidate. They do not prove that production serves it, that humans accept the visual design, or that scientific services operate live. No tests were rerun merely to repeat that historical result during this read-only audit.

## 3. P0/P1 — backend exists, but production operation is not established

### Fresh anonymous HTTP checks

| Endpoint | Actual result | What it establishes |
|---|---|---|
| `/api/research/health` | 200, `configuration_validated`, `writesEnabled:false`, `databaseConnectionTested:false` | Config/origin/auth-database-prefix consistency checks; not an actual DB connection, correct schema or successful saved journey |
| `/api/research/graph/ssc` | 401, `BACKEND_PROVIDER_SESSION_REQUIRED` | Anonymous session gate responds; not valid-account reads or isolation proof |
| `/api/research/investigations` | 401, same code | Anonymous denial; not real save/reopen/export or tenant isolation |
| `/api/research/ready` | 404, `Not found` | No readiness service available at this deployment route |
| `/api/research/jobs` | 404, `Not found` | No worker job API available at this deployment route |

`site/api/research/[...path].ts:2` calls `handleVercelResearch(request, process.env)` without optional dependencies. `src/server/vercelResearch.ts:45–46,71–75` only enables job/readiness paths when `pilotJobApi`/`pilotHealth` are supplied. Therefore these particular capabilities are extension hooks, not currently connected deployed services through this entry point.

### Implementation versus acceptance

| Area | Actual engineering evidence | Remaining acceptance / connection |
|---|---|---|
| Source/provider safety | Receipt, hardened provider, budget and staging-composition modules; `src/researchV2/stagingConnectivity.ts` | Approved independently owned clearance service, two approved deployments/terms and redacted authorized real requests. Next-A remains unresolved by this audit. |
| Saved investigation/review | `interrogativeApi.ts`, `investigationDeliveryService.ts`, outcome/client components | Current least-privilege DB schema/roles, real distinct-scope researchers, independent reviewer and immutable authenticated saved/review/reopen/export journey. Next-B not executed. |
| Browser saved-workspace checks | `site/e2e/investigation-workspace.spec.ts:7` explicitly states fixture limitation; handlers use `route.fulfill` | These are UI contracts. They do not certify provider login or Neon persistence. |
| Three-role agents | `hsiAgentOrchestrator.ts` and later bounded execution/operations modules | Base orchestrator explicitly disclaims persisted/live completion guarantees. Later durable modules require actual host composition and execution evidence; existence does not prove the deployed journey uses them. |
| Readiness/worker operations | Optional service interfaces and operations-store/service implementations | Production routes above are not connected. No fresh soak, delivered alerts, restore or worker restart acceptance demonstrated. |
| Benchmark | Canonical 120-case allocation, scoring, private curation and review machinery | Actual cleared source packets, independent expert assessments/adjudication, locked holdout and approved floors/results. 120 slots must not be counted as 120 accepted cases. |

No private identities, production credentials or protected researcher records were accessed. The live migration ledger, effective RLS/runtime roles, backup restore and real-account isolation remain **not inspected in this audit**, not presumed absent or passed. Existing migration holds must not be removed to make the interface appear connected.

## 4. Data improvements were not lost, but the graph is not a living evidence feed

There is **no diff in `src/`, `db/` or `research/` between current production main and the tested website candidate**. Thus this website stack has not left a different version of those backend/research files behind. That says nothing about whether the deployed database has the intended migrations/data or permissions; it is a source comparison only.

The public graph is still a static educational catalogue. The separate domain graph uses versioned JSON, lexical filtering, source candidates and explicit gaps. `src/knowledgeGraph/domainGraph.ts` enforces `graphPromotable:false`, `scientificApproval:false` and unreviewed candidate edges. The inspected current domain snapshot has 153 nodes, 131 relationships and 75 source records; it is not an accepted graph of 131 scientific findings or a proven automatically refreshed knowledge base.

Public pages are not designed to read protected internal curation, private benchmark cases or unpublished reviewer records. Those should not be exposed merely to demonstrate progress. The missing deliverable is an accepted, authorized interface over suitable evidence, not publication of private data.

## 5. Prioritized corrective work and exit evidence

1. **P0 — integrate the completed website into main through one reviewable integration PR.** Use a branch containing the full latest stacked changes, compare against current main, and resolve against any new changes. Verify the exact integration SHA and full build/browser/SEO/private-artifact gates. Do not assume the old candidate CI automatically validates a new merge. This audit does not merge or deploy it.
2. **P0 — close the delivery loop.** After an authorized release, prove the custom-domain alias targets the tested artifact. Verify all ten actual served headings, assets, mobile navigation and canonical routes. Explicitly check that Audit/Evidence/Trust no longer render reused foundation placeholders. Record artifact SHA and deployment ID together.
3. **P1 — approve the actual graph experience by task, not test count.** Demonstrate one question moving through homepage→Science→research with the same snapshot, selection and evidence. Inspect each path step and compare opposed findings with missing context visible. Retain graph/list keyboard parity and mobile screenshots. Keep topic navigation/candidates/reviewed knowledge distinct.
4. **P0/P1 — connect only approved backend services in isolated staging.** Resolve Next-A/B authorities and accounts; assemble real adapters, worker/readiness routes, protected persistence and scoped review. Trace one accepted SSc and one RA/SLE journey. Prove data access, durable state, reviewer independence and receipt provenance before representing it as live.
5. **P1 — replace broad readiness language with a durable delivery ledger.** For every capability show source SHA, deployed artifact, live integration status, data provenance, acceptance evidence and user-visible entry point. Keep engineering implementation, deployment and scientific acceptance separate.

## Scope and limits

The visible production-content discrepancy is established by fresh served HTML plus GitHub and Vercel records. Browser automation failed to open the public tab; this audit does not claim fresh live visual screenshots, interactive device inspection or visual-design acceptance. Previous candidate screenshots are available separately. This was an audit, not a repair, deployment or full security/scientific acceptance exercise.

[Machine-readable deployment and probe evidence](HSI_DELIVERY_EVIDENCE_2026-11-12.json).
