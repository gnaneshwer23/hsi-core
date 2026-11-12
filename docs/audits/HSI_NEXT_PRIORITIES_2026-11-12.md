# HSI — next priorities

Dated 12 November 2026. These are proposed acceptance steps, not completed releases. The linked audits record observations at the stated revisions; they are not live status monitors.

## Documents

- [Live website, backend and delivery audit](HSI_LIVE_DELIVERY_AND_PRODUCT_AUDIT_2026-11-12.md) — section 5 contains prioritized corrective work.
- [Knowledge graph correction audit](HSI_GRAPH_CORRECTION_AUDIT_2026-11-12.md) — gaps across all three graph surfaces and task-based acceptance criteria.
- [Deployment and read-only probe evidence](HSI_DELIVERY_EVIDENCE_2026-11-12.json).

## Delivery order

1. **P0: integrate the completed website into main through one verified PR.** Reconcile the full stacked changes with current main, verify the exact integration SHA, and retain the full required-check evidence. A merged feature-branch PR is not a production release.
2. **P0: verify the actual public domain after an authorized release.** Match the alias/deployment to the accepted artifact and check all ten served pages, assets and navigation.
3. **P1: correct the graph as one investigation experience.** Connect homepage preview, Science entry and research workspace to the same versioned question, selected relationship, context and source. Accept the actual task journey, not only screenshots or automated tests.
4. **P0/P1: complete approved staging backend acceptance.** Next-A source/provider approvals and Next-B real-account isolation remain critical prerequisites. Compose approved adapters, worker/readiness services, protected persistence and independent review before claiming a live scientific workflow.
5. **P1: maintain a delivery evidence ledger.** Separate implementation SHA, deployed artifact, live connection, data provenance, human acceptance and user-visible entry point for each capability.

The graph work and website integration can proceed without activating scientific services. Live backend testing depends on the previously identified owners, approvals, source terms and authorized staging identities. Production writes, migrations, provider activation and scientific promotion remain separately gated.
