# Stage B — Parallel SSc and RA research tracks

## Decision
Run **SSc** and **RA / anti-TNF** as separate research tracks. Preserve the existing locked RA Stage 1 benchmark, rights-screened release and synthetic working set. Start SSc curation without importing unverified scientific claims.

## First implemented slice
- `src/stageBResearchTracks.ts`: explicit track identities, questions, distinct evidence/review namespaces, and fail-closed review evaluation.
- `test/stageBResearchTracks.test.ts`: track isolation, missing rights/review, cross-track review rejection, stale version, rejected reviewer decision, positive gate contract.
- The positive gate test uses a **fictional review object** to test policy logic; it is not an approved scientific result.
- No database migration, clinical data access, production API, agent execution, or new scientific findings are claimed.

## Next Stage B milestones
1. **B1 — SSc source registry and rights screening.** Register publications and licences with retrieval receipts; do not treat paper metadata or a conceptual mechanism as evidence support.
2. **B2 — Track-scoped investigation API.** Persist track ID, dataset version, source citations, query scope and bounded outputs. Server-side authorisation must precede data access.
3. **B3 — Human review workflow.** Durable reviewer identity, decision, timestamp, evidence digest and immutable audit event; publication requires independently verified rights and approved scientific review.
4. **B4 — ISI evidence graph projections.** Expose approved edges and separate proposed hypotheses with provenance and uncertainty. Keep SSc and RA review histories independent.
5. **B5 — Bounded research agents.** Retrieve/compare/critique in a supervised workbench, never autonomously approve claims.
6. **B6 — Cross-disease comparison.** Read-only SSc↔RA analysis with source context, uncertainty and no transfer of approval between tracks.

## Release gates
- No identifiable patient data or live EHR integrations.
- No diagnosis, prescribing, risk prediction, autonomous trial matching or trial eligibility confirmation.
- No automated promotion of hypotheses into the approved graph.
- No claims of verified SSc evidence until source rights, study context and scientist review are documented.
- Keep HSI and ISI stores governed separately; reuse validated interfaces, not shared credentials.
