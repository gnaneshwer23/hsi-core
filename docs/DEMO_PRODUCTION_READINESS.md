# Demo production readiness (RA proof-point)

Engineering smoke and product wiring. **Not** scientific validation, licence
clearance, Gate C approval or clinical fitness.

## Demo vs pending-real

| Corpus id | Status | Use |
| --- | --- | --- |
| `ra-anti-tnf-demo` | Always available (`demo_fixture`, `not_for_scientific_claim`) | Authenticated start → passage review → review → export |
| `ra-anti-tnf-evidence` | `awaiting_verified_source_import` until CC URI import succeeds | Must return `evidence_not_ready` (422); never invent passages |

Canonical demo artifact: `research/ra-anti-tnf-demo/release.json` (SYN-DEMO-PMID-* /
SYN-D001 mirrors). Rights-verified path keeps original ISI ids once import lands.

## Shared modules

- `src/raDemoEvidenceRelease.ts` — demo parse/build/listing
- `src/correctionProvenance.ts` — eval vs training vs demo feeds
- `src/observationBiologyBridge.ts` — research-safe observation → concept hints
- `src/secondPackStub.ts` — second indication scaffolding (blocked until RA proven)

Sync executable code: `bun scripts/sync-shared-technology.ts isi aksh`

## Database activation (ops — separate Neons)

Never use HSI `red-wave` / cloud `DATABASE_URL` for product migrations.

**ISI:** `bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts [--apply]`

**Aksh** (`packages/platform-uk`):

```sh
bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply
bun --env-file=.env.local scripts/provision-hsi-research.ts EXISTING_USER_ID reviewer
```

## Automated smoke (no product Neon)

```sh
bun run ra:smoke-demo
# ISI
bun --cwd ../immunecity scripts/smoke-ra-demo-corpus.ts
# Aksh
bun --cwd ../aksh-health-redesign/packages/platform-uk scripts/smoke-ra-demo-corpus.ts
```

## Smoke checklist (manual later, after DB activation)

1. Sign in to ISI and Aksh `/internal-research`.
2. Start `ra-anti-tnf-demo` → passages → reload → export.
3. Start `ra-anti-tnf-evidence` → `evidence_not_ready`.
4. Cross-owner denied; workflow accept ≠ scientific approval.

## Human verification still required

- Explicit CC BY/CC0 URI import for real PMIDs.
- Product Neon apply + research roles.
- SME annotation / adjudication.
- Measured utility before a second indication pack.
