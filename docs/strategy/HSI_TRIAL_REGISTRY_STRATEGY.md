# HSI Trial Registry Strategy (§7.13)

**Document status:** Definitive clinical trial registry integration strategy (§7)  
**Adopted:** 2 November 2026  
**Honesty:** Melanoma Trial Intelligence ≠ HSI Trials product. Production TI flag default **off**. Full multi-registry sync **not verified**.

**Related:** [`HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md) · Cap 16–20 · X-C1 / X-D1 **Proposed**

---

## 1. Sources

| Source | Role | Honesty | Maturity |
|--------|------|---------|----------|
| ClinicalTrials.gov (CTG) | Primary NCT discovery & status | **Partial** | **L2–L3** pilot |
| WHO ICTRP / ISRCTN / EU CTR / others | Coverage beyond CTG | **Proposed** | **L0** |
| ISI `trialIntelligence.ts` melanoma pilot | Educational arm-level outcomes | **Partial**; flag-off prod | **L2–L3** |
| Live Discovery CT.gov adapter | Opt-in `DISCOVERY_LIVE_CTGOV` | **Prototype** when on | **L2** |

---

## 2. Partial melanoma vs full product

| Dimension | Melanoma TI (today) | HSI Trials product (target) |
|-----------|---------------------|-----------------------------|
| Scope | Curated pilot records + graph nav | Indication-expandable registry cache |
| Eligibility | Not full five-state machine | Criterion states + missing-info |
| Freshness | Provenance object in data module | Cap 20 freshness SLO + stamps |
| UX | Flag-gated educational surface | Dedicated Trials workspace (P3) |
| Claim | Must not say “confirmed eligible” | Same binding rule |
| APIs | Local data module | X-C1 / X-D1 / X-E1 |

---

## 3. Freshness (§7.19 applied to trials)

| Field | Requirement |
|-------|-------------|
| `registryRetrievedAt` | Mandatory on every screening packet |
| Recruitment status | Timestamped; stale → badge + no auto-match confidence |
| Protocol version / NCT last update | Store when API provides |
| Failure mode | Registry down → explicit unavailable |

Stale recruitment without freshness stamps = **forbidden** product behaviour ([Four-Product must-not](./HSI_FOUR_PRODUCT_ECOSYSTEM.md)).

---

## 4. Duplicates and identity

- Prefer **NCT ID** as primary key when present.  
- ICTRP / other IDs map as aliases; mark uncertain crosswalks.  
- Deduplicate by NCT first, then title+sponsor+phase heuristics with human review for conflicts.  
- Never merge two studies into one eligibility decision without curator/investigator confirmation.

---

## 5. Eligibility parsing

| Step | Status | Rule |
|------|--------|------|
| Free-text criteria ingest | **Prototype** / LLM-assisted candidates | Candidates only |
| Structured criterion schema | **Proposed** (Cap 17) | Versioned schema |
| Deterministic matcher | **Missing** (Cap 18) | Five states; human final |
| Confirmed eligible | **Forbidden** automation | Investigator decides |

Five criterion states (binding with biology→trials workflow): matched / not matched / insufficient data / not evaluable / needs verification — exact enum owned by Trials product docs when implemented.

---

## 6. Near-term plan

1. Keep TI production **flag-off** until SME sign-off.  
2. Design versioned CTG cache for **one** disease pilot (research/trials Phase 4).  
3. Add freshness fields before any screening UX.  
4. Defer ICTRP federation until CTG cache proves dedup + stale handling.  
5. Wire X-C1 only after mechanism edges are Gate C honest.

**Stop.** No registry syncer implementation in this pack.
