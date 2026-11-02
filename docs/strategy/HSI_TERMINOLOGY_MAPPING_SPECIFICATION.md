# HSI Terminology Mapping Specification (§7.15)

**Document status:** Definitive terminology & mapping strategy (§7)  
**Adopted:** 2 November 2026  
**Principle:** Keep ISI string graph IDs as Atlas SoT; add external ids incrementally; licence gates before product embed of proprietary codes.

---

## 1. Terminologies in scope

| System | Plane use | Honesty in repos | Maturity | Licence gate |
|--------|-----------|------------------|----------|--------------|
| **SNOMED CT** | Clinical Condition/Procedure | Fragments in Aksh drafts | **L0–L1** product | **UK licence required** before embed/redistribution |
| **LOINC** | Labs / Observations | hsi-core **8** claim→LOINC; Aksh lab catalog | **L3** thin | Free + attribution |
| **MONDO** | Disease grouping | ISI xrefs; hsi SSc cards | **L2–L3** | Open |
| **HPO** | Phenotypes | **Proposed**/thin | **L0–L1** | Open |
| **CL** (Cell Ontology) | Cell types | ISI xrefs; hsi spine hints / curator_confirmed | **L2–L3** | Open |
| **GO** | Functions / processes | ISI xrefs | **L3** thin | Open |
| **dm+d** | UK medicines | **Proposed** | **L0–L1** | NHS dictionary terms |
| RxNorm / ATC | Meds (non-UK / analytic) | **Proposed** | **L0** | Jurisdiction-specific |
| ICD | Billing / epi bridge | **Proposed** | **L0** | Licence as applicable |
| HGNC / UniProt / MeSH / ChEMBL | Gene/protein/lit/chem | ISI `xrefs.ts` **Verified** subset | **L3** | Authority ToS |

---

## 2. Mapping layer (logical)

```
Source code (LOINC | SNOMED | MONDO | …)
        │
        ▼
  Mapping record {
    sourceSystem, sourceCode, sourceDisplay,
    targetSystem (HSI concept | ISI node id | FHIR),
    matchType: exact | close | broader | narrower | uncertain,
    mappingVersion, mappedAt, mappedBy, licenceOk,
    reviewStatus
  }
        │
        ▼
  Consumer (Observation normaliser | X-B1 | Ask display | pack marker)
```

**Ambiguous maps must be flagged** — never silent coercion ([§6 pipeline](./HSI_REASONING_PIPELINE.md)).

---

## 3. ISI `xrefs.ts` (Verified pattern)

- Location: `immune-city/src/data/xrefs.ts`.  
- Sources: HGNC, UniProt, CL, GO, MONDO, MeSH, ChEMBL.  
- `match: "exact"` → eligible for sameAs-style emission; `"close"` → display only.  
- Provenance: `XREF_PROVENANCE.verifiedOn` (2026-10-21) + method string.  
- **Rule:** Never add an ID without authority API check (file header contract).  
- Coverage: curated subset — **Partial** relative to full KG; extend incrementally.

---

## 4. hsi-core claim → LOINC (8)

- Module: `src/markers.ts` (+ clinic id suggestions).  
- Validate reports **8** claim→LOINC links (audit 2026-11-02).  
- Examples in seeds/mappings: anti-CCP `53031-9`, RF `11572-5`, HbA1c `4548-4`, glucose `1558-6`, hs-CRP `30522-7`, etc.  
- Purpose: bench↔bedside **translation cards** — `isCdsSurfacable` stays false until Gate C + established grade.  
- **Extend this pattern**; do not invent predictive CDS rules from LOINC alone.

---

## 5. hsi-core ontology binds (cells / disease)

- Spine / SSc cards may carry CL/MONDO with `hint_only` or `curator_confirmed` (OLS label match).  
- **curator_confirmed ≠ Gate C claim approval ≠ CDS.**  
- Do not set `hsiGrade` from ontology bind status alone.

---

## 6. Shared Terminology Service (target)

| Capability | Status |
|------------|--------|
| `normalizeCode` tool | **Partial** (DrASSIST lexicon; LOINC links) |
| Cross-product Terminology Service | **Proposed** ([Target Architecture](./HSI_TARGET_ARCHITECTURE.md)) |
| FHIR TerminologyServices | **Proposed** with UK Core |

---

## 7. Licence gates (binding)

1. Do not commit full SNOMED snapshots to public repos without licence compliance.  
2. Document attribution for LOINC/GO/MONDO/CL in pack manifests where redistributed.  
3. Partner packs declare which code systems they include.  
4. Mapping `licenceOk=false` → block publish to public surfaces.

**Stop.** No terminology DB or licence purchase actions in this pack.
