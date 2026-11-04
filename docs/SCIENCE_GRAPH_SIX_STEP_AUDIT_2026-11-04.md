# HSI Science Knowledge Graph — six-step audit (4 November 2026)

## Scope and verdict
Code review of the six implemented modules on main: typed schema, evidence dossiers, multi-hop traversal, contradiction candidates, clinical/trial bridge, and research workbench. Regression checks added in this branch. This is not an independent clinical validation, penetration test, Vercel deployment verification or review of live scientific sources.

| Step | What exists | Audit outcome |
| --- | --- | --- |
| 1 Typed graph | 19 predicates, typed entities, edge context, review states | Hardened approval validation to require supported linked sources and reviewer metadata. |
| 2 Evidence | Source-to-claim assessments, warning dossiers | Hardened to disallow a source-level unassessed record from satisfying the review-ready gate. |
| 3 Multi-scale paths | Bounded directional traversal, draft opt-in | Excluded rejected and retired edges even with draft opt-in. |
| 4 Contradictions | Opposing predicates, context differences, contested status | Excluded rejected and retired edges from candidate detection. |
| 5 Clinical/trials | Synthetic numeric trial criteria evaluation | Clarified that a numerically met exclusion threshold is an exclusion trigger, not an eligibility success. |
| 6 Research | Deterministic local five-workstream report | Contradiction workstream now blocked when no approved claims exist. |

## Open limitations / release gates
1. **No curated biomedical assertions in the public typed graph.** It is a ten-entity editorial graph with unreviewed topic associations, not a validated causal or multi-scale biomedical graph.
2. **Evidence approvals are still data-structure checks.** No authenticated, persistent reviewer identity, independent verification workflow, signature, or audit log is implemented. Supported-source metadata alone is not proof of scientific validity.
3. **Evidence dossier and typed graph remain separate data flows.** Assessments are passed in memory; no authoritative evidence curation service or durable provenance store.
4. **Clinical and trial bridge is synthetic only.** No patient data, FHIR ingestion, live trial-registry API, terminology normalization, consent management, computable full eligibility, or clinician confirmation.
5. **Research workbench is not agent execution.** No external scientific AI model, literature retrieval, orchestration service, reproducible analysis execution or human approval queue.
6. **UI, safety, and operational readiness need separate audits.** CI tests do not establish accessibility compliance, real-world scientific validity, security, or successful production deployment.

## Next implementation recommendation
Prioritize a source-backed systemic sclerosis evidence corpus, terminology identifiers, versioned claim-level provenance and authenticated scientific review before enabling autonomous scientific claims or patient-level functionality. Keep Aksh, Clinical, ISI and Trials logical domains separated by privacy and governance boundaries.
