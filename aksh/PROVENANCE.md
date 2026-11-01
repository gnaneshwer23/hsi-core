# Aksh Health agents → hsi-core provenance

Agent **catalog** (names, roles, contracts) landed in this repo from founder GitHub sources. **Not** a dump of the Aksh monorepo or live CDS.

## Primary source (agent roster)

| Source | Commit | What landed in hsi-core |
|--------|--------|-------------------------|
| [gnaneshwer23/aksh-health-redesign](https://github.com/gnaneshwer23/aksh-health-redesign) | `404026eaada304f732226a51b9434b32fb6c6d47` | Canonical 12-agent `AGENT_DIRECTORY` + 14-agent `AGENTS` register → `aksh/agent-catalog.json`, `src/akshAgents.ts`, read-only snapshots under `aksh/source/` |

Paths in source tree:

- `packages/platform-uk/lib/agents.ts` — `AGENT_DIRECTORY` (12 peers)
- `packages/platform-uk/lib/agents/register.ts` — `AGENTS` contracts (14 named)

Local clones used for read: `~/Projects/aksh-health-redesign`, `~/Projects/aksh-health-agent-audit` (same remote; audit branch docs), `~/Workspace/0ne-Health` (mirrors redesign + legacy `0ne-Health` remote).

## Other Aksh-related repos (noted, not used as roster)

| Repo | Role |
|------|------|
| [gnaneshwer23/0ne-Health](https://github.com/gnaneshwer23/0ne-Health) | Older monorepo name; workspace clone remotes to redesign |
| [gnaneshwer23/aksh](https://github.com/gnaneshwer23/aksh) | Separate product shell (voice enrollment) — not the clinical agent directory |
| [gnaneshwer23/aksh-health](https://github.com/gnaneshwer23/aksh-health) | Legacy public stub |
| `akshhealth-*` UK/India/shared | Product slices; no fuller roster than redesign |
| [gnaneshwer23/akenohealth](https://github.com/gnaneshwer23/akenohealth) | Already integrated as HITL consumer (`/akeno`) — not the agent name catalog |

## Intentionally not copied

- LLM runners (`llm-*.ts`), API routes, Neon/Medplum wiring, PHI fixtures
- `node_modules`, `.env`, secrets, connection strings
- Full `packages/platform-uk` app / e2e trees
- Live CDS / EHR write-back — catalog is **inventory + HITL posture only**

## Relation to Akeno-in-HSI

Aksh agents draft; clinicians decide. HSI `/akeno` remains the translation-handoff HITL consumer (`clinicalActive=false`, no Akeno Neon). Agent names here are **reference inventory** for mapping HITL surfaces — not an executable clinical loop in hsi-core.

## Neon isolation

HSI substrate stays **`red-wave-06625195` only**. Do not wire Aksh / Akeno product Neon into Gate C from this workspace.
