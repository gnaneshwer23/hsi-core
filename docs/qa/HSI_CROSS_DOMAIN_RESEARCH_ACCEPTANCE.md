# HSI cross-domain research acceptance

**Rule:** Do not mark a scenario **PASS** without execution evidence (logs, API traces, or staging E2E artifacts).  
**Date opened:** 2026-11-09  
**Production tip context:** public site fail-closed; research write spine not product-live.

---

## 1. Checklist (shared per scenario)

For each scenario A–F verify:

| # | Check | Evidence artifact |
|---|-------|-------------------|
| 1 | Entity recognition | NER / entity list in investigation payload |
| 2 | Ontology resolution | CURIE or registry hit / explicit miss |
| 3 | Source retrieval | PMID/DOI/pack ids with provenance |
| 4 | Evidence provenance | epistemic type + source link |
| 5 | Graph traversal | path nodes/edges returned |
| 6 | Mechanism analysis | mechanism object or honest gap |
| 7 | Contradiction detection | contradictions[] or “none found” with method |
| 8 | Research gap identification | gaps[] |
| 9 | Hypothesis governance | candidates not auto-approved |
| 10 | Research brief persistence | stored brief id + version hash |

**Statuses:** `NOT_EXECUTED` | `BLOCKED` | `FAIL` | `PASS`

---

## 2. Scenarios

### A — Tfh–IL-21–B-cell interactions in systemic sclerosis

| Field | Value |
|-------|-------|
| Domains | immune, autoimmunity, fibrosis |
| Disease context | systemic sclerosis (validation case) |
| Expected | Existing SSc pack / demo path should be strongest |
| Status | **NOT_EXECUTED** (full 10-check suite) |
| Notes | Illustrative homepage demo exists; not a substitute for staging E2E |

### B — Gut microbial metabolites and neuroinflammation

| Field | Value |
|-------|-------|
| Domains | gut, microbiome, neuroimmune |
| Disease context | optional |
| Status | **NOT_EXECUTED** |
| Blockers | Disease enum + planner SSc default; ontology bridges incomplete |

### C — Microglial activation and peripheral immune signalling

| Field | Value |
|-------|-------|
| Domains | neuroimmune, immune |
| Disease context | optional |
| Status | **NOT_EXECUTED** |
| Blockers | Same as B; educational graph has brain–immune question only |

### D — Metabolic inflammation and insulin resistance

| Field | Value |
|-------|-------|
| Domains | metabolic, immune |
| Disease context | optional (T2D may appear as condition label) |
| Status | **NOT_EXECUTED** |
| Blockers | Planner/disease enum; pack depth uneven |

### E — Tumour immune-cell states and treatment resistance

| Field | Value |
|-------|-------|
| Domains | cancer immunology, immune |
| Disease context | optional tumour context |
| Status | **NOT_EXECUTED** |
| Blockers | Oncology entity coverage sparse; no dedicated connector |

### F — Disease-independent cytokine signalling across tissues

| Field | Value |
|-------|-------|
| Domains | molecular signalling, multi-tissue |
| Disease context | **null required** |
| Status | **BLOCKED** until `diseaseContext` optional in create + graph context |
| Blockers | Hardcoded SSc focus; disease union excludes null |

---

## 3. Execution log template

```text
scenario: <A-F>
run_id: <uuid>
env: staging|local
git_sha: <sha>
started_at: <iso>
checks:
  entity_recognition: PASS|FAIL — <artifact>
  ontology_resolution: …
  …
overall: PASS|FAIL|BLOCKED
operator: <name>
```

Store completed runs under `docs/qa/runs/` (or CI artifacts) and link from this file.

---

## 4. Definition of done (platform)

A researcher can open **one** persistent HSI research workspace, ask a multi-domain biological question (disease optional), retrieve evidence with provenance, explore relationships, surface uncertainty, govern hypotheses, and export a traceable brief — **without** a separate app/backend per disease.

Until scenarios A–F have execution evidence, report coverage as **partial / in progress**, never universal.

---

## 5. Homepage illustrative demos (not acceptance evidence)

Public multi-scenario UI (`site/src/components/editorial/homeResearchScenarios.ts`) mirrors scenarios A/B/D/E/F as **illustrative** contracts under `docs/research-demonstrations/`. Switching tabs on the homepage does **not** count as PASS for this suite.
