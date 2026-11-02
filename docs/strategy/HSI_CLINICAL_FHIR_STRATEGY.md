# HSI Clinical FHIR Strategy (§7.4–7.10)

**Document status:** Definitive clinical interoperability strategy (§7)  
**Adopted:** 2 November 2026  
**Honesty:** All hospital federation, SMART production launch, LIS/pharmacy/DICOM/identity = **Proposed** unless marked Verified/Partial from Aksh staging.  
**First data:** Synthetic and authorised test data only. Universal hospital access = **ambition**, not capability.

**Related:** [`HSI_EXISTING_INTEGRATION_AUDIT.md`](./HSI_EXISTING_INTEGRATION_AUDIT.md) · Product Phase 3 / Intel Phase 4

---

## 1. Current verified / partial base (Aksh)

| Capability | Honesty | Maturity | Notes |
|------------|---------|----------|-------|
| FHIR R4-shaped evidence export after Accept | **Partial** | **L3** | BRIDGE staging; internal evidence artifact |
| Medplum rehearsal sync | **Partial** | **L2–L3** | Flag-gated; refuses when off; not EHR |
| Simulated EHR | **Mocked** | **L2** | `liveEmis:false`; `realPatientData:false` |
| Live EMIS / TPP / NHS writeback | **Missing** | **L0** | Hard-off |
| `LIVE_ORGANISATIONS` | **Verified** = 0 | **L0** live | Do not flip without safety case |
| HSI Clinical product FHIR repo | **Missing** | **L0** | Target plane P2 |

hsi-core and ISI: **no** FHIR hospital federation (**Missing** / **L0**).

---

## 2. FHIR R4 resource priorities (Proposed product table)

| Resource | Clinical use | HSI use | Near-term status |
|----------|--------------|---------|------------------|
| Patient | Identity shell | Linkage (authorised) | **Proposed** — synthetic IDs first |
| Encounter | Timeline spine | Workflow B temporal | **Proposed** fixtures |
| Observation | Labs, vitals, PGHD | Trends; LOINC map | **Proposed**; Aksh lab kinds **Partial** |
| Condition | Problems | Concept → X-B1 | **Proposed** |
| MedicationRequest / MedicationStatement | Meds chronology | Discrepancy detect | **Proposed** |
| AllergyIntolerance | Safety | GUARDIAN inputs later | **Proposed** |
| DiagnosticReport | Lab/imaging reports | Provenance wrapper | **Proposed** |
| DocumentReference | Notes | Optional later | **Proposed** |
| Practitioner / Organization | Attribution | Audit | **Proposed** |
| Bundle | Exchange unit | Staging export (Aksh **Partial**) | Reuse pattern |
| ImagingStudy | Imaging | PRISM path | **Proposed** / Aksh scaffold **Mocked** |
| ServiceRequest | Orders | Later | **Proposed** |
| Consent | Purpose | Stage 2 | **Proposed** |

Do not implement full US Core / UK Core surface area before Workflow B fixtures prove timeline + missing-data honesty.

---

## 3. UK Core / NHS notes (**Proposed**)

- Prefer **UK Core** profiles where partner data claims UK primary care/secondary care semantics.  
- Do not claim NHS Spine / PDS connectivity without agreements + DPIA.  
- SNOMED CT binding for Condition/Procedure requires **licence compliance** before product embed (see terminology doc).  
- dm+d for UK medications preferred over RxNorm in UK deployments.  
- DSPT / DCB0129–0160 apply when clinical risk software is claimed — see [`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md); **no new regulatory clearance claims** here.

---

## 4. SMART-on-FHIR (**Proposed**)

| Topic | Stance |
|-------|--------|
| Use | App launch into authorised FHIR server for HSI Clinical / Aksh |
| Maturity | **L0–L1** — not verified as production |
| Requirements | Partner IdP, scopes, launch context, audit |
| Forbidden | Presenting SMART demo as live multi-hospital access |

---

## 5. HL7 v2 (**Proposed**)

| Feed | Role | Status |
|------|------|--------|
| ADT | Encounter/admit discharge | **Proposed** adapter |
| ORU / ORM | Labs / orders | **Proposed**; prefer FHIR Observation when available |
| Maturity | **L0** | No verified MLLP in repos |

Strategy: v2 → normalised FHIR R4 resources inside the Clinical Interoperability service — do not build a second parallel clinical model.

---

## 6. LIS / pharmacy / DICOM / identity (**Proposed** unless noted)

| Domain | Approach | Honesty |
|--------|----------|---------|
| LIS | FHIR Observation + DiagnosticReport; LOINC codes | **Missing** federation; LOINC maps **Partial** in hsi-core |
| Pharmacy | Medication* resources; dm+d | Aksh med models **Partial**; network **Missing** |
| DICOM | WADO/DICOMweb later; ImagingStudy metadata first | Aksh PRISM **Mocked** |
| Identity / MPI / PDS-like | Dual-check thresholds before multi-provider merge | **Missing** — safety-critical |

---

## 7. Synthetic / authorised test data first (binding)

1. Multi-provider **synthetic FHIR** packs for Workflow B (Q1–Q2 LHK-G).  
2. Carry honesty: `syntheticOnly`, `liveEmis:false`, provenance of fixture version.  
3. Authorised sandboxes only after Stage 2 agreements.  
4. Never copy identifiable clinical data into ISI autumn-snow or hsi-core red-wave.  
5. Exchange B (Clinical→ISI) = **concepts only** (X-B1) — no patient identifiers.

---

## 8. Phased clinical interop

| Phase | Focus | Maturity target |
|-------|-------|-----------------|
| Product Phase 3 / Intel 4 | Synthetic FHIR timeline + missing-info | **L2→L3** |
| Partner pilot | Authorised test org; still not universal access | **L3→L4** controlled |
| Live org | Only with LIVE_ORGANISATIONS evidence + safety case | **L5** — not claimed |

**Stop.** Docs only — no Medplum/EMIS connector work in this pack.
