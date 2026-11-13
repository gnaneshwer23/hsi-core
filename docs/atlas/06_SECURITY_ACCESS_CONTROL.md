# Security and access control

Requirements A07/A09/A10/A11/A12; [CDS/PHI boundary](../CDS_PHI_BOUNDARY.md) and [Neon isolation](../NEON_PROJECT_MAP.md) remain binding.

## Current slice

Public department/search projections have no credentials, server-session claims, arbitrary provider URLs, database mutation or model dispatch. They operate on the existing verified, bounded public candidate snapshot. Public query matching never establishes source rights. Unrecognised departments and invalid traversal/query bounds fail closed. Handoff retains an explicit view-key allowlist and graph version; owner/session/token parameters are stripped. Snapshot load errors display no substitute graph.

## Governed execution gates

- All private reads/writes use server-verified identity and authorised scope; never trust owner/tenant/session settings supplied by the browser. Reuse [hsiGovernedGraphQuery.ts](../../src/hsiGovernedGraphQuery.ts), server context/delivery services and RLS stores.
- No public candidate selection can become an approved claim, clearance receipt or source of reviewer authority. Exact task context must be server bound to investigation, snapshot, source version and permitted actions before P3 egress.
- Independent reviewer must differ from submitter, hold current domain/scope authority and not be revoked. Brief review does not approve graph publication. Dr. Gnaneshwer Jadav is the named scientific lead from the user's handoff; that does not supply independent reviewer accounts or security/operations signers.
- Next-A source service/owner, provider deployments/terms and live approval references remain unconfirmed. Next-B isolated staging target, two independent researcher scopes, reviewer and security signer references remain unavailable. Keep live execution and write activation blocked; do not substitute production identities.
- No PHI ingestion, clinical recommendation, eligibility decision or cross-product shared DB. No patient text in public graph, prompts, URLs or operational logs.

## Required independent staging evidence

Two authenticated researcher scopes and independent reviewer through pooled non-owner, non-superuser, non-BYPASSRLS runtime; reject cross-scope read/enumeration/edit/export, forged ownership/session settings, self-review, revoked/wrong-scope grants. Verify concurrency/idempotency and immutable decisions, logout/revocation, separate migration activation/rollback and backup restore. Fixture tests prove runner contracts, not actual deployment security.

Acceptance files: [test/hsiGovernedGraphQuery.test.ts](../../test/hsiGovernedGraphQuery.test.ts), [test/investigationGraphContext.test.ts](../../test/investigationGraphContext.test.ts), [test/investigationDelivery.test.ts](../../test/investigationDelivery.test.ts), [test/stagingIsolationRunner.test.ts](../../test/stagingIsolationRunner.test.ts), [test/contradictionActivationGate.test.ts](../../test/contradictionActivationGate.test.ts), [test/sourceClearanceReceipt.test.ts](../../test/sourceClearanceReceipt.test.ts), [test/providerReliability.test.ts](../../test/providerReliability.test.ts), plus [test/atlasDepartments.test.ts](../../test/atlasDepartments.test.ts) for the new public boundary. See [release runbook](08_DEPLOYMENT_TESTING_RUNBOOK.md).
