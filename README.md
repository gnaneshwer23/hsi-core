# hsi-core

**Human Super Intelligence (HSI)** is one product with four governed modules around the Living Health Knowledge Graph:

> **Governing vision:** [The Vision of Human Super Intelligence](docs/strategy/HSI_VISION.md) — connecting human biology, advancing scientific discovery, transforming our understanding of health. Doctrine for every landing page, backend, knowledge-graph relationship, AI agent and product decision; **not** a claim that every capability is production-ready.

| Module | Responsibility |
| --- | --- |
| **Aksh Health** | Patient intelligence: symptoms, medications, labs, wearables, metabolic context |
| **HSI Clinical** | Longitudinal authorised clinical intelligence and missing information |
| **ISI / Immune Super Intelligence** | Scientific discovery across immune, nervous, microbiome, metabolic and molecular systems |
| **HSI Trials** | Biology, biomarkers, targets, studies, eligibility and governed pre-screening |

ISI science does not depend on the Aksh Health module. Private patient data never enters the research graph automatically. Association is kept separate from a demonstrated causal mechanism.

> Connecting human biology. Advancing scientific discovery. Transforming our understanding of health.

> **Foundational architecture:** [HSI-ARCH-001 v1.2](docs/architecture/principles/ARCH-001-independent-intelligence-connected-ecosystem.md). [HSI-ARCH-002 v1.1](docs/architecture/principles/ARCH-002-living-health-knowledge-graph-ownership.md).

> **Current status:** [docs/STATUS.md](docs/STATUS.md), generated from the capability register. Older status documents are superseded.

**Current implementation vs target state:** This repository contains the evidence substrate, research contracts, a synthetic end-to-end demonstration cohort, and selected adapters. Some workflows are deterministic, stubbed, synthetic or unreviewed. Nothing here is clinical validation, regulatory approval, or a commercial care product. Preserve PHI isolation, human review and no-EHR-write-back.

**Licence:** [Apache-2.0](LICENSE). Third-party research pack source licences remain a separate human matrix — see [docs/OWNER_DECISIONS.md](docs/OWNER_DECISIONS.md).

## Pilot

The demonstration question is how gut microbial metabolites might influence neuroinflammation in metabolic disease, with an immune-mediated thread kept distinct from type 1 and type 2 diabetes. The cohort behind `bun run demo` is synthetic. It is not a patient registry.

| Doc | Purpose |
|-----|---------|
| [`docs/ISI_HSI_PRODUCT_AND_WEBSITE_BRIEF.md`](docs/ISI_HSI_PRODUCT_AND_WEBSITE_BRIEF.md) | Binding ISI / HSI product + homepage narrative |
| [`docs/ISI_PILOT_BRIEF.md`](docs/ISI_PILOT_BRIEF.md) | One-page pilot brief (purpose, non-goals, scope, outputs, metrics, decision gate) |
| [`docs/ISI_PILOT_PRD_ALIGNMENT.md`](docs/ISI_PILOT_PRD_ALIGNMENT.md) | External pilot PRD v1.0 → build now vs defer + artifact coverage |
| [`docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md`](docs/ISI_TARGET_STATE_PRD_ALIGNMENT.md) | Full target-state vision → Stage 1 / 2 / 3 / out of scope (do not pull breadth into Stage 1) |
| [`docs/ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](docs/ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md) | Product/technical blueprint → module ownership, status, Neon isolation + SSc-vs-RA conflict |
| [`docs/ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](docs/ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md) | Whole-immune-cell PRD (v0.1) → spine + controlled relations + SSc MVP / RA R2 dual-track vs Stage 1 RA lock |
| [`docs/HSI_SYSTEMS_VISION_MAP.md`](docs/HSI_SYSTEMS_VISION_MAP.md) | Expanded target graph: immune + gut–immune + neuroimmune + disease/tissue/biomarker + patient plane + AI/P3 — regenerable `hsi-systems-vision.json`; no forced SSc/RA pivot |
| [`docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) | NN/AI/future-tech position: proposers vs KG constraint, agent workbench vs HITL, patient plane, schema stubs — no auto Gate C |
| [`docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md) | Discovery Centre concept site (HTML export) → Stage 1 posture; reference-only, not the pilot deliverable |
| [`docs/ISI_PILOT_PARTNER_SHORTLIST.md`](docs/ISI_PILOT_PARTNER_SHORTLIST.md) | Outreach shortlist — partner types + UK/EU/US institution categories (candidates only) |
| [`docs/NEON_PROJECT_MAP.md`](docs/NEON_PROJECT_MAP.md) | HSI Neon only. Other product databases are never the HSI substrate. Tracked files keep placeholders, not live project or host IDs |
| [`docs/NEON_TO_AWS_RDS_RUNBOOK.md`](docs/NEON_TO_AWS_RDS_RUNBOOK.md) | **HSI-only** Neon → RDS staging plan (dev-sized); no prod cutover; ISI Auth stays on Neon |
| [`docs/PRD_IMPLEMENTATION_AUDIT.md`](docs/PRD_IMPLEMENTATION_AUDIT.md) | Phases 0–8 vs Pilot + Target PRDs (what landed) |
| [`docs/BUILD_STATUS_AND_NEXT.md`](docs/BUILD_STATUS_AND_NEXT.md) | **Current-state audit + prioritized next build** (P0/P1/P2; do-not-build list) |

`bun run outputs` artifacts from this repo feed the research evidence layer. Model adapters such as RDKit and ESM stay proposal-only.

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

Requires [Bun](https://bun.sh) 1.3.14 (tests + CLI). **`bun run outputs`** (alias `publish`) writes a versioned consumer bundle to regenerable `dist/outputs/` (gitignored) and refreshes legacy `exports/*.json`. Small committed samples: [`examples/sample-outputs/`](examples/sample-outputs/). Consumer guide: [`docs/OUTPUTS.md`](docs/OUTPUTS.md).

```bash
bun run demo
```

`bun run demo` runs one offline investigation on a synthetic cohort: longitudinal labs, a FHIR R4 boundary, fixture evidence from Europe PMC, Open Targets and UniProt, a human review, and a versioned graph release. It does not use the network. The people in the cohort are not real patients.

Individual CLIs still available: `validate`, `export:isi`, `export:isi-map`, `export:aksh-map`, `gap-report`.

## Vision site

The research implementation includes a source registry at `/sources` and claim comparison in the research views. Start with [the vision audit](docs/HSI_VISION_AUDIT_2026-11-02.md) and [source-registry workflow](docs/SOURCE_REGISTRY.md). Source metadata is not independently verified claim support.

The public site (Vite + React) lives in [`site/`](site/). Module routes replace the old product catalogue: `/modules`, `/modules/aksh-health`, `/modules/clinical`, `/modules/isi`, `/modules/trials`. `/products`, `/for-isi`, `/for-aksh`, `/for-trials`, `/akeno` and `/aksh-agents` redirect there.

```bash
bun run site:dev      # http://localhost:5173
bun run site:build    # site/dist
```

Pages: Home, Platform, Modules, Science, How it works. The interactive walkthrough is a later route and is not a claim of live care.

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

| Module | Rules |
|---------|--------|
| **ISI** | Discovery / Ask / Radar only; honest grades; `buildIsiExportBundle()` / `bun run export:isi` |
| **Aksh Health** | HITL suggestion cards only when `isCdsSurfacable(edge)`; `akshNodeId` is a map pointer only — never auto-apply to EHR |

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

**`hsi-core` is the sole active codebase for the HSI substrate.** Edit this repository (https://github.com/gnaneshwer23/hsi-core). Substrate, seeds, maps, exports, docs and curator checklists land here. Module apps consume published artifacts.

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
