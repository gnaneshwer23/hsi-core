# DB isolation suite runbook (A3.2 / DB-02)

**Status:** Engineering harness. Fixture/`--check` are CI-safe. Live green on a disposable HSI Neon branch is owner-gated. Never lifts migration holds 022–033. Never enables production writes. `acceptedForScope` stays false until an independent security packet is signed offline.

## What this is

Two-account isolation probe catalog + orchestrator + CLI over the existing `createStagingIsolationRunner` and `assertDisposableRehearsalTarget` helpers.

| Mode | Command | Network | Acceptance |
| --- | --- | --- | --- |
| check | `bun run staging:isolation:check` | none | never |
| fixture | `bun run staging:isolation:fixture` | synthetic transport | never |
| live | `bun run staging:isolation:live -- --scope <scope>` | owner staging HTTPS | never (observations only) |

## Scopes

`interrogative_workspace` · `scientific_records` · `contradiction_ledger` · `live_evidence` · `graph_workspace`

Community (`023`) remains deferred. Live evidence (`030`) must not apply forgeable `hsi.live_owner_id` policies (ADR-013 / `liveEvidencePolicyGate`).

Write / pooled / concurrency checks are catalogued as **non-HTTP** evidence kinds. Matching a GET response must not be treated as proof of those protections.

## Live preconditions (owner)

1. Create an **expiring disposable** child of `ep-hsi-production` (placeholder ids; real pins in private env only).
2. Confirm `assertDisposableRehearsalTarget` would pass (parent = production branch, not default/primary, expires ≤24h).
3. Supply sessions via env (never commit): `HSI_ISOLATION_SESSION_RESEARCHER_A`, `_B`, `_REVIEWER`, optional `_REVOKED`.
4. Set **both** `HSI_ISOLATION_ORIGIN` and `HSI_ISOLATION_APPROVED_ORIGIN` independently to the same reviewed staging HTTPS origin (not production). The CLI refuses when either is missing or they differ.
5. Set disposable pin env: `HSI_ISOLATION_PROJECT_ID`, `HSI_ISOLATION_DISPOSABLE_BRANCH_ID`, `HSI_ISOLATION_PRODUCTION_BRANCH_ID`, `HSI_ISOLATION_TARGET_EXPIRES_AT`.
6. Set binding digests: `HSI_ISOLATION_ROUTE_SCHEMA_HASH`, `HSI_ISOLATION_RUNTIME_CONFIG_HASH` (64 hex each).
7. Set `HSI_ISOLATION_SUITE_ENABLED=1` and `HSI_ISOLATION_LIVE_AUTHORIZED=1` only for that run.
8. Tear down the disposable branch afterwards; confirm production branch untouched.

Live mode exits nonzero when any observation fails, mismatches, or is left unexecuted.

## Related

- ADRs: `docs/architecture/ADR-013-IDENTITY-BINDING.md`, `ADR-014-SCOPE-REGISTRY.md`
- Neon map: `docs/NEON_PROJECT_MAP.md`
- Runner contract: `docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md`
- Graph rehearsal: `docs/GRAPH_WORKSPACE_REHEARSAL_RUNBOOK.md`
- Pending refs: `operations/staging/next-b-acceptance.pending.json`

## Explicit non-goals

- Removing ids from `HELD_MIGRATION_IDS`
- Wiring `graphWorkspaceStore` to routes (A3.3)
- Signing persistence security packets in this CLI
- Targeting production or inventing Neon accounts
