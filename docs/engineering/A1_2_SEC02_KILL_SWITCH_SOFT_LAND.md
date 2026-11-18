# A1.2 — Kill switch + spend caps (SEC-02) soft-land

**Status:** Engineering soft-land. Kill-switch flags and cap **recording locations** are documented.  
**Not claimed:** Owner-chosen numeric spend caps, provider-console limits already set, or on-call delivery.

Binding plan row: [`docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md`](../plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md) — A1.2.  
Pack source: [`docs/engineering-pack/v1.1/markdown/12_Security_Privacy_and_AI_Governance.md`](../engineering-pack/v1.1/markdown/12_Security_Privacy_and_AI_Governance.md) SEC-02.  
Typed catalog: [`src/operations/sec02KillSwitchCatalog.ts`](../../src/operations/sec02KillSwitchCatalog.ts).  
Staging worksheet: [`operations/staging/sec02-caps-dry-run.pending.json`](../../operations/staging/sec02-caps-dry-run.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| One flag disables model calls | `HSI_LIVE_MODEL_STEP_ENABLED` must be exactly `true` to opt in; any other value keeps the model step off |
| Spend caps recorded | Recording **locations** only — numeric values stay owner-pending (B5) |
| Provider console caps | Owner sets them privately; never committed |
| On-call / alert delivery | Not invented (see A1.3) |
| PHI / CDS | No patient data; research-plane only |

## Controls

| Kind | Env / surface | Fail-closed |
| --- | --- | --- |
| `live_model_step_enable` | `HSI_LIVE_MODEL_STEP_ENABLED` | Unset / not `true` → no model challenge |
| `live_model_daily_runs` | `HSI_LIVE_MODEL_DAILY_RUNS` | Optional per-instance ceiling; unset → code default safety net only |
| `rehearsal_kill` | `HSI_REHEARSAL_KILL` (readiness) | Truthy → liveRun Warden refuses |
| `capability_kill` | Capability lab UI | Panels unmount; new actions blocked |
| `pilot_provider_switch` | Pilot ops switches | Receipt + recovery gate |
| `provider_console_spend_cap` | OpenAI / Anthropic consoles | Authoritative; owner-pending in this soft-land |

## Owner next steps (B5)

1. Set provider-console daily spend limits privately.
2. Set `HSI_LIVE_MODEL_DAILY_RUNS` on staging/production after choosing a ceiling.
3. Practice kill: set `HSI_LIVE_MODEL_STEP_ENABLED=false` (or unset) and redeploy; confirm model step reports disabled within a minute.
4. Fill [`operations/staging/sec02-caps-dry-run.pending.json`](../../operations/staging/sec02-caps-dry-run.pending.json) privately — leave git fields null until true.

## Not in this soft-land

- Inventing dollar / token / run caps in git
- Wiring a new shared Redis/Postgres spend ledger
- Claiming A1.3 on-call delivery for the spend alert
- Enabling live model steps by default
