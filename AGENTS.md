# Agent instructions — hsi-core

**`hsi-core` is the sole active codebase for the HSI substrate.** Human Super Intelligence is one product. Aksh Health, HSI Clinical, ISI and HSI Trials are governed modules. ISI science must not depend on Aksh Health. Private patient data must not enter the research graph automatically. Edit this repository: https://github.com/gnaneshwer23/hsi-core.

## Neon isolation (binding)

Use **only** the HSI Neon project for HSI substrate migrations and local Gate C writes.

Tracked files store **placeholders** (`hsi-neon-project`, `ep-hsi-production`, `ep-hsi-staging`). Real project, branch and host values belong in the private environment (`HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_HOST_ALLOWLIST`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN`). Do not commit them.

**Never** point HSI substrate migrations at another product’s Neon project. No shared evidence database with immunecity. Details: [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md). Do not commit secrets (see `.env.example`). **Never paste Neon passwords into chat** — use `neonctl` OAuth or gitignored `.env.local`.

## Immunecity edit policy (freeze lift)

**Freeze lifted 2026-11-01** (user authorization) **for ISI HSI-consume wiring only**:

- Allowed: edits in the immunecity checkout or https://github.com/gnaneshwer23/immunecity that wire HSI Discovery JSON consume (client, honesty asserts, `/hsi-consume` or evidence/Discovery route mapping) per [`docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md).
- Still forbidden: DeliverX / `swift-deliveries`; shared Neon; pointing HSI migrations at another product database; inventing Gate C auto-approve or production `legalBinding`.
- HSI substrate, seeds, packs, and publish artifacts remain owned by **this** repo.

## Ignore (irrelevant to HSI)

- https://github.com/gnaneshwer23/swift-deliveries (DeliverX) — not a HITL pattern reference, not a future wire-up, do not sync

DeliverX is ignored entirely.

## Stay focused

Substrate, seeds, maps, exports, docs, and curator checklists (markdown under `docs/`) land here. Immunecity product code only under the freeze-lift scope above. See README “Active codebase”.

## Personal agent skills (on demand)

~590 skills under `~/.cursor/skills/` — **do not** always-load them. Task→skill map: [`docs/AGENT_SKILLS.md`](docs/AGENT_SKILLS.md). Thin Cursor rules in `.cursor/rules/`. Do not wire browse-adjacent tools (PentAGI, RAG-Anything, Anime.js, MediSearch, Hippocratic, Nabla) into this repo.

## CDS / PHI (binding non-goal)

**No live CDS and no PHI in HSI.** Do not wire Aksh/Akeno clinic engines, patient stores, EHR write-back, or PHI→LLM into this repo. Lift only governance / reject helpers / honesty asserts — see [`docs/CDS_PHI_BOUNDARY.md`](docs/CDS_PHI_BOUNDARY.md) and `src/cdsPhiBoundary.ts`. Aksh product CDS/PHI stays out-of-scope on purpose.
