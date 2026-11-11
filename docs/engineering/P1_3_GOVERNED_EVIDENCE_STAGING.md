# P1.3 — Governed Evidence Staging

**Implemented:** a content-addressed, SHA-256 evidence snapshot constructed from the P1.2 metadata bundle; bounded source provenance checks; graph schema validation; and a pending independent-review handoff object.

**Security boundary:** This is an in-memory staging contract. It does **not** authenticate the caller, write to Neon, implement a durable queue, prove provider licensing, attest a reviewer or promote any draft into an approved graph. A source URL and retrieval timestamp are not equivalent to an immutable raw provider response or source version. SHA-256 binds the staged parsed metadata, not the upstream response body.

## Required next integrations
1. Authenticated research API with scoped authorization and idempotency keys.
2. Transactional Neon storage for snapshot, source versions, provider response hash, access controls and immutable audit events.
3. Durable reviewer queue with independent authenticated scientific reviewer and separation of duties.
4. Source-specific licensing, schema versioning and provider version metadata.
5. Negative tests: replay, duplicate idempotency key, altered snapshot, unauthorized access, forged reviewer, stale upstream version and rollback.
6. No approved graph write without verified review decision and provenance.

**Current state:** draft-only research staging; production scientific release NO-GO.
