# HSI Data Security and Governance (§7.21)

**Document status:** Definitive data-plane security & governance for integrations (§7)  
**Adopted:** 2 November 2026  
**Authority for clinical safety / regulatory posture:** [`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md)  
**Rule:** This document **adds no new regulatory clearance claims** (no MHRA SaMD, no DSPT pass, no DCB0129 completion asserted).

---

## 1. UK GDPR / DPA 2018 (integration lens)

| Topic | Expectation for data sources |
|-------|------------------------------|
| Lawful basis | Declared per clinical / research processing |
| Special category health data | Explicit condition + safeguards for P2 |
| Purpose limitation | Purpose codes on clinical APIs and Exchange A |
| Data minimisation | Research plane = anonymous / de-id / public only |
| Storage limitation | Per-plane retention; partner deletion clauses |
| International transfer | Adequacy / SCCs when expanding beyond UK |

Controllers/processors for hospital partners = **TBD** with institutional agreements — not assumed by connecting FHIR.

---

## 2. Purpose limitation (binding)

| Purpose | Allowed planes | Forbidden |
|---------|----------------|-----------|
| Public research education | P0 (+ approved P1 cites) | P2 identifiers |
| Governed evidence curation | P1 | PHI |
| Direct care / clinic demo | P2 (Aksh; synthetic today) | Writing P2 into research Neons |
| Trial operations | P3 (+ P0 registry) | Auto-eligibility; PHI leakage via X-E1 |
| Product analytics | Aggregates / consented | Covert secondary use |

---

## 3. Planes and technical controls

| Control | Status | Owner |
|---------|--------|-------|
| Neon project isolation (red-wave ≠ autumn-snow) | **Verified** guards | hsi-core / ISI |
| `cdsPhiBoundary` / no PHI substrate | **Verified** policy | hsi-core |
| Gate C host assert | **Partial**/Verified pattern | ISI |
| Aksh `ehrWrite:false` / `liveEmis:false` | **Verified** flags | Aksh |
| `LIVE_ORGANISATIONS=0` | **Verified** | Aksh |
| Unified cross-product IAM | **Missing** | **Proposed** |
| X-* correlation + audit ids | **Proposed** | Shared Core |

---

## 4. Agreements before Stage 2 clinical connect

Minimum before any non-synthetic clinical source advances past **L1**:

1. Data sharing / processing agreement (roles clear).  
2. DPIA for the processing.  
3. Security questionnaire / DSPT-aligned evidence as required by partner.  
4. Clinical safety ownership (who holds DCB0160 locally).  
5. Identity proofing / record match policy.  
6. Exit / deletion / audit rights.

Without these, maturity stays **L0–L2** synthetic/rehearsal only.

---

## 5. Threat themes (integration-specific)

| Threat | Mitigation direction |
|--------|----------------------|
| Confused deputy across planes | Plane ACL on every tool; purpose codes |
| Synthetic presented as real PHI | End-to-end honesty flags |
| Licence wash of SNOMED/etc. | Licence gates in mapping layer |
| Prompt injection → exfil via tools | Typed tools; no raw DB; red-team |
| Stale trial status → harmful screening | Freshness fail-closed |
| Insider export | Audit + least privilege |

Detail and frameworks: clinical safety doc §§2–7 — **do not duplicate** full DCB/MHRA text here.

---

## 6. What this pack does **not** claim

- MHRA device clearance for Aksh agents or HSI products.  
- NHS live connectivity or PDS access.  
- Completed DSPT or DCB0129/0160 files.  
- Ethical approval for identifiable research datasets.

**Stop.** Governance strategy only — no DPIA drafting or partner legal execution in this pack.
