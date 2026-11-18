# Onboarding profile store (PR-E2E-08)

**Status:** Fail-closed wiring. Default path is device-local `localStorage`. Server path opens only when an owner sets the flag with research writes pins **and** injects/applies an additive store. Migration `023_hsi_researcher_workspace_community` remains held. `schemaApplied` and `acceptedForScope` stay false.

## Behaviour

| Flag / pins / store | Client path | Server API |
| --- | --- | --- |
| Default / unset | `localStorage` via `researchHome` | `/status` → `enabled:false`; GET/PUT → 403 |
| Flag + staging writes, **no** store backend | `localStorage` | `/status` → `SCHEMA_NOT_APPLIED`; GET/PUT → 403 |
| Flag + staging writes + injected memory store (rehearsal/tests) | Client may use `/api/research/onboarding-profile` | Principal-scoped ephemeral store; not durable SQL |
| Production host | Always refused by gate | Never enables |

## Owner enable (staging rehearsal only)

1. Disposable or staging HSI Neon branch (writes pins as for other research APIs).
2. `HSI_RESEARCH_WRITES_ENABLED=true` with staging branch/host pins.
3. `HSI_ONBOARDING_PROFILE_STORE_ENABLED=true` for that deployment only.
4. Provide an additive profile backend (owner packet) — do **not** lift 023 community tables for this path alone unless the packet explicitly says so.
5. Confirm `/api/research/onboarding-profile/status` reports honesty fields; tear down after rehearsal.

## Explicit non-goals

- Removing 023 from `HELD_MIGRATION_IDS`
- Production writes or production host enablement
- Claiming multi-device durable sync from an in-memory rehearsal store
- Email/SMS digests or community posts (023 scope)
