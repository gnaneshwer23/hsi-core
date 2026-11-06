## Search and sharing foundations — 2026-11-06

See [SEO implementation and deployment checks](../docs/HSI_SEO_IMPLEMENTATION.md). Public landing pages are now rendered into crawlable HTML from the same React components, with shared canonical/title/description/OG/schema metadata, an allowlisted sitemap and original HSI sharing artwork. Tool/account/demo pages remain noindex. Heavy research routes load separately so public navigation does not download every tool upfront. This does not change scientific status, account permissions or claim that indexing/rankings have already improved.

---

## Header, footer and controls — 2026-11-06

`src/styles/site-chrome.css` is the final shared presentation layer, after `experience.css`. The header now has consistent sign-in/access actions, a desktop More disclosure for secondary pages, a compact labelled mobile brand and a proper SVG menu/close icon. Escape, outside click, route changes and breakpoint changes close menus appropriately. The mobile account link follows the provider-session display state without granting backend permissions.

The footer uses independent responsive containers, readable Explore / Products / Information groups, a real product-index link and a single set of Roadmap / Status / Docs links. No missing policy pages or new services are invented. Primary, secondary and disabled controls share dimensions and contrast; explicit secondary selectors avoid the legacy CSS specificity collision. Graph controls and footer links retain at least 44px touch height.

Verification: 772 core tests and the full 112-test browser suite passed. A focused five-test chrome suite passed after final secondary-action/account-link polish. It checks seven viewport widths, header overlap, menu keyboard/outside behaviour, footer links and touch targets, and action contrast. Desktop footer and mobile menu were visually inspected. Site TypeScript and production build passed; the existing bundle-size warning remains.

---

## Product experience blueprint — 2026-11-05

The current presentation is `src/styles/experience.css`, imported after the historical layers below. It uses the founder’s ivory/teal/coral palette, local interactive SVGs, restrained domain colours, clear sections and consistent public/account/workspace chrome. Large sans headings use a limited serif accent. The homepage is an outcome-led split layout; the older procedural landscape and stock-image sections are no longer used there.

Primary navigation: Platform, Solutions, Research, Evidence & safety, Community. Request access leads to the actual account/access path and an explicitly local pilot-preparation form. The footer/mobile drawer carries secondary product and explanatory pages. The header is sticky and responsive; keyboard skip navigation starts normally on initial load, while client route changes focus the main landmark.

See [implementation and QA handoff](../docs/HSI_PRODUCT_EXPERIENCE_IMPLEMENTATION.md) for page coverage, interactive behavior, source/fixture verification, connected backend tools and remaining gates. Community is a local rehearsal and contact preparation does not submit a lead. No live clinical functionality or scientific readiness is implied.

Earlier entries below document past decisions and are superseded where they conflict with this increment.

---

## Public-site art direction refresh — 2026-11-03

The founder rejected the repeated serif/card presentation and requested
Unkapped.ai as a design reference. Direct access to that domain returned a proxy
policy denial in this session. This refresh uses the pre-existing reference
cadence documented below, not a claimed inspection of the current live site.

- Retain the founder-selected ivory `#F3EEE8`, teal `#17645F` and coral `#FF6845`.
- Replace serif marketing headlines with large, tightly spaced Host Grotesk.
- Give the homepage a centred introduction and an original procedural knowledge
  landscape. The geometry is decorative and does not represent study data.
- Alternate open light sections with dark, inspectable workflow canvases.
- Present product details as illustrated rows, rather than another card deck.
- Use a quieter masthead and square-edged controls to reduce visual clutter.
- Keep existing product statuses, research boundaries and interactive content.

`src/styles/marketing-v2.css` is the final scoped presentation layer, imported
last in `main.tsx`. It applies only through `.public-site-v2` on routes listed in
`PUBLIC_MARKETING_PATHS` (`primaryNav.ts`): Home, Platform, Technology, Products,
Science, How It Works, plus product landings `/for-isi`, `/for-aksh`, `/for-trials`
and research entry `/discovery`. Cream masthead + forest CTA on those paths;
Status, Roadmap, Docs, demos and engineering surfaces keep the glass theme.
Technology is a thin operating-model overview; Platform holds architecture depth.
`KnowledgeLandscape.tsx` contains original HSI geometry; no Unkapped code,
fonts, screenshots, logos or proprietary artwork is copied.

Verification covers production build, site TypeScript, public-site honesty tests,
all five routes at 320/390/768/1024/1440/1920px, mobile navigation, keyboard
interaction, reduced motion and the existing interactive selectors. The existing
application bundle-size warning remains a separate performance concern.

---

## Homepage redesign — 2026-11-03

The public homepage now uses `pages/Home.tsx` and scoped `styles/home.css`.
It replaces the homepage instances of PlatformEngine, EcosystemGrid and
DiscoveryWorkbench; those components remain available on their specialist routes.

- Narrative: health question → biological context → traceable evidence → human review.
- Aksh Health, ISI and HSI are explained as distinct experiences and a shared
  technology foundation, with separate product databases and access controls.
- Original SVG/CSS illustrations require no remote image service or stock licence.
- The four-area context selector is an explanatory interaction. It does not query
  the knowledge graph, analyse patients or represent validated research findings.
- Homepage CTAs lead to public explanatory pages. Engineering destinations were
  removed from the shared mobile menu. This is navigation cleanup, not an
  authentication change to existing routes.
- Responsive grid, keyboard-operated tabs, visible focus states, skip link,
  Escape-to-close menu and SVG arrow icons support desktop and mobile use.
- Homepage metadata and footer colour were aligned with the new presentation.

Verification: production Vite build, site TypeScript check, and Chromium smoke
checks at 320/390/768/1440px. Checked tabs, keyboard navigation, anchor scrolling,
mobile menu, all six homepage route destinations and absence of browser errors.
The build continues to report the existing large application bundle warning.
Live deployment confirmation is a separate check after the GitHub push.

---

# Design notes — structure + style tokens

Read-only reference: local Unkapped.ai saveweb2zip dump
(`/Users/gnaneshwerjadav/Downloads/saveweb2zip-com-unkapped-ai/`) plus 15
screenshot references used for cadence (hero → climb → light grid → steps →
dark band → workflows → stacked pipeline → co-worker cards → agent flows).

**Do not vendor.** No Unkapped CSS, JS, HTML, logos, photos, font files, workflow
WebPs, cert badges, or minified Webflow/vendor bundles ship in hsi-core. This
file records *information architecture* and *recreated style tokens* so HSI can
ship an equivalent look & feel with original content.

## Screenshot cadence → HSI Home

| Beat | HSI implementation |
| --- | --- |
| Cobalt→light hero + arrow pattern + glass deep-links | `.hero` / `.hero-grid` / `.hero-deep-card` |
| Wireframe mountain climb | `TerrainClimb` SVG · P0–P3 waypoints |
| Light grid + isometric process | `.section-grid-light` + `IsometricProcess` |
| STEP 0N + blue-framed mocks | `.step-block` + `Mocks.tsx` (Gate C, grades, HITL, claim→marker) |
| Dark band · four system cards | `.section-dark-band` + `MiniSystemDiagram` |
| Dark workflow carousel | `.flow-carousel` · Agent / Triggers / DualConsumer |
| Stacked pipeline on grid | `.stack-rail` · outcomes → act → build → foundations |
| Co-worker dashboard cards | `IsiCoworkerMock` / `AkshCoworkerMock` (illustrative) |
| Agent / triggers glow diagrams | `AgentWorkflowDiagram` / `TriggersFlowDiagram` |

## Recreated style tokens

### Founder palette (2026-11-03) — current (simplification brief)

| Token | Value | Role |
| --- | --- | --- |
| Warm Ivory | `#F3EEE8` (`--ivory` / `--cream` / `--bone`) | Page / light section backgrounds |
| Botanical green | `#2F5D45` (`--botanical` / `--teal` / `--navy` / `--cobalt`) | Headings, chrome, structural accents |
| Lime | `#C4E05A` (`--lime` / `--coral` / `--action`) | Primary CTAs (midnight text on lime) |
| Midnight navy | `#0B1628` (`--midnight` / `--ink` / `--teal-ink`) | Dark surfaces, body chrome |
| Soft botanical | `#7A9E88` (`--accent` / `--phosphor`) | Labels / glass chip text on dark |
| Live green | `#2fcb86` (`--live`) | Honesty / availability status pills (**unchanged**) |
| Amber | `#e4a65a` | Uncertain / warning status (**unchanged**) |
| Glass blur | `blur(14–22px) saturate(140–150%)` | Nav, chips, stage panel |
| Radii | `12px` controls · `999px` pills · `18–22px` cards | Buttons / chips / panels |
| Type | Host Grotesk + JetBrains Mono (Google Fonts) | Bold grotesk + mono energy |
| Hero wash | `#0B1628 → #2F5D45 → #5A8F6E → #C4E05A → #F3EEE8` | Full-bleed atmosphere |
| Arrow motif | 12px repeating SVG ↗ | Hero + dark band texture |

Legacy CSS names (`--cobalt`, `--navy`, `--cream`, `--teal`, `--coral`) remap to this
quartet so landings inherit without page-local hacks.

### Mapping from prior teal / coral (2026-11-02)

| Prior | Value | Now |
| --- | --- | --- |
| Deep Teal | `#17645F` | → Botanical `#2F5D45` |
| Coral Orange | `#FF6845` | → Lime `#C4E05A` (CTA; text becomes midnight) |
| Teal ink | `#0A2E2B` | → Midnight navy `#0B1628` |
| Soft teal | `#7AB5AF` | → Soft botanical `#7A9E88` |
| Ivory | `#F3EEE8` | Unchanged |

### Prior cobalt set (superseded earlier)

| Old token | Old value | Via teal/coral | Now |
| --- | --- | --- | --- |
| Cobalt | `#3965fa` | Teal / Coral | Botanical / Lime |
| Navy / ink | `#131930` / `#0b0f24` | Teal ink | Midnight `#0B1628` |
| Soft blue | `#8fa8ff` | Soft teal | Soft botanical `#7A9E88` |
| Cream | `#f0ece9` | Ivory | Ivory `#F3EEE8` |

### PlatformEngine fabric (intentional choice)

Dark **midnight** stage (`#0B1628` + soft botanical wires/particles). Mid botanical
alone washed out the fabric grid/particles; midnight keeps contrast for light strokes.

## HSI brand lock

- Voice: evidence honesty, Gate C human, ISI ≠ CDS, Science = educational (not clinical product), edit only `hsi-core`.
- Name / messaging / routes / diagrams remain HSI — visual system is
  ivory / botanical / lime / midnight-navy (founder simplification brief).
- Mock dashboards use **illustrative** demo data, labeled as such.
- Honesty / maturity status chips keep semantic greens / ambers / reds — not
  forced into the marketing quartet.

## Founder landing HTML (2026-11-02)

Earlier same-day Downloads exports were **complementary HSI marketing sections**
(platform / ecosystem / explore / discovery-engine). A later re-export reshuffled
filenames — always re-read the file, do not trust download numbers alone:

| File (as of later re-export) | Actual content | Site surface |
| --- | --- | --- |
| `index.html` | HSI Clinical — clinician context workspace | Pending fidelity pass (not yet this note’s target) |
| `index (1).html` | Aksh Health — personal health intelligence | `/for-aksh` via `AkshHealthLanding` |
| `index (2).html` | HSI Trials — clinical research intelligence | `/for-trials` via `TrialsLanding` (MVP remains `/trials-criteria`) |
| `HSI_Science_FIXED.html` | HSI Science — educational biology atlas | **Reintroduced** in public IA (2026-11-03) as educational experience — `/science` via `ScienceLanding` |

Earlier same-day mapping (still live in site until replaced):

| Earlier file | Section | Role |
| --- | --- | --- |
| `index.html` (first batch) | 01 / Connected by design | `/` + `/platform` via `PlatformEngine` |
| `index (3).html` | 02 / Ecosystem | `/` + `/products` + `/platform` |
| `index (2).html` (first batch) | 03 / Explore evidence | `/` + `/explore` — **do not confuse** with later `index (2).html` = Trials → `/for-trials` |
| `index (1).html` (first batch) | 04 / Discovery engine | `/` + `/discovery-engine` via `DiscoveryWorkbench` |

Founder HTML lime/forest → cobalt/navy/cream → ivory/teal/coral → now
**ivory / botanical / lime / midnight-navy** via `:root` in `global.css`. No MoU /
Gate C auto-approve invented. Live CTAs stay honesty-bound via `productMaturity.ts`.
Shell/nav remain product chrome (HTML header not vendored). Aksh demo is fictional
preview only — no live EHR/device connection. Trials landing explorer is fictional
criteria-completeness only (`syntheticOnly`; never eligibility / live registry).

### Science (educational — public IA)

Founder simplification brief 2026-11-03: **Science returns to primary nav** as an
educational experience, explicitly **not** a clinical product. Research/ISI entry
stays via Products + contextual CTAs. `/explore` remains a PRODUCT demo route
(demoted from header).

## Phase 6–7 Discovery Centre (`/discovery`)

- Original product UI — **do not** vendor ChatGPT/Unkapped `index(5).html` markup.
- IA labels OK: ASK → MAP → REVIEW → VALIDATE; Established / Uncertain / Unexplored; supported / gap / refuted / untested; NOW / NEXT / GATED.
- Data: `fetch('/discovery/*.json')` from committed copies refreshed by `bun run outputs` (includes `hsi-r2-validation.json`).
- Hard banners: not diagnostic; research intelligence only; Phase 8 Akeno = explicit ask + Stage 3 gates.

Last reviewed against dump structure + screenshot cadence; no binary assets imported.
