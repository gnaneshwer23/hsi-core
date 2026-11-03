# HSI public site audit — simplification brief

**Date:** 2026-11-03  
**Scope:** `site/` only. Backend substrate (`src/`, exports, Neon, Gate C, ISI consume, Aksh HITL) is **out of mutation** for this brief.  
**Goal:** Classify routes, flag duplicates / misleading claims / static demos, and define the simplified public IA.

## Route inventory

| Path | Class | Surface | Notes / flags |
|------|-------|---------|---------------|
| `/` | **PUBLIC** | Homepage | Cohesive marketing; must not repeat product + KG demos across consecutive sections |
| `/platform` | **PUBLIC** | Platform landing | Reuses `PlatformEngine` + `EcosystemGrid` — **duplicate** of homepage sections if both keep full stacks |
| `/products` | **PUBLIC** | Four-product ledger | Canonical product cards + maturity chips |
| `/science` | **PUBLIC** | Educational biology | **Reintroduced** in primary nav (educational ≠ clinical product). Was redirected to `/explore` (LEGACY) |
| `/how-it-works` | **PUBLIC** | Persona workflow explainer | Keep primary |
| `/for-isi` | **PRODUCT** | ISI Research entry | Entry via Products + contextual CTAs (not primary header) |
| `/for-aksh` | **PRODUCT** | Aksh Health landing | Same |
| `/for-trials` | **PRODUCT** | HSI Trials marketing | Chip **Planned**; landing Available for marketing honesty |
| `/explore` | **PRODUCT** | Evidence explorer demo | Static interactive demo; research entry — keep route, demote from header |
| `/discovery-engine` | **PRODUCT** | Discovery workbench marketing | Static staged demo; overlaps homepage workflow demo |
| `/discovery` | **PRODUCT** | Discovery Centre | **Versioned artifact** packs under `public/discovery/` — primary research workspace |
| `/sources` | **PUBLIC** | Source registry viewer | Loads `/research/source-registry.json` (versioned artifact) |
| `/roadmap` | **PUBLIC** | Roadmap | Footer only |
| `/status` | **PUBLIC** | Maturity ledger | Footer only — Available / In development / Planned |
| `/docs` | **PUBLIC** | Public technical docs index | Footer |
| `/evidence` | **WORKSPACE** | Evidence table UI | Graded claims from packs — not primary marketing |
| `/curator` | **INTERNAL** | Curator checklist UI | Engineering drawer only |
| `/systems` | **INTERNAL** | Systems map | Engineering drawer |
| `/alignment` | **INTERNAL** | Alignment notes | Engineering drawer |
| `/akeno` | **INTERNAL** | Akeno consumer stub | Partner / Phase 8 — not public CTA |
| `/aksh-agents` | **INTERNAL** | Aksh agents reference | Engineering drawer |
| `/clinical-timeline` | **INTERNAL** | Synthetic clinical timeline | Demo fixture · `syntheticOnly` · no live EMIS |
| `/trials-criteria` | **INTERNAL** | Trials five-state demo | Fixture · never confirmed eligible |
| `/gateway` | **INTERNAL** | Aksh↔HSI gateway stub | PHI→research denied |
| `*` | **PUBLIC** | NotFound | |

### Classification legend

- **PUBLIC** — marketing / education / honesty ledgers appropriate for anonymous visitors  
- **PRODUCT** — product-facing research or consumer landings (reachable from Products / CTAs)  
- **WORKSPACE** — interactive research tools using real packs or exports  
- **INTERNAL** — engineering / substrate demos / partner stubs  
- **LEGACY** — kept for redirects or superseded destinations  

## Duplication & IA issues (pre-change)

| Issue | Severity | Resolution in this PR |
|-------|----------|----------------------|
| Primary nav listed Explore, Discovery, For Aksh, For Trials, For researchers | High | Primary: **Home · Platform · Products · Science · How It Works** |
| Homepage stacked PlatformEngine + EcosystemGrid + EvidenceExplorer + DiscoveryWorkbench | High | Home: value prop fabric → ecosystem once → **one** research workflow demo → oversight → CTA |
| `/platform` duplicated homepage sections | Medium | Platform keeps fabric + ecosystem; homepage no longer mirrors both demos |
| `/science` redirected to `/explore` | High vs brief | Restore `Science` educational landing; Explore remains PRODUCT route |
| Engineering links in mobile drawer only (good) but Status incorrectly expected in primary by tests | Low | Status / Roadmap / Docs → footer |
| Coral/teal palette vs brief ivory / botanical / lime / midnight-navy | Medium | Token remap + DESIGN_NOTES mapping |
| Product name “Immune Super Intelligence” vs brief “ISI Research” | Low | Display name → **ISI Research** in maturity ledger |

## Misleading claims / honesty flags

| Claim risk | Current mitigation | Status |
|------------|-------------------|--------|
| Live CDS / bedside care | Boundaries FAQ + product `mustNot` | Keep |
| Trial eligibility confirmation | `confirmedEligible=false` on demos; Planned chip | Keep |
| Live hospital / EMIS | Clinical timeline `syntheticOnly` | Keep |
| Invented MoU / partner lock | Discovery packs expose `partnerSigned` / honesty banners | Keep |
| Static demos presented as live APIs | Matrix doc classifies each interactive feature | Added this PR |

## Static demos vs live services

See [`CAPABILITY_DATA_SOURCE_MATRIX.md`](./CAPABILITY_DATA_SOURCE_MATRIX.md).

## Backend preservation checklist

Verified **not deleted** by this PR (paths exist under repo root):

- [x] Evidence / grades / Gate C (`src/grades.ts`, `src/gateCChecklist.ts`, …)  
- [x] Source registry CLI + site Sources page  
- [x] KG / ISI export / publish (`src/cli/export-isi.ts`, `bun run outputs`)  
- [x] Gate C contracts + local Neon write path (`db:gate-c-local`)  
- [x] ISI consume contracts (`src/isiConsumeContract.ts`, `src/exportIsi.ts`)  
- [x] Aksh HITL / gateway (`src/akshHitl.ts`, `src/akshHsiGateway.ts`)  
- [x] Neon isolation docs (`docs/NEON_PROJECT_MAP.md`) + migrations  
- [x] Test suite under `test/`  

## IA before → after

| | Before | After |
|--|--------|-------|
| Primary nav | Platform, Products, How it works, Explore, Discovery, For Aksh, For Trials, For researchers | **Platform, Products, Science, How It Works** (+ brand → Home) |
| Header CTA | Open Discovery | Explore products (→ `/products`) |
| Science | Redirect → Explore | Educational `/science` in primary nav |
| Research entry | Header clutter | Products + contextual CTAs (`/for-isi`, `/discovery`) |
| Footer | Platform / Products / Progress | Platform / Products / **Roadmap · Status · Docs** |
| Homepage demos | Two interactive labs | One research workflow demo |

## Remaining limitations

- Discovery Centre is offline-first on versioned JSON, not a live retrieval API.  
- Clinical / Trials / Gateway routes remain fixture demos.  
- Science atlas is educational UI copy — not a live KG query surface.  
- No production MoU or Gate C auto-approve paths.
