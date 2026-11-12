# P1-A Context-Conflict Audit: implementation and acceptance boundary

Status: engineering candidate; **P1-A live acceptance is NOT achieved**. This document does not authorize deployment, source rights, reviewer grants, migration activation or scientific thresholds.

## Implemented code

- `src/evidence/passageLinkedContext.ts`: seventeen passage-linked fields including estimand and uncertainty. Exact UTF-16 spans and original text are preserved alongside explicit missingness. Basic deterministic concentration/time/count conversion never crosses mass/molar dimensions. Human/mouse taxonomy aliases are built in; additional ontology aliases require a server-approved registry hash. This is normalization, not ontology curation or extraction accuracy evidence.
- `src/evidence/structuredEvidenceComparison.ts`: extends the existing engine, version 0.3.0. Exact directed entity/predicate alignment and detailed context/estimand comparability precede polarity interpretation. Coarse compatibility remains available to old consumers, but cannot count as detailed P1 evidence.
- `src/evidence/contextConflictAudit.ts`: disabled-by-default bounded coordinator with trusted search, clearance, extraction, verifier and immutable-append dependencies. Both support and oppose searches are attempted. Failed/empty searches remain coverage gaps. All returned passages require current storage/display/comparison/export clearance before extraction. Exact source/version/text/receipt and approved normalizer bindings are checked. Clearance is rechecked before storage. Five-class reporting adapts the existing comparison engine; causal/therapeutic bridges remain insufficient evidence. Existing contradiction-to-gap assessment is reused.
- `src/server/boundOutcomeAttachments.ts`, `src/server/investigationDeliveryService.ts`, `src/db/investigationDeliveryStore.ts`, `src/server/interrogativeApi.ts`, `src/researchOutcome.ts`: protected saved-outcome path accepts independently loaded server attachments bound to investigation, package, context, release manifest and attachment digest. Current authorization is mandatory on every read/export. No HTTP attachment blob or authorization flag is accepted. JSON and Markdown include detailed context and missingness. Projection invokes no search/model or write.
- `src/researchV2/sourceClearanceReceipt.ts`: action-scoped signed clearance; consumers may tighten but cannot weaken configured actions. Evaluation and provider consumers explicitly require model transmission. Storage/comparison permission never grants model egress.

The coordinator uses three logical responsibilities: bounded orchestration, evidence/context investigation and independent verification. It introduces no agent framework or additional specialist agents. Injected callbacks are contracts, not evidence of live external completion or persisted agent traces. The optional research planner is unnecessary for this increment.

## Deliberately unactivated dependencies

No real source search/extractor/verifier is configured by default. Model-backed callbacks must use the P0-B approved deployment/budget service, hardened transport and separate model-transmission clearance; artifact-use permissions alone are insufficient. No approved public/partner source policy or scientific approval is fabricated.

`append` must implement atomic compare-and-append against the previous hash, preserve prior immutable versions, authorize the investigation owner/tenant, and fence cancelled jobs. Version/hash checks in the coordinator do not implement durable storage transactions. The saved resolver must independently load that protected store and recheck current actor access, source actions, release membership, approved normalization registry and artifact integrity. A caller-provided artifact/hash is never independent authority. No new persistence table, migration or route is activated in this change.

Deadlines/cancellation abort dependency signals and prevent subsequent coordinator stages. A non-cooperative external operation may still finish. If append commits but acknowledgement is lost, treat completion as unknown; inspect durable state before retry. Multi-process quotas, crash recovery, persisted agent traces and incident evidence remain P0 operational requirements.

**Human review remains required on every audit.** Existing evidence-brief acceptance covers its original package and never transfers approval to a later context audit. Before live acceptance, implement a separate immutable audit-hash-bound decision with independent reviewer identity, active disease/tenant scope, no self-review, conflict declaration and evidence limitations. It must invalidate on a new audit hash/version or revoked grant. Do not derive audit approval from a legacy brief decision.

The saved primary investigation and delivery authority path is still SSc-centred. RA is supported by the offline detailed audit target and existing comparison context, but an RA comparison is not an RA primary audit. A full RA primary journey requires explicit primary-context/planner/schema/reviewer-scope propagation and security acceptance. Do not rename the SSc journey or broaden one reviewer role to claim cross-domain authorization.

## Ordered next changes and measurable release gate

1. **P0-B/C first for live execution.** Obtain independent source-policy/clearance operations, two approved provider deployments, isolated staging persistence, two researchers and an independent disease-scoped reviewer. Preserve individual migration holds until signed scope-specific evidence passes.
2. **Protected audit persistence and human review.** Implement the append/resolver contracts with owner/tenant checks and immutable audit-hash-bound decisions. Concurrent retry must produce one version/decision; stale previous hashes, self-review, wrong disease/tenant, revoked grants, cross-owner enumeration/export and forged session settings must fail through authenticated pooled HTTP requests. Demonstrate restore/rollback and current revocation checks.
3. **Approved provider and source integration.** Wire search/extraction/verifier callbacks through approved P0 services. Save query plans/receipts and redacted model run receipts in governed storage. Every material context value/conclusion must resolve to source identifier, release version, passage hash/span and current clearance. A failed or empty search must never establish consensus. No raw passages or credentials in operational logs.
4. **RA primary scope and staging journeys.** Complete explicit RA (or SLE with separately implemented scope) planning, saved context and reviewer authorization. An authorized SSc audit and one authorized RA/SLE audit must pass login → support/oppose search → extraction → comparison → gaps → verifier → independent review → reopen → JSON/Markdown export. Rerun creates a new immutable version; previous review never silently carries forward. Reject mismatched entities, missing critical context, incompatible estimands and unsupported causal bridges.
5. **Scientific validation separately.** Named scientific leads approve ontology/normalizer snapshots, case annotations and thresholds before holdout use. The immunology-wide 120-case benchmark determines cross-domain readiness; these two demonstrations and synthetic tests cannot establish scientific accuracy.

## Risk register

| Priority | Risk | Required control/evidence |
| --- | --- | --- |
| P0 | Rights or retraction change after acquisition | Trusted signed actions, refresh/revocation propagation and read/export rechecks; dependent-artifact flags |
| P0 | Artifact authority mistaken for browser-provided hash | Independent protected store/resolver and actor/package/release binding on every read |
| P0 | Legacy brief approval mistaken for audit approval | Separate immutable audit-hash review; current scoped grants; approval remains false |
| P0 | RA comparison mistaken for RA primary authorization | Explicit primary schema/planner/disease-scope propagation and real negative authorization tests |
| P1 | Compatible strings or normalized units mistaken for scientific comparability | Passage spans, explicit estimand/missingness, curated registry approval and blinded gold evaluation |
| P1 | Lost acknowledgement, cancelled append or concurrent rerun | Transactional compare-and-append, job fencing, immutable history and unknown-completion recovery |
| P1 | Two demonstrations mistaken for immunology-wide readiness | Preapproved 120-case holdout protocol, named scientific acceptance and domain-stratified reporting |

## Test interpretation

`test/passageLinkedContext.test.ts`, `test/contextConflictAudit.test.ts`, `test/boundContextAuditOutcome.test.ts` and source/provider regression tests use synthetic data, in-memory authorization and mocked dependencies. They exercise comparison, missingness, permissions, cancellation, append conflict, saved HTTP binding and export contracts. They do not certify real source rights, provider integration, database isolation, human governance or clinical/scientific validity. See the PR/check evidence for exact commands and SHA.
