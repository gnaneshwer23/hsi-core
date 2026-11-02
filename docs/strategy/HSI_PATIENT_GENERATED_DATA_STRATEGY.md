# HSI Patient-Generated Data Strategy (§7.14)

**Document status:** Definitive PGHD / wearables strategy (§7)  
**Adopted:** 2 November 2026  
**Owner:** **Aksh Health** is the PGHD product owner (plane **P2**).  
**Binding:** No identifiable PGHD / PHI into ISI autumn-snow or hsi-core red-wave.

---

## 1. Ownership and exchanges

| Concern | Owner | Consumer | Contract |
|---------|-------|----------|----------|
| Capture, consent, quality, storage | Aksh | — | In-product |
| Appointment prep / trends | Aksh | HSI Clinical | **X-A1** / **X-A2** **Proposed** (Exchange A) |
| Education only (no PHI) | ISI | Aksh | **X-F1** **Proposed** |
| Research briefs | ISI / hsi-core | — | Concepts only; never raw PGHD |

Exchange A = authorised, purpose-limited observation export with source/time/quality metadata — **not** a dump into research Neons.

---

## 2. Content classes

| Class | Examples | Honesty today | Maturity |
|-------|----------|---------------|----------|
| Symptoms / intake | Voice/note intake, front desk | **Partial** synthetic HITL | **L2–L3** |
| Medications (patient-reported) | Self-report lists | **Partial** | **L2** |
| Lifestyle / coaching | Diaries, modalities | **Partial**/demo | **L2** |
| Education engagement | Content completion | Product | **L2–L3** |
| Wearables | HR, activity, sleep | **Mocked** stubs | **L1–L2** |
| PROs | Questionnaires | **Partial** | **L2** |

Aksh flags: `syntheticOnly`, `LIVE_ORGANISATIONS=0`, `liveEmis:false` — treat as binding honesty for clinical demo maturity.

---

## 3. Required metadata (every PGHD observation)

| Field | Purpose |
|-------|---------|
| `sourceSystem` / connector id | Provenance |
| `observedAt` / `recordedAt` | Temporal |
| `modality` | wearable / lifestyle / self_report / … |
| `quality` / confidence | Device vs self-report honesty |
| `consentScope` / purpose code | Stage 2 authorisation |
| `synthetic` flag | Never present fixtures as real PHI |
| `patientId` scope | ACL — stays in P2 |

---

## 4. Wearable caveats (binding)

From Aksh `precision-health/connectors.ts` audit:

| Connector | Honesty |
|-----------|---------|
| `wearable_synthetic_stream` | **Mocked** fixture; `liveStream:false` |
| `fitbit_oauth_stub` | **Prototype** stub — not live pull |
| File import | Batch dumps only — not continuous stream |

**Rules**

- Vendor ToS + explicit consent before any live connector (**Proposed** L5 path).  
- Wearable ≠ clinical-grade measurement unless validated for that use.  
- Gaps in streams ≠ “patient was healthy.”  
- Do not auto-write wearable samples to live EHR (`ehrWrite:false`).

---

## 5. Plane firewall

```
Aksh PGHD (P2)
    │
    ├─► HSI Clinical (P2) via X-A* — Proposed, scoped PHI
    │
    ├─► ISI / hsi-core — FORBIDDEN identifiable path
    │         └─► only de-id / aggregate / concept summaries under ethics
    │
    └─► Trials patient info (X-E1) — general study info; no eligibility claim; no PHI leakage
```

Red-team: prompt/logs must not leak PGHD into research tool traces ([§5 observability](./HSI_INTELLIGENCE_OBSERVABILITY.md)).

---

## 6. Phase alignment

| Phase | PGHD work |
|-------|-----------|
| Now | Keep synthetic honesty; document stubs |
| Product Phase 5 | Design gateway OpenAPI; DPIA; contract tests |
| Live wearables | Only after consent registry + vendor agreement + quality labels |

**Stop.** No wearable OAuth implementation in this pack.
