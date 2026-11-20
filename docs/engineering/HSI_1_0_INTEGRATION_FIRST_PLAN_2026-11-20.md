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
2. **One thin workspace integration PR** that makes the existing trail a continuous default path (progressive disclosure, scroll/open contracts, one Playwright continuous journey) without inventing science or enabling writes.  
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
| 1 | Research question | `ask` | `liveRun.ts`, Ask strip in `InvestigationWorkspace.tsx` | `#ws-ask-strip` | **Yes** |
| 2 | Permitted scientific evidence | `evidence` | `liveRun.ts` candidates/records; evidence list UI | `#ws-ev-h` card | **Yes** (live/mocked mix; rights incomplete) |
| 3 | Evidence Context Passport | `passport` | `evidenceContextPassport.ts`, `EvidenceContextPassportView`, `liveClaimPassportEdge.ts`, `PassportEvidenceTable` | Claim inspect + empty passport status | **Yes** (requires claim select) |
| 4 | Mechanism graph + comparisons | `disagreement` (+ relationships card) | `GraphView` in workspace; `liveRunComparison.ts`; `UspADisagreementPanel` | Relationships card open; comparison under `#ws-usp-panels` **`<details>`** | **Partial** — comparison not default-open |
| 5 | Contradictions, gaps, hypotheses | `gaps` (+ hyp block) | `runGaps.ts`, `testableNextQuestions.ts`, run hypotheses UI, `CuratedDisagreementPackPanel` | `#ws-gaps-testable` **folded**; hyps in verification card | **Partial** — folded / secondary |
| 6 | Testable experiment + decision brief | `brief` | `liveBriefPreview.ts` / v2, `LiveBriefDecisionPanel`, `liveBriefPassport.ts` | `#ws-brief-panel` when run exists | **Yes** (limitations honesty present) |
| 7 | Save, reopen and reassess | `save` | `liveRunLibrary.ts` / browser store, `UspCConnectedPanel`, usefulness panel | USP C panel + reopen buttons | **Yes** device-local; server fail-closed |

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

These are the **integration** holes after inventory:

1. **Progressive default path** — USP A comparison and gaps/testable sit inside closed `<details>`. Trail `onSelect` scrolls/opens some targets, but a first continuous pass still feels like a dashboard of folds.  
2. **Single continuous e2e** — `site/e2e/live-investigation.spec.ts` asserts honesty and pieces; it does not yet prove one scripted Ask→…→Save sequence that forces passport, comparison pair, gaps fold, brief limitations, and library entry without tab-hopping.  
3. **Post-merge homepage reconciliation** — Stack A + Stack B both touch public landing; needs one composition after owner merge.  
4. **Live evidence reliability** — engineering present; acceptance blocked on clearance / dual-provider / SME (owner).  
5. **Staging persistence** — device-local save works; Neon durable path held (owner).

Nothing in (1)–(2) requires new scientific engines.

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
| Trail open contracts | `site/src/pages/InvestigationWorkspace.tsx` — `onUnifiedTrailSelect` / Stage2 checklist selectors: ensure `disagreement` opens `#ws-usp-panels`, `gaps` opens `#ws-gaps-testable`, `brief` focuses `#ws-brief-panel`, `passport` selects first claim if none |
| Optional small helper | `src/investigation/unifiedJourneyTrail.ts` or new `workspaceTrailNavigation.ts` — pure open-target map (testable) |
| Panels | Prefer **props** on existing `UspADisagreementPanel` / gaps details (`open` controlled) rather than new panels |
| Tests | `test/unifiedJourneyTrail.test.ts` (extend) · `site/e2e/live-investigation.spec.ts` **or** new `site/e2e/workspace-continuous-journey.spec.ts` |
| Docs | Short honesty note under `docs/engineering/` (fold/open contract) |

### Files to leave alone

- `src/demoUniverse/**` (except deep-links from demos)  
- Neon migrations / write gates / auth grant servers  
- Enterprise `/enterprise/*` expansion  
- Capability-status inventing availability  
- Sealed graph mutation / gold vault  
- Stage 2 marketing pages (post-merge reconcile is a **separate** docs/UI fix if conflicts appear)

### Acceptance tests (engineering — not scientific gold)

1. Playwright: with a fixture/live-safe run (existing workspace harness), walk trail Ask → Evidence → Passport (claim selected) → Disagreement (pair selected or empty honesty) → Gaps fold visible → Brief limitations visible → Save → Reopen same `briefHash`.  
2. Assert honesty strings: journey complete claimed false; production writes false; potential contradiction ≠ proven.  
3. Unit: open-target map exhaustive over `UnifiedJourneyStepId` (`never` default).  
4. No new forbidden marketing claims on workspace copy.

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
