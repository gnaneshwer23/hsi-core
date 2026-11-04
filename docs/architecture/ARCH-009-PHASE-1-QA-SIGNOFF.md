# ARCH-009 Phase 1 final QA and sign-off record
Date: 2026-11-04
Status: CONDITIONAL — CI and compatibility review pending; not authorisation for Phase 2 production activation.

## Delivered
- ADR-009 role/reuse audit, unified deny-by-default manifests and bounded run envelope.
- Read-only ARCH-003 compatibility adapter. It does not change investigation snapshots or claim that historical runs executed.
- Fail-closed unknown epistemic types at both published-graph interrogation and candidate graph-release assessment.
- Contract and regression tests for role permissions, research/clinical data isolation, immutable adaptation, and unknown evidence types.

## Compatibility and scientific governance findings
1. Two existing fingerprints have distinct historical semantics: fingerprintInterrogativeInvestigation uses JSON.stringify insertion order, whereas fingerprintReviewSnapshot and persistence use canonical sorted-key JSON. Do not replace historical hashes in place. Define explicit hash algorithm/version and migration strategy in Phase 2 before using fingerprints across APIs.
2. Migration 008's UNIQUE(investigation_id) makes review decisions one-shot, even if request_revision returns a draft state. Do not represent revision resubmission as supported. Plan revision IDs, immutable snapshots, append-only round decisions and reviewer-authority revalidation in Phase 2.
3. Reviewer read access to investigation snapshots is not yet exposed independently of owner-only research reads. Reviewer workbench is incomplete.
4. API staging deployment, authenticated researcher/reviewer sessions, evidence releases and real SSc evaluations remain blocked. No scientific-validation claim.
5. The legacy UI research orchestrator is deterministic local analysis; do not count it as a live agent runtime.

## Sign-off gates
- [x] Nine roles have explicit tool allowlists and bounded manifests.
- [x] Research agents deny identifiable clinical data.
- [x] Legacy investigation adapter preserves original records.
- [x] Unknown evidence types are rejected by graph-release gate.
- [ ] Latest full GitHub CI run passes.
- [ ] Hash algorithm versioning and reviewer revision-chain design approved.
- [ ] End-to-end authenticated reviewer workflow (deferred by product decision).

## Next work
Once CI passes, record a Phase 1 *contract readiness* sign-off only. Keep staging workflow validation as a separately tracked dependency. Phase 2 begins with hash/version and revision-chain design before executing agents. No production or staging migration performed by this milestone.
