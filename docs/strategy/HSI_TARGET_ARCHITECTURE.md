# HSI Target Architecture

**Status:** Logical architecture for founder review — not an implementation mandate to rewrite working systems.  
**PRD companion (canonical Document 02):** [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) — this sketch is subordinate elaboration. Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04).  
**Product binding:** [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) (§3 ownership, exchanges X-A–X-F, API catalogue).  
**Principle:** Separate planes; connect by contract; prefer reuse over rebuild.

---

## 1. Architectural thesis

HSI is a **federated intelligence ecosystem**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Shared Governance Plane                      │
│  Identity · RBAC/ABAC · Consent · Audit · Safety · Gate C/HITL   │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐
   │ Aksh     │  │ HSI        │  │ ISI      │  │ HSI Trials │
   │ Health   │  │ Clinical   │  │ (Immune) │  │            │
   └────┬─────┘  └─────┬──────┘  └────┬─────┘  └──────┬─────┘
        │              │              │               │
        └──────────────┴───────┬──────┴───────────────┘
                               ▼
              ┌────────────────────────────────┐
              │ Living Health KG (logical)     │
              │ Layers 1–6 across stores       │
              └────────────────────────────────┘
                               ▲
              ┌────────────────┴────────────────┐
              │ hsi-core Evidence Substrate     │
              │ grades · packs · Gate C · export│
              └─────────────────────────────────┘
```

**hsi-core** remains the **evidence governance substrate** (and may evolve into a shared services hub only after D6). It does **not** absorb Aksh clinical runtime or ISI product UX.

---

## 2. Data planes (hard boundaries)

| Plane | Contents | Stores (current → target) | Cross-plane rule |
|-------|----------|---------------------------|------------------|
| **P0 Public biomedical** | Ontology, public papers, open graphs | ISI KG, public APIs | Readable widely |
| **P1 Governed evidence** | Graded edges, Gate C, partner packs | hsi-core Neon **red-wave** | Export to ISI after Approve |
| **P2 Identifiable clinical** | Patient encounters, labs, meds | Aksh / future HSI Clinical (separate) | Never on red-wave / autumn-snow research DB |
| **P3 Trial operations** | Screening decisions, referrals | Future Trials service | Human final; no auto-eligibility |

Violation of P2→P0/P1 without de-identification + ethics = **architectural defect**.

---

## 3. Service inventory (target)

### Already exist (reuse)
- **Evidence Service** — hsi-core packs, grades, exporters.  
- **Gate C Service** — human review tooling + honesty asserts.  
- **ISI Graph Service** — kg.json + curation APIs.  
- **Ask / Retrieval** — immunecity askGrounding + LLM path.  
- **Aksh Clinical Spine** — CONDUCTOR, HITL, SHIELD, BRIDGE staging.

### To introduce (phased)
- **Logical Graph API** — typed queries across layers with access views (Phase 1).  
- **Terminology Service** — SNOMED/LOINC/HPO/MONDO mapping with licence gates.  
- **Longitudinal Clinical Context Service** — FHIR aggregation for authorised test data (Phase 3).  
- **Trial Registry + Eligibility Evaluator** — deterministic criteria states (Phase 4).  
- **Cross-Domain Reasoner** — orchestrates tools; emits labelled claim types (Phase 2+).  
- **Aksh–HSI Integration Gateway** — OAuth, scopes, no PHI into research DBs (Phase 5).

### Explicit non-services
- Standalone chatbot per marketing name without tools/contracts.  
- Shared Neon for HSI + ISI product + PHI.

---

## 4. Intelligence engine pattern

```
User question
    → Intent router (deterministic + light LLM)
    → Tool plan (graph query | literature | FHIR | trials | Aksh API)
    → Evidence assembly (provenance required)
    → Claim labelling (Observed | Established | Association | Inference | Hypothesis)
    → Safety gate (clinical vs research mode)
    → Human review when required (Gate C / HITL)
    → Audit log
```

Prefer: graph traversal, SQL/keyset, terminology, registry APIs.  
LLM: propose, summarise, extract candidates — **not** sole source of clinical truth.

---

## 5. API contract principles

1. Versioned JSON schemas with honesty fields (`legalBinding`, `lockedPilot`, `grade`, `claimType`).  
2. Consumer must assert honesty (ISI pattern already).  
3. Clinical APIs require purpose, role, patient scope, audit id.  
4. Research APIs must reject identifiable payloads.

---

## 6. Technology decisions deferred

| Topic | Decision |
|-------|----------|
| Graph DB engine | **Deferred** until ISI KG audit + Layer 4 model stabilise — keep file+SQL packs for now |
| Agent framework | Reuse Aksh CONDUCTOR for clinical; lightweight tool-router for research — no premature multi-framework merge |
| Identity | UK/NHS-aligned IdP TBD with partners — do not invent PDS integration |

---

## 7. First end-to-end workflows (architecture view)

| Workflow | Primary systems | Planes |
|----------|-----------------|--------|
| **A Biomedical Discovery** | ISI + hsi-core | P0 + P1 |
| **B Longitudinal Patient** | HSI Clinical + Aksh (auth test data) | P2 (+ P1 evidence links only as de-id/refs) |
| **C Trial Intelligence** | HSI Trials + ISI disease context + optional P2 profile | P3 + P0/P1 |

Workflows connect later through shared claim types and graph entity IDs — not through a single mega-database.

---

## 8. Migration posture

- **Do not** rewrite immunecity or Aksh to fit a greenfield monorepo.  
- **Do** introduce shared schema packages / OpenAPI over time.  
- **Do** keep red-wave / autumn-snow / Aksh clinical DBs isolated.
