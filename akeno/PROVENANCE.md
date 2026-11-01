# Akeno → hsi-core provenance

Clinical HITL consumer landed in this repo from founder GitHub sources. **Not** a blind dump of either product app.

## Sources copied / adapted

| Source | Commit | What landed in hsi-core |
|--------|--------|-------------------------|
| [gnaneshwer23/akenohealth](https://github.com/gnaneshwer23/akenohealth) | `620a0f0734120a6461a72eecbe007ce07ab2672f` | HITL review action + guardrail route shapes → `src/akenoConsumer.ts` |
| [gnaneshwer23/akeno-health-ai](https://github.com/gnaneshwer23/akeno-health-ai) | `898dddfb64bb93b41d267a588693c9728f6ce32e` | Lovable marketing/dashboard — **reference only** (not vendored) |
| Local `~/Projects/aksh-health-redesign/packages/akeno` | same tree as akenohealth | Confirmed identical clinical starter kit |

Also noted (not copied): `data-akeno`, `0ne-Health/packages/akeno` (monorepo mirror of akenohealth).

## Intentionally not copied

- `akenohealth/web` Neon-backed patient/consent dashboard (`DATABASE_URL` → Akeno Neon)
- `akenohealth/services/**` Python ingestion / federated / identity stacks
- `akeno-health-ai` full Vite/shadcn Lovable tree, Supabase client, `.env`, `node_modules`
- Secrets, connection strings, PHI fixtures

## Origin notes

- **akeno-health-ai** README: “Welcome to your Lovable project” — [Lovable project](https://lovable.dev/projects/559c6206-fc9a-4123-8721-fccf2194fb7a) / [akeno-health-ai.lovable.app](https://akeno-health-ai.lovable.app/)
- **akenohealth** license: treat as founder UNLICENSED starter kit (same ownership as hsi-core)

## Neon isolation

HSI substrate stays **`red-wave-06625195` only**. Akeno Neon (`silent-violet…`) is never used for Gate C, migrations, or HSI writes. Optional `AKENO_*` env keys in `akeno/.env.example` are documented as **non-HSI** and unused by the in-repo consumer.
