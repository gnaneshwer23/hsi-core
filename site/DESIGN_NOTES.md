# Design notes — structure + style tokens

Read-only reference: local Unkapped.ai saveweb2zip dump
(`/Users/gnaneshwerjadav/Downloads/saveweb2zip-com-unkapped-ai/`).

**Do not vendor.** No Unkapped CSS, JS, HTML, logos, photos, font files, workflow
WebPs, cert badges, or minified Webflow/vendor bundles ship in hsi-core. This
file records *information architecture* and *recreated style tokens* so HSI can
ship an equivalent look & feel with original content.

## Dump layout (index.html / index_1.html)

Same page shell (~18 landmarks):

| Landmark | Role (structural) |
| --- | --- |
| Sticky `nav_bar` | Logo · mega-menu groups · primary CTA |
| `hero2_section` | Full-viewport hero, split headline, 3–4 light cards into deep links |
| `logos_section` | Horizontal trust/logo marquee |
| `section_terrain` | Stage / altitude strip (company size → offer altitude) |
| `why` | Problem statement · split headline · supporting copy |
| `help` | Numbered process (audit → build → run → optimise) with tags |
| `platforms` | Tool/platform marquee |
| `deployed` | Capability grid (“four systems”) |
| `workflows` | Large diagram/map cards (click/hover to emphasize) |
| `stack` / `departments` / `agents-flow` | Layered product visuals / flow strip |
| `depth` | Domain tabs + detail panel |
| `partners` / `certs` / `team` | Social proof |
| `faq` | Accordion “in plain terms” |
| Footer | Multi-column links + CTA band |

## Image / asset roles in the dump (names only — not copied)

| Role | Examples in dump |
| --- | --- |
| Nav / footer marks | `v2-nav-logo.svg`, `footer-logo-*.svg`, `footer-wordmark.svg` |
| Atmosphere | `hero-image-bg.png`, `wf-dot-grid.svg`, `footer-cta-bg.webp`, mascot photos |
| Workflow diagrams | `workflow-*-engine.webp`, `workflow-*-pipeline.webp`, `workflow-technographic-tam.webp` |
| Platform monos | `v2-mono-*.svg`, partner/cert PNGs |
| Press logos | publication wordmarks |
| Team portraits | `v2-team-*.webp` |
| JS/CSS (forbidden) | Webflow shared `.min.css`, `webflow.*.js`, `three.min.js`, `jquery`, radar |

HSI replacements: **original inline SVG** (network graph, evidence pipeline, dual
consumer, Gate C gates) drawn in brand tokens — never raster dumps.

## Recreated style tokens (from dump CSS — not pasted)

| Token | Value | Role |
| --- | --- | --- |
| Cobalt | `#3965fa` | Primary accent / active chips |
| Navy | `#131930` / `#141c37` / `#0b0f24` | Ink surfaces, CTA |
| Soft blue | `#8fa8ff` / `#cfdaff` | Labels, glass chip text |
| Cream | `#f0ece9` / `#f7f3f0` | Light section bands |
| Pale | `#eceef3` | Alternate light band |
| Glass blur | `blur(14–22px) saturate(140–150%)` | Nav, chips, stage panel |
| Radii | `12px` controls · `999px` pills · `18px` cards | Buttons / chips / panels |
| Type | Host Grotesk + JetBrains Mono (Google Fonts) | Bold grotesk + mono energy |
| Hero wash | `#07208a → #1646c4 → #2f6fe0 → #8fb6f2 → cream` | Full-bleed atmosphere |
| Letter-spacing | `0.08–0.14em` uppercase mono labels | Section tags / chips |

## Patterns to emulate (not clone)

1. **Floating glass nav** + one primary navy CTA; secondary IA in links.
2. **Hero as one composition**: brand-forward wordmark, one display line, short
   lede, CTA pair, glass deep-link chips — blue gradient atmosphere + light
   pattern overlay, not inset cards.
3. **Section cadence**: navy ↔ cream ↔ cobalt-gradient bands; numbered mono
   section tags; split headline (display left / lede right).
4. **Altitude / phase strip**: tab or stage chips driving one glass detail panel.
5. **Process as four steps**: short title, one sentence, tag chips.
6. **Diagram section**: large illustration plane + caption strip — original SVG.
7. **FAQ accordion** closing the page before a dense footer.
8. **Motion budget**: subtle rise / hover lift; respect `prefers-reduced-motion`.

## HSI brand lock (content stays ours)

- Voice: evidence honesty, Gate C human, ISI ≠ CDS, edit only `hsi-core`.
- Name / messaging / routes / diagrams remain HSI — only visual energy matches
  the cobalt/glass category above.

## Mapping dump cadence → HSI pages

| Dump beat | HSI home / IA |
| --- | --- |
| Hero + chips | Home hero + pillar pills |
| Terrain | “The climb” P0–P3 tabs |
| Why | Grades without collapsing axes |
| Help / four steps | Evidence pipeline SVG + four publish steps |
| Workflows / agents-flow | Original network + dual-consumer diagrams |
| Depth tabs | Consumer / grade depth on Systems & Evidence |
| FAQ | “What HSI is — and is not” |
| Footer | Existing multi-column footer |

Last reviewed against dump structure + CSS tokens; no binary assets imported.
