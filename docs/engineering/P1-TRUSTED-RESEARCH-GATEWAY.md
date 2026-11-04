# P1 Trusted Research Gateway — implementation boundary

## Committed
- `src/p1ResearchGateway.ts`: server-only orchestration of authenticated principal, verified published graph snapshot, deterministic investigation, and persistent run.
- `test/p1ResearchGateway.test.ts`: identity denial, release denial, durable-write failure and unique run IDs.
- `src/db/researchInvestigationStore.ts`: Neon-guarded persistence; `db/migrations/004_hsi_research_investigations.sql`: append-only run records.

## Not yet connected or deployed
The gateway is **not** an HTTP endpoint. Its `authenticate` callback must be implemented using a real trusted session/OIDC verifier. The `loadVerifiedRelease` callback must query the authoritative HSI database and independently validate release integrity, current reviewer authorisation, rights, corrections/retractions and revocation. Its `verifiedBy` marker is a TypeScript contract, **not cryptographic attestation**; a malicious or misconfigured dependency could forge it. `saveRun` must be wired to `persistResearchInvestigation` only after the migration is reviewed and applied to HSI's dedicated Neon project.

No real scientist identity, graph publication, model/agent execution, scientific claim approval, live dataset or Vercel deployment was performed here. Current test fixtures are synthetic test data and are never promoted into evidence.

## Production acceptance gates
1. Real OIDC/JWT validation with issuer, audience, expiry and role mapping; negative auth tests.
2. DB-owned release snapshot loader with full canonical content hash/signature verification, licence and retraction checks, latest qualified reviewer approval.
3. DB migrations applied to approved staging HSI branch and exercised with rollback plan.
4. Run persistence with immutable provenance, actor isolation, idempotency, rate limits and audit.
5. API request validation, authorization, logging redaction, timeout and abuse controls.
6. End-to-end integration tests against staging, then scientific review and operational sign-off.
