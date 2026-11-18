# Graph workspace store flag (A3.3)

**Status:** Fail-closed wiring. Default path is device-local `localStorage`. Server path is staging-only when an owner sets the flag with research writes pins. Migrations 031–033 remain held. `acceptedForScope` stays false.

## Behaviour

| Flag / pins | Client path | Server API |
| --- | --- | --- |
| Default / unset | `localStorage` via `browserStore` | `/status` → `enabled:false`; other routes 403 |
| `HSI_GRAPH_WORKSPACE_STORE_ENABLED=true` **and** staging `HSI_RESEARCH_WRITES_ENABLED` pins | Graph investigation UI uses `/api/research/graph-workspace/*` | Adapter calls SECURITY DEFINER procs with session token |

## Owner enable (staging only)

1. Disposable or staging HSI Neon branch with 031–033 applied out-of-band (not via this PR; holds unchanged in repo).
2. `HSI_RESEARCH_WRITES_ENABLED=true` with `HSI_NEON_BRANCH_ID` / host pins matching staging.
3. `HSI_GRAPH_WORKSPACE_STORE_ENABLED=true` for that deployment only.
4. Confirm `/api/research/graph-workspace/status` reports `enabled:true`, `path:"server"`, `acceptedForScope:false`.
5. Tear down / unset the flag after the rehearsal; production must never set the flag.

## Explicit non-goals

- Removing 031–033 from `HELD_MIGRATION_IDS`
- Production writes or production host enablement
- Signing persistence security packets
- Curator ontology UI still defaults to device-local storage (recommendations API exists when the flag is on)
