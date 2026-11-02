# HSI Claim Provenance Schema (§6.19)

**Document status:** Illustrative structured-claim contract for CDR  
**Aligns:** [`HSI_EVIDENCE_CATEGORY_SPECIFICATION.md`](./HSI_EVIDENCE_CATEGORY_SPECIFICATION.md) · [`HSI_EVIDENCE_VERIFICATION_DESIGN.md`](./HSI_EVIDENCE_VERIFICATION_DESIGN.md) · hsi-core grades / Gate C · ISI `claim_support`  
**Status:** Schema **Proposed** (illustrative). Existing grades/Gate C paths **Verified** patterns — map, do not fork.

---

## Purpose

Every important claim in a cross-domain reasoning output should be a **structured assertion** with provenance, evidence category, uncertainty, and review status — not free-text alone.

This is an **illustrative** schema for product contracts and M1 brief artifacts. It is **not** a verified scientific claim and **not** a mandate to migrate `kg.json` overnight.

---

## Required fields (§6.19)

| Field | Type (illustrative) | Notes |
|-------|---------------------|-------|
| `id` | string | Stable claim identifier |
| `text` | string | Human-readable claim statement |
| `subject` | entity ref | Type + id/label |
| `predicate` | string | Controlled vocabulary preferred |
| `object` | entity ref | Type + id/label |
| `evidence_category` | enum 1–5 | Binding categories — never omit |
| `supporting_sources` | source[] | PMID/DOI/URI + retrieval time |
| `contradictory_sources` | source[] | Retained; no majority-vote delete |
| `context` | object | Population, model, tissue, disease stage, etc. |
| `temporal_scope` | object | Event/as-of windows where relevant |
| `uncertainty` | object/string | Qualitative; no fake % |
| `review_status` | enum | See below |
| `generation_method` | string | human_curated · extracted · tool · llm_draft · computational |
| `version` | string | Claim version / content hash |

### Optional but recommended

`causality_established` (bool) · `patient_specific` (bool) · `plane` · `graph_edge_ids[]` · `hsi_grade` · `isi_evidence_status` · `gate_c_row_id`

---

## Illustrative YAML

```yaml
claim:
  id: "example-claim-001"
  text: "Inflammatory signalling is associated with insulin resistance in published cohorts."
  evidence_category: "statistical_association"

  subject:
    type: "biological_process"
    label: "Inflammatory signalling"

  predicate: "associated_with"

  object:
    type: "phenotype"
    label: "Insulin resistance"

  supporting_sources: []
  contradictory_sources: []

  context:
    study_context: "To be populated from verified sources"
    population: null

  temporal_scope: null

  uncertainty: "Requires evidence review"
  review_status: "unreviewed"
  generation_method: "illustrative_schema"
  version: "0"

  interpretation:
    causality_established: false
    patient_specific: false
```

**Illustrative only** — empty `supporting_sources` must never ship as “supported” in product output.

---

## Review status (proposed enum)

| Status | Meaning | Gate |
|--------|---------|------|
| `unreviewed` | Draft / extracted | Not public authority |
| `check_passed` | Identifiers resolved (Cite Check) | Check ≠ support |
| `support_assessed` | Human `claim_support` set | Still may be reject |
| `approved` | Curator/reviewer approved for surface | Gate C Approve |
| `rejected` | Failed review | Retained for audit |
| `unvalidated` | Hypothesis lifecycle | Cap 15 / Workflow E |
| `superseded` | Replaced by newer claim version | Keep lineage |

Aligns with Gate C honesty: **Check ≠ supports ≠ Approve ≠ CDS** ([verification design](./HSI_EVIDENCE_VERIFICATION_DESIGN.md)).

---

## Versioning

| Layer | Practice |
|-------|----------|
| Claim `version` | Bump on text/category/source change; keep prior versions for audit |
| Graph / pack pin | M1 briefs pin ISI graph version + hsi pack commit |
| Retrieval time | Store when source was fetched (staleness) |
| Schema version | `claim_schema_version` on brief envelopes |

Silent overwrite of approved claims is **forbidden**.

---

## Link to Gate C / hsi-core grades

| Existing asset | Role vs claim schema |
|----------------|----------------------|
| hsi-core `grades` / seed claims | Authority for pack-published graded edges — map into `evidence_category` + `hsi_grade` |
| Gate C queue | Promotion path for research cites; `autoApprove=false` **Verified** |
| Cite Check | Populates identifier verification → `check_passed` |
| ISI Neon `claim_support` | Human support assessment |
| ISI `evidence_status` | Bridge via ADR (LHK-G Deliverable 5) — not silent rename |
| `cdsPhiBoundary` | Claims must remain non-PHI / non-CDS on research surfaces |

**Do not** invent a second evidence DB. Claims are a **logical contract** over hsi-core + ISI curation + clinical provenance objects.

---

## Envelope for reasoning outputs

```yaml
reasoning_output:
  question_id: "..."
  claim_schema_version: "0-proposed"
  claims: []          # each with evidence_category
  gaps: []
  contradictions: []
  review_required: true
  planes_touched: ["P0", "P1"]
```

Clinical envelopes add authz purpose and **must not** embed identifiable payload into research claim stores.

---

## Acceptance

- M1 Biomedical Discovery Brief uses claim objects with categories 2–5 (no Cat 1 PHI).  
- Eval measures unsupported-claim rate against this structure.  
- Founder Phase 1: freeze enum names before code generation.

**Stop.** Schema docs only — no DB migration in this pack.
