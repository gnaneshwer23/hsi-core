# M19 — Platform Integration, Security, Performance & Production Hardening

**Brief:** HSI Milestone 19 — consolidate, integrate, secure, test and operationally harden the research platform using capabilities actually implemented across M1–M17 (and substrate). **Not** a new scientific product layer. **Not** a second agent OS.  
**Status:** Phase 0 repository / deployment audit + **PR1 Architecture and Dependency Audit** — **not** M19 complete · **not** production-ready · **not** live SSc E2E cleared.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `aa20df8c690194ac54bffe7cccb518b07bbfd1c1` (`aa20df8` — M17 PR4 Scientific Knowledge Evolution [#140](https://github.com/gnaneshwer23/hsi-core/pull/140))  
**In-flight (not on audited tip):** M17 PR5 Research Gap / Hypothesis Portfolio [#141](https://github.com/gnaneshwer23/hsi-core/pull/141) (`eng/m17-research-gap-hypothesis-portfolio`)  
**Repo:** [gnaneshwer23/hsi-core](https://github.com/gnaneshwer23/hsi-core)  
**HSI Neon:** red-wave only (`human super intelligence` / `red-wave-06625195` / `ep-restless-dew…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`../audits/MILESTONES_M1_M13_STATUS_ROLLUP.md`](../audits/MILESTONES_M1_M13_STATUS_ROLLUP.md)
- [`../audits/MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md`](../audits/MILESTONE14_REAL_WORLD_EVIDENCE_MATRIX.md) … [`MILESTONE17_…`](../audits/MILESTONE17_SCIENTIFIC_PROGRAMME_INTELLIGENCE_MATRIX.md)
- [`HSI_CAPABILITY_REGISTER_2026-11-08.md`](./HSI_CAPABILITY_REGISTER_2026-11-08.md)
- [`PRODUCTION_READINESS_AUDIT_2026-11-08.md`](./PRODUCTION_READINESS_AUDIT_2026-11-08.md)
- [`HUMAN_QUEUE_RESIDUALS.md`](./HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)
- [`../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md`](../architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md)
- [`../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md`](../architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md)
- [`../ARCH-003-AUTHENTICATED-API-INTEGRATION.md`](../ARCH-003-AUTHENTICATED-API-INTEGRATION.md)

**Honesty freeze:** no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live evidence · CI green ≠ scientific validity · eng contracts ≠ operational platform · in-process orchestrator ≠ durable runtime · RLS-on-without-policies ≠ secure live graph · M18 **does not exist in repo** (brief overreach — audit M1–M17 + substrate only).

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| **Verified operational** | Implemented and exercised on a current library/product path with honest gates |
| **Implemented but unverified** | Shape shipped; live / scientific / privacy correctness not verified |
| **Partially implemented** | Meaningful path exists; required depth, wiring, or honesty gates incomplete |
| **Fixture-only** | Works only with static fixtures / seeded packs / evaluation contracts |
| **Missing** | No meaningful implementation for the M19 requirement |
| **Blocked** | Cannot complete without human/config gate, authorised dataset, or unfinished prior work |
| **Skipped** | Deliberately not built (e.g. M11) — do not claim |
| **in-flight** | Open PR not yet on `main` |

---

## 0. Executive verdict

| Question | Answer |
|----------|--------|
| Is HSI one integrated production research platform today? | **No** |
| What is it? | Strong **research substrate** + honesty-gated eng contracts + authenticated research API surface on fixtures / staging-gated writes |
| Production readiness (2026-11-08 audit, still binding) | **Not production-ready** as scientific product, live authenticated research SaaS, or clinical system |
| M19 Phase 0 complete? | **This document** (audit only) |
| M19 DoD / release readiness? | **Not started** — P0 blockers remain |

**Overall platform classification:** **Partially implemented** with multiple **Blocked** live-acceptance gates and large **Fixture-only** contract surfaces (M12–M17).

---

## 1. Repository structure (verified)

| Area | Path / evidence | Notes |
|------|-----------------|-------|
| Substrate / contracts | `src/*.ts`, `src/*Contracts.ts` (~30 contract modules on tip) | Contracts-first M9–M17; most lack product APIs |
| Evidence / N* harnesses | `src/evidence/`, `research/domain-graph/` | N1–N8 + R1–R3 eng scaffolds |
| Server / auth | `src/server/` (`neonAuthGateway`, `interrogativeApi`, `vercelResearch`, …) | ARCH-003 path |
| Neon access | `src/db/`, `db/migrations/` (001–018) | red-wave only via `neonGuard` |
| Site (Vite) | `site/` — pages, `site/api/research/**`, `site/api/auth/**` | Public + authenticated research UI |
| CI | `.github/workflows/research-foundation.yml` | `site-deployment` + `verify` |
| Deploy | `site/vercel.json` + Vercel project | Preview + www; staging writes residual |
| Docs / audits | `docs/engineering/`, `docs/audits/` | Matrices M2–M10, M12–M17; rollup M1–M13 |
| Evaluation packs | `evaluation/**` | Contract evaluation JSON + STATUS |

---

## 2. M1–M18 implementation status (honest)

*Audited tip `aa20df8`. Classifications from rollup + M14–M17 matrices + git merge history. Do not inflate.*

| Ms | Title | Classification | Merged PRs (selected) | Blockers / gaps |
|----|-------|----------------|----------------------|-----------------|
| **M1** | Biomedical evidence / retrieval | **Partially implemented** · live journey **Blocked** | Backend SI #72–#89; D2D #87; OT #84; UniProt #88 | Human #2 rights, #5 live |
| **M2** | Contextual reasoning / contradiction | **Partially implemented** | #90, #92 | Science unverified |
| **M3** | Hypothesis / experiment registry | **Partially implemented** · observation **Blocked** | #91 | Registry ≠ experimental validation |
| **M4** | Translational failure intelligence | **Partially implemented** | #93, #94 | Later phases open |
| **M5** | Precision translational / biomarker | **Partially implemented** · HCA/GEO **Missing** | #95 | No invented biomarker performance |
| **M6** | Investigation orchestration | **Partially implemented** · planner/router **Missing** | #96 | Envelopes only |
| **M7** | Scientific evaluation | **Partially implemented** · science **Blocked** | #97 | SME gold #4 empty |
| **M8** | Living scientific intelligence | **Partially implemented** · change-detection **Missing** | #98 | Monitoring ≠ discovery complete |
| **M9** | Collaboration / federation | **Partially implemented** · federation **Missing** | #99, #100 | **Do not claim federation live** |
| **M10** | Experimental discovery | **Partially implemented** · lab **Missing** | #101, #105, #103, #104 | Not wet-lab / closed-loop |
| **M11** | Multiscale / biological model registry | **Skipped** / **Missing** | — | Do not claim simulation validation |
| **M12** | Therapeutic discovery | **Partially implemented** (PR1 contracts) | #107 | PR2+ **Missing** |
| **M13** | Translational development | **Partially implemented** (PR1 contracts) | #109 | PR2+ **Missing** |
| **M14** | RWE / clinical outcomes | **Partially implemented** / mostly **Fixture-only** | #111, #113, #114, #115 | No authorised clinical dataset; no PHI |
| **M15** | Human disease intelligence | **Partially implemented** / **Fixture-only** | #116–#120, #122, #123, #128 | Simulation fixture-only |
| **M16** | Human systems intelligence | **Partially implemented** / **Fixture-only** | #130, #132, #133, #135 | No duplicate registries |
| **M17** | Scientific programme intelligence | **Partially implemented** (PR1–4 on tip) · PR5 **in-flight** | #131, #137, #139, #140 · [#141](https://github.com/gnaneshwer23/hsi-core/pull/141) | Not autonomous discovery; no agent OS |
| **M18** | (brief assumes) | **Missing** | — | **No matrix, contracts, or PRs** — treat brief “1–18” as M1–M17 + substrate |

---

## 3. Capability register (M19 Phase 0)

### 3.1 Authentication & session

| Field | Finding |
|-------|---------|
| **Sources** | `src/server/neonAuthGateway.ts`, `src/server/vercelResearch.ts`, `site/src/pages/SignIn.tsx`, `SignUp.tsx`, `PasswordRecovery.tsx`, `ResearchAccount.tsx` |
| **API routes** | `/api/auth/*` (gateway), `/api/auth/diagnostics`, `/api/research/session-diagnostics`, `/api/research/account` |
| **DB** | Neon Auth provider + `hsi_research_access` (006), `hsi_reviewer_authority` (005) |
| **UI** | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/research/account` |
| **Tests** | Auth / session diagnostics harnesses; staging two-account **prep** only |
| **Runtime** | Auth A www session + researcher grant **user-confirmed** (2026-11-08) — **not** production `writesEnabled` |
| **Classification** | **Partially implemented** · full two-account / staging writes **Blocked** (#5) |

### 3.2 Organisation / tenant isolation

| Field | Finding |
|-------|---------|
| **Sources** | `src/researchOrganisationTenantSecurity.ts`, collaborative investigation contracts (M9) |
| **API / DB** | Grants on research access tables; **org membership not fully enforced** on all server paths |
| **Classification** | **Partially implemented** · federation **Missing** · live tenancy **Blocked** |

### 3.3 Research workbench & programmes

| Field | Finding |
|-------|---------|
| **UI** | `/research/dashboard`, `/research/decision-workbench`, `/research/mechanism-workflow`, `/research/scientific-workbench`, `/research/scientific-review`, specialist science pages |
| **API** | `/api/research/investigations`, `/api/research/interrogative/{id}` (+ submit-review, decision, graph-context, review-package, brief, revision, outcome), `/api/research/graph/ssc`, `/api/research/discovery/ssc`, scientific-review queue/history |
| **DB** | `hsi_research_investigation_runs` (004), `hsi_interrogative_*` (007/008), review delivery (015) |
| **Classification** | **Partially implemented** · R3 mapped · live Ask→export **Blocked** (`researcherJourneyCompleteClaimed=false`) |

### 3.4 Scientific evidence retrieval

| Field | Finding |
|-------|---------|
| **Sources** | Europe PMC, Open Targets, UniProt, ClinicalTrials.gov adapters; living-evidence expansion; N1 inventory |
| **Honesty** | Metadata-first; passages fail-closed until #2 rights; fixtures ≠ live |
| **Classification** | **Partially implemented** · passage depth **Blocked** (#2) · live journey **Blocked** (#5) |

### 3.5 Living knowledge graph

| Field | Finding |
|-------|---------|
| **Sources** | `src/livingHealthKnowledgeGraph.ts`, `src/graphRelease.ts`, `src/knowledgeGraph/`, LHKG migrations 011–014 |
| **DB** | `hsi_lhkg_nodes`, `hsi_lhkg_relationships`, `hsi_lhkg_dossiers`, investigation graph contexts |
| **RLS** | `ENABLE ROW LEVEL SECURITY` on LHKG tables (013) — **policies incomplete / ops Blocked** for live graph read path |
| **Rule** | Candidates must never silently become approved facts — eng path preserves this; live promotion **Blocked** |
| **Classification** | Logic **Partially implemented** · operational Neon graph **Blocked** |

### 3.6 Hypothesis & experiment registries

| Field | Finding |
|-------|---------|
| **Sources** | `src/evidence/hypothesisRegistry.ts`, experiment ledger (N7), M3/M10 contracts |
| **DB** | `hsi_evidence_ledger_records` (016), `hsi_experiment_ledger_records` (017) — applied on red-wave (Audit #6) |
| **Classification** | **Partially implemented** · real observation **Blocked** |

### 3.7 Agent orchestration (durable runtime)

| Field | Finding |
|-------|---------|
| **In-process** | `src/hsiAgentOrchestrator.ts` — deterministic, **no** DB/LLM/network; limitations explicitly state no persisted trace |
| **Site local** | `site/src/features/science/researchOrchestrator.ts` — in-memory typed graph; `createdAt: "not persisted"` |
| **Durable stack** | `hsiAgentDurableCheckpoint.ts`, `hsiNeonCheckpointStore.ts`, `hsiCheckpointedExecutor.ts`, migration 009 — **Implemented but unverified** / not wired to production orchestrator |
| **Restart recovery** | Operator recovery service exists; **operational recovery Missing** |
| **Classification** | Orchestration contracts **Partially implemented** · durable runtime **Not verified** · **do not** create a second orchestrator |

### 3.8 Therapeutic / clinical / RWE / simulation / programme intelligence

| Area | Classification | Notes |
|------|----------------|-------|
| Therapeutic (M12) | **Fixture-only** / Partial PR1 | Contracts only |
| Translational / trials (M13) | **Fixture-only** / Partial PR1 | Not trial authorisation |
| RWE / interop / cohort (M14) | **Fixture-only** | `blocked_no_authorised_clinical_dataset` |
| Disease / systems (M15–M16) | **Fixture-only** | No PHI; sim not validated |
| Programme intelligence (M17) | **Fixture-only** eng packs | PR1–4 on tip; PR5 in-flight |

### 3.9 Neon persistence

| Field | Finding |
|-------|---------|
| **Migrations** | `db/migrations/001`–`018` (+ `012_isi_research_review.sql`) |
| **Guard** | `neonGuard` refuses autumn-snow — **Verified operational** (policy) |
| **Staging / prod separation** | Staging writes residual; production writes **not** claimed |
| **Classification** | Schema **Partially implemented** · cross-tenant / restore / destructive-migration drills **Missing** / **Blocked** |

### 3.10 External connectors

| Source | Classification |
|--------|----------------|
| Europe PMC / Open Targets / UniProt / CT.gov | **Partially implemented** (live-capable adapters; honesty fail-closed) |
| Reactome | **Fixture-only** / thin |
| Authorised clinical systems | **Missing** / **Blocked** |
| Secrets in client | Must remain server-only — gateway pattern present |

### 3.11 Observability & performance

| Field | Finding |
|-------|---------|
| Observability | Local redaction / request controls; **no** OTel/Sentry/Datadog platform — **Partially implemented** / mostly **Missing** |
| Performance | No measured SLO baselines for M19 workloads — **Missing** |
| CI | `verify` = audit + check + pilot + site tsc/build + Playwright — **Partially implemented** (eng gate ≠ scientific validity) |

### 3.12 Public vs authenticated UX

| Surface | Examples | Risk |
|---------|----------|------|
| Public marketing / science | `/`, `/platform`, `/science/*`, `/products`, `/roadmap` | Roadmap must not read as live product capability |
| Authenticated research | `/research/decision-workbench`, dashboard, review | Fixture investigations vs live — honesty banners required |
| Synthetic | `/research/validation` | **Fixture-only** — never promote as clinical |

---

## 4. Integration dependency graph

```text
[Neon Auth] ──► [research grants 005/006] ──► [/api/research/*]
                      │
                      ▼
            [interrogative / investigation workspace]
                      │
        ┌─────────────┼─────────────────┐
        ▼             ▼                 ▼
 [evidence adapters] [LHKG / graphRelease] [review delivery 015]
        │             │                 │
        ▼             ▼                 ▼
 [ledgers 016/017] [candidates ≠ approved] [Gate C human-only]
        │
        ▼
 [M2–M10 eng services] ──compose-by-id──► [M12–M17 *Contracts packs]
        │
        ▼
 [hsiAgentOrchestrator in-process]  …separate…  [durable checkpoint 009 — not wired]
        │
        ▼
 [site research UI / R3 journey] ──blocked on──► human #5 live + #2 rights + #4 SME
```

**Compose, don’t fork:** M17 programme IDs must reference existing investigation / hypothesis / experiment / therapeutic / RWE ids — no parallel ledgers or second agent platform.

---

## 5. Architecture consolidation risks (Phase 1 input)

| Risk | Evidence | M19 action |
|------|----------|------------|
| Two orchestrators | `hsiAgentOrchestrator` + site `researchOrchestrator` | Keep both roles documented; **do not** invent a third; wire Ask→stages once |
| Durable vs in-process confusion | Checkpoint schema exists; in-process path claims no persistence | Harden **one** durable path; tests for restart/recovery before claiming durable |
| Contract sprawl without APIs | ~30 `*Contracts.ts` (M9–M17) | Versioned composition map; unavailable states in UI/API |
| Org contracts ≠ server enforcement | M9 tenant security module vs grant-only paths | Server + data-layer isolation tests |
| LHKG RLS without usable policies | Migration 013 | P0 before live graph claims |
| Duplicate programme ID namespaces | `hsi-tx-prog-*`, `hsi-td-prog-*`, `hsi-sp-prog-*` | ID-ref composition only |
| Public roadmap as product | `/roadmap`, experience pages | Demote eng roadmaps from primary authenticated UX |
| M18 assumed by brief | No artifacts | Document **Missing**; do not invent M18 |

---

## 6. P0 / P1 / P2 issue register

### P0 — release blocking (M19 DoD)

| ID | Issue | Status |
|----|-------|--------|
| P0-1 | Live authenticated Ask→Retrieve→…→Export + staging two-account (#5) | **Blocked** PARKED |
| P0-2 | Cross-tenant / privilege escalation not fully proven | **Partially implemented** / unverified |
| P0-3 | LHKG operational read/write with correct RLS policies | **Blocked** |
| P0-4 | Unauthorised graph promotion / Gate C bypass | Eng refuse intact; live HITL **Blocked** |
| P0-5 | Passage rights (#2) — deeper evidence without clearance | **Blocked** PARKED |
| P0-6 | Durable orchestration restart/recovery unverified | **Missing** operational proof |
| P0-7 | Fabricated / fixture science presented as live findings | Honesty present; UX consolidation still required |
| P0-8 | Production `writesEnabled` / secrets / autumn-snow refuse | Guard OK; production writes **not** enabled (correct) |

### P1 — high priority

| ID | Issue |
|----|-------|
| P1-1 | Connector reliability / live integration eval gated |
| P1-2 | Observability platform (correlation, metrics, alerts, runbooks) |
| P1-3 | Org/tenant enforcement on all scientific write paths |
| P1-4 | M12–M17 contract → service wiring or honest `unavailable` |
| P1-5 | M17 PR5 merge + remaining M17 PR6–14 only if still in programme scope |
| P1-6 | Performance baselines / SLOs |
| P1-7 | CI env separation + migration validation in pipeline |
| P1-8 | SME gold (#4) for any scientific acceptance claims |

### P2 — improvements

| ID | Issue |
|----|-------|
| P2-1 | Bun pin mismatch (CI 1.3.11 vs site-deploy 1.3.14) |
| P2-2 | Public page IA cleanup (dead demos, roadmap prominence) |
| P2-3 | Docs rollup refresh (M1–M17 tip SHAs) |
| P2-4 | Unrelated open PRs (#71, #61, #60, #34, #15) stay out of M19 track |

---

## 7. PR plan (from brief — Phase 17)

| PR | Title | Phase 0 binding note |
|----|-------|----------------------|
| **PR1** | Architecture and Dependency Audit | **This document** |
| PR2 | Unified Researcher Experience | After P0 map; no fake capability tiles |
| PR3 | Authentication and Tenant Isolation | Depends #5 ops + server enforcement |
| PR4 | API and Research Contract Consolidation | Compose M12–M17 ids; fail-closed empties |
| PR5 | Durable Orchestration Hardening | One orchestrator; restart tests required |
| PR6 | Living Graph Persistence and Review | RLS + candidate≠approved |
| PR7 | Scientific Service Integration | Honest unavailable for incomplete |
| PR8 | Database and Connector Reliability | red-wave only; no silent fixture swap |
| PR9 | Security and Privacy Hardening | Threat model; no compliance theatre |
| PR10 | Performance and Observability | Measure first |
| PR11 | CI/CD and Deployment Safety | Staging ≠ production |
| PR12 | End-to-End Scientific Workflow Verification | Live SSc — **Blocked** until P0-1 |
| PR13 | Recovery and Resilience Testing | After durable path |
| PR14 | Operational Acceptance and Release Readiness | No GO with P0 open |

Consolidate PRs where appropriate. **Do not auto-merge.**

---

## 8. Definition of Done — Phase 0 checklist

| Item | Done? |
|------|-------|
| Tip `main` pulled and SHA recorded | **Yes** `aa20df8` |
| M1–M17 classifications without assumption | **Yes** |
| M18 absence recorded | **Yes** |
| Capability table with sources / APIs / DB / UI / tests / runtime | **Yes** (§3) |
| Integration dependency graph | **Yes** (§4) |
| P0/P1/P2 register | **Yes** (§6) |
| Architecture consolidation risks for PR1+ | **Yes** (§5) |
| Live SSc E2E / release readiness | **No** — later phases |

---

## 9. Recommended immediate eng sequence

1. **Merge M17 PR5 [#141](https://github.com/gnaneshwer23/hsi-core/pull/141)** when CI green (human-gated merge) — closes in-flight gap/hypothesis portfolio contracts.  
2. Land **M19 PR1** (this audit) on `main`.  
3. **PR2–PR4** focus: UX honesty, auth/tenant server enforcement, API contract consolidation — not new science features.  
4. **PR5 durable** only with restart/recovery tests — do not claim durable until then.  
5. Keep human queue **#2 / #4 / #5 PARKED** — do not invent clearances.  
6. Do **not** declare M19 complete while any P0 remains.

---

## 10. Explicit non-claims

- Not scientifically validated.  
- Not production-ready.  
- Not federated discovery.  
- Not wet-lab / closed-loop.  
- Not durable agent runtime (until recovery tests pass).  
- Not CDS / PHI / Gate C auto-approve / invented MoU.  
- Not M18 delivered.  
- Not M19 complete.
