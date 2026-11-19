# PR-E2E-09 — Premium public pages soft-land

**Status:** Engineering soft-land. CI-safe catalog and honesty assessors only.  
**Not claimed:** fake metrics, pilot KPIs, gold-standard counts, clinical validation, scientific approval, or owner brand acceptance.

Binding backlog row: [`docs/implementation/02-prioritised-backlog.md`](../implementation/02-prioritised-backlog.md) — **PR-E2E-09**.  
Typed catalog: [`src/operations/e2e09PremiumPublicPagesSoftLand.ts`](../../src/operations/e2e09PremiumPublicPagesSoftLand.ts).  
Pending worksheet: [`operations/staging/e2e-09-premium-public-pages.pending.json`](../../operations/staging/e2e-09-premium-public-pages.pending.json).  
Implementation wiring: [#474](https://github.com/gnaneshwer23/hsi-core/pull/474).  
Brand Stage 0 doctrine: [#465](https://github.com/gnaneshwer23/hsi-core/pull/465).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Fake / invented performance metrics | **Forbidden** |
| Pilot performance KPIs | **Forbidden** |
| Gold-standard adjudicated counts | **Forbidden** |
| Clinical validation / live CDS | **Forbidden** |
| `/validation` vs `/research/validation` | Methodology page ≠ synthetic lab |

## What this soft-land adds

1. Typed inventory of seven premium-public surfaces.  
2. Mode assessor (`check` / `fixture`) that never permits fake metrics.  
3. Public honesty assessor for ops / agent pick-next copy.  
4. Pending JSON worksheet binding `#474` / `#465` without over-claiming.

## Reuse (do not rebuild)

- `AudiencePublicPages` (`/researchers`, `/biotech`, `/validation`)  
- `PUBLIC_MARKETING_PATHS` in `primaryNav`  
- SEO honesty entries + premium-public styles  
- Shared `ResearchPublic` / `PublicNotices` primitives  

## Owner next steps (not this PR)

1. Keep indexed IA limited to the marketing path catalog.  
2. Reject any copy that invents metrics, pilots, or gold counts.  
3. Owner visual / brand acceptance remains a separate gate.  
4. Do not conflate public methodology with synthetic validation fixtures.

## Explicit non-goals

- Inventing comparative performance scoreboards  
- Claiming scientific superiority or clinical validation  
- Closing owner brand visual gates from soft-land green  
