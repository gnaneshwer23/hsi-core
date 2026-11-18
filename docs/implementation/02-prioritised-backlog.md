# Phase 0 — Prioritised engineering backlog

**Audited:** 18 November 2026 · follows [`01-gap-matrix.md`](./01-gap-matrix.md)  
**Rule:** small PRs; reuse existing modules; no production write enablement or held-migration batch apply without owner packet.

---

## First deliverable (this PR)

Phase 0 audit package only:

- [`HSI_MASTER_E2E_PRODUCT_BUILD_SPEC.md`](./HSI_MASTER_E2E_PRODUCT_BUILD_SPEC.md)  
- [`00-current-state.md`](./00-current-state.md)  
- [`01-gap-matrix.md`](./01-gap-matrix.md)  
- This backlog  

**No production behaviour changes.**

---

## Proposed first *safe implementation* PR (after this audit merges)

### PR-E2E-01 — Investigation workspace Context Passport default panel (P1, safe)

| Field | Detail |
| --- | --- |
| **Purpose** | Make the Biological Context Passport visible on the primary investigation workspace path without enabling writes or new infrastructure |
| **Reuse** | `EvidenceContextPassportView`, `buildEvidenceContextPassport`, `InvestigationGraphExperience` / investigation edge selection already in repo |
| **Change** | Ensure the default investigation workspace (authenticated or demo-honest) always surfaces a passport for the selected edge/claim; empty/missing fields remain explicit; no invented context |
| **Avoid** | New DB, new microservice, homepage redesign, production `writesEnabled` |
| **Tests** | Component/unit for missing-field honesty; Playwright assert passport heading on investigation graph path |
| **Security** | Read-only UI; no client-supplied identity trust change |
| **Exit** | Researcher can inspect context passport during an investigation without leaving the workbench |
| **Next dependency** | PR-E2E-02 (staging isolation run packet) or PR-E2E-03 (brief columns = passport fields) depending on owner availability for #2/#5 |

**Why this first (not homepage):** founder priority shift — scientific workflow is the product centre. Passport is the named USP differentiator and already has library+UI partials; wiring it into the default path is high leverage and fail-closed safe.

### Alternatives if owner prefers P0 trust first

| ID | Scope | When to prefer |
| --- | --- | --- |
| **PR-E2E-01b** | Staging isolation suite live-mode runbook + CI-safe check remains default-off | Security owner ready with disposable Neon pins |
| **PR-E2E-01c** | Access-request delivery configured documentation + staging dry-run worksheet (no fake success) | Ops wants enquiry path hardened before UX |
| **PR-E2E-01d** | Merge #465/#466 (vision + ten-system map) then continue | Doctrine not yet on `main` |

---

## Sequenced backlog (implementation PRs)

| Order | ID | Priority | Scope | Depends on | Exit |
| --- | --- | --- | --- | --- | --- |
| 0 | **Phase 0 audit** | — | This documentation | — | Gap matrix agreed |
| 1 | **PR-E2E-01** | P1 | Passport on default investigation path | Audit | Passport visible + tested |
| 2 | **PR-E2E-02** | P0 | Owner-run staging isolation acceptance packet (no hold removal) | Security owner | Signed scope evidence or explicit defer |
| 3 | **PR-E2E-03** | P0 | Source clearance composition over existing receipts (#442 decision) | Policy owner | Retrieval blocked without clearance |
| 4 | **PR-E2E-04** | P1 | Single workbench nav reconnect (do not rebuild) | — | One primary Ask→evidence→graph→verify→brief path |
| 5 | **PR-E2E-05** | P1 | Staging-only investigation save/resume under fail-closed gates | #5 + isolation | Owned investigations list for granted user |
| 6 | **PR-E2E-06** | P1 | Dual-provider verification staging bind + abstention UI honesty | Providers + #4 start | Harness runs against real deployments without claiming gate pass |
| 7 | **PR-E2E-07** | P1 | Research brief = passport columns + verification status + limitations | 01, 05, 06 | Exportable source-linked brief |
| 8 | **PR-E2E-08** | P2 | Server onboarding profile (additive store; 023 packet or alternative) | Auth grant model | Resumable onboarding not only localStorage |
| 9 | **PR-E2E-09** | P2 | Premium public pages (Researchers/Biotech/Validation comps → routes) | #465 brand | Spec eight-page IA without fake metrics |
| 10 | **PR-E2E-10** | P1 | SME gold authoring/vault workflow toward 60→120 cases | Humans | Adjudicated cases exist |
| 11 | **PR-E2E-11** | P3 | Hypothesis intelligence (labelled later) | 1.0 E2E accepted | Validation-gated only |

---

## Explicit non-goals until evidenced

- Separate graph database, vector database, or Kubernetes  
- Replacing Neon Auth for UI cosmetics  
- Enabling production writes from a green PR alone  
- Claiming scientific superiority without comparative evaluation  
- Six separate domain applications  

---

## Release posture

HSI 1.0 release candidate requires: journeys A–F from the master spec passing in staging, tenant denial proven, provenance intact, verification evaluation reported with limitations, monitoring/rollback present, and **explicit human production approval**.
