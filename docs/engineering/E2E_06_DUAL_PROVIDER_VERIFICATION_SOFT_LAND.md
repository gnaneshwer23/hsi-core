# PR-E2E-06 — Dual-provider verification soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** reliability-gate pass, model independence proof, staging provider bind authorization, SME gold, scientific approval, or production activation.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-06**.  
Typed catalog: [`src/operations/e2e06DualProviderVerification.ts`](../../src/operations/e2e06DualProviderVerification.ts).  
Pending worksheet: [`operations/staging/e2e-06-dual-provider-verification.pending.json`](../../operations/staging/e2e-06-dual-provider-verification.pending.json).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Dual-model harness (#275 / B-04.4) | Reused; engineering only |
| `modelIndependenceVerified` | Always `false` |
| `releaseEligible` / gate pass | Always refused |
| Staging provider credentials / deployments | **Not invented** |
| Abstention when insufficient / runner fails | Required |
| Empty opposing checks = consensus | **Forbidden** |
| SME gold / calibrated accuracy | Blocked (PR-E2E-10) |

## What this soft-land adds

1. Typed inventory of seven verification surfaces (harness reuse → UI honesty → owner-gated bind → gold block).  
2. Mode assessor (`check` / `fixture`) that never claims gate pass or live bind.  
3. Abstention honesty assessor for product UI copy.  
4. Pending JSON worksheet with UNASSIGNED deployment refs.

## Reuse (do not rebuild)

- `src/researchV2/dualModelChallenge.ts`  
- `src/researchV2/providerReliability.ts`  
- `src/researchV2/reliabilityEvaluationHarness.ts`  
- `src/researchV2/scientificReliabilityGate.ts`  
- Investigation workspace verification status copy

## Owner next steps (not this PR)

1. Name two distinct approved staging provider deployments.  
2. Bind privately; run dual challenge on cleared passages only.  
3. Confirm UI abstention / not_configured honesty under failure.  
4. Keep reliability gate `releaseEligible:false` until gold + governance thresholds exist.

## Explicit non-goals

- Inventing OpenAI/Anthropic keys or non-allowlisted endpoints  
- Claiming scientific accuracy or independence proof  
- Enabling production model spend without SEC-02 owner caps  
- Treating fixture green as staging bind acceptance  
