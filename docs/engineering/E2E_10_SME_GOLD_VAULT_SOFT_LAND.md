# PR-E2E-10 — SME gold authoring / vault soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** `smeGoldFilled`, adjudicated cases, frozen held-out splits, scientific approval, or invented expert identities.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-10**.  
Typed catalog: [`src/operations/e2e10SmeGoldVault.ts`](../../src/operations/e2e10SmeGoldVault.ts).  
Pending worksheet: [`operations/staging/e2e-10-sme-gold-vault.pending.json`](../../operations/staging/e2e-10-sme-gold-vault.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Label vault layout (VER-05) | Reused; gitignored; runtime may not read |
| Draft 50-case bank | Scaffold only — **not gold** |
| `smeGoldFilled` | Always `false` |
| `independentlyLabelledCases` / `adjudicatedCases` | Always `0` in committed artifacts |
| Target range 60→120 | Human authoring goal; not an engineering fill claim |
| Invented SME labels / adjudications | **Forbidden** |
| Scientific acceptance | **Blocked** |

## What this soft-land adds

1. Typed inventory of seven gold-authoring surfaces (vault → worksheets → human slots → freeze gates).  
2. Mode assessor (`check` / `fixture`) that never claims gold filled or held-out freeze.  
3. Authoring honesty assessor for ops / product copy.  
4. Pending JSON worksheet with UNASSIGNED SME and adjudicator refs.

## Reuse (do not rebuild)

- `src/evidence/labelVault.ts` + `label-vault:*` CLI  
- `src/evidence/immunoDevSet.ts`  
- Conflict benchmark expert path  
- R2 empty SME A/B + adjudication worksheets (`bun run r2:check`)  
- Gold Evaluation Suite v1 (`bun run gold:check`)  
- Scientific benchmark SME role slots

## Owner next steps (not this PR)

1. Recruit independent SME A, SME B, and an adjudicator (human queue #4).  
2. Author labels only under `.hsi-private-benchmark` via the vault CLI.  
3. Grow adjudicated cases from the draft bank toward 60→120 without inventing labels.  
4. Keep committed manifests at `smeGoldFilled=false` until dual SME + adjudication exist.  
5. Do not freeze held-out splits without rights-cleared packets (#2) and real labels.

## Explicit non-goals

- Inventing expert identities, labels, or adjudications in git  
- Committing gold into the public tree or allowing runtime DB roles to read the vault  
- Treating `r2:check` / soft-land green as scientific acceptance  
- Claiming calibrated accuracy for dual-provider verification (E2E-06) without gold  
