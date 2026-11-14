# Aksh agents in hsi-core

**Status:** Structured agent **catalog** (names, roles, HITL posture) — not live CDS and not an executable Aksh clinical loop.

## Source

| Field | Value |
|-------|-------|
| Repo | [gnaneshwer23/aksh-health-redesign](https://github.com/gnaneshwer23/aksh-health-redesign) |
| Commit | `404026eaada304f732226a51b9434b32fb6c6d47` |
| Directory | `packages/platform-uk/lib/agents.ts` → `AGENT_DIRECTORY` (12 peers) |
| Register | `packages/platform-uk/lib/agents/register.ts` → `AGENTS` (14 named) |

Provenance detail: [`aksh/PROVENANCE.md`](../aksh/PROVENANCE.md).

## What landed

| Path | Role |
|------|------|
| `aksh/agent-catalog.json` | Durable JSON catalog |
| `aksh/source/*.ts` | Read-only registry snapshots (not compiled) |
| `src/akshAgents.ts` | Typed package API |
| ~~`site/public/aksh/agent-catalog.json`~~ | Removed: the public site no longer names the separately governed products; the durable catalog above remains the source |
| `site/` route **`/aksh-agents`** | Browse names / roles |
| This doc | Human index |

## Full name inventory

### Directory peers (12)

CANVAS · SYNTHESIS · BRIDGE · NEXUS · GUARDIAN · PRISM · HORIZON · PATHWAY · COMPASS · ATLAS · SHIELD · CONDUCTOR

### Register (14 — includes sub-capabilities)

CONDUCTOR · VOICE · CANVAS · SYNTHESIS · DrASSIST · GUARDIAN · HORIZON · NEXUS · PATHWAY · BRIDGE · SHIELD · COMPASS · PRISM · ATLAS

### Legacy aliases

| Canonical | Legacy |
|-----------|--------|
| HORIZON | ORACLE |
| COMPASS | EQUITY |
| PATHWAY | REFERRAL |
| DrASSIST | DR_ASSIST / Dr.Assist |

### Out-of-registry (do not count as the 14)

VOICE CARE · Causal AI · NUTRITION · SLEEP · EXERCISE · MENTAL_HEALTH · Guardian Gateway

## Relation to Akeno / HITL

- Agents draft; clinicians decide (Aksh CONDUCTOR + SHIELD posture).
- HSI [`/akeno`](../docs/AKENO_IN_HSI.md) is the translation-handoff HITL consumer — fail-closed, `clinicalActive=false`, no Akeno Neon.
- This catalog is **reference inventory** for mapping HITL surfaces to Aksh names; it does **not** enable clinic CDS in hsi-core.
- CDS/PHI refuse rules (Aksh redesign → HSI): [`CDS_PHI_BOUNDARY.md`](./CDS_PHI_BOUNDARY.md).

## How to view

```bash
bun test
bun run site:dev
# open http://localhost:5173/aksh-agents
```

Package:

```ts
import {
  buildAkshAgentCatalog,
  listAkshDirectoryNames,
  listAkshRegisterIds,
  listAllAkshAgentNames,
} from "hsi-core";
```

## Neon

HSI **`red-wave` only**. Never wire Aksh/Akeno product Neon into Gate C from this workspace.
