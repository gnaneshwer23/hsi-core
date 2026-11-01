# Akeno clinical consumer (in hsi-core)

HITL review surface for Phase 8 `hsi-translation-handoff` candidates. Consumes clinic ids (`aksh:…`) and handoff rows with **hard not-CDS** gates.

## Run

```bash
# from hsi-core root
bun test
bun run outputs          # regenerates handoff + discovery JSON
bun run site:dev         # open http://localhost:5173/akeno
```

Discovery Centre **TRANSLATE** deep-links here (`/akeno`).

## What this is

- `src/akenoConsumer.ts` — typed consumer + local HITL decision stubs
- `site/src/pages/AkenoConsumer.tsx` — review UI (session-local decisions)
- Loads `site/public/discovery/hsi-translation-handoff.json`

## What this is not

- Not live CDS / diagnosis / treatment / PHI / EHR write-back
- Not Akeno Neon (`silent-violet`) — see [`docs/NEON_PROJECT_MAP.md`](../docs/NEON_PROJECT_MAP.md)
- Not a vendored copy of the Lovable marketing app

## Neon / env

| Env | Role |
|-----|------|
| `DATABASE_URL` / HSI keys | **HSI red-wave only** (repo root `.env.example`) |
| `AKENO_*` (this folder’s `.env.example`) | Optional non-HSI docs only — **unused** by the consumer; never Gate C |

See [`PROVENANCE.md`](./PROVENANCE.md) and [`docs/AKENO_IN_HSI.md`](../docs/AKENO_IN_HSI.md).
