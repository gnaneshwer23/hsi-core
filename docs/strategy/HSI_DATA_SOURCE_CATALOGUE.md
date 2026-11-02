# HSI Data Source Catalogue (§7.23)

**Document status:** Definitive source evaluation matrix (§7)  
**Adopted:** 2 November 2026  
**Supersedes as detail:** extends [`HSI_DATA_INTEGRATION_STRATEGY.md`](./HSI_DATA_INTEGRATION_STRATEGY.md) (that file remains a short index).  
**Rule:** Status uses honesty labels + maturity **L0–L5** (§7.22). Most clinical sources are **L0–L1** researched/proposed until synthetic/authorised pilots exist.

**Priority:** **P0** near-term research · **P1** Workflow B/M1 support · **P2** clinical/trials later · **P3** long-horizon

---

## 1. Evaluation columns (§7.23)

| Column | Meaning |
|--------|---------|
| Fit | Relevance to HSI planes / Workflows A–C |
| Access | Public API, dump, partner, licence gate |
| Complexity | Engineering + legal effort |
| Honesty | Verified / Partial / Prototype / Mocked / Proposed / Missing |
| Maturity | L0–L5 |
| Priority | P0–P3 |
| Owner plane | P0–P3 data plane |

---

## 2. Clinical systems

| Source | Fit | Access | Complexity | Honesty | Maturity | Priority | Notes |
|--------|-----|--------|------------|---------|----------|----------|-------|
| HL7 FHIR R4 | L1 clinical core | Partner / sandbox | Medium–high | **Partial** (Aksh staging) | **L2–L3** staging; **L0** hospital | P1 fixtures → P2 live | UK Core alignment **Proposed**; synthetic first |
| SMART-on-FHIR | App launch | Partner IdP | High | **Proposed** | **L0–L1** | P2 | Not verified production |
| HL7 v2 | Labs/ADT | Partner MLLP | High | **Proposed** | **L0** | P2 | Adapter design only |
| EHR / HIS | Longitudinal | Contracts | Very high | **Missing** | **L0** | P3 | Do not claim universal access |
| LIS | Lab trends | Partner | High | **Missing** | **L0** | P2 | Via FHIR Observation preferred |
| Pharmacy / ePMA | Meds list | Partner | High | **Partial** via Aksh models | **L1** | P2 | Not federated pharmacy network |
| DICOM / imaging | PRISM path | Partner PACS | Very high | **Mocked** (Aksh PRISM scaffold) | **L1** | P3 | Not live imaging product |
| Identity / PDS-like | Record linkage | Jurisdictional | Very high + legal | **Missing** | **L0** | P3 | Safety-critical; agreements first |

**Near-term clinical approach:** synthetic multi-provider FHIR fixtures → authorised test environments → partner pilots. Never present synthetic as real PHI.

---

## 3. Biomedical / scientific

| Source | Fit | Access | Complexity | Honesty | Maturity | Priority | Licensing notes |
|--------|-----|--------|------------|---------|----------|----------|-----------------|
| PubMed / NCBI E-utilities | Literature IDs + Ask provisional | Public API | Medium | **Verified** Check; **Partial** provisional | **L3–L4** | **P0** | API keys; rate limits; attribution |
| Europe PMC | Fallback lit | Public API | Medium | **Partial** | **L3** | P0 | Open access + metadata terms |
| Crossref | DOI metadata | Public API | Low–medium | **Verified** in curation | **L4** | **P0** | Polite pool / ToS |
| ISI `xrefs.ts` authorities (HGNC, UniProt, CL, GO, MONDO, MeSH, ChEMBL) | Entity resolution | Public APIs | Medium | **Verified** curated subset | **L3** | **P0–P1** | Authority ToS; refresh provenance date |
| Open Targets | Disease–target | Open API/dumps | Medium | **Proposed** / not wired | **L0–L1** | P1 | Open licence; versioned snapshots |
| Human Cell Atlas | Cell states | Open (terms) | High | **Proposed** | **L0** | P2 | Dataset-specific terms |
| UniProt | Proteins | Open | Medium | **Partial** (xrefs + manual) | **L3** thin | P1 | CC / UniProt licence |
| Reactome | Pathways | Open | Medium | **Partial**/manual | **L1** | P1 | Open |
| Gene Ontology | Function | Open | Medium | **Partial** (xrefs) | **L3** thin | P1 | Open |
| Single-cell / omics sets | Research projects | Dataset-specific | High | **Missing** product | **L0** | P2–P3 | Per-dataset DUA |
| hsi-core graded packs | Governed evidence (P1) | Internal export | Low (exists) | **Verified** | **L4** | **P0** | Partner pack honesty fields |

Prefer **cached, versioned snapshots** with retrieval dates over silent live scrape into production claims.

---

## 4. Clinical trial registries

| Source | Fit | Access | Complexity | Honesty | Maturity | Priority | Notes |
|--------|-----|--------|------------|---------|----------|----------|-------|
| ClinicalTrials.gov (CTG) | Primary NCT | Public API | Medium | **Partial** (melanoma TI; live flag opt-in) | **L2–L3** pilot | P1 → P2 product | Freshness stamps mandatory |
| WHO ICTRP / ISRCTN / others | Coverage | Public / scrape policy | High | **Proposed** | **L0** | P2 | Dedup against NCT |
| Eligibility structuring | Workflow C | Derived | High | **Prototype**/LLM candidates | **L1–L2** | P2 | Five states; never “confirmed eligible” |

---

## 5. Patient-generated (PGHD) / wearables

| Source | Fit | Access | Complexity | Honesty | Maturity | Priority | Notes |
|--------|-----|--------|------------|---------|----------|----------|-------|
| Aksh Health (symptoms, meds, lifestyle, education) | Exchange A owner | Aksh product | Medium | **Partial** synthetic clinical | **L2–L3** demo | P2 gateway | **No PHI → ISI / red-wave** |
| Wearable vendors | Streams / dumps | OAuth / file | High | **Mocked** stubs (`fitbit_oauth_stub`, synthetic stream) | **L1–L2** | P2 | Consent + vendor terms; quality caveats |
| PROs / questionnaires | Clinical plane | In-app | Medium | **Partial** in Aksh flows | **L2** | P2 | P2 only |

---

## 6. Terminology sources (summary)

Full policy: [`HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md`](./HSI_TERMINOLOGY_MAPPING_SPECIFICATION.md).

| Terminology | Honesty | Maturity | Licence gate |
|-------------|---------|----------|--------------|
| LOINC | **Verified** thin (8 claim links) | **L3** | Free + attribution |
| SNOMED CT | **Proposed**/fragments in Aksh | **L0–L1** product embed | **UK licence path required** |
| MONDO / HPO / CL / GO | **Partial** (xrefs + hsi hints) | **L2–L3** | Open |
| dm+d / RxNorm / ATC | **Proposed** | **L0–L1** | Jurisdiction-specific |

---

## 7. Near-term top sources (research-first)

1. **hsi-core graded packs / X-G1** — already strongest governed path.  
2. **PubMed + Crossref** — identifier verification + Ask provisional (labelled).  
3. **ISI curated KG + `xrefs.ts`** — entity anchors for M1.  
4. **ClinicalTrials.gov** — structured cache for one disease pilot (not full product).  
5. **Synthetic FHIR multi-provider pack** — Workflow B rehearsal (not live hospitals).

---

## 8. Catalogue hygiene

Every row that advances past **L1** must declare: owner, schema version, refresh SLO, failure mode (stale badge), deletion/retention, and plane. Silence on freshness = fail closed for trial recruitment and clinical timeline claims.
