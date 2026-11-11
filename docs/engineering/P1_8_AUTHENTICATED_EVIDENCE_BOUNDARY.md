# P1.8 — Authenticated Evidence Service Boundary

## Implemented
The server-only evidence service accepts a session token, calls an injected trusted session verifier and constructs its own principal before invoking P1.5 persistence. No public caller can pass a self-asserted principal to this service. Missing or invalid sessions fail before a database transaction.

Corrected a P1.5 review query that requested reviewer columns absent from the deployed P1.4 schema. Review event details remain in the separate audit table.

## Security boundaries still missing
- The verifier interface is **not** a concrete signed-session implementation. Integrate with the existing server auth and verify tenant membership, expiry, issuer, audience, revocation and role assignment.
- No HTTP route is installed by this change.
- Neon staging currently has RLS + FORCE RLS but zero permissive policies. Do not grant table-owner or BYPASSRLS privileges to the application.
- Transaction-local organization settings are not proof of authentication. Use least-privilege credentials, restrictive tenant policies and isolated role tests.
- No real driver connection or synthetic staging write/review flow was executed.
- Scientific acceptance status is not graph publication or scientific validation.

## Next acceptance gate
Fix all CI failures, establish scoped service role and tenant policies in reviewed staging migration, wire the trusted auth gateway and Postgres pool, then run concurrent submission, duplicate, cross-tenant, self-review and rollback tests.
