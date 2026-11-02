# HSI Data Provenance and Quality (§7.16–7.20)

**Document status:** Definitive provenance, quality, freshness, and conflict policy (§7)  
**Adopted:** 2 November 2026  
**Aligns:** [`HSI_CLAIM_PROVENANCE_SCHEMA.md`](./HSI_CLAIM_PROVENANCE_SCHEMA.md) · Gate C · Aksh SHIELD patterns

---

## 7.16 Provenance fields (minimum)

Every integrated fact, claim, or observation exposed to users or agents must carry:

| Field | Applies to | Notes |
|-------|------------|-------|
| `sourceSystem` | All | e.g. PubMed, CTG, pack id, FHIR server, Aksh connector |
| `sourceId` | All | PMID, NCT, resource id, edge id |
| `retrievedAt` / `observedAt` | All | Distinguish observation time vs retrieval time |
| `sourceVersion` | Snapshots / packs | Pack commit, ontology release, API etag if any |
| `licence` / `useConstraints` | Redistributed data | Short code + URL if needed |
| `reviewStatus` | Evidence / maps | unreviewed / checked / approved / rejected |
| `claimType` / `evidence_category` | Scientific claims | Cats 1–5 — never collapse |
| `plane` | All | P0–P3 |
| `synthetic` | Clinical/PGHD | Required when fixture |
| `actor` / `purpose` | Clinical access | Audit |

Pack-grade edges additionally use hsi-core grades + Gate C decision records.

---

## 7.17 Lineage

```
Raw source record
  → ingest job / human import (tool id, run id)
  → normalised record (schema version)
  → optional map (terminology mappingVersion)
  → governed artifact (Gate C / HITL decision)
  → product surface / X-* response (request id)
```

Lineage must be reconstructible for audit without requiring a single physical warehouse. Cross-product correlation ids on X-* calls remain **Proposed**/Missing today ([§5 observability](./HSI_INTELLIGENCE_OBSERVABILITY.md)).

---

## 7.18 Quality dimensions

| Dimension | Definition | Integration check |
|-----------|------------|-------------------|
| **Completeness** | Required fields present | Fail closed if critical missing |
| **Correctness** | Identifier resolves; code valid | PubMed/Crossref Check; ontology pattern |
| **Consistency** | No silent contradicting merges | Conflict policy §7.20 |
| **Timeliness** | Meets freshness SLO | §7.19 |
| **Provenance integrity** | Lineage unbroken | Reject orphan claims in eval |
| **Licence fitness** | Allowed for intended surface | Block public publish if not |
| **Plane fitness** | Data allowed on target plane | neonGuard / purpose codes |
| **Honesty** | Label matches reality | Verified≠Mocked |

Research eval: unsupported-claim rate, citation accuracy. Clinical: source attribution, missing-info warnings. Trials: freshness + criterion state honesty.

---

## 7.19 Freshness

| Feed class | Freshness expectation | Failure mode |
|------------|----------------------|--------------|
| PubMed/Crossref Check | At verification time | Re-check before Approve if SLA exceeded |
| Ontology / xrefs | Dated `verifiedOn` / release | Refresh campaign; stale map badge |
| Graded packs | Pack commit pin | Consumer asserts pin |
| CTG recruitment | Explicit SLO (product-defined) | Stale badge; no high-confidence match |
| Clinical FHIR | Encounter/observation timestamps + sync lag | Missing-data + lag warning |
| Wearables | Sample time + gap detection | Do not impute health from silence |

Every feed past **L2** declares owner, freshness SLO, and stale behaviour.

---

## 7.20 Conflict resolution

| Conflict type | Policy |
|---------------|--------|
| Competing scientific frames | Preserve both; label Association/Inference/Hypothesis; Gate C for promotion |
| Identifier mismatch (PMID vs DOI) | Prefer resolve-both; else uncertain |
| Duplicate trials | NCT wins; else human dedup |
| Medication list conflict (multi-provider) | Show discrepancy; do not auto-pick “truth” |
| Ontology map disagreement | Prefer curated exact; flag close/uncertain |
| Synthetic vs real | Synthetic never overwrites real; segregate stores |
| Grade vs Ask provisional | Pack/Gate C wins for public; provisional stays unreviewed |

**Never** resolve clinical conflicts by LLM alone without HITL when used for care decisions.

---

## 1. Relation to claim schema

Use §6 claim provenance as the scientific claim envelope; this document covers **integration-level** provenance for sources feeding those claims (FHIR, registries, PGHD, dumps).

**Stop.** Schema docs only — no DB migration in this pack.
