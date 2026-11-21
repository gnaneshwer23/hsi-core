# U38 — Multi-process crash/restart E2E harness (U33–U34 live path) (21 November 2026)

**Phase:** Production readiness · ARCH-009 · closes U33/U34 live OS soft-land gaps  
**Scope:** CI-safe check + fixture OS multi-process harness; live Neon path behind disposable-target authorization.  
**Not claimed:** Accepted security scope, scientific approval, Gate C, production writes, invented Neon hosts, or research_admin HTTP recovery completion.

## Change

1. `src/db/hsiSqliteCheckpointStore.ts` — durable SQLite CAS store for fixture multi-process.  
2. `src/operations/hsiMultiprocessCrashRestartSuite.ts` — modes, honesty, live authorization gate.  
3. `src/operations/hsiMultiprocessCrashRestartRunner.ts` — spawn two OS claimers + abandon-then-retry recovery.  
4. CLI: `bun run staging:multiprocess:check|fixture|live`.  
5. Closes the **OS multi-process** gap called out by U33/U34; Neon live remains owner-gated.

## Modes

| Mode | Command | Network | OS processes | Neon |
| --- | --- | --- | --- | --- |
| check | `bun run staging:multiprocess:check` | none | no | no |
| fixture | `bun run staging:multiprocess:fixture` | none | **yes** (SQLite) | no |
| live | `bun run staging:multiprocess:live` | disposable HSI Neon | **yes** | **yes** (owner env) |

## Live preconditions (owner)

1. Create an **expiring disposable** child of the HSI production Neon branch (≤24h).  
2. Confirm `assertDisposableRehearsalTarget` would pass.  
3. Set privately (never commit):  
   - `HSI_MULTIPROCESS_E2E_ENABLED=1`  
   - `HSI_MULTIPROCESS_LIVE_AUTHORIZED=1`  
   - `HSI_MULTIPROCESS_DATABASE_URL`  
   - `HSI_MULTIPROCESS_PROJECT_ID`  
   - `HSI_MULTIPROCESS_PRODUCTION_BRANCH_ID`  
   - `HSI_MULTIPROCESS_DISPOSABLE_BRANCH_ID`  
   - `HSI_MULTIPROCESS_TARGET_EXPIRES_AT`  
4. Tear down the disposable branch afterwards.

**Never invent** Neon hosts, sessions, or production pins in git.

## Honesty

| Claim | Soft-land |
|---|---|
| Fixture OS multi-process exclusive ownership + crash/restart | **Yes** |
| Live Neon multi-process E2E | **Only with owner disposable env** |
| `acceptedForScope` | **Always false** here |
| Scientific approval / Gate C / production writes | **No** |
| research_admin HTTP recovery | Still owner-gated |

## Acceptance

- `bun test test/hsiMultiprocessCrashRestartSuite.test.ts`  
- `bun run staging:multiprocess:check`  
- `bun run staging:multiprocess:fixture`  
