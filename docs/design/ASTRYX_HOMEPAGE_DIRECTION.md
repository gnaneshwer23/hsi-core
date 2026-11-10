# Astryx → HSI homepage direction

**Status:** Working notes for `design/homepage-astryx` (follow-up to PR #165).  
**Source:** [meta/astryx](https://github.com/meta/astryx) · CLI `@astryxdesign/cli@0.7.11` · MIT · docs [astryx.atmeta.com](https://astryx.atmeta.com)

## What Astryx is

Astryx is Meta’s open-source **design system** (Beta): 150+ accessible React 19 components, StyleX-authored styles consumed as prebuilt CSS, brand themes, page templates, and an agent-oriented CLI (`astryx search|template|theme|docs|build`).

It is **not** a generative image/comp tool. Useful outputs for HSI are methodology, templates, and token recipes — not dumping `@astryxdesign/core` into the public site.

## Runtime / license

| Item | Value |
|------|--------|
| License | MIT |
| App peer | React ≥ 19 (HSI `site` already on React 19.3) |
| Repo contrib Node | 22+ LTS (`.nvmrc` 24.22.1), pnpm 11 |
| Install (probe only) | `npm i -D @astryxdesign/cli` then `npx @astryxdesign/cli …` |
| Themes inspected | `stone`, `gothic`, `matcha` (skipped `butter` / `chocolate` / `y2k` — cream-terracotta / playful clichés) |

## How we used it (without adopting the stack)

1. Ran CLI outside the product tree (`/tmp/astryx-probe`) — docs, templates, theme list, `theme` packs via `npm pack`.
2. Took **page frame** from `side-gallery` (asymmetric copy | media) rather than centered-hero (two CTAs + lifestyle collage).
3. Mapped **gothic** motion knobs (slower entrance, continuous drift) and **stone** surface hierarchy onto existing `--hsi-*` tokens.
4. Kept **Host Grotesk** (e2e asserts `Host Grotesk Variable`) — did not import Astryx font recipes (Fustat / Manufacturing Consent / Fraunces).
5. Did **not** add `@astryxdesign/core` or theme packages to `site/package.json` (StyleX cascade layers + foreign chrome would replace HSI editorial CSS).

## Applied on the homepage

- Asymmetric hero frame (brand → display line → lead → supporting honesty → one CTA | instrument stage with `CellField`).
- Motion tokens: fast / medium / slow + entrance ease aligned to Astryx duration/ease docs; `prefers-reduced-motion` still zeros animation.
- Supporting type for honesty / journey meta (Astryx `supporting` role).
- List chapters keep one content line (Astryx layout-spacing): hairline dividers, no card nests.

## Blockers / limits

- `astryx build "<idea>"` and rich `template` / `component` search need `@astryxdesign/core` installed in the working directory. We refused product install; CLI alone still serves `docs`, `theme list`, and dense template source.
- No GPU/auth wall for the published npm packages; the limit is **product fit**, not access.
- Templates lean consumer marketing (chips, dual CTAs, photo grids). HSI honesty rules override those defaults (one hero CTA, soft validation language, `live_backend=false` journey labels, no Sign-in chrome until authenticated).

## Commands to re-probe

```bash
npm i -D @astryxdesign/cli@latest
npx @astryxdesign/cli docs tokens
npx @astryxdesign/cli template side-gallery --dense
npx @astryxdesign/cli theme list
npx @astryxdesign/cli docs layout/layout-spacing --dense
```
