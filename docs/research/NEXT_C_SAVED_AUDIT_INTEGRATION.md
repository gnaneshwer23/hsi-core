# NEXT-C — saved audit versions and independent human assessment

13 November 2026. **Engineering reference integration; live acceptance remains blocked.** No deployment switch, database migration, runtime grant, real provider request or scientific approval is authorized by this change.

## Implemented path

1. Save an investigation and submit its immutable evidence package through the existing delivery workflow. Audit capture against an unsubmitted draft is refused: submission changes the package hash, so a draft attachment must not silently become submitted evidence.
2. A trusted `createContextConflictAuditRunner` sink calls `archive.append(sessionToken, investigationId, audit)`. There is no HTTP endpoint accepting a caller-supplied audit payload. The server verifies the package, question, primary disease, source release, search-source identities, exact passage/version/hash/text, current tenant access and source permissions.
3. The isolated reference ledger atomically appends immutable audit versions with an expected parent hash. Same-content retry returns the original row. A rerun appends a new version; it never overwrites prior content or inherits a previous assessment.
4. An independent human with a current grant for the same tenant and disease can record one decision against the exact current audit/archive/package/context hashes. Owner/self-review, AI/service actors, wrong-scope reviewers, forged identity fields, stale hashes and conflicting decisions are denied. Failed/empty/blocked audits cannot be accepted with limitations. Assessment requests have stable idempotency IDs for lost acknowledgements.
5. The existing outcome-attachment resolver loads the stored audit and its separate assessment, rechecking current source permissions and reviewer authority. Reopened outcomes and JSON/Markdown exports retain the same bindings. Evidence-brief approval never approves an audit; audit assessment never authorizes graph publication. All scientific-approval and graph-promotion flags remain false.

## Browser integration corrected

The previous client rebuilt only the attachment-free outcome and therefore rejected legitimate attached audits. Some audit validation also uses server-only synchronous hashing. The browser now always fetches a separate, authenticated `/outcome-receipt`, including when a response claims there are no attachments. This prevents silent audit suppression/downgrade. That endpoint recompiles the outcome only after fresh backend access/source checks.

The client verifies the saved package independently, matches package/context/attachment/outcome bindings, and recomputes the complete outcome content hash with Web Crypto. A self-resealed response without a matching fresh server receipt is rejected. This is a trusted-backend verification receipt, **not** an independent scientific verifier or a signed cross-service clearance grant. There is no fallback when the receipt is absent, changed or denied.

Audit Markdown serialization is separated from server validation so browser print/download verification does not call unavailable Node hashing. The compiler still validates audits and assessment hashes on the server before producing an outcome. Refresh, export and print reject stale or revoked content.

The private outcome panel displays the audit version, bounded support/oppose search results, missing context and separate independent assessment. Review controls appear only when the backend returns current scoped review capability. Reviewers provide rationale, limitations and an explicit conflict-of-interest declaration; the browser never sends reviewer identity, tenant, scope or timestamps.

## Protected routes and composition

- `GET /api/research/interrogative/:id/context-audit`: authenticated, exact-package latest audit and assessment; no query overrides.
- `POST /api/research/interrogative/:id/context-audit-review`: same-origin JSON only; bounded request body; strict fields; immutable audit-hash decision.
- `GET /api/research/interrogative/:id/outcome-receipt`: freshly authorized compiler receipt; no query overrides.

`createNeonInterrogativeApiServices` accepts an optional trusted `auditArchive` service and the existing `outcomeAttachments` resolver. A host composes both from `createContextAuditArchiveService`, whose `authenticate`, `context`, scoped `reviewer` and `authorizeSources` adapters must be independently approved. The current Vercel environment does **not** instantiate this archive or infer approvals from environment strings. Unconfigured archive routes return unavailable after the existing authentication/write gates.

## Storage reference and honest limits

`openContextAuditArchive({path, mode: 'isolated_reference'})` uses a private canonical directory and regular, non-symlink 0600 file, SQLite WAL/FULL synchronization, immediate transactions, unique version/decision keys and update/delete-denial triggers. It refuses Vercel/Lambda execution. Existing same-host operations infrastructure also uses SQLite; this is an artifact-ledger reference, not a replacement graph database.

The reference demonstrates process restart, concurrent connections and immutable records. It does **not** establish Neon RLS, least-privilege pooled sessions, encryption/key management, a signed external evidence vault, multi-host high availability, network-filesystem safety or protection from a hostile administrator able to rewrite the database and hashes. Hashes detect binding/content changes; they are not signatures or authentication.

Authorization callbacks are rechecked before/after operations and on every reopen/export. They are not a transactionally coupled remote grant/clearance database. The future approved backend adapter must prove atomic authority/revocation behaviour and real-account isolation. No 022–030 migration holds are removed, and no production schema is changed.

## Verification and remaining release gates

Durable tests use actual isolated files and two connections. They cover restart/reopen/export, parent continuity, same-content retry, one independent immutable decision, no assessment transfer to a rerun, cross-tenant/self/agent/wrong-disease denial, revocation, forged release/package/request bindings, failure artifacts, symlink refusal and authenticated HTTP boundaries.

Browser tests use synthetic HTTP/UI fixtures with the actual compiler and archive service. They cover attached-outcome receipt verification, owner read-only behaviour, an independent assessment, lost-acknowledgement retry, source revocation, self-resealed response and stripped-audit downgrade rejection, JSON/Markdown downloads and mobile/desktop accessibility. These fixtures do not certify provider login, Neon persistence, real scientific reviewers or expert adjudication.

Actual SSc plus RA/SLE login→cleared live retrieval→saved audit→independent review→reopened/exported brief acceptance still requires NEXT-A/B, current primary-domain source packs and scoped reviewers. SLE authority is not invented: the present audit contract supports only SSc/RA. The full independently adjudicated benchmark and operational release packet remain separate requirements.
