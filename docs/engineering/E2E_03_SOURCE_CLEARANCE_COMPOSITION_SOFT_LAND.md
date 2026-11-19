# PR-E2E-03 — Source clearance composition soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** signed clearance policy, appointed authority, managed signer, live passage reuse authorization, scientific approval, or production activation.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-03**.  
Typed catalog: [`src/operations/e2e03SourceClearanceComposition.ts`](../../src/operations/e2e03SourceClearanceComposition.ts).  
Policy memo (still **DRAFT**): [`docs/SOURCE_CLEARANCE_POLICY_DRAFT.md`](../SOURCE_CLEARANCE_POLICY_DRAFT.md).  
Pending worksheet: [`operations/staging/e2e-03-source-clearance.pending.json`](../../operations/staging/e2e-03-source-clearance.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| `SOURCE_CLEARANCE_POLICY_DRAFT` | Remains **DRAFT** — never flipped here |
| Policy signed / approval ref | Always `false` / `null` |
| Passage or abstract without receipt | Always refused by assessor |
| Live `liveWiring` composition | Reused when present; still blocked until B1 injects signed policy |
| Invented signer / authority | **Not invented** |
| Fixture / unit green | Not live clearance evidence |

## What this soft-land adds

1. Typed inventory of nine retrieval surfaces (`gate`, `metadata_only`, `already_composed`).  
2. Mode assessor (`check` / `fixture`) that never allows uncleared passage egress claims.  
3. Abstract-egress assessor for legacy APIs (`assessPassageAbstractEgress`) — always fail-closed on reuse.  
4. Pending JSON worksheet with UNASSIGNED authority / signer refs.  
5. Honesty fields on `/api/scientific-abstract` responses so clients cannot mistake bibliographic abstract inspection for rights clearance.

## Reuse (do not rebuild)

- `src/researchV2/sourceClearanceReceipt.ts`  
- `src/researchV2/operationalSourceClearance.ts`  
- `src/researchV2/clearancePolicy.ts` / `clearanceAuthority.ts` / `clearanceSigning.ts`  
- `src/liveSearch.ts` + `src/liveWiring.ts` (gold path when signed policy exists)

## Owner next steps (not this PR)

1. Sign or explicitly defer the draft policy (Track B1).  
2. Appoint clearance authority + managed Ed25519 signer outside git.  
3. Inject verified policy into `liveWiring`; prove first-scope CC BY chain.  
4. Only then may gate surfaces move from documented-gate to receipt-composed live egress.

## Explicit non-goals

- Inventing policy approval, interim authority, or signer names  
- Enabling `model_transmission`  
- Treating Europe PMC abstract fetch as rights clearance  
- Claiming scientific approval or graph promotion  
- Removing migration holds or enabling production writes  
