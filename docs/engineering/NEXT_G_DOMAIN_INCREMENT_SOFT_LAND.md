# NEXT-G — Controlled domain/source increment soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** domain/source increment acceptance, planner enablement, community launch, clinical/PHI, or scientific approval.

Binding row: [`docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md) — **NEXT-G / P2**.  
Typed catalog: [`src/operations/nextGDomainIncrementSoftLand.ts`](../../src/operations/nextGDomainIncrementSoftLand.ts).  
Pending worksheet: [`operations/staging/next-g-domain-increment.pending.json`](../../operations/staging/next-g-domain-increment.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Expansion / planner / source-pack adapters | Reused |
| `domainIncrementAccepted` | Always `false` |
| Depends on | **NEXT-C** + independently closed observed-failure ledger |
| Invented source packs / scoped reviewers | **Forbidden** |
| Planner enablement by default | **Forbidden** (deterministic unless preregistered study) |
| Community launch | **Deferred** until moderation ownership |
| Clinical/PHI | **Separate plane** — never enabled here |

## What this soft-land adds

1. Typed inventory of seven domain-increment surfaces.  
2. Mode assessor (`check` / `fixture`) that never claims an increment.  
3. Increment honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet with UNASSIGNED / DEFERRED refs.

## Reuse (do not rebuild)

- `src/expansion/controlledExpansion.ts`  
- `src/expansion/plannerComparison.ts` + E2E-11 soft-land  
- `src/expansion/rereviewOutcomeGuard.ts`  
- R1 biomedical source-packet scaffolds  
- `docs/CDS_PHI_BOUNDARY.md`  

## Owner next steps (not this PR)

1. Accept NEXT-C and independently close the observed-failure ledger.  
2. Bind current source packs and scoped reviewers.  
3. Propagate source-refresh re-review without transferring approvals.  
4. Keep planner deterministic unless a preregistered equal-evidence/cap study passes.  
5. Defer community; keep clinical/PHI separate.

## Explicit non-goals

- Inventing source packs, reviewers, or ledger close in git  
- Enabling planner, community, or clinical/PHI from soft-land green  
- Treating fixture expansion tests as domain-increment acceptance  
