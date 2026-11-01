# hsi-core

Shared **Human Systems Intelligence** substrate for **Aksh Health** (clinic HITL CDS) and **Immune Super Intelligence / ISI** (discovery).

Evidence-graded edges (`established` / `uncertain` / `unexplored`) plus claim → marker (LOINC) → observation → action stubs. No PHI. No auto diagnosis. No EHR write-back.

**Vision alignment:** full portfolio map (Aksh / ISI consumers, bio-stack P3 plugins, DeliverX reference-only) lives in [`docs/VISION_REPO_ALIGNMENT.md`](docs/VISION_REPO_ALIGNMENT.md). **P0 DONE / P1 ACTIVE.**

## Why this name

Short, GitHub-safe, matches the roadmap “HSI core” lane — see `NAME.md`.

## Install / clone

```bash
git clone git@github.com:gnaneshwer23/hsi-core.git
cd hsi-core
bun install
bun test
bun run validate
bun run export:isi
bun run export:isi-map
bun run export:aksh-map
bun run gap-report
```

Requires [Bun](https://bun.sh) (tests + CLI). `bun run build` emits `dist/` for TypeScript consumers.

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

## Phase 0 contents

- Evidence grades + edge/claim schema + translation card types
- ~25 T2D / immuno-metabolic / IO–autoimmunity placeholder seed edges
- Claim → LOINC marker links (`linkClaimToMarker`, `seedClaimLoincMap`)
- Validation helpers + `bun run validate` CLI
- ISI JSON export (`hsi-isi-export-1`)
- Schema gap report (`bun run gap-report`) — ISI/Aksh mapping slots + bridge shortlist
- ISI REL-* suggestion map (`bun run export:isi-map`) — curation pointers only; never auto-approve
- Aksh node-id map (`bun run export:aksh-map`) — HITL pointers; CDS stays closed on seeds
- Safety release criteria v0

## Active codebase (sole edit target)

**`hsi-core` is the sole active codebase for HSI work.** Edit only this repository (`~/Projects/hsi-core`, https://github.com/gnaneshwer23/hsi-core). All substrate, seeds, maps, exports, docs, and curator checklists land here. Product apps (Aksh / ISI) and bio tools consume published artifacts — they are never HSI edit targets.

| Repo / surface | Policy |
|----------------|--------|
| **gnaneshwer23/hsi-core** | **Edit here only** |
| **gnaneshwer23/immunecity** + ISI site | Out of scope for edits — consume via published export/API |
| **Aksh Health / aksh\*** | Out of scope for edits — consume Aksh map + HITL stub exports |
| **gnaneshwer23/hsi-sources** | Shelf only — do not treat as runtime core |
| **gnaneshwer23/swift-deliveries** | Out of scope — HITL pattern reference only |
| **AF3 / Boltz / ESM / OpenMM / RDKit / REINVENT4 / TDC** | P3 plugins at most — not P0/P1 |

Do not open PRs or push commits against immunecity, swift-deliveries, or Aksh product repos for HSI. Ship maps and curator markdown from this repo; consumers pull published artifacts. Detail: [`docs/VISION_REPO_ALIGNMENT.md`](docs/VISION_REPO_ALIGNMENT.md).

## Out of scope

Agent sprawl, AF3/Boltz, clinic write-back, live PHI, inventing PMIDs, treating ISI as CDS,
collapsing `teachingStatus` / `hsiGrade` / Gate C into one score,
treating `akshNodeId` as CDS eligibility,
editing immunecity or swift-deliveries for HSI work.
