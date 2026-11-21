# Visual review — PR1 illustrative product shots (21 Nov 2026)

## Before (audit baseline, local preview on `main`-equivalent build)

| Viewport | Artifact |
|---|---|
| Hero 1440 | `/opt/cursor/artifacts/landing-audit-hero-1440.png` |
| Hero 390 | `/opt/cursor/artifacts/landing-audit-hero-390.png` |
| Product shots 1440 | `/opt/cursor/artifacts/landing-audit-product-shots-1440.png` |
| Product shots 390 | `/opt/cursor/artifacts/landing-audit-product-shots-390.png` |
| Demo band 1440 | `/opt/cursor/artifacts/landing-audit-demo-1440.png` |

**Critique:** Hero and demo honesty are clear. Product screenshot captions read as live chrome without “illustrative”.

## After (this PR)

| Viewport | Artifact |
|---|---|
| Product shots 1440 | `/opt/cursor/artifacts/landing-pr1-product-shots-1440.png` |
| Product shots 390 | `/opt/cursor/artifacts/landing-pr1-product-shots-390.png` |

**Expected / observed:** Same layout, type and chrome; captions and microcopy now include “illustrative”; no new cards, accents or redesign.

## Fresh test commands (actual)

```sh
cd site && bun run build   # pass — 21 Nov 2026
bunx playwright test e2e/landing-pages.spec.ts e2e/seo.spec.ts e2e/demo-universe-landing.spec.ts
# 10 passed
```

## Owner decision (required)

- [ ] **Visual GO** — captions acceptable; merge allowed when CI green  
- [ ] **NO-GO** — request copy/layout changes (comment on PR)  
- [ ] **Deploy** — separate owner GO; agents must not deploy  

Do not merge or deploy without the owner box above.
