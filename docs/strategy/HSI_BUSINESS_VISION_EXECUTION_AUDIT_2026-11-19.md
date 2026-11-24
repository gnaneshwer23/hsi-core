# HSI — Business vision, USP and engineering execution audit

**Date:** 19 November 2026 (Europe/London)  
**Directive:** Definitive Business Vision, USP and Engineering Execution Directive (this audit’s governing brief)  
**Later doctrine (20 Nov 2026):** [`HSI_BUSINESS_PREMORTEM_2026-11-20.md`](./HSI_BUSINESS_PREMORTEM_2026-11-20.md) — failure-mode prioritisation; does **not** replace this audit’s implementation matrix. Engineering mapping: [`../engineering/PREMORTEM_90_DAY_RESPONSE_PLAN.md`](../engineering/PREMORTEM_90_DAY_RESPONSE_PLAN.md).  
**Method:** Repository truth from `docs/STATUS.md` / capability register, journey acceptance docs, implementation audits, open PRs — **no production config changes, no held-migration applies, no merges, no PHI.**  
**Honesty:** `researcherJourneyCompleteClaimed=false` · `writesEnabledClaimed=false` · `mergedPrEqualsProductionAcceptance=false` · `scientificallyValidatedClaimed=false`

---

## Executive verdict

HSI already has **substantial scientific substrate** (investigation workspace, Context Passport, structured disagreement/comparison, knowledge graph, dual-model harness, fail-closed auth). What is missing is not another dashboard shell — it is a **coherent, completable researcher journey** that turns those modules into one evidence-traceable decision workflow a scientist will reopen.

**Single highest-value next engineering task:**  
**Unify the primary `/research/workspace` path so Ask → permitted evidence → Context Passport → supporting/conflicting comparison → cross-domain candidates → gaps/hypotheses (labelled) → evidence-linked brief → save/reopen (fail-closed) is one continuous UI with no invented context and no production write enablement.**

Dashboard concepts (`/enterprise/*`, `/workspaces/*`) stay **demonstration / later Stage 4**, not the next build centre. Content contracts for the five proposed shells (Academic, Biotech/Pharma, Clinical research, Lab/Omics, Community) live in [`HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](./HSI_STAGE4_DASHBOARD_CONTENT_MAP.md) — one shared science engine, audience-specific chrome.

---

## A. Current implementation truth matrix

### Honesty flags (binding)

| Flag | Value |
| --- | --- |
| Scientific validation claimed | false |
| Journey complete claimed | false |
| Writes enabled claimed | false |
| CDS/PHI in hsi-core | false |
| Gate C auto-approve | false |
| MoU invented | false |
| Merged PR = production acceptance | false |

Held migrations **022–033** remain held (`docs/STATUS.md`).

### Core 13-step researcher journey vs repository

| # | Journey step | Primary surfaces | Engineering | Live / pilot acceptance |
| --- | --- | --- | --- | --- |
| 1 | Sign in | Neon Auth, `/sign-in` | **Implemented** | Staging grants needed for E2E |
| 2 | Scientific profile | `/welcome`, researcher home, onboarding soft-lands | **Partial** — device-local / fail-closed; **023 held** | Not accepted |
| 3 | Enter research question | `/research/workspace`, mechanism workflow | **Implemented** (UI + APIs) | Writes blocked in production |
| 4 | Retrieve permitted evidence | live search, SCOUT path, EuropePMC/Open Targets metadata | **Partial** — mocked/live mix; clearance incomplete | Source clearance blocked (#2) |
| 5 | Provenance + experimental context | Evidence ledger, **Context Passport** | **Implemented library + UI** — soft-land catalogs open | Not journey-accepted |
| 6 | Supporting vs conflicting | `liveRunComparison`, `contextConflictAudit`, contradiction engines | **Partial** — code strong; Neon contradiction **held** | Scientist gold missing (#4) |
| 7 | Cross-domain mechanisms | departments, graph agents, KG explorers | **Implemented** candidates; thin coverage | Unreviewed candidates only |
| 8 | Uncertainty / gaps | gap verification, gap register | **Implemented** engineering classes | SME ranking blocked |
| 9 | Testable questions | falsification / planner | **Partial** — deterministic defaults | Optional planner disabled |
| 10 | Evidence-linked brief | `liveBrief` / v2, brief passport soft-land | **Partial** | Export acceptance owner-gated |
| 11 | Review, save, reopen, export | graph workspace, investigation delivery | **Partial** — localStorage default; server fail-closed | **031–033 held**; production writes off |
| 12 | Share with collaborator | org/tenant contracts, community | **Stub / blocked** | No approved sharing |
| 13 | Versioned re-evaluation | source re-review, rereview guards | **Partial** adapters | Live refresh unaccepted |

Register snapshot (counts): **17 implemented · 27 partial · 2 stub** — engineering classification only, not readiness.

### Role / workspace shells (USP C adjacent)

| Surface | Status |
| --- | --- |
| `/research/*` investigation tools | Real product centre |
| `/enterprise/*` professor/student | **Demo shells** — open [#513](https://github.com/gnaneshwer23/hsi-core/pull/513) |
| `/workspaces/*` eight-role concept | **Demo concept** — open [#514](https://github.com/gnaneshwer23/hsi-core/pull/514) |
| Org membership / RBAC / durable profiles | **Absent** (contracts + held SQL) |
| Clinical cohorts / PHI | **Disabled** — correct |

### Open PRs (do not merge without explicit approval)

| PR | Nature | Relation to this directive |
| --- | --- | --- |
| #511–#512 | Soft-land honesty catalogs | Safe docs/tests; **queue paused** pending owner merge approval |
| #513 | Enterprise academic demo shells | Stage 4 preview — **not** Stage 2 |
| #514 | Multi-workspace demo concept | Stage 4 / USP C preview — **not** Stage 2 |
| #371 | Editorial site / Atlas journey | Marketing/IA — do not outrank scientific journey |

Soft-lands already on `main` through **#509–#510** (E2E-07/08 catalogs) remain honesty-only.

---

## B. Gap analysis against the three primary USPs

### USP A — Explain scientific disagreement

| Need | Present? | Gap |
| --- | --- | --- |
| Entity/relationship extraction | Partial | Live extraction path mocked; rights-gated passages |
| Tissue/cell/model/population/dose/endpoint fields | **Yes** — passport + 17 passage-linked context fields | Often “Not stated”; normalizer registry thin |
| Structured why-findings-differ | **Yes** — conflict audit + comparison classes | Not the default completed UX; no adjudicated gold |
| No silent causality | **Yes** — honesty / review status | Keep enforced in every brief |

**Gap severity:** Medium-high for **productization** (wire + complete path), High for **scientific acceptance** (gold + SME).

### USP B — Cross-domain scientific investigation

| Need | Present? | Gap |
| --- | --- | --- |
| Cross-department graph | **Yes** — F-14 | Genomics/physiology thin; all unreviewed |
| Distinguish reviewed / candidate / AI / unknown | **Partial** labels | AI hypotheses must stay demoted (already doctrine) |
| Discriminating experiments | Partial (falsifiers / action plan) | Not pilot-proven useful |

**Gap severity:** Medium — substrate exists; depth and review are thin.

### USP C — Connected research intelligence

| Need | Present? | Gap |
| --- | --- | --- |
| Profiles, alerts, group dashboards, circles, sharing | Mostly **demo / held** | Do **not** expand shells before journey works |
| Evidence-linked collaboration | Missing | Correctly blocked without agreements |

**Gap severity:** High for org features — **defer** until Stage 2–3 prove usefulness.

---

## C. Existing code and infrastructure to reuse

Do **not** greenfield. Prefer:

| Layer | Reuse |
| --- | --- |
| Frontend | Vite/React site; `InvestigationWorkspace`, `EvidenceContextPassport`, `ResearchOutcomePanel`, `InvestigationGraphExperience` |
| Investigation | `src/investigation/liveRun.ts`, `liveBrief.ts` / v2, `liveRunComparison.ts` |
| Graph / context | `evidenceContextPassport.ts`, `contextConflictAudit.ts`, `passageLinkedContext.ts`, departments, graph agents |
| Evidence / trust | evidence ledger, source clearance receipts, dual-model harness, Gate C checklist (human-only) |
| Auth / tenancy | Neon Auth gateway, research grants, fail-closed write gates |
| Persistence | Device-local investigation store; gated graph workspace API (**031–033 held**) |
| Ops | Pilot ops catalogs, rate limits, kill-switch soft-lands |
| Eval | immuno benchmark slots, gold suite harness (**empty gold**) |
| Deploy | Vercel + Bun functions; HSI Neon only |

**Do not introduce** without documented necessity: new graph DB, vector platform, agent framework, microservice fleet, or separate apps per stakeholder.

---

## D. Prioritised implementation backlog (aligned to delivery stages)

| Stage | Focus | Priority now |
| --- | --- | --- |
| **1** | Repository & product truth | **This audit** |
| **2** | Complete scientific research journey | **P0 — build centre** |
| **3** | Researcher experience (profile, saved list, alerts) | P1 after Stage 2 spine |
| **4** | Research group (professor/student, memberships) | P2 — after Stage 3 usefulness |
| **5** | Differentiation benchmark (disagreement + cross-domain) | Parallel human track (**#4**) |
| **6** | Real researcher pilot | After Stage 2 staging acceptance |
| **7** | Commercial expansion / pricing | Only after willingness-to-pay signal |

Explicit deprioritisation: more `/workspaces` modules, homepage polish, community feed, clinical cohorts, paid gates.

---

## E. Next five small, reviewable PRs

Each must satisfy the Engineering Definition of Done (directive §12). **No production write enablement. No hold removal.**

| # | Proposed PR | USP | Reuses | Implements | Still mocked/blocked | Tests | Gates | User outcome | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **1** | **Journey cohesion on `/research/workspace`** — single progressive trail: question → evidence → passport → comparison → gaps → brief panel | A, B | Workspace, passport, comparison, liveBrief | UI orchestration + empty-state honesty | Live writes; gold | Unit + Playwright trail | No PHI; no client roles | Researcher finishes one decision pass without tab-hopping | Near-zero (CPU only) |
| **2** | **Brief = passport columns + limitations always visible** | A | liveBrief v2, E2E-07 catalog | Export preview UI; `briefAccepted=false` | Owner export acceptance | Unit honesty | Source rights | Readable evidence-linked draft brief | Near-zero |
| **3** | **Save/reopen owned investigation list (device-local or staging-gated)** | C (personal) | investigationStore, F-16 gates | List + reopen same version | Durable Neon until #5 | Persistence tests | Fail-closed server | Repeat usage of same investigation | Near-zero locally |
| **4** | **Profile → workspace handoff** (Welcome interests → home → open workspace) | C | Welcome, researcher home | Continuity without 023 | Server profile | E2E soft | Auth only | Activation to first question | Near-zero |
| **5** | **Curated disagreement demonstration pack** (3–5 public, rights-cleared cases; not gold) | A, B | conflict audit, passport | Fixture journey showing context-differing findings | Not scientific acceptance | Fixture tests | No invented DOIs/passages | Demo USP A without claiming validation | Near-zero |

**After these (owner-gated, not coded as “done”):** NEXT-A source/provider receipts; NEXT-B staging isolation HTTP; real dual-provider bind; SME vault toward 120 cases; then invite-only pilot.

---

## F. Scientific, security and operational blockers

| ID | Blocker | Blocks |
| --- | --- | --- |
| Human #2 | Source clearance / rights authority | Live passage retrieval |
| Human #3 | Security / isolation signer | Staging write scopes |
| Human #4 | SME gold / adjudication | Scientific acceptance, USP proof |
| Human #5 | Write-enable / journey owner packet | Save/export live journey |
| Human #8 | Ops / on-call / soak | Pilot release |
| Held 022–033 | Repository policy | Durable org/community/contradiction/graph stores |
| Production `writesEnabled=false` | Correct fail-closed | Full E2E on prod |
| No test researcher grants in many sessions | Auth | Acceptance runs |

---

## G. Cost estimates and budget risks (~£100/month target)

| Item | Fit for lean budget | Risk if unmanaged |
| --- | --- | --- |
| Vercel + Neon staging (existing) | Prefer | Extra branches / compute |
| Model API calls | Cap per investigation; cache metadata | Unbounded chat-style spend |
| New vector/graph infra | **Avoid** | Breaks £100 target |
| Large synthetic crawl | Avoid | Bandwidth + rights risk |
| Soft-land / CI minutes | Acceptable | Parallel PR thrash |
| SME adjudication | Human cost outside infra | Quality bottleneck |

**Budget rule:** prefer public metadata + permitted OA + curated fixtures; hard caps on model calls; no new platforms without necessity memo.

---

## H. Acceptance criteria and success metrics

### Engineering acceptance (per PR)

Use directive §12 checklist in every PR body. CI green ≠ production-ready.

### Journey acceptance (Stage 2 exit — staging only)

A granted researcher can complete steps 1–11 on staging with provenance intact, contradictions/context visible, brief limitations visible, save/reopen of the **same version**, and **no** PHI. Steps 12–13 remain optional/blocked until sharing and re-review authorities exist.

### Product / commercial metrics (measure; do not invent)

Activation · first useful investigation · investigation completion · researcher-rated usefulness · repeat usage · saved/reopened · alert engagement (when enabled) · authorised collaboration · pilot conversion · willingness to pay.

### Scientific metrics (Stage 5)

Separate scores: factual correctness, provenance, contradiction interpretation, hypothesis usefulness, expert-rated actionability — **never** a single blended vanity score. Hard gates for provenance/safety.

---

## I. Proposed first researcher pilot

| Item | Proposal |
| --- | --- |
| Size | 3–5 biomedical researchers (academic or biotech discovery) |
| Scope | One disease-agnostic question each in their own domain |
| Success | They complete Stage 2 journey; rate usefulness; reopen once; state willingness to pay (Y/N/maybe) |
| Forbidden | Invented users, testimonials, fake conversion rates |
| Prerequisites | Staging grants, write scope packet (#5), source policy for permitted corpora, model spend cap |
| Not in pilot | Org dashboards, clinical cohorts, community posting, paid checkout |

---

## Recommended single next task (start coding only after this audit is accepted)

**PR title (proposed):** `feat(journey): unify workspace trail — passport, comparison, brief`

**Why this over dashboards:** The directive states the 13-step journey is more important than additional dashboard pages. USP A/B already have libraries; the product failure mode is fragmentation. Completing one continuous trail maximises chance of first useful investigation and repeat usage under a lean budget.

**Out of scope for that PR:** `/workspaces` expansion, enterprise RBAC, lifting migrations, production writes, PHI, inventing gold.

---

## Delivery stage map (directive §10) — status

| Stage | Status |
| --- | --- |
| 1 Audit | **This document** |
| 2 Scientific journey | Partial substrate — **next build centre** |
| 3 Researcher experience | Partial / fail-closed |
| 4 Research group | Demo shells only (#513/#514) |
| 5 Differentiation benchmark | Harness without gold |
| 6 Pilot | Not started |
| 7 Commercial | Tiers conceptual only |

---

## References

- Capability register → `docs/STATUS.md`
- Prior reconciliation → `docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`
- Phase 0 backlog → `docs/implementation/02-prioritised-backlog.md`
- Journey acceptance → `docs/qa/HSI_END_TO_END_RESEARCH_ACCEPTANCE.md`
- Architecture ambition → `docs/strategy/HSI_END_TO_END_VISION_AND_TECHNOLOGY_ARCHITECTURE.md`
- Vision doctrine → `docs/strategy/HSI_VISION.md`
