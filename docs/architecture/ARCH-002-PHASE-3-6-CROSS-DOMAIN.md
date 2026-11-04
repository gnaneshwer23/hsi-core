# ARCH-002 Phase 3.6 — Gut–Immune–Metabolic and Trial Connections
Date: 2026-11-04
Status: Draft adapter and bounded traversal implemented; CI pending.

## Alignment
The single HSI ecosystem retains separate Aksh Health, HSI Clinical, ISI and HSI Trials products. Phase 3.6 extends the living graph, not a new independent product. Existing ontology registry, temporal dossier, scientific review and graph-release authority remain authoritative.

## Delivered
- Typed source record contract for microbiome, metabolomics, immune assays and trial registries.
- Source ID, version, retrieval time, evidence references and biological/population context are mandatory.
- All imported relationships remain governed research drafts; no automatic causality, approval, publication, patient-level inference or trial eligibility.
- Trial-registry records limited to EVALUATED_IN relationship drafts, not computable eligibility.
- Bounded in-memory cross-domain traversal with 1–3 hops, 1–100 relationships and allowed non-patient layers; rejects out-of-scope data.
- Automated regression tests for provenance, trial separation, epistemic safety and query bounds.

## Outstanding
- Authoritative source connectors (microbiome repositories, metabolomics, trial registries), licence and version validation.
- Entity identity linking through reviewed ontology mappings; duplicate entity reconciliation.
- Scientific dossier verification, contradictory evidence adjudication and human review.
- Governed Neon persistence and authenticated query API from Phase 3.4 (deferred user verification).
- Cross-source node-layer reconciliation and canonical multi-layer joins; current traversal requires a prevalidated single graph.
- ClinicalTrials.gov criteria extraction and trial eligibility are separate later phases.
- Performance/security and live integration E2E before sign-off.

No DB migration, production deployment, patient ingestion or external data import performed.
