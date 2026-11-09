# HSI domain-independence audit

**Date:** 2026-11-09  
**Repo tip at audit:** `864710a` (re-verify on merge)  
**Goal:** Find disease-specific assumptions without removing SSc capabilities.

---

## 1. Summary

| Area | Finding | Severity |
|------|---------|----------|
| Interrogative planner | `planSscInterrogation` hardcodes `focus: "systemic_sclerosis"` | **P0 schema** |
| Graph context types | Disease union only `systemic_sclerosis \| rheumatoid_arthritis` | **P0 schema** |
| Investigation workspace | SSc-centric defaults / naming | **P1** |
| Homepage product demo | Single `demo_ssc_fibrosis_001` path | **P1 UX honesty** |
| Domain educational graph | Already multi-domain (gut/neuro/metabolic/immune) | OK baseline |
| Discovery packs | SSc + RA + gut/neuro packs coexist | OK pattern |
| Public routes | Not disease-locked | OK |
| CDS / PHI | Correctly out of scope | OK |

---

## 2. Hardcoded / disease-narrow implementations

### 2.1 Investigation create path

- **File:** investigation workspace / interrogative planning services (search: `planSscInterrogation`, `systemic_sclerosis`).  
- **Issue:** Creating an investigation implies SSc focus even when the scientific question is domain-general.  
- **Preserve:** SSc preset + SSc dual-track MVP packs.  
- **Fix:** Introduce `planInterrogation({ question, domains, diseaseContext? })`; keep `planSscInterrogation` as thin wrapper.

### 2.2 Released evidence / graph context disease enum

- **Files:** `investigationGraphContext` types + service; `ReleasedEvidenceBundle.disease` (or equivalent).  
- **Issue:** Only SSc and RA accepted → blocks gut–neuro / metabolic / oncology / disease-independent cytokine scenarios at type level.  
- **Fix:** `diseaseContext: string | null` + `scientificDomains: string[]`; validate against ontology registry, not a two-value union.

### 2.3 Homepage demo

- **File:** `HomeProductDemo` / demo data modules.  
- **Issue:** One SSc fibrosis narrative reads as product boundary.  
- **Fix:** Multi-scenario selector; each scenario declares `coverage: illustrative | pack_backed | staging_verified` and `live_backend: false` until proven.

### 2.4 Naming / marketing copy

- Scan marketing pages for “only systemic sclerosis” or sole-disease framing.  
- Eight-domain homepage ecosystem must stay; copy should say SSc is a validation case.

---

## 3. What is already domain-capable

| Asset | Evidence |
|-------|----------|
| Domain graph domains | Immune, gut, neuroimmune, metabolic, etc. |
| Investigation questions (educational) | Gut–T2D, T1D, immune, brain–immune |
| Pack pattern | Multiple disease/domain packs without separate backends |
| Agent orchestration schema | Durable; not disease-locked at runtime table level |
| Evidence epistemic types | Cross-cutting |

---

## 4. Required schema changes (ordered)

1. Optional `diseaseContext` on investigation create + persist.  
2. `scientificDomains[]` + `biologicalEntities[]` first-class.  
3. Widen graph-context disease field; migration for existing SSc/RA rows.  
4. Rename SSc-only planner; update tests.  
5. Programme / research brief schemas accept multi-domain tags.  
6. Capability status / honesty asserts for “coverage depth ≠ universal”.

---

## 5. Security & governance implications

- Wider entity scope increases retrieval surface — keep fail-closed writes.  
- Cross-domain does **not** justify PHI in hsi-core.  
- Hypothesis promotion remains human-gated.  
- Public demos must not imply staging write enablement.

---

## 6. Implementation order (engineering)

1. Docs (this pack) + homepage multi-scenario (illustrative).  
2. Type/schema widening + unit tests (SSc regression + disease-null case).  
3. Planner generalisation.  
4. Ontology CURIEs on domain-graph nodes.  
5. Staging acceptance scenarios A–F with execution logs.  
6. Public coverage badges from measured pack depth.

---

## 7. Do not

- Delete SSc research programmes or demos.  
- Spin up per-disease backends.  
- Mark acceptance scenarios PASS without run evidence.  
- Claim universal biology coverage.
