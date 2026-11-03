# Stage B B1 — SSc source intake and track-scoped investigation preflight

This slice implements **policy and preflight**, not a live literature importer or an authorised API endpoint.

- `src/stageBSourceIntake.ts` defines the SSc source intake type, screening for publication identifier, passage-use rights and an HTTPS retrieval receipt with digest.
- SSc intake is **empty** until real publications and their rights are verified. Contract-test fixtures are fictional and are not published sources.
- `validateStageBInvestigationScope` checks track ID, evidence namespace, version, source uniqueness and rights before handing an investigation to the existing server-side `investigationService`.
- RA retains its current release and scientific-review status; SSc cannot reuse RA evidence or approvals.
- A successful preflight is **not** an access-control decision. The existing server authoriser must authenticate and authorise each action and tenant key before loading data.
- A successful source screening is **not** human scientific review or permission to publish a claim.

## Remaining implementation
1. Curate real SSc sources and verify licences and retrieval receipts; record full provenance.
2. Wire preflight into an authenticated investigation service adapter and durable, versioned track-specific store.
3. Integrate human review with immutable audit events and evidence-version digest matching.
4. Run real browser and deployed access-control QA. Do not use PHI or claim live trial matching.
