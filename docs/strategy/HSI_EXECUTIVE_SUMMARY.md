# HSI Strategy — Executive Summary

**Date:** 2 November 2026  
**Task:** Vision recovery, architecture redefinition, implementation strategy  
**Constraint observed:** Audit and documents only — **no feature implementation** in this pass.  
**Repos audited:** `hsi-core@fe69bc6`, `immunecity@dbacd47`, `aksh-health-redesign@c186893`

---

## What has already been built

| Surface | Reality (evidence-based) |
|---------|--------------------------|
| **hsi-core** | Evidence substrate: **150/150 tests**, **88 validated edges**, graded packs, Gate C tooling, versioned exports, Discovery SPA, CDS/PHI refuse, Aksh **catalog only** (no runtime). Partner lock = **fixture** (`lockedPilot=false`). P3 adapters stubbed on publish. No in-repo KG — ISI `REL-*` pointers only. |
| **immunecity (ISI)** | Researcher product: KG **260 core + 70 draft** / **395 + 200 draft** edges; Atlas/Ask; dual Discovery (ISI Radar vs `/hsi/discovery`); Gate C on **autumn-snow** only; cite Check path (supports still human). Trial Intelligence **off by default**. Ask = grounded single gateway, not multi-agent. |
| **Aksh Health** | Marketing live at akshhealth.com; clinical proof **`LIVE_ORGANISATIONS=0`**. **14** registered agents (10 exercised + PRISM/ATLAS scaffolds), CONDUCTOR + HITL + SHIELD, diabetes Phases 0–6 on synthetic P002 (`syntheticOnly`, `liveEmis:false`). Parallel journeys — not one longitudinal spine. |

## What should be preserved

1. **ISI knowledge graph** (`src/data/kg.json`) — strategic scientific asset; extend, do not replace without justification.  
2. **hsi-core evidence model + Gate C honesty** — grades, provenance, human review, Neon isolation (`red-wave` ≠ `autumn-snow`).  
3. **Aksh agent platform** — CONDUCTOR → SYNTHESIS/GUARDIAN/HORIZON/NEXUS → HITL → SHIELD; reuse via APIs, do not rebuild in hsi-core.  
4. **Research-intelligence product language** recently locked on the hsi-core site (purpose before roadmap).  
5. **Safety contracts** — `notCds`, no PHI on HSI Neon, no auto-approve into KG or chart.

## What is fundamentally misaligned

1. **Naming / scope drift:** Repos and docs say *Human Systems Intelligence* / *Immune Super Intelligence* / research-only Stage 1; this directive defines *Health Super Intelligence* as a four-product clinical+research ecosystem. These are not the same product claim.  
2. **Website vs vision:** Engineering altitude/roadmap previously dominated marketing; partially corrected on hsi-core homepage — still not a four-product ecosystem narrative.  
3. **“One graph” ambition vs reality:** Three separate planes (hsi-core packs, ISI KG, Aksh clinical spine) with **no shared living patient–biology–trial graph**.  
4. **Agents:** Catalog stubs and marketing language outrun executable cross-domain orchestration. Aksh agents ≠ ISI research agents ≠ HSI Trials agents.  
5. **Hospital record reconstruction / universal access** — vision language only; zero verified hospital federation in these repos.

## What is missing (relative to definitive vision)

- HSI Clinical longitudinal layer (FHIR federation, identity, timeline).  
- HSI Trials as a first-class product (eligibility evaluation with explicit unavailable/clarification states).  
- Unified logical graph layers 1–6 with access-controlled views.  
- Cross-domain reasoning that separates observed fact / evidence / association / inference / hypothesis.  
- Real research partner lock for ISI pilot.  
- Governed Aksh↔HSI API contract beyond export stubs.  
- UK clinical safety case (DCB0129/0160) for any live clinical intelligence claim.

## What must be redesigned (architecture, not cosmetic)

1. **Product taxonomy:** Four connected products (Aksh / HSI Clinical / ISI / HSI Trials) + shared services — with honest maturity labels.  
2. **Data planes:** Strict separation of patient-identifiable, governed partner, and public biomedical evidence.  
3. **Intelligence engine:** Prefer graph queries + terminology + deterministic tools; LLMs as proposers under Gate C / HITL — not a fleet of unrelated chatbots.  
4. **Roadmap presentation:** Development status secondary; public site leads with capability and workflows.  
5. **Naming decision** (founder): Health vs Human vs Immune Super Intelligence branding.

## What should be implemented first (after approval)

**Phase 0 (this document set)** — complete.  

**Next build (recommended):** **Workflow A — Biomedical Discovery** end-to-end hardening on existing ISI + hsi-core (research brief from question → graph → evidence → gaps), plus finish human cite path on 13 Gate C rows — **without** opening PHI or claiming clinical readiness.

**Do not start next:** Workflow B/C production claims, EHR write-back, inventing MoUs, replacing ISI KG, duplicating Aksh CONDUCTOR inside hsi-core.

## Decisions requiring founder approval

See [`HSI_GAP_ANALYSIS_AND_DECISIONS.md`](./HSI_GAP_ANALYSIS_AND_DECISIONS.md). Critical ones:

| # | Decision |
|---|----------|
| D1 | Official product name and brand hierarchy (Health / Human / Immune / Aksh) |
| D2 | Confirm Stage 1 remains **research-intelligence first** vs accelerate HSI Clinical |
| D3 | Preserve vs migrate ISI KG as Layer 4 seed |
| D4 | Aksh reuse policy (API contract vs monorepo merge) |
| D5 | First paid/partner workflow: Discovery A vs Clinical B vs Trials C |
| D6 | Whether “HSI Core” expands beyond evidence substrate into orchestration hub |

---

**Stop condition met:** Audit + architecture + product specification + roadmap documents delivered under `docs/strategy/`. No feature code shipped in this task.
