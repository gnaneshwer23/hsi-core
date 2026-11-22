# HSI — What’s Been Built So Far

**As of:** 21 November 2026 (Europe/London)  
**Basis:** Founder / GitHub audit narrative for `gnaneshwer23/hsi-core`, reconciled to repository truth.  
**Honesty:** Distinguishes **implemented software**, **working demonstrations**, and **independently verified production** readiness. Engineering classifications ≠ scientific or production certification. HSI 1.0 verified acceptance remains **0 / 8**. No live CDS/PHI in `hsi-core`. Business pre-mortem is **not** treated as a release blocker.

**Cross-refs:** End-to-end vision soft-land [PR #596](https://github.com/gnaneshwer23/hsi-core/pull/596) (`HSI_END_TO_END_VISION_AND_USER_JOURNEY.md` once merged) · capability register [`../../operations/capability-register/capability-register.v1.json`](../../operations/capability-register/capability-register.v1.json) · Phase 1 agent soft-lands U24–U28.

---

## 1. Current build overview

| HSI component | What’s already built | Status (honesty) |
| --- | --- | --- |
| Public website | Homepage, platform explanation, scientific domains, audience pages, validation and trust | Substantial implementation; final deploy/visual QA may remain |
| Research Workbench | Investigation interface, evidence exploration, research briefs, local save/reopen | Substantial; durable server persistence owner-gated |
| Living Knowledge Graph | Biological entities, relationships, provenance, graph exploration | Implemented preview / candidates; clearance and coverage open |
| Cross-domain intelligence | Connected biological concepts and mechanism exploration | Foundations present; depth uneven |
| Evidence Intelligence | Source retrieval, provenance, Context Passport, comparison | Partial live; source clearance incomplete |
| Contradiction and gap analysis | Disagreement, contextual comparisons, knowledge gaps | Implemented UI / libraries; SME gold open |
| Hypothesis and experiment intelligence | Provisional hypotheses, testable questions, research outputs | Implemented UI; scientific evaluation open |
| Scientific verification | Evaluation harnesses, source checks, model assessment infrastructure | Infrastructure present; independent verification incomplete |
| Demo Research Universe | Multi-domain scenarios, synthetic cohorts, omics demos | Built; curated/synthetic labels required |
| Researcher dashboards | Academic, biotech, clinical, laboratory, community interfaces | Mix of real workbench + demo shells |
| Authentication and persistence | Sign-in, permission controls, storage infrastructure | Present; production writes fail-closed / migrations held |
| Scientific Companion / Avatar | Text-first companion turns on KG/interrogative path (`/research/companion`, U41) + caller-supplied live-evidence binding (U42); voice/avatar still proposed | **Partial** — text-first + bind soft-land; companion does not retrieve; avatar/voice not journey-accepted |
| Research networking and opportunities | Early community interfaces; matching / opportunity discovery | Demo / **proposed** — not live matching |

The capability register tracks **49** capabilities (`asOf` 2026-11-21). A narrative rollup cited for this audit is **18 implemented · 29 partial · 2 stub**. Those are **engineering classifications**, not production certification. Counts can lag merges; always prefer the register JSON + this honesty table over marketing claims.

---

## 2. Latest progress — additional work on `main`

### Verified tip (reconcile)

| Reference | Commit | Note |
| --- | --- | --- |
| Audit narrative tip (earlier today) | `6282d1e79` — U25 tool fence (#594), ~15:40 UTC | Correct at time of earlier audit |
| **Current `main` tip at soft-land** | `0dda74d7` — U26 fingerprint versioning (#595) | Advanced after U25 |
| Open (not yet main) | U27 fenced tool caller (#597); end-to-end vision (#596) | Do not treat as merged until they land |

### Recent engineering (agent / reliability)

| PR | Change | Honesty |
| --- | --- | --- |
| #588–#590 | More consistent frontend / API error handling | Reliability / honesty envelopes — not scientific validation |
| #593 | Agent checkpoint resume and reconciliation (U24) | Soft-land; live multi-process E2E open |
| #594 | Agent tool fence + orphan RUNNING refuse (U25) | Soft-land; live agents not approved |
| #595 | Fingerprint versioning + revision-round contract (U26) | Soft-land; no hash rewrite / no DB revisions |

These strengthen **operational reliability** of agent execution and failure handling. They do **not**, by themselves, establish that AI agents are scientifically validated.

---

## 3. What is actually working in the scientific experience?

A researcher can explore a substantial portion of the intended investigation journey via the research workspace and Demo Research Universe.

| Journey slice | Position |
| --- | --- |
| Ask a research question | **Implemented UI** — question entry and scenario workflows |
| Inspect scientific evidence | **Partial live** — references, provenance, Context Passport |
| Explore the knowledge graph | **Implemented preview** — relationships and cross-domain candidates |
| Compare conflicting evidence | **Implemented UI** — supporting / conflicting / not comparable |
| Identify gaps and hypotheses | **Implemented UI** — provisional hypotheses, gaps, testable questions |
| Generate a research brief | **Implemented UI** — evidence-linked summaries with limitations |
| Save and reopen investigations | **Device-local** — local persistence; approved durable server storage outstanding |

**Demo Research Universe:** six scenarios (gut–immune–metabolic, neuroimmune, immunology, multi-omics, tissue biology, disease mechanisms). Findings deliberately labelled curated or synthetic where applicable.

---

## 4. What’s not built yet from the newest vision?

| Proposed capability | Current position |
| --- | --- |
| Conversational Scientific Companion | Text-first U41 soft-land on interrogative KG path; deeper live-evidence conversation + avatar still open |
| Real-time Nuance-style avatar | **Not implemented** |
| Conversational dataset critique | Analysis components exist; integrated experience **not established** |
| Cross-domain AI discussion | Graph/investigation foundations exist; conversational orchestration **not established** |
| Researcher and laboratory matching | **Not** a live service |
| Company collaboration discovery | **Not** a live service |
| Verified internships, fellowships, work opportunities | **Not** a live matching service |
| Scientific community and networking | Demo interfaces; operational community **not verified** |
| Shared collaborative research rooms | **Not** verified production-ready |

---

## 5. What remains before general production use?

HSI 1.0 acceptance still records **0 of 8** criteria independently verified, despite substantial implementation.

Major outstanding requirements:

- Real source clearance  
- Scientific benchmarking  
- Authenticated staging journeys  
- Secure durable persistence  
- Cross-user isolation  
- Researcher pilot acceptance  

Internal business pre-mortem is **not** a release blocker for this assessment.

---

## Overall assessment

HSI is well beyond an idea or basic prototype: sizeable codebase, merged public experiences, scientific graph foundation, evidence-processing components, agent infrastructure, and connected research demonstrations.

The newest vision adds three significant areas **not** yet fully implemented:

1. **Conversational scientific intelligence** — evidence-grounded companion with optional voice/avatar  
2. **Research collaboration intelligence** — matching scientists, labs, companies, projects  
3. **Research opportunity intelligence** — verified funding, placements, careers, collaboration opportunities  

### Recommended next milestone (binding build filter)

1. **Finish production hardening** of the existing scientific engine (workspace reliability, evidence/KG honesty, ARCH-009 agent durable execution, security, staging acceptance path). **Owner approved research-agent runtime (U35), live scientific platform (U37), and preview-evidence runners (U40)** — staging grant / restricted-preview GO and GA still open.  
2. **Scientific Companion text-first** soft-landed (**U41**, 21 Nov 2026) on KG/interrogative services; **U42** binds caller-supplied live-evidence metadata into turns (no companion network retrieval). Voice/avatar remain Phase 3.  
3. **Then** research networking and opportunity matching using the same scientific context.

Extend what is already built — do **not** start another disconnected platform. Do **not** delay scientific-engine validation to finish avatar or networking (aligns with end-to-end vision Phases 1–2 in PR #596).
