# HSI Homepage Production QA

**Status:** PR5 checklist — execute against Vercel preview for `design/homepage-premium-pr5` (tip of stack) and production after merge.  
**Production:** https://www.humansuperintelligence.tech/

## Scope

Premium biomedical homepage redesign (10 sections). Do **not** merge until preview review.

## Functional

- [x] Hero copy + dual CTAs (`/platform`, `/contact`)
- [x] Responsive `<picture>` assets under `/images/homepage/`
- [x] Biology network domain toolbar + `?domain=`
- [x] Intelligence flow stages with honest statuses
- [x] Workspace `#product-demo` illustrative panels
- [x] Discipline cards, workflow `#investigation-workflow`, integrity, applications, ecosystem, access
- [x] Guest Sign In hidden; Account when session exists
- [ ] Playwright editorial + product-experience on preview CI
- [ ] Manual 320 / 390 / 414 / 768 / 1440 overflow check on preview

## Honesty / safety

- [x] `bun run copy:check` (tagline via `HomeHero` + `brand.ts`)
- [x] `bun test test/publicSiteHonesty.test.ts`
- [x] No fabricated metrics/certs; SSc = validation case
- [x] CDS/PHI non-goal language retained
- [x] Backend connections labelled CONNECTED / ILLUSTRATIVE / BLOCKED

## Accessibility

- [x] One `h1` (hero)
- [x] Domain / flow / workflow keyboard controls
- [x] `:focus-visible` on homepage controls
- [x] `prefers-reduced-motion` zeros animations in home shell
- [x] Scientific alt on hero / network images

## SEO / performance

- [ ] Confirm LCP image on preview (webp preferred)
- [ ] Canonical/title for `/` unchanged pathway via `applySeo`

## Tests run locally (PR5)

| Check | Result |
|-------|--------|
| `bun run copy:check` | pass |
| `bun test test/publicSiteHonesty.test.ts` | 8 pass |
| `site` `tsc --noEmit` | pass |
| Playwright local | preview webServer timeout in agent env — rely on CI |

## Screenshots

Attach from Playwright output or Vercel preview:

| Viewport | Notes |
|----------|-------|
| Desktop 1440 | Hero panorama + left copy |
| Mobile 390 | Stacked portrait |

## Outstanding issues

1. Guest Sign In remains hidden until auth capability is `available_and_verified`.  
2. Authenticated research APIs stay BLOCKED anonymously (`writesEnabled=false`).  
3. Omics / some discipline destinations are honesty-labelled in development.  
4. Local Playwright webServer timed out in agent environment; confirm CI verify on PR5.  
5. Stacked PRs #168/#169 failed verify on missing tagline before PR5 fix — tip PR5 must be green before merge order.
