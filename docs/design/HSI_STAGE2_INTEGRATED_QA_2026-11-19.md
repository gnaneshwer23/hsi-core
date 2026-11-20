# HSI Stage 2 — Integrated QA (PR6)

**Date:** 19 November 2026 (Europe/London)  
**Branch:** `cursor/stage2-integrated-qa-2f71`  
**Stack:** #554 → #556 → #558 → #559 → #560 → this PR  
**Status:** Automated lock + residual owner visual review (no deploy/merge without owner)

---

## 1. Scope

Integrated QA across Stage 2 public landings:

| Check | Method |
| --- | --- |
| Route / SEO / rewrite parity | Unit lock `test/stage2IntegratedQa.test.ts` |
| Audience nav ↔ footer ↔ indexed paths | Same unit lock |
| Honesty copy (no fake validation, prices, CDS) | Source scan + existing e2e |
| Accessibility | Maturity-chip contrast fix (PR3); hero secondary CTA contrast fix (this PR); Playwright axe suites |
| Responsive / SEO | Existing `landing-pages`, `approved-website`, `seo`, `production-qa` |
| Owner visual review | Checklist below — human only |

**Out of scope:** Deploy; merge; inventing benchmarks, prices, testimonials or MoUs.

---

## 2. Indexed public set (locked)

13 paths in `PUBLIC_MARKETING_PATHS` ≡ `SEO_PAGES`:

`/`, `/how-it-works`, `/knowledge-graph`, `/researchers`, `/enterprise`, `/biotech`, `/clinical`, `/laboratories`, `/research-community`, `/validation`, `/trust`, `/about`, `/contact`

Audience destinations (all indexed): Researchers, Research Groups, Biotech & Pharma, Clinical Research, Laboratories, Research Community.

Guards:

- `/community` remains redirect → `/research/home` (not marketing)
- `/pricing` remains redirect → `/contact`
- Demo shells stay under `/enterprise/*` (noindex except marketing `/enterprise`)

---

## 3. Findings addressed in programme

| Finding | Fix | PR |
| --- | --- | --- |
| Homepage `h1` accessible-name missing space after brand | Explicit `{" "}` after `.pg-brand` | #556 |
| Maturity chips teal/burgundy below WCAG AA | Darker chip colours + 12px/700 | #558 |
| Hero secondary CTAs inherited dark ink on navy | Scope light secondary styles to `.s2-hero` | this PR |
| `/enterprise` marketing lacked public chrome / SEO | Promote to marketing + static prerender | #558 |
| Clinical / Lab / Community only as demos | Dedicated indexed landings | #559 / #560 |

---

## 4. Owner visual review checklist

Preview the Stage 2 stack tip (or merged main after stack lands). Confirm:

1. **Homepage** — brand-led hero; three USPs; no portfolio marketing; status strip honest  
2. **Platform** — question→brief workflow; maturity labels readable  
3. **Each audience page** — one h1; primary CTA real; demo shells labelled Demonstration  
4. **Clinical** — “not CDS” / synthetic / no PHI visible without scrolling past first fold  
5. **Contact** — planned access shapes show no currency or seat prices  
6. **Mobile 390px** — audience menu, Get Access, no horizontal overflow  
7. **Keyboard** — Audiences menu Escape/focus; skip link to `#main-content`

Record pass/fail in the PR conversation. Do not merge or deploy until owner signs the visual review.

---

## 5. Residual risks

- Parent stack CI (`verify` on #558–#560) may still be running; rebase this branch if parents move  
- Sourcery review budget exhausted — human review required  
- Playwright axe coverage depends on CI fonts; unit tests do not replace browser contrast measurement for every node  
