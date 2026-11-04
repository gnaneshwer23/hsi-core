# ARCH-002 Phase 3.7 — Restricted Clinical Context and Privacy-Preserving Biological Links
Date: 2026-11-04
Status: Contract implementation committed; CI and operational authorisation integration pending.

## Alignment
HSI Clinical and Aksh retain patient records in separately governed clinical systems. ISI and public biomedical knowledge remain distinct. The logical patient-context layer does not imply a shared physical database. No patient-identifiable facts are written into the biomedical graph.

## Implemented
- Trusted-server-only patient-scoped bridge interface requiring authenticated direct-care grant, matching patient reference, grant identifier and expiry.
- Separate clinical fact reader and approved biomedical graph reader; no cross-store patient fact copying.
- Read-only linkage via clinical code lookup; approved public biomedical nodes only.
- Rejects cross-patient clinical facts, expired grants, unapproved/restricted biological responses, oversized results.
- Returns only approved biological concept summaries and advisory, not clinical facts, codes or raw patient timeline.
- Tests for direct-care authorisation, cross-patient isolation, clinical expiry and biomedical scope.

## Deferred and mandatory before real patient use
- Server-side grant verification and revocation; clinical access decisions must come from an authoritative provider, not client JSON.
- UK GDPR lawful basis, care-team membership, purpose limitation, audit, consent where applicable, DPIA and DCB0129/0160.
- Real FHIR/SMART-on-FHIR patient record adapter, terminology mapping and approved graph-release checks.
- Response suppression and inference controls for rare conditions or small cohorts; patient identifiers must not appear in logs or research telemetry.
- No clinical diagnosis, treatment recommendation or trial eligibility decisions.
- Phase 3.4 Neon migration and authenticated graph query E2E remain deferred by user.

No production deployment, DB migration, external record ingestion or patient-data processing performed.
