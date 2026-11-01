# Design notes — structure cues only

Read-only reference: local Unkapped.ai saveweb2zip dump
(`/Users/gnaneshwerjadav/Downloads/saveweb2zip-com-unkapped-ai/`).

**Do not vendor.** No Unkapped CSS, JS, HTML, logos, photos, font files, workflow
WebPs, cert badges, or minified Webflow/vendor bundles ship in hsi-core. This
file records *information architecture and cadence* so HSI can build original
forest-ink + phosphor layouts.

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

## Patterns to emulate (not clone)

1. **Sticky compact nav** + one primary CTA; secondary IA in links (HSI: Systems /
   Evidence / ISI / Aksh / Roadmap / Alignment).
2. **Hero as one composition**: brand-forward wordmark, one display line, short
   lede, CTA pair, optional 3–4 deep-link chips — ambient grid/glow, not inset cards.
3. **Section cadence**: ink ↔ bone ↔ teal bands; numbered section tags; split
   headline (display left / lede right).
4. **Altitude / phase strip**: tab or stage chips driving one detail panel
   (HSI roadmap P0–P3).
5. **Process as four steps**: short title, one sentence, tag chips — no agency
   jargon; HSI maps to schema → seeds → Gate C → publish.
6. **Diagram section**: large illustration plane + caption strip (“sample /
   schematic”) — original SVG flows, not competitor workflow WebPs.
7. **Domain depth tabs**: switch panels without route change (grades, consumers).
8. **FAQ accordion** closing the page before a dense footer.
9. **Motion budget**: subtle rise / tab swap; respect `prefers-reduced-motion`.

## HSI brand lock

- Palette: forest ink `#041210`, teal mid `#1a6b5c`, phosphor `#8dffb8`, bone, amber.
- Type already on site: Bricolage Grotesque + Newsreader + IBM Plex Mono (Google
  Fonts links in our `index.html` — not Host Grotesk / Stack Sans from the dump).
- Voice: evidence honesty, Gate C human, ISI ≠ CDS, edit only `hsi-core`.

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

Last reviewed against dump structure only; no binary assets imported.
