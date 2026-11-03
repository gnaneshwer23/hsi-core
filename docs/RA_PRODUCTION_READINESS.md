# RA investigation production readiness

Engineering and product wiring for the RA / anti-TNF investigation path. **Not**
scientific validation, licence clearance, Gate C approval or clinical fitness.

## Research working set vs pending-real

| Corpus id | Status | Use |
| --- | --- | --- |
| `ra-anti-tnf-research` | Always available (`research_working_set`, `notForScientificClaim`) | Authenticated start → passage review → review → export |
| `ra-anti-tnf-evidence` | `awaiting_verified_source_import` until CC URI import succeeds | Must return `evidence_not_ready` (422); never invent passages |

Canonical research artifact: `research/ra-anti-tnf-research/release.json` (`SYN-RA-SRC-*` /
`SYN-D001` mirrors). Rights-verified path keeps original ISI ids once import lands.

## Shared modules

- `src/raResearchEvidenceRelease.ts` — research working-set parse/build/listing
- `src/correctionProvenance.ts` — eval vs training vs research-working-set feeds
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

## Automated verification (no product Neon)

```sh
bun run ra:verify-research-path
# ISI
bun --cwd ../immunecity scripts/verify-ra-research-corpus.ts
# Aksh
bun --cwd ../aksh-health-redesign/packages/platform-uk scripts/verify-ra-research-corpus.ts
```

## Operator checklist (manual later, after DB activation)

1. Sign in to ISI and Aksh `/internal-research`.
2. Start `ra-anti-tnf-research` → passages → reload → export.
3. Start `ra-anti-tnf-evidence` → `evidence_not_ready`.
4. Cross-owner denied; workflow accept ≠ scientific approval.

## Human verification still required

- Explicit CC BY/CC0 URI import for real PMIDs.
- Product Neon apply + research roles.
- SME annotation / adjudication.
- Measured utility before a second indication pack.
