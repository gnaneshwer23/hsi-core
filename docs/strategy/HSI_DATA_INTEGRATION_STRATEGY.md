# HSI Data Integration Strategy

**Honesty:** No integration is “live” until implemented, licensed, and verified. This document evaluates candidates.

**Definitive pack:** §7 Data Sources & Interoperability — start at [`README.md`](./README.md) (§7 index). This file remains a short index; detailed audit, catalogue, FHIR/biomedical/trials/PGHD, terminology, provenance, security, testing, and roadmap live in the §7 documents.

---

## 1. Clinical systems

| Source | Availability | Fit | Complexity | Status in repos |
|--------|--------------|-----|------------|-----------------|
| HL7 FHIR R4 | High (standard) | L1 core | Medium | Aksh BRIDGE/Medplum **staging**; `liveEmis:false` |
| SMART-on-FHIR | Partner-dependent | App launch | High | Not verified as production |
| HL7 v2 | Common in labs/ADT | Ingest adapters | High | Planned absent |
| EHR / HIS | Partner contracts | Longitudinal | Very high | Absent — do not claim |
| LIS | Partner | Lab trends | High | Absent |
| DICOM / imaging | Partner | PRISM phase 2 | Very high | Planned (Aksh PRISM) |
| Pharmacy | Partner | GUARDIAN inputs | High | Partial via Aksh models |
| Identity / PDS-like | Jurisdictional | Record linkage | Very high + legal | Absent |

**Phase 3 approach:** Synthetic multi-provider FHIR fixtures → authorised test environments → partner pilots. Never present synthetic as real PHI.

---

## 2. Biomedical sources

| Source | Licence / access | Refresh | Integration approach | Current use |
|--------|------------------|---------|----------------------|-------------|
| PubMed / Europe PMC | Public APIs | Continuous | Literature agent + Gate C | ISI evidence check; curation |
| Open Targets | Open | Periodic dump/API | L4 disease–target | Not verified as wired |
| Human Cell Atlas | Open (terms) | Periodic | L2 cell states | Not verified |
| UniProt | Open | Periodic | Protein nodes | Partial/manual |
| Reactome | Open | Periodic | Pathways | Partial/manual |
| Gene Ontology | Open | Periodic | Annotations | Partial |
| Single-cell / omics | Dataset-specific | Ad hoc | Research projects | Not productised |

Prefer **cached, versioned snapshots** with retrieval dates over silent live scrape into production claims.

---

## 3. Clinical trials registries

| Source | Role | Status |
|--------|------|--------|
| ClinicalTrials.gov | Primary NCT discovery | Partial ISI melanoma tooling — full sync **not verified** |
| WHO ICTRP / ISRCTN / others | Coverage | Planned |
| Eligibility structuring | Extract + validate schema | Partial / LLM-assisted candidates only |

Workflow C requires: registry fetch provenance, criteria versioning, recruitment status timestamp.

---

## 4. Patient-generated (Aksh)

| Source | Content | Integration rule |
|--------|---------|------------------|
| Aksh Health | Symptoms, meds, devices, lifestyle, education | Phase 5 gateway; purpose limitation |
| Wearables | Streams | Consent + vendor terms |
| PROs | Questionnaires | Clinical plane only |

**Forbidden:** piping identifiable PGHD into hsi-core red-wave or ISI autumn-snow without ethics + de-id pipeline.

---

## 5. Ontology / terminology services

| Terminology | Use | Constraint |
|-------------|-----|------------|
| SNOMED CT | Clinical conditions | Licence (UK licence path) |
| LOINC | Labs | Free with attribution |
| HPO | Phenotypes | Open |
| Cell Ontology | Cell types | Open |
| GO | Functions | Open |
| MONDO | Disease grouping | Open |
| RxNorm / dm+d / ATC | Meds | Jurisdiction-specific |

Do not embed proprietary terminology in public repos without licence compliance.

---

## 6. Integration patterns

1. **Pull + version** for public science.  
2. **Partner push / FHIR** for clinical with contracts.  
3. **Export consume** (existing) for hsi-core → ISI.  
4. **Gateway** for Aksh → HSI research (de-id summaries, scopes).  
5. **No shared evidence DB** between HSI Neon and ISI Neon.

---

## 7. Data quality & refresh

Every integrated feed declares: owner, SLA, schema version, freshness SLO, failure mode (stale badge), deletion policy.

---

## 8. Near-term integration priority

1. Formalise hsi-core ↔ ISI export (already strongest).  
2. Versioned literature retrieval metadata.  
3. ClinicalTrials.gov structured cache for one disease pilot.  
4. Synthetic FHIR multi-provider pack for Workflow B.  
5. Aksh read API design (no PHI to research DBs).
