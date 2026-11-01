# hsi-core

Shared **Human Systems Intelligence** substrate for **Aksh Health** (clinic HITL CDS) and **Immune Super Intelligence / ISI** (discovery).

Evidence-graded edges (`established` / `uncertain` / `unexplored`) plus claim → marker (LOINC) → observation → action stubs. No PHI. No auto diagnosis. No EHR write-back.

**Vision alignment:** full portfolio map (Aksh / ISI consumers, bio-stack P3 plugins; DeliverX ignored) lives in [`docs/VISION_REPO_ALIGNMENT.md`](docs/VISION_REPO_ALIGNMENT.md). **P0 DONE / P1 ACTIVE — pilot-first** (one research workflow before more platform).

## Pilot

Immediate next move: prove ISI helps one immune-disease **research intelligence** workflow — not another broad AI feature.

| Doc | Purpose |
|-----|---------|
| [`docs/ISI_PILOT_BRIEF.md`](docs/ISI_PILOT_BRIEF.md) | One-page pilot brief (purpose, non-goals, scope, outputs, metrics, decision gate) |
| [`docs/ISI_PILOT_PRD_ALIGNMENT.md`](docs/ISI_PILOT_PRD_ALIGNMENT.md) | External pilot PRD v1.0 → build now vs defer + artifact coverage |
| [`docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md`](docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md) | Full target-state vision → Stage 1 / 2 / 3 / out of scope (do not pull breadth into Stage 1) |
| [`docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md) | Discovery Centre concept site (HTML export) → Stage 1 posture; reference-only, not the pilot deliverable |
| [`docs/ISI_PILOT_PARTNER_SHORTLIST.md`](docs/ISI_PILOT_PARTNER_SHORTLIST.md) | Outreach shortlist — partner types + UK/EU/US institution categories (candidates only) |
| [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md) | **HSI Neon = `red-wave` only**; ISI `autumn-snow` / Akeno / DeliverX never for HSI substrate — IDs + host prefixes, no secrets |

Disease + question lock **after** partner conversations. `bun run outputs` artifacts from this repo feed the pilot evidence layer. Target-state breadth (lab adapters, cohorts, Akeno clinical) stays deferred.

## Why this name

Short, GitHub-safe, matches the roadmap “HSI core” lane — see `NAME.md`.

## Install / clone

```bash
git clone git@github.com:gnaneshwer23/hsi-core.git
cd hsi-core
bun install
bun test
bun run outputs    # alias: bun run publish — versioned dist/outputs/ bundle
bun run build      # TypeScript library under dist/
```

Requires [Bun](https://bun.sh) (tests + CLI). **`bun run outputs`** (alias `publish`) writes a versioned consumer bundle to regenerable `dist/outputs/` (gitignored) and refreshes legacy `exports/*.json`. Small committed samples: [`examples/sample-outputs/`](examples/sample-outputs/). Consumer guide: [`docs/OUTPUTS.md`](docs/OUTPUTS.md).

Individual CLIs still available: `validate`, `export:isi`, `export:isi-map`, `export:aksh-map`, `gap-report`.

## Vision site

Marketing / IA site for HSI concepts (Vite + React) lives in [`site/`](site/).

```bash
bun run site:dev      # http://localhost:5173
bun run site:build    # site/dist
```

Pages: Home, Systems, Evidence & Gate C, For ISI, For Aksh, Roadmap, Repo alignment, Docs.

## Consume

```ts
import {
  HSI_T2D_IMMUNO_SEED_EDGES,
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_SAFETY_RELEASE_CRITERIA_V0,
  isCdsSurfacable,
  validateHsiEdge,
  linkClaimToMarker,
  buildIsiExportBundle,
  listIsiRelSuggestions,
  claimsWithIsiMappings,
  listAkshNodeSuggestions,
  claimsWithAkshMappings,
} from "hsi-core";
```

| Product | Rules |
|---------|--------|
| **ISI** | Discovery / Ask / Radar only; honest grades; `buildIsiExportBundle()` / `bun run export:isi` |
| **Aksh** | HITL suggestion cards only when `isCdsSurfacable(edge)`; `akshNodeId` is a map pointer only — never auto-apply to EHR |

### Aksh consumption (`akshNodeId`)

- `claimsWithAkshMappings()` fills durable `aksh:<kind>:<slug>` clinic ids (LOINC-linked findings where known).
- Having an `akshNodeId` does **not** open CDS. Use `isCdsSurfacable(edge)` (`approved` + `established`) before any HITL CDS card.
- P1 read-only stub: `loadAkshHitlMapFromExport()` / `listAkshHitlCards()` / `buildAkshHitlCard()` — claim, grade, LOINC, `akshNodeId`, required clinician action; `cdsSurfacable` stays false on seeds.
- `bun run export:aksh-map` writes `exports/hsi-aksh-node-map.json` (`hsi-aksh-node-map-2`) with migration table from provisional `AKSH-N-*`.
- See `docs/AKSH_HITL_CONSUMPTION.md` for the id scheme and provisional → durable map.

## Axes (do not collapse)

| Axis | Values |
|------|--------|
| `curationReview` | draft → approved / rejected / … (ISI Gate C lifecycle) |
| `hsiGrade` | established / uncertain / unexplored |
| `teachingStatus` | established / associative / hypothesized / unknown |

`hsiGrade=established` **requires** `curationReview=approved`. Never promote from PMID alone.

## Phase 0 / P1 contents

- Evidence grades + edge/claim schema + translation card types
- T2D / immuno-metabolic / IO–autoimmunity seeds **plus** Phase 2 scope-locked RA/TNF pathway slice + illustrative SLE/PsO/IBD stubs (`scopeLocked=true`; `partnerSigned=false`)
- Claim → LOINC marker links (`linkClaimToMarker`, `seedClaimLoincMap`) including anti-CCP / ANA
- Discovery Centre metadata in exports (`ASK → MAP → REVIEW → TEST → LEARN` + disease contexts) — not interactive UI
- Provisional partner lock scaffold (`hsi-partner-lock.json`) + Stage 1 review rubric
- Validation helpers + `bun run validate` CLI
- ISI JSON export (`hsi-isi-export-1`)
- Schema gap report (`bun run gap-report`) — ISI/Aksh mapping slots + bridge shortlist
- ISI REL-* suggestion map (`bun run export:isi-map`) — curation pointers only; never auto-approve
- Aksh node-id map (`bun run export:aksh-map`) — HITL pointers; CDS stays closed on seeds
- **Publish bundle** (`bun run outputs`) — ISI export + REL map + Aksh map/HITL cards + gap report + Gate C checklist + pilot pack-2 + review rubric + Phase 5 acceptance/walkthrough + partner lock
- **HSI Neon (Phase 4)** — `db/migrations` + `bun run db:migrate` / `db:gate-c-local` (red-wave only; human-pending Gate C; never ISI Neon)
- Safety release criteria v0

Stage 1 done vs remaining: [`docs/OUTPUTS.md`](docs/OUTPUTS.md) checklist. Neon: [`docs/HSI_NEON_MIGRATIONS.md`](docs/HSI_NEON_MIGRATIONS.md).

## Active codebase (sole edit target)

**`hsi-core` is the sole active codebase for HSI work.** Edit only this repository (`~/Projects/hsi-core`, https://github.com/gnaneshwer23/hsi-core). All substrate, seeds, maps, exports, docs, and curator checklists land here. Product apps (Aksh / ISI) and bio tools consume published artifacts — they are never HSI edit targets.

| Repo / surface | Policy |
|----------------|--------|
| **gnaneshwer23/hsi-core** | **Edit here only** |
| **gnaneshwer23/immunecity** + ISI site | Out of scope for edits — consume via published export/API |
| **Aksh Health / aksh\*** | Out of scope for edits — consume Aksh map + HITL stub exports |
| **gnaneshwer23/hsi-sources** | Shelf only / archival — do not sync or treat as runtime core |
| **gnaneshwer23/swift-deliveries** (DeliverX) | **Ignore** — out of scope; not a HITL pattern ref; not a future wire-up |
| **AF3 / Boltz / ESM / OpenMM / RDKit / REINVENT4 / TDC** | P3 plugins at most — not P0/P1 |

Do not open PRs or push commits against immunecity or Aksh product repos for HSI. Ignore DeliverX / swift-deliveries entirely. Ship maps and curator markdown from this repo; consumers pull published artifacts. Detail: [`docs/VISION_REPO_ALIGNMENT.md`](docs/VISION_REPO_ALIGNMENT.md).

## Out of scope

Agent sprawl, AF3/Boltz, clinic write-back, live PHI, inventing PMIDs, treating ISI as CDS,
collapsing `teachingStatus` / `hsiGrade` / Gate C into one score,
treating `akshNodeId` as CDS eligibility,
editing immunecity for HSI work,
DeliverX / swift-deliveries (ignore — not an HSI spoke).
