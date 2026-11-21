# HSI public launch QA packet — 21 November 2026

**Stage:** L0 public launch (production readiness phase U2)  
**Production:** https://www.humansuperintelligence.tech/  
**Main tip at packet authoring:** `321ae53f`  
**Evidence folder:** `docs/qa/evidence/prod-2026-11-21/`  
**Stance:** Visual / a11y / SEO / honesty checks only. Not scientific acceptance. Not write enablement.

## Commands (local, fresh build)

```bash
cd site && bun run build
bun run test:e2e -- e2e/landing-pages.spec.ts e2e/stage2-integrated-qa.spec.ts e2e/seo.spec.ts e2e/approved-website.spec.ts e2e/demo-universe-landing.spec.ts
```

Stale `site/dist` can false-fail nav assertions — always rebuild first.

## Checklist

| Check | Result (21 Nov agent run) | Notes |
| --- | --- | --- |
| Site build + CSS budget | Pass | CSS ~135213 gz / budget 136500 |
| landing-pages e2e | Pass (5/5 after rebuild) | Nav: Home / How it works / Knowledge graph |
| stage2-integrated-qa e2e | Pass | Mobile Create account chrome |
| seo + approved-website | Run with packet | Honesty strings required |
| demo-universe-landing | Pass | Six pack-backed scenarios on home |
| Production `/` HTTP 200 | Pass | Diagram-first hero + honesty microcopy |
| Production `/how-it-works` | Pass | 8-step spine; demo CTA |
| Production `/researchers` | Pass | Audience flow + AVAILABLE/RESTRICTED |
| Production `/demo/universe` | Pass | DEMONSTRATION DATA; write false |
| Production `/research/workspace` | Pass | Journey complete / approval / writes false |
| Axe WCAG on public pages | Pass via landing-pages e2e | Tags wcag2a/aa + 2.1/2.2 aa |
| No horizontal overflow @390px | Pass via landing-pages e2e | |

## Honesty labels required on public surfaces

- Research preview / candidate-only / unreviewed / no clinical advice / synthetic patients only (home)  
- Demo: synthetic demonstration · scientific approval false · production graph write false  

## Owner sign-off

| Role | Name / date | Decision |
| --- | --- | --- |
| Visual acceptance | _UNASSIGNED_ | Pending |
| Public launch GO / NO-GO | _UNASSIGNED_ | Pending |

**Not claimed by this packet:** scientific validation, clearance, staging persistence, or unrestricted researcher access.

**Readiness soft-land:** [`docs/engineering/HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md`](../engineering/HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md) — engineering surfaces ready; owner visual acceptance + GO/NO-GO still required.
