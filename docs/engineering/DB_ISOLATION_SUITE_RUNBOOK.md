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

## Live preconditions (owner)

1. Create an **expiring disposable** child of `ep-hsi-production` (placeholder ids; real pins in private env only).
2. Confirm `assertDisposableRehearsalTarget` would pass (parent = production branch, not default/primary, expires ≤24h).
3. Supply sessions via env (never commit): `HSI_ISOLATION_SESSION_RESEARCHER_A`, `_B`, `_REVIEWER`, optional `_REVOKED`.
4. Set `HSI_ISOLATION_ORIGIN` to the approved staging HTTPS origin (not production).
5. Set `HSI_ISOLATION_SUITE_ENABLED=1` and `HSI_ISOLATION_LIVE_AUTHORIZED=1` only for that run.
6. Tear down the disposable branch afterwards; confirm production branch untouched.

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
