# P1.4 — Authenticated Evidence Persistence & Review Queue

**Implemented in PR:** application-layer authorization policy, independent reviewer transition checks, proposed tenant-scoped Neon SQL tables, deny-default row-level security, unit tests.

**Not yet implemented:** a trusted server gateway that issues verified principal objects; Neon migration execution; transactional API endpoints; durable queue workers; audit log immutability; verified source hash; live integration tests. A caller constructing a `VerifiedResearchPrincipal` is not authentication. The policy module must only be called behind an authenticated server-side boundary and never exposed as a client-authoritative approval endpoint.

**Migration safety:** SQL is a proposal only; no database change has been executed. RLS has no permissive policies and thus denies ordinary roles. Database owner / bypass roles must be isolated. Enforce reviewer independence and immutable events in trusted server transactions, not solely in TypeScript.

**Release gate:** CI, schema review, migration rehearsal, auth negative tests, concurrent/idempotent submission tests, tenant isolation, durable review queue, audit verification and independent scientific sign-off.
