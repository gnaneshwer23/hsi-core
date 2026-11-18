# PR-E2E-02 — Staging isolation acceptance packet soft-land

**Status:** Engineering soft-land. CI-safe suite modes remain the default.  
**Not claimed:** live execution authorization, signed security packet, scope acceptance, production activation, or named independent security reviewer.

Binding backlog row: Phase 0 [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-02** (when the audit package is on `main`; until then this soft-land stands alone).  
Typed catalog: [`src/operations/e2eIsolationAcceptancePacket.ts`](../../src/operations/e2eIsolationAcceptancePacket.ts).  
Suite runbook: [`docs/engineering/DB_ISOLATION_SUITE_RUNBOOK.md`](./DB_ISOLATION_SUITE_RUNBOOK.md).  
Next-B runner: [`docs/audits/HSI_NEXT_B_ISOLATION_RUNNER.md`](../audits/HSI_NEXT_B_ISOLATION_RUNNER.md).  
Pending worksheets: [`operations/staging/e2e-02-isolation-acceptance.pending.json`](../../operations/staging/e2e-02-isolation-acceptance.pending.json) and [`operations/staging/next-b-acceptance.pending.json`](../../operations/staging/next-b-acceptance.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| `staging:isolation:check` / `:fixture` | CI-safe; never acceptance |
| Live two-account probes | Owner-gated; env pins private; still never signs |
| `acceptedForScope` | Always `false` in this soft-land |
| Security signer | **Not invented.** Worksheet refs stay null / UNASSIGNED |
| Migration holds 022–033 | Unchanged |
| Production writes | Fail-closed; untouched |

## What this soft-land adds

1. Typed packet describing five scopes (including `graph_workspace`) with separate-packet requirements.  
2. Mode assessor that refuses acceptance claims for `check`, `fixture`, and `live`.  
3. Owner precondition list mirrored from the DB isolation runbook.  
4. Pending JSON worksheet for private dry-run recording (all delivery / signer fields null).

## Owner next steps (not this PR)

1. Complete the live preconditions in the DB isolation suite runbook.  
2. Run live probes per scope on a disposable HSI Neon child; preserve digests privately.  
3. Independent security signer reviews protected evidence offline and fills the private acceptance packet.  
4. Only then may `operations/staging/next-b-acceptance.pending.json` leave `BLOCKED` — outside git inventing identities.

## Explicit non-goals

- Removing ids from `HELD_MIGRATION_IDS`  
- Setting `HSI_RESEARCH_WRITES_ENABLED`  
- Inventing staging URLs, sessions, or signer names  
- Treating fixture green as live isolation evidence  
- Claiming scientific approval or pilot readiness  
