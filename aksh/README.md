# Aksh agent catalog (in hsi-core)

Structured copy of Aksh Health agent names and roles for HSI HITL / translation consumers.

## Contents

| Path | Role |
|------|------|
| `agent-catalog.json` | Canonical JSON inventory |
| `PROVENANCE.md` | Source repo + commit SHA |
| `source/` | Read-only snapshots of `agents.ts` + `register.ts` (not compiled) |

See [`docs/AKSH_AGENTS_IN_HSI.md`](../docs/AKSH_AGENTS_IN_HSI.md).

## View

```bash
bun run site:dev   # http://localhost:5173/aksh-agents
```

Not live CDS. No Aksh/Akeno Neon. No secrets.
