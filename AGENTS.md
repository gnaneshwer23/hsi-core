# Agent instructions — hsi-core

**`hsi-core` is the sole active codebase for HSI.** Edit only this repository (`~/Projects/hsi-core`, https://github.com/gnaneshwer23/hsi-core).

## Neon isolation (binding)

HSI is a **separate technology**. Use **only** the HSI Neon project:

- **Canonical:** `human super intelligence` / `red-wave-06625195` / `ep-restless-dew…eu-west-2` (empty `neondb` until HSI-owned migrations)

**Never** use for HSI substrate, migrations, or Gate C writes from this workspace:

- ISI / immunecity Neon: `autumn-snow-67879321` / `ep-blue-salad…` — ISI product DB only
- Akeno Neon / DeliverX Neon — out of scope / ignore

No shared evidence DB between HSI and immunecity. Details: [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md). Do not commit secrets (see `.env.example`).

## Do not edit

- https://github.com/gnaneshwer23/immunecity (or `~/Desktop/immune-city`)

## Ignore (irrelevant to HSI)

- https://github.com/gnaneshwer23/swift-deliveries (DeliverX) — not a HITL pattern reference, not a future wire-up, do not sync

immunecity is out of scope for HSI edits (consume published export/API only). DeliverX is ignored entirely.

## Stay in this repo

Substrate, seeds, maps, exports, docs, and curator checklists (markdown under `docs/`) all land here. See README “Active codebase (sole edit target)”.
