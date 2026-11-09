# HSI Version 1 — Scope Freeze (M20)

**Status:** Versioned scope for **LIMITED GO — synthetic demo rehearsal only**.  
**Date:** 2026-11-09  
**Tip base:** post-#141/#142 `main` (M17 PR5 + M19 PR1); M20 master audit [#143](https://github.com/gnaneshwer23/hsi-core/pull/143)  
**Companion:** [`M20_MASTER_ACCEPTANCE_AUDIT.md`](./M20_MASTER_ACCEPTANCE_AUDIT.md) · [`M20_DEMO_SYNTHETIC_PILOT.md`](./M20_DEMO_SYNTHETIC_PILOT.md)

## Decision

| Field | Value |
|-------|-------|
| Launch class | **LIMITED GO** |
| Scope | Synthetic demo researcher + independent reviewer rehearsal |
| Live scientific acceptance | **Out of scope / BLOCKED** |
| Production research writes | **Out of scope** (`writesEnabled` must stay false on www) |
| Public “platform launch” | **NO-GO** |

## In pilot scope (demo / synthetic)

- Demo personas: `demo.researcher@hsi.test`, `demo.reviewer@hsi.test`, `demo.ops@hsi.test` (fixture principals — **not** neon_auth in git).
- Fixture investigation `hsi-interrogative-test-fixture-ws-001` (SSc question, honesty banner).
- Offline 22-step journey rehearsal (`bun run m20:demo`).
- Eng fail-closed paths: no self-approve, no PHI, no autumn-snow.

## Available with restrictions

- Public metadata evidence adapters (Europe PMC / OT / UniProt / CT.gov) — metadata only; passages **Blocked** (#2).
- Authenticated research API on www with `writesEnabled=false`.

## Research preview (fixture contracts only)

- M12–M17 therapeutic / RWE / systems / programme contracts.
- In-process agent orchestrator (not durable restart-proven).

## Out of scope / Blocked

- Live neon_auth two-account ops acceptance (#5) until real principals provisioned on staging.
- Passage import / SME-scored science (#2/#4).
- Federation, wet-lab, M11 simulation validation.
- Gate C auto-approve, MoU invent, CDS/PHI.
- Claiming LIMITED GO as full scientific GO.

## Honesty

Demo CLEARED ≠ scientific CLEARED ≠ production ready.
