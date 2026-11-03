# QA — public site simplification (2026-11-03)

## Commands run

| Check | Result |
|-------|--------|
| `bun test ./test` (hsi-core) | **186 pass / 0 fail** |
| `bun test ./test/publicSiteHonesty.test.ts` | **3 pass** |
| `bun run build` (core `tsc`) | **pass** |
| `cd site && npx tsc --noEmit` | **pass** |
| `cd site && bun run build` (vite) | **pass** |
| `cd site && bun run test:e2e` | **3 passed** (research compare, source registry reject, 404 recovery) |

## A11y / nav smoke (manual + screenshots)

- Primary nav labels: Platform, Products, Science, How It Works (+ brand Home).  
- Mobile drawer includes Home + primary + engineering secondary.  
- Status / Roadmap / Docs only in footer Progress column.  
- Screenshots: `site/docs/screenshots/*-{desktop,mobile}.png` for `/`, `/platform`, `/products`, `/science`, `/how-it-works`.

## Remaining limitations

- Discovery Centre uses **versioned JSON artifacts**, not a live retrieval API.  
- Clinical timeline / Trials criteria / Gateway remain **static fixtures** (honesty-labelled).  
- Science atlas is **educational static UI**, not live KG query.  
- E2E requires local `bun install` in `site/` + Playwright chromium; CI may differ.  
- No Gate C auto-approve; no PHI in research substrate; no invented MoU.

## Backend preservation

Confirmed present after site-only refactor: grades, Gate C, ISI consume, Aksh HITL/gateway, Neon map, CDS/PHI boundary docs, export CLIs, `test/` suite green.
