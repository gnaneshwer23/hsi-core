# Neon project map (no secrets)

Read-only orientation for agents with Neon CLI OAuth (`~/.config/neonctl/credentials.json` or `NEON_API_KEY`). **Do not** put passwords or full connection strings here. Host prefixes only.

Access check: `npx neonctl me` → `npx neonctl projects list`. No Neon MCP is required in this workspace.

## Role map (HSI-relevant)

| Neon project name | Project ID | Default branch | Endpoint host prefix | Role |
|-------------------|------------|----------------|----------------------|------|
| **human super intelligence** | `red-wave-06625195` | `production` (`br-quiet-silence-zab1zvji`) | `ep-restless-dew-zas989pv…eu-west-2` | **HSI / unknown empty** — brand-new PG18 project (created 2026-11-01); `neondb` with **zero** user tables. Not Gate C; not Akeno. Likely intended substrate DB for hsi-core (empty until migrations). |
| **immunecity** | `autumn-snow-67879321` | `production` (`br-super-sea-b5pre85r`) | **`ep-blue-salad-b5fk2n36…us-east-2`** | **ISI product DB (Gate C–adjacent)** — evidence/community/ask tables (`evidence_*`, `claim_candidates`, graph provenance, clinical_trials, etc.). Many Vercel preview branches. Consume via published exports from hsi-core; do not edit immunecity code for HSI. |
| **akeno health** | `silent-violet-81283547` | `production` (`br-billowing-leaf-abcx5miw`, archived) | `ep-weathered-mountain-abmzoit7…eu-west-2` | **Akeno clinical** — patients / consent / ingestion (PHI-class schema). Out of Stage 1 pilot; do not merge into ISI or hsi-core. |

## Other projects on the same Neon login (context only)

| Name | Project ID | Notes |
|------|------------|--------|
| praja ledger | `square-cake-28248061` | unrelated |
| carebridgeindia | `orange-block-41773018` | unrelated |
| deliverx | `spring-wind-48457918` | **ignore** for HSI (DeliverX) |
| SIGNALFORGE | `mute-base-44162928` | unrelated |
| Aksh Health / Aksh Health Production | `floral-salad-21467299` / `tiny-river-29853628` | Aksh HITL consumers — not Gate C substrate |
| SciFlowAI, Modi, modi-pharmacovigilance | various | unrelated |

## Agent rules

1. Prefer **read-only** inspection (`branches list`, `databases list`, schema `SELECT` via `neonctl psql`) unless the user asked to mutate.
2. **Never** print API keys, passwords, or full connection strings in docs or chat.
3. Stay out of immunecity / akeno / swift-deliveries **code** edits; hsi-core is the sole HSI edit target ([`AGENTS.md`](../AGENTS.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)).
4. Gate C curation artifacts live in this repo (`docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md`, exports); immunecity Neon holds the **product** evidence/community store that may consume those exports.
