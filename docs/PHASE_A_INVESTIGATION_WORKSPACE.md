# Delivery Phase A — connected investigation workspace

**Implemented:** 5 November 2026. **Status:** implementation and local verification complete; live database-backed acceptance pending. This delivers the Phase A work package from [the delivery plan](strategy/HSI_PHASED_BUILD_PLAN.md); it does not clear the paused operational access prerequisite or approve evidence.

## User flow

Open `/research/account`, then **Open your research workspace**, or go directly to `/research/scientific-workbench`.

1. The workspace loads the current user's saved investigation summaries and the deployment's eligible published SSc release.
2. A researcher enters a non-identifying biomedical question, selects that release and chooses **Create and save investigation**.
3. The trusted backend plans and saves an immutable draft, then the UI opens `/research/decision-workbench?investigation=<id>`.
4. **Your saved investigations** returns to the list. Click the question to reopen the same record. Release ID, version, manifest hash and creation time remain inspectable.

Manual ID entry is no longer the primary journey. No investigation payload, principal, role, release hash or scientific decision is accepted from the browser. No private investigation is stored in browser local storage.

## API and persistence

| Request | Behavior |
| --- | --- |
| `GET /api/research/investigations` | Authorized, owner-only summaries, up to 25 per page; eligible release and backend-derived creation capability. Reviewers' queues remain on the existing account/review paths. |
| `GET /api/research/investigations?cursor=<encoded JSON>` | Keyset page using the previous `nextCursor`; retains database timestamp precision and owner filtering. Client owner/role filters are refused. |
| `POST /api/research/investigations` | Strict JSON `{question, releaseId, requestId}`; question max 500 characters, UUID-v4 request ID, bounded request stream, exact origin and JSON checks. Returns `{id, created}` with 201 for a new record and 200 for an acknowledged retry. |
| Existing `GET /api/research/interrogative/<id>` | Loads the persisted record using existing ownership/reviewer and integrity checks. |

Creation requires an active researcher or research-admin grant. A scientific-reviewer grant alone does not enable creation. IDs bind the request ID to the verified principal; retries reuse the original record and cannot overwrite it. Different request IDs can create separate investigations for the same question. Changed input under an already used request ID is rejected.

The existing authenticated save store verifies a published release inside its transaction, validates referenced claim membership, rechecks the session and preserves immutable content hashing. Phase A does not add tables, run migrations, provision roles or change existing scientific review/publication semantics. The list query is bounded; an owner/time index can be assessed during operational scaling.

## Release and write configuration

The server-only `HSI_SSC_RESEARCH_RELEASE_ID` binds the planner to **one existing, published, public-biomedical SSc release**. It is intentionally empty by default. The release table lacks a disease field, so the trusted deployment binding must be checked against the release's reviewed manifest and permitted data use before setting it. Never point it at an RA release, another product's database, a public draft JSON file or a test fixture in a live deployment. This setting does not publish a release or clear its source rights.

The UI disables creation when this release is absent/unpublished, the user lacks creation permission, or writes are disabled. Existing owned records remain accessible when authorized.

Existing deployment safeguards remain: `HSI_RESEARCH_WRITES_ENABLED=true` is insufficient alone; the confirmed HSI staging branch and staging database endpoint must also match. Production write enablement is not part of this delivery. The standalone trusted-proxy server uses the same deployment-config validation to determine Phase A creation availability. See [.env.example](../.env.example) and [Vercel setup](VERCEL_RESEARCH_SETUP.md).

## Scientific boundary

Drafts use the existing deterministic SSc question planner. They contain candidate mechanisms, unanswered questions, missing evidence and an insufficient-evidence conclusion. They do **not** perform evidence retrieval, generate validated findings, copy public draft relationships into an approved release, or automatically approve/publish anything. Connected evidence retrieval and graph reasoning follow in later delivery phases.

The question form tells users not to enter patient information, and the server reuses the existing PHI-marker rejection helper. This heuristic is not a comprehensive de-identification system or approval to process PHI. Identifiable patient data remain forbidden in HSI.

Browser validation now imports a browser-safe contract module. The original `interrogativeContracts` import remains compatible for server/library consumers, including hashing.

## Verification and remaining acceptance

- **616 core tests passed**: includes creation, server-owned fields, role/owner isolation through service ports, published-release restrictions, conflicting retries, lost acknowledgements, stream bounds, origin checks, failure redaction and deployment write guards.
- **56 browser checks passed** in the full existing suite, including five new checks for create/reopen, retry, disabled states, denial/invalid responses, pagination and mobile width. The create/reopen check also verifies the saved manifest hash in the provenance view.
- Core TypeScript, frontend TypeScript, site/API builds are checked. The browser `node:crypto` externalization warning is removed; the large main-bundle warning remains.

**Limit:** persistence tests use an in-memory repository and browser HTTP fixtures. They establish orchestration and UI behavior, not an authenticated Neon transaction. No production configuration, database records, migrations, role grants or credentials were changed.

### Non-production smoke, once operational access is unpaused

1. Confirm the approved HSI staging Auth/database mapping and verified active researcher session. Confirm required existing schema is present; do not run production migrations.
2. Verify source rights and scope for an already published public-biomedical SSc release. Bind its ID in the staging server configuration and confirm the existing staging write guard explicitly permits the target.
3. Create a non-identifying question through the UI. Record its ID; leave, reload and reopen it. Compare question, release/version/hash and draft/evidence status.
4. Verify a retry of the same request returns the same ID. A new request produces another draft; an input conflict cannot overwrite the first one.
5. Sign in as a separate researcher: the first user's investigation must be absent from their list and denied on direct load. An ungranted account and a reviewer-only account must not create records.
6. Disable staging writes and verify creation fails while authorized reads remain available. Remove/revoke the selected release and verify it cannot be used for a new save. Preserve existing records and audit evidence.

Only after these database-backed checks pass should Phase A be marked live accepted. Independent scientific review and release publication remain separate acceptance gates.
