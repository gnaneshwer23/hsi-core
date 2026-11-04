# ARCH-002 Step 4 — Versioned graph publication and retrieval

**Status: release-assessment and snapshot-query primitives committed. No live publication, database-backed retrieval, authenticated publishing endpoint, source-verified SSc release, or deployment.**

## Implemented

- `src/graphRelease.ts` provides `assessReleaseClaim`, `createCandidateManifest`, and `queryPublishedGraph`.
- Fail-closed candidate checks: approved claim status, authorised current reviewer decision, traceable source versions, no unresolved retraction/correction state, rights classification, positive supporting evidence, no unadjudicated contradictions, no unvalidated hypotheses or computational inference.
- Candidate manifest has a deterministic SHA-256 content hash of release metadata and claim IDs and **status=candidate**, not published.
- Snapshot query is bounded (1–100) and returns release metadata, evidence provenance, biological context and review decision ID. It filters revoked/invalid claims.
- Tests exercise rejection, revocation, provenance and query limits.

## Explicit security and scientific limitations

**These are pure functions, not an authoritative publication service.** A caller can fabricate an in-memory `PublishedReleaseSnapshot`; do not expose `queryPublishedGraph` directly to untrusted clients or treat its input status as proof of publication. The current manifest hash includes claim IDs but not canonical claim payloads or evidence/reviewer versions; it is **not** a cryptographic signature or tamper-evident scientific release.

Current `metadata_only` classification means metadata may be retained, **not** that the underlying publication supports the asserted biological claim. A genuine publication gate must require scientifically verified passages/measurements and licence clearance, independently checked by authenticated scientists.

Do not write `published` rows to `hsi_evidence_graph_releases` using these helpers alone.

## Next hardening gates (mandatory before live publication)

1. Fix Step 3's outstanding trusted identity provider integration and server-side role resolution; enforce DB grants/RLS and reviewer conflict-of-interest policy.
2. Complete Step 2's rights-verified claim-level passage/measurement linkage and controlled terminology mapping; ensure no unknown retraction state is silently cleared.
3. Build HSI-owned DB transaction for publication with locks, latest review/revocation validation, source/passage consistency and manifest hash covering canonical immutable claim/evidence/review snapshots.
4. Require explicit authorised release-manager sign-off, immutable release ledger and revocation/supersession events; validate signatures or trusted attestation.
5. Implement DB-backed, release-ID-scoped query with permission checks and no patient data. Never accept arbitrary client-provided snapshots as authority.
6. Add integration tests for concurrent review/revocation, release rollback, evidence corrections, source rights changes, data isolation and Aksh/ISI outage.
7. Verify SSc evidence with qualified scientist and publish only after all gates pass.

**This commit does not claim ARCH-002 Step 4 is production-ready.**
