# RA investigation production readiness

Engineering and product wiring for the RA / anti-TNF investigation path. **Not**
scientific validation, licence clearance, Gate C approval or clinical fitness.

## Research working set vs pending-real

| Corpus id | Status | Use |
| --- | --- | --- |
| `ra-anti-tnf-research` | Always available (`research_working_set`, `notForScientificClaim`) | Authenticated start → passage review → review → export |
| `ra-anti-tnf-evidence` | Rights-verified import available (protocol v2; Crossref attestation); still `scientificReview: unreviewed` | Export via Phase 3; never invent passages or treat as scientific approval |

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

## Phase 5 proof-point (disposable local DB)

See [PHASE5_RA_PROOF_SMOKE.md](PHASE5_RA_PROOF_SMOKE.md). After
`setup-investigation-test-db.ts --reset` in each product:

```sh
# ISI
HSI_TEST_DB_URL=postgres://hsi_app_test:…@127.0.0.1:5432/hsi_step3_test \
  bun --cwd ../immunecity scripts/phase5-ra-proof-smoke.ts
# Aksh
HSI_TEST_DB_URL=postgres://hsi_app_test:…@127.0.0.1:5432/hsi_step3_test \
  bun --cwd ../aksh-health-redesign/packages/platform-uk scripts/phase5-ra-proof-smoke.ts
```

## Operator checklist (manual browser, after DB activation)

1. Sign in to ISI and Aksh `/internal-research` (Aksh needs research membership).
2. Start `ra-anti-tnf-research` → passages → reload → export.
3. Start `ra-anti-tnf-evidence` → `evidence_not_ready`.
4. Cross-owner denied; workflow accept ≠ scientific approval.

## Phase 6 annotation kit

See [PHASE6_CONTEXT_ANNOTATION_BENCHMARK.md](PHASE6_CONTEXT_ANNOTATION_BENCHMARK.md).

```sh
bun run ra:scaffold-annotation -- practice   # empty practice packets from research working set
bun run ra:scaffold-annotation -- verified # empty eval/training packets from rights-verified release
```

Verified scaffolds minted 2026-11-03 (`ready_for_sme_kickoff`; labelledRows=0). See [PHASE6_CONTEXT_ANNOTATION_BENCHMARK.md](PHASE6_CONTEXT_ANNOTATION_BENCHMARK.md).

## Human verification still required

- Product Neon apply + research roles (Aksh membership grant) where not already done.
- SME annotation / adjudication on eval packets (labels still empty).
- Measured utility before a second indication pack.
