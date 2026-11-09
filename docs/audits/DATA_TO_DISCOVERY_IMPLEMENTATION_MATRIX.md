# Data-to-Discovery Implementation Matrix

**Brief:** CURSOR MASTER IMPLEMENTATION PROMPT — HSI End-to-End Data-to-Discovery Intelligence Architecture  
**Status:** Gap audit + highest-leverage new slice selection — **not** production readiness, **not** scientific validity.  
**Date:** 2026-11-09  
**Audited `main` SHA:** `13bfa91ea8be156ec9affc2220a5d6ca5466b1af`  
**Tip commit:** `13bfa91 Add Data-to-Discovery audit matrix and Technology connection map (#87)`  
**HSI Neon:** red-wave only (`human super intelligence` / `hsi-neon-project` / `ep-hsi-production…`) — never autumn-snow / Akeno / DeliverX  

**Cross-links (do not contradict):**

- [`BACKEND_INTEGRATION_MATRIX.md`](./BACKEND_INTEGRATION_MATRIX.md) — refined-brief status vocabulary  
- [`../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md`](../engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md) — eng Phase 1–8 execution evidence  
- [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) — #2 / #4 / #5 PARKED  
- [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) — no live CDS/PHI  
- Milestone 2 contextual / contradiction audit: [`MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md`](./MILESTONE2_CONTEXTUAL_REASONING_MATRIX.md) (orthogonal follow-on; do not contradict)
- Milestone 3: [`MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md`](./MILESTONE3_HYPOTHESIS_EXPERIMENT_MATRIX.md) · Milestone 4: [`MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md`](./MILESTONE4_TRANSLATIONAL_FAILURE_MATRIX.md)

**Shipped after #87:** thin UniProt metadata-only adapter (`src/evidence/uniprotMetadataLookup.ts`) wired into dynamic retrieval + Technology status (`partially_implemented` / connected-metadata). Fixtures ≠ live.

---

## Status vocabulary (this brief)

| Status | Meaning |
|--------|---------|
| `implemented` | Code exists and is exercised in library/UI paths |
| `integrated` | Implemented and wired into a product/research surface |
| `partially implemented` | Meaningful path exists; required adapters, live wiring, or honesty gates incomplete |
| `fixture-only` | Works only with static fixtures, seeded packs, or hardcoded IDs |
| `blocked` | Implementation or journey cannot complete without human/config gate |
| `missing` | No meaningful implementation for this brief requirement |

Maps from refined-brief matrix: `connected` → `integrated`; `partially_connected` → `partially implemented`; `fixture_only` → `fixture-only`; `blocked` / `missing` unchanged.

Honesty freeze: no Gate C auto-approve · no invented MoU / `legalBinding` · no live CDS/PHI · no patient eligibility · fixtures ≠ live evidence · CI green ≠ scientific validity · Open Targets score ≠ causation.

---

## What eng 1–8 + refined-brief already covered vs this brief

| Track | Covered on audited `main` | Newly asked by Data-to-Discovery brief |
|-------|---------------------------|----------------------------------------|
| Eng PRs **#72–#79** | Audit → dynamic retrieve → persist/dedup → contextual/release-aware → bounded agent → oppose/gap → translational/brief → independent eval | Do **not** rebuild; consume as substrate |
| Refined **#83–#85** | Europe PMC `cursorMark`; OT score honesty; `scientific_benchmark_v1` alias + execution-record projection | Keep; do not fork parallel eval stacks |
| Product steps **#67–#70** | Spec/register; unified journey 01–06 UI; living evidence metadata; agent/gap step | Journey UI exists; live Ask→export still #5 |
| Technology page | Conceptual `TechnologyFlow` + editorial NEXUS/SSc sections | **Interactive architecture with real adapter status + workbench links** (Step 8) |
| Identifier registries | Ontology **prefixes** for HGNC / UniProt / GO / Reactome in `hsiOntologyRegistry.ts` | **Live adapters** for UniProt / Reactome / GO / ChEMBL / HGNC |
| Single-cell / atlas | Mentions in marketing + optional ISI vision only | **HCA / CELLxGENE** governed adapters |
| Omics | P3 model adapters (AF3/ESM/…) use public UniProt **fragments** as fixtures | **Omics interfaces** as first-class ingest planes |
| Continuous updates | Living-evidence metadata refresh; N5 registry refresh prep (human-gated) | **Step 7 continuous refresh** review-candidate loop |
| SSc Tfh / IL-21 | Draft graph + abstract verification fixtures + workbench probes | **Step 9 live E2E** (must not invent success) |

---

## Implementation matrix

| Layer | Existing implementation | Working status | Missing functionality | Files to modify | Tests |
|-------|------------------------|----------------|----------------------|-----------------|-------|
| **Data sources** | Europe PMC bibliographic + SSC discovery; Open Targets GraphQL; ClinicalTrials.gov lookup; Crossref licence assist; curated PMID source registry; ontology ID prefixes (HGNC/UniProt/GO/Reactome); **thin UniProt metadata-only adapter** (accession → name/genes/organism; dynamic-retrieval wire; fixture-gated + live-optional) | `partially implemented` (literature/OT/CT.gov + UniProt metadata) · identifier prefixes `implemented` · Reactome/GO/ChEMBL/HGNC **live fetch** `missing` · HCA/CELLxGENE `missing` · clinical/Aksh planes `blocked` / out-of-scope for public research | Live Reactome / GO / ChEMBL / HGNC adapters; HCA/CELLxGENE; rights-cleared omics packets | `src/evidence/uniprotMetadataLookup.ts`; `src/evidence/*Lookup.ts`; future biology stubs only when scheduled | `test/uniprotMetadataLookup.test.ts`; `test/dynamicEvidenceRetrieval.test.ts` |
| **Ingestion** | `dynamicEvidenceRetrieval` → search records; SSC Europe PMC discovery; R1 biomedical source-packet quarantine scaffold | `partially implemented` · passage import `blocked` (#2) | Continuous ingest with provenance; omics/single-cell pipelines; rights-cleared full-text | `src/evidence/dynamicEvidenceRetrieval.ts`; `n1*` / R1 quarantine | Retrieval + n1/r1 checks |
| **Evidence storage** | Neon red-wave migrations; `dynamicEvidencePersistence` identity dedup; experiment ledger `review_candidate`; source registry JSON | `partially implemented` · staging writes `blocked` (#5) · fixtures still power many surfaces | Production write-path acceptance; passage store after #2 | `src/evidence/dynamicEvidencePersistence.ts`; `src/db/*` | Persistence / ledger tests |
| **Knowledge graph** | Domain graph + versions; living-evidence expansion metadata; contextual candidate relationships; typed science graph UI; gap/relationship envelopes (main tip; #86 may refine further) | `partially implemented` · draft≠approved · no auto-promote | Broader ontology-backed edges from live adapters; SME-verified novelty | `contextualCandidateRelationships.ts`; domain-graph packs | Contextual / bounded-agent / domain-graph sync |
| **Research agents** | Bounded agent vertical stages; opposing-evidence + gap taxonomy; claim verifier adapter; Science research workbench (deterministic local) | `partially implemented` · live journey `blocked` (#5) | Autonomous multi-provider agents **out of scope** as parallel stack; deepen honesty only | `boundedAgentExecution.ts`; site science agents page | Bounded-agent / gap tests |
| **Governance** | Scientific review validators; Gate C checklist (human); CDS/PHI boundary; N1 rights eng-assist; release-aware draft gates | `integrated` (validators/boundary) · rights/SME/MoU `blocked` | Human principal attestations (#2); SME gold (#4); MoU (#8) — eng must not invent | Review stores; n1 worksheets; human-queue | `scientificReview` / n1 / human-queue checks |
| **Research outcomes** | `researchOutcome` DTO; `ResearchOutcomePanel` 01–06; decision-workbench; translational O-04 attach; research brief bind | `integrated` (UI compose) · scientific validity `blocked` | Live Ask→export completion (#5); scored gold (#4) | `ResearchOutcomePanel.tsx`; `investigationSections.ts` | Step-02 / outcome / r3 tests |
| **Frontend visualisation** | `TechnologyFlow` conceptual 5-stage infographic; Technology page NEXUS/SSc editorial explorers; science graph visuals | `partially implemented` — architecture story exists; **honest live status map was missing** | Contained interactive Data-to-Discovery diagram with real/not-connected status + workbench 01–06 links (this PR) | `Technology.tsx`; new `DataToDiscoveryArchitecture*`; status registry module | `test/dataToDiscoveryArchitecture.test.ts`; technology hero tests |
| **Continuous updates** | Living-evidence metadata refresh when PMIDs overlap; N5 registry live-refresh **prep** (human-gated); experiment ledger review-candidate lifecycle | `fixture-only` / `blocked` for live refresh | Step 7 scheduled refresh → review-candidate hook without auto-approve; no silent graph publish | Future thin hook near `experimentLedger` / living-evidence | Ledger lifecycle + honesty asserts |

---

## Vertical slice honesty (SSc Tfh / IL-21)

| Stage | Status |
|-------|--------|
| Draft graph / abstract verification fixtures | `fixture-only` |
| Workbench probes + science pages | `partially implemented` |
| Live authenticated E2E Ask→brief→review | `blocked` (#2 rights, #4 SME, #5 live journey) |
| Claim of live scientific success | **Forbidden** until humans clear gates |

Checklist template (records blockers only): [`SSC_TFH_IL21_LIVE_E2E_VALIDATION_CHECKLIST.md`](./SSC_TFH_IL21_LIVE_E2E_VALIDATION_CHECKLIST.md)

---

## Highest-leverage missing deliverable chosen

**Shipped (#87):** Step 8 — Interactive Data-to-Discovery visualisation on the Technology page.

**Shipped (this slice):** Thin governed UniProt metadata-only adapter — extend evidence lookup patterns; Technology UniProt status → `partially_implemented` (connected-metadata); fixtures ≠ live.

**Recommended next:** Reactome or GO stub (same metadata-only pattern) **or** continuous review-candidate refresh hook (Step 7) — both remain higher leverage than inventing live SSc E2E success.

**Out of scope still:** Steps 1–7 full multi-provider builds, Step 9 invented live success, Gate C/MoU/CDS, autumn-snow Neon.

---

## Anti-patterns (binding)

- Do not rebuild the platform or parallel evidence/graph/agent stacks.  
- Do not invent rights clearance, Gate C auto-approve, MoU, PHI/CDS, or production readiness.  
- Do not treat fixtures or CI green as scientific validity.  
- Do not merge autumn-snow / Akeno / DeliverX Neon into HSI substrate.  
- Diagram navy/cyan/violet palette stays **contained** inside the visualisation — do not retheme site chrome.
