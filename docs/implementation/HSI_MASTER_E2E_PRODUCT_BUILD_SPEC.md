# HSI — Master End-to-End Product Build Specification

**Frozen:** 18 November 2026 (Europe/London) — permanent execution reference  
**Objective:** Complete and integrate **existing** `hsi-core` into one production-ready scientific intelligence product — public site → onboarding → workbench → verification → briefs → return.  
**Do not:** build a replacement platform, parallel database, disconnected frontend, or six domain apps.

**North star:** definitive product vision (PR #465 → `docs/strategy/HSI_DEFINITIVE_PRODUCT_VISION.md` when merged; until then `docs/strategy/HSI_VISION.md`)  
**Technology:** ten-system architecture (PR #466 → `docs/architecture/HSI_TECHNOLOGY_ARCHITECTURE_TEN_SYSTEMS.md` when merged)  
**Phase 0 audit:** [`00-current-state.md`](./00-current-state.md) · [`01-gap-matrix.md`](./01-gap-matrix.md) · [`02-prioritised-backlog.md`](./02-prioritised-backlog.md)

---

## Final experience (one workflow)

| Step | Journey | Outcome |
| --- | --- | --- |
| 01 | Discover HSI | Premium website and scientific use cases |
| 02 | Create account | Secure signup, email verification, consent |
| 03 | Researcher onboarding | Role, interests, first investigation |
| 04 | Research Workbench | Ask a scientific question; launch investigation |
| 05 | Scientific Intelligence | Evidence, mechanisms, context comparison |
| 06 | Scientific Verification | Support, disagreement, uncertainty |
| 07 | Research Results | Inspect evidence; save investigations; briefs |
| 08 | Return & Continue | Resume, compare, track changes |

Six domains share this workflow. They are not separate applications.

**Priority shift (binding):** a working scientific investigation is the product centre. Premium homepage still matters (P2), but must not outrank authentication, persistence, provenance, Context Passport, verification, or the Ask→brief path.

---

## Phases (do not run all in one agent turn)

| Phase | Focus |
| --- | --- |
| 0 | Repository audit — evidence-based; no production changes |
| 1 | Premium public website (eight pages; preserve redirects) |
| 2 | Authentication + researcher onboarding |
| 3 | Authenticated researcher dashboard |
| 4 | Scientific investigation workbench |
| 5 | Evidence and data pipeline |
| 6 | Biological Context Intelligence Engine |
| 7 | Knowledge graph and mechanism intelligence |
| 8 | Verification and contradiction intelligence |
| 9 | Research brief and scientific decision memory |
| 10 | Backend and database reliability |
| 11 | Infrastructure and DevOps |
| 12 | End-to-end product testing |
| 13 | Scientific and product validation (≥60 expert cases toward 120-slot profile) |
| 14 | Release readiness (explicit human approval before production) |

---

## Execution sequence (anti-waste)

1. **Audit** (Phase 0) — gap matrix only.  
2. **Critical foundations** — auth, persistence, provenance, verification eval, CI.  
3. **Complete user journey** — website → signup → onboarding → dashboard → first investigation.  
4. **Complete scientific workflow** — evidence → Context Passport → mechanism → contradiction → verification → brief.  
5. **Redesign and release candidate** — premium design system + security/science gates; no auto-deploy.

---

## Priority bands

| Priority | Work |
| --- | --- |
| **P0** | Authentication, persistence, source provenance, CI |
| **P1** | Complete investigation journey; Biological Context Passport; verification reliability |
| **P2** | Premium website and onboarding; research briefs and saved investigations |
| **P3** | Advanced hypothesis and experimental intelligence |

---

## Non-negotiables

- Reuse existing APIs, Neon red-wave, Vercel, durable jobs, verification harness.  
- No Gate C auto-approve, no live CDS/PHI in `hsi-core`, no invented MoU.  
- No separate graph/vector DB or Kubernetes without evidenced need.  
- Never treat AI hypotheses as established biology.  
- Never mark incomplete work complete; never bypass scientific or security gates.  
- Small testable PRs with purpose, reuse, tests, limitations, next dependency.
