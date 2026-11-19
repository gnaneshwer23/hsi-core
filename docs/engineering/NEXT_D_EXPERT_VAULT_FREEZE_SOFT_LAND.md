# NEXT-D — Expert vault / signed freeze soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** `smeGoldFilled`, signed freeze, 120 resolved final cases, invented expert IDs/scores, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-D / P1**.  
Typed catalog: [`src/operations/nextDExpertVaultFreezeSoftLand.ts`](../../src/operations/nextDExpertVaultFreezeSoftLand.ts).  
Pending worksheet: [`operations/staging/next-d-expert-vault-freeze.pending.json`](../../operations/staging/next-d-expert-vault-freeze.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| PR-E2E-10 vault / worksheet catalog | Reused |
| `smeGoldFilled` / `frozenHeldOut` | Always `false` |
| `signedFreezeClaimed` | Always `false` |
| Resolved final case target | **120** (human goal, not an engineering fill) |
| Invented expert IDs / scores / methodology signature | **Forbidden** |
| Tuning / final evaluation before rubric + floors | **Forbidden** |

## What this soft-land adds

1. Typed inventory of seven expert-authoring / freeze surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims gold or signed freeze.  
3. Freeze honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with UNASSIGNED expert and methodology refs.

## Reuse (do not rebuild)

- PR-E2E-10 soft-land (`e2e10SmeGoldVault`)  
- `src/evidence/labelVault.ts`  
- R2 / gold-suite empty worksheets  
- Conflict benchmark expert path  
- N3 / R2 freeze checklists  

## Owner next steps (not this PR)

1. Recruit two independent experts and a separate adjudicator.  
2. Author under the gitignored curator vault; keep holdout answers restricted.  
3. Resolve exactly 120 final cases with family splits and contamination evidence.  
4. Approve methodology/rubric and subgroup/risk floors before tuning.  
5. Sign freeze only after dual labelling + adjudication.

## Explicit non-goals

- Inventing expert identities, scores, or methodology signatures in git  
- Claiming soft-land / `r2:check` / `gold:check` green as signed freeze  
- Freezing held-out splits without real dual experts and adjudication  
- Starting NEXT-E benchmark execution without this acceptance  
