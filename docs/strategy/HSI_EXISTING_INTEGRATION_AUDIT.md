# HSI Existing Integration Audit (§7.1)

**Document status:** Definitive Phase 0 integration audit (§7)  
**Adopted:** 2 November 2026  
**Instruction:** Strategy only — **no connectors, app code, DB, deploy, or git commits** in this pack.  
**Method:** Source inspection of three local clones + prior system audit ([`HSI_EXISTING_SYSTEM_AUDIT.md`](./HSI_EXISTING_SYSTEM_AUDIT.md)).  
**Binding:** Universal hospital access is an **ambition**, not an existing capability.

**Honesty labels:** **Verified** · **Partial** · **Prototype** · **Mocked** · **Proposed** · **Missing**  
**Maturity:** Levels **0–5** per [`HSI_INTEGRATION_TESTING_STRATEGY.md`](./HSI_INTEGRATION_TESTING_STRATEGY.md) §7.22 — do **not** invent live/production statuses.

---

## 1. Repos in scope

| Repo | Path | Role in integrations |
|------|------|----------------------|
| hsi-core | `~/Projects/hsi-core` | Evidence packs, exports, Neon guards, claim→LOINC |
| immunecity (ISI) | `~/Desktop/immune-city` | PubMed/Crossref curation, Ask, HSI consume, Trial Intelligence, `xrefs.ts` |
| aksh-health-redesign | `~/Projects/aksh-health-redesign` | BRIDGE / Medplum staging, simulated EHR, PGHD/wearable stubs |

---

## 2. Integration inventory (what actually exists)

### 2.1 hsi-core

| Integration | Evidence | Honesty | Maturity |
|-------------|----------|---------|----------|
| Graded pack export → ISI consume contract | `exportIsi`, Discovery JSON, Gate C checklist | **Verified** (contract + honesty tests) | **L4** controlled export path |
| Neon isolation (red-wave only) | `docs/NEON_PROJECT_MAP.md`, URL resolve / migrate guards | **Verified** policy + code guards | **L4** isolation |
| Claim → LOINC links | `markers.ts`; validate reports **8** claim→LOINC | **Verified** (count in validate) | **L3** thin mapping |
| CDS / PHI refuse | `cdsPhiBoundary.ts` | **Verified** | **L4** policy |
| FHIR hospital federation | None in repo | **Missing** | **L0** |
| Live EHR / EMIS / LIS / DICOM | None | **Missing** | **L0** |
| Open Targets / HCA bulk ingest | None as product pipeline | **Missing** / research seeds only | **L0–L1** |
| Aksh agent **runtime** | Catalog / stubs only (`akshAgents.ts`) | **Mocked** as runtime; catalog **Verified** | **L1** catalog |
| P3 molecular adapters | `forceStub: true` on default publish | **Mocked** | **L2** |

### 2.2 ISI (immunecity)

| Integration | Evidence | Honesty | Maturity |
|-------------|----------|---------|----------|
| PubMed / Crossref identifier Check | Curation server path; Cite Check script | **Verified** resolve path; supports still human | **L4** Check; **L3** claim_support |
| Provisional PubMed / Europe PMC in Ask | `provisionalLit.server.ts`, `askGrounding.ts` | **Partial** — labelled unreviewed | **L3** |
| Live Discovery bulk ingest | `DISCOVERY_LIVE_*` env opt-in; default off | **Prototype** when flagged; **not** default product | **L2** |
| HSI Discovery consume | `/hsi-consume`, `/hsi/discovery`, `public/hsi-discovery/*` | **Verified** honesty / diagnostics; ops **Partial** | **L4** consume contract |
| Gate C → autumn-snow | Host assert; curation queue | **Partial** (live DB not re-certified every audit) | **L3–L4** |
| External xrefs | `src/data/xrefs.ts` (HGNC, UniProt, CL, GO, MONDO, MeSH, ChEMBL); verifiedOn 2026-10-21 | **Verified** curated subset | **L3** coverage thin |
| Trial Intelligence (melanoma pilot) | `trialIntelligence.ts`; flag `VITE_TRIAL_INTELLIGENCE` default off | **Partial** / flag-off in production | **L2–L3** educational pilot |
| ClinicalTrials.gov full sync | Opt-in discovery; no product-wide cache verified | **Missing** as full product | **L0–L1** |
| ICTRP / multi-registry federation | — | **Missing** | **L0** |
| FHIR / hospital access | — | **Missing** | **L0** |
| PHI clinical plane | Explicitly out of research product core | **Verified** boundary intent | N/A |

### 2.3 Aksh Health (platform-uk)

| Integration | Evidence | Honesty | Maturity |
|-------------|----------|---------|----------|
| BRIDGE FHIR-shaped staging | Accept → staged FHIR; export routes | **Partial** rehearsal | **L3** staging |
| Medplum sync | `ENABLE_MEDPLUM_SYNC`; dry-run / rehearsal | **Partial** when enabled; **not** EHR | **L2–L3** |
| Simulated EHR | `lib/simulated-ehr`; `liveEmis:false` hard | **Mocked** / synthetic | **L2** |
| Live EMIS / TPP / hospital write | Forbidden; partner checklist docs | **Missing** live | **L0** (`liveEmis:false`) |
| Live organisations | `LIVE_ORGANISATIONS = 0` | **Verified** honesty | **L0** live orgs |
| Synthetic-only contracts | `syntheticOnly: true`, `realPatientData: false` | **Verified** flags | **L2** demo |
| Wearable / PGHD connectors | `precision-health/connectors.ts`: `wearable_synthetic_stream`, `fitbit_oauth_stub`, file import | **Mocked** / **Prototype** stubs | **L1–L2** |
| Exchange A → HSI Clinical (X-A1/A2) | Contracts in four-product doc only | **Proposed** | **L1** |
| HSI pack consume inside Aksh | — | **Missing** | **L0** |

---

## 3. Cross-product APIs (X-*) — audit vs catalogue

| ID | Status in code | Maturity |
|----|----------------|----------|
| **X-G1** HsiEvidenceConsume | **Exists** (hsi-core → ISI) | **L4** |
| **X-G2** GateCDecisionApply | **Partial** | **L3** |
| **X-H1** AkshAgentCatalog | **Exists** (directory, not runtime) | **L3** catalog |
| **X-A1…X-F1, X-H2** | Spec only in [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) | **L0–L1** **Proposed** |

---

## 4. What must not be claimed

| False claim | Reality |
|-------------|---------|
| “HSI connects all hospitals via FHIR” | No hospital federation; Aksh staging + simulated EHR only |
| “Live EMIS / NHS PDS integration” | `liveEmis:false`; identity services **Missing** |
| “Trial Intelligence is the HSI Trials product” | Melanoma educational pilot; production flag off |
| “PubMed is bulk-ingested into the public KG” | Identifier Check + provisional unreviewed hits; Gate C human |
| “Wearables are live streams in Aksh” | Synthetic stream + OAuth stubs |
| “Shared evidence DB across HSI + ISI + PHI” | Separated Neons; PHI refuse on red-wave |

---

## 5. Strongest existing paths (preserve)

1. **X-G1** graded pack export → ISI consume + honesty asserts (**Verified**).  
2. **PubMed/Crossref Check** for curation identifiers (**Verified**).  
3. **Neon plane isolation** red-wave vs autumn-snow (**Verified** guards).  
4. **Aksh BRIDGE staging patterns** for future synthetic FHIR Workflow B (**Partial** rehearsal).  
5. **ISI `xrefs.ts` + hsi-core LOINC (8)** as terminology seeds (**Partial**/thin).

---

## 6. Audit limitations

- Production Aksh agent journeys not re-executed end-to-end in this pass.  
- Partner hospital systems inaccessible — correctly **Missing**.  
- Terminology licences not contracted — see terminology + security docs.  
- “Verified” means **in-repo honesty/tests/contracts**, not regulatory clearance.

**Phase 0 deliverable:** this document. Next: catalogue + architecture in the §7 pack index ([`README.md`](./README.md)).
