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

## Phase 6 Discovery Centre (`/discovery`)

- Original product UI — **do not** vendor ChatGPT/Unkapped `index(5).html` markup.
- IA labels OK: ASK → MAP → REVIEW; Established / Uncertain / Unexplored; NOW / NEXT / LATER.
- Data: `fetch('/discovery/*.json')` from committed copies refreshed by `bun run outputs`.
- Hard banners: not diagnostic; research intelligence only; Akeno = later.

Last reviewed against dump structure + screenshot cadence; no binary assets imported.
