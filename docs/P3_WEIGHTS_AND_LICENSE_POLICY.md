# P3 weights and license policy

**Purpose:** Keep molecular / structure / agent adapters honest in hsi-core.  
**Binding:** [`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md) · `src/p3AdapterLicenseMatrix.ts` · `src/researchSignOffFixture.ts`.

## Hard rules (all adapters)

1. **Never vendor multi-GB model weights** into this repository (git, LFS, or committed blobs).
2. Emit **ModelProposalArtifacts only** → Gate C pending (`autoApprove=false`). Never flip `hsiGrade` / `curationReview`.
3. **No PHI**, no CDS, no clinic recommendation path, no fake commercial license claim.
4. `vendorsModelWeights=false` on every matrix row and adapter bundle.

## Boltz weights policy

Boltz upstream documents MIT for code and weights, but HSI still:

| Rule | Detail |
|------|--------|
| No commit | Multi-GB Boltz weights must **not** live in hsi-core |
| Optional cache | Operators may point an **external** cache via env (e.g. `BOLTZ_WEIGHTS_CACHE=/path/to/cache`) — never commit that path’s contents |
| Ack gate | Stub (and any future live) Boltz proposals require `WEIGHTS_POLICY_ACK=true` |
| Still blocked without ack | Without the ack, `runBoltzAdapter` / license gate refuses proposals |

```bash
# Research/dev only — documents that you read this policy and will not vendor weights.
export WEIGHTS_POLICY_ACK=true
# Optional external cache (local machine / CI secret path — never commit weights):
# export BOLTZ_WEIGHTS_CACHE="$HOME/.cache/boltz-weights"
bun run adapter:boltz
```

## Research sign-off fixtures (AF3 / TDC / ISI agents)

Like the hypothetical partner fixture, adapters that were `blockedUntilSignOff` may move to:

- `research_ok_documented`, or
- `signed_research_test_only`

**only when** the research sign-off fixture is active with:

- `notCommercial=true`
- `replaceWithLegalSignOff=true`
- `legalBinding=false`
- loud banners on bundles / docs

**Do not claim commercial AlphaFold3 rights.** AF3 model parameters remain under DeepMind Terms of Use (non-commercial / restricted). The fixture unlocks **research-test stub proposals only**.

Swap to a real legal sign-off by editing `src/researchSignOffFixture.ts` (set `USE_RESEARCH_SIGN_OFF_FIXTURE=false` and fill legal fields — never invent MoUs).

## Env summary

| Env | Meaning |
|-----|---------|
| `WEIGHTS_POLICY_ACK=true` | Operator ack of this doc; required for Boltz stub proposals |
| `BOLTZ_WEIGHTS_CACHE` | Optional external weights directory (not vendored) |
| `ALLOW_HYPOTHETICAL_PARTNER` | Separate partner fixture (see `hypotheticalPartnerFixture.ts`) |

## See also

- License matrix artifact: `hsi-p3-adapter-license-matrix.*`
- Adapter spikes: `src/adapters/*Adapter.ts`
- Neon: HSI uses **red-wave only** — [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)
