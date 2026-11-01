# Agent instructions — hsi-core

**`hsi-core` is the sole active codebase for HSI substrate.** Primary edit target: `~/Projects/hsi-core` (https://github.com/gnaneshwer23/hsi-core).

## Neon isolation (binding)

HSI is a **separate technology**. Use **only** the HSI Neon project for HSI substrate:

- **Canonical:** `human super intelligence` / `red-wave-06625195` / `ep-restless-dew…eu-west-2` (`neondb` + HSI-owned `hsi_*` stub via `bun run db:migrate`)

**Never** use for HSI substrate, migrations, or Gate C local writes from this workspace:

- ISI / immunecity Neon: `autumn-snow-67879321` / `ep-blue-salad…` — ISI product DB only
- Akeno Neon / DeliverX Neon — out of scope / ignore

No shared evidence DB between HSI and immunecity. Details: [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md). Do not commit secrets (see `.env.example`). **Never paste Neon passwords into chat** — use `neonctl` OAuth or gitignored `.env.local`; HSI URL must be red-wave only.

## Immunecity edit policy (freeze lift)

**Freeze lifted 2026-11-01** (user authorization) **for ISI HSI-consume wiring only**:

- Allowed: edits in `~/Desktop/immune-city` or https://github.com/gnaneshwer23/immunecity that wire HSI Discovery JSON consume (client, honesty asserts, `/hsi-consume` or evidence/Discovery route mapping) per [`docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md).
- Still forbidden: DeliverX / `swift-deliveries`; shared Neon; pointing HSI migrations at `autumn-snow`; inventing Gate C auto-approve or production `legalBinding`.
- HSI substrate, seeds, packs, and publish artifacts remain owned by **this** repo (`red-wave`).

## Ignore (irrelevant to HSI)

- https://github.com/gnaneshwer23/swift-deliveries (DeliverX) — not a HITL pattern reference, not a future wire-up, do not sync

DeliverX is ignored entirely.

## Stay focused

Substrate, seeds, maps, exports, docs, and curator checklists (markdown under `docs/`) land here. Immunecity product code only under the freeze-lift scope above. See README “Active codebase”.

## CDS / PHI (binding non-goal)

**No live CDS and no PHI in HSI.** Do not wire Aksh/Akeno clinic engines, patient stores, EHR write-back, or PHI→LLM into this repo. Lift only governance / reject helpers / honesty asserts — see [`docs/CDS_PHI_BOUNDARY.md`](docs/CDS_PHI_BOUNDARY.md) and `src/cdsPhiBoundary.ts`. Aksh product CDS/PHI stays out-of-scope on purpose.
