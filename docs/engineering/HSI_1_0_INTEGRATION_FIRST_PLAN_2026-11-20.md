# HSI 1.0 — Integration First (file-level plan)

**Date:** 20 November 2026 (Europe/London)  
**Trigger:** Founder “What’s Built and What’s Next” + Cursor instruction *HSI 1.0 — Integration First*  
**Method:** Audit open PR stacks vs `main` (`e4995f67`), map reusable journey modules on `/research/workspace`, identify missing connections/tests.  
**Binding honesty:** `researcherJourneyCompleteClaimed=false` · `writesEnabledClaimed=false` · `scientificallyValidatedClaimed=false` · `mergedPrEqualsProductionAcceptance=false`  
**Out of scope for execution of this plan alone:** merging PRs, enabling production writes, lifting held migrations 022–033, Gate C auto-approve, MoU invention, PHI/CDS, deploy without owner approval, replacing graph/evidence governance, greenfield agent frameworks.

Governing doctrine: [`HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](../strategy/HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md) · trail fold status [`BUSINESS_VISION_JOURNEY_STACK_STATUS_2026-11-19.md`](./BUSINESS_VISION_JOURNEY_STACK_STATUS_2026-11-19.md).

---

## 0. Verdict

Most of the **Next-5 journey productization** from the 19 November audit is already on `main` (unified trail, brief/passport panels, device-local save/reopen, profile handoff, curated disagreement, Stage 2 exit checklist).

What remains for HSI 1.0 “one complete scientific investigation” is **not another module stack**:

1. **Owner reconcile** of two green stacked PR sequences (website redesign + Demo Research Universe).  
2. **One thin workspace integration PR** that makes the existing trail a continuous default path (Ask→scenario bridge, fold/open contracts including `cmpKey` on Why-differ, one Playwright continuous journey) without inventing science, free-text model spend, or production writes.  
3. **Owner-gated** evidence reliability, staging persistence, and researcher pilot — cannot be closed by agents alone.

---

## 1. Open PR dependency audit (20 Nov 2026)

Checked against `origin/main` tip `e4995f67` (includes first-researcher pilot shell `#553`). Both stacks **contain** that tip and report **verify SUCCESS** / **MERGEABLE CLEAN** at audit time. Agent cannot merge.

### Stack A — Stage 2 public website redesign → `main`

| Order | PR | Branch | Base | Role |
| --- | --- | --- | --- | --- |
| 1 | [#554](https://github.com/gnaneshwer23/hsi-core/pull/554) | `cursor/public-landing-design-system-2f71` | `main` | Design system + nav |
| 2 | [#556](https://github.com/gnaneshwer23/hsi-core/pull/556) | `cursor/stage2-homepage-platform-2f71` | …PR1 | Homepage / Platform |
| 3 | [#558](https://github.com/gnaneshwer23/hsi-core/pull/558) | `cursor/stage2-researchers-groups-2f71` | …PR2 | Researchers / Groups |
| 4 | [#559](https://github.com/gnaneshwer23/hsi-core/pull/559) | `cursor/stage2-biotech-clinical-lab-2f71` | …PR3 | Biotech / Clinical / Lab |
| 5 | [#560](https://github.com/gnaneshwer23/hsi-core/pull/560) | `cursor/stage2-community-validation-pricing-2f71` | …PR4 | Community / Validation / Pricing |
| 6 | [#561](https://github.com/gnaneshwer23/hsi-core/pull/561) | `cursor/stage2-integrated-qa-2f71` | …PR5 | Integrated QA |

**Relation to HSI 1.0 journey:** marketing/IA honesty. Merge for public site coherence. **Does not** complete the scientific investigation spine.

### Stack B — Demo Research Universe → `main`

| Order | PR | Branch | Base | Role |
| --- | --- | --- | --- | --- |
| 1 | [#555](https://github.com/gnaneshwer23/hsi-core/pull/555) | `cursor/demo-research-universe-2f71` | `main` | Registry + Phase 1 investigation |
| 2 | [#562](https://github.com/gnaneshwer23/hsi-core/pull/562) | `cursor/demo-universe-five-scenarios-2f71` | …PR1 | Five domain scenarios |
| 3 | [#564](https://github.com/gnaneshwer23/hsi-core/pull/564) | `cursor/demo-universe-comparison-brief-ui-2f71` | …PR2 | `/demo/universe` comparison UI |
| 4 | [#565](https://github.com/gnaneshwer23/hsi-core/pull/565) | `cursor/demo-universe-role-adapters-2f71` | …PR3 | Role dashboard adapters |
| 5 | [#566](https://github.com/gnaneshwer23/hsi-core/pull/566) | `cursor/demo-universe-omics-cohorts-2f71` | …PR4 | Synthetic omics/cohorts |
| 6 | [#567](https://github.com/gnaneshwer23/hsi-core/pull/567) | `cursor/demo-universe-landing-previews-2f71` | …PR5 | Homepage pack-backed previews |

**Relation to HSI 1.0 journey:** synthetic demonstration substrate + provenance classes. Reuse for demos / landing honesty. **Must not** replace live `/research/workspace` retrieval, production graph writes, or clinical-plane data.

### Reconcile rules (before any new journey code)

1. Squash/merge Stack A then Stack B (or B then A) — both base `main`; expect **HomeLanding** vs Stage 2 `Home` / marketing page conflicts when both land. Prefer **one** public homepage composition; keep Demo Universe `#product-demo` panel if Stack B lands after A.  
2. Do **not** fork a third homepage.  
3. After merge, run site build + axe/e2e on `/` and `/research/workspace` before starting §3 PR.  
4. Demo Universe stays under `src/demoUniverse/` + `/demo/universe`; live journey stays under `src/investigation/` + `/research/workspace`.

---

## 2. Target journey ↔ existing files (reuse map)

Founder 7-step target mapped onto the **already-shipped** 8-step unified trail (`UNIFIED_JOURNEY_TRAIL_SCHEMA`).

| # | Founder step | Trail id | Primary modules (reuse) | Workspace surface today | Wired? |
| --- | --- | --- | --- | --- | --- |
| 1 | Research question | `ask` | `scenarios.ts`, `profileWorkspaceHandoff.ts`, Ask strip in `InvestigationWorkspace.tsx`; Home Ask via `AskCard` / `SearchHero` | `#ws-ask-strip` | **Partial** — display + handoff; live POST is curated `scenarioId` only (`il21-autoimmune` in `useLiveRun.ts`); Home question not bound to Run |
| 2 | Permitted scientific evidence | `evidence` | `liveRun.ts` candidates/records; `workspaceView.ts`; evidence list UI | `#ws-ev-h` card | **Yes** (live retrieval; clearance `sourceClearanceVerified: false`) |
| 3 | Evidence Context Passport | `passport` | `evidenceContextPassport.ts`, `EvidenceContextPassportView`, `liveClaimPassportEdge.ts`, `PassportEvidenceTable` | Verification column after claim select | **Yes** (manual `setSel`; trail only scrolls `#ws-ev-h`) |
| 4 | Mechanism graph + comparisons | `disagreement` (+ relationships) | `GraphView`; `liveRunComparison.ts`; `UspADisagreementPanel`; USP B cross-domain | Relationships open; full Why-differ under `#ws-usp-panels` **closed** | **Partial** — unified trail does **not** auto-set `cmpKey` (USP A trail does) |
| 5 | Contradictions, gaps, hypotheses | `gaps` (+ hyp block) | `runGaps.ts`, `testableNextQuestions.ts`, hyp list, `CuratedDisagreementPackPanel` | `#ws-gaps-testable` **folded**; ledger CTA → `/research/ledger` | **Partial** — folded; hyp register is a tab hop |
| 6 | Testable experiment + decision brief | `brief` | `liveBriefPreview.ts` / v2, `LiveBriefDecisionPanel`, `liveBriefPassport.ts` | `#ws-brief-panel` when run exists | **Yes** (limitations honesty present) |
| 7 | Save, reopen and reassess | `save` | `liveRunLibrary.ts`, `UspCConnectedPanel`, usefulness panel | `#ws-conn-h` + reopen | **Yes** device-local; server fail-closed; steps 12–13 blocked |

**Parallel surfaces — do not remount into the continuous PR:** `/research/investigate` (`ScientificInvestigation.tsx`), `/research/journey`, `/research/mechanism-workflow`, account `site/src/components/InvestigationWorkspace.tsx` (server save), enterprise dashboards (deep-link only), Demo Universe (`src/demoUniverse/**`).

### Orchestration already on `/research/workspace`

| Concern | File |
| --- | --- |
| Page composition | `site/src/pages/InvestigationWorkspace.tsx` |
| Unified trail model | `src/investigation/unifiedJourneyTrail.ts` |
| Trail UI | `site/src/components/workspace/UnifiedJourneyTrail.tsx` |
| Stage 2 exit checklist | `src/investigation/stage2CompletionChecklist.ts` + `Stage2CompletionChecklistPanel.tsx` |
| Blocked steps 12–13 | `src/investigation/blockedJourneyStepsHonesty.ts` |
| USP A/B/C panels & trails | `site/src/components/workspace/Usp*.tsx` |
| Live brief decision | `site/src/components/workspace/LiveBriefDecisionPanel.tsx` |
| Profile handoff | `src/investigation/profileWorkspaceHandoff.ts` |
| Usefulness | `src/investigation/researcherUsefulnessFeedback.ts` |

### Demo Universe (seed demos only)

| Layer | Path | Rule |
| --- | --- | --- |
| Fixtures / schema | `src/demoUniverse/**` | Synthetic + verified bibliographic metadata |
| UI | `site/src/pages/DemoUniversePage.tsx`, `DemoLandingPreviewPanel.tsx` | Noindex / demonstration |
| Role adapters | `roleAdapters.ts` | Enterprise shells only |
| Omics/cohorts | `omicsCohorts.ts` | `canEnableRealData: false` |

Do **not** route live Ask through Demo Universe bundles.

### Explicit blockers (unchanged)

| Gate | Effect |
| --- | --- |
| Human #2 source clearance | Live passage rights |
| Human #3 isolation signer | Staging write scopes |
| Human #4 SME gold | Scientific acceptance |
| Human #5 write packet | Durable save on staging |
| Held migrations 022–033 | Org / durable stores |
| Production `writesEnabled=false` | Correct fail-closed |

---

## 3. Missing connections (product gaps, not missing libraries)

These are the **integration** holes after inventory ([Find workspace integration gaps](bc-3d3769cd-db9d-5baa-b9ab-16e643071848), [Map researcher journey files](bc-fa069b89-80dc-53e7-8360-c78dc15c9b6f)):

1. **Ask → run bridge** — Workspace always POSTs `{ scenarioId: "il21-autoimmune" }`. Profile/Home question is display-only; `SearchHero` navigates without scenario/query. Optional in-scope for the continuous PR: bind `matchScenario(profile.question)` or URL param **without** opening free-text model spend (API stays scenarioId-gated).  
2. **Progressive default path** — USP A comparison, cross-domain, and gaps/testable sit in closed `<details>`. Unified `onUnifiedTrailSelect` for “Why differ” does not set `cmpKey` the way USP A trail does — trail step stays incomplete until manual pair pick.  
3. **Competing shell exits** — App shell still trains researchers onto `/research/gaps`, `/research/ledger`, `/research/knowledge-graph` alongside the one-page spine. Continuous PR should not require those hops for “done”; leave routes in place.  
4. **Single continuous e2e** — `site/e2e/live-investigation.spec.ts` covers honesty and pieces; missing one script that walks all eight unified steps without `page.goto` hops (select claim → open disagreement + pair → gaps fold → brief limitations → save → reopen).  
5. **Post-merge homepage reconciliation** — Stack A + Stack B both touch public landing; one composition after owner merge.  
6. **Live evidence reliability** — clearance / dual-provider / SME (owner).  
7. **Staging persistence** — device-local save works; Neon durable path held (owner).

Nothing in (1)–(4) requires new scientific engines.

---

## 4. Prioritised single research-workspace integration PR

### Proposed PR

**Title:** `feat(workspace): continuous Stage 2 trail — open path + journey e2e`  
**Branch (suggested):** `cursor/workspace-continuous-trail-2f71`  
**Base:** `main` **after** Stack A/B reconcile (or current `main` if website/demo merges are deferred — then avoid homepage files).  
**USP:** A + B productization; personal C save continuity  
**Cost class:** Near-zero infra (CPU/CI only)

### Intent

Make `/research/workspace` the **default continuous** investigation path for the eight trail steps already modelled, without claiming journey complete, scientific approval, or production writes.

### Files to touch (expected)

| Area | Paths |
| --- | --- |
| Trail open contracts | `site/src/pages/InvestigationWorkspace.tsx` — `onUnifiedTrailSelect`: `disagreement` opens `#ws-usp-panels` **and** sets first `cmpKey` like USP A; `gaps` opens `#ws-gaps-testable`; `brief` focuses `#ws-brief-panel`; `passport` selects first claim if none |
| Ask → scenario bridge (thin) | `site/src/lib/useLiveRun.ts`, `site/src/lib/researchHome.ts` / `workbenchPrimary.ts`, optional `ResearchHome.tsx` SearchHero query — scenarioId only; no free-text POST |
| Optional small helper | `src/investigation/unifiedJourneyTrail.ts` or `workspaceTrailNavigation.ts` — pure open-target map (testable, exhaustive `never`) |
| Panels | Prefer **controlled `open`** on existing USP / gaps `<details>` rather than new panels |
| Tests | `test/unifiedJourneyTrail.test.ts` · `test/profileWorkspaceHandoff.test.ts` if handoff changes · `site/e2e/live-investigation.spec.ts` **or** `site/e2e/workspace-continuous-journey.spec.ts` · thin `research-home.spec.ts` handoff assert |
| Docs | Short honesty note under `docs/engineering/` (fold/open + Ask bridge contract) |

### Files to leave alone

- `src/demoUniverse/**` (except deep-links)  
- `ScientificInvestigation.tsx`, `ResearchJourney.tsx`, `ResearchMechanismWorkflow.tsx`  
- Account `site/src/components/InvestigationWorkspace.tsx` + `investigationWorkspaceService.ts`  
- Enterprise `/enterprise/*`, `/workspaces/*` dashboards (deep-link only)  
- Neon migrations / write gates / auth grant servers / gold vault / sealed graph mutation  
- Stage 2 marketing pages (homepage reconcile is separate after Stack A/B merge)

### Acceptance tests (engineering — not scientific gold)

1. Playwright continuous journey: `/research/workspace` → Run → select supporting claim → unified **Why differ** (panel open + pair / `cmpKey`) → **Gaps** fold visible → **Brief** limitations visible → **Save** → reopen same `briefHash` — **no** required hops to `/research/gaps` or `/research/ledger`.  
2. Optional handoff: scenario-matching Home question appears on Ask strip and selects correct `scenarioId` on Run.  
3. Assert honesty: journey complete claimed false; production writes false; potential contradiction ≠ proven.  
4. Unit: open-target map exhaustive over `UnifiedJourneyStepId` (`never` default); disagreement completion semantics documented if `cmpKey` auto-select changes.  
5. No new forbidden marketing claims on workspace copy.

### Still mocked / blocked after this PR

- Live passage rights / SME adjudication / staging durable writes  
- Steps 12–13 sharing / live re-review  
- “Journey complete” product claim  
- Pilot conversion metrics

### Definition of done (this PR only)

CI green · trail continuous UX · e2e proves one path · honesty flags unchanged · **no** production write enablement · **no** migration lifts · owner review before merge.

---

## 5. Programme order after the single PR (do not start in parallel as “done”)

| Priority | Work | Owner? | Notes |
| --- | --- | --- | --- |
| P0 | Reconcile Stack A `#554–#561` + Stack B `#555–#567` | **Owner merge** | Resolve homepage composition once |
| P0 | Continuous trail PR (§4) | Agent-shippable after reconcile | This plan’s coding centre |
| P0 | Evidence reliability acceptance | **Owner + experts** | Clearance, missing-context, evaluation — not a shell PR |
| P1 | Staging security + persistence | **Owner #3/#5** | Isolation HTTP, grants, held migrations stay held until packet |
| P1 | Controlled researcher pilot (3–5) | **Owner** | Usefulness / reopen / WTP — no invented conversion |

### Defer (aligns with founder note §6)

Additional agent personalities · more role dashboards · community posting · real patient integrations · autonomous discovery claims · new database platforms · vector/graph infra replacements.

---

## 6. HSI 1.0 acceptance checklist (planning — 0/8 verified)

Tick only with reviewed evidence (staging or pilot). Not GitHub CI alone.

| # | Criterion | Closest existing proof surface |
| --- | --- | --- |
| 1 | One continuous investigation without disconnected manual steps | Continuous trail PR + staging grant run |
| 2 | Every cited finding links to verifiable permitted source | Evidence list + clearance (#2) |
| 3 | Comparisons distinguish conflict vs non-comparable context | `liveRunComparison` + USP A panel + gold (#4) |
| 4 | Hypotheses/experiments labelled provisional | Workspace hyp block + brief limitations |
| 5 | Save and reopen in approved staging | Device-local today; staging needs #5 |
| 6 | Two-user isolation + permissions pass security review | NEXT-B / #3 |
| 7 | Expert-adjudicated benchmark finds errors/uncertainty | Gold harness + SME (#4) |
| 8 | Usable evidence-linked decision brief | `LiveBriefDecisionPanel` + pilot usefulness |

---

## 7. Recommended next Cursor coding instruction (after owner merge of stacks)

```text
Implement the single PR in docs/engineering/HSI_1_0_INTEGRATION_FIRST_PLAN_2026-11-20.md §4:
continuous Stage 2 trail open contracts on /research/workspace + Playwright continuous journey.
Do not enable production writes, lift migrations, merge other PRs, expand enterprise dashboards,
or replace Demo Universe / sealed graph. Keep honesty flags fail-closed.
```

If Stack A/B are still open: **do not** start §4 against a stale homepage; wait for reconcile or explicitly exclude public landing files.

---

## References

- Capability register: `docs/STATUS.md`  
- Journey acceptance: `docs/qa/HSI_END_TO_END_RESEARCH_ACCEPTANCE.md`  
- Unified trail: `docs/engineering/UNIFIED_JOURNEY_TRAIL.md`  
- Demo inventory: `docs/design/HSI_DEMO_RESEARCH_UNIVERSE_INVENTORY_2026-11-19.md`  
- Vision: `docs/strategy/HSI_VISION.md`
