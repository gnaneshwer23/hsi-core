# Phase 0 — Current-state audit (HSI end-to-end product)

**Audited:** 18 November 2026 (Europe/London)  
**Checkout:** `origin/main` @ `27e5eedf` (YC competitive landscape + homepage hero)  
**Branch for this audit:** `cursor/phase0-e2e-product-audit-2f71`  
**Classification vocabulary:** `WORKING` · `PARTIAL` · `MOCKED` · `BLOCKED` · `MISSING` · `UNVERIFIED`  
**Honesty:** A merged PR is **not** production readiness. `docs/STATUS.md` records `mergedPrEqualsProductionAcceptance: false` and `writesEnabledClaimed: false`.

**Related open PRs (not on main at audit time):** #465 definitive vision + brand doctrine · #466 ten-system technology map · #442 source clearance policy (owner decision).

---

## Executive verdict

`hsi-core` already contains substantial substrate for a scientific investigation product: public site shell, Neon Auth gateway, research API surface, Context Passport UI/library, knowledge graph explorers, dual-model verification **harness** (PR [#275](https://github.com/gnaneshwer23/hsi-core/pull/275) / B-04.4 lineage), investigation workspace services, isolation probe suite, and ops alert catalog soft-land.

What is **not** true: a researcher can complete a verified production journey from signup → onboarding → live Ask → evidence → mechanism → verification → saved brief with tenant isolation and adjudicated scientific reliability. Production writes remain fail-closed; migrations 022–033 are held; human queues `#2` (rights), `#4` (SME gold), `#5` (writes) are parked; onboarding persists to **localStorage**, not the server.

**Centre of gravity for HSI 1.0:** close the scientific workflow and trust foundations (P0/P1), then premium website/onboarding polish (P2).

---

## Audit by surface

### A. Application framework and routing

| Finding | Evidence | Class |
| --- | --- | --- |
| Vite + React Router public + research apps | `site/src/App.tsx`, `site/src/main.tsx` | WORKING |
| Canonical public nav | `site/src/lib/primaryNav.ts` — `/`, `/how-it-works`, `/knowledge-graph`, `/trust`, `/about` (+ `/contact` indexed) | WORKING |
| `/platform`, `/science` retired → redirects | `App.tsx` Navigate | PARTIAL |
| `/researchers`, `/biotech`, public `/validation` | No routes | MISSING |
| ~74 page modules; many parallel research entry points | `site/src/pages/*` | PARTIAL |

### B. Public website

| Finding | Evidence | Class |
| --- | --- | --- |
| Home / About / Contact live | `HomeLanding.tsx`, About public, `ContactPublic.tsx` | WORKING |
| Premium brand tokens (midnight/teal/mint) | Documented on #465; **not** on main; live CSS mixes ivory/burgundy, indigo, midnight | PARTIAL |
| Contact / beta enquiry | Always browser draft; optional `POST /api/access-requests` if webhook/Resend configured (`accessRequestHandler.ts`) | PARTIAL |
| SEO / mobile / honesty labels | e2e `public-navigation-audit`, `production-qa`, `product-experience` | PARTIAL |

### C. Authentication

| Finding | Evidence | Class |
| --- | --- | --- |
| Sign up / sign in / OTP verify / password recovery | `SignUp.tsx`, `SignIn.tsx`, `PasswordRecovery.tsx`, `hsiAuth.ts`, `neonAuthGateway.ts` | PARTIAL |
| Session cookie via provider | `/api/auth/*` → Neon Auth | PARTIAL |
| Provider diagnostics | `provider_reachable` ≠ research grant | PARTIAL |
| Workspace requires human grant | `ResearchAccount.tsx`; capability `PUB-RESEARCH-WORKSPACE` = `not_currently_available` | BLOCKED |
| Cross-user isolation | Unit/workspace tests + isolation probe catalog; **live two-researcher HTTP acceptance not signed** | PARTIAL |

### D. Onboarding

| Finding | Evidence | Class |
| --- | --- | --- |
| Welcome wizard (role, interests, goals) | `Welcome.tsx`, `researchHome.ts` | WORKING (client) |
| Persist to backend | `localStorage` `hsi-research-profile-v1`; comment cites held migration `023` | MISSING |
| Guided first investigation → authorised save | Not closed end-to-end with writes off | BLOCKED |

### E. Researcher dashboard & workbench

| Finding | Evidence | Class |
| --- | --- | --- |
| Dashboard UI + empty/denied honesty | `ResearchDashboard.tsx`; e2e mocks `writesEnabled:false` | PARTIAL |
| Investigation workspace | `InvestigationWorkspace.tsx`, `ScientificResearchWorkbench.tsx`, many parallel surfaces | PARTIAL |
| Live Ask → brief with persistence | `liveInvestigationHandler.ts`; production writes fail-closed | BLOCKED |
| Browser-local save of live runs | Workspace “Save in this browser” | MOCKED (vs server ownership) |

### F. Evidence intelligence & ingestion

| Finding | Evidence | Class |
| --- | --- | --- |
| Europe PMC / Open Targets / CT.gov / Crossref adapters | `src/evidence/*Lookup.ts`, literature search API | PARTIAL |
| Rights / clearance receipts | `sourceClearanceReceipt.ts`, operational clearance; #442 draft policy | BLOCKED (#2) |
| Retraction + scheduled refresh | Incomplete vs master spec | PARTIAL / MISSING |

### G. Biological Context Passport

| Finding | Evidence | Class |
| --- | --- | --- |
| Library + UI + export | `evidenceContextPassport.ts`, `EvidenceContextPassport.tsx` | PARTIAL |
| Wired on graph/investigation components | `DomainKnowledgeGraph`, `InvestigationGraphExperience`, `DepartmentLens` | PARTIAL |
| Universal on live investigation path + passage-linked fields | Rights-blocked; incomplete edge coverage | BLOCKED / PARTIAL |
| Context comparison classes | Domain graph comparison UI; `structuredEvidenceComparison.ts` | PARTIAL |

### H. Knowledge graph & mechanisms

| Finding | Evidence | Class |
| --- | --- | --- |
| Domain/claim graphs, department explorer | `src/knowledgeGraph/*`, ScienceGraph pages | PARTIAL |
| 0 independently approved relationships (honest UI copy) | Domain KG header | PARTIAL |
| Server graph workspace | Fail-closed / held migrations | BLOCKED |
| HELIX / mechanism workflows | Deterministic/SSc-RA centred; model-backed not production | PARTIAL |

### I. Scientific verification (incl. PR #275)

| Finding | Evidence | Class |
| --- | --- | --- |
| Dual-model reliability harness merged | [#275](https://github.com/gnaneshwer23/hsi-core/pull/275) 2026-11-11; `dualModelChallenge.ts`, reliability gate modules | PARTIAL |
| Own docs: not production gate | `docs/research/B044_SCIENTIFIC_RELIABILITY_ACCEPTANCE.md` — contracts ≠ gate complete | BLOCKED |
| Expert-adjudicated gold | 0 adjudicated immuno cases; 120-slot profile empty of real gold (#4) | BLOCKED |
| Two live verifier providers in production | Not accepted | BLOCKED |

### J. Contradiction & gaps

| Finding | Evidence | Class |
| --- | --- | --- |
| Gap index, opposing evidence, context conflict | `gapIndex.ts`, `gapVerification.ts`, contradiction ledger code | PARTIAL |
| Neon contradiction migrations | Held (`024`–`029`) | BLOCKED |

### K. Research briefs & decision memory

| Finding | Evidence | Class |
| --- | --- | --- |
| Exportable briefs from fixtures / domain graph / live run renderers | Domain brief export, discovery experience, live brief markdown | PARTIAL |
| Versioned server decision memory | Migration `022` held; evolution contracts | BLOCKED / MISSING |

### L. Database, CI, monitoring

| Finding | Evidence | Class |
| --- | --- | --- |
| Neon guard + held migrations 022–033 | `migrationHolds.ts`, `neonGuard.ts` | WORKING (policy) |
| Investigation workspace unit isolation tests | `test/investigationWorkspace.test.ts` | WORKING (unit) |
| Staging isolation suite | Catalogue + fixture mode; live mode owner-gated | PARTIAL |
| Ops alert catalog soft-land | `opsAlertCatalog.ts` (#463) | PARTIAL |
| GHA research-foundation / production-probe | Workflows present | WORKING (CI hygiene ≠ science acceptance) |

---

## PR #275 note (user-cited)

Merged as **B-04.4: operational dual-model reliability benchmark harness**. Follow-on B-04.4 docs explicitly state the reliability gate is **not** complete: need authoritative clearance, real dual-provider composition, and expert-adjudicated evaluation. Treat harness as **PARTIAL engineering**, scientific acceptance **BLOCKED**.

---

## What “complete” would mean (HSI 1.0 exit)

One authenticated researcher can: register → verify → (granted) onboard with **server** profile → create investigation → retrieve rights-cleared evidence → see Context Passport → inspect mechanisms → get verification categories including abstention → save/export a versioned brief — and Researcher B cannot read Researcher A’s data. Scientific claims remain evaluation-gated until gold cases exist.

See [`01-gap-matrix.md`](./01-gap-matrix.md) and [`02-prioritised-backlog.md`](./02-prioritised-backlog.md).
