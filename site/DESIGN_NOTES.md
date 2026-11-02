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

### Founder palette (2026-11-02) — current

| Token | Value | Role |
| --- | --- | --- |
| Warm Ivory | `#F3EEE8` (`--ivory` / `--cream` / `--bone`) | Page / light section backgrounds |
| Deep Teal | `#17645F` (`--teal` / `--navy` / `--cobalt`) | Headings, chrome, structural accents, active chips |
| Coral Orange | `#FF6845` (`--coral` / `--action`) | Primary CTAs (`.btn-primary`, `.btn-cobalt`, land next / go-deeper) |
| Teal ink | `#0A2E2B` (`--ink` / `--teal-ink`) | Dark surfaces, body chrome |
| Soft teal | `#7AB5AF` (`--accent` / `--phosphor`) | Labels / glass chip text on dark |
| Live green | `#2fcb86` (`--live`) | Honesty / availability status pills (**unchanged**) |
| Amber | `#e4a65a` | Uncertain / warning status (**unchanged**) |
| Glass blur | `blur(14–22px) saturate(140–150%)` | Nav, chips, stage panel |
| Radii | `12px` controls · `999px` pills · `18–22px` cards | Buttons / chips / panels |
| Type | Host Grotesk + JetBrains Mono (Google Fonts) | Bold grotesk + mono energy |
| Hero wash | `#0A2E2B → #17645F → #3A8A84 → #A8D0CC → #F3EEE8` | Full-bleed atmosphere |
| Arrow motif | 12px repeating SVG ↗ | Hero + dark band texture |

Legacy CSS names (`--cobalt`, `--navy`, `--cream`) are remapped to this trio so Home,
Platform, How-it-works, for-aksh, for-trials, Explore, Discovery-engine, and Products
landings inherit without page-local hacks. `--cobalt` = teal structure; coral is
`--coral` / `--action` on CTA classes.

### Prior cobalt set (superseded)

| Old token | Old value | Now |
| --- | --- | --- |
| Cobalt | `#3965fa` | → Deep Teal `#17645F` (structure) / Coral `#FF6845` (CTAs) |
| Navy / ink | `#131930` / `#141c37` / `#0b0f24` | → Teal ink `#0A2E2B` / Teal `#17645F` |
| Soft blue | `#8fa8ff` / `#cfdaff` | → Soft teal `#7AB5AF` / `#C5E0DC` |
| Cream | `#f0ece9` / `#f7f3f0` | → Warm Ivory `#F3EEE8` / `#F8F5F1` |
| Hero wash | cobalt blues → cream | → teal ink → teal → mist → ivory |

### PlatformEngine fabric (intentional choice)

Dark **teal-ink** stage (`#0A2E2B` + soft teal wires/particles), not mid `#17645F` and
not legacy navy. Mid teal washed out the fabric grid/particles; navy fought the new
brand. Deep teal ink keeps contrast for light strokes while staying in-family.

## HSI brand lock

- Voice: evidence honesty, Gate C human, ISI ≠ CDS, edit only `hsi-core`.
- Name / messaging / routes / diagrams remain HSI — visual system is now
  ivory / deep teal / coral (founder reference).
- Mock dashboards use **illustrative** demo data, labeled as such.
- Honesty / maturity status chips keep semantic greens / ambers / reds — not
  forced into the marketing trio.

## Founder landing HTML (2026-11-02)

Earlier same-day Downloads exports were **complementary HSI marketing sections**
(platform / ecosystem / explore / discovery-engine). A later re-export reshuffled
filenames — always re-read the file, do not trust download numbers alone:

| File (as of later re-export) | Actual content | Site surface |
| --- | --- | --- |
| `index.html` | HSI Clinical — clinician context workspace | Pending fidelity pass (not yet this note’s target) |
| `index (1).html` | Aksh Health — personal health intelligence | `/for-aksh` via `AkshHealthLanding` |
| `index (2).html` | HSI Trials — clinical research intelligence | `/for-trials` via `TrialsLanding` (MVP remains `/trials-criteria`) |
| `HSI_Science_FIXED.html` | HSI Science — educational biology atlas | **Out of portfolio** (founder 2026-11-02); `/science` redirects to `/explore`; `ScienceLanding` retained unlinked |

Earlier same-day mapping (still live in site until replaced):

| Earlier file | Section | Role |
| --- | --- | --- |
| `index.html` (first batch) | 01 / Connected by design | `/` + `/platform` via `PlatformEngine` |
| `index (3).html` | 02 / Ecosystem | `/` + `/products` + `/platform` |
| `index (2).html` (first batch) | 03 / Explore evidence | `/` + `/explore` — **do not confuse** with later `index (2).html` = Trials → `/for-trials` |
| `index (1).html` (first batch) | 04 / Discovery engine | `/` + `/discovery-engine` via `DiscoveryWorkbench` |

Founder HTML lime/forest, then cobalt/navy/cream, now **ivory/teal/coral** via
`:root` in `global.css`. No MoU / Gate C auto-approve invented. Live CTAs stay
honesty-bound via `productMaturity.ts`. Shell/nav remain product chrome (HTML
header not vendored). Aksh demo is fictional preview only — no live EHR/device
connection. Trials landing explorer is fictional criteria-completeness only
(`syntheticOnly`; never eligibility / live registry).

### Science (removed from product portfolio)

Founder decision 2026-11-02: **do not compete in standalone scientific education /
edtech.** `/science` redirects to `/explore`. `ScienceLanding` + CSS kept in-tree
until a deliberate purge; not linked from Nav/Footer.

## Phase 6–7 Discovery Centre (`/discovery`)

- Original product UI — **do not** vendor ChatGPT/Unkapped `index(5).html` markup.
- IA labels OK: ASK → MAP → REVIEW → VALIDATE; Established / Uncertain / Unexplored; supported / gap / refuted / untested; NOW / NEXT / GATED.
- Data: `fetch('/discovery/*.json')` from committed copies refreshed by `bun run outputs` (includes `hsi-r2-validation.json`).
- Hard banners: not diagnostic; research intelligence only; Phase 8 Akeno = explicit ask + Stage 3 gates.

Last reviewed against dump structure + screenshot cadence; no binary assets imported.
