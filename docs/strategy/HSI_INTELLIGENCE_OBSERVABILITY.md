# HSI Intelligence Observability (§5.15)

**Document status:** Execution-record and logging design for the Intelligence Engine  
**Pattern to reuse:** Aksh SHIELD append-only / hash-chain + durable CONDUCTOR run metadata (**Verified** in simulation).  
**Research gap:** ISI/hsi-core lack a unified SHIELD-equivalent run ledger (**Partial** / **Missing**).

---

## 1. Execution record (required fields)

Every intelligence workflow should emit a record containing:

| Field | Purpose |
|-------|---------|
| `workflowId` / `runId` | Correlate steps |
| `requestType` | Intent class |
| `userRole` | Authz context |
| `authorisationContext` | Org, purpose, plane |
| `selectedCapabilities` | Caps invoked |
| `toolInvocations[]` | Tool id, arg hash, latency, status |
| `dataSourceIdentifiers` | Pack version, KG version, registry stamp |
| `timestamps` | Start / end / per-step |
| `modelVersions` | LLM/flags if any (null if Type A/B only) |
| `evidenceReferences` | PMIDs/DOIs/REL-* / edge ids — **ids not full PHI** |
| `validationResults` | Schema + citation + safety |
| `errors[]` | Classified failures |
| `humanReviewDecisions` | Gate outcomes |
| `finalOutputStatus` | draft / returned / blocked / escalated |

---

## 2. What to log vs not log

| Log | Do **not** log (unrestricted ops logs) |
|-----|----------------------------------------|
| Tool names, statuses, latency | Full clinical notes / transcripts |
| Hashed or redacted patient ids where required for clinical audit **in P2 store** | Raw PHI in research/P0/P1 logs |
| Citation identifiers | Entire PubMed full text blobs |
| Model version + prompt **version** id | Full user prompt if it embeds PHI |
| Gate decisions | Secrets, Neon passwords, API keys |
| syntheticOnly / honesty flags | Unminimised EHR dumps |

**Rule:** Prefer P2 clinical audit stores for identifiable clinical runs (Aksh SHIELD). Research runs store concept ids and evidence ids only.

---

## 3. Retention (proposed defaults — confirm with DPIA)

| Class | Retention sketch | Status |
|-------|------------------|--------|
| Clinical SHIELD chain | Per org policy / NHS retention norms | **Partial** (sim product) |
| Research workflow ledger | 12–24 months ops + longer for published Gate C lineage | **Proposed** |
| Ephemeral workflow state | TTL hours–days | **Proposed** |
| Eval golden run artifacts | Versioned with release | **Proposed** |

Deletion must not break hash-chain integrity without documented seal/export.

---

## 4. Current vs target

| Surface | Current | Target |
|---------|---------|--------|
| Aksh CONDUCTOR runs | `execution-run-store`, SHIELD, ops visibility | Keep; expose summary via X-H2 later |
| ISI Ask | Quality dashboard / tests; no full execution ledger | Add research run record (**Proposed**) |
| hsi-core publish | Artifacts + honesty asserts | Include verifier versions in manifest |
| Cross-product | **Missing** | Correlation id on X-* calls |

---

## 5. Ops alerts (reuse Aksh pattern)

- Failed/timeout rate thresholds  
- Stuck durable runs  
- ACL deny spikes  
- Citation verification outage  
- Any attempt to set `autoApprove=true` or emit `confirmed_eligible` → **page / block**

---

## 6. Acceptance

- Workflow B M1 ships with research execution record (no PHI).  
- Clinical paths retain SHIELD before any LIVE_ORGANISATIONS increment.  
- Red-team: PHI string must not appear in P0/P1 logs (Phase 5 gateway).

**No implementation in this pack.**
