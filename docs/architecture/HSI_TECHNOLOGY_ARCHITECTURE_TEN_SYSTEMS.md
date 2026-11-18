# HSI — Technology Required to Achieve the Definitive Vision

**Frozen:** 18 November 2026 (Europe/London) — founder technology foundation for HSI 1.0  
**Product north star:** [`../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md`](../strategy/HSI_DEFINITIVE_PRODUCT_VISION.md)  
**Capability map (code ↔ systems):** [`hsi-ten-systems-capability-map.v1.json`](./hsi-ten-systems-capability-map.v1.json)  
**Honesty:** These are **logical capabilities**, not ten microservices or ten products. Reuse `hsi-core`. Do **not** introduce a separate graph DB, vector DB, Kubernetes cluster or complex multi-agent framework until testing proves the current architecture cannot meet a defined requirement.

---

## 1. Complete architecture (one platform)

```
HSI Scientific Intelligence
└─ One connected platform across six biological domains
   ├─ 01 · Research Experience
   │     Research Workbench · Mechanism Explorer · Research Briefs
   ├─ 02 · Scientific Intelligence Engines
   │     Evidence Retrieval · Context Intelligence · Mechanism Reasoning
   │     Scientific Verification · Contradiction & Gap Analysis · Hypothesis Intelligence
   ├─ 03 · Scientific Knowledge Foundation
   │     Biomedical Ontologies · Evidence & Provenance · Knowledge Graph · Scientific Decision Memory
   └─ 04 · Platform Infrastructure
         Neon PostgreSQL · Vercel · Auth · API · AI Providers · GitHub Actions · Monitoring · Security · Evaluation
```

---

## 2. The ten technology systems

| # | System | Band | Role |
| --- | --- | --- | --- |
| 01 | Biomedical Data & Evidence Ingestion | Foundation | Retrieve publications/metadata/permitted full text; normalise; versions, licences, retractions, provenance |
| 02 | Biomedical Ontology & Knowledge Graph | Foundation | Linked entities/relationships with evidence on assertions |
| 03 | Biological Context Intelligence | **Core USP** | Species, cell, tissue, model, exposure, dose, time, endpoint; preserve missing/ambiguous |
| 04 | Scientific Verification Engine | **Core USP** | Support/oppose, source status, independent assessment, abstain when insufficient |
| 05 | Mechanism Investigation Engine | Core | Evidence-grounded paths; observation vs hypothesis |
| 06 | Contradiction & Research Gap Intelligence | **Core USP** | Context-matched disagreements vs contextual differences; missing evidence |
| 07 | Scientific Investigation Orchestration | Core | Durable retrieval → extract → graph → verify → report workflows |
| 08 | Scientific Decision Memory | Core | Investigations, snapshots, judgments, uncertainty; no silent overwrite of approved conclusions |
| 09 | Hypothesis & Experimental Intelligence | **Later** | Testable hypotheses, alternatives, discriminating experiments — validation-gated |
| 10 | Unified Scientific Research Workbench | UX | One interface for questions, evidence, mechanisms, context, verification, briefs |

**Highest-priority technical differentiator:** Biological Context Intelligence (03), tightly coupled to verification (04) and mechanism investigation (05).

---

## 3. Shared scientific data model (binding)

A claim must not exist in isolation. It links:

| Node | Contents |
| --- | --- |
| **Scientific Claim** | Assertion under investigation |
| **Source** | Publication, passage, version, rights |
| **Context** | Species, tissue, model, dose, endpoint, … |
| **Mechanism** | Biological entities and relationships |
| **Verification** | Assessment, uncertainty, provenance |
| **Versioned Scientific Investigation Record** | Evolving investigation without silent rewrite |

**Mandatory distinctions:** source-reported claims ≠ model interpretations ≠ hypotheses ≠ scientifically approved findings. Never treat AI interpretations as established biology.

---

## 4. Backend / infrastructure freeze

| Layer | Approach |
| --- | --- |
| Application backend | Retain existing HSI API/server runtime |
| Scientific database | Neon PostgreSQL (HSI red-wave only) |
| Graph persistence | Existing graph schema; extend only when needed |
| Vector search | PostgreSQL + pgvector **if** justified and supported |
| Search | Hybrid lexical + semantic with source filters |
| AI models | Provider-independent adapters; controlled cost |
| Long-running tasks | Existing durable execution architecture |
| Data validation | Typed schemas + ontology constraints |
| Security | Server-verified identity, tenant isolation, least privilege |
| Deployment | Vercel + isolated previews |
| Testing | GitHub Actions; unit / integration / security / scientific evaluation |
| Monitoring | Structured traces, cost, failures, reliability |

**Rejected until evidenced need:** separate graph database, standalone vector database, Kubernetes, greenfield multi-agent framework, architecture redesign for its own sake.

---

## 5. Build stages (exit gates)

| Stage | Focus | Exit gate |
| --- | --- | --- |
| **A — Trusted scientific foundation** | Ingestion, provenance, authoritative source checks, auth, persistence, verification evaluation | Real-source scientific evaluations + security tests pass |
| **B — Context-aware mechanism intelligence** | Context Passport, context matching, evidence comparisons, mechanism integration | Independent experts can reproduce and assess HSI classifications |
| **C — Unified researcher experience** | Premium Research Workbench, investigation memory, source-linked reports | Researchers complete real end-to-end investigations |
| **D — Advanced scientific discovery** | Hypothesis intelligence, experimental recommendations, deeper cross-domain reasoning | Expert-reviewed hypotheses + measurable usefulness |

Not all ten systems ship simultaneously. System 09 stays Stage D / later until core validation.

---

## 6. What must be measured

| Metric | Measures |
| --- | --- |
| Evidence grounding accuracy | Cited passages genuinely support conclusions |
| Context extraction accuracy | Biological/experimental conditions correctly captured |
| Contradiction classification quality | Conflicts interpreted appropriately |
| Abstention calibration | Insufficient evidence recognised |
| Mechanism traceability | Relationships evidence-linked |
| Investigation completion | Useful end-to-end investigations finishable |
| Researcher utility | Research quality/efficiency improvement |
| Cost per investigation | Economic sustainability |

Benchmarks: independent expert annotation, clear error categories, comparisons against realistic alternative workflows. Advantage is **earned**, not assumed.

---

## 7. Implementation decision (frozen)

Build HSI as a **modular scientific intelligence platform** with:

- one shared evidence and context model  
- one governed knowledge graph  
- one verification architecture  
- one integrated research workspace  

Immediate work: map the ten capabilities to existing code ([`hsi-ten-systems-capability-map.v1.json`](./hsi-ten-systems-capability-map.v1.json)), close verified gaps under Stages A→C, and refuse another major architecture redesign without evidence that the current design cannot support the required scientific workflow.

This is the technology foundation for **HSI 1.0**. Advanced hypothesis generation and autonomous discovery wait for later validated releases.
