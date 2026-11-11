# P0.2.10 — Authenticated two-tenant E2E and security sign-off

**Status: NO-GO — test fixture and runtime credentials are not provisioned.**

## Isolated staging evidence (2026-11-11)
Neon project `red-wave-06625195`, branch `br-shiny-cherry-zagwwdi8` only.
- Contradiction records: 0
- Review events: 0
- Tenant memberships: 0
- Active research access grants: 1 (identity not disclosed)
- Neon Auth integration: Better Auth, configured on isolated branch.
- Two NOLOGIN restricted roles exist, but no confirmed dedicated restricted LOGIN connection.

**No production SQL was executed. No real authenticated E2E was executed.**

## Required fixture
Provision through supported Neon Auth APIs, **not by inserting arbitrary rows into neon_auth.session**:
- Researcher A in tenant A; Researcher B in tenant B.
- Reviewer A in tenant A; Reviewer B in tenant B, independent of each submitter.
- Each principal must have verified email and valid actual session, plus required hsi_research_access, tenant memberships and reviewer authority for appropriate disease scope.
- Restricted dedicated database LOGIN credential in secret manager, with membership in hsi_contradiction_runtime; no table DML, no RLS bypass, no schema CREATE.
- Test dataset must be synthetic and explicitly labeled; never reuse production-derived real user tokens or export session secrets to CI logs.

## Acceptance test matrix (not yet executed)
| Test | Expected |
|---|---|
| Valid researcher A creates canonical contradiction in tenant A | PASS |
| Researcher A reads same record through restricted read procedure | PASS |
| Independent reviewer A reviews same record in tenant A | PASS |
| Researcher B reads or reviews tenant A record | DENY |
| Researcher A creates in tenant B without membership | DENY |
| Forged, expired, impersonated or revoked token | DENY |
| Revoked tenant membership | DENY |
| Reviewer lacks matching disease authority | DENY |
| Submitter reviews own record | DENY |
| Duplicate and concurrent reviewer decisions | Exactly one accepted |
| Direct runtime table SELECT/INSERT/UPDATE/DELETE | DENY |
| Record and review event UPDATE/DELETE by privileged test role | DENY |
| Forged snapshot tenant/submitter/edge/source metadata | DENY |
| Unverified disease source context | DENY |
| HTTP endpoints through staging app session cookies | PASS/DENY as above |

## Critical review findings
1. `src/db/transactionalContradictionStore.ts` still uses direct membership SELECT and INSERT rather than restricted stored procedures. It must be replaced or isolated from the production execution path before activation.
2. `hsi_contradiction_create` accepts caller-provided JSON scientific evidence. Migration 029 checks field consistency, not independently verified scientific provenance or canonical evidence acceptance.
3. `hsi_contradiction_read` has not been tested with actual authenticated sessions. Direct owner denial does not prove runtime authorization.
4. No confirmed mounted authenticated HTTP E2E route, two-tenant accounts, or independent security reviewer sign-off.

## Sign-off conditions
- Signed sanitized receipts with branch, commit, test case, timestamp, expected/actual, no token or secrets.
- Explicit review of definer function ownership, FORCE RLS, token handling, tenant isolation and canonical scientific evidence.
- Only then consider removing migration holds, separately gated staging activation and later production release approval.

**Decision: NO-GO.** Do not activate persistence or claim verified cross-domain coverage.
