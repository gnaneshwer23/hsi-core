# HSI Homepage Production QA

**Status:** Checklist skeleton (PR1). Execute fully in PR5 against Vercel preview + production.  
**Production:** https://www.humansuperintelligence.tech/

## Scope

Premium biomedical homepage redesign (10 sections). Do **not** merge until preview review.

## Functional

- [ ] `/` loads (HTTP 200)
- [ ] Desktop: copy left, hero panorama right
- [ ] Mobile: stacked copy + vertical portrait; no horizontal scroll (320 / 390 / 414 / 768 / 1440)
- [ ] Primary CTA Explore the Platform → `/platform`
- [ ] Secondary CTA Request Research Access → `/contact`
- [ ] Biology network domain selection updates context; links preserve `domain` / scenario
- [ ] No broken images (webp + jpeg fallbacks)
- [ ] Guest Sign In hidden unless auth product-ready; Account when signed in
- [ ] Existing research routes still load

## Honesty / safety

- [ ] No fabricated metrics, certs, study counts, MoU
- [ ] Illustrative / live_backend=false labels where demos appear
- [ ] No CDS/PHI claims; patient data barrier language intact
- [ ] SSc described as validation case, not product boundary

## Accessibility

- [ ] One `h1`
- [ ] Keyboard: domain toolbar, workflow steps, CTAs
- [ ] Visible `:focus-visible`
- [ ] `prefers-reduced-motion` respected
- [ ] Meaningful alt on hero / network images
- [ ] WCAG 2.2 AA target (contrast on ivory/burgundy)

## SEO / performance

- [ ] Canonical + title + description for `/`
- [ ] LCP image: priority-friendly `<picture>`; reasonable weight
- [ ] No fixture promotion on non-home public pages (existing e2e)

## Tests

```bash
cd site && npm test -- --run  # if unit suite covers new helpers
cd site && npx playwright test e2e/editorial-landing.spec.ts
```

Update e2e copy asserts when hero headline changes to “Explore the connections…”.

## Screenshots (PR5)

| Viewport | Path |
|----------|------|
| Desktop 1440 | attach to PR |
| Mobile 390 | attach to PR |

## Outstanding issues

_Track blockers here during PR2–PR5 (auth readiness, writesEnabled, missing domain destinations)._
