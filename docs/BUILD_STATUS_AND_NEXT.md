# HSI build status and next

**Current-state update — 5 November 2026:** see the [fresh code/build audit](audits/HSI_BUILD_AUDIT_2026-11-05.md) and [phased delivery plan](strategy/HSI_PHASED_BUILD_PLAN.md). The dated GREEN/DONE labels below describe historical scoped milestones, not current end-to-end production readiness.

**Delivery Phase A implementation:** [Connected create/list/reopen workspace](PHASE_A_INVESTIGATION_WORKSPACE.md) is implemented and locally verified. Live Neon acceptance remains pending the paused access prerequisite; no production writes were enabled.

**Delivery Phase B implementation:** [Evidence/source readiness catalogue](PHASE_B_EVIDENCE_AND_SOURCE_READINESS.md) includes 5 publications, 7 unreviewed candidates and 8 imported passages, with unresolved rights/context/scientific gates visible. No candidate was approved or published.

**Audit date:** 2 November 2026  
**HEAD at write:** (post partner-honesty fix) — restored **TEST FIXTURE** partner (`lockedPilot=false`); real named partner **TBD**; prior Apolo `legal_mou` / operator-assert MoU path **revoked**; Stage 1 RA/TNF scope still locked; cite-ready path after Gate C remains; not CDS


**Edit target:** `hsi-core` primary · immunecity HSI-consume wiring allowed under freeze lift · Neon **`red-wave` only** for HSI · no DeliverX  
**Prior audit:** [`PRD_IMPLEMENTATION_AUDIT.md`](./PRD_IMPLEMENTATION_AUDIT.md) (phases 0–8 vs Pilot + Target PRDs)

**Status vocabulary:** `DONE` · `PARTIAL` · `NOT STARTED` · `OUT OF SCOPE` / deferred

---

## Executive verdict

hsi-core has shipped the **Stage 1 evidence backbone** (graded edges, provenance, Gate C checklists, versioned publish, RA/anti-TNF scope lock + depth, Discovery Centre, R2 validation, translation/Akeno HITL scaffolding, Aksh agent catalog, Neon isolation, systems-vision + AI position stubs). **Vertical decision A (dual-track) is recorded:** RA stays Stage 1 `activeScope`; SSc / gut / neuro packs have **depth PMIDs** (honest `uncertain`/`hypothesized`; RA untouched). **Real named partner still TBD** — active lock is the hypothetical test fixture (`lockedPilot=false`; `agreementKind=hypothetical_test_only`). A prior Apolo Pharma `lockedPilot=true` / operator-assert MoU path was **revoked 2026-11-02** as non-MoU. Stage 1 RA/TNF scope remains locked; fixture KPIs `set_for_test`; curator PMID reviews retained without partner corpus clearance; still not CDS; Gate C never auto-approves. **P1.4** promotes selected gut/neuro/ISI predicates onto `HSI_EDGE_TYPES` (additive; alias maps kept for remainder). **P1.6** curator UX scaffolding ships richer gap/Gate C markdown + `hsi-curator-ux.*` + site `/curator`. **P1.7** ships honest Gate C decisions dry-run / import envelope + `examples/gate-c-decisions/*` (empty awaiting + hypothetical schema fixture; never fake Apolo production approvals). **P1.8** Stage 2 spine starters add CL `hint_only` binds beyond SSc (RA untouched). **P2.2–P3.3** plus **AF3/TDC/ISI research sign-off fixtures** and **Boltz weights-policy gate** (`WEIGHTS_POLICY_ACK`; no weight vendoring) land as proposal-only stubs → Gate C pending. **Discovery `/discovery` MAP** ships an interactive evidence **graph explorer**. **P0.5** immunecity Gate C human queue shipped (`090d7ea`). **P2.1** operator-authorized Gate C human decisions (13 mapped REL handoffs → autumn-snow `human_approved` + curator-ux `decisions_imported`; operator identity, not forged Apolo signatures). **P2.2-ISI** cite-ready queue + 13 unreviewed autumn-snow evidence seeds (Check→supports→Approve still human; never auto-approve). Live CDS / PHI / commercial AF3 rights stay gated.

| Plane | Light | One line |
|-------|-------|----------|
| R0–R1 substrate + `/discovery` | **GREEN** | Four outputs + ASK→MAP→REVIEW on regenerable packs |
| R2 workbench (HSI) | **GREEN** | Hypothesis + gaps + VALIDATE; Stage 1 KPIs `set_for_test` (fixture); real partner TBD |
| R3 translation / `/akeno` | **YELLOW** | HITL scaffolding only (`clinicalActive=false`) |
| Partner pilot readiness (M3) | **YELLOW** | Scope locked RA/TNF; **fixture partner only** (`lockedPilot=false`); real named partner **TBD**; partner corpus clearance not applied |
| Live CDS / PHI / shared Neon | **RED (correct)** | Explicitly not built |
| Vision axes / AI stubs | **GREEN** | SSc/gut/neuro depth; graph explorer; AF3/TDC/ISI fixtures + Boltz weights policy; all adapters proposal-only |
| ISI consume handoff (HSI side) | **GREEN** | **P0.2-HSI** contract + **P0.5** playbook + immunecity Gate C human queue (`090d7ea`) — still human-only |
| Partner walkthrough / exports (P0.6) | **GREEN** | Walkthrough/acceptance regenerable on scope-locked RA/TNF + fixture banners; `lockedPilot=false`; real partner TBD |
| Curator UX (P1.6) | **GREEN** | Richer gap/Gate C markdown + `hsi-curator-ux.*` + `/curator`; awaiting partner review session; no invented decisions / no grade flips |
| Gate C decisions tooling (P1.7) | **GREEN** | Dry-run + empty/hypothetical `--decisions` envelopes; `hypothetical_fixture_imported` ≠ production Apolo |
| Immune spine Stage 2 starters (P1.8) | **GREEN** | CL ids on spine; P2.0 confirms high-confidence core |
| Neighbourhood depth (P1.9) | **GREEN** | Neuro microglia/BBB + gut SFB/AhR + SSc vascular/fibrosis; honest uncertain/hypothesized; RA untouched |
| Ontology binds (P2.0) | **GREEN** | 18 spine + SSc Tfh/B/plasmablast/MONDO `curator_confirmed` (OLS); not Gate C / not CDS |
| Gate C human session (P2.1) | **GREEN** | Operator-authorized approve ×13 on autumn-snow; curator-ux `decisions_imported`; operator identity ≠ partner MoU |
| Cite path after Gate C (P2.2-ISI) | **GREEN** | immunecity cite-ready queue + 13 `unreviewed`/`unassessed` evidence seeds; Check→supports→Approve still human; `autoApprove=false` |
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
| Immune-cell spine vocabulary + PRD relation types | **DONE** (vocab + P1.8 CL hints) | `src/immuneCellSpine.ts` — `ontologyBindStatus=hint_only` Stage 2 starters |
| Systems multi-axis stubs (gut / neuro / DTB / patient plane / P3) | **DONE** (vocab) | `src/systemsAxes.ts` → `hsi-systems-vision.json` |
| AI / NN position + P3 license + RDKit/OpenMM/REINVENT4/ESM/AF3/TDC/Boltz/ISI-agents spikes | **DONE** | [`HSI_AI_NEURAL_FUTURE_HEALTHCARE.md`](./HSI_AI_NEURAL_FUTURE_HEALTHCARE.md); [`P3_WEIGHTS_AND_LICENSE_POLICY.md`](./P3_WEIGHTS_AND_LICENSE_POLICY.md); research sign-off fixtures; no weight vendoring |
| Discovery interactive graph explorer | **DONE** | `/discovery` MAP — nodes/edges from pack JSON; grade coloring; click → evidence card; not-diagnostic banners |
| ISI consume contract + partner flip-readiness (P0.2-HSI) | **DONE** | `src/isiConsumeContract.ts` → `hsi-isi-consume-contract.*`; `src/partnerFlipReadiness.ts` → `hsi-partner-flip-readiness.*`; fixture may set `partnerSigned` under `hypothetical_test_only` |
| ISI/immunecity wiring playbook (P0.5 HSI-side) | **DONE** | [`ISI_IMMUNICITY_WIRING_PLAYBOOK.md`](./ISI_IMMUNICITY_WIRING_PLAYBOOK.md); [`hsi-isi-wiring-spec.json`](./hsi-isi-wiring-spec.json) (+ discovery copy); [`examples/isi-consumer/`](../examples/isi-consumer/); **immunecity freeze lifted 2026-11-01 for HSI-consume wiring only** |
| Source licensing stub (P0.3) | **DONE** (curator + Apolo clearance) | `src/sourceLicensingStub.ts` → reviewed statuses + `partnerCleared` / `clearanceScope` (2026-11-01); pack uncleared=0 (`ok_cite` for former unknowns) |
| Package scripts | **DONE** | `test`, `outputs`, `curator-ux`, `db:migrate`, `db:gate-c-local`, `site:dev` / `site:build` |
| Curator UX (P1.6) | **DONE** | `src/curatorUx.ts` → `hsi-curator-ux.*` + richer `hsi-gap-report.md` / `gate-c-checklist.md`; site `/curator`; awaiting partner session when `decisions=[]` |
| Gate C decisions dry-run / fixtures (P1.7) | **DONE** | `src/gateCDecisionsImport.ts` + `examples/gate-c-decisions/*`; CLI `--dry-run` / `--export-template` / `--write-hypothetical-fixture`; refuses `productionApproved=true` / autoApprove / grade flip |
| Immune spine CL starters (P1.8) | **DONE** | `ontologyBindStatus=hint_only` + CL ids on class/lineage/subset spine nodes; RA Stage 1 untouched |
| Neighbourhood depth (P1.9) | **DONE** | Neuro NI-012..016 microglia/BBB; gut GUT-013/014 SFB+AhR; SSc SSC-016/017 vascular+fibrosis; licensing stubs; RA untouched |
| Ontology binds (P2.0) | **DONE** | `curator_confirmed` for 18 spine CL ids + SSc core CL/MONDO; myeloid/ILC/mast + subset frames stay `hint_only`; does not set `hsiGrade` |
| Gate C human session (P2.1) | **DONE** | Operator-authorized `operator_authorized_export` (13 approve); ISI autumn-snow upsert; curator-ux/site merge; `productionApproved=false`; no grade flip |

### 1.2 Stage 1 packs (pilot R0–R1)

| Item | Status | Evidence |
|------|--------|----------|
| Partner lock schema + RA/anti-TNF `scopeLocked=true` | **DONE** | `src/partnerLock.ts` → `hsi-partner-lock.json` |
| Vertical decision A dual-track | **DONE** | `src/verticalDecision.ts` → `hsi-vertical-decision.json`; lock + systems vision fields |
| SSc Tfh–B–IL-21 literature slice + cell cards | **DONE** (P1.1 deepen) | `sscTfhBIl21` + `sscCellCards` → `hsi-ssc-pathway-pack.*`; CL·MONDO hints; extra PMIDs; EBV hypothesized; RA untouched |
| Four workflow outputs (evidence map, entity slice, competing explanations, expert shortlist) | **DONE** | `src/pilotEvidencePack.ts` → `hsi-pilot-evidence-pack.*` |
| Phase 3 RA/TNF evidence depth (ADA, serology, RF LOINC, MTX combo) | **DONE** | Pack + seeds; commit `e2612dc` |
| Review rubric + acceptance + walkthrough | **DONE** (P0.6) | `hsi-pilot-review-rubric.*`, `hsi-pilot-acceptance.*`, `hsi-pilot-walkthrough.md` — Apolo named lock + clearance + `lockedPilot` copy |
| `partnerSigned` / `lockedPilot` | **DONE** (fixture honesty) | Fixture: `partnerSigned=true` under `hypothetical_test_only`; `legalBinding=false` → `lockedPilot=false`. Real partner TBD. Prior Apolo MoU path revoked 2026-11-02 |
| Source licensing table for agreed corpus | **PARTIAL** (curator review only) | PMID curator statuses retained; partner corpus clearance **not** applied on fixture path (`partnerClearedCount=0`); cite-metadata ≠ FT rights |
| Numeric evaluation thresholds | **DONE** (fixture) | `set_for_test` in `src/stage1RubricThresholds.ts` (min edges 12 / competing 4 / LOINC 6; Gate C pending allowed; `replaceWithPartnerAgreedThresholds=true`; real partner must re-agree) |
| PDF/DOCX brief | **OUT OF SCOPE** | ISI product P1 |

### 1.3 Discovery Centre (site)

| Item | Status | Evidence |
|------|--------|----------|
| `/discovery` ASK → MAP → REVIEW → VALIDATE → TRANSLATE | **DONE** | `site/src/pages/DiscoveryCentre.tsx` |
| Loads regenerable packs from `site/public/discovery/` | **DONE** | Refreshed by `bun run outputs` |
| `notCds` / research-only banners | **DONE** | Hard copy in UI + MANIFEST |
| Vision / marketing site routes | **DONE** | `/`, `/systems`, `/evidence`, `/curator`, `/for-isi`, `/for-aksh`, `/roadmap`, `/alignment`, `/docs` |
| Full ISI product Discovery (immunecity) | **OUT OF SCOPE** | Consumer only |
| Interactive multi-TA disease switcher as validated | **NOT STARTED** | SLE/PsO/IBD illustrative only |

### 1.4 R2 validation

| Item | Status | Evidence |
|------|--------|----------|
| Hypothesis cards + ranked gaps + literature tests | **DONE** | `src/r2Validation.ts` → `hsi-r2-validation.*` |
| Discovery **VALIDATE** tab | **DONE** | DiscoveryCentre |
| Partner-agreed numeric thresholds | **NOT STARTED** (honest) | Fixture `set_for_test` only; real `partner_agreed` requires written partner confirm |
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
| CDS/PHI boundary lift (governance only) | **DONE** | `src/cdsPhiBoundary.ts`, [`CDS_PHI_BOUNDARY.md`](./CDS_PHI_BOUNDARY.md) — reject PHI / reject live CDS; Aksh clinic engines **OUT OF SCOPE** |
| Executable care-agent runtime / live CDS | **NOT STARTED** / **OUT OF SCOPE** | Catalog only; seeds `cdsSurfacable=false` |

### 1.7 Neon

| Item | Status | Evidence |
|------|--------|----------|
| Canonical HSI Neon documented | **DONE** | `red-wave-06625195` / `ep-restless-dew…` — [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) |
| Neon pack density (seeds → `hsi_*`) | **DONE** | `db:gate-c-local` upserts 79 claims/edges + 8 markers; Gate C reviews stay mapped-REL (~13) |
| `/discovery` product SPA (not JSON shadow) | **DONE** | UI at `/discovery`; machine `catalogue.json` + `/discovery.json`; `site/vercel.json` SPA rewrite |
| Rubric licensing vs clearance | **PARTIAL** | Fixture: `x-4` → `blocked_on_partner` until real partner clearance |
| Schema stub + migrate CLI | **DONE** | `db/migrations/001_hsi_substrate.sql`, `bun run db:migrate` |
| Host guards refuse ISI/Akeno/DeliverX | **DONE** | `src/db/neonGuard.ts` |
| Gate C local pending upsert | **DONE** | `bun run db:gate-c-local` |
| Gate C **approve** into ISI product Neon | **DONE (product)** | immunecity `090d7ea` — `/hsi/discovery` REVIEW human approve/reject/defer → `hsi_gate_c_decisions` on `autumn-snow` only; `autoApprove=false`; never flips `hsiGrade` |
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
| P1.6 curator UX (richer gap/Gate C + `/curator`) | `e6dd2be` |
| P1.7 Gate C decisions dry-run / fixtures | `922b0d6` |
| P1.8 Stage 2 spine CL hint starters | `922b0d6` |
| P1.9 SSc/gut/neuro neighbourhood depth | `f7e39d2` |
| P2.0 curator-confirmed CL/MONDO binds | `1cd360e` |
| P2.1 operator-authorized Gate C session | `353abeb` |
| P2.2-ISI cite-ready path (immunecity) | `82cc0b1` |
| Partner honesty fix (fixture restored; Apolo MoU revoked) | `d00ad06` |
| P2.3-ISI cite identifier Check (immunecity) | `dbacd47` |

Reproduce: `bun test && bun run outputs && bun run site:dev` → `/discovery`, `/curator`, `/akeno`, `/aksh-agents`.  
Decisions dry-run: `bun run curator-ux --dry-run --decisions examples/gate-c-decisions/awaiting.empty.json`.

---

## 2. Honest gaps

| Gap | Why it matters | Owner |
|-----|----------------|-------|
| **Real named partner TBD** | Fixture restored; Apolo non-MoU path revoked 2026-11-02; still not CDS | Keep walkthrough regenerable; outreach for one real pilot question |
| **SSc-vs-RA vertical conflict** | Resolved as **A dual-track** | Recorded in `verticalDecision.ts` / partner lock / systems vision |
| **Licensing / rights pack** | Stage 1 clearance done (48/48; uncleared=0) | Cite-metadata ≠ FT rights; further FT/commercial licenses still partner-gated |
| **Numeric success thresholds** | **DONE** (fixture `set_for_test` 12 / 4 / 6) | Keep pack depth ≥ cut-offs; re-agree with real partner |
| **Neuroimmune claim seeds** | **DONE (P2.1 + P1.9)** vagus / cholinergic + microglia/BBB neighbourhood | VNS–RA stays hypothesized; not MS atlas |
| **Gut–immune claim seeds** | **DONE (P1.3 + P1.9)** SCFA ↔ mucosal Treg/Th17 + SFB/AhR hops | Th17 frames stay hypothesized |
| **SSc pack depth** | **DONE (P1.1 + P1.9)** cell cards + vascular/fibrosis neighbourhood | Still not a full atlas |
| **Immune spine = vocabulary + CL binds (P1.8→P2.0)** | High-confidence core `curator_confirmed`; myeloid/ILC/mast stay `hint_only`; full atlas still open | Optional further confirmed binds; RA untouched |
| **Model→Gate C** | **DONE (P1.5)** pending drafts only; no agent runtime | Never auto-approve; ISI runtime out of repo |
| **Embedding sidecars** | **DONE (P2.2)** hash/ref slots on sample edges | Never set grades; no weights / PHI; packs remain authority |
| **Offline eval harness** | **DONE (P2.3)** stub runner vs frozen packs | No training / PHI; fail-closed clinical claims; packs remain authority |
| **ClinVar / TCGA pointers** | **DONE (P2.4)** citation/ref shelf (`hsi-external-genome-pointers.json`) | No bulk dump / PHI; `reviewRequired`; Gate C still required; does not set `hsiGrade` |
| **P3 adapter RFC + licenses** | **DONE (P2.5)** RFC + matrix (`docs/P3_ADAPTER_RFC.md`; `hsi-p3-adapter-license-matrix.*`) | No weight vendoring; honest `signOffStatus`; blocked adapters still refused |
| **P3.0 RDKit spike** | **DONE** thin proposal-only adapter (`hsi-rdkit-adapter-proposals.*`; `runtime: stub|rdkit`) | Gate C pending only; no grade flips / PHI / CDS / weights |
| **P3.1 OpenMM spike** | **DONE** thin proposal-only adapter (`hsi-openmm-adapter-proposals.*`; `runtime: stub|openmm`; cites NI-003 / GUT-003) | Gate C pending only; MD ≠ evidence alone; no grade flips / PHI / CDS / weights |
| **P3.2 REINVENT4 spike** | **DONE** thin proposal-only adapter (`hsi-reinvent4-adapter-proposals.*`; `runtime: stub|reinvent`; cites RA-012 / GUT-003) | Gate C pending only; never clinic path; no grade flips / PHI / CDS / multi-GB weights |
| **P3.3 FAIR ESM-2 stub** | **DONE** thin embedding stub (`hsi-esm-adapter-proposals.*`; `runtime: stub|esm`; cites RA-001 / GUT-003; sidecar overlays) | Gate C pending only; hash/ref only; no grade flips / PHI / CDS / weight vendoring |
| **P3.5 Boltz stub** | **DONE** weights-policy-gated stub (`hsi-boltz-adapter-proposals.*`; `WEIGHTS_POLICY_ACK`; optional `BOLTZ_WEIGHTS_CACHE`) | Gate C pending; autoApprove=false; no hsiGrade; no multi-GB weight vendoring |
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
| P0.2 | **[DONE]** Flip-readiness + consume contract (fixture honesty) | Fixture path `lockedPilot=false`; flip-readiness + consume contract regenerable; real named partner TBD — never invent MoUs from chat |
| P0.3 | **[PARTIAL]** Curator PMID review for RA/SSc/gut/neuro | `hsi-source-licensing-stub.*` — curator statuses retained; fixture keeps `partnerClearedCount=0`; cite-metadata ≠ FT |
| P0.4 | **[DONE]** Numeric thresholds on review rubric (fixture) | `thresholdSource=hypothetical_test_fixture` / `set_for_test`; `replaceWithPartnerAgreedThresholds=true`; min edges 12 / competing 4 / LOINC 6 |
| P0.5 | **[DONE]** ISI consume + immunecity Gate C human queue | Playbook + wiring-spec + example client in hsi-core; immunecity `090d7ea` REVIEW approve/reject/defer → `hsi_gate_c_decisions` on autumn-snow only; `autoApprove=false` |
| P0.6 | **[DONE]** Walkthrough / export hygiene (fixture banners) | Acceptance + walkthrough + pack notes show fixture + `lockedPilot=false`; `bun run outputs` green |

### P1 — deepen evidence / spine (after P0.1 clarity)

| # | Item | Notes |
|---|------|-------|
| P1.1 | **DONE:** deepen SSc pack — cell-card / CL·MONDO *hints* on Tfh–B–IL-21 neighbourhood; additional public PMIDs (29626172, 37763102) | `sscCellCards.ts` + pack; RA packs regenerable; EBV hypothesized |
| P1.2 | **DONE (first slice):** thin SSc Tfh–B–IL-21 pack (verified PMIDs; EBV `hypothesized`); RA intact | `hsi-ssc-pathway-pack.*`; do not delete RA claim ids |
| P1.3 | **DONE:** Deepen one **gut–immune** neighbourhood (SCFA/butyrate ↔ mucosal Treg/Th17 + barrier) with honest `uncertain`/`hypothesized` grades | `seed/gutScfaMucosal.ts` + `hsi-gut-immune-pack.*`; Discovery secondary axis; RA/SSc untouched |
| P1.4 | **DONE:** Promote selected systems / ISI predicates onto `HSI_EDGE_TYPES` | Additive: `modulates_immune`, `produces_metabolite_sensed_by`, `suppresses_peripheral_inflammation`, `signals_via_axis`, `associates_neuroimmune`, `produces`, `activates`, `suppresses`, `differentiates_into`; alias maps kept for remainder; gut/neuro/SSc-002 seeds use first-class labels; RA Stage 1 untouched |
| P1.5 | **DONE:** wire **ModelProposalArtifact** → Gate C checklist *draft rows* (`modelProposals`; `autoApprove=false`) | `src/modelProposal.ts`; never flips `hsiGrade` |
| P1.6 | **DONE:** Curator UX scaffolding — richer gap/Gate C markdown + `/curator` + `hsi-curator-ux.*` | Honest: awaiting partner review session when no decisions; compatible with immunecity `090d7ea`; never invents outcomes / never flips `hsiGrade` |
| P1.7 | **DONE:** Gate C decisions dry-run / import fixtures | `src/gateCDecisionsImport.ts` + `examples/gate-c-decisions/*`; CLI `--dry-run` / `--export-template` / `--write-hypothetical-fixture`; hypothetical ≠ production Apolo |
| P1.8 | **DONE:** Stage 2 spine CL `hint_only` starters beyond SSc | All spine nodes get CL ids + `ontologyBindStatus=hint_only`; not confirmed binds; RA untouched |
| P1.9 | **DONE:** Further SSc/gut/neuro neighbourhood depth | Neuro microglia/BBB (NI-012..016); gut SFB→Th17 + AhR/IL-22 (GUT-013/014); SSc vascular + fibrosis reviews (SSC-016/017); honest grades; RA untouched |
| P2.0 | **DONE:** Curator-confirmed CL/MONDO binds | 18 spine nodes + SSc Tfh/B/plasmablast/MONDO:0005100; OLS label match; not Gate C / not CDS / does not set `hsiGrade` |
| P2.1 | **DONE:** Operator-authorized Gate C human session | 13 mapped pending → `human_approved` on autumn-snow; envelope `operator_authorized_export`; curator-ux `decisions_imported`; reviewedBy=`operator:…` (not forged Apolo); cite `/curation` still separate |
| P2.2-ISI | **DONE:** Cite-ready path after Gate C | immunecity `citeReadyAfterGateC` + pin; 13 autumn-snow unreviewed cite seeds; Check→supports→Approve still human |

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
| P3.2 | **DONE:** REINVENT4 thin adapter spike (proposal-only) | `src/adapters/reinvent4Adapter.ts` → `hsi-reinvent4-adapter-proposals.*`; Gate C pending; never clinic path |
| P3.3 | **DONE:** FAIR ESM-2 thin embedding stub (proposal + sidecar refs) | `src/adapters/esmAdapter.ts` → `hsi-esm-adapter-proposals.*`; no weight vendoring |
| P3.4 | **DONE:** AF3 / TDC / ISI agents research sign-off fixtures + stub spikes | `src/researchSignOffFixture.ts`; `signed_research_test_only` / `research_ok_documented`; `notCommercial=true`; NOT commercial AF3 rights; `hsi-af3|tdc|isi-agents-adapter-proposals.*` |
| P3.5 | **DONE:** Boltz weights policy + gated stub spike | [`P3_WEIGHTS_AND_LICENSE_POLICY.md`](./P3_WEIGHTS_AND_LICENSE_POLICY.md); `WEIGHTS_POLICY_ACK=true`; optional `BOLTZ_WEIGHTS_CACHE`; `hsi-boltz-adapter-proposals.*`; no weight vendoring |
| P3.6 | **DONE:** Discovery graph explorer | `site/src/components/DiscoveryGraphExplorer.tsx` on `/discovery` MAP; RA + SSc/gut/neuro toggles |
| Depth | **DONE:** SSc +3 / gut +2 / neuro +2 verified-PMID edges | Packs + Discovery secondary axes updated; RA untouched |
| P0.2-HSI | **DONE:** ISI consume contract + partner flip-readiness (fixture) | `lockedPilot=false`; real partner TBD; still not CDS |
| P0.5-WIRING | **DONE:** playbook + immunecity Gate C human queue (`090d7ea`) | Human-only approve/reject/defer; never flips `hsiGrade` |
| P0.6 | **DONE:** Walkthrough / export hygiene | Acceptance + walkthrough + pack notes (fixture honesty); `bun run outputs` regenerable |
| P1.4 | **DONE:** systems / ISI predicates first-class | `HSI_EDGE_TYPES` + identity maps; gut/neuro/SSc-002 updated; RA untouched |
| P1.6 | **DONE:** curator UX scaffolding | `hsi-curator-ux.*` + richer gap/Gate C md + `/curator`; awaiting partner session |
| P1.7 | **DONE:** Gate C decisions dry-run / fixtures | `examples/gate-c-decisions/*`; CLI dry-run + envelope; hypothetical ≠ production |
| P1.8 | **DONE:** Stage 2 spine CL hint starters | `ontologyBindStatus=hint_only` on spine; RA untouched |
| P1.9 | **DONE:** SSc/gut/neuro neighbourhood depth | Microglia/BBB + SFB/AhR + vascular/fibrosis; licensing stubs; RA untouched |
| P2.0 | **DONE:** Curator-confirmed CL/MONDO binds | 18 spine + SSc core cards; myeloid/ILC/mast + subset frames stay hint_only |
| P2.1 | **DONE:** Operator-authorized Gate C human session | 13 mapped REL handoffs approved on autumn-snow + curator-ux; operator identity; productionApproved=false |
| P2.2-ISI | **DONE:** Cite-ready path after Gate C (immunecity) | `citeReadyAfterGateC` queue + pin overlay; seed `hsi-gate-c-cite-*` unreviewed evidence (13); Check→supports→Approve still human on `/curation`; never auto-approves / never flips `hsiGrade` |
| P2.3-ISI | **DONE:** Identifier Check on 13 cite candidates | `check-cite-candidates-from-gate-c.ts` → 13/13 verified; `cite-check-worksheet.json`; `/curation?hsi=cite` filter; claim_support still unassessed; curation still unreviewed |
| Cap9-FHIR | **DONE:** Illustrative FHIR R4 mapping notes for synthetic timeline | `src/clinicalSyntheticFhirNotes.ts` + `/clinical-timeline` FHIR NOTES; `fhirSoT=false`; no live EMIS |
| **NEXT** | **Human claim_support → Approve on 13 cites · real partner** | 2026-11-02 remeasure: Check **13/13 verified**; still **0** supports / **0** publicCiteApproved (autumn-snow) — founder-reported cite Approve **not** reflected in Neon (before=after). Still blocked on human S-P-O → inline Claim support then `/curation?hsi=cite` Approve (no bulk invent / no agent Auth bypass). Parallel: named external SME + real partner lock (human). Still no auto-approve / no `hsiGrade` flip / no invent MoU / no live CDS. |

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
| **Vendor multi-GB weights / claim commercial AF3 rights** | Weights policy + research fixtures forbid; stubs only |
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
| Partner pilot ready (HSI side) | **PARTIAL:** Scope + four outputs green + fixture walkthrough; **real partner TBD** (`lockedPilot=false`); partner clearance + partner_agreed KPIs still open |
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
| P3.3 FAIR ESM-2 honesty | Proposal + embedding sidecar refs; `runtime: stub|esm`; Gate C pending; hash/ref only; `autoApprove=false`; does not set `hsiGrade`; no PHI sequences / CDS / weight vendoring / fake `partnerSigned` |
| P3.5 Boltz honesty | Stub proposals require `WEIGHTS_POLICY_ACK=true`; optional external `BOLTZ_WEIGHTS_CACHE`; Gate C pending; `autoApprove=false`; does not set `hsiGrade`; never vendors multi-GB weights |
| P0.2-HSI honesty | Consume contract + flip-readiness exported; fixture active (`lockedPilot=false`); real partner TBD; still not CDS / no auto Gate C |
| P0.5 wiring honesty | Playbook + immunecity Gate C human queue; Gate C never auto-approve; Neon isolation restated (HSI red-wave / ISI autumn-snow) |
| P0.6 walkthrough honesty | Walkthrough + acceptance show fixture banners + `lockedPilot=false`; no fixture-as-MoU wording |
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
