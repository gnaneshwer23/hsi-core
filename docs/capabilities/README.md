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
