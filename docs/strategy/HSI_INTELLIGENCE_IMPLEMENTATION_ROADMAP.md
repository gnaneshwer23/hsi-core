# HSI Intelligence Implementation Roadmap (§5.18)

**Document status:** Phased intelligence delivery plan — **docs only until founder approval**  
**PRD companion:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03 §29) · architecture phases also in [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) (Document 02 §20).  
**Maps to:** [`HSI_PRODUCT_ROADMAP.md`](./HSI_PRODUCT_ROADMAP.md) Phases 0–6 and Four-Product P0–P6  
**First milestone:** §5 **Workflow B** (Immune Mechanism) = product **M1 Biomedical Discovery Brief** (research-first). Clinical workflows **Phase 4+** on this intelligence scale.  
**Rule:** Smallest coherent foundation; prefer Type A/B/C; do not implement all Caps 1–20 at once.

---

## 1. Phase map (§5.18 ↔ product roadmap)

| Intel phase | Focus | Product roadmap analogue | Status |
|-------------|-------|--------------------------|--------|
| **0** Existing agent audit | This pack’s audit | Product Phase 0 | **Done** (docs) |
| **1** Shared tool contracts | Graph/evidence/terminology APIs | Product Phase 1 (schema/claimTypes) | **Proposed** |
| **2** Orchestration foundation | Research tool router + execution records | Bridges Phase 1–2 | **Proposed** |
| **3** Biomedical investigation | Workflow B / M1 + Caps 8,12,(7) | Product Phase 2 | **Near-term** |
| **4** Clinical context intelligence | Workflow A + Caps 1–6 via Aksh/Clinical | Product Phase 3 | **Later** |
| **5** Clinical trial intelligence | Workflow D + Caps 16–20 | Product Phase 4 | **Later** |
| **6** Cross-domain workflows | X-B/C/D/E + Workflow C/E hardening | Product Phase 5 | **Later** |
| **7** Evaluation & optimisation | Baselines→targets; cost/latency | Product Phase 6 eval | **Ongoing after 3** |

---

## 2. Smallest coherent foundation

Ship **only** what Workflow B needs:

1. Typed tools: `resolveEntity`, `traverseNeighbourhood`, `retrieveEvidence`, citation verify (**Partial**→harden)  
2. Research orchestrator = ISI Ask/tool router with execution record (**Partial**→extend) — **not** CONDUCTOR clone  
3. Cap 8 + Cap 12 pipelines producing structured brief + claimTypes  
4. L5 citation + uncertainty; Gate C unchanged for publish  
5. Golden sets G-Ask / G-Mech baselines  

**Explicitly out of foundation:** Caps 1–6 productisation, Trials matcher, Type D investigator fleet, gut Cap 10 depth, hypothesis Cap 15 promotion.

---

## 3. Phase detail

### Phase 0 — Existing Agent Audit

| | |
|--|--|
| **Objective** | Inventory Aksh/ISI/hsi-core; reuse vs propose |
| **Deliverable** | [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) |
| **Acceptance** | Status honesty; no Navigator invention; diabetes path documented |
| **State** | **Complete** (this pack) |

### Phase 1 — Shared Tool Contracts

| | |
|--|--|
| **Objective** | Freeze OpenAPI/YAML for graph + evidence tools |
| **Reuse** | LHK-G D8; X-G1; engine APIs |
| **Risk** | Over-building clinical tools early |
| **Acceptance** | Contracts reviewed; no raw DB agent path |
| **Gate** | Founder D1–D6 |

### Phase 2 — Orchestration Foundation

| | |
|--|--|
| **Objective** | Controlled research workflow execution + audit fields |
| **Reuse** | askGrounding intent; SHIELD patterns for design |
| **Must not** | Merge clinical CONDUCTOR into hsi-core |
| **Acceptance** | Run record for research path; fail-closed on tool error |

### Phase 3 — Biomedical Investigation (M1)

| | |
|--|--|
| **Objective** | Workflow B end-to-end brief |
| **User value** | Researcher gets cited mechanism explanation + uncertainties |
| **Dependencies** | Phases 1–2; ISI KG preserved |
| **Acceptance** | Golden-set baselines; zero fabricated cites on harness |
| **Deliverable** | M1 Biomedical Discovery Brief |

### Phase 4 — Clinical Context Intelligence

| | |
|--|--|
| **Objective** | Workflow A on synthetic FHIR; Caps 1–6 via Aksh gateway |
| **Dependencies** | Synthetic fixtures; DPIA; still LIVE_ORGANISATIONS=0 until safety case |
| **Acceptance** | Provenance + missing-data warnings |

### Phase 5 — Clinical Trial Intelligence

| | |
|--|--|
| **Objective** | Workflow D; five criterion states; Cap 20 freshness |
| **Dependencies** | Disease context from Phase 3; X-D1 |
| **Acceptance** | Zero confirmed-eligible; investigator review UX |

### Phase 6 — Cross-Domain Workflows

| | |
|--|--|
| **Objective** | Connect clinical concepts ↔ mechanisms ↔ trials (X-B/C/D); Workflow C/E |
| **Dependencies** | Working contracts + plane firewall red-team |
| **Acceptance** | No PHI in research logs/tools |

### Phase 7 — Evaluation and Optimisation

| | |
|--|--|
| **Objective** | Baselines→confirmed targets; cost/latency; promote Type D only if beats pipelines |
| **Acceptance** | CSO/scientific sign-off where clinical; research expert sample |

---

## 4. Stop for founder approval

Before **any** application code for orchestration, agents, or new Caps outside docs/strategy:

1. Approve §5 pack (architecture, audit, catalogue, workflows, tools, safety, verification, eval, observability, this roadmap).  
2. Confirm M1 = Workflow B research-first (not clinical Workflow A).  
3. Confirm D4: no CONDUCTOR in hsi-core.  
4. Confirm planes/Neon isolation unchanged.  

**This document does not authorise implementation.**
