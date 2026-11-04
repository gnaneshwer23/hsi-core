# hsi-core

**Health Super Intelligence (HSI)** — independent, evidence-grounded biomedical and healthcare intelligence platform under active development.

> **Foundational architecture:** [HSI-ARCH-001 — Independent Intelligence, Connected Ecosystem](docs/architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md). HSI must own its core research, biology, clinical intelligence, trial intelligence, knowledge graph and agent orchestration capabilities. Aksh Health and Immune Super Intelligence (ISI) are **optional, governed integrations**, not prerequisites for HSI to function.

> **Knowledge graph governance:** [HSI-ARCH-002 — Living Health Knowledge Graph Ownership](docs/architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md). HSI independently owns canonical graph models, source ingestion, provenance, review, versioned releases and privacy boundaries; external Aksh/ISI data are optional governed contributions.

**Current implementation vs target state:** This repository presently contains a shared evidence/claim substrate, research contracts, pilot tooling and selected integration adapters. Some workflows are deterministic, stubbed, synthetic or unreviewed. The architecture principle sets the direction; it does **not** imply clinical validation, live patient interoperability, autonomous scientific discovery or production readiness. Preserve existing PHI isolation, human review and no-automatic-EHR-write safeguards.

**Existing planning references:** [Vision/repository alignment](docs/VISION_REPO_ALIGNMENT.md) and [build status](docs/BUILD_STATUS_AND_NEXT.md) describe prior/current implementation scope; interpret any Aksh/ISI dependency framing in those documents as historical implementation detail rather than the target HSI architecture.

## Pilot

Immediate next move: prove ISI helps one immune-disease **research intelligence** workflow — not another broad AI feature.

| Doc | Purpose |
|-----|---------|
| [`docs/ISI_HSI_PRODUCT_AND_WEBSITE_BRIEF.md`](docs/ISI_HSI_PRODUCT_AND_WEBSITE_BRIEF.md) | Binding ISI / HSI product + homepage narrative |
| [`docs/ISI_PILOT_BRIEF.md`](docs/ISI_PILOT_BRIEF.md) | One-page pilot brief (purpose, non-goals, scope, outputs, metrics, decision gate) |
| [`docs/ISI_PILOT_PRD_ALIGNMENT.md`](docs/ISI_PILOT_PRD_ALIGNMENT.md) | External pilot PRD v1.0 → build now vs defer + artifact coverage |
| [`docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md`](docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md) | Full target-state vision → Stage 1 / 2 / 3 / out of scope (do not pull breadth into Stage 1) |
| [`docs/ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](docs/ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md) | Product/technical blueprint → HSI vs ISI/Akeno ownership, status, Neon isolation + SSc-vs-RA conflict |
| [`docs/ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](docs/ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md) | Whole-immune-cell PRD (v0.1) → spine + controlled relations + SSc MVP / RA R2 dual-track vs Stage 1 RA lock |
| [`docs/HSI_SYSTEMS_VISION_MAP.md`](docs/HSI_SYSTEMS_VISION_MAP.md) | Expanded target graph: immune + gut–immune + neuroimmune + disease/tissue/biomarker + patient plane + AI/P3 — regenerable `hsi-systems-vision.json`; no forced SSc/RA pivot |
| [`docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) | NN/AI/future-tech position: proposers vs KG constraint, agent workbench vs HITL, patient plane, schema stubs — no auto Gate C |
| [`docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md) | Discovery Centre concept site (HTML export) → Stage 1 posture; reference-only, not the pilot deliverable |
| [`docs/ISI_PILOT_PARTNER_SHORTLIST.md`](docs/ISI_PILOT_PARTNER_SHORTLIST.md) | Outreach shortlist — partner types + UK/EU/US institution categories (candidates only) |
| [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md) | **HSI Neon = `red-wave` only**; ISI `autumn-snow` / Akeno / DeliverX never for HSI substrate — IDs + host prefixes, no secrets |
| [`docs/NEON_TO_AWS_RDS_RUNBOOK.md`](docs/NEON_TO_AWS_RDS_RUNBOOK.md) | **HSI-only** Neon → RDS staging plan (dev-sized); no prod cutover; ISI Auth stays on Neon |
| [`docs/PRD_IMPLEMENTATION_AUDIT.md`](docs/PRD_IMPLEMENTATION_AUDIT.md) | Phases 0–8 vs Pilot + Target PRDs (what landed) |
| [`docs/BUILD_STATUS_AND_NEXT.md`](docs/BUILD_STATUS_AND_NEXT.md) | **Current-state audit + prioritized next build** (P0/P1/P2; do-not-build list) |

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

The research-first implementation now includes a source registry at `/sources`,
claim comparison and cited brief export in Discovery MAP, and separate Aksh/ISI
consumer integrations. Start with [the vision audit](docs/HSI_VISION_AUDIT_2026-11-02.md),
[source-registry workflow](docs/SOURCE_REGISTRY.md),
[Aksh integration](docs/AKSH_PLATFORM_INTEGRATION.md) and
[Immunecity integration](docs/IMMUNECITY_PLATFORM_INTEGRATION.md).
Source metadata and linked identifiers are not independently verified claim support.

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
- Aksh agent name catalog (12 directory / 14 register): `aksh/agent-catalog.json`, `src/akshAgents.ts`, site `/aksh-agents` — see [`docs/AKSH_AGENTS_IN_HSI.md`](docs/AKSH_AGENTS_IN_HSI.md).

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
