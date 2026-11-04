# ARCH-002 Phase 3.8 — Living Health Knowledge Graph Integration, Scientific QA and Research Workbench
Date: 2026-11-04
Status: Read-only workbench projection committed; CI pending. Phase 3 not operationally signed off.

## Reuse and integration
The workbench composes Phase 3.1 canonical nodes/relationships, Phase 3.3 temporal evidence dossiers and QA, and supports source records from Phase 3.5 science and Phase 3.6 microbiome/trials adapters. It does not replace the existing ISI explorer, ontology resolver, graph-release authority or clinical privacy bridge.

## Delivered
- src/hsiResearchGraphWorkbench.ts builds bounded, read-only focus-node projections.
- Preserves relationship epistemic type, review state, evidence IDs and dossier assessment; labels missing dossiers, contested sources and unapproved hypotheses.
- Validates canonical graph integrity and rejects restricted clinical/patient nodes.
- Summarises reviewed, contested and missing-dossier counts.
- test/hsiResearchGraphWorkbench.test.ts covers unapproved drafts, filtering, patient isolation and query limits.

## Mandatory remaining work
- Trusted authenticated query API and governed Neon persistence (Phase 3.4 operational verification deferred by user).
- Real scientific graph import and cross-domain ontology reconciliation, authoritative dossier retrieval and reviewer revocation checks.
- Performance, accessibility, scientific curator acceptance, UI integration with the existing ISI research workbench and end-to-end tests.
- Research access must be authorised upstream; this pure projection must not be exposed as a public endpoint.
- Patient clinical access grant verification (Phase 3.7) remains deferred.
- No production deployment, migration or real patient data use.

## Scientific safety
Drafts, computational inference and unvalidated hypotheses are never automatically approved. QA flags are advisory and cannot substitute for human review. Release gating remains in graphRelease.
