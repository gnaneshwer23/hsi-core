# CDS / PHI boundary (HSI)

**Status:** Binding non-goal for hsi-core. HSI lifts **governance + reject patterns** from Aksh Health — not live clinical decision support and not protected health information.

## Source repo

| Field | Value |
|-------|-------|
| Canonical product tree | [gnaneshwer23/aksh-health-redesign](https://github.com/gnaneshwer23/aksh-health-redesign) |
| Default branch | `main` |
| Tip at lift | `e552f7c1a155ac2196ad8acbd8f6ea2d5afbe76d` |
| Legacy monorepo name | [gnaneshwer23/0ne-Health](https://github.com/gnaneshwer23/0ne-Health) (private; workspace remotes to redesign) |
| Local clone used | `~/Workspace/0ne-Health` |

**“health-live” note:** There is no separate `health-live` GitHub product under the founder account. In Aksh, `healthLive` is an ops variable in `packages/platform-uk/scripts/generate-evidence-pack.mjs` that probes a running `/api/health` during pack generation. CDS/PHI product surfaces live inside **aksh-health-redesign** / platform-uk (and related Aksh/Akeno packages).

## What HSI lifted (in-repo)

| Artifact | Role |
|----------|------|
| [`src/cdsPhiBoundary.ts`](../src/cdsPhiBoundary.ts) | Typed invariants + `rejectPhiPayload` / `rejectLiveCdsClaim` / `assertHsiCdsPhiBoundary` |
| This doc | Human contract + out-of-scope inventory |
| Agent checklist in module | Refuse-PHI / notCds posture for curator & agent paths |
| Existing honesty | `notCds`, `containsPhi=false`, `mayUseLivePhi=false`, `cdsSurfacable=false`, Gate C human-only |

Aksh patterns encoded (not copied as executable clinic code):

- Research evaluation boundary — synthetic offline eval only; no production clinical AI claim
- `system-contracts` — `syntheticOnly`, `realPatientData=false`, no live NHS integration
- Precision-health whole-loop honesty — `liveEmis:false`, not MHRA-approved CDS
- Permission matrix — named PHI chat denied for ops/researcher roles (product RBAC; HSI documents the refuse rule)
- EMIS env keys ≠ permission to flip live write-back

## Explicitly left out (do not port into HSI)

| Left in Aksh / Akeno | Why |
|----------------------|-----|
| Live CDS engines, DrASSIST runtime, chart auto-apply | Clinical product — HSI is research substrate |
| Patient spine / Medplum / review-case PHI stores | PHI plane forbidden on `red-wave` |
| Synthetic patient fixtures as evidence grades | Would blur teaching vs clinic |
| EMIS partner adapters / liveEmis flip | EHR write-back out of scope |
| Akeno PHI vault, federated PHI training | Stage 3+ clinical brand elsewhere |
| India ABHA / HIP-HIU / CDSCO Class B claims | Product/regulatory — not HSI Discovery |
| Full `packages/platform-uk` app, e2e, Neon product DB | Wrong Neon; wrong product |

## Invariants (must hold)

```ts
notCds: true
autoSurfaceCds: false
autoApproveIntoKg: false
containsPhi: false
mayUseLivePhi: false
clinicalActive: false
liveEmis: false
ehrWriteBack: false
mhraApprovedCds: false
phiToLlm: false
```

Neon for HSI remains **`red-wave-06625195` only**. Never autumn-snow / Akeno / DeliverX.

## How to verify

```bash
cd ~/Projects/hsi-core
bun test test/cdsPhiBoundary.test.ts
```

Package API:

```ts
import {
  assertHsiCdsPhiBoundary,
  rejectPhiPayload,
  rejectLiveCdsClaim,
  buildCdsPhiBoundaryBundle,
  HSI_CDS_PHI_INVARIANTS,
} from "hsi-core";
```

## Related

- [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md) — agent catalog (inventory only)
- [`AKSH_HITL_CONSUMPTION.md`](./AKSH_HITL_CONSUMPTION.md) — HITL cards; CDS closed
- [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md) — translation HITL; `clinicalActive=false`
- [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) — Neon isolation
- immunecity consume honesty (`assertHonestyFlags`) — rejects `notCds=false` / `containsPhi=true` / live CDS surface flags under freeze-lift wiring
