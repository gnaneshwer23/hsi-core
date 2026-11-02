# HSI Integration Testing Strategy (§7.22)

**Document status:** Definitive maturity gates and contract-test strategy (§7)  
**Adopted:** 2 November 2026  
**Rule:** Do **not** invent live/production statuses. Advance levels only with evidence.

---

## 7.22 Maturity levels (binding)

| Level | Name | Meaning | Typical honesty label |
|-------|------|---------|----------------------|
| **L0** | Researched | Source evaluated in catalogue; no design freeze | Missing / researched |
| **L1** | Proposed | Contracts, ADRs, or design docs exist | **Proposed** |
| **L2** | Prototype / Mocked | Fixtures, stubs, simulated EHR, flag-off pilots | **Mocked** / **Prototype** |
| **L3** | Partial | Works in limited in-repo scope; not federated production | **Partial** |
| **L4** | Verified controlled | Honesty asserts + automated/contract tests pass in controlled env | **Verified** (controlled) |
| **L5** | Partner-governed live | Authorised live org/data with agreements + safety case | **Never claimed in this pack** |

**Mapping note:** Aksh `LIVE_ORGANISATIONS=0` and `liveEmis:false` mean clinical EHR paths are **≤L3** staging / **L2** mock — not L5.

---

## 1. Gate criteria L0 → L5

| From → To | Required evidence |
|-----------|-------------------|
| L0 → L1 | Catalogue row + owner + plane + licence note + priority |
| L1 → L2 | Schema/fixture; synthetic honesty flags; no PHI to research DBs |
| L2 → L3 | Integration code path in repo; unit/contract tests; documented limits |
| L3 → L4 | Honesty asserts; CI or repeatable harness; provenance fields; failure modes tested |
| L4 → L5 | Partner agreement, DPIA, safety case as applicable, live org register >0, security review — **out of scope to claim here** |

Downgrade immediately if honesty flags are violated (e.g. synthetic presented as live).

---

## 2. Contract tests (by integration class)

| Class | Contract tests | Examples today |
|-------|----------------|----------------|
| X-G1 pack consume | Schema + honesty fields + neon host assert | ISI consume / Gate C checklist **Partial–Verified** |
| Literature Check | PMID/DOI resolve; no invented ids | Cite Check path **Verified** |
| Ask provisional | Label unreviewed; not Gate C | askGrounding tests **Partial** |
| FHIR staging | `liveEmis:false`; bundle shape; no live write | Aksh route-smoke / bridge tests **Partial** |
| Trials | Flag-off default; no confirmed-eligible copy | TI flag tests **Partial** |
| Terminology | Pattern + matchType; licenceOk | xrefs + LOINC validate **Partial** |
| Plane firewall | Refuse PHI URL/host to research DB | neonGuard / cdsPhiBoundary **Verified** |

---

## 3. Synthetic FHIR testing

- Maintain versioned multi-provider fixtures for Workflow B.  
- Assert missing-resource warnings when encounters/labs absent.  
- Assert medication discrepancy surfaces without auto-resolution.  
- Never load fixtures into ISI/hsi-core research stores as “patients.”

---

## 4. Honesty asserts (non-negotiable)

| Assert | Applies |
|--------|---------|
| `legalBinding` / `lockedPilot` honesty on packs | hsi-core → ISI |
| `syntheticOnly` / `realPatientData:false` | Aksh clinical demo |
| `liveEmis:false` | All BRIDGE paths until L5 |
| Trial flag default off | ISI production |
| Unreviewed ≠ supports ≠ approved | Literature |
| No PHI on red-wave / autumn-snow | Plane firewall |

---

## 5. Eval overlap

Reuse §5 agent eval and §6 reasoning eval for integration-backed workflows: fabricated-cite = 0; plane leakage = 0; stale trial without badge = fail.

**Stop.** Test strategy only — no new CI pipelines implemented in this pack.
