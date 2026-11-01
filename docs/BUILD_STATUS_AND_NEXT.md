# HSI build status and next

**Audit date:** 1 November 2026  
**HEAD at write:** (this commit) — Stage 1 numeric rubric thresholds **`set_for_test`** under hypothetical fixture; real partner must re-agree; `legalBinding` still false


**Edit target:** `hsi-core` only · Neon **`red-wave` only** · no immunecity / Akeno product / DeliverX edits  
**Prior audit:** [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md) (phases 0–8 vs Pilot + Target PRDs)

**Status vocabulary:** `DONE` · `PARTIAL` · `NOT STARTED` · `OUT OF SCOPE` / deferred

---

## Executive verdict

hsi-core has shipped the **Stage 1 evidence backbone** (graded edges, provenance, Gate C checklists, versioned publish, RA/anti-TNF scope lock + depth, Discovery Centre, R2 validation, translation/Akeno HITL scaffolding, Aksh agent catalog, Neon isolation, systems-vision + AI position stubs). **Vertical decision A (dual-track) is recorded:** RA stays Stage 1 `activeScope`; SSc Tfh–B–IL-21 is the PRD MVP target with a **deepened** literature slice (cell cards + CL·MONDO hints + extra PMIDs). **P1.3 gut–immune** SCFA/butyrate ↔ mucosal Treg/Th17 + **P2.1 neuroimmune** vagus / cholinergic anti-inflammatory reflex thin seeds + packs landed (`deepSeedsPresent=true`; honest `uncertain`/`hypothesized`; human VNS–RA not a clinical cure). **Model-proposal artifacts are wired into Gate C** as typed pending drafts (`autoApprove=false`). **P2.2–P3.3** embedding sidecars, offline eval, genome pointers, P3 RFC/matrix, and RDKit/OpenMM/REINVENT4/ESM thin adapter spikes are done (proposal-only; Gate C pending; no weight vendoring / PHI / CDS). **Technical adapter track is paused** (unblocked shelf covered; AF3/TDC/ISI agents still blocked; Boltz deferred). **P0.2-HSI done on the HSI side:** machine-readable ISI consume contract (`hsi-isi-consume-contract.*`) + partner flip-readiness pack (`hsi-partner-flip-readiness.*`; honest fail/pending; **`partnerSigned=false`**) + P0.3 source licensing stub (`hsi-source-licensing-stub.*`; all `licenseStatus=needs_review`). **P0.5 wiring playbook shipped (HSI side):** [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) + [`hsi-isi-wiring-spec.json`](./hsi-isi-wiring-spec.json) + [`examples/isi-consumer/`](../examples/isi-consumer/) demo client — **applying product wires still requires an immunecity repo session / freeze override**; this workspace must not edit immunecity. **Next is human:** supply a **named partner** OR apply the playbook in immunecity — further BUILD NEXT must not invent more adapter spikes. Agent runtime and live CDS stay gated.

| Plane | Light | One line |
|-------|-------|----------|
| R0–R1 substrate + `/discovery` | **GREEN** | Four outputs + ASK→MAP→REVIEW on regenerable packs |
| R2 workbench (HSI) | **GREEN / YELLOW** | Hypothesis + gaps + VALIDATE; fixture thresholds `set_for_test` (partner re-agree still required) |
| R3 translation / `/akeno` | **YELLOW** | HITL scaffolding only (`clinicalActive=false`) |
| Partner pilot readiness (M3) | **YELLOW** | Hypothetical **TEST FIXTURE** partner for path testing; `lockedPilot=false`; real named org still pending |
| Live CDS / PHI / shared Neon | **RED (correct)** | Explicitly not built |
| Vision axes / AI stubs | **GREEN** | Map + schema stubs; SSc/gut/neuro deep seeds; model→Gate C; P2.2–P3.3 shelf; **adapter track paused** |
| ISI consume handoff (HSI side) | **GREEN** | **P0.2-HSI** contract + **P0.5** playbook/wiring-spec/example client — product apply still OUT OF REPO |
| Vertical strategy | **GREEN** | **A dual-track** written — `verticalStrategy=dual_track` |

---

## 1. Built now

### 1.1 Substrate (evidence core)

| Item | Status | Evidence |
|------|--------|----------|
| Schema + grades (`established` / `uncertain` / `unexplored`) + dual axes | **DONE** | `src/schema.ts`, `src/grades.ts` |
| T2D / immuno-metabolic seeds + LOINC markers | **DONE** | `src/seed/t2dImmunoMetabolic.ts`, `src/markers.ts` |
| Validation + gap report | **DONE** | `src/validate.ts`, `src/gapReport.ts`; `bun run validate` / `gap-report` |
| ISI export + REL suggestion map (`autoApproveIntoKg=false`) | **DONE** | `src/exportIsi.ts`, `src/mappings/isiRelSuggestions.ts` |
| Aksh node map + HITL stubs (`cdsSurfacable=false`) | **DONE** | `src/akshHitl.ts`, `src/mappings/aksh*.ts` |
| Gate C checklist (pending only) | **DONE** | `src/gateCChecklist.ts` → `gate-c-checklist.*` (+ translation + **modelProposals**) |
| Versioned `bun run outputs` + MANIFEST + site refresh | **DONE** | `src/publishOutputs.ts`, [`OUTPUTS.md`](./OUTPUTS.md) |
| Immune-cell spine vocabulary + PRD relation types | **DONE** (vocab) | `src/immuneCellSpine.ts` |
| Systems multi-axis stubs (gut / neuro / DTB / patient plane / P3) | **DONE** (vocab) | `src/systemsAxes.ts` → `hsi-systems-vision.json` |
| AI / NN position + model-proposal / embedding / eval / genome-pointer / P3 license / RDKit + OpenMM + REINVENT4 + ESM spikes | **DONE** (adapter track **paused**) | [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md); `aiFutureTech`; P1.5–P3.3 artifacts as before |
| ISI consume contract + partner flip-readiness (P0.2-HSI) | **DONE** | `src/isiConsumeContract.ts` → `hsi-isi-consume-contract.*`; `src/partnerFlipReadiness.ts` → `hsi-partner-flip-readiness.*`; fixture may set `partnerSigned` under `hypothetical_test_only` |
| ISI/immunecity wiring playbook (P0.5 HSI-side) | **DONE** | [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md); [`hsi-isi-wiring-spec.json`](./hsi-isi-wiring-spec.json) (+ discovery copy); [`examples/isi-consumer/`](../examples/isi-consumer/); **product wiring = OUT OF REPO** |
| Source licensing stub (P0.3) | **PARTIAL** | `src/sourceLicensingStub.ts` → `hsi-source-licensing-stub.*`; all rows `needs_review` until partner |
| Package scripts | **DONE** | `test`, `outputs`, `db:migrate`, `db:gate-c-local`, `site:dev` / `site:build` |

### 1.2 Stage 1 packs (pilot R0–R1)

| Item | Status | Evidence |
|------|--------|----------|
| Partner lock schema + RA/anti-TNF `scopeLocked=true` | **DONE** | `src/partnerLock.ts` → `hsi-partner-lock.json` |
| Vertical decision A dual-track | **DONE** | `src/verticalDecision.ts` → `hsi-vertical-decision.json`; lock + systems vision fields |
| SSc Tfh–B–IL-21 literature slice + cell cards | **DONE** (P1.1 deepen) | `sscTfhBIl21` + `sscCellCards` → `hsi-ssc-pathway-pack.*`; CL·MONDO hints; extra PMIDs; EBV hypothesized; RA untouched |
| Four workflow outputs (evidence map, entity slice, competing explanations, expert shortlist) | **DONE** | `src/pilotEvidencePack.ts` → `hsi-pilot-evidence-pack.*` |
| Phase 3 RA/TNF evidence depth (ADA, serology, RF LOINC, MTX combo) | **DONE** | Pack + seeds; commit `e2612dc` |
| Review rubric + acceptance + walkthrough | **DONE** | `hsi-pilot-review-rubric.*`, `hsi-pilot-acceptance.*`, `hsi-pilot-walkthrough.md` |
| `partnerSigned` / `lockedPilot` | **PARTIAL** | Fixture: `partnerSigned=true` + `agreementKind=hypothetical_test_only` + `legalBinding=false` → `lockedPilot=false`; swap via `src/hypotheticalPartnerFixture.ts` |
| Source licensing table for agreed corpus | **PARTIAL** | Stub exported (`needs_review`); partner clearance still open |
| Numeric evaluation thresholds | **PARTIAL** | Fixture `set_for_test` in `src/stage1RubricThresholds.ts` (min edges 12 / competing 4 / LOINC 6; Gate C pending allowed; `green_with_pending` OK). **Real partner must re-agree** (`replaceWithPartnerAgreedThresholds=true`) |
| PDF/DOCX brief | **OUT OF SCOPE** | ISI product P1 |

### 1.3 Discovery Centre (site)

| Item | Status | Evidence |
|------|--------|----------|
| `/discovery` ASK → MAP → REVIEW → VALIDATE → TRANSLATE | **DONE** | `site/src/pages/DiscoveryCentre.tsx` |
| Loads regenerable packs from `site/public/discovery/` | **DONE** | Refreshed by `bun run outputs` |
| `notCds` / research-only banners | **DONE** | Hard copy in UI + MANIFEST |
| Vision / marketing site routes | **DONE** | `/`, `/systems`, `/evidence`, `/for-isi`, `/for-aksh`, `/roadmap`, `/alignment`, `/docs` |
| Full ISI product Discovery (immunecity) | **OUT OF SCOPE** | Consumer only |
| Interactive multi-TA disease switcher as validated | **NOT STARTED** | SLE/PsO/IBD illustrative only |

### 1.4 R2 validation

| Item | Status | Evidence |
|------|--------|----------|
| Hypothesis cards + ranked gaps + literature tests | **DONE** | `src/r2Validation.ts` → `hsi-r2-validation.*` |
| Discovery **VALIDATE** tab | **DONE** | DiscoveryCentre |
| Partner-agreed numeric thresholds | **PARTIAL** | Fixture cut-offs set (`set_for_test`); partner re-agree still required |
| Molecular / omics adapters | **OUT OF SCOPE** | Stage 2+ / P3 |

### 1.5 Translation / Akeno

| Item | Status | Evidence |
|------|--------|----------|
| Translation handoff pack + Gate C `translationCandidates` | **DONE** | `src/translationHandoff.ts` → `hsi-translation-handoff.*` |
| Discovery **TRANSLATE** tab | **DONE** | DiscoveryCentre |
| In-repo `/akeno` HITL consumer | **DONE** | `src/akenoConsumer.ts`, `site/src/pages/AkenoConsumer.tsx`, `akeno/` |
| Fail-closed flags | **DONE** | `clinicalActive=false`, `clinicalUse=not_for_clinical_use`, `hitlRequired=true`, `autoApprove=false` |
| Never Akeno Neon | **DONE** | Policy + unused `AKENO_*` docs only |
| Live CDS / PHI / EHR / partner cohorts | **OUT OF SCOPE** | Correctly gated |

### 1.6 Aksh catalog + HITL maps

| Item | Status | Evidence |
|------|--------|----------|
| Durable `aksh:` node map + HITL cards | **DONE** | Exports + `src/akshHitl.ts` |
| Agent directory / register catalog (12 + 14) | **DONE** | `src/akshAgents.ts`, `aksh/agent-catalog.json`, `/aksh-agents` |
| Executable care-agent runtime / live CDS | **NOT STARTED** / **OUT OF SCOPE** | Catalog only; seeds `cdsSurfacable=false` |

### 1.7 Neon

| Item | Status | Evidence |
|------|--------|----------|
| Canonical HSI Neon documented | **DONE** | `red-wave-06625195` / `ep-restless-dew…` — [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) |
| Schema stub + migrate CLI | **DONE** | `db/migrations/001_hsi_substrate.sql`, `bun run db:migrate` |
| Host guards refuse ISI/Akeno/DeliverX | **DONE** | `src/db/neonGuard.ts` |
| Gate C local pending upsert | **DONE** | `bun run db:gate-c-local` |
| Gate C **approve** into ISI product Neon | **OUT OF SCOPE** | Human-only in `autumn-snow` |
| Shared evidence DB with immunecity | **OUT OF SCOPE** / forbidden | AGENTS.md + Neon map |

### 1.8 Vision / AI docs (program of work landed)

| Doc / artifact | Status | Role |
|----------------|--------|------|
| [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md) | **DONE** | Hub/spoke portfolio; DeliverX ignore |
| [`OUTPUTS.md`](./OUTPUTS.md) | **DONE** | Publish contract + Stage 1 checklist |
| [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md) | **DONE** | Phases 0–8 vs Pilot/Target |
| Pilot / Target / Blueprint / Whole-immune / Business / Discovery-site alignments | **DONE** | Under `docs/ISI_*` |
| [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md) + `hsi-systems-vision.json` | **DONE** | Multi-axis target graph |
| [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md) | **DONE** | NN proposers vs KG; hard bans |
| [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md) / [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md) | **DONE** | Consumer / catalog honesty |
| This file | **DONE** | Current status + next backlog |

### Phase ↔ commit trail (program of work)

| Phase / slice | Commit (short) |
|---------------|----------------|
| Substrate + publish | `712e2f3` … `27a6177` era |
| Neon isolation | `53e2aee`, `edad4b4` |
| Pilot PRD pack | `b4776bc` |
| 1b → 2 scope lock RA/TNF | `3cc80af`, `5c2dc15` |
| 3 Evidence depth | `e2612dc` |
| 4 Neon migrations | `e8c1c9d` |
| 5 Acceptance + walkthrough | `7cd08a8` |
| 6 `/discovery` | `3c1106b` |
| 7 R2 validation | `60877d2` |
| 8 Translation handoff | `f3d43a3` |
| Akeno HITL consumer | `84d8496` |
| PRD implementation audit | `02d8ba1` |
| Aksh agent catalog | `e46b3de` |
| Blueprint + whole-immune alignments | `357a8e9`, `d537b8b` |
| Systems vision stubs | `0ccfb01` |
| AI / neural position | `566005c` |
| Dual-track A + SSc first slice | `e68e8bf` |
| P1 SSc deepen + model→Gate C | `c2fd6f3` |
| P1.3 gut–immune SCFA ↔ Treg/Th17 | `974533a` |
| P2.1 neuroimmune vagus / cholinergic | `7e1baf8` |
| P2.2 embedding sidecars (hash/ref) | `3f8c4aa` |
| P2.3 offline eval harness stubs | `35c05fe` |
| P2.4 ClinVar / TCGA pointers | `13c8a5b` |
| P2.5 P3 adapter RFC + license matrix | `6aee2ea` |
| P3.0 RDKit thin adapter spike | `81ec446` |
| P3.1 OpenMM thin adapter spike | `2233af1` |
| P3.2 REINVENT4 thin adapter spike | `14f8412` |
| P3.3 FAIR ESM-2 thin embedding stub | `1c22662` |
| P0.2-HSI ISI consume + partner flip-readiness (+ P0.3 licensing stub) | `6b4779e` |

Reproduce: `bun test && bun run outputs && bun run site:dev` → `/discovery`, `/akeno`, `/aksh-agents`.

---

## 2. Honest gaps

| Gap | Why it matters | Owner |
|-----|----------------|-------|
| **`lockedPilot=false` / fixture partner only** | Blocks real Pilot M0 exit + M3 partner run; fixture ≠ MoU | Outreach (user) + swap `src/hypotheticalPartnerFixture.ts` |
| **SSc-vs-RA vertical conflict** | Resolved as **A dual-track** | Recorded in `verticalDecision.ts` / partner lock / systems vision |
| **Named real partner not chosen** | Fixture + outreach categories only; no invented contacts | Outreach |
| **Licensing / rights pack** | Pilot data-rights gate | Stub landed (`hsi-source-licensing-stub.*`); promote beyond `needs_review` with partner |
| **Numeric success thresholds** | Fixture cut-offs `set_for_test` only — not partner-agreed KPIs | Real partner must re-agree; then flip `thresholdSource=partner_agreed` |
| **Neuroimmune claim seeds** | **DONE (P2.1)** vagus / cholinergic anti-inflammatory reflex pack | Optional further neighbourhood (microglia/BBB) later; VNS–RA stays hypothesized |
| **Gut–immune claim seeds** | **DONE (P1.3)** SCFA ↔ mucosal Treg/Th17 pack | Optional further depth later; Th17 frames stay hypothesized |
| **SSc pack depth** | P1.1 cell cards + extra PMIDs landed; still not a full atlas | Optional further neighbourhood edges later |
| **Immune spine = vocabulary + SSc hints** | Full atlas / confirmed ontology bind still open; SSc neighbourhood has `hint_only` CL·MONDO | Stage 2 depth beyond SSc |
| **Model→Gate C** | **DONE (P1.5)** pending drafts only; no agent runtime | Never auto-approve; ISI runtime out of repo |
| **Embedding sidecars** | **DONE (P2.2)** hash/ref slots on sample edges | Never set grades; no weights / PHI; packs remain authority |
| **Offline eval harness** | **DONE (P2.3)** stub runner vs frozen packs | No training / PHI; fail-closed clinical claims; packs remain authority |
| **ClinVar / TCGA pointers** | **DONE (P2.4)** citation/ref shelf (`hsi-external-genome-pointers.json`) | No bulk dump / PHI; `reviewRequired`; Gate C still required; does not set `hsiGrade` |
| **P3 adapter RFC + licenses** | **DONE (P2.5)** RFC + matrix (`docs/P3_ADAPTER_RFC.md`; `hsi-p3-adapter-license-matrix.*`) | No weight vendoring; honest `signOffStatus`; blocked adapters still refused |
| **P3.0 RDKit spike** | **DONE** thin proposal-only adapter (`hsi-rdkit-adapter-proposals.*`; `runtime: stub|rdkit`) | Gate C pending only; no grade flips / PHI / CDS / weights |
| **P3.1 OpenMM spike** | **DONE** thin proposal-only adapter (`hsi-openmm-adapter-proposals.*`; `runtime: stub|openmm`; cites NI-003 / GUT-003) | Gate C pending only; MD ≠ evidence alone; no grade flips / PHI / CDS / weights |
| **P3.2 REINVENT4 spike** | **DONE** thin proposal-only adapter (`hsi-reinvent4-adapter-proposals.*`; `runtime: stub|reinvent`; cites RA-012 / GUT-003) | Gate C pending only; never clinic path; no grade flips / PHI / CDS / multi-GB weights; Boltz deferred |
| **P3.3 FAIR ESM-2 stub** | **DONE** thin embedding stub (`hsi-esm-adapter-proposals.*`; `runtime: stub|esm`; cites RA-001 / GUT-003; sidecar overlays) | Gate C pending only; hash/ref only; no grade flips / PHI / CDS / weight vendoring; Boltz deferred |
| **No agent runtime** | Aksh catalog + ISI 12-agent blueprint ≠ executable loop | ISI product **out of repo**; HSI holds shapes only |
| **No PHI / no live CDS** | Correct non-goal — do not “close” by building clinic features | Policy |
| **ISI product still thin** | `/discovery` is HSI demo; immunecity RBAC/search/graph UX not built here | **Out of repo** (immunecity) |
| **Akeno clinical product** | In-repo HITL ≠ akenohealth Neon dashboard / prospective CDS | **Out of repo** |
| **FR/AC product gaps** | Full-text search, interactive KG, PDF, feedback, trial browser | Mostly ISI product / P1 |
| **Ontology bind** | LOINC on markers only | Later |

---

## 3. Build next (hsi-core only)

One-sprint-sized items. Mark **[DECISION]** where the user must choose before code. Mark **[OUT-OF-REPO]** where work belongs elsewhere (track only).

### P0 — unblock partner pilot (this quarter)

| # | Item | Notes |
|---|------|-------|
| P0.1 | **[DONE]** Vertical **A dual-track** recorded | `verticalStrategy=dual_track`, `activeScope=ra-tnf`, `prdMvpTarget=ssc-tfh-b-il21`; SSc first slice + pack published |
| P0.2 | **[DONE on HSI side / WAITING HUMAN]** Named partner + flip-readiness pack | **P0.2-HSI done:** flip-readiness + **hypothetical TEST FIXTURE** (`test:hypothetical-isi-pilot-partner`; `satisfied_by_fixture` for named_org). Real `legalBinding` / `lockedPilot` only after written confirm — **never invent org/email**. **Next = user supplies real partnerNamed** |
| P0.3 | **[PARTIAL]** Rights / licensing stub for RA/SSc/gut/neuro PMID set | `hsi-source-licensing-stub.*` — all `licenseStatus=needs_review`; promote after partner agree |
| P0.4 | **[PARTIAL]** Numeric thresholds on review rubric | Fixture numbers wired (`set_for_test` / `thresholdSource=hypothetical_test_fixture`). **Real partner must re-agree** before formal user testing; then refresh exports |
| P0.5 | **[DONE on HSI side / OUT-OF-REPO for product]** ISI consume contract + **wiring playbook** | Contract maps MANIFEST/grades/Gate C/Discovery. **Playbook shipped:** [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) + `hsi-isi-wiring-spec.json` + `examples/isi-consumer/`. **Applying wires = immunecity session / freeze override** — do not edit immunecity from this workspace |
| P0.6 | Keep exports stable; refresh walkthrough after partner wording changes | `bun run outputs` discipline |

### P1 — deepen evidence / spine (after P0.1 clarity)

| # | Item | Notes |
|---|------|-------|
| P1.1 | **DONE:** deepen SSc pack — cell-card / CL·MONDO *hints* on Tfh–B–IL-21 neighbourhood; additional public PMIDs (29626172, 37763102) | `sscCellCards.ts` + pack; RA packs regenerable; EBV hypothesized |
| P1.2 | **DONE (first slice):** thin SSc Tfh–B–IL-21 pack (verified PMIDs; EBV `hypothesized`); RA intact | `hsi-ssc-pathway-pack.*`; do not delete RA claim ids |
| P1.3 | **DONE:** Deepen one **gut–immune** neighbourhood (SCFA/butyrate ↔ mucosal Treg/Th17 + barrier) with honest `uncertain`/`hypothesized` grades | `seed/gutScfaMucosal.ts` + `hsi-gut-immune-pack.*`; Discovery secondary axis; RA/SSc untouched |
| P1.4 | Promote selected systems / ISI predicates onto `HSI_EDGE_TYPES` when first-class gut predicates are needed | Additive map; gut pack currently maps via `SYSTEMS_PREDICATE_TO_HSI_EDGE` |
| P1.5 | **DONE:** wire **ModelProposalArtifact** → Gate C checklist *draft rows* (`modelProposals`; `autoApprove=false`) | `src/modelProposal.ts`; never flips `hsiGrade` |
| P1.6 | Curator UX inside hsi-core after pilot learning (richer gap/Gate C markdown) | P2 in vision doc; only after partner session |

### P2 — later / gated substrate

| # | Item | Notes |
|---|------|-------|
| P2.1 | **DONE:** Neuroimmune thin seed slice — vagus / cholinergic anti-inflammatory reflex | `seed/neuroVagusCholinergic.ts` + `hsi-neuroimmune-pack.*`; Discovery secondary; RA/SSc/gut untouched; no clinical cure claim |
| P2.2 | **DONE:** Embedding sidecar slots on edges (hash/ref only; no model stack) | `src/embeddingSidecar.ts` → `hsi-embedding-sidecars.json`; `doesNotSetHsiGrade=true`; Gate C note; packs remain authority |
| P2.3 | **DONE:** Offline eval harness stubs against public packs | `src/modelEvalHarness.ts` → `hsi-model-eval-harness.*`; `MODEL_EVAL_HARNESS_STUB.status=wired_offline_stub`; no PHI / no training |
| P2.4 | **DONE:** ClinVar / TCGA **pointer** metadata fields | `src/externalGenomePointers.ts` → `hsi-external-genome-pointers.json`; `reviewRequired=true`; citation/ref only; no bulk dump / PHI; does not set `hsiGrade` |
| P2.5 | **DONE:** P3 adapter RFC + license matrix (TDC / AF3 / Boltz / ESM / OpenMM / RDKit / REINVENT4 / ISI agents) | [`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md); `src/p3AdapterLicenseMatrix.ts` → `hsi-p3-adapter-license-matrix.*`; honest sign-off; no weight vendoring |
| P3.0 | **DONE:** RDKit thin adapter spike (proposal-only) | `src/adapters/rdkitAdapter.ts` + `src/p3AdapterGate.ts` → `hsi-rdkit-adapter-proposals.*`; `runtime: stub|rdkit`; license gate; Gate C pending; eval harness case; partner P0.2 parallel |
| P3.1 | **DONE:** OpenMM thin adapter spike (proposal-only) | `src/adapters/openmmAdapter.ts` → `hsi-openmm-adapter-proposals.*`; `runtime: stub|openmm`; cites `HSI-E-NI-003` / `HSI-E-GUT-003`; Gate C pending; eval `EVAL-PASS-OPENMM-ACH-001`; partner P0.2 parallel |
| P3.2 | **DONE:** REINVENT4 thin adapter spike (proposal-only) | `src/adapters/reinvent4Adapter.ts` → `hsi-reinvent4-adapter-proposals.*`; `runtime: stub|reinvent`; cites `HSI-E-RA-012` / `HSI-E-GUT-003`; Gate C pending; eval `EVAL-PASS-REINVENT4-MTX-001`; never clinic path; Boltz deferred |
| P3.3 | **DONE:** FAIR ESM-2 thin embedding stub (proposal + sidecar refs) | `src/adapters/esmAdapter.ts` → `hsi-esm-adapter-proposals.*`; `runtime: stub|esm`; cites `HSI-E-RA-001` / `HSI-E-GUT-003`; overlays `hsi-embedding-sidecars.json`; Gate C pending; eval `EVAL-PASS-ESM2-TNF-001`; no weight vendoring; Boltz deferred |
| P0.2-HSI | **DONE:** ISI consume contract + partner flip-readiness (+ P0.3 licensing stub) | `hsi-isi-consume-contract.*` · `hsi-partner-flip-readiness.*` · `hsi-source-licensing-stub.*`; fixture partner path-testing; adapter track **paused** |
| P0.5-WIRING | **DONE (playbook shipped):** out-of-repo immunecity wiring package inside hsi-core | Playbook + wiring-spec + `examples/isi-consumer/` demo; **product apply still OUT OF REPO / freeze** |
| **NEXT** | **Human partnerNamed OR apply playbook in immunecity** | Do **not** invent more adapter spikes. Open an immunecity session to wire screens; freeze still blocks immunecity edits from this workspace. |

### Out-of-repo (track; do not implement here)

| Item | Where |
|------|--------|
| ISI product UI (search, interactive KG, RBAC, Ask/Radar deploy) | immunecity — **[OUT-OF-REPO]** — follow [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) |
| Apply HSI artifact wires in immunecity | immunecity session / freeze override — **[OUT-OF-REPO]** (playbook already in hsi-core) |
| ISI 12-agent research workbench runtime | ISI product — **[OUT-OF-REPO]** |
| Gate C approve+supports writes | ISI Neon `autumn-snow` — **[OUT-OF-REPO]** |
| Akeno clinical / PHI / prospective CDS / multi-AMC | akenohealth etc. — **[OUT-OF-REPO]** |
| Live Aksh care-agent loop / EHR | Aksh apps — **[OUT-OF-REPO]** |
| PDF/DOCX brief renderer | ISI P1 if partner asks — **[OUT-OF-REPO]** |

---

## 4. Do not build yet

| Do not | Why |
|--------|-----|
| **Live CDS / diagnosis / dosing / EHR write-back** | Pilot + Target non-goals; Akeno flags forbid |
| **Shared Neon** between HSI and immunecity / Akeno / DeliverX | Isolation binding — [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) |
| **DeliverX / swift-deliveries** sync or HITL pattern reuse | **Ignore** entirely |
| **Molecular adapters mega-stack** (AF3, Boltz, TDC) | RFC + matrix landed (P2.5); RDKit P3.0 + OpenMM P3.1 + REINVENT4 P3.2 + FAIR ESM-2 P3.3 spikes are proposal-only (ESM also emits sidecar refs); Boltz/AF3/TDC still deferred or blocked; weights still never vendored |
| **Silent SSc pivot** that wipes RA seeds | Needs A/B/C decision |
| **Invent a legal MoU / named PI email / invented PMIDs** (fixture partnerSigned under `hypothetical_test_only` is allowed with loud banners) | Honesty invariants |
| **Agent runtime / orchestrator in hsi-core** | Catalog + shapes only; runtime = ISI |
| **Auto Gate C / model flips `hsiGrade`** | Hard ban in AI position paper |
| **PHI / identifiable sequences in `red-wave`** | Patient plane Stage 3+ elsewhere |
| **Vendor ChatGPT Discovery HTML / Lovable Akeno marketing as product** | Reference-only |
| **ImmPort / GEO / HCA / CT.gov connectors as Stage 1 code** | Blueprint later; not Stage 1 |
| **Digital twins / quantum / federated / closed-loop dosing claims** | Marketing ≠ substrate |

---

## 5. Definition of done (near-term)

| Goal | Done when |
|------|-----------|
| Partner pilot ready (HSI side) | Real `legalBinding=true` + `lockedPilot=true` + rights table + numeric thresholds + walkthrough refreshed + four outputs still green (fixture replaced) |
| Dual-track honesty | **A recorded**; SSc pack present without deleting RA; ASK stays RA |
| Systems vision honesty | Gut P1.3 + neuro P2.1 deep seeds present; human VNS–RA hypothesized only |
| SSc deepen + model→Gate C | Cell cards + CL·MONDO hints + extra PMIDs; Gate C `modelProposals` pending only |
| Embedding sidecars honesty | P2.2 hash/ref only; `doesNotSetHsiGrade`; no weights/PHI; RA/SSc/gut/neuro packs remain evidence authority |
| Offline eval honesty | P2.3 frozen-pack checks only; `mayUseLivePhi=false`; fail-closed clinical/PHI; never flips grades / auto-approves |
| Genome pointer honesty | P2.4 accession/URL/disease-gene citation only; `reviewRequired`; no bulk dump / PHI; never sets `hsiGrade` |
| P3 adapter honesty | P2.5 RFC + matrix; `emitsModelProposalOnly`; `vendorsModelWeights=false`; honest `signOffStatus`; refuse run while `blockedUntilSignOff` |
| P3.0 RDKit honesty | Proposal-only; `runtime: stub|rdkit`; Gate C pending; `autoApprove=false`; does not set `hsiGrade`; no PHI / CDS / fake `partnerSigned` |
| P3.1 OpenMM honesty | Proposal-only; `runtime: stub|openmm`; Gate C pending; MD ≠ Gate C evidence alone; `autoApprove=false`; does not set `hsiGrade`; no PHI / CDS / fake `partnerSigned` |
| P3.2 REINVENT4 honesty | Proposal-only; `runtime: stub|reinvent`; Gate C pending; never clinic recommendation path; `autoApprove=false`; does not set `hsiGrade`; no PHI / CDS / multi-GB weights / fake `partnerSigned` |
| P3.3 FAIR ESM-2 honesty | Proposal + embedding sidecar refs; `runtime: stub|esm`; Gate C pending; hash/ref only; `autoApprove=false`; does not set `hsiGrade`; no PHI sequences / CDS / weight vendoring / fake `partnerSigned`; Boltz deferred |
| P0.2-HSI honesty | Consume contract + flip-readiness exported; fixture may set `partnerSigned` under `hypothetical_test_only`; `lockedPilot=false`; `readyToFlipPartnerSigned=false` for real MoU; licensing stub all `needs_review`; adapter track paused |
| P0.5 wiring honesty | Playbook + wiring-spec + demo client in hsi-core; no immunecity edits; Gate C never auto-approve; Neon isolation restated |
| Safety | MANIFEST still `notCds`; `/akeno` still `clinicalActive=false`; Neon still red-wave-only |

---

## Cross-links

- Implementation audit (phases 0–8): [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md)  
- Outputs checklist: [`OUTPUTS.md`](./OUTPUTS.md)  
- Systems vision: [`HSI_SYSTEMS_VISION_MAP.md`](./HSI_SYSTEMS_VISION_MAP.md)  
- AI position: [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md)  
- P3 adapter RFC: [`P3_ADAPTER_RFC.md`](./P3_ADAPTER_RFC.md)  
- Whole-immune / SSc-vs-RA: [`ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md`](./ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md)  
- Blueprint: [`ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md`](./ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md)  
- Pilot brief / PRD / shortlist: [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_PILOT_PARTNER_SHORTLIST.md`](./ISI_PILOT_PARTNER_SHORTLIST.md)  
- Akeno / Aksh: [`AKENO_IN_HSI.md`](./AKENO_IN_HSI.md), [`AKSH_AGENTS_IN_HSI.md`](./AKSH_AGENTS_IN_HSI.md)  
- Neon: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)  
- ISI/immunecity wiring (out of repo): [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md) · [`hsi-isi-wiring-spec.json`](./hsi-isi-wiring-spec.json)  
- Portfolio: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)
