# Milestones M1–M13 — Status Rollup

**Date:** 2026-11-09  
**Audited `main` tip:** `7485bd4` (includes M12 PR1 via [#107](https://github.com/gnaneshwer23/hsi-core/pull/107))  
**Repo:** [gnaneshwer23/hsi-core](https://github.com/gnaneshwer23/hsi-core)  
**HSI Neon:** red-wave only — never autumn-snow / Akeno / DeliverX  

Honesty freeze: no Gate C auto-approve · no invented MoU · no live CDS/PHI · fixtures ≠ live · CI ≠ scientific validity · federation / lab / closed-loop claims only when verified · human queue #2 / #4 / #5 PARKED.

---

## Summary table

| Milestone | Title | Eng on `main` | Classification | Key PRs | Notes |
|-----------|-------|---------------|----------------|---------|-------|
| **M1** | Biomedical evidence / retrieval | Europe PMC, OT, UniProt, CT.gov, dynamic persistence, living-evidence | **Partial** · live journey **Blocked** (#5) · passages **Blocked** (#2) | Backend SI #72–#89; D2D #87; OT #84; UniProt #88 | Public metadata OK; not scientifically complete |
| **M2** | Contextual reasoning / contradiction | Structured comparison + contradiction investigation | **Partial** | [#90](https://github.com/gnaneshwer23/hsi-core/pull/90), [#92](https://github.com/gnaneshwer23/hsi-core/pull/92) | Eng contracts shipped; science unverified |
| **M3** | Hypothesis / experiment registry | Hypothesis registry + N7 ledger eng | **Partial** · real observation **Blocked** | [#91](https://github.com/gnaneshwer23/hsi-core/pull/91) | Registry ≠ experimental validation |
| **M4** | Translational failure intelligence | Translational contracts + failure taxonomy | **Partial** | [#93](https://github.com/gnaneshwer23/hsi-core/pull/93), [#94](https://github.com/gnaneshwer23/hsi-core/pull/94) | Phases 3–8 open |
| **M5** | Precision translational / biomarker | Precision evidence contracts | **Partial** · HCA/GEO **Missing**/`not_connected` | [#95](https://github.com/gnaneshwer23/hsi-core/pull/95) | No invented biomarker performance |
| **M6** | Investigation orchestration | Capability + investigation contracts | **Partial** · planner/router **Missing** | [#96](https://github.com/gnaneshwer23/hsi-core/pull/96) | Orchestration envelopes only |
| **M7** | Scientific evaluation | Benchmark registry | **Partial** · scored evaluators **Missing** · science **Blocked** | [#97](https://github.com/gnaneshwer23/hsi-core/pull/97) | CI ≠ scientific validity |
| **M8** | Living scientific intelligence | Incremental evidence monitoring | **Partial** · change-detection **Missing** | [#98](https://github.com/gnaneshwer23/hsi-core/pull/98) | Monitoring ≠ discovery complete |
| **M9** | Collaboration / federation | Org/tenant + collaborative investigation | **Partial** · federation **Missing** · partnerships **Blocked** | [#99](https://github.com/gnaneshwer23/hsi-core/pull/99), [#100](https://github.com/gnaneshwer23/hsi-core/pull/100) | **Do not claim federation live** |
| **M10** | Experimental discovery | Lifecycle + design + protocol + governed compute | **Partial** · lab adapters **Missing** · closed-loop **Missing** | [#101](https://github.com/gnaneshwer23/hsi-core/pull/101), [#105](https://github.com/gnaneshwer23/hsi-core/pull/105), [#103](https://github.com/gnaneshwer23/hsi-core/pull/103), [#104](https://github.com/gnaneshwer23/hsi-core/pull/104) | Eng stack on main; not wet-lab / closed-loop |
| **M11** | Multiscale / biological model registry | — | **Skipped** / **Missing** | none | No M11 PR opened; do not claim simulation validation |
| **M12** | Therapeutic discovery | Phase 0 + data contracts (programme/target/intervention/assessment) | **Partial** (PR1 only) · later PRs **Missing** | [#107](https://github.com/gnaneshwer23/hsi-core/pull/107) **merged** → `7485bd4` | Not efficacy/repurposing/preclinical decision complete |
| **M13** | Translational development / trial concept / biomarker | Phase 0 + PR1 contracts (this delivery) | **Partial** / **in-flight** until PR1 merges · PR2+ **Missing** | M13 PR1 on `eng/m13-pr1-and-milestones-rollup` | Research decision support only — not trial authorisation |

---

## Cross-cutting status

| Area | Classification | Notes |
|------|----------------|-------|
| Human queue #2 Rights | **Blocked** (PARKED) | Passage-grounded entailment |
| Human queue #4 SME gold | **Blocked** (PARKED) | Scored usefulness |
| Human queue #5 Live journey | **Blocked** (PARKED) | Real E2E validation |
| Neon (HSI red-wave) | **Partial** · staging **Blocked** (#5) | Contracts-first migrations deferred on late M* PRs |
| Research Decision Workbench | **Partial** | Exists; M10–M13 UI deepen deferred |
| Lab / instrument adapters | **Missing** | No verified connectors |
| Federated discovery | **Missing** | M9 contracts ≠ live federation |
| Gate C / MoU / PHI/CDS | Refused | Boundary intact — do not invent |
| SEO / Google discovery (.tech) | Docs/SEO merged (#106/#108) | GSC property verification remains **manual** |
| immunecity open PRs | [#1](https://github.com/gnaneshwer23/immunecity/pull/1) open (architecture) | Not HSI milestone track; SEO already shipped separately — **skipped** |

---

## Merged milestone / track PRs (selected)

| PR | Merge SHA (squash) | Topic |
|----|--------------------|-------|
| #90 | `7c80188…` | M2 structured evidence comparison |
| #91 | `4056f1c…` | M3 hypothesis registry |
| #92 | `fc41369…` | M2 contradiction investigation |
| #93 / #94 | `915f0ca…` / `868431c…` | M4 translational + failure taxonomy |
| #95 | `4d7e83a…` | M5 precision evidence |
| #96 | `4e4f9db…` | M6 investigation orchestration |
| #97 | `7777f6d…` | M7 benchmark registry |
| #98 | `5ca518f…` | M8 incremental monitoring |
| #99 / #100 | `2388387…` / `6eb37fe…` | M9 org/tenant + collaborative |
| #101 / #105 / #103 / #104 | `90a2d70…` / `89821f2…` / `f980d47…` / `ebabd52…` | M10 PR1–PR4 |
| #106 / #108 | `6cb780c…` / `5022fe4…` | OpenSEO map + .tech Google discovery |
| **#107** | **`7485bd4`** | **M12 PR1 therapeutic discovery data contracts** (merged this audit) |

Original #102 closed without merge; content restored via #105.

---

## Open PRs intentionally not merged

| PR | Why skipped |
|----|-------------|
| #71 Landing redesign | Unrelated to M1–M13 eng track |
| #61 P1.4 dossiers | Stale product track — not current milestone stack |
| #60 P1.3 SSc–RA comparison | Stale product track |
| #34 Body explorer | Science 2.0 — not M* stack |
| #15 Stage B preflight | verify **FAILURE**; stale |
| immunecity #1 | Architecture v1 — not HSI milestone / SEO track |

---

## Matrices on disk

| File | Role |
|------|------|
| [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) … [`MILESTONE10_…`](./MILESTONE10_EXPERIMENTAL_DISCOVERY_MATRIX.md) | Phase 0 audits (M2–M10) |
| [`MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md`](./MILESTONE12_THERAPEUTIC_DISCOVERY_MATRIX.md) | M12 Phase 0 + PR1 |
| [`MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md`](./MILESTONE13_TRANSLATIONAL_DEVELOPMENT_MATRIX.md) | M13 Phase 0 + PR1 |
| [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) / [`BACKEND_SCIENTIFIC_INTELLIGENCE_BRIEF_STATUS.md`](./BACKEND_SCIENTIFIC_INTELLIGENCE_BRIEF_STATUS.md) | Backend SI |
| [`DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md`](./DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md) | D2D / omics honesty |

No `MILESTONE11_*` matrix — M11 **Skipped**.

---

## What remains

1. **M13 PR1** — merge when CI green (this branch).  
2. **M13 PR2+** — Translational Readiness Assessment, biomarker COU, population, CT.gov deepen, trial/statistical design, feasibility, strategy engine, workbench, SSc validation.  
3. **M12 PR2+** — pharmacology integration, prioritisation, repurposing envelopes, preclinical decision bind.  
4. **M11** — open only if/when biological model registry is intentionally started.  
5. **Human queue #2/#4/#5** — PARKED; blocks live scientific claims.  
6. **GSC for humansuperintelligence.tech** — manual Search Console verification.  
7. Do **not** claim clinical trial readiness, federation, lab integration, or closed-loop discovery from eng CI alone.

**Suggested next eng:** M13 PR2 Translational Readiness Assessment.
