# ADR-014: Scope registry (not literal disease lists)

**Status:** Proposed — needs owner sign-off before schema change.
**Date:** 17 November 2026
**Source:** Engineering pack v1.1 § Database; build plan A3.1.
**Related:** ADR-013 (identity), `src/db/reviewerAuthority.ts` (`HSI_REVIEWER_SCOPES`), migration 027 scope literals.

## Context
Review authority is hard-coded today:

- Migration 027 rejects scopes outside `('ssc','ra')`.
- Application constant `HSI_REVIEWER_SCOPES = ["ssc","ra"]`.

Every new disease or research programme (for example SLE, T2D, gut–immune–metabolic) would need a migration and a code change. That blocks expansion and invites drift between SQL and TypeScript.

## Decision
Introduce a **scope registry**:

| Table | Role |
| --- | --- |
| `hsi_scopes` | `id`, `name`, `active` (examples: `gut-immune-metabolic`, `ra`, `t2d`, `ssc`) |
| `hsi_memberships` | `principal_id`, `scope_id`, `role` (`researcher` / `reviewer` / `adjudicator` / `admin`), `granted_by`, `revoked_at` |

Review and write paths check membership against the registry. Adding a disease or programme is a data change (and a human grant), not a schema migration.

Seed initial active scopes from today’s literals (`ssc`, `ra`) so behaviour does not expand silently.

## Consequences
- Reviewer authority becomes queryable and revocable without redeploying SQL.
- Isolation tests must cover wrong-scope and revoked membership denials.
- **Promotion constraint:** membership in a scope grants permission to act inside that scope; it does not auto-promote graph candidates or close scientific approval. Self-review remains forbidden.
- Public marketing and homepage copy still follow the Living Knowledge Graph positioning; scope ids are internal programme labels, not product brands.

## Alternatives rejected
Postgres enum per disease, or keeping hard-coded SQL/TS literal lists in sync by hand.

## Revisit trigger
Programme taxonomy needs hierarchical scopes or cross-scope adjudicator rules that the flat registry cannot express — then extend the registry model, do not return to literals.
