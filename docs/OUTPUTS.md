# HSI publishable outputs

Consumers (Aksh Health, ISI / Immune Super Intelligence) pull **versioned artifacts** from this repo — not live edits in product apps.

## Produce

```bash
cd ~/Projects/hsi-core
bun install
bun test
bun run outputs    # alias: bun run publish
bun run site:dev   # Discovery Centre at http://localhost:5173/discovery
```

Writes regenerable bundles under **`dist/outputs/`** (gitignored). Also refreshes legacy `exports/*.json` and **Phase 6–8** static copies under **`site/public/discovery/`** (committed so the vision site can load real packs without a local `dist/`).

Committed **small samples** (not full dumps): [`examples/sample-outputs/`](../examples/sample-outputs/).

## Layout

```
dist/outputs/
  LATEST.json                         # pointer to newest bundle
  latest/                             # copy of newest bundle files
  hsi-core-<version>-<timestamp>/
    MANIFEST.json
    hsi-isi-export.json               # ISI discovery export (hsi-isi-export-1)
    hsi-isi-rel-map.json              # REL-* curation pointers (not Gate C)
    hsi-aksh-node-map.json            # durable aksh: map (hsi-aksh-node-map-2)
    hsi-aksh-hitl-cards.json          # HITL card snapshot (cdsSurfacable=false on seeds)
    hsi-gap-report.json               # schema / mapping gaps
    hsi-gap-report.md                 # short human summary
    gate-c-checklist.json             # curated REL + PMID + S-P-O + status pending
    gate-c-checklist.md
    hsi-pilot-evidence-pack.json      # pilot pack (hsi-pilot-evidence-pack-2)
    hsi-pilot-evidence-pack.md        # human walkthrough / brief shell
    hsi-pilot-review-rubric.json      # Stage 1 four-output review checklist
    hsi-pilot-review-rubric.md
    hsi-pilot-acceptance.json         # Phase 5 Stage 1 acceptance (pass/fail/pending)
    hsi-pilot-acceptance.md
    hsi-pilot-walkthrough.md          # partner walkthrough script (RA/anti-TNF)
    hsi-partner-lock.json             # durable scope / partner-signed lock (+ dual-track fields)
    hsi-vertical-decision.json        # Option A dual-track decision record
    hsi-ssc-pathway-pack.json         # SSc Tfh–B–IL-21 PRD MVP thin slice (parallel to RA)
    hsi-ssc-pathway-pack.md
    hsi-gut-immune-pack.json          # P1.3 SCFA ↔ mucosal Treg/Th17 systems secondary axis
    hsi-gut-immune-pack.md
    hsi-neuroimmune-pack.json         # P2.1 vagus / cholinergic anti-inflammatory reflex
    hsi-neuroimmune-pack.md
    hsi-r2-validation.json            # Phase 7 R2 hypothesis cards / ranked gaps
    hsi-r2-validation.md
    hsi-translation-handoff.json      # Phase 8 Stage 3 translation candidates
    hsi-translation-handoff.md
    hsi-systems-vision.json           # Multi-axis systems vision stubs (regenerable; dual-track fields)
```

## Who uses what

| Consumer | Files | Rules |
|----------|-------|--------|
| **ISI** | `hsi-isi-export.json`, `hsi-isi-rel-map.json`, `gate-c-checklist.*`, `hsi-pilot-evidence-pack.*`, `hsi-pilot-review-rubric.*`, `hsi-pilot-acceptance.*`, `hsi-pilot-walkthrough.md`, `hsi-partner-lock.json`, `hsi-vertical-decision.json`, `hsi-ssc-pathway-pack.*`, `hsi-gut-immune-pack.*`, `hsi-neuroimmune-pack.*`, `hsi-r2-validation.*`, `hsi-translation-handoff.*`, `hsi-systems-vision.json` | Discovery / Ask / Radar only. REL map never auto-approves into KG. Gate C approve (if any) is human-only in **ISI Neon `autumn-snow`**, not HSI `red-wave`. Pack shows **Phase 3 evidence depth** on Phase 2 scope-locked RA/TNF (`scopeLocked=true`, `partnerSigned=false`, `lockedPilot=false`) — not a MoU. **Dual-track A:** ASK stays RA; SSc = secondary PRD MVP pack (`hsi-ssc-pathway-pack.*`) with **P1.1 cell cards + CL·MONDO hints**. **P1.3:** gut–immune (`hsi-gut-immune-pack.*`). **P2.1:** neuroimmune vagus/cholinergic (`hsi-neuroimmune-pack.*`; human VNS–RA hypothesized only). Gate C includes **P1.5 `modelProposals`** (pending drafts; `autoApprove=false`). **Systems vision:** dual-track + gut/neuro deepSeedsPresent — [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md). |
| **Aksh** | `hsi-aksh-node-map.json`, `hsi-aksh-hitl-cards.json` | HITL map pointers. `akshNodeId` ≠ CDS. Seeds stay `cdsSurfacable=false`. |
| **Akeno (in-repo HITL)** | `hsi-translation-handoff.*` (+ Gate C `translationCandidates`) + site `/akeno` | Stage 3 scaffolding + HITL consumer. `status=deferred_until_hitl` · `clinicalUse=not_for_clinical_use` · `hitlRequired=true` · `autoApprove=false` · `akenoProductIntegration=in_repo_hitl_consumer`. **Not** live CDS; **never** Akeno Neon. See [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md). |
| **Curators** | `gate-c-checklist.md`, `hsi-gap-report.md`, `hsi-pilot-evidence-pack.md`, `hsi-pilot-review-rubric.md`, `hsi-pilot-acceptance.md`, `hsi-pilot-walkthrough.md`, `hsi-r2-validation.md`, `hsi-translation-handoff.md` | Pending REL list + gap backlog + scope-locked brief + human review checklist + Phase 5 acceptance / walkthrough + Phase 7 R2 cards + Phase 8 translation HITL candidates. |

PRD / brief four outputs (evidence map, entity slice, competing explanations, expert shortlist) are assembled in `hsi-pilot-evidence-pack.*`. See [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md).

**Whole-immune-cell PRD (v0.1):** spine vocabulary + controlled relationship types live in package API `buildImmuneCellSpineBundle()` / `src/immuneCellSpine.ts`. **Decision A dual-track recorded:** RA = Stage 1 `scopeLocked` / `activeScope=ra-tnf`; SSc = PRD MVP `prdMvpTarget=ssc-tfh-b-il21` with deepened literature seeds + neighbourhood cell cards (`deepSeedsPresent=true`; CL·MONDO `hint_only`). Alignment: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md). Blueprint context: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md).

**Expanded systems vision (binding intent):** whole immune + gut–immune + brain–immune + disease/tissue/biomarker + patient-data plane + AI/P3 adapters. Durable map: [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md). Regenerable: `buildSystemsVisionBundle()` / `src/systemsAxes.ts` → publish `hsi-systems-vision.json` (includes `verticalStrategy` / `activeScope` / `prdMvpTarget`). “All” is the target graph, not one sprint; patient data stays Stage 3+ gated. **P1.3 done:** gut–immune SCFA ↔ mucosal Treg/Th17. **P2.1 done:** neuroimmune vagus / cholinergic anti-inflammatory reflex (`hsi-neuroimmune-pack.*`; `deepSeedsPresent=true`; no clinical cure claim). **Next science slice:** P2.2 embedding sidecar slots (partner P0.2 remains parallel).

**AI / neural / future healthcare position:** [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) — capabilities + hard bans + model-proposal / embedding-slot / eval-harness in `hsi-systems-vision.json` (`aiFutureTech`). **P1.5:** typed `ModelProposalArtifact` drafts appear on `gate-c-checklist.*` as `modelProposals` (`autoApprove=false`; never flip `hsiGrade`). Runtime module: `src/modelProposal.ts`.

## Partner lock honesty (Phase 2 schema)

| Field | Meaning |
|-------|---------|
| `scopeLocked` | Disease + researchQuestion are the **working Stage 1 pilot scope** (engineering). **Phase 2 done = this.** |
| `partnerSigned` | Named partner confirmed disease + question in writing. Stays false until outreach supplies a real org — never invent. |
| `lockedPilot` | Compat AND: `scopeLocked && partnerSigned`. Stays false without a named partner. |
| `provisionalLock` | Legacy Phase 1b scaffold. Cleared once scope is promoted (`false` after Phase 2). |
| `status` | `scope_locked` after Phase 2; `scoping` / `active` only after `partnerSigned`. |

**Phase 2 done = scope lock; named partner still flips `partnerSigned` (then `lockedPilot`).**

## Invariants

- `notCds` / `autoApproveIntoKg=false` / `autoSurfaceCds=false` on publish manifests
- Gate C checklist rows with evidence are **`pending`** until a human approve+supports in the **ISI product Neon** (`autumn-snow` / `ep-blue-salad…`) — that DB is **not** HSI’s; HSI Neon is `red-wave` only ([`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md))
- No PHI; no EHR write-back; no invented PMIDs / REL ids; no HSI writes into ISI/Akeno/DeliverX Neon
- `scopeLocked=true` **never** implies a signed commercial partner; `partnerSigned` / `lockedPilot` stay false until flip requirements in `hsi-partner-lock.json` are met
- SLE/PsO/IBD contexts remain **illustrative only**

Living status + prioritized backlog: [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md).

## Stage 1 / R0–R1 implementation checklist

| Item | Status |
|------|--------|
| Graded edges + provenance + dual axes (`hsiGrade` / `curationReview` / `teachingStatus`) | **Done** |
| Claim → marker → LOINC links (T2D + illustrative autoimmunity markers) | **Done** |
| ISI export + REL suggestion map (`autoApproveIntoKg=false`) | **Done** |
| Aksh node map + HITL stub (`cdsSurfacable=false` on seeds) | **Done** |
| Gap report + Gate C checklist (pending only) | **Done** |
| Pilot evidence pack — four workflow outputs + brief shell | **Done** (`hsi-pilot-evidence-pack-2`) |
| Versioned `bun run outputs` bundle + MANIFEST | **Done** |
| Discovery Centre vocabulary in exports (ASK→MAP→REVIEW + illustrative diseases) | **Done** (metadata only) |
| Illustrative RA/SLE/PsO/IBD pathway seed stubs | **Done** (RA elevated to working scope) |
| Whole-immune-cell spine stubs + PRD relationship vocabulary (RA lock intact; SSc = PRD target) | **Done** (`src/immuneCellSpine.ts`; see [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md)) |
| Systems vision multi-axis stubs (gut–immune, neuroimmune, disease/tissue/biomarker, patient plane, P3 adapters) | **Done** (`src/systemsAxes.ts` + `hsi-systems-vision.json`; see [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)) — gut + neuro deep seeds |
| AI / NN / future-tech position + schema stubs (capabilities, hard bans, model-proposal, embedding slot, eval harness) | **Done** ([`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) + `aiFutureTech` in systems vision export) — no ML stack, no auto Gate C |
| Dual-track vertical decision A | **Done** (`src/verticalDecision.ts` → `hsi-vertical-decision.json`; lock + systems vision fields) |
| SSc CD4/Tfh–B–IL-21 first literature slice | **Done** (thin pack; verified PMIDs; EBV hypothesized; RA untouched) |
| SSc deepen — cell cards + CL·MONDO hints + extra PMIDs (P1.1) | **Done** (`sscCellCards` + PMIDs 29626172 / 37763102; EBV still hypothesized) |
| Model-proposal → Gate C pending drafts (P1.5) | **Done** (`modelProposals` on Gate C; `autoApprove=false`) |
| Gut–immune curated claim edges (P1.3) | **Done** (`hsi-gut-immune-pack.*`; SCFA/butyrate ↔ mucosal Treg/Th17 + barrier; uncertain/hypothesized; Discovery secondary) |
| Neuroimmune curated claim edges (P2.1) | **Done** (`hsi-neuroimmune-pack.*`; vagus / cholinergic anti-inflammatory reflex; uncertain/hypothesized; human VNS–RA not a cure; Discovery secondary) |
| Embedding sidecar slots (P2.2) | **Not started** — **next** science slice |
| Typed entity slice + LOINC on pack evidence rows | **Done** |
| **Phase 1b** — Partner disease + question **provisional** scaffold | **Done** (superseded by Phase 2) |
| **Phase 2** — Scope lock (`scopeLocked=true`; RA / anti-TNF question canonical; outreach category only) | **Done** |
| Partner-scoped literature seed slice (RA/TNF pathway) | **Done** (public PMIDs; licensing still open with partner) |
| Scientific review rubric export (Stage 1 four outputs) | **Done** (thresholds TBD with partner) |
| Named `partnerSigned=true` / `lockedPilot=true` | **Remaining** (outreach — named partner confirms disease + question) |
| **Phase 3** — Partner-scoped evidence depth for the locked question | **Done** (ADA / immunogenicity, serology tension, RF LOINC, MTX combo; competing explanations filled) |
| **Phase 4** — HSI Neon `red-wave` readiness | **Done** (HSI-owned schema stub + migrate/gate-c-local guards; never ISI/Akeno/DeliverX) |
| **Phase 5** — Pilot acceptance pack | **Done** (`hsi-pilot-acceptance.*` + `hsi-pilot-walkthrough.md`; Stage 1 four outputs + MANIFEST + gap + Gate C + rubric green; `partnerSigned` / licensing / thresholds **pending**) |
| **Phase 6** — Target R1 Discovery Centre product surface | **Done** (`site/` route `/discovery`; loads `site/public/discovery/*.json` refreshed by `bun run outputs`; ASK→MAP→REVIEW; notCds; Akeno = later) |
| Source licensing / attribution for agreed partner corpus | **Remaining** (after partnerSigned) |
| Success-metric numeric thresholds with partner | **Remaining** |
| PDF/DOCX brief renderer | **Deferred** (ISI product P1; needs explicit ask) |
| **Phase 7** — R2 validation | **Done** (`hsi-r2-validation.*`; hypothesis cards with untested/supported/refuted/gap; ranked gaps + literature tests; Discovery Centre **VALIDATE** tab; research only — not clinical protocols) |
| **Phase 8** — R3–R5 / Akeno translation (HSI substrate) | **Done** (`hsi-translation-handoff.*` + Gate C `translationCandidates` + Discovery Centre **TRANSLATE** tab; `deferred_until_hitl` / `not_for_clinical_use`; no live CDS) |
| Akeno in-repo HITL consumer | **Done** (`/akeno` + `src/akenoConsumer.ts`; consumes handoff; hard not-CDS; no Akeno Neon) |
| Akeno partner / regulatory product | **Remaining gated** — partner cohorts, HCP eval, prospective CDS; never from research packs alone |
| Stage 2 molecular adapters / live Stage 3 clinical CDS | **Out of Stage 1 / gated** |

## Individual CLIs (still available)

```bash
bun run validate
bun run export:isi
bun run export:isi-map
bun run export:aksh-map
bun run gap-report
bun run build
```

Prefer `bun run outputs` when handing artifacts to product teams.

## HSI Neon (Phase 4)

```bash
bun run db:migrate              # requires DATABASE_URL → red-wave only
bun run db:gate-c-local         # upsert checklist as pending (auto_approve=false)
# or: bun run db:migrate -- --from-neonctl
```

Docs: [`HSI_NEON_MIGRATIONS.md`](./HSI_NEON_MIGRATIONS.md), [`db/README.md`](../db/README.md).
