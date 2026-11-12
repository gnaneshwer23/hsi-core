# Next-A: staging connectivity integration

This increment adds `createStagingConnectivity` over the existing independently verified source decisions and staging provider operations. It does not supply a rights authority, issue clearance, approve a deployment, create credentials or activate live execution. No production configuration changes are included.

## Execution contract

- Disabled by default; explicitly compose only on the trusted staging server.
- Exactly two distinct configured deployment IDs. This does not require two different vendors.
- Validate the entire request batch, including passage binding and prohibited-data checks, before any authority lookup.
- Preflight model-transmission source permission for both requests before any provider dispatch.
- Existing provider operations must still independently enforce configuration approval, source revalidation, native pinned transport, budget reservations and acknowledged durable start/terminal receipts.
- Sequential execution; uncertain or failed execution stops the batch. There is no automatic retry or automatic rollback of provider spend. Reconcile protected journal records before any operator-authorized rerun.
- Returned report contains execution identifiers/usage only; no passage, claim, model reason or credentials. It always retains liveAcceptance/scientificApproval/graphPromotable false.
- Completion is connectivity evidence only. Independent review of actual services, permissions, runtime faults and receipts remains required.

## Composition and acceptance prerequisites

Instantiate the source verifier with pinned independently operated authority public keys and a current fail-closed revocation lookup. Compose it with `createOperationalSourceClearance` and a protected `openStagingOperationStore`. Instantiate `createStagingProviderOperations` with the same source service/store, two approved exact deployment configurations, independent current deployment approval checks and server-side credentials; omit test transport injection so the native pinned transport is used. Pass these services to the coordinator. Do not expose its configuration, callbacks or credential lookup to client requests.

The source-authority and revocation service protocols/locations have not yet been supplied. No generic HTTP adapter is invented: its transport, authentication, failure contract and policy owner require a concrete independently approved service definition. Similarly, provider model IDs, source/provider terms, approved staging target and secret-manager references must be supplied before real execution. Never put credentials in PRs, chat, reports or logs.

Before a real smoke run retain independently reviewable source rights/attribution and identity/retraction evidence, deployment/configuration hashes and approval references. After execution independently replay the protected journal and verify real provider request/response IDs, exact models, input/output hashes, source/clearance bindings, reservation/usage and unresolved operations. Do not publish source passages or secrets. Current fault regressions must also be exercised against the selected real runtime; fixture tests alone do not satisfy Next-A.

## Verification

`test/stagingConnectivity.test.ts` checks default disablement, malformed/duplicate batch zero egress, denied source and cancellation zero provider calls, redacted completion without acceptance, and no retry/second dispatch after uncertain first execution. Existing provider, transport, receipt and source fault suites remain required.
