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
    hsi-embedding-sidecars.json       # P2.2 edge embedding hash/ref slots
    hsi-model-eval-harness.json       # P2.3 offline eval harness vs frozen packs
    hsi-model-eval-harness.md
    hsi-external-genome-pointers.json # P2.4 ClinVar/TCGA citation pointers
    hsi-p3-adapter-license-matrix.json # P2.5 P3 adapter license / sign-off shelf
    hsi-p3-adapter-license-matrix.md
    hsi-rdkit-adapter-proposals.json  # P3.0 RDKit thin adapter proposals (stub|rdkit)
    hsi-rdkit-adapter-proposals.md
    hsi-openmm-adapter-proposals.json # P3.1 OpenMM thin adapter proposals (stub|openmm)
    hsi-openmm-adapter-proposals.md
    hsi-reinvent4-adapter-proposals.json # P3.2 REINVENT4 thin adapter proposals (stub|reinvent)
    hsi-reinvent4-adapter-proposals.md
    hsi-esm-adapter-proposals.json       # P3.3 FAIR ESM-2 thin embedding stub (stub|esm)
    hsi-esm-adapter-proposals.md
    hsi-af3-adapter-proposals.json       # AF3 research-test stub (notCommercial; NOT commercial rights)
    hsi-af3-adapter-proposals.md
    hsi-tdc-adapter-proposals.json       # TDC research-test stub
    hsi-tdc-adapter-proposals.md
    hsi-boltz-adapter-proposals.json     # Boltz stub (WEIGHTS_POLICY_ACK; no weight vendoring)
    hsi-boltz-adapter-proposals.md
    hsi-isi-agents-adapter-proposals.json # ISI agents catalog/stub proposals
    hsi-isi-agents-adapter-proposals.md
    hsi-isi-consume-contract.json        # P0.2-HSI ISI consume contract (MANIFEST/packs/grades/Gate C)
    hsi-isi-consume-contract.md
    hsi-partner-flip-readiness.json      # P0.2-HSI flipRequirements (pass/fail/pending/satisfied_by_fixture)
    hsi-partner-flip-readiness.md
    hsi-source-licensing-stub.json       # P0.3 PMID licensing stub (needs_review)
    hsi-source-licensing-stub.md
```

## Who uses what

| Consumer | Files | Rules |
|----------|-------|--------|
| **ISI** | `hsi-isi-export.json`, `hsi-isi-rel-map.json`, `gate-c-checklist.*`, `hsi-pilot-evidence-pack.*`, `hsi-pilot-review-rubric.*`, `hsi-pilot-acceptance.*`, `hsi-pilot-walkthrough.md`, `hsi-partner-lock.json`, `hsi-vertical-decision.json`, `hsi-ssc-pathway-pack.*`, `hsi-gut-immune-pack.*`, `hsi-neuroimmune-pack.*`, `hsi-r2-validation.*`, `hsi-translation-handoff.*`, `hsi-systems-vision.json`, `hsi-embedding-sidecars.json`, `hsi-model-eval-harness.*`, `hsi-external-genome-pointers.json`, `hsi-p3-adapter-license-matrix.*`, `hsi-rdkit-adapter-proposals.*`, `hsi-openmm-adapter-proposals.*`, `hsi-reinvent4-adapter-proposals.*`, `hsi-esm-adapter-proposals.*`, **`hsi-isi-consume-contract.*`**, **`hsi-partner-flip-readiness.*`**, **`hsi-source-licensing-stub.*`** | Discovery / Ask / Radar only. REL map never auto-approves into KG. Gate C approve (if any) is human-only in **ISI Neon `autumn-snow`**, not HSI `red-wave`. Pack shows **Phase 3 evidence depth** on Phase 2 scope-locked RA/TNF (`scopeLocked=true`, `partnerSigned=false`, `lockedPilot=false`) — not a MoU. **Dual-track A:** ASK stays RA; SSc / gut / neuro = secondary packs. Gate C includes **P1.5 `modelProposals`** + **P3.0–P3.3** drafts (`autoApprove=false`). **P0.2-HSI:** start with `hsi-isi-consume-contract.*` (MANIFEST keys, grades, Gate C rules, Discovery paths) + `hsi-partner-flip-readiness.*` (honest fail/pending; never invent MoU). **P0.3 stub:** `hsi-source-licensing-stub.*` (`needs_review`). **Adapter track paused** — prefer named partner or out-of-repo immunecity wiring over more spikes. **Systems vision:** [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md). |
| **Aksh** | `hsi-aksh-node-map.json`, `hsi-aksh-hitl-cards.json` | HITL map pointers. `akshNodeId` ≠ CDS. Seeds stay `cdsSurfacable=false`. |
| **Akeno (in-repo HITL)** | `hsi-translation-handoff.*` (+ Gate C `translationCandidates`) + site `/akeno` | Stage 3 scaffolding + HITL consumer. `status=deferred_until_hitl` · `clinicalUse=not_for_clinical_use` · `hitlRequired=true` · `autoApprove=false` · `akenoProductIntegration=in_repo_hitl_consumer`. **Not** live CDS; **never** Akeno Neon. See [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md). |
| **Curators** | `gate-c-checklist.md`, `hsi-gap-report.md`, `hsi-pilot-evidence-pack.md`, `hsi-pilot-review-rubric.md`, `hsi-pilot-acceptance.md`, `hsi-pilot-walkthrough.md`, `hsi-r2-validation.md`, `hsi-translation-handoff.md` | Pending REL list + gap backlog + scope-locked brief + human review checklist + Phase 5 acceptance / walkthrough + Phase 7 R2 cards + Phase 8 translation HITL candidates. |

PRD / brief four outputs (evidence map, entity slice, competing explanations, expert shortlist) are assembled in `hsi-pilot-evidence-pack.*`. See [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md).

**Whole-immune-cell PRD (v0.1):** spine vocabulary + controlled relationship types live in package API `buildImmuneCellSpineBundle()` / `src/immuneCellSpine.ts`. **Decision A dual-track recorded:** RA = Stage 1 `scopeLocked` / `activeScope=ra-tnf`; SSc = PRD MVP `prdMvpTarget=ssc-tfh-b-il21` with deepened literature seeds + neighbourhood cell cards (`deepSeedsPresent=true`; CL·MONDO `hint_only`). Alignment: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md). Blueprint context: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md).

**Expanded systems vision (binding intent):** whole immune + gut–immune + brain–immune + disease/tissue/biomarker + patient-data plane + AI/P3 adapters. Durable map: [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md). Regenerable: `buildSystemsVisionBundle()` / `src/systemsAxes.ts` → publish `hsi-systems-vision.json` (includes `verticalStrategy` / `activeScope` / `prdMvpTarget`). “All” is the target graph, not one sprint; patient data stays Stage 3+ gated. **P1.3 done:** gut–immune SCFA ↔ mucosal Treg/Th17. **P2.1 done:** neuroimmune vagus / cholinergic anti-inflammatory reflex (`hsi-neuroimmune-pack.*`; `deepSeedsPresent=true`; no clinical cure claim). **P2.2 done:** embedding sidecars (`hsi-embedding-sidecars.json`; hash/ref; `doesNotSetHsiGrade`). **P2.3 done:** offline eval harness (`hsi-model-eval-harness.*`; frozen RA/SSc/gut/neuro fixtures; fail-closed clinical/PHI). **P2.4 done:** ClinVar/TCGA pointer metadata (`hsi-external-genome-pointers.json`; citation/ref; `reviewRequired`; no bulk dump / PHI). **P2.5 done:** P3 adapter RFC + license matrix ([`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md); `hsi-p3-adapter-license-matrix.*`; honest `signOffStatus`; no weight vendoring). **P3.0 done:** RDKit thin adapter spike (`hsi-rdkit-adapter-proposals.*`; `runtime: stub|rdkit`; ModelProposalArtifacts → Gate C pending). **P3.1 done:** OpenMM thin adapter spike (`hsi-openmm-adapter-proposals.*`; `runtime: stub|openmm`; cites `HSI-E-NI-003` / `HSI-E-GUT-003`; MD ≠ Gate C evidence alone). **P3.2 done:** REINVENT4 thin adapter spike (`hsi-reinvent4-adapter-proposals.*`; `runtime: stub|reinvent`; cites `HSI-E-RA-012` / `HSI-E-GUT-003`; never clinic path). **P3.3 done:** FAIR ESM-2 thin embedding stub (`hsi-esm-adapter-proposals.*`; `runtime: stub|esm`; cites `HSI-E-RA-001` / `HSI-E-GUT-003`; ModelProposalArtifacts + embedding sidecar refs overlaying `hsi-embedding-sidecars.json`; no weight vendoring). **P3.5 done:** Boltz weights-policy stub (`hsi-boltz-adapter-proposals.*`; `WEIGHTS_POLICY_ACK=true`; optional `BOLTZ_WEIGHTS_CACHE` external; no multi-GB weight vendoring). **P0.2-HSI done:** ISI consume contract + partner flip-readiness (`hsi-isi-consume-contract.*` / `hsi-partner-flip-readiness.*`; `partnerSigned=false`) + P0.3 licensing stub (`hsi-source-licensing-stub.*`; `needs_review`). **Next:** ISI product consume wiring / partner follow-through — Boltz unblocked under policy ack only.

**AI / neural / future healthcare position:** [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) — capabilities + hard bans + model-proposal / embedding-slot / eval-harness / genome-pointer / P3 license matrix in `hsi-systems-vision.json` (`aiFutureTech`). **P1.5:** typed `ModelProposalArtifact` drafts appear on `gate-c-checklist.*` as `modelProposals` (`autoApprove=false`; never flip `hsiGrade`). Runtime module: `src/modelProposal.ts`. **P2.2:** typed `EdgeEmbeddingSidecar` + `hsi-embedding-sidecars.json` (`src/embeddingSidecar.ts`; hash/ref preferred; optional tiny demo ≤16 dims; never PHI / model weights; P3.3 ESM overlays). **P2.3:** `MODEL_EVAL_HARNESS_STUB` + `src/modelEvalHarness.ts` → `hsi-model-eval-harness.*` (offline only; `mayUseLivePhi=false`; packs remain authority). **P2.4:** `EXTERNAL_GENOME_POINTER_SCHEMA` + `src/externalGenomePointers.ts` → `hsi-external-genome-pointers.json` (ClinVar/TCGA citation/ref; Gate C still required). **P2.5:** `P3_ADAPTER_LICENSE_MATRIX_SCHEMA` + `src/p3AdapterLicenseMatrix.ts` → `hsi-p3-adapter-license-matrix.*` (license gate before run; ModelProposalArtifacts only). **P3.0:** `src/adapters/rdkitAdapter.ts` + `src/p3AdapterGate.ts` → `hsi-rdkit-adapter-proposals.*` (`bun run adapter:rdkit`). **P3.1:** `src/adapters/openmmAdapter.ts` → `hsi-openmm-adapter-proposals.*` (`bun run adapter:openmm`). **P3.2:** `src/adapters/reinvent4Adapter.ts` → `hsi-reinvent4-adapter-proposals.*` (`bun run adapter:reinvent4`). **P3.3:** `src/adapters/esmAdapter.ts` → `hsi-esm-adapter-proposals.*` (`bun run adapter:esm`). **P3.5:** `src/adapters/boltzAdapter.ts` → `hsi-boltz-adapter-proposals.*` (`WEIGHTS_POLICY_ACK=true`; `bun run adapter:boltz`).

## Partner lock honesty (Phase 2 schema)

| Field | Meaning |
|-------|---------|
| `scopeLocked` | Disease + researchQuestion are the **working Stage 1 pilot scope** (engineering). **Phase 2 done = this.** |
| `partnerSigned` | **Apolo Pharma** named path: `true` under `agreementKind=legal_mou` (MoU operator-asserted). Fixture template may still set `true` under `hypothetical_test_only` for path testing — production ISI requires `ALLOW_HYPOTHETICAL_PARTNER=true` to trust fixture only. Swap via `src/hypotheticalPartnerFixture.ts`. |
| `lockedPilot` | `scopeLocked && partnerSigned && legalBinding`. **Apolo path:** `true`. Fixture path stays `false` while `legalBinding=false`. |
| `provisionalLock` | Legacy Phase 1b scaffold. Cleared once scope is promoted (`false` after Phase 2). |
| `status` | `scope_locked` after Phase 2; named Apolo lock uses `scoping` with `partnerSigned` + `legalBinding`. |

**Phase 2 done = scope lock. P0.6 done = Apolo named lock + walkthrough/export hygiene (`lockedPilot=true`; Stage 1 clearance 48/48).**

## Invariants

- `notCds` / `autoApproveIntoKg=false` / `autoSurfaceCds=false` on publish manifests
- Gate C checklist rows with evidence are **`pending`** until a human approve+supports in the **ISI product Neon** (`autumn-snow` / `ep-blue-salad…`) — that DB is **not** HSI’s; HSI Neon is `red-wave` only ([`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md))
- No PHI; no EHR write-back; no invented PMIDs / REL ids; no HSI writes into ISI/Akeno/DeliverX Neon
- `scopeLocked=true` alone **never** implies a MoU; named Apolo path sets `partnerSigned` + `legalBinding` → `lockedPilot=true` (still not CDS; Gate C never auto-approves)
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
| Embedding sidecar slots (P2.2) | **Done** (`hsi-embedding-sidecars.json`; hash/ref; `doesNotSetHsiGrade`; no weights/PHI) |
| Offline eval harness stubs (P2.3) | **Done** (`hsi-model-eval-harness.*`; frozen-pack checks; fail-closed clinical/PHI; no training) |
| ClinVar / TCGA pointer metadata (P2.4) | **Done** (`hsi-external-genome-pointers.json`; accession/URL/disease-gene; optional edgeIds; `reviewRequired`; no bulk dump / PHI; does not set `hsiGrade`) |
| P3 adapter RFC + license matrix (P2.5) | **Done** ([`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md); `hsi-p3-adapter-license-matrix.*`; honest sign-off; no weight vendoring; blocked adapters refused) |
| First unblocked thin adapter spike (P3.0 RDKit) | **Done** (`hsi-rdkit-adapter-proposals.*`; `runtime: stub|rdkit`; Gate C pending; eval harness case) |
| Next unblocked thin adapter spike (P3.1 OpenMM) | **Done** (`hsi-openmm-adapter-proposals.*`; `runtime: stub|openmm`; cites NI-003 / GUT-003; Gate C pending; eval harness case) |
| Next unblocked thin adapter spike (P3.2 REINVENT4) | **Done** |
| FAIR ESM-2 thin embedding stub (P3.3) | **Done** |
| AF3 / TDC / ISI research sign-off fixtures + stubs | **Done** (`hsi-af3|tdc|isi-agents-adapter-proposals.*`; notCommercial; replaceWithLegalSignOff; NOT commercial AF3) |
| Boltz weights policy + stub (P3.5) | **Done / unblocked under ack** ([`P3_WEIGHTS_AND_LICENSE_POLICY.md`](./P3_WEIGHTS_AND_LICENSE_POLICY.md); `WEIGHTS_POLICY_ACK`; optional `BOLTZ_WEIGHTS_CACHE`; `hsi-boltz-adapter-proposals.*`; no weight vendoring) |
| Discovery graph explorer | **Done** (`/discovery` MAP; RA + SSc/gut/neuro toggles; click → evidence card) |
| SSc / gut / neuro depth PMIDs | **Done** (+3 / +2 / +2 verified edges; RA untouched) |
| ISI consume contract + partner flip-readiness (P0.2-HSI) | **Done** (`hsi-isi-consume-contract.*` + `hsi-partner-flip-readiness.*`; `partnerSigned=false`; adapter track paused) |
| Source licensing stub (P0.3) | **Reviewed + Apolo Stage 1 clearance** (`hsi-source-licensing-stub.*`; ok_oa/restricted/unknown + clearanceScope; partnerClearedCount > 0) |
| **Next** — named partner OR out-of-repo ISI product wiring | **Waiting human** — do not invent more adapter spikes without partnerNamed |
| Typed entity slice + LOINC on pack evidence rows | **Done** |
| **Phase 1b** — Partner disease + question **provisional** scaffold | **Done** (superseded by Phase 2) |
| **Phase 2** — Scope lock (`scopeLocked=true`; RA / anti-TNF question canonical; outreach category only) | **Done** |
| Partner-scoped literature seed slice (RA/TNF pathway) | **Done** (public PMIDs; Apolo Stage 1 clearance scopes on stub) |
| Scientific review rubric export (Stage 1 four outputs) | **Done** (Apolo Pharma numeric thresholds `partner_agreed` 2026-11-01) |
| Named `partnerSigned=true` / `lockedPilot=true` | **Done** (Apolo Pharma — MoU operator-asserted; still not CDS) |
| **Phase 3** — Partner-scoped evidence depth for the locked question | **Done** (ADA / immunogenicity, serology tension, RF LOINC, MTX combo; competing explanations filled) |
| **Phase 4** — HSI Neon `red-wave` readiness | **Done** (HSI-owned schema stub + migrate/gate-c-local guards; never ISI/Akeno/DeliverX) |
| **Phase 5** — Pilot acceptance pack | **Done** (`hsi-pilot-acceptance.*` + `hsi-pilot-walkthrough.md`; Stage 1 four outputs + MANIFEST + gap + Gate C + rubric green; Apolo Pharma `partnerSigned` / KPIs **`partner_agreed`**; Stage 1 corpus licensing clearance applied) |
| **Phase 6** — Target R1 Discovery Centre product surface | **Done** (`site/` route `/discovery`; loads `site/public/discovery/*.json` refreshed by `bun run outputs`; ASK→MAP→REVIEW; notCds; Akeno = later) |
| Source licensing / attribution for agreed partner corpus | **Done** (Stage 1 — `oa_reuse` + `cite_metadata_pilot`; uncleared=0) |
| Success-metric numeric thresholds with partner | **Done** — Apolo Pharma operator-agreed 2026-11-01 in `src/stage1RubricThresholds.ts` (`thresholdSource=partner_agreed`, `partnerId=partner:apolo-pharma`, `replaceWithPartnerAgreedThresholds=false`; min edges 12 / competing 4 / LOINC 6; Gate C pending allowed; `green_with_pending`) |
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
