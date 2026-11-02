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

| Token | Value | Role |
| --- | --- | --- |
| Cobalt | `#3965fa` | Primary accent / frames / active chips |
| Navy | `#131930` / `#141c37` / `#0b0f24` | Ink surfaces, CTA |
| Soft blue | `#8fa8ff` / `#cfdaff` | Labels, glass chip text |
| Cream | `#f0ece9` / `#f7f3f0` | Light section bands |
| Live green | `#2fcb86` | Status pills |
| Glass blur | `blur(14–22px) saturate(140–150%)` | Nav, chips, stage panel |
| Radii | `12px` controls · `999px` pills · `18–22px` cards | Buttons / chips / panels |
| Type | Host Grotesk + JetBrains Mono (Google Fonts) | Bold grotesk + mono energy |
| Hero wash | `#07208a → #1646c4 → #2f6fe0 → #8fb6f2 → cream` | Full-bleed atmosphere |
| Arrow motif | 12px repeating SVG ↗ | Hero + dark band texture |

## HSI brand lock

- Voice: evidence honesty, Gate C human, ISI ≠ CDS, edit only `hsi-core`.
- Name / messaging / routes / diagrams remain HSI — only visual energy matches
  the cobalt/glass category above.
- Mock dashboards use **illustrative** demo data, labeled as such.

## Founder landing HTML (2026-11-02)

Earlier same-day Downloads exports were **complementary HSI marketing sections**
(platform / ecosystem / explore / discovery-engine). A later re-export reshuffled
filenames — always re-read the file, do not trust download numbers alone:

| File (as of later re-export) | Actual content | Site surface |
| --- | --- | --- |
| `index.html` | HSI Clinical — clinician context workspace | Pending fidelity pass (not yet this note’s target) |
| `index (1).html` | Aksh Health — personal health intelligence | `/for-aksh` via `AkshHealthLanding` |
| `index (2).html` | HSI Trials — clinical research intelligence | `/for-trials` via `TrialsLanding` (MVP remains `/trials-criteria`) |
| `HSI_Science_FIXED.html` | HSI Science — educational biology atlas | `/science` via `ScienceLanding` |

Earlier same-day mapping (still live in site until replaced):

| Earlier file | Section | Role |
| --- | --- | --- |
| `index.html` (first batch) | 01 / Connected by design | `/` + `/platform` via `PlatformEngine` |
| `index (3).html` | 02 / Ecosystem | `/` + `/products` + `/platform` |
| `index (2).html` (first batch) | 03 / Explore evidence | `/` + `/explore` — **do not confuse** with later `index (2).html` = Trials → `/for-trials` |
| `index (1).html` (first batch) | 04 / Discovery engine | `/` + `/discovery-engine` via `DiscoveryWorkbench` |

Lime/forest palette **adapted to HSI cobalt/navy/cream** (`global.css`). No MoU /
Gate C auto-approve invented. Live CTAs stay honesty-bound via `productMaturity.ts`.
Shell/nav remain product chrome (HTML header not vendored). Aksh demo is fictional
preview only — no live EHR/device connection. Trials landing explorer is fictional
criteria-completeness only (`syntheticOnly`; never eligibility / live registry).

### Science (`/science` · `ScienceLanding`)

IA from `HSI_Science_FIXED.html`: hero → interactive atlas (immune / metabolism /
microbiome) → mechanism sequence → three foundations → research CTA. Intentional
deltas vs HTML: Shell Nav/Footer (HTML chrome dropped); lime/forest → cobalt/accent
active states; closing CTAs deep-link `/explore` + `/discovery` (research honesty);
atlas labeled educational/illustrative — not a live KG or CDS.

## Phase 6–7 Discovery Centre (`/discovery`)

- Original product UI — **do not** vendor ChatGPT/Unkapped `index(5).html` markup.
- IA labels OK: ASK → MAP → REVIEW → VALIDATE; Established / Uncertain / Unexplored; supported / gap / refuted / untested; NOW / NEXT / GATED.
- Data: `fetch('/discovery/*.json')` from committed copies refreshed by `bun run outputs` (includes `hsi-r2-validation.json`).
- Hard banners: not diagnostic; research intelligence only; Phase 8 Akeno = explicit ask + Stage 3 gates.

Last reviewed against dump structure + screenshot cadence; no binary assets imported.
