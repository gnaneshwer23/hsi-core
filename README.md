# hsi-core

Shared **Human Systems Intelligence** substrate for **Aksh Health** (clinic HITL CDS) and **Immune Super Intelligence / ISI** (discovery).

Evidence-graded edges (`established` / `uncertain` / `unexplored`) plus claim → marker (LOINC) → observation → action stubs. No PHI. No auto diagnosis. No EHR write-back.

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
bun run gap-report
```

Requires [Bun](https://bun.sh) (tests + CLI). `bun run build` emits `dist/` for TypeScript consumers.

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
} from "hsi-core";
```

| Product | Rules |
|---------|--------|
| **ISI** | Discovery / Ask / Radar only; honest grades; `buildIsiExportBundle()` / `bun run export:isi` |
| **Aksh** | HITL suggestion cards only when `isCdsSurfacable(edge)`; never auto-apply |

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
- Safety release criteria v0

## Out of scope

Agent sprawl, AF3/Boltz, clinic write-back, live PHI, inventing PMIDs, treating ISI as CDS,
collapsing `teachingStatus` / `hsiGrade` / Gate C into one score.
