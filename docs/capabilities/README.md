# HSI governed capability build pack

Human Super Intelligence. Implemented on `/research/capabilities`, accessible from research navigation and dashboard tools. All local rehearsals start off and are excluded from public marketing/sitemap indexing.

1. [Capability scope and release plan](01_SCOPE_AND_RELEASE_PLAN.md)
2. [Synthetic real-world data specification](02_SYNTHETIC_REAL_WORLD_DATA.md)
3. [Live patient workflow — design only](03_LIVE_PATIENT_WORKFLOW.md)
4. [Community publishing and moderation](04_COMMUNITY_PUBLISHING_AND_MODERATION.md)
5. [Automatic graph promotion — shadow only](05_AUTOMATIC_GRAPH_PROMOTION.md)
6. [Real-world scenarios and QA](06_SCENARIOS_AND_QA.md)

Implemented code: `src/capabilities/` and `site/src/pages/CapabilityLab.tsx`. Synthetic data generation accepts only a numeric seed and bounded size; community accepts registered samples only; shadow outputs cannot publish. No new live endpoint, database migration, clinical pipeline, actual private community or scientific promotion is enabled.

The live-patient and automatic-publication portions of the supplied suggestion are design requirements, not authority to bypass the existing no-PHI/no-CDS and human-review boundaries. Real owners, clinical/legal approvals, moderation response commitments and partner agreements remain unassigned/unverified.

## Validation

Candidate `634a2a9` passed 799 core tests and 172 Chromium browser checks, core/site builds and frontend type checking. A CLI scale run generated 1,250 synthetic profiles, 11,250 scheduled visits and 155,225 events; repeated small-pack output hashes matched. The review archive contains the scale dataset, manifest and six specifications. None of these results establishes clinical calibration, privacy certification, live community safety or scientific approval. See [the engineering receipt](../../operations/qa/2026-11-06/capability-pack-results.json).
